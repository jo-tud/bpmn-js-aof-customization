'use strict';


var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    isArray = require('lodash/lang/isArray'),
    is = require('../util/ModelUtil').is,
    isAny = require('../util/ModelingUtil').isAny,
    getChildLanes = require('../util/LaneUtil').getChildLanes,
    isEventSubProcess = require('../util/DiUtil').isEventSubProcess;


/**
 * A provider for BPMN 2.0 elements context pad
 */
function CustomContextPadProvider(contextPad, modeling, elementFactory,
                            connect, create, popupMenu,
                            canvas, rules) {

    contextPad.registerProvider(this);

    this._contextPad = contextPad;

    this._modeling = modeling;

    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._popupMenu = popupMenu;
    this._canvas  = canvas;
    this._rules = rules;
}

CustomContextPadProvider.$inject = [
    'contextPad',
    'modeling',
    'elementFactory',
    'connect',
    'create',
    'popupMenu',
    'canvas',
    'rules'
];

module.exports = CustomContextPadProvider;


CustomContextPadProvider.prototype.getContextPadEntries = function(element) {

    var contextPad = this._contextPad,
        modeling = this._modeling,

        elementFactory = this._elementFactory,
        connect = this._connect,
        create = this._create,
        popupMenu = this._popupMenu,
        canvas = this._canvas,
        rules = this._rules;

    var actions = {};

    if (element.type === 'label') {
        return actions;
    }

    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
        connect.start(event, element, autoActivate);
    }

    function removeElement(e) {
        modeling.removeElements([ element ]);
    }

    function getReplaceMenuPosition(element) {

        var Y_OFFSET = 5;

        var diagramContainer = canvas.getContainer(),
            pad = contextPad.getPad(element).html;

        var diagramRect = diagramContainer.getBoundingClientRect(),
            padRect = pad.getBoundingClientRect();

        var top = padRect.top - diagramRect.top;
        var left = padRect.left - diagramRect.left;

        var pos = {
            x: left,
            y: top + padRect.height + Y_OFFSET
        };

        return pos;
    }


    /**
     * Create an append action
     *
     * @param {String} type
     * @param {String} className
     * @param {String} [title]
     * @param {Object} [options]
     *
     * @return {Object} descriptor
     */
    function appendAction(type, className, title, options) {

        if (typeof title !== 'string') {
            options = title;
            title = 'Append ' + type.replace(/^bpmn\:/, '');
        }

        function appendListener(event, element) {

            var shape = elementFactory.createShape(assign({ type: type }, options));
            create.start(event, shape, element);
        }

        return {
            group: 'model',
            className: className,
            title: title,
            action: {
                dragstart: appendListener,
                click: appendListener
            }
        };
    }

    function splitLaneHandler(count) {

        return function(event, element) {
            // actual split
            modeling.splitLane(element, count);

            // refresh context pad after split to
            // get rid of split icons
            contextPad.open(element, true);
        };
    }

    if (isAny(businessObject, [ 'bpmn:Lane', 'bpmn:Participant' ])) {

        var childLanes = getChildLanes(element);

        assign(actions, {
            'lane-insert-above': {
                group: 'lane-insert-above',
                className: 'bpmn-icon-lane-insert-above',
                title: 'Add Lane above',
                action: {
                    click: function(event, element) {
                        modeling.addLane(element, 'top');
                    }
                }
            }
        });

        if (childLanes.length < 2) {

            if (element.height >= 120) {
                assign(actions, {
                    'lane-divide-two': {
                        group: 'lane-divide',
                        className: 'bpmn-icon-lane-divide-two',
                        title: 'Divide into two Lanes',
                        action: {
                            click: splitLaneHandler(2)
                        }
                    }
                });
            }

            if (element.height >= 180) {
                assign(actions, {
                    'lane-divide-three': {
                        group: 'lane-divide',
                        className: 'bpmn-icon-lane-divide-three',
                        title: 'Divide into three Lanes',
                        action: {
                            click: splitLaneHandler(3)
                        }
                    }
                });
            }
        }

        assign(actions, {
            'lane-insert-below': {
                group: 'lane-insert-below',
                className: 'bpmn-icon-lane-insert-below',
                title: 'Add Lane below',
                action: {
                    click: function(event, element) {
                        modeling.addLane(element, 'bottom');
                    }
                }
            }
        });

    }
    if(is(businessObject,'bpmn:Participant')){
        if(businessObject.isAppEnsemble && businessObject.isAppEnsemble==true) {
            assign(actions, {
                'partnerRole': {
                    group: 'edit',
                    className: 'bpmn-icon-appensemble-remove',
                    title: 'Unmark App-Ensemble',
                    action: {
                        click: function (event, element) {
                            var participant = element.businessObject, inputtext;
                            var result = window.confirm('Do you really like remove the App-Ensemble property? There might be problems!');
                            if (result) {
                                modeling.updateProperties(element, {'aof:isAppEnsemble': false});
                                canvas.removeMarker(element.id, 'color-appensemble');

                            }
                        }
                    }
                }
            });
        }
        else{
            assign(actions, {
                'partnerRole': {
                    group: 'edit',
                    className: 'bpmn-icon-appensemble',
                    title: 'Mark as App-Ensemble',
                    action: {
                        click: function (event, element) {
                            var participant = element.businessObject, inputtext;
                            var result = window.confirm('Do you really like to mark the Participant as App-Ensemble?');
                            if (result) {
                                modeling.updateProperties(element, {'aof:isAppEnsemble': true});
                                canvas.addMarker(element.id, 'color-appensemble');

                            }
                        }
                    }
                }
            });
        }
    }

    if (is(businessObject, 'bpmn:FlowNode')) {

        if (is(businessObject, 'bpmn:EventBasedGateway')) {

            assign(actions, {
                'append.receive-task': appendAction('bpmn:ReceiveTask', 'bpmn-icon-receive-task'),
                'append.message-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'bpmn-icon-intermediate-event-catch-message',
                    { eventDefinitionType: 'bpmn:MessageEventDefinition'}),
                'append.timer-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'bpmn-icon-intermediate-event-catch-timer',
                    { eventDefinitionType: 'bpmn:TimerEventDefinition'}),
                'append.condtion-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'bpmn-icon-intermediate-event-catch-condition',
                    { eventDefinitionType: 'bpmn:ConditionalEventDefinition'}),
                'append.signal-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'bpmn-icon-intermediate-event-catch-signal',
                    { eventDefinitionType: 'bpmn:SignalEventDefinition'})
            });
        } else

        if (isEventType(businessObject, 'bpmn:BoundaryEvent', 'bpmn:CompensateEventDefinition')) {

            assign(actions, {
                'append.compensation-activity':
                    appendAction('bpmn:Task', 'bpmn-icon-task', 'Append compensation activity', {
                        isForCompensation: true
                    })
            });
        } else

        if (!is(businessObject, 'bpmn:EndEvent') &&
            !businessObject.isForCompensation &&
            !isEventType(businessObject, 'bpmn:IntermediateThrowEvent', 'bpmn:LinkEventDefinition') &&
            !isEventSubProcess(businessObject)) {

            assign(actions, {
                'append.end-event': appendAction('bpmn:EndEvent', 'bpmn-icon-end-event-none'),
                'append.gateway': appendAction('bpmn:ExclusiveGateway', 'bpmn-icon-gateway-xor'),
                'append.append-task': appendAction('bpmn:Task', 'bpmn-icon-task'),
                'append.intermediate-event': appendAction('bpmn:IntermediateThrowEvent',
                    'bpmn-icon-intermediate-event-none')
            });
        }
        if (is(businessObject, 'bpmn:UserTask')) {
            if(businessObject.isAppEnsembleApp && businessObject.isAppEnsembleApp==true){
                assign(actions, {
                    'removeapp':{
                        group: 'edit',
                        className: 'bpmn-icon-app-remove',
                        title: 'Remove App-Uri',
                        action: {
                            click: function(event,element){
                                modeling.updateProperties(element,{'aof:isAppEnsembleApp':false});
                                modeling.updateProperties(element,{'aof:realizedBy':""});
                                canvas.removeMarker(element.id, 'color-appensembleapp');
                            }
                        }
                    }
                });
            }
            else {
                assign(actions, {
                    'setapp': {
                        group: 'edit',
                        className: 'bpmn-icon-app',
                        title: 'Set App-Uri',
                        action: {
                            click: function (event, element) {
                                modeling.updateProperties(element, {'aof:isAppEnsembleApp': true});
                                canvas.addMarker(element.id, 'color-appensembleapp');
                            }
                        }
                    }
                });
            }
        }
    }

    var replaceMenu;

    if (popupMenu._providers['bpmn-replace']) {
        replaceMenu = popupMenu.create('bpmn-replace', element);
    }

    if (replaceMenu && !replaceMenu.isEmpty()) {

        // Replace menu entry
        assign(actions, {
            'replace': {
                group: 'edit',
                className: 'bpmn-icon-screw-wrench',
                title: 'Change type',
                action: {
                    click: function(event, element) {
                        replaceMenu.open(assign(getReplaceMenuPosition(element), {
                            cursor: { x: event.x, y: event.y }
                        }), element);
                    }
                }
            }
        });
    }

    if (isAny(businessObject, [ 'bpmn:FlowNode', 'bpmn:InteractionNode' ]) ) {

        assign(actions, {
            'append.text-annotation': appendAction('bpmn:TextAnnotation', 'bpmn-icon-text-annotation'),

            'connect': {
                group: 'connect',
                className: 'bpmn-icon-connection-multi',
                title: 'Connect using ' +
                (businessObject.isForCompensation ? '' : 'Sequence/MessageFlow or ') +
                'Association',
                action: {
                    click: startConnect,
                    dragstart: startConnect
                }
            }
        });
    }

    if (isAny(businessObject, [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])) {
        assign(actions, {
            'connect': {
                group: 'connect',
                className: 'bpmn-icon-connection-multi',
                title: 'Connect using DataInputAssociation',
                action: {
                    click: startConnect,
                    dragstart: startConnect
                }
            }
        });
    }

    // delete element entry, only show if allowed by rules
    var deleteAllowed = rules.allowed('elements.delete', { elements: [ element ]});

    if (isArray(deleteAllowed)) {
        // was the element returned as a deletion candidate?
        deleteAllowed = deleteAllowed[0] === element;
    }

    if (deleteAllowed) {
        assign(actions, {
            'delete': {
                group: 'edit',
                className: 'bpmn-icon-trash',
                title: 'Remove',
                action: {
                    click: removeElement,
                    dragstart: removeElement
                }
            }
        });
    }

    return actions;
};

function isEventType(eventBo, type, definition) {

    var isType = eventBo.$instanceOf(type);
    var isDefinition = false;

    var definitions = eventBo.eventDefinitions || [];
    forEach(definitions, function(def) {
        if (def.$type === definition) {
            isDefinition = true;
        }
    });

    return isType && isDefinition;
}

