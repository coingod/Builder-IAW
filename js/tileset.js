define([
    "jquery-ui"
], function($) {

    var Tileset = {},
        Editor,
        scrollPaneApi;

    Tileset.initialize = function(namespace) {
        Editor = namespace;

        //Definimos los tilesets por defecto
        Tileset.info = {
            "tw": 64,
            "th": 64,
            "categories": [
                /*{ "name": "Default", "path": "img/tilesets/default.png", "icon": "extension", "width": 256, "height": 192 },*/

                { "name": "Terreno", "path": "img/tilesets/terrain.png", "icon": "terrain", "width": 256, "height": 192, "emptyTiles": 0 },
                { "name": "Naturaleza", "path": "img/tilesets/nature.png", "icon": "nature", "width": 256, "height": 192, "emptyTiles": 0 },
                { "name": "Caminos", "path": "img/tilesets/roads.png", "icon": "directions", "width": 512, "height": 256, "emptyTiles": 2 },
                { "name": "Edificios", "path": "img/tilesets/buildings.png", "icon": "store", "width": 256, "height": 192, "emptyTiles": 0 }
            ],
        };
        //Cargamos los tilesets
        Tileset.load();
        //Mostrar la primer categoria
        $("#tilelist_0").show();

        return this;

    };

    //Genera las pestañas para cada Tileset/Categoria y la lista de tiles para cada una
    Tileset.load = function() {
        //Vaciamos los datos cargados anteriormente, de existir
        //$("#categorieslist").empty();
        //$("#tileset_container").empty();
        $(".tilelist").remove();
        $("#categorieslist li").remove();
        //Borramos el style de los tilesets viejos
        $("head style").remove();

        //Iteramos sobre la informacion del JSON creando una categoria para cada tileset
        var cantidad = Tileset.info.categories.length;
        for (i = 0; i < cantidad; i++) {
            //Generamos la pestaña de la categoria para el panel del editor
            var category = $("<li class='tab col s3'><a href='#tilelist_" + i + "' data-id=" + i + " data-delay='50' data-position='top' data-tooltip='" + Tileset.info.categories[i].name + "' class='material-icons tooltipped'> " + Tileset.info.categories[i].icon + "</a></li>");
            $("#categorieslist").append(category);

            //Agregamos un panel para contener la lista de tiles de la categoria
            if (scrollPaneApi == null) {
                $("#tileset_container").append("<div id='tilelist_" + i + "' class='tilelist collection col s12'></div>");
            } else {
                scrollPaneApi.getContentPane().append("<div id='tilelist_" + i + "' class='tilelist collection col s12'></div>");
            }
            $("#tilelist_" + i).hide();
            /*
            //Si hay mas de una categoria y no estamos procesando la primera
            if ((cantidad > 1) && (i > 0)) {
                //Ocultamos el contenido ya que no esta activo
                $("#tilelist_" + i).hide();
            }
            */
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
        setTimeout(function() { scrollPaneApi.reinitialise(); }, 200);
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
            buffer.canvas.width = Tileset.info.categories.width = this.width;
            buffer.canvas.height = Tileset.info.categories.height = this.height;
            buffer.drawImage(this, 0, 0);
            //Dibujamos la lista de tiles de la categoria
            Tileset.draw(this, index);

            $(style).attr("id", "tileset_" + id);
            //$(style).attr("data-size", this.width + "." + this.height);
            css = ".ts_" + id + ", .ts_" + id + " > div {\n";
            css += "\twidth: " + tw + "px;\n";
            css += "\theight: " + th + "px;\n";
            css += "\tbackground-image: url('" + buffer.canvas.toDataURL() + "');\n";
            css += "}";
            $(style).append(css);

            //console.log(css);
            $("head").append(style);

        }, false);


    };

    Tileset.draw = function(img, index) {
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
                //si no estoy en la ultima fila o si estoy en la ultima fila y x es menor a celdasX-emptyTiles, dibujo, si no no.
                if (y < celdasY - 1 || (y == celdasY - 1) & (x < (celdasX - Tileset.info.categories[index].emptyTiles))) {
                    xAct = x * tw;
                    yAct = y * th;
                    coords = xAct + "." + yAct;
                    nroit = x + y * celdasX;
                    bufferADibujar.drawImage(img, xAct, yAct, tw, th, 0, 0, tw, th);
                    tile = $("<a href='#!' class='collection-item avatar' data-ts='" + index + "' data-coords='" + coords + "' data-rotate=0><img src='" + bufferADibujar.canvas.toDataURL() + "' class='circle'></a>");
                    $("#tilelist_" + index).append(tile);
                    bufferADibujar.clearRect(0, 0, tw, th); //Limpio el buffer para que al dibujar elementos transparentes no quede basura del tile anterior
                }
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
    return Tileset;
});