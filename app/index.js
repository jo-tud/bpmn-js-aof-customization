'use strict';


// replace ende
var assign = require('lodash/object/assign');

var fs = require('fs');

var $ = require('jquery'),
    BpmnModeler = require('bpmn-js/lib/Modeler');

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

// Reference to the custom Modules
var CustomBpmnReplace=require('./customReplace/CustomReplace.js'); // affects activities
var CustomContextPadProvider=require('./customContextPadProvider/CustomContextPadProvider.js'); //affects participants
var PerformerChooser=require('./customContextPadProvider/CustomContextPadProvider.js'); //affects participants

// Register the custom Modules
/*
 var overrideModule = {
   bpmnReplace: [ 'type', CustomBpmnReplace ],
     contextPadProvider: [ 'type', CustomContextPadProvider ],
 };*/

var extensionModule = {
  __init__: [ 'PerformerChooser' ],
  PerformerChooser: [ 'type', PerformerChooser ]
};

// Load the Modeler
var renderer = new BpmnModeler({ container: canvas , additionalModules: [ overrideModule, PerformerChooser ]});

//var shape = elementFactory.createShape({ type: 'bpmn:PartnerRole','participantRef':businessObject });
/*
renderer.on('element.click',function(event){
  var businessObject=event.element.businessObject;
  if(!businessObject.resources){
      var Modeling=require('bpmn-js/lib/features/modeling/modeling');
      Modeling.updateProperties(businessObject,{'resources':'http://'});

  }
  console.log(event);
});*/
//var a=renderer.get('moddle');
//a.create('bpmn:PartnerRole');

var newDiagramXML = fs.readFileSync(__dirname + '/../resources/newDiagram.bpmn', 'utf-8');

function createNewDiagram() {
  openDiagram(newDiagramXML);
}

function openDiagram(xml) {

  renderer.importXML(xml, function(err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }


  });
}

function saveSVG(done) {
  renderer.saveSVG(done);
}

function saveDiagram(done) {

  renderer.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(document).on('ready', function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var _ = require('lodash');

  var exportArtifacts = _.debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  renderer.on('commandStack.changed', exportArtifacts);

});