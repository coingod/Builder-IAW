define([
	"jquery-ui",
	"libs/underscore"
], function($,_) {
	
	var Tileset={}, Editor;	
	
	
	Tileset.initialize = function(namespace){
		Tileset.info={tw:64, th:64, name:"Pepito", id:1};
		Editor = namespace;
		//$("#tileset_container").on("mousedown mouseup mousemove", this.makeSelection);
			console.log(Editor.selection);


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
		
		$("#tilelist").on("mousedown mouseup", "li img", this.makeSelection);

		return this;	
		
	};
	
	Tileset.set = function(name) {
		var tileset = Tileset;
		Editor.Tileset = tileset;
		var widthTileset=$("#tileset").width(), 
			heightTileset=$("#tileset").height();
		$("#tileset_container").css({
			width: widthTileset,
			height: heightTileset,
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
				//argumentos.base64=Tileset.list(this,argumentos);
				
				Tileset.draw(this,argumentos);
				
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
				
				
				$("#tileset_container").jScrollPane();
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
		    imgData, 
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
	
	Tileset.draw = function(img, opts){
		var bufferADibujar=document.createElement("canvas").getContext("2d"),
			tw=opts.tilesize.width,
			th=opts.tilesize.height,
			x,y,xAct,yAct, nroit=0;
		
		bufferADibujar.canvas.width=tw; //Solo dibujamos de a un tile
		bufferADibujar.canvas.height=th;
		
		var celdasY=Math.floor(img.height / th);
		var celdasX=Math.floor(img.width / tw);
		var lista=$("#tilelist li");
		var tile;
		for (y = 0; y < celdasY; y++) {
			for (x = 0; x < celdasX; x++) {
				xAct=x*tw;
				yAct=y*th;
				bufferADibujar.drawImage(img,xAct,yAct,tw,th,0,0,tw,th);
				nroit=x+y*celdasX;
			tile=$("<li><p><span> ID Tile="+nroit+"             </span><img src="+bufferADibujar.canvas.toDataURL()+"></img></p></li>");
				$("#tilelist").append(tile);
				//Explicacion Parametros: 
				//  drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
				//sx: x donde empezamos a clippear, sy: y donde empezamos a clippear
				//swidth:ancho de la imagen a clippear, sheight: largo de la imagen a clippear
				//x: x donde se va a dibujar en el canvas, y: y donde se va a dibujar en el canvas
				//width: ancho disponible para dibujar en el canvas, height: alto disponible para dibujar en el canvas
			}
		}
		return bufferADibujar.canvas.toDataURL();
		
	};
	
	Tileset.resetSelection = function() {
		$("#canvas .cursor").remove();
		$("#tileset .selection").remove();
		delete Editor.selection;
	};
	
	Tileset.makeSelection = function(e) {
		console.log("Hola!");
		var tileset = Editor.Tileset,
			tw = tileset.tilesize.width,
			th = tileset.tilesize.height,
			container="#tileset_container",
			$container = $(container),
			offset =  $container.offset(),
			ex,ey
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
			Editor.tmp_selection = [[x, y], new Array(2)];
			
		} else if (e.type == "mouseup" && Editor.tmp_selection) { 
			//Estamos soltando el mouse y tenemos un tile seleccionado
			var s = Editor.tmp_selection,
				id = $("select[name=tileset_select] option:selected").index(),
				sx, sy, ex, ey

			s[1][0] = x;
			s[1][1] = y;
			//NO TENGO GANAS DE REVISAR ESTE CODIGO AHORA PERO HACELO LUCAS DEL FUTURO
			// Normalize selection, so that the start coordinates
			// are smaller than the end coordinates
			sx = s[0][0] < s[1][0] ? s[0][0] : s[1][0];
			sy = s[0][1] < s[1][1] ? s[0][1] : s[1][1];
			ex = s[0][0] > s[1][0] ? s[0][0] : s[1][0];
			ey = s[0][1] > s[1][1] ? s[0][1] : s[1][1];
			
			console.log("sx:"+sx);
			console.log("ex:"+ex);
			console.log("sy:"+sy);
			console.log("ey:"+ey);

			Editor.selection = [[sx/tw, sy/th], [ex/tw, ey/th]];
		}

	if (e.type == "mouseup") {
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