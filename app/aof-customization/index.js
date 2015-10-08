var Modules = {
    // OverrideModules
    bpmnReplace: ['type', require('./overrideModules/CustomReplace.js')],
    contextPadProvider: ['type', require('./overrideModules/CustomContextPadProvider.js')],
//ExtensionModules
    __init__: ['appAssigner'],//,'customRules'],
    appAssigner: ['type', require('./extensionModules/AppAssigner.js')],
   // customRules: ['type', require('./extensionModules/CustomRules.js')]
};

module.exports = Modules;

//TODO: Add App.svg and correstponding css to the aof-customization module
