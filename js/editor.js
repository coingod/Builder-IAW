define([
	"jquery-ui", 
	"canvas",
	"tileset",
	"utils",
	"layers"
], function($, Canvas, Tileset, Utils, Layers) {
	var Editor = {};
	
	Editor.tool="draw"; //Que es lo que estoy haciendo, dibujando, rellenando, eliminando
	Editor.mousedown=false; //Mouse presionado
	Editor.selection=null; //Tile seleccionado
	
	Editor.Canvas = Canvas.initialize(Editor);
	Editor.Tileset=Tileset.initialize(Editor);
	Editor.Utils=Utils.initialize(Editor);
	Editor.Layers=Layers.initialize(Editor);
	

	Editor.initialize = function() {

		//Estado del mouse
		$(document).on("mousedown mouseup", function(e) {
				Editor.mousedown = (e.type == "mousedown") && (e.which == 1);
			});	
		// e.which indica el click que fue realizado: 1=izquierdo
		
		// Disable selection
		$("#tileset, #canvas_wrapper").disableSelection();
	};
	
	return Editor;
});