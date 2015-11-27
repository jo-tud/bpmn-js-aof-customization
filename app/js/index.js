'use strict';

if(window.mode)var mode=window.mode;
else var mode=urlParam('mode');
if(window.urlencodedXML) var urlencodedXML=window.urlencodedXML;
else var urlencodedXML=urlParam('diagramXML');

// replace ende
var assign = require('lodash/object/assign');

var fs = require('fs');

var $ = require('jquery'),
    BpmnModeler = require('bpmn-js/lib/Modeler'),
    BpmnViewer = require('bpmn-js/lib/Viewer');

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

// Reference to the custom Modules
var AofCustomizationModules=require('./../aof-customization/index'), // affects activities
    aofModdleExtention = require('./../aof-customization/moddleExtensions/aof');

// Helper Functions

function openDiagram(renderer,xml) {
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

function saveDiagram(done) {
  renderer.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

function urlParam(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
  }
  else{
    return results[1] || 0;
  }
}
// Mode and data processing
if(mode=="view"){
  var renderer =new BpmnViewer({ container: canvas });
}
else{
  var renderer = new BpmnModeler({ container: canvas , additionalModules: [AofCustomizationModules], moddleExtensions:{aof:aofModdleExtention} });
}
if(mode=="view" || mode=="edit"){
  var newDiagramXML=decodeURIComponent(urlencodedXML);
}
else{
  var newDiagramXML = fs.readFileSync(__dirname + '/../../resources/newDiagram.bpmn', 'utf-8');
}

// bootstrap diagram functions

$(document).on('ready', function() {
  openDiagram(renderer,newDiagramXML);

  // Saving and lifetime behavior

  var saveLink = $('#js-save-appensemble');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $('#js-save-appensemble').click(function(e) {
    if ($(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
      var request = $.ajax($(this).attr('href'), {
        success: function (data, status, jqXHR) {
          container.before('<div data-alert class="alert-box success ">'+data+'<a href="#" class="close">&times;</a></div>');
        },
        method: "GET",
        async: false,
        timeout: 1000,
        error: function (jqXHR, status, error) {
          container.before('<div data-alert class="alert-box warning">There was a Problem saving the Appensemble<a href="#" class="close">&times;</a></div>');
        }
      });
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': '/api/actions/app-ensembles/add?data=' + encodedData,
        'download':name
      });
    } else {
      link.removeClass('active');
    }
  }

  var _ = require('lodash');

  var exportArtifacts = _.debounce(function() {
    saveDiagram(function(err, xml) {
      setEncoded(saveLink, 'diagram.bpmn', err ? null : xml);
    });

  }, 500);

  renderer.on('commandStack.changed', exportArtifacts);

});