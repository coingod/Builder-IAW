define([
    "jquery-ui"
], function($) {

    var Tileset = {},
        Editor,
        scrollPaneApi;

    Tileset.initialize = function(namespace) {
        Editor = namespace;

        //JSON info
        Tileset.info = {
            "tw": 64,
            "th": 64,
            "categories": [
                { "name": "Terreno", "path": "img/tilesets/terrain.png", "icon": "terrain" },
                { "name": "Naturaleza", "path": "img/tilesets/nature.png", "icon": "nature" },
                { "name": "Caminos", "path": "img/tilesets/roads.png", "icon": "directions" },
                { "name": "Edificios", "path": "img/tilesets/buildings.png", "icon": "store" }
            ],
        };

        //Iteramos sobre la informacion del JSON creando una categoria para cada tileset
        for (i = 0; i < Tileset.info.categories.length; i++) {
            //Generamos la pestaña de la categoria para el panel del editor
            //var category = $("<li class='tab col s3'><a href='#tilelist_" + i + "' data-id=" + i + " > " + Tileset.info.categories[i].name + "</a></li>");
            var category = $("<li class='tab col s3'><a href='#tilelist_" + i + "' data-id=" + i + " data-delay='50' data-position='top' data-tooltip='" + Tileset.info.categories[i].name + "' class='material-icons tooltipped'> " + Tileset.info.categories[i].icon + "</a></li>");
            $("#categorieslist").append(category);

            //Agregamos un panel para contener la lista de tiles de la categoria
            $("#tileset_container").append("<div id='tilelist_" + i + "' class='tilelist collection col s12'></div>");
            Tileset.add(Tileset.info.categories[i], i, Tileset.info.tw, Tileset.info.th);
        }

        //Configuramos el alto de la lista de tiles en funcion del alto de la pagina
        $("#tileset_container").css({
            height: $(window).height() / 2
        });

        //Agregamos la barra de desplazamiento vertical al contenedor de tilesets
        scrollPaneApi = $("#tileset_container").jScrollPane().data('jsp');

        //Seteo de oyentes
        $(".tilelist").on("mousedown", "a", this.makeSelection); //Seleccion de tile
        //$(".tilelist").on("mousedown", "a", this.rotarTile); //Seleccion de tile
        //Al cambiar de categoria se ajusta el scroll
        $("#categorieslist").on("mouseup", function() {
            //Debemos esperar unos ms antes de hacerlo para que el cambio de categoria sea registrado
            setTimeout(function() { scrollPaneApi.reinitialise(); }, 100);
        });

        //Esperamos unos ms y reinicializamos el scroll para que efectivamente se muestre
        setTimeout(function() { scrollPaneApi.reinitialise(); }, 150);

        return this;

    };

    Tileset.add = function(category, index, tw, th) {
        var img = new Image(),
            name = category.name,
            style = document.createElement("style"), // Se deja este style en el head para que lo obtenga el canvas a la hora de dibujar
            id = index; //Tileset.info.id;

        img.src = category.path; //Imagen de la que vamos a cargar los tiles
        var that = this; //Var aux para poder acceder desde el listener al metodo set

        img.addEventListener("load", function() {
            var buffer = document.createElement("canvas").getContext("2d");
            buffer.canvas.width = category.width = this.width;
            buffer.canvas.height = category.height = this.height;
            buffer.drawImage(this, 0, 0);

            // Procesado de la imagen de la categoria
            if (category.alpha) { category.base64 = Tileset.setAlpha(this, category.alpha); }
            if (category.margin) { category.base64 = Tileset.slice(this, category); }
            category.base64 = buffer.canvas.toDataURL();
            category.id = id;

            //Dibujamos la lista de tiles de la categoria
            Tileset.draw(this, category, index);

            $(style).attr("id", "tileset_" + id);
            css = ".ts_" + id + ", .ts_" + id + " > div {\n";
            css += "\twidth: " + tw + "px;\n";
            css += "\theight: " + th + "px;\n";
            css += "\tbackground-image: url('" + category.base64 + "');\n";
            css += "}";
            $(style).append(css);

            //console.log(css);
            $("head").append(style);

        }, false);


    };

    Tileset.draw = function(img, opts, index) {
        var bufferADibujar = document.createElement("canvas").getContext("2d"),
            tw = Tileset.info.tw,
            th = Tileset.info.th,
            x, y, xAct, yAct, nroit = 0;

        bufferADibujar.canvas.width = tw; //Solo dibujamos de a un tile
        bufferADibujar.canvas.height = th;

        var celdasY = Math.floor(img.height / th);
        var celdasX = Math.floor(img.width / tw);
        //var lista = $("#tilelist a");
        var tile, coords, rotador;
        var css;

        for (y = 0; y < celdasY; y++) {
            for (x = 0; x < celdasX; x++) {
                xAct = x * tw;
                yAct = y * th;
                coords = xAct + "." + yAct;
                nroit = x + y * celdasX;
                bufferADibujar.drawImage(img, xAct, yAct, tw, th, 0, 0, tw, th);
                //tile = $("<a href='#!' class='collection-item avatar' data-ts='" + index + "' data-coords='" + coords + "' data-rotate=0><img src='" + bufferADibujar.canvas.toDataURL() + "' class='circle'><span class='title'> TileID:" + nroit + "</span></a>");
                tile = $("<a href='#!' class='collection-item avatar' data-ts='" + index + "' data-coords='" + coords + "' data-rotate=0><img src='" + bufferADibujar.canvas.toDataURL() + "' class='circle'></a>");
                $("#tilelist_" + index).append(tile);
                bufferADibujar.clearRect(0, 0, tw, th); //Limpio el buffer para que al dibujar elementos transparentes no quede basura del tile anterior
            }
        }
    };

    Tileset.resetSelection = function() {
        $("#canvas .cursor").remove();
    };

    Tileset.makeSelection = function(e) {
        var tw = Tileset.info.tw;
        var th = Tileset.info.th;
        var tileSelected = e.currentTarget; //e.target;
        var tileCoords = $(tileSelected).attr("data-coords");
        var sx = tileCoords.split(".")[0];
        var ex = sx + tw;
        var sy = tileCoords.split(".")[1];
        var ey = sy + th;
        var id = $(tileSelected).attr("data-ts"); //1;
        var rotacion = $(tileSelected).attr("data-rotate") + "deg";
        //Desmarcamos el tile actual actual en el panel
        $(".tilelist a").removeClass("active");
        //Marcamos el tile como actual en el panel
        $(tileSelected).addClass("active");

        if (!$("#canvas .cursor").length) { $("#canvas").append("<div class='cursor'></div>"); }

        //console.log($(tileSelected).attr("data-rotate"));

        $("#canvas .cursor").css({
            width: tw,
            height: th,
            backgroundColor: "transparent",
            opacity: "0.4",
            backgroundPosition: (-sx) + "px " + (-sy) + "px",
        }).attr("class", "cursor ts_" + id);
        $("#canvas .cursor").attr("data-ts", id);
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