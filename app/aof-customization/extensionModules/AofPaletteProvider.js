'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette provider for BPMN 2.0 elements.
 */
function AOFPaletteProvider(palette, create, elementFactory,modeling,canvas,eventBus) {

  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._modeling=modeling;
  this._canvas=canvas;
  this._eventBus=eventBus;

  palette.registerProvider(this);
}

module.exports = AOFPaletteProvider;

AOFPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
    'modeling',
    'canvas',
    'eventBus'
];


AOFPaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory,
      modeling=this._modeling,
      canvas=this._canvas,
      eventBus=this._eventBus;



  function createAppUserTask(type, group, className, title, options) {

      var shape = elementFactory.createShape(assign({ type: 'bpmn:UserTask' }, options));

      create.start(event, shape);
      eventBus.once('create.end',function(){
        modeling.updateProperties(shape, {'aof:isAppEnsembleApp': true});
        modeling.updateProperties(shape,{'aof:realizedBy':""});
      });

  }


  function createAppEnsemble(event, collapsed) {
    var shape=elementFactory.createParticipantShape(collapsed);
    create.start(event, shape);
    eventBus.once('create.end',function(){
      modeling.updateProperties(shape, {'aof:isAppEnsemble': true});
    });
  }

  assign(actions, {
    'aof-separator': {
      group: 'aof',
      separator: true
    },
    'create.usertask': {
      group: 'aof',
      className: 'bpmn-icon-app',
      title: 'Create App-UserTask',
      action: {
        dragstart: createAppUserTask,
        click: createAppUserTask
      }
    },
    'create.appensemble': {
      group: 'aof',
      className: 'bpmn-icon-appensemble',
      title: 'Create AppEnsemble (Participant)',
      action: {
        dragstart: createAppEnsemble,
        click: createAppEnsemble
      }
    }
  });

  return actions;
};
