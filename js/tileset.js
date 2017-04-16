define([
	"jquery-ui",
], function($) {
	
	var Tileset={}, Editor;	
	
	Tileset.initialize = function(namespace){
		Editor = namespace;
		$("#tileset_container").on("mousedown mouseup mousemove", this.makeSelection);


		// this.add("img/tilesets/forest_tiles.png", {
		// 	tilesize: { width: 16, height: 16 },
		// 	alpha: [255, 0, 255]
		// });
		// this.add("img/tilesets/margin.png", {
		// 	tilesize: { width: 64, height: 64 },
		// 	margin: 4
		// });
		//this.add("img/tilesets/mage_city.png", {
		//	tilesize: { width: 32, height: 32 }
		//});
		
		this.add("img/tilesets/spritesheet.png", {
			tilesize: { width: 64, height: 64 }
		});

		return this;	
		
	};
	
	Tileset.set = function(name) {
		var tileset = Tileset;
		Editor.Tileset = tileset;

		$("#tileset_container").css({
			width: tileset.width,
			height: tileset.height,
		}).attr("class", "ts_" + tileset.id);

		//$("#tilesets select").val(name); NO SIRVE POR AHORA
		this.resetSelection();
	};
	
	
	Tileset.add= function(source, argumentos){ 
		//source: ruta de la imagen del tileset.. argumentos: detalles de la misma para poder parsear
		var img = new Image(),
				bfr = document.createElement("canvas").getContext("2d"),  //obtenemos buffer para dibujado del tileset. NO confundir con el canvas de la app!!!
				name = argumentos.name || source.match(/(?:.+)\/([^\/]+)/)[1], //nombre del tileset
				style = document.createElement("style"), // estilizado
				id = name.replace(/[^a-zA-Z]/g, '_'), //id=numero unico
				css;

			img.src = source;
			img.setAttribute('crossOrigin', 'anonymous'); //Para chrome, analizar bien esto.
			bfr.canvas.setAttribute('crossOrigin', 'anonymous'); // Same
			
			var that = this; //Var aux para poder acceder desde el listener al metodo set
			
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
				that.set(name);

				// estilizado de cada tile 
				$(style).attr("id", "tileset_" + id);
				css = ".ts_" + id + ", .ts_" + id + " > div {\n";
				css += "\twidth: " + argumentos.tilesize.width + "px;\n";
				css += "\theight: " + argumentos.tilesize.height + "px;\n";
				css += "\tbackground-image: url('" + argumentos.base64 + "');\n";
				css += "}";
				$(style).append(css);

				$("head").append(style);

				// Update select element
				//$("#tilesets select").append("<option>" + name + "</option>");
				//$("#tilesets select").val(name);
				//Lo de arriba por ahora no sirve, es para la lista de tilesets si hay mas de uno. 
				
				
				$("#tileset").jScrollPane();
				Editor.Canvas.updateGrid();

			}, false);	
	};
	
	// Filtra el alpha especificado. Alpha es un color representado de la forma [R,G,B], viene a ser el fondo de cada imagen en el tileset
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

		for (i = 0, l = imgData.data.length; i < l; i+=4) {
			//i va de 4 en 4 para ir accediendo de a un tile
			if (
					((imgData.data[i] >= alpha[0]-tolerance) && (imgData.data[i] <= alpha[0]+tolerance)) &&
					((imgData.data[i+1] >= alpha[1]-tolerance) && (imgData.data[i+1] <= alpha[1]+tolerance)) &&
					((imgData.data[i+2] >= alpha[2]-tolerance) && (imgData.data[i+2] <= alpha[2]+tolerance))
				) {
					imgData.data[i+3] = 0; //Alpha=0, no queremos dibujarlo! 
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
	
	Tileset.resetSelection = function() {
		$("#canvas .cursor").remove();
		$("#tileset .selection").remove();
		delete Editor.selection;
	};
	
	Tileset.makeSelection = function(e) {
		//if (!$("#tilesets select option:selected").length) { return; } Esto servirá cuando se use mas de un tileset
		var tileset, tw, th, ex, ey;

		Editor.Utils.make_selection(e, "#tileset_container");

		if (e.type == "mouseup") {
			//Soltamos el mouse
			
			tileset = Editor.Tileset;
			tw = tileset.tilesize.width;
			th = tileset.tilesize.height;

			sx = Editor.selection[0][0] * tw;
			sy = Editor.selection[0][1] * th;
			ex = Editor.selection[1][0] * tw;
			ey = Editor.selection[1][1] * th;

			if (!$("#canvas .cursor").length)
			{ $("#canvas").append("<div class='cursor'></div>"); }

			$("#canvas .cursor").css({
				width: (ex-sx) + tw,
				height: (ey-sy) + th,
				backgroundColor: "transparent",
				backgroundPosition: (-sx) + "px " + (-sy) + "px"
			}).attr("class", "cursor ts_" + tileset.id);

			$("#tileset_container").find(".selection").remove();
			delete Editor.selection.custom;
		}
	};
	return Tileset;
});