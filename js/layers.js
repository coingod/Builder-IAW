define([
    "jquery-ui"
], function($) {

    var Layers = {},
        Editor;
    var lastLayerID = 0;
    var scrollPaneApi, layerABorrar;

    //Iconos
    var icon_visible = "visibility";
    var icon_not_visible = "visibility_off";
    var icon_remove = "delete";
    var icon_not_remove = "delete_forever";

    Layers.initialize = function(editor) {

        Editor = editor;

        //Registramos el oyente de capa activa
        $("#layerlist").on("mousedown", "a", function(e) {
            //Si hicimos click en el icono de visibilidad o eliminar, retornamos
            if ($(e.target).hasClass("secondary-content")) return;
            //Desmarcamos la capa actual
            $("#layerlist a").removeClass("active");
            //Marcamos la capa como la actual
            $(e.currentTarget).addClass("active");
        });

        //Registramos los oyentes para agregar/eliminar/toggle capas
        $("#layerlist").on("click", "a i", function(event) {
            if ($(event.target).hasClass(icon_visible)) {
                Layers.toggle(event);
            } else if ($(event.target).text() == icon_remove) {
                //Obtenemos la capa que registro el evento
                console.log("HOLAA!");
                layerABorrar = $(event.target).parent();
                $("#layer_delete").modal("open");
            }
        });
        //Oyente de confirmacion de borrado
        $("#si").on("click", function(event) {
            Layers.deleteLayer(layerABorrar);
        });
        $("#layers_add").on("click", function() {
            $("#dialog_new_layer").modal("open");
        });

        //Configuramos el alto de la lista de capas en funcion del alto de la pagina
        $("#layerlist").css({
            height: $(window).height() / 6
        });

        //Agregamos la barra de desplazamiento vertical al contenedor de tilesets
        scrollPaneApi = $("#layerlist").jScrollPane().data('jsp');

        //Agregamos las capas por defecto
        this.createDefaultLayers();

        return this;
    };

    Layers.createDefaultLayers = function() {
        //Agregamos 2 capas por defecto
        Layers.addLayer("Background", true);
        Layers.addLayer("Terreno", true);
    }

    Layers.crearDialog = function() {
        $("#dialog_new_layer").modal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
            complete: function() {
                    var name = $("#layer_name").val();
                    Layers.addLayer(name, true);
                } // Callback for Modal close
        });
        $("#layer_delete").modal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
        });
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
    Layers.addLayer = function(name, visible) {

        //Desmarcamos la capa actual
        $("#layerlist a").removeClass("active");
        //Actualizamos el ID de la capa actual
        var currentLayer = lastLayerID++;
        //Si pasamos un nombre lo usamos, sino asignamos uno por defecto
        if (!name) name = "Layer " + currentLayer;
        //Creamos el item con la ID correspondiente
        //var visibility = ((visible != icon_visible) ? icon_not_visible : icon_visible);
        var layer = $("<a href='#!' class='collection-item active' data-id=" + currentLayer + " > <i class='layer-name'>" + name + "</i> <i class='secondary-content delete material-icons'>delete</i><i class='secondary-content visibility material-icons'>" + icon_visible + "</i></a>");
        //Agregamos el item a la interfaz
        scrollPaneApi.getContentPane().append(layer);
        //Ajustamos el scroll
        scrollPaneApi.reinitialise();

        //Creamos el div de esta Capa para el Canvas
        //En donde se almacenaran todos los tiles asociados
        var layerdiv = "<div class='layer nobg' data-id='" + currentLayer + "'></div>";
        //Agregamos el div al Canvas
        $("#tiles").append(layerdiv);

        //Si antes habia una sola capa ya es posible eliminar
        if ($("#layerlist a").length == 2) {
            $(".secondary-content").filter(".delete").text(icon_remove);
        }
    };

    Layers.removeAll = function() {
        //Borramos TODAS las capas
        $("#layerlist a").each(function() {
            Layers.deleteLayer($(this));
        });
    };

    //Elimina la capa actualmente seleccioanda junto con su contenido
    Layers.deleteLayer = function(layer) {
        //Eliminar la capa del canvas con todo su contenido
        $("#tiles > div").filter("[data-id='" + layer.attr("data-id") + "']").remove();
        //Chequeamos si es la capa actual
        var activa = $(layer).hasClass("active");
        //Eliminamos la capa de la interfaz
        layer.remove();
        //Ajustamos el scroll
        scrollPaneApi.reinitialise();

        //Si era la capa actual
        if (activa) {
            //Marcamos la ultima capa como activa
            $("#layerlist a").last().addClass("active");
        }

        //Si solo queda una capa desabilitar eliminar
        if ($("#layerlist a").length == 1) {
            $(".secondary-content").filter(".delete").text(icon_not_remove);
        }
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