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
 * @param {Selection} selection
 */
function PerformerChooser(popupMenu,modeling,elementFactory,selection) {

    /**
     *  Function which gets the single Option entries
     *  later via ajav request
     *  TODO: Establish Ajax request
     **/
    function getOptionEntities(){
        var list=[
            {
                label: 'Appname',
                actionName: 'set-performer',
                className: 'App-icon',
                uri: 'http://uri.zur.app'
            }];
        return list;
    }

    /**
     *  Function for filtering the Performerlist
     **/
    function filterPerformers(performerlist){
        return performerlist;
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

        return menuEntries;
    }

    /**
     *  Action-handler whicht is called by clicking a menu-object. creates a new "bpmn:Performer" element and assigns it as resource to the Task
     **/
    function setPerformer(task, appUri) {
        var resource=elementFactory._bpmnFactory.create('bpmn:Performer',{name: appUri});
        modeling.updateProperties(task,{'resources':[resource]});
        selection.select(task);
        task.popUp.close();
    }

    /**
     *  Function called for openin the popUp-Menu
     **/
    this.openChooser = function (position, element) {
        var entries = getOptions(element);

        var popUp=popupMenu.open('replace-menu', position, entries);
        element.popUp=popUp;
    }

}

PerformerChooser.$inject = ['popupMenu','modeling','elementFactory','selection'];

module.exports = PerformerChooser;
