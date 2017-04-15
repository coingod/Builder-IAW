define([
	"jquery-ui"
], function($) {
	
	var Layers = {}, Editor;
    //var currentLayer = 0;
    var lastLayerID = 0;
	
	Layers.initialize = function(editor) {
		
		Editor = editor;

        //Registramos el oyente de capa activa
        $("#layerlist").on("mousedown", "li", function(e) {
            //Desmarcamos la capa actual
			$("#layerlist li").removeClass("current");
            //Marcamos la capa como la actual
			$(e.currentTarget).addClass("current");
		});

        //Registramos los oyentes para agregar/eliminar capas
        $("#layers_add").on("click", this.addLayer);
        $("#layers_del").on("click", this.deleteLayer);

        //Agregamos 2 capas por defecto
        Layers.addLayer();
        Layers.addLayer();
        
		return this;
	};
	
    //Agrega una nueva capa
    Layers.addLayer = function() {

        //Desmarcamos la capa actual
        $("#layerlist li").removeClass("current");
        //Actualizamos el ID de la capa actual
        var currentLayer = lastLayerID++;
        //Creamos el item con la ID correspondiente
        var layer = $("<li class='current' data-id=" + currentLayer + " ></li>").text("Layer " + currentLayer);
        //Agregamos el item al HTML
        $("#layerlist").append(layer);

        //Creamos el div de esta Capa para el Canvas
        //En donde se almacenaran todos los tiles asociados
        var layerdiv = "<div class='layer' data-id='" + currentLayer + "'></div>";
        //Agregamos el div al Canvas
        $("#tiles").append(layerdiv);
    };

    //Elimina la capa actualmente seleccioanda junto con su contenido
    Layers.deleteLayer = function() {

        //No permitimos eliminar la unica capa
        if( $("#layerlist li").length == 1 ) {
            alert("Debe existir al menos una capa.");
            return;
        }

        //Obtenemos la ID de la capa actual
        var currentLayer = $("#layerlist li").filter(".current").attr('data-id');
        //Eliminar la capa actual del canvas con todo su contenido
        $("#tiles > div").filter("[data-id='" + currentLayer + "']").remove();

        //Eliminamos la capa actual de la interfaz
        $("#layerlist li").filter(".current").remove();
        //Marcamos la ultima capa como la actual
        $("#layerlist li").last().addClass("current");
    };

    //Retorna un par {Capa, ID} con el DOM de la capa actual y su id
    Layers.currentLayer = function() {
        
        //Obtenemos la ID de la capa actual
        var idlayer = $("#layerlist li").filter(".current").attr('data-id');
        return {
            layer : $("#tiles > div").filter("[data-id='" + idlayer + "']"),
            id : idlayer
        }
    };

	return Layers;
});