define([
    "jquery-ui"
], function($) {

    var Layers = {},
        Editor;
    var lastLayerID = 0;
    var scrollPaneApi;

    //Iconos para el toggle de visibilidad de las capas
    var icon_visible = "visibility"; //fa fa-eye fa-lg";
    var icon_not_visible = "visibility_off"; //"fa fa-eye-slash fa-lg";


    Layers.initialize = function(editor) {

        Editor = editor;

        //Registramos el oyente de capa activa
        $("#layerlist").on("mousedown", "a", function(e) {
            //Si hicimos click en el icono de visibilidad, retornamos
            if ($(e.target).text() == icon_visible || $(e.target).text() == icon_not_visible) return;
            //Desmarcamos la capa actual
            $("#layerlist a").removeClass("active");
            //Marcamos la capa como la actual
            $(e.currentTarget).addClass("active");
        });

        //Registramos los oyentes para agregar/eliminar/toggle capas
        $("#layerlist").on("click", "a i", this.toggle);
        $("#layers_add").on("click", this.addLayer);
        $("#layers_del").on("click", this.deleteLayer);

        //Configuramos el alto de la lista de capas en funcion del alto de la pagina
        $("#layerlist").css({
            height: $(window).height() / 6
        });

        //Agregamos la barra de desplazamiento vertical al contenedor de tilesets
        scrollPaneApi = $("#layerlist").jScrollPane().data('jsp');
        /*
        //Hacemos "responsive" al scroll
        $(window).on('resize', function() {
            scrollPaneApi.getContentPane().reinitialise();
        });
        */
        //Agregamos 2 capas por defecto
        this.addLayer(null, "Background");
        this.addLayer(null, null);

        return this;
    };

    Layers.toggle = function(event) {
        var icon = event.target;
        //Si es visible
        if ($(icon).text() == icon_visible) {
            //Desactivo la capa
            $(icon).text(icon_not_visible);
        } else {
            //Activo la capa
            $(icon).text(icon_visible);
        }
        //Obtenemos la ID de la capa
        var id = $(icon).parent().attr("data-id");
        //Buscamos la capa en el canvas y le hacemos toggle (Show/Hide)
        $("#tiles > div").filter("[data-id='" + id + "']").toggle();
    };

    //Agrega una nueva capa
    Layers.addLayer = function(event, name) {

        //Desmarcamos la capa actual
        $("#layerlist a").removeClass("active");
        //Actualizamos el ID de la capa actual
        var currentLayer = lastLayerID++;
        //Si pasamos un nombre lo usamos, sino asignamos uno por defecto
        if (!name) name = "Layer " + currentLayer;
        //Creamos el item con la ID correspondiente
        //var layer = $("<li class='collection-item active' data-id=" + currentLayer + " > " + name + "<span class='" + icon_visible + "'</span> </li>");
        var layer = $("<a href='#!' class='collection-item active' data-id=" + currentLayer + " > " + name + "<i class='secondary-content material-icons'>visibility</i> </a>");
        //Agregamos el item a la interfaz
        //$("#layerlist").append(layer);
        scrollPaneApi.getContentPane().append(layer);
        //Ajustamos el scroll
        scrollPaneApi.reinitialise();

        //Creamos el div de esta Capa para el Canvas
        //En donde se almacenaran todos los tiles asociados
        var layerdiv = "<div class='layer nobg' data-id='" + currentLayer + "'></div>";
        //Agregamos el div al Canvas
        $("#tiles").append(layerdiv);
    };

    //Elimina la capa actualmente seleccioanda junto con su contenido
    Layers.deleteLayer = function() {

        //No permitimos eliminar la unica capa
        if ($("#layerlist a").length == 1) {
            alert("Debe existir al menos una capa.");
            return;
        }

        //Obtenemos la ID de la capa actual
        var currentLayer = $("#layerlist a").filter(".active").attr('data-id');
        //Eliminar la capa actual del canvas con todo su contenido
        $("#tiles > div").filter("[data-id='" + currentLayer + "']").remove();

        //Eliminamos la capa actual de la interfaz
        $("#layerlist a").filter(".active").remove();
        //Marcamos la ultima capa como la actual
        $("#layerlist a").last().addClass("active");
        //Ajustamos el scroll
        scrollPaneApi.reinitialise();
    };

    //Retorna un par {Capa, ID} con el DOM de la capa actual y su id
    Layers.currentLayer = function() {

        //Obtenemos la ID de la capa actual
        var idlayer = $("#layerlist a").filter(".active").attr('data-id');
        return {
            layer: $("#tiles > div").filter("[data-id='" + idlayer + "']"),
            id: idlayer
        }
    };

    return Layers;
});