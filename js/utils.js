define([
    "jquery-ui"
], function($) {

    var Utils = {},
        Editor;

    Utils.initialize = function(namespace) {

        Editor = namespace;

        return this;
    };

    Utils.make_selection = function(e, container) {
        var tileset = Editor.Tileset,
            tw = tileset.tilesize.width,
            th = tileset.tilesize.height,

            $container = $(container),
            offset = $container.offset(),

            // Posicion relativa al tileset
            x = Math.floor(((e.pageX - offset.left) + $container.scrollTop()) / tw) * tw,
            y = Math.floor(((e.pageY - offset.top) + $container.scrollLeft()) / th) * th,

            $selection = $container.find(".selection");


        if (e.type == "mousedown") { // Crear div seleccion

            if (!$selection.length) //no hay seleccion actualmente
            { $container.append("<div class='selection'></div>"); }

            $selection.css({
                left: x,
                top: y,
                width: tw,
                height: th
            });

            delete Editor.selection;
            Editor.tmp_selection = [
                [x, y], new Array(2)
            ];

        }
    };

    return Utils;

});