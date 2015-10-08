var Modules = {
    // OverrideModules
    renderer: ['type', require('./overrideModules/ExtendedBpmnRenderer.js')],
    pathMap: ['type', require('./overrideModules/ExtendedPathMap.js')],
    bpmnReplace: ['type', require('./overrideModules/CustomReplace.js')],
    contextPadProvider: ['type', require('./overrideModules/CustomContextPadProvider.js')],
//ExtensionModules
    __init__: ['appAssigner'],
    appAssigner: ['type', require('./extensionModules/AppAssigner.js')]
};

module.exports = Modules;

//TODO: Add App.svg and correstponding css to the aof-customization module
