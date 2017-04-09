define([
	"jquery-ui",
	"views/tilesets"
], function($, TilesetView) {
	
	var Tileset, Editor;	
	
	Tileset.initialize = function(namespace){
	Editor = namespace;
		this.view = TilesetView.initialize(Editor);

		// this.add("img/tilesets/forest_tiles.png", {
		// 	tilesize: { width: 16, height: 16 },
		// 	alpha: [255, 0, 255]
		// });
		// this.add("img/tilesets/margin.png", {
		// 	tilesize: { width: 64, height: 64 },
		// 	margin: 4
		// });

		this.add("img/tilesets/mage_city.png", {
			tilesize: { width: 32, height: 32 }
		});

		return this;	
		
	};
	
	Tileset.set = function(name) {
		var tileset = this.Tileset;
		Editor.active_tileset = tileset;

		$("#tileset_container").css({
			width: tileset.width,
			height: tileset.height,
		}).attr("class", "ts_" + tileset.id);

		$("#tilesets select").val(name);
		$("#tilesets .loading").remove();
		this.reset_selection();
	};
	
	
	Tileset.add= function(source, argumentos){ 
	//source: ruta de la imagen del tileset.. argumentos: detalles de la misma para poder parsear
		var img = new Image(),
				bfr = document.createElement("canvas").getContext("2d"),  //obtenemos buffer para dibujado del tileset. NO confundir con el canvas de la app!!!
				name = argumentos.name || source.match(/(?:.+)\/([^\/]+)/)[1], //nombre del tileset
				style = document.createElement("style"), // style = style = document..... ???? 
				id = name.replace(/[^a-zA-Z]/g, '_'), 
				css;

			img.src = source;
			img.addEventListener("load", function() {
				//Se ejecuta cuando un recurso y sus recursos dependientes terminan de ser cargados
				bfr.canvas.width = argumentos.width = this.width;
				bfr.canvas.height = argumentos.height = this.height;

				// Procesado tileset
				if (argumentos.alpha) { argumentos.base64 = Tileset.setAlpha(this, argumentos.alpha); }
				if (argumentos.margin) { argumentos.base64 = Tileset.slice(this, argumentos); }

				if (!argumentos.alpha && !argumentos.margin) {
					bfr.drawImage(this, 0, 0);
					argumentos.base64 = bfr.canvas.toDataURL(); //toDataURL retorna string con representacion en base64 de la imagen
				}

				argumentos.id = id;
				argumentos.name = name;

				Tileset = argumentos;
				Tileset.set(name);

				// Add a global css class so tiles can use
				// it in conjunction with background-position
				$(style).attr("id", "tileset_" + id);
				css = ".ts_" + id + ", .ts_" + id + " > div {\n";
				css += "\twidth: " + argumentos.tilesize.width + "px;\n";
				css += "\theight: " + argumentos.tilesize.height + "px;\n";
				css += "\tbackground-image: url('" + argumentos.base64 + "');\n";
				css += "}";
				$(style).append(css);

				$("head").append(style);

				// Update select element
				$("#tilesets select").append("<option>" + name + "</option>");
				$("#tilesets select").val(name);

				// Update custom scrollbars and grid
				$("#tileset").jScrollPane();
				Editor.Canvas.update_grid();

			}, false);	
	};
	
	// Filtra el alpha especificado. Alpha es un color representado de la forma [R,G,B]
	Tileset.setAlpha = function(img, alpha) {
		var bfr = document.createElement("canvas").getContext("2d"),
		    imgData, red, i, l;

		bfr.canvas.width = img.width;
		bfr.canvas.height = img.height;
		bfr.drawImage(img, 0, 0);

		imgData = bfr.getImageData(0, 0, img.width, img.height);
		//getImageData retorna info para cada pixel del rectangulo donde se muestra el tileset
		// donde para cada pixel hay valores RGBA (Red, Green, Blue, Alpha)
		tolerance = 10;

		//Revisar la eficiencia de esto!!!!!!!!!!!! 
		for (i = 0, l = imgData.data.length; i < l; i++) {
			red = i%4 == 0 ? true : false; //Estamos viendo la componente Red? True-False

			if (red) {
				if (
					((imgData.data[i] >= alpha[0]-tolerance) && (imgData.data[i] <= alpha[0]+tolerance)) &&
					((imgData.data[i+1] >= alpha[1]-tolerance) && (imgData.data[i+1] <= alpha[1]+tolerance)) &&
					((imgData.data[i+2] >= alpha[2]-tolerance) && (imgData.data[i+2] <= alpha[2]+tolerance))
				) {
					imgData.data[i+3] = 0; //Alpha=0
				}
			}
		}

		bfr.clearRect(0, 0, img.width, img.height); //Deja todo el rectangulo del buffer en blanco.
		bfr.putImageData(imgData, 0, 0); //Le agregamos la info con el alpha ya filtrado!
		return bfr.canvas.toDataURL();
	};

	// Despedazamos el tileset para poder trabajar con cada una de las celdas
	Tileset.slice = function(img, opts) {

		var bfr = document.createElement("canvas").getContext("2d"),
		    tw = opts.tilesize.width, // Ancho de celda
		    th = opts.tilesize.height, //Alto de celda
		    imgData, red,
		    x, y, xAct, yAct,
		    margen = opts.margin;

		bfr.canvas.width = img.width - (img.width/tw)*opts.margin;
		bfr.canvas.height = img.height - (img.height/th)*opts.margin;

		var celdasY=Math.floor(bfr.canvas.height / th);
		var celdasX=Math.floor(bfr.canvas.width / tw);
		
		for (y = 0; y < celdasY; y++) {
			for (x = 0; x < celdasX; x++) {
				xAct=x*(tw+margen)+margen;
				yAct=y*(th+margen)+margen;
				bfr.drawImage(img,xAct,yAct,tw,th,x*tw,y*th,tw,th);
				//Explicacion Parametros: drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
				//sx: x donde empezamos a clippear, sy: y donde empezamos a clippear
				//swidth:ancho de la imagen a clippear, sheight: largo de la imagen a clippear
				//x: x donde se va a dibujar en el canvas, y: y donde se va a dibujar en el canvas
				//width: ancho disponible para dibujar en el canvas, height: alto disponible para dibujar en el canvas
			}
		}

		return bfr.canvas.toDataURL();
	};
	
	Tileset.reset_selection = function() {
		$("#canvas .selection").remove();
		$("#tileset .selection").remove();
		delete Editor.selection;
	};
	
	return Tileset;
});