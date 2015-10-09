'use strict';

var inherits = require('inherits');

var RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');


/**
 * A custom rule provider that decides what elements can be
 * dropped where based on a `vendor:allowDrop` BPMN extension.
 *
 * See {@link BpmnRules} for the default implementation
 * of BPMN 2.0 modeling rules provided by bpmn-js.
 *
 * @param {EventBus} eventBus
 */
function CustomRules(eventBus) {
    RuleProvider.call(this, eventBus);
}

inherits(CustomRules, RuleProvider);

CustomRules.$inject = [ 'eventBus' ];

module.exports = CustomRules;


CustomRules.prototype.init = function() {


    this.addRule('shapes.move',2000, function(context) {

        var target = context.target;

        if(!!target){   // !!=cast in boolean
            var shape = context.shapes[0]; // Remove [0] and check for a better solution
            var shapeBo = shape.businessObject,
                targetBo = target.businessObject;
            if(shape.type=="bpmn:UserTask"){
                var allowDrop = targetBo.get('isAppEnsemble');
                return !!allowDrop;
            }
            //else if() TODO:Add functionality, that no other tasks (everthing else is ok) can be dragged into an appEnsemble (evtl über shapebo->descriptor and then search for parent bpmn:Task

        }


    });
};