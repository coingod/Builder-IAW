define([
    "jquery-ui",
    "canvas",
    "tileset",
    "currentState",
    "layers"
], function($, Canvas, Tileset, currentState, Layers) {
    var Editor = {};

    Editor.tool = "edit_mode"; //Que es lo que estoy haciendo, dibujando, rellenando, eliminando
    Editor.mousedown = false; //Mouse presionado

    Editor.Tileset = Tileset.initialize(Editor);
    Editor.Canvas = Canvas.initialize(Editor);
    Editor.Layers = Layers.initialize(Editor);
    Editor.currentState = currentState.initialize(Editor);
    Editor.initialize = function() {

        //Estado del mouse
        $(document).on("mousedown mouseup", function(e) {
            Editor.mousedown = (e.type == "mousedown") && (e.which == 1);
        });
        // e.which indica el click que fue realizado: 1=izquierdo

        //Oyentes de los botones de herramientas
        $("#edit_mode").on("click", function() {
            $("#tools > li > a").removeClass("pulse");
            $("#edit_mode > a").addClass("pulse");
            Editor.tool = "edit_mode";
            $("#canvas").draggable("disable");
            $("#canvas .cursor").toggle();
        });
        $("#pan_mode").on("click", function() {
            $("#tools > li > a").removeClass("pulse");
            $("#pan_mode > a").addClass("pulse");
            Editor.tool = "pan_mode";
            $("#canvas").draggable("enable");
            $("#canvas .cursor").toggle();
        });

        //Seteamos Modo de edicion por defecto
        $("#edit_mode").click();
        $("#canvas .cursor").toggle();

        //Desplegamos las herramientas al iniciar
        $('.fixed-action-btn').openFAB();

        // Disable selection
        $("#tileset, #canvas_wrapper").disableSelection();
    };

    return Editor;
});