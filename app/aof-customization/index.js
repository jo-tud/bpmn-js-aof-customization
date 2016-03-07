var Modules = {
    // OverrideModules
    replaceMenuProvider: [ 'type', require('./overrideModules/CustomReplaceMenuProvider') ],
    contextPadProvider: ['type', require('./overrideModules/CustomContextPadProvider.js')],
//ExtensionModules
    __init__: ['appAssigner','aofActionListener','customRules','replaceMenuProvider','contextPadProvider','aofPaletteProvider'],
    appAssigner: ['type', require('./extensionModules/AppAssigner.js')],
    aofActionListener: ['type', require('./extensionModules/AofActionListener.js')],
    customRules: ['type', require('./extensionModules/CustomRules.js')],
    aofPaletteProvider: [ 'type', require('./extensionModules/AofPaletteProvider.js') ]
};

module.exports = Modules;

//TODO: Add App.svg and correstponding stylesheets to the aof-customization module
