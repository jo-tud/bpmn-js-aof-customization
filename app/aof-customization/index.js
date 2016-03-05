var Modules = {
    // OverrideModules
    replaceMenuProvider: [ 'type', require('./overrideModules/CustomReplaceMenuProvider') ],
    contextPadProvider: ['type', require('./overrideModules/CustomContextPadProvider.js')],
//ExtensionModules
    __init__: ['appAssigner','userTaskCreationListener','customRules','replaceMenuProvider','contextPadProvider'],
    appAssigner: ['type', require('./extensionModules/AppAssigner.js')],
    userTaskCreationListener: ['type', require('./extensionModules/UserTaskCreationListener.js')],
    customRules: ['type', require('./extensionModules/CustomRules.js')]
};

module.exports = Modules;

//TODO: Add App.svg and correstponding stylesheets to the aof-customization module
