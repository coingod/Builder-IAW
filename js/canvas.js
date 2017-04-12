define([
	"jquery-ui"
], function($) {
	
	var Canvas = {}, Editor;
	
	//Coordenadas actuales del cursor en el canvas
	Canvas.cx = 0;
	Canvas.cy = 0;
	
	Canvas.initialize = function(editor) {
		
		Editor = editor;
		
		//Movimiento del Cursor
		$("#canvas").on("mousedown mousemove mouseup", function(event) {
			
			//Obtenemos el Tileset que esta activo
			//var tileset = Editor.active_tileset;
			
			//Obtenemos las dimensiones de los tiles
			var tw = 32;//tileset.tilesize.width;
			var th = 32;//tilset.tilesize.height;
			
			//Obtenemos el offset del canvas con respecto al documento
			var offset = $("#canvas").offset();
			
			//Calculamos las coordenadas del cursor con respecto al canvas
			//Normalizadas en funcion de las dimensiones de los tiles/celdas
			//para poder manejarlas como una matriz de tiles
			var x = Math.floor( (event.pageX - offset.left) / tw );
			var y = Math.floor( (event.pageY - offset.top) / th );
			
			Canvas.cx = x;
			Canvas.cy = y;
			
			//Modificamos el CSS para reflejar la posicion del cursor
			//Pasamos de coordenadas normalizadas a coordenadas reales
			$("#canvas").find(".cursor").css({
				top: y * th,
				left: x * tw
			});
		});
		
		//Dibujamos la grilla del mapa
		this.updatePosition();
		this.updateGrid();

		return this;
	};
	
	//Dibujamos el elemento selecionado del tileset 
	//en la posicion del cursor en la capa actual
	Canvas.draw = function() {
		
		//Obtenemos el Tileset que esta activo
		//var tileset = Editor.active_tileset;
		
		//Obtenemos las dimensiones de los tiles
		var tw = 32;//tileset.tilesize.width;
		var th = 32;//tilset.tilesize.height;
		
		//Calculamos la posicion del cursor
		var cxp = Canvas.cx * tw;
		var cyp = Canvas.cy * th;
		
		$("#canvas").find(".cursor").find("div").each(function() {
			//Agregar Tile a la capa actual
		});
	};
	
	//Dibujamos la grilla del mapa en base a una imagen en base64
	//que representa una celda vacia con bordes marcados
	Canvas.updateGrid = function() {

		//Obtenemos el Tileset que esta activo
		//var tileset = Editor.active_tileset;
		
		//Obtenemos las dimensiones de los tiles
		var tw = 32;//tileset.tilesize.width;
		var th = 32;//tilset.tilesize.height;

		$("#canvas").css("backgroundImage", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAMklEQVRYhe3OMREAAAwCserARf2bqww6hLufyUx3Kf8DAAAAAAAAAAAAAAAAADwBpNgeRAMGfl/2RdEAAAAASUVORK5CYII=)");
		$("#canvas").find(".cursor").css({
			width: tw,
			height: th
		});
	};

	//Calcula la posicion del canvas para que este se encuentre centrado
	Canvas.updatePosition = function() {
		var top = $(window).height()/2 - $("#canvas").height()/2;
		var left = $(window).width()/2 - $("#canvas").width()/4;
		$("#canvas").css({ top: top, left: left });
	};
	
	return Canvas;
});