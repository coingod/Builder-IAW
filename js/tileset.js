define([
    "jquery-ui"
], function($) {

    var Tileset = {},
        Editor;


    Tileset.initialize = function(namespace) {
        Tileset.info = { tw: 64, th: 64, name: "Pepito", id: 1 };
        Editor = namespace;
        //console.log(Editor.selection);

        this.add("img/tilesets/spritesheet.png", {
            tilesize: { width: 64, height: 64 }
        });

        $("#tilelist").on("mousedown", "li", this.makeSelection);

        return this;

    };

    Tileset.set = function(name) {
        var tileset = Tileset;
        Editor.Tileset = tileset;
        var widthTileset = $("#tileset").width(),
            heightTileset = $("#tileset").height();
        $("#tileset_container").css({
            width: widthTileset,
            height: heightTileset,
        }).attr("class", "ts_" + tileset.id);
        //$("#tilesets select").val(name); NO SIRVE POR AHORA
        this.resetSelection();
    };


    Tileset.add = function(source, argumentos) {
        //source: ruta de la imagen del tileset.. argumentos: detalles de la misma para poder parsear
        var img = new Image(),
            name = Tileset.info.name,
            style = document.createElement("style"), // estilizado
            id = 1;

        img.src = source;
        img.setAttribute('crossOrigin', 'anonymous'); //Para chrome, analizar bien esto.

        var that = this; //Var aux para poder acceder desde el listener al metodo set

        img.addEventListener("load", function() {
            var buffer = document.createElement("canvas").getContext("2d");

            //Se ejecuta cuando un recurso y sus recursos dependientes terminan de ser cargados
            buffer.canvas.width = argumentos.width = this.width;
            buffer.canvas.height = argumentos.height = this.height;
            buffer.drawImage(this, 0, 0);
            // Procesado tileset
            if (argumentos.alpha) { argumentos.base64 = Tileset.setAlpha(this, argumentos.alpha); }
            if (argumentos.margin) { argumentos.base64 = Tileset.slice(this, argumentos); }

            argumentos.base64 = buffer.canvas.toDataURL();
            argumentos.id = id;
            argumentos.name = name;
            argumentos.path = source;

            Tileset.draw(this, argumentos);
            //Tileset = argumentos;
            that.set(name);

            // estilizado de cada tile 
            $(style).attr("id", "tileset_" + id);
            css = ".ts_" + id + ", .ts_" + id + " > div {\n";
            css += "\twidth: " + argumentos.tilesize.width + "px;\n";
            css += "\theight: " + argumentos.tilesize.height + "px;\n";
            css += "\tbackground-image: url('" + argumentos.base64 + "');\n";
            css += "}";
            $(style).append(css);
            //console.log(css);
            $("head").append(style);

            $("#tileset_container").jScrollPane();
            Editor.Canvas.updateGrid();

        }, false);
    };

    Tileset.draw = function(img, opts) {
        var bufferADibujar = document.createElement("canvas").getContext("2d"),
            tw = opts.tilesize.width,
            th = opts.tilesize.height,
            x, y, xAct, yAct, nroit = 0;

        bufferADibujar.canvas.width = tw; //Solo dibujamos de a un tile
        bufferADibujar.canvas.height = th;

        var celdasY = Math.floor(img.height / th);
        var celdasX = Math.floor(img.width / tw);
        var lista = $("#tilelist li");
        var tile, coords;
        var css;
        for (y = 0; y < celdasY; y++) {
            for (x = 0; x < celdasX; x++) {
                xAct = x * tw;
                yAct = y * th;
                coords = xAct + "." + yAct;
                nroit = x + y * celdasX;
                bufferADibujar.drawImage(img, xAct, yAct, tw, th, 0, 0, tw, th);
                tile = $("<li class='celda' data-tid='" + nroit + "' data-coords='" + coords + "'><span> TileID:" + nroit + "</span></li>");
                tile.css("width", "90%");
                tile.css("height", "84px");
                tile.css("background-image", "url('" + bufferADibujar.canvas.toDataURL() + "')");
                tile.css("background-size", tw + "px " + th + "px");
                tile.css("background-repeat", "no-repeat");
                $("#tilelist").append(tile);

                //Explicacion Parametros: 
                //  drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
                //sx: x donde empezamos a clippear, sy: y donde empezamos a clippear
                //swidth:ancho de la imagen a clippear, sheight: largo de la imagen a clippear
                //x: x donde se va a dibujar en el canvas, y: y donde se va a dibujar en el canvas
                //width: ancho disponible para dibujar en el canvas, height: alto disponible para dibujar en el canvas
            }
        }
    };

    Tileset.resetSelection = function() {
        $("#canvas .cursor").remove();
        $("#tileset .selection").remove();
        delete Editor.selection;
    };

    Tileset.makeSelection = function(e) {
        //console.log(e.target);
        var tw = 64;
        var th = 64;
        var tileSelected = e.target;
        var tileCoords = $(tileSelected).attr("data-coords");
        var sx = tileCoords.split(".")[0];
        var ex = sx + tw;
        var sy = tileCoords.split(".")[1];
        var ey = sy + th;
        var id = 1;

        if (!$("#canvas .cursor").length) { $("#canvas").append("<div class='cursor'></div>"); }

        //console.log("Ignacio estos valores son los que le estoy pasando al canvas");
        //console.log("sx: " + sx);
        //console.log("sy: " + sy);

        $("#canvas .cursor").css({
            width: tw,
            height: th,
            backgroundColor: "transparent",
            opacity: "0.4",
            backgroundPosition: (-sx) + "px " + (-sy) + "px"
        }).attr("class", "cursor ts_" + id);
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

        for (i = 0, l = imgData.data.length; i < l; i += 4) {
            //i va de 4 en 4 para ir accediendo de a un tile
            if (
                ((imgData.data[i] >= alpha[0] - tolerance) && (imgData.data[i] <= alpha[0] + tolerance)) &&
                ((imgData.data[i + 1] >= alpha[1] - tolerance) && (imgData.data[i + 1] <= alpha[1] + tolerance)) &&
                ((imgData.data[i + 2] >= alpha[2] - tolerance) && (imgData.data[i + 2] <= alpha[2] + tolerance))
            ) {
                imgData.data[i + 3] = 0; //Alpha=0, no queremos dibujarlo! 
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

        bfr.canvas.width = img.width - (img.width / tw) * opts.margin;
        bfr.canvas.height = img.height - (img.height / th) * opts.margin;

        var celdasY = Math.floor(bfr.canvas.height / th);
        var celdasX = Math.floor(bfr.canvas.width / tw);

        for (y = 0; y < celdasY; y++) {
            for (x = 0; x < celdasX; x++) {
                xAct = x * (tw + margen) + margen;
                yAct = y * (th + margen) + margen;
                bfr.drawImage(img, xAct, yAct, tw, th, x * tw, y * th, tw, th);
                //Explicacion Parametros: drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
                //sx: x donde empezamos a clippear, sy: y donde empezamos a clippear
                //swidth:ancho de la imagen a clippear, sheight: largo de la imagen a clippear
                //x: x donde se va a dibujar en el canvas, y: y donde se va a dibujar en el canvas
                //width: ancho disponible para dibujar en el canvas, height: alto disponible para dibujar en el canvas
            }
        }
        return bfr.canvas.toDataURL();
    };

    return Tileset;
});