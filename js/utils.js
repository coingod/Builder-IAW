define([
	"jquery-ui",
	"libs/underscore"
], function($, _) {

	var Utils = {}, Editor;

	Utils.initialize = function(namespace) {

		Editor = namespace;

		return this;
	};

	Utils.make_selection = function(e, container) {
		var tileset = Editor.Tileset,
			tw = tileset.tilesize.width,
			th = tileset.tilesize.height,

			$container = $(container),
			offset =  $container.offset(),

			// Posicion relativa al tileset
			x = Math.floor(((e.pageX - offset.left) + $container.scrollTop()) / tw) * tw,
			y = Math.floor(((e.pageY - offset.top) + $container.scrollLeft()) / th) * th,

			$selection = $container.find(".selection");

		
		if (e.type == "mousedown") { // Crear div seleccion

			if (!$selection.length) //no hay seleccion actualmente
			{ $container.append("<div class='selection'></div>"); }

			$selection.css({
				left: x,
				top: y,
				width: tw,
				height: th
			});

			delete Editor.selection;
			Editor.tmp_selection = [[x, y], new Array(2)];
			
		} else if (e.type == "mousemove") {
			// Redibujamos el div selection en donde corresponda
			if (Editor.mousedown) {

				var sx = Editor.tmp_selection[0][0],
					sy = Editor.tmp_selection[0][1],

					w = Math.abs((x-sx) + tw),
					h = Math.abs((y-sy) + th);

				// mouse hacia la derecha
				if (sx <= x) { $selection.css({ left: sx, width: w }); }
				// mouse hacia la izquierda
				else { $selection.css({ left: x, width: w + tw*2 }); }
				// mouse hacia abajo
				if (sy <= y) { $selection.css({ top: sy, height: h }); }
				// mouse hacia arriba
				else { $selection.css({ top: y, height: h + th*2 }); }

			// Hover 
			} else {
				if (!$selection.length)
				{ $container.append("<div class='selection'></div>"); }

				$container.find(".selection").css({
					left: x, top: y,
					width: tw, height: th
				});
			}

		} else if (e.type == "mouseup" && Editor.tmp_selection) { 
			//Estamos soltando el mouse y tenemos un tile seleccionado
			var s = Editor.tmp_selection,
				id = $("select[name=tileset_select] option:selected").index(),
				sx, sy, ex, ey

			s[1][0] = x;
			s[1][1] = y;
			//NO TENGO GANAS DE REVISAR ESTE CODIGO AHORA PERO HACELO LUCAS DEL FUTURO
			// Normalize selection, so that the start coordinates
			// are smaller than the end coordinates
			sx = s[0][0] < s[1][0] ? s[0][0] : s[1][0];
			sy = s[0][1] < s[1][1] ? s[0][1] : s[1][1];
			ex = s[0][0] > s[1][0] ? s[0][0] : s[1][0];
			ey = s[0][1] > s[1][1] ? s[0][1] : s[1][1];

			Editor.selection = [[sx/tw, sy/th], [ex/tw, ey/th]];
		}
	};

	return Utils;

});