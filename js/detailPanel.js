// Constants for id's of elements within the detail-container
var txt = "";

	var TITLE = "#dc-title";
	var TEXT = "#dc-code-text";

function updateDetails (d) {
	console.log(d)
	var name = d.name;
	$(TITLE).text(name);

	var path = "dataset/d3-core-js/" + name + ".js";

	//TODO check to see if this is a file

	getFileText(path).then(function(fileText) {
		$(TEXT).html(jQuery.parseHTML(fileText))
	});
}