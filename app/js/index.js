'use strict';


// replace ende
var assign = require('lodash/object/assign');

var fs = require('fs');

var $ = require('jquery'),
    BpmnModeler = require('bpmn-js/lib/Modeler');

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

// Reference to the custom Modules
var AofCustomizationModules=require('./../aof-customization/index'), // affects activities
    aofModdleExtention = require('./../aof-customization/moddleExtensions/aof');


// Load the Modeler
var renderer = new BpmnModeler({ container: canvas , additionalModules: [AofCustomizationModules], moddleExtensions:{aof:aofModdleExtention} });

var newDiagramXML = fs.readFileSync(__dirname + '/../../resources/newDiagram.bpmn', 'utf-8');

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
          container.append('<div data-alert class="alert-box">'+data+'<a href="#" class="close">&times;</a></div>');
        },
        method: "GET",
        async: false,
        timeout: 1000,
        error: function (jqXHR, status, error) {
          alert(status+" - "+error);
        }
      });
    }
  });

  function setEncoded_dl(link, name, data) {
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

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': '../api/actions/app-ensembles/add?data=' + encodedData,
        'download':name
      });
    } else {
      link.removeClass('active');
    }
  }

  var _ = require('lodash');

  var exportArtifacts = _.debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded_dl(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded_dl(downloadLink, 'diagram.bpmn', err ? null : xml);
    });

    saveDiagram(function(err, xml) {
      setEncoded(saveLink, 'diagram.bpmn', err ? null : xml);
    });

  }, 500);

  renderer.on('commandStack.changed', exportArtifacts);

});