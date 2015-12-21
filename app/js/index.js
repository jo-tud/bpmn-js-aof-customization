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
    BpmnViewer = require('bpmn-js/lib/Viewer'),
    AppAssigner=require('./../aof-customization/extensionModules/AppAssigner');

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
function saveSVG(done) {
  renderer.saveSVG(done);
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
  window.onbeforeunload=function(){return "Do you really want to leave this page? There might be a loss of unsaved data!"}
  });

  var downloadSvgLink = $('#js-download-svg');
  var saveandCloseLink=$('#js-save-appensemble-and-close');
  var saveLink = $('#js-save-appensemble');
  var closeLink=$('#close-modeler');

  if(mode=="view") {
    saveLink.remove();
    saveandCloseLink.remove();
    downloadSvgLink.remove();
  }
  else{
    saveLink.click(function (e) {
      if ($(this).is('.active')) {
        e.preventDefault();
        e.stopPropagation();
        var request = $.ajax($(this).attr('href'), {
          success: function (data, status, jqXHR) {
            container.before('<div data-alert class="alert-box success ">' + data + '<a href="#" class="close">&times;</a></div>');
            setTimeout(function() {
              $.when($('.alert-box').fadeOut(500))
                  .done(function () {
                    $('.alert-box').remove();
                  });
            },3000);
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

    saveandCloseLink.click(function (e) {
      if ($(this).is('.active')) {
        e.preventDefault();
        e.stopPropagation();
        var request = $.ajax($(this).attr('href'), {
          success: function (data, status, jqXHR) {
            container.before('<div data-alert class="alert-box success ">' + data + '<br /> Closing Modeler in <span id="close-seconds">3</span> seconds.<a href="#" class="close">&times;</a></div>');
            setTimeout(function(){$('#close-seconds').text("2")},1000);
            setTimeout(function(){$('#close-seconds').text("1")},2000);
            setTimeout(function(){window.location.href = document.referrer},3000);
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
  }

  closeLink.click(function(){
    window.location.href = document.referrer;
  })

  $('.top-bar-section .right a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
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
    saveDiagram(function(err, xml) {
      setEncoded(saveandCloseLink, 'diagram.bpmn', err ? null : xml);
    });
    saveSVG(function(err, svg) {
      setEncoded_dl(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });
  }, 500);


  renderer.on('commandStack.changed', exportArtifacts);