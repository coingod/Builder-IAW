define([
    "jquery-ui"
], function($) {

    var currentState = {},
        Editor, tilesetInfo, layers, canvas, botonExportar;

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
            complete: function() {
                    //var input = $("#file-input");
                    //console.log(input);
                    //currentState.readFile(input);
                } // Callback for Modal close
        });
    };
	
	currentState.loadCurrentState=function(){
		currentState.json = {}; //Esto es lo que vamos a utilizar como objeto 
        currentState.json.tilesetInfo = Editor.Tileset.info;
        currentState.loadLayerInfo();
		
		var jsonse = JSON.stringify(currentState.json);
        var blob = new Blob([jsonse], { type: "application/json" });
        var url = URL.createObjectURL(blob);

		botonExportar.href=url;
        botonExportar.download = "backup.json";
	};
	
	currentState.loadLayerInfo=function(){
		var listaTiles, listaAct, tileAct, infoTile, idTile, idCat, cxTile, cyTile;
        var listaCapas = $("#layerlist a");
        var jsonCapas = new Array();
        var i, j;
		
		console.log("Holaaa!");

        for (i = 0; i < listaCapas.length; i++) {
            jsonCapas[i] = {};
            listaAct = $(listaCapas).get(i);
            jsonCapas[i].nombre = currentState.getLayerName($(listaAct).text());
            jsonCapas[i].visible = currentState.getVisibility($(listaAct).text());
            jsonCapas[i].listaTiles = new Array();

            //Obtenemos cada uno de los tiles de esta capa
            listaTiles = $("#tiles > div").get(i);
            for (j = 0; j < listaTiles.childElementCount; j++) {
                tileAct = $(listaTiles).children()[j];
                infoTile = $(tileAct).css("background-position");
                idCategoria = parseInt($(tileAct).attr("class").split("_")[1]);
                idTile = currentState.getId(infoTile, idCategoria);
                cxTile = $(tileAct).css("left");
                cyTile = $(tileAct).css("top");
                jsonCapas[i].listaTiles[j] = [idTile, idCategoria, cxTile, cyTile];
				console.log(jsonCapas[i].listaTiles[j]);
			}
        }
        currentState.json.layersInfo = jsonCapas;

	};

    currentState.importar = function(jsonString) {
        currentState.json = JSON.parse(jsonString);
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

    currentState.getVisibility = function(string) {
        var toReturn;
        var arr = string.split(" ");
        toReturn = arr[arr.length -1]; 
        return toReturn;
    };

    currentState.getLayerName = function(string) {
        var arr = string.split(" ");
        var i, toReturn = "";
        for (i = 0; i < (arr.length-3); i++) //en -1 hay un espacio.
            toReturn += arr[i] + " ";
        return toReturn;
    };

    currentState.getId = function(backPos, idCategoria) {
        var coords = backPos.split("px");
        var cx = Math.abs(parseInt(coords[0]) / tilesetInfo.tw);
        var cy = Math.abs(parseInt(coords[1]) / tilesetInfo.th);
        var imgPath = tilesetInfo.categories[idCategoria].path;
        var imagenCategoria = new Image();
        imagenCategoria.src = imgPath;

        var toReturn = cx + (cy * imagenCategoria.width / tilesetInfo.tw);

        return toReturn;
    };

    return currentState;
});