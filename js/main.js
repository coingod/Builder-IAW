/*
Punto de entrada de la aplicacion
http://requirejs.org/docs/jquery.html
*/
require.config({

	baseUrl: "js",

	shim: {
		"jquery-ui": {
			exports: "$",
			deps: ["jquery", "jquery.mousewheel", "jquery.jscrollpane"]
		},
	},

	paths: {
		"jquery": "libs/jquery",
		"jquery-ui": "libs/jquery-ui",
		"jquery.mousewheel": "plugins/jquery.mousewheel",
		"jquery.jscrollpane": "plugins/jquery.jscrollpane",
	}
});

require(["jquery", "editor"], function($, Editor) {
	$(document).ready(function() {
		Editor.initialize();
	});
});