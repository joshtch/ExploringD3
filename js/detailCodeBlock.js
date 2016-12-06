function updateCode(d) {
		var editor = ace.edit("dc-code-container");
		configureEditor(editor);

		var filename = isFunction(d) ? d.parent.name : d.name;
		var path = "dataset/d3-core-js/" + filename + ".js";

		getFileText(path).then(function(fileText) {
				editor.setValue(fileText, -1);
				var startLine = 0;
				if (isFunction(d)) {
						startLine = findD3FunctionDefinition(d.name, fileText) - 1;
				}
				editor.scrollToRow(startLine);
		});
}

function configureEditor(editor) {
		editor.setTheme("ace/theme/dawn");
		editor.getSession().setMode("ace/mode/javascript");
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(true);
		editor.setReadOnly(true);
		editor.renderer.$cursorLayer.element.style.display = "none";
		editor.renderer.setShowGutter(false);
		// editor.getSession().setUseWorker(false);
		editor.$blockScrolling = Infinity;
		editor.resize(true);
}

/*
 * This function finds the function definition of "func_name" in "fileText",
 * and returns the line the definition begins on.
 */
function findD3FunctionDefinition(func_name, fileText) {
		/* D3 defines an internal function and then exports it in a separate step.
		 * Since we want the function definition but only have the exported name,
		 * we first find what internal function is exported to that name, and then
		 * find where that internal function is defined.
		 */

		var internal_name = getD3InternalFunctionName(func_name, fileText);
		return lineOfFunction(internal_name, fileText);
}

function getD3InternalFunctionName(external_name, text) {
		/* Export definition has the form "exports.xyz = internal_xyz_name;"
		 * We use a regular expression to capture and output this internal name.
		 */

 		/* Technically, Unicode characters are allowed in variable names,
 		 * per http://stackoverflow.com/q/9337047
 		 * D3 doesn't use them, though, and the strictly correct regex is 11k+
 		 * characters long, so this is just the ASCII subset.
		 */
		var variable_regex = "\\b[a-zA-Z_$][0-9a-zA-Z_$]*\\b";
		var export_regex = new RegExp("exports\\."
				+ regexEscape(external_name) + " *= *("+ variable_regex + ")");
		var match = export_regex.exec(text);
		return match[1];
}

function lineOfFunction(fname, text) {
		var declaration_regex =
						new RegExp("(function|var) +\\b" + regexEscape(fname) + "\\b");
		var fname_index = declaration_regex.exec(text).index;
		var text_before_definition = text.substr(0, fname_index);
		return numNewlinesIn(text_before_definition);
}

function numNewlinesIn(str) {
		return str.match(/^/mg).length;
}

function fileExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

/* From http://stackoverflow.com/q/14359586 */
function regexEscape(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function isFunction(d) {
		return d.type == "function";
}

