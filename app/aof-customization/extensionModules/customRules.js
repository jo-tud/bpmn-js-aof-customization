'use strict';

var inherits = require('inherits');
var is = require('./../util/ModelUtil').is;

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
            var shape = context.shapes[0];
            var shapeBo = shape.businessObject,
                targetBo = target.businessObject;
            if(is(shapeBo, 'bpmn:Task')){
                var targetIsAppEnsemble = targetBo.get('isAppEnsemble');
                if(shape.type=="bpmn:UserTask" && !!targetIsAppEnsemble) return true;   // UserTask can only be dropped in AppEnsembles
                else if(shape.type=="bpmn:UserTask" && !targetIsAppEnsemble) return false;  //not anywhere else
                else if(shape.type!="bpmn:ManualTask" && shape.type!="bpmn:Task" && !!targetIsAppEnsemble) return false; //only manual, user and normal tasks can be dropped in AppEnsembles
            }
            //TODO: what todo with subprocesses?

        }


    });
};