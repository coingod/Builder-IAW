define([
    "jquery-ui"
], function($) {

    var currentState = {},
        Editor, tilesetInfo, layers, botonExportar;

    currentState.initialize = function(editor) {
        Editor = editor;
        tilesetInfo = Editor.Tileset.info; //Obtenemos la info del tileset actual
        layers = Editor.Layers;

        botonExportar = document.createElement('a');
        botonExportar.textContent = "Exportar";
        document.getElementById("export_map").appendChild(botonExportar);

        //Inicializamos getter de archivo
        document.getElementById("file-input").addEventListener('change', currentState.readFile, false);

        document.getElementById("export_map").addEventListener('mouseenter', currentState.loadCurrentState, false);

        return currentState;
    };

    currentState.crearDialog = function() {
        $("#dialog_import").modal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
        });
    };

    currentState.loadCurrentState = function() {
        currentState.json = {}; //Esto es lo que vamos a utilizar como objeto 
        currentState.json.tilesetInfo = Editor.Tileset.info;
        currentState.json.canvasInfo = {};

        currentState.json.canvasInfo.tw = Editor.Tileset.info.tw;
        currentState.json.canvasInfo.th = Editor.Tileset.info.th;
        var wCanvas = parseInt($("#canvas").css("width")) / currentState.json.canvasInfo.tw;
        var hCanvas = parseInt($("#canvas").css("height")) / currentState.json.canvasInfo.th;

        currentState.json.canvasInfo.width = wCanvas;
        currentState.json.canvasInfo.height = hCanvas;

        currentState.loadLayerInfo();


        var jsonse = JSON.stringify(currentState.json);
        var blob = new Blob([jsonse], { type: "application/json" });
        var url = URL.createObjectURL(blob);

        botonExportar.href = url;
        botonExportar.download = "builder_map.json";
    };

    currentState.loadLayerInfo = function() {
        var listaTiles, listaAct, tileAct, infoTile, idTile, idCat, cxTile, cyTile;
        var listaCapas = $("#layerlist a");
        var jsonCapas = new Array();
        var i, j;

        for (i = 0; i < listaCapas.length; i++) {
            jsonCapas[i] = {};
            listaAct = $(listaCapas).get(i);
            jsonCapas[i].nombre = $(listaAct).children(".layer-name").text();
            jsonCapas[i].visible = $(listaAct).children(".visibility").text();
            jsonCapas[i].listaTiles = new Array();

            //Obtenemos cada uno de los tiles de esta capa
            listaTiles = $("#tiles > div").get(i);
            for (j = 0; j < listaTiles.childElementCount; j++) {
                tileAct = $(listaTiles).children()[j];
                infoTile = $(tileAct).css("background-position");
                idCategoria = parseInt($(tileAct).attr("class").split("_")[1]);
                idTile = currentState.getId(infoTile, idCategoria);
                cxTile = parseInt($(tileAct).css("left")) / currentState.json.canvasInfo.tw;
                cyTile = parseInt($(tileAct).css("top")) / currentState.json.canvasInfo.th;
                jsonCapas[i].listaTiles[j] = [idTile, idCategoria, cxTile, cyTile];
                //console.log(jsonCapas[i].listaTiles[j]);
            }
        }
        currentState.json.layersInfo = jsonCapas;

    };

    currentState.importar = function(jsonString) {
        currentState.json = JSON.parse(jsonString);
        //Pedimos al Editor que cargue los datos
        Editor.loadExternal();
    };

    currentState.readFile = function(e) {

        //Cierro el cuadro de dialogo
        $("#dialog_import").modal("close");

        var stringJson = "";
        //Debemos levantar el json y ponerlo en currentState.json

        var file = e.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            currentState.importar(e.target.result);
        };

    };

    currentState.getId = function(backPos, idCategoria) {
        var coords = backPos.split("px");
        var cx = Math.abs(parseInt(coords[0]) / tilesetInfo.tw);
        var cy = Math.abs(parseInt(coords[1]) / tilesetInfo.th);
        var toReturn = cx + (cy * tilesetInfo.categories[idCategoria].width / tilesetInfo.tw);

        return toReturn;
    };

    return currentState;
});