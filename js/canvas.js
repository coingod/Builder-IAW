define([
	"jquery-ui"
], function($) {
	
	var Canvas = {}, Editor, tw, th;
	
	//Coordenadas actuales del cursor en el canvas
	Canvas.cx = 0;
	Canvas.cy = 0;
	
	
	Canvas.initialize = function(editor) {
		
		Editor = editor;
		console.log(Editor.Tileset.info.tw);

		
		var tileset=Editor.Tileset; 
		tw=tileset.info.tw;
		th=tileset.info.th;
	
		//Comportamiento del Cursor
		$("#canvas").on("mousedown mousemove", function(event) {
			
			//Obtenemos el Tileset que esta activo
			//var tileset = Editor.active_tileset;

			
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

			//Si el usuario hace click
			if (event.type == "mousedown") {
				//click izquierdo
				if (event.which == 1) {
					//Dibujamos el tile actual en el canvas
					Canvas.draw();
				}
				//click derecho
				else if (event.which == 3) {
					//Removemos el tile actual en el canvas
					Canvas.remove();
				}
			}
		});

		//Modificamos el tamaño del mapa en funcion del tamaño de los tiles
		$("#canvas").css({
				width: 13 * 64,//tw
				height: 10 * 64//th
			});
		
		//Dibujamos la grilla del mapa
		Canvas.updateGrid();
		
		//Nos aseguramos de que el canvas se acomode a la ventana
		$(window).on("resize", Canvas.updatePosition() );

		return this;
	};
	
	//Dibujamos el elemento selecionado del tileset en la posicion del cursor de la capa actual
	Canvas.draw = function() {
		
		//Obtenemos el Tileset que esta activo
		//var tileset = Editor.active_tileset;

		//Obtenemos la capa actualmente activa
		var currentLayer = Editor.Layers.currentLayer();

		//Vinculamos a la capa actual con el CSS de la imagen del tileset
		//Esto fuerza a una capa a tener un solo tileset activo, cambiar mas adelante!
		$(currentLayer.layer).addClass("ts_spritesheet_png");//("ts_" + tileset.id);
		//$(currentLayer.layer).attr("data-tileset", "spritesheet.png");//tileset.name);

		//Obtenemos las dimensiones de los tiles
		
		
		//Calculamos la posicion del cursor
		var cxp = Canvas.cx * tw;
		var cyp = Canvas.cy * th;

		//Obtenemos el offset del tile seleccionado del tileset
		var offset = $("#canvas").find(".cursor").css("background-position").split(" ");
		var ofx = parseInt(offset[0], 10);
		var	ofy = parseInt(offset[1], 10);
		
		//Preparo el atributo con las coordenadas normalizadas actuales
		var coords = Canvas.cx + "." + Canvas.cy;
		//Busco en la capa actual algun div con las coordenadas del cursor
		var div = $(currentLayer.layer).find("div[data-coords='" + coords + "']");
		//Si encontre un resultado, entonces ya tengo un tile almacenado
		var tile = div;
		//Si no hay resultado quiere decir que aun no hay nada en esta posicion
		if(div.length == 0) {
			//Debemos crear un div con el atributo data-coords
			tile = $("<div data-coords='" + coords + "'></div>");
			//Agregamos al CSS la posicion
			tile.css({
				position: "absolute",
				left: cxp,
				top: cyp
			});
			//Agregamos al CSS el offset del tile en el tileset
			tile.css("background-position", ofx + "px " + ofy + "px");
			//Agregamos el nuevo elemento a la capa
			$(currentLayer.layer).append(tile);
		}
	};
	
	//Removemos el elemento en la posicion del cursor de la capa actual
	Canvas.remove = function() {

		//Obtenemos la capa actualmente activa
		var currentLayer = Editor.Layers.currentLayer();
		//Preparo el atributo con las coordenadas normalizadas actuales
		var coords = Canvas.cx + "." + Canvas.cy;
		//Busco en la capa actual algun div con las coordenadas del cursor
		var div = $(currentLayer.layer).find("div[data-coords='" + coords + "']");
		//Si encontre un resultado puedo eliminarlo
		if(div.length != 0) {
			//Elimino el tile de la capa
			div.remove();
		}
	};

	//Dibujamos la grilla del mapa en base a una imagen en base64
	//que representa una celda vacia con bordes marcados
	Canvas.updateGrid = function() {

		//Obtenemos el Tileset que esta activo
		//var tileset = Editor.active_tileset;
		
		//Obtenemos las dimensiones de los tiles
	
		//Construimos la imagen de una celda vacia
		var grid = document.createElement("canvas");
		var bfr = grid.getContext("2d");
		
		grid.width = tw;
		grid.height = th;
		bfr.fillStyle = "rgba(0, 0, 0, 0.1)";
		bfr.fillRect(0, th-1, tw, 1);
		bfr.fillRect(tw-1, 0, 1, th);

		//$("#canvas").css("backgroundImage", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAMklEQVRYhe3OMREAAAwCserARf2bqww6hLufyUx3Kf8DAAAAAAAAAAAAAAAAADwBpNgeRAMGfl/2RdEAAAAASUVORK5CYII=)");
		$("#canvas").css("backgroundImage", "url(" + grid.toDataURL() + ")");
		$("#canvas").find(".cursor").css({
			width: tw,
			height: th
		});
	};

	//Calcula la posicion del canvas para que este se encuentre centrado
	Canvas.updatePosition = function() {
		var top = $(window).height()/2 - $("#canvas").height()/2;
		var left = $("#canvas_wrapper").width()/2 + $("#editor").width() - $("#canvas").width()/2;
		$("#canvas").css({ top: top, left: left });
	};
	
	return Canvas;
});