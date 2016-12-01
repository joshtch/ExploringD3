function updateCode(path) {
		var editor = ace.edit("dc-code-container");
		editor.setTheme("ace/theme/iplastic");
		editor.getSession().setMode("ace/mode/javascript");
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setReadOnly(true);
		editor.renderer.$cursorLayer.element.style.display = "none";
		editor.renderer.setShowGutter(false);
		editor.$blockScrolling = Infinity;

		getFileText(path).then(function(fileText) {
				editor.setValue(fileText, -1);
				var codeLength = editor.session.getLength();
				editor.resize()
		});
}
