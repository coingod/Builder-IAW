/*
Punto de entrada de la aplicacion
Cargamos todos los modulos y librerias
http://requirejs.org/docs/jquery.html
*/
require.config({

    baseUrl: "js",

    shim: {
        "jquery-ui": {
            exports: "$",
            deps: ["jquery", "jquery.mousewheel", "jquery.jscrollpane"]
        },

        "materialize": {
            //exports: "material",
            deps: ["jquery-ui"]
        },

        "jquery.draggable": {
            deps: ["jquery-ui"]
        }
    },

    paths: {
        "jquery": "libs/jquery",
        "jquery-ui": "libs/jquery-ui",
        "jquery.mousewheel": "plugins/jquery.mousewheel",
        "jquery.jscrollpane": "plugins/jquery.jscrollpane",
        "jquery.draggable": "plugins/jquery.draggable",

        "materialize": "libs/materialize",
        "text": "plugins/text",
        "templates": "../templates"
    }
});

require(["jquery", "editor", "materialize"], function($, Editor) {
    //Levantamos el ultimo skin usado.
    $(localStorage.oldSkin).attr('href', localStorage.skin);
    $(document).ready(function() {
        Editor.initialize();
    });
});