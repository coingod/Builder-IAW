define([
		"jquery-ui"
	], function($){
		
		var currentState={},
		Editor, tilesetInfo, layers, canvas;
		
		currentState.initialize = function(editor){
			Editor=editor;
			tilesetInfo=Editor.Tileset.info; //Obtenemos la info del tileset actual
			layers=Editor.Layers;			
			//this.exportar();			
			return currentState;
		}
		
		currentState.exportar = function(){
			//Tenemos que armar un objeto JavaScript (es decir, un json) 
			//con la info necesaria para que este luego sea importado 
			//y se levante el estado actual
			var listaTiles,listaAct , tileAct, infoTile, idTile, idCat, cxTile, cyTile;
			currentState.json={}; //Esto es lo que vamos a utilizar como objeto 
			currentState.json.tilesetInfo=Editor.Tileset.info;
			
			
			var listaCapas=$("#layerlist a");
			var jsonCapas=new Array();
			var i,j;
			
			for(i=0; i<listaCapas.length; i++){
				jsonCapas[i]={}; 
				listaAct=$(listaCapas).get(i);
				jsonCapas[i].nombre=currentState.getLayerName($(listaAct).text());
				jsonCapas[i].visible=currentState.getVisibility($(listaAct).text());
				jsonCapas[i].listaTiles=new Array();
				
				//Obtenemos cada uno de los tiles de esta capa
				listaTiles=$("#tiles > div").get(i);
				for(j=0; j<listaTiles.childElementCount; j++){
					tileAct = $(listaTiles).children()[j];
					infoTile=$(tileAct).css("background-position");	
					idCategoria=parseInt($(tileAct).attr("class").split("_")[1]);
					idTile=currentState.getId(infoTile,idCategoria);
					cxTile=$(tileAct).css("left");
					cyTile=$(tileAct).css("top");
					jsonCapas[i].listaTiles[j]=[idTile,idCategoria,cxTile,cyTile];
				}
			}
			currentState.json.layersInfo=jsonCapas;			
		}
		
		currentState.getVisibility=function(string){
			var toReturn;
			var arr=string.split(" ");
			toReturn=arr[arr.length-2]; //en -1 hay un espacio.
			return toReturn;
		}
		currentState.getLayerName=function(string){
			var arr=string.split(" ");
			var i, toReturn="";
			for(i=0; i<(arr.length-2); i++) //en -1 hay un espacio.
				toReturn+=arr[i]+" ";
			return toReturn;
		}
		
		currentState.getId=function(backPos, idCategoria){
			var coords=backPos.split("px");
			var cx=Math.abs(parseInt(coords[0])/tilesetInfo.tw); 
			var cy=Math.abs(parseInt(coords[1])/tilesetInfo.th);
			var imgPath=tilesetInfo.categories[idCategoria].path;
			var imagenCategoria=new Image();
			imagenCategoria.src=imgPath;

			var toReturn=cx+(cy*imagenCategoria.width/tilesetInfo.tw);
			
			return toReturn;
		}
		
		return currentState;
});