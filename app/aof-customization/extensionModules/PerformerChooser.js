/**
 * Created by Korbi on 04.09.2015.
 */

'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');

/**
 * @param {PopupMenu} popupMenu
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 */
function PerformerChooser(popupMenu, modeling, elementFactory) {

    /**
     *  Function which gets the single Option entries
     *  TODO: move Ajaxrequest to module-initialization and do it asynchroniosly
     **/
    function getOptionEntities() {
        var jquery = require('jquery');
        var request_data = {};

        var request = jquery.ajax('/bpmn-js-aof-customization/resources/sample.json', {
            success: function (data, status, jqXHR) {
                if (data.data) {
                    request_data = data.data;
                }
            },
            method: "GET",
            dataType: 'json',
            async: false,
            timeout: 1000,
            data: '',
            error: function (jqXHR, status, error) {
                alert(status);
            }
        });

        return request_data;
    }


    /**
     *  Function which provides the Options-Object for the popup-menu
     **/
    function getOptions(element) {

        var menuEntries = [];
        addEntries(getOptionEntities(), markCurrentPerformer, setPerformer);

        // Adding a Menuentry for Manual creation of a Performer
        var manualOption=[{label: 'Enter other Performer',uri: ''}];
        addEntries(manualOption,function(data){return data;},setManualPerformer);


        /**
         *  Function used by the getOptions-function for filtering the entry and making objects out of the list
         **/
        function addEntries(entries, filterFun,actionHandler) {
            // Filter selected type from the array
            var filteredEntries = filter(entries, filterFun);

            // Add entries to replace menu
            forEach(filteredEntries, function (definition) {
                var entry = addMenuEntry(definition,actionHandler);
                menuEntries.push(entry);
            });
        }

        /**
         *  Function used by the addEntries-function for providing the needed object-structure and to set the action-handler
         **/
        function addMenuEntry(definition,actionHandler) {

            return {
                label: definition.label,
                className: definition.className,
                id: "set-performer-"+definition.label.toLowerCase().replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0').replace(/\s+/g,"_"),
                action: function () {
                        actionHandler(element, definition.uri);
                }
            };
        }

        /**
         *  Function for filtering the Performerlist
         *  TODO Make filter recognize that a manual Performer is set and add it to the menu
         **/
        function markCurrentPerformer(performeritem) {

            if(element.businessObject.hasOwnProperty('resources') && element.businessObject.resources[0]!== null && element.businessObject.resources[0].name==performeritem.uri){
                performeritem.className='performer-icon-active';
            }
            else{
                performeritem.className='performer-icon';
            }

            return performeritem;
        }

        return menuEntries;
    }

    /**
     *  Action-handler which is called by clicking a menu-object. creates a new "bpmn:Performer" element and assigns it as resource to the Task
     **/
    function setPerformer(task, appUri) {
        var resource = elementFactory._bpmnFactory.create('bpmn:Performer', {name: appUri});
        modeling.updateProperties(task, {'resources': [resource]});
        task.popUp.close();
    }

    /**
     *  Action-handler which is called when a custom Performer is to be assigned.
     **/
    function setManualPerformer(task){
        var result=window.prompt('What is the URI of the custom Performer?');
        var pattern=new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]*)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?");
        if(result==null) {
            task.popUp.close();
        }else if(!pattern.test(result)){
            setManualPerformer(task);
        } else {
            setPerformer(task,result);
        }
    }

    /**
     *  Function called for openin the popUp-Menu
     **/
    this.openChooser = function (position, element) {
        var entries = getOptions(element),headerEntries = [];

        var popUp = popupMenu.open({
            className: 'replace-menu',
            element: element,
            position: position,
            headerEntries: headerEntries,
            entries: entries
        });
        element.popUp = popUp;
    }

}

PerformerChooser.$inject = ['popupMenu', 'modeling', 'elementFactory','elementRegistry'];

module.exports = PerformerChooser;
