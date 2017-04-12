define([
	"jquery-ui"
], function($) {
	
	var Layers = {}, Editor;
    var currentLayer = 0;
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

		return this;
	};
	
    //Agrega una nueva capa
    Layers.addLayer = function() {

        //Desmarcamos la capa actual
        $("#layerlist li").removeClass("current");
        //Actualizamos el ID de la capa actual
        currentLayer = lastLayerID;
        //Creamos el item con la ID correspondiente
        var layer = $("<li class='current' data-id=" + lastLayerID + " ></li>").text("Layer " + lastLayerID++);
        //Agregamos el item al HTML
        $("#layerlist").append(layer);
    };

    //Elimina la capa actualmente seleccioanda junto con su contenido
    Layers.deleteLayer = function() {

        //No permitimos eliminar la unica capa
        if( $("#layerlist li").length == 1 ) {
            alert("No pode elimina la unica capa que tene ameo.");
            return;
        }

        //Eliminamos la capa actual del HTML
        $("#layerlist li").filter(".current").remove();
        //Marcamos la ultima capa como la actual
        $("#layerlist li").last().addClass("current");
        //Actualizamos la capa actual
        currentLayer = $("#layerlist li").last().attr('data-id');

        //Eliminar contenido del canvas......
    };

	return Layers;
});