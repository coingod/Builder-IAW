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
        /*
        "underscore": {
            exports: "_"
        },
        */
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

        "materialize": "libs/materialize",
        //"underscore": "libs/underscore",
        "text": "plugins/text",
        "templates": "../templates"
    }
});

require(["jquery", "editor", "materialize"], function($, Editor) {
    $(document).ready(function() {
        Editor.initialize();
    });
});