define([
	"jquery-ui", 
	"canvas",
	"layers",
], function($, Canvas, Layers, Tileset) {
	var Editor = {};
	
	Editor.tool="draw"; //Que es lo que estoy haciendo, dibujando, rellenando, eliminando
	Editor.mousedown=false; //Mouse presionado
	Editor.selection=null;
	
	Editor.Canvas = Canvas.initialize(Editor);
	Editor.Layers = Layers.initialize(Editor);

	Editor.initialize = function() {

		//Estado del mouse
		$(document).on("mousedown mouseup", function(e) {
				Editor.mousedown = (e.type == "mousedown") && (e.which == 1);
			});	
		// e.which indica el click que fue realizado: 1=izquierdo
		
		// Disable selection
		//$("#tileset, #canvas_wrapper").disableSelection();
	};
	
	return Editor;
});