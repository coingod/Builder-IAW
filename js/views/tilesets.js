define([
	"jquery-ui",
	"libs/underscore"
], function($, _) {

	var TilesetView = {}, Editor;

	TilesetView.config = {
		filetypes: ["png", "jpg", "jpeg"]
	};

	TilesetView.tmp = {};

	TilesetView.initialize = function(namespace) {

		Editor = namespace;

		// Tileset UI functionality
		//$("body").on("change", "#tilesets select", this.change_tileset);
		//$("body").on("change", "input[name=file]", this.cacheFile);
		//$("body").on("click", "#tilesets_add", this.add);
		//$("body").on("click", "#tilesets_remove", this.remove);

		this.add;
		$("#tileset_container").on("mousedown mouseup mousemove", this.make_selection);
		
		//$("#tileset_remove").on("click", this.remove);

		return this;
	};

	// Todo disallow mixing different tilesizes
	TilesetView.add = function(e) {

		var opts = {

			tilesize: {
				width: +$("#dialog input[name=tile_width]").val(),
				height: +$("#dialog input[name=tile_height]").val()
			},

			margin: +$("#dialog input[name=tile_margin]").val(),
			alpha: $("#dialog input[name=tile_alpha]").val()

		}, hex = opts.alpha.match(/^#?(([0-9a-fA-F]{3}){1,2})$/), type, data;
		
		// Parse HEX to rgb
		if (hex && hex[1]) {
			hex = hex[1];

			if (hex.length == 3) {
				opts.alpha = [
					parseInt(hex[0]+hex[0], 16),
					parseInt(hex[1]+hex[1], 16),
					parseInt(hex[2]+hex[2], 16)
				];
			} else if (hex.length == 6) {
				opts.alpha = [
					parseInt(hex[0]+hex[1], 16),
					parseInt(hex[2]+hex[3], 16),
					parseInt(hex[5]+hex[6], 16)
				];
			}

		// Parse RGB
		} else if (opts.alpha.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])(, ?|$)){3}$/)) {
			opts.alpha = _.map(opts.alpha.split(","), function(num) { return parseInt(num, 10); });
		} else { opts.alpha = null; }

		// $("#loading").show();

		// URL or FileReader event
		if (!window.FileReader) {
			data = TilesetView.tmp.match(/.+\/(.+)\.(.+)/);
			opts.name = data[1];
			type = data[2].toLowerCase();
		} else {
			opts.name = TilesetView.tmp.name;
			type = TilesetView.tmp.type.split("/")[1];
		}

		// Wrong file type
		if (TilesetView.config.filetypes.indexOf(type.toLowerCase()) == -1) {
			alert("Wrong file type in \"" + opts.name + "\"\nSupported file types: " + TilesetView.config.filetypes.join(", "));
			//$("#loading").hide();

		// Tileset does already exist
		} else if ($("#tilesets select option:contains(" + opts.name + ")").length) {
			alert("File \"" + opts.name + "\" does already exist.");
			//$("#loading").hide();

		// Process tileset
		} else {
			if (window.FileReader) {
				var reader = new FileReader();
				reader.readAsDataURL(TilesetView.tmp);
				reader.onload = function(e) { TilesetView.process(e, opts) };
			} else { TilesetView.process(null, opts); }
		}
	};

	// Form validation is done
	// task is passed to the model's add method
	TilesetView.process = function(e, opts) {
		var data = e ? e.target.result : TilesetView.tmp;

		Editor.Tileset.add(data, opts);
		$("#dialog").dialog("close");
	};

	TilesetView.cacheFile = function(e) {
		if (!window.FileReader) {
			e.preventDefault();
			TilesetView.tmp = prompt("Your browser doesn't support local file upload.\nPlease insert an image URL below:", "");
		} else if (e.type == "change") {
			TilesetView.tmp = e.target.files[0];
			$("#dialog input[name=tileset_file_overlay]").val(TilesetView.tmp.name);
		}
	};

	TilesetView.make_selection = function(e) {

		if (!$("#tilesets select option:selected").length) { return; }
		var tileset, tw, th, ex, ey;

		Editor.Utils.make_selection(e, "#tileset_container");

		if (e.type == "mouseup") {

			tileset = Editor.Tileset;
			tw = tileset.tilesize.width;
			th = tileset.tilesize.height;

			sx = Editor.selection[0][0] * tw;
			sy = Editor.selection[0][1] * th;
			ex = Editor.selection[1][0] * tw;
			ey = Editor.selection[1][1] * th;

			if (!$("#canvas .selection").length)
			{ $("#canvas").append("<div class='selection'></div>"); }

			$("#canvas .selection").css({
				width: (ex-sx) + tw,
				height: (ey-sy) + th,
				backgroundColor: "transparent",
				backgroundPosition: (-sx) + "px " + (-sy) + "px"
			}).attr("class", "selection ts_" + tileset.id);

			$("#tileset_container").find(".selection").remove();
			delete Editor.selection.custom;
		}
	};

	return TilesetView;
});