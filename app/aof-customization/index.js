var Modules = {
    // OverrideModules
    bpmnReplace: ['type', require('./overrideModules/CustomReplace.js')],
    contextPadProvider: ['type', require('./overrideModules/CustomContextPadProvider.js')],
//ExtensionModules
    __init__: ['appAssigner','userTaskCreationListener','customRules'],
    appAssigner: ['type', require('./extensionModules/AppAssigner.js')],
    userTaskCreationListener: ['type', require('./extensionModules/UserTaskCreationListener.js')],
    customRules: ['type', require('./extensionModules/CustomRules.js')]
};

module.exports = Modules;

//TODO: Add App.svg and correstponding stylesheets to the aof-customization module
