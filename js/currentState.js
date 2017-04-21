define([
		"jquery-ui"
	], function($){
		
		var currentState={},
		Editor, tilesetInfo, layers, canvas;
		
		currentState.initialize = function(editor){
			Editor=editor;
			tilesetInfo=Editor.Tileset.info; //Obtenemos la info del tileset actual
			layers=Editor.Layers;
			
			this.exportar();
			
			return currentState;
		}
		
		currentState.exportar = function(){
			//Tenemos que armar un objeto JavaScript (es decir, un json) 
			//con la info necesaria para que este luego sea importado 
			//y se levante el estado actual
			
			currentState.json={}; //Esto es lo que vamos a utilizar como objeto 
			currentState.json.tilesetInfo=Editor.Tileset.info;
			
			var listaCapas=$("#layerlist").find();
			var jsonCapas=new Array();
			var i=0;
			for(i=0; i<listaCapas.length; i++){
				jsonCapas[i]=listaCapas.get(i); //Obtenemos cada uno de los elementos de la lista
				var tiles=$("#tiles").get(i).length;
				console.log(tiles);
			}
			console.log(jsonCapas.length);
			//En este punto tenemos la información de cada una de las listas
			//Y tambien del tileset que se estaba dibujando.
			//Falta exportar cada uno de los tiles que se dibujaron en el canvas
			
		}
		
		
		return currentState;
});