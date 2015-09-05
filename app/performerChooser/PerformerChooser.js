/**
 * Created by Korbi on 04.09.2015.
 */

'use strict';

var  forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');

function PerformerChooser(popupMenu){

    function getOptions(){
        var list;

        list={'option1','option2'};
        return list;
    }

    this.openChooser(position,entries){
        var entries = getOptions(element);

        popupMenu.open('replace-menu', position, entries);
    }

}

PerformerChooser.$inject = [ 'popupMenu' ];

module.exports = PerformerChooser;
