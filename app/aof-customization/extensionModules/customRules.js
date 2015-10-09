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

        if(!!target){
            var shape = context.shapes[0]; // Remove [0] and check for a better solution
            if(shape.type=="bpmn:UserTask"){
                var shapeBo = shape.businessObject,
                    targetBo = target.businessObject;

                var allowDrop = targetBo.get('isAppEnsemble');

                if (!allowDrop) {
                    return false;
                }
                return true;
            }

        }


    });
};