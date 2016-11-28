function updateCode(path) {
		var editor = ace.edit("dc-code-container");
		editor.setTheme("ace/theme/iplastic");
		editor.getSession().setMode("ace/mode/javascript");
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setReadOnly(true);
		editor.renderer.$cursorLayer.element.style.display = "none";
		editor.renderer.setShowGutter(false);

		getFileText(path).then(function(fileText) {
				editor.setValue(fileText, -1);
				var codeLength = editor.session.getLength();
				var viewSize = codeLength * 12;
				if (codeLength > 360) {
						$("#dc-code-text").css("height", "360px");
				} else {
						$("#dc-code-text").css("height", codeLength + "px");
				}
				editor.resize()
		});
}
