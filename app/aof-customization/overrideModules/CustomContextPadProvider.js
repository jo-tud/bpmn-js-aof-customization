'use strict';


var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    is = require('./../util/ModelUtil').is;


/**
 * A provider for BPMN 2.0 elements context pad
 */
function CustomContextPadProvider(contextPad, modeling, elementFactory,
                            connect, create, bpmnReplace,
                            canvas, performerChooser, eventBus) {

    contextPad.registerProvider(this);

    this._contextPad = contextPad;

    this._modeling = modeling;

    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._bpmnReplace = bpmnReplace;
    this._canvas  = canvas;
    this._performerChooser=performerChooser;
    this._eventBus=eventBus;
}

CustomContextPadProvider.$inject = [
    'contextPad',
    'modeling',
    'elementFactory',
    'connect',
    'create',
    'bpmnReplace',
    'canvas',
    'performerChooser',
    'eventBus'
];

CustomContextPadProvider.prototype.getContextPadEntries = function(element) {

    var contextPad = this._contextPad,
        modeling = this._modeling,

        elementFactory = this._elementFactory,
        connect = this._connect,
        create = this._create,
        bpmnReplace = this._bpmnReplace,
        canvas = this._canvas,
        performerChooser=this._performerChooser,
        eventBus=this._eventBus;


    var actions = {};

    if (element.type === 'label') {
        return actions;
    }

    var bpmnElement = element.businessObject;

    function startConnect(event, element, autoActivate) {
        connect.start(event, element, autoActivate);
    }

    function removeElement(e) {
        if (element.waypoints) {
            modeling.removeConnection(element);
        } else {
            modeling.removeShape(element);
        }
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


    function appendAction(type, className, options) {

        function appendListener(event, element) {

            var shape = elementFactory.createShape(assign({ type: type }, options));
            create.start(event, shape, element);
        }

        var shortType = type.replace(/^bpmn\:/, '');

        return {
            group: 'model',
            className: className,
            title: 'Append ' + shortType,
            action: {
                dragstart: appendListener,
                click: appendListener
            }
        };
    }

  if (is(bpmnElement, 'bpmn:FlowNode')) {

    if (!is(bpmnElement, 'bpmn:EndEvent') &&
        !is(bpmnElement, 'bpmn:EventBasedGateway') &&
            !isEventType(bpmnElement, 'bpmn:IntermediateThrowEvent', 'bpmn:LinkEventDefinition')) {

            assign(actions, {
                'append.end-event': appendAction('bpmn:EndEvent', 'icon-end-event-none'),
                'append.gateway': appendAction('bpmn:ExclusiveGateway', 'icon-gateway-xor'),
                'append.append-task': appendAction('bpmn:Task', 'icon-task'),
                'append.intermediate-event': appendAction('bpmn:IntermediateThrowEvent',
                    'icon-intermediate-event-none')
            });
        }

    if (is(bpmnElement, 'bpmn:EventBasedGateway')) {

            assign(actions, {
                'append.receive-task': appendAction('bpmn:ReceiveTask', 'icon-receive-task'),
                'append.message-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'icon-intermediate-event-catch-message',
                    { _eventDefinitionType: 'bpmn:MessageEventDefinition'}),
                'append.timer-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'icon-intermediate-event-catch-timer',
                    { _eventDefinitionType: 'bpmn:TimerEventDefinition'}),
                'append.condtion-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'icon-intermediate-event-catch-condition',
                    { _eventDefinitionType: 'bpmn:ConditionalEventDefinition'}),
                'append.signal-intermediate-event': appendAction('bpmn:IntermediateCatchEvent',
                    'icon-intermediate-event-catch-signal',
                    { _eventDefinitionType: 'bpmn:SignalEventDefinition'})
            });
        }


        // Replace menu entry
            assign(actions, {
                'replace': {
                    group: 'edit',
                    className: 'icon-screw-wrench',
                    title: 'Change type',
                    action: {
                        click: function(event, element) {
                            bpmnReplace.openChooser(getReplaceMenuPosition(element), element);
                        }
                    }
                }
            });
        }

  if (is(bpmnElement, 'bpmn:FlowNode') ||
      is(bpmnElement, 'bpmn:InteractionNode')) {

        assign(actions, {
            'append.text-annotation': appendAction('bpmn:TextAnnotation', 'icon-text-annotation'),

            'connect': {
                group: 'connect',
                className: 'icon-connection-multi',
                title: 'Connect using Sequence/MessageFlow',
                action: {
                    click: startConnect,
                    dragstart: startConnect
                }
            }
        });
    }

    if (is(bpmnElement, 'bpmn:Task')) {

        assign(actions, {
            'resource':{
                group: 'edit',
                className: 'icon-flag',
                title: 'Set Resource',
                action: {
                    click: function(event,element){
                        performerChooser.openChooser(getReplaceMenuPosition(element), element);
                    }
                }
            }
        });
    }

// TODO: Enable PartnerRole

    if(is(bpmnElement,'bpmn:Participant')){

        assign(actions, {
            'partnerRole': {
                group: 'edit',
                className: 'icon-appensemble',
                title: 'Mark as AppEnsemble',
                action: {
                    click: function(event,element){
                        var participant=element.businessObject, inputtext;
                        var result=window.confirm('Do you really like to mark the Participant ('+ participant.id+') as AppEnsemble?');
                        if(result){
                            var partnerRole = elementFactory._bpmnFactory.create('bpmn:PartnerRole', { name: 'AppEnsemble', participantRef: [ participant ] });
                            // unwrap Participant -> Collaboration -> Definitions
                            var definitions = participant.$parent.$parent;
                            // wire partnerRole with BPMN document (via Definitions)
                            definitions.get('rootElements').push(partnerRole);
                            eventBus.fire('commandStack.changed');

                            canvas.addMarker(element.id, 'appensemble');

                        }
                    }
                }
            }
        });

    }

    // Delete Element Entry
    assign(actions, {
        'delete': {
            group: 'edit',
            className: 'icon-trash',
            title: 'Remove',
            action: {
                click: removeElement,
                dragstart: removeElement
            }
        }
    });


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


module.exports = CustomContextPadProvider;
