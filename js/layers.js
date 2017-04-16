define([
	"jquery-ui"
], function($) {
	
	var Layers = {}, Editor;
    var lastLayerID = 0;

    //Iconos para el toggle de visibilidad de las capas
    var icon_visible = "fa fa-eye fa-lg";
    var icon_not_visible = "fa fa-eye-slash fa-lg";
	
	Layers.initialize = function(editor) {
		
		Editor = editor;

        //Registramos el oyente de capa activa
        $("#layerlist").on("mousedown", "li", function(e) {
            //Si hicimos click en el icono de visibilidad, retornamos
            if ( $(e.target).hasClass(icon_visible) || $(e.target).hasClass(icon_not_visible) ) return;
            //Desmarcamos la capa actual
			$("#layerlist li").removeClass("current");
            //Marcamos la capa como la actual
			$(e.currentTarget).addClass("current");
		});

        //Registramos los oyentes para agregar/eliminar/toggle capas
        $("#layerlist").on("click", "li span", this.toggle);
        $("#layers_add").on("click", this.addLayer);
        $("#layers_del").on("click", this.deleteLayer);

        //Agregamos 2 capas por defecto
        this.addLayer(null, "Background");
        this.addLayer(null, null);

        //Agregamos el scroll pane
        //("#layerlist").jScrollPane();
        
		return this;
	};

    Layers.toggle = function(event) {
        var icon = event.target;
        //Si es visible
        if ( $(icon).hasClass(icon_visible) ) {
            //Desactivo la capa
            $(icon).removeClass(icon_visible);
            $(icon).addClass(icon_not_visible);
        }else{
            //Activo la capa
            $(icon).removeClass(icon_not_visible);
            $(icon).addClass(icon_visible);
        }
        //Obtenemos la ID de la capa
        var id = $(icon).parent().attr("data-id");
        //Buscamos la capa en el canvas y le hacemos toggle (Show/Hide)
        $("#tiles > div").filter("[data-id='" + id + "']").toggle();
    };
	
    //Agrega una nueva capa
    Layers.addLayer = function(event, name) {

        //Desmarcamos la capa actual
        $("#layerlist li").removeClass("current");
        //Actualizamos el ID de la capa actual
        var currentLayer = lastLayerID++;
        //Si pasamos un nombre lo usamos, sino asignamos uno por defecto
        if (!name) name = "Layer " + currentLayer;
        //Creamos el item con la ID correspondiente
        var layer = $("<li class='current' data-id=" + currentLayer + " > " + name + "<span class='" + icon_visible + "'</span> </li>");
        //Agregamos el item a la interfaz
        $("#layerlist").append(layer);

        //Creamos el div de esta Capa para el Canvas
        //En donde se almacenaran todos los tiles asociados
        var layerdiv = "<div class='layer nobg' data-id='" + currentLayer + "'></div>";
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