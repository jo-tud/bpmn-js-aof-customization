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
function AppAssigner(popupMenu, modeling, elementFactory) {

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
        addEntries(getOptionEntities(), markCurrentApp, setApp);

        // Adding a Menuentry for Manual creation of a App
        var manualOption=[{label: 'Enter other App',uri: ''}];
        addEntries(manualOption,function(data){return data;},setManualApp);


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
                id: "set-app-"+definition.label.toLowerCase().replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0').replace(/\s+/g,"_"),
                action: function () {
                        actionHandler(element, definition.uri);
                }
            };
        }

        /**
         *  Function for filtering the Applist
         *  TODO Make filter recognize that a manual App is set and add it to the menu
         **/
        function markCurrentApp(appitem) {

            if(element.businessObject.hasOwnProperty('resources') && element.businessObject.resources[0]!== null && element.businessObject.resources[0].name==appitem.uri){
                appitem.className='app-icon-active';
            }
            else{
                appitem.className='app-icon';
            }

            return appitem;
        }

        return menuEntries;
    }

    /**
     *  Action-handler which is called by clicking a menu-object. assignes an app to the userTask
     **/
    function setApp(task, appUri) {
        modeling.updateProperties(task,{'aof:realizedBy':appUri});
        task.popUp.close();
    }

    /**
     *  Action-handler which is called when a custom App is to be assigned.
     **/
    function setManualApp(task){
        var result=window.prompt('What is the URI of the custom App?');
        var pattern=new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]*)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?");
        if(result==null) {
            task.popUp.close();
        }else if(!pattern.test(result)){
            setManualApp(task);
        } else {
            setApp(task,result);
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

AppAssigner.$inject = ['popupMenu', 'modeling', 'elementFactory','elementRegistry'];

module.exports = AppAssigner;
