'use strict';

// Mode
if (window.mode)var mode = window.mode;
else var mode = urlParam('mode');
if (window.urlencodedXML) var urlencodedXML = window.urlencodedXML;
else var urlencodedXML = urlParam('diagramXML');
if (window.del) var del = window.del;
else var del = "";

// Includes
var fs = require('fs');
var $ = require('jquery'),
    BpmnModeler = require('bpmn-js/lib/Modeler'),
    BpmnViewer = require('bpmn-js/lib/Viewer'),
    AofCustomizationModule=require('bpmn-js-aof'),
    aofModdleExtention = require('bpmn-js-aof/moddle');

var container = $('#js-drop-zone');
var canvas = $('#js-canvas');

// Helper Functions

function openDiagram(renderer, xml) {
    renderer.importXML(xml, function (err) {

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
            saveSVG(function (err, svg) {
                setEncoded_dl(downloadSvgLink, 'diagram.svg', err ? null : svg);
            });
        }


    });
}

function saveSVG(done) {
    renderer.saveSVG(done);
}

function saveDiagram(done) {
    renderer.saveXML({format: true}, function (err, xml) {
        done(err, xml);
    });
}

function urlParam(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    else {
        return results[1] || 0;
    }
}

// Mode and data processing
if (mode == "view") {
    var renderer = new BpmnViewer({container: canvas});
}
else {

    var renderer = new BpmnModeler({
        container: canvas,
        additionalModules: [AofCustomizationModule],
        moddleExtensions: aofModdleExtention,
        propertiesPanel: {
            parent: '#js-properties-panel'
        },
        appManager:{
            request_uri: "/api/appuris",
            info_uri_pattern: "/apps/#URI#/details.html"
        }
    });
}
if (mode == "view" || mode == "edit") {
    var newDiagramXML = decodeURIComponent(urlencodedXML);
}
else {
    var newDiagramXML = fs.readFileSync(__dirname + '/../../resources/newDiagram.bpmn', 'utf-8');
}

// bootstrap diagram functions

$(document).on('ready', function () {
    openDiagram(renderer, newDiagramXML);
    window.onbeforeunload = function () {
        return "Do you really want to leave this page? There might be a loss of unsaved data!"
    }
});


// jQuery references
var downloadSvgLink = $('#js-download-svg');
var saveandCloseLink = $('#js-save-appensemble-and-close');
var saveLink = $('#js-save-appensemble');
var closeLink = $('#close-modeler');

// actions definition
if (mode == "view") {
    saveLink.remove();
    saveandCloseLink.remove();
    downloadSvgLink.remove();
}
else {
    saveLink.click(function (e) {
        if ($(this).is('.active')) {
            e.preventDefault();
            e.stopPropagation();

            $.ajax($(this).attr('href'), {
                success: function (data, status, jqXHR) {
                    container.before('<div data-alert class="alert-box success ">' + data + '</div>');
                    setTimeout(function () {
                        $.when($('.alert-box').fadeOut(500))
                            .done(function () {
                                $('.alert-box').remove();
                                if(!!$('#js-save-appensemble').attr('reload')) {
                                    window.onbeforeunload = null;
                                    window.location.href = window.location.href.replace(/app-ensembles\/(.*$)/i, "app-ensembles/" + $('#js-save-appensemble').attr('reload') + "/edit.html")
                                }
                            });
                    }, 2000);
                },
                method: "GET",
                async: false,
                timeout: 1000,
                error: function (responseObject, status, error) {
                    container.before('<div data-alert class="alert-box warning">There was a Problem saving the App-Ensemble: '+responseObject.responseText +' ('+responseObject.statusText+') <a href="#" class="close">&times;</a></div>');
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
                    window.onbeforeunload = function () {
                    }
                    setTimeout(function () {
                        $('#close-seconds').text("2")
                    }, 1000);
                    setTimeout(function () {
                        $('#close-seconds').text("1")
                    }, 2000);
                    setTimeout(function () {
                        window.location.href = document.referrer
                    }, 3000);
                },
                method: "GET",
                async: false,
                timeout: 1000,
                error: function (responseObject, status, error) {
                    container.before('<div data-alert class="alert-box warning">There was a Problem saving the App-Ensemble: '+responseObject.responseText +' ('+responseObject.statusText+') <a href="#" class="close">&times;</a></div>');
                }
            });
        }
    });
}

closeLink.click(function () {
    window.location.href = document.referrer;
})

$('.top-bar-section .right a').click(function (e) {
    if (!$(this).is('.active')) {
        e.preventDefault();
        e.stopPropagation();
    }
});

// export helper functions
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
            'href': '/api/actions/app-ensembles/add?mode='+mode+'&del='+del+'&data=' + encodedData,
            'download': name
        });
    } else {
        link.removeClass('active');
    }
}

// Update routine
var _ = require('lodash');

var exportArtifacts = _.debounce(function () {
    saveDiagram(function (err, xml) {
        setEncoded(saveLink, 'diagram.bpmn', err ? null : xml);
    });
    saveDiagram(function (err, xml) {
        setEncoded(saveandCloseLink, 'diagram.bpmn', err ? null : xml);
    });
    saveSVG(function (err, svg) {
        setEncoded_dl(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });
}, 500);


renderer.on('commandStack.changed', exportArtifacts);