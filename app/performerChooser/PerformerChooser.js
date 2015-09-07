/**
 * Created by Korbi on 04.09.2015.
 */

'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');

/**
 *
 *
 *
 * @param {PopupMenu} popupMenu
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 * @param {ElementRegistry} elementRegistry
 */
function PerformerChooser(popupMenu, modeling, elementFactory, elementRegistry) {

    /**
     *  Function which gets the single Option entries
     *  TODO: move Ajaxrequest to module-initialization and do it asynchroiosly
     **/
    function getOptionEntities() {
        var jquery = require('jquery')
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
        addEntries(getOptionEntities(), filterPerformers);

        /**
         *  Function used by the getOptions-function for filtering the entry and making objects out of the list
         **/
        function addEntries(entries, filterFun) {
            // Filter selected type from the array
            var filteredEntries = filter(entries, filterFun);

            // Add entries to replace menu
            forEach(filteredEntries, function (definition) {
                var entry = addMenuEntry(definition);
                menuEntries.push(entry);
            });
        }

        /**
         *  Function used by the addEntries-function for providing the needed object-structure and to set the action-handler
         **/
        function addMenuEntry(definition) {

            return {
                label: definition.label,
                className: definition.className,
                action: {
                    name: definition.actionName,
                    handler: function () {
                        setPerformer(element, definition.uri);
                    }
                }
            };
        }

        /**
         *  Function for filtering the Performerlist
         *  TODO: Make possibility to add Performer manually
         **/
        function filterPerformers(performeritem) {

            if(element.businessObject.hasOwnProperty('resources') && element.businessObject.resources[0]!== null && element.businessObject.resources[0].name==performeritem.uri){
                performeritem.className='performer-icon-active';
            }
            else{
                performeritem.className='performer-icon';
            }
            performeritem.actionName="set-performer";

            return performeritem;
        }

        return menuEntries;
    }

    /**
     *  Action-handler whicht is called by clicking a menu-object. creates a new "bpmn:Performer" element and assigns it as resource to the Task
     **/
    function setPerformer(task, appUri) {
        var resource = elementFactory._bpmnFactory.create('bpmn:Performer', {name: appUri});
        modeling.updateProperties(task, {'resources': [resource]});
        task.popUp.close();
    }

    /**
     *  Function called for openin the popUp-Menu
     **/
    this.openChooser = function (position, element) {
        var entries = getOptions(element);

        var popUp = popupMenu.open('replace-menu', position, entries);
        element.popUp = popUp;
    }

}

PerformerChooser.$inject = ['popupMenu', 'modeling', 'elementFactory','elementRegistry'];

module.exports = PerformerChooser;
