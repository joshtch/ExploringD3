// Constants for id's of elements within the detail-container
var txt = "";
$(document).ready(function(){
	var TITLE = "#dc-title";
	var TEXT = "#dc-code-text";

	function nodeListener (e) {
		console.log("nodeListener called")
		var name = "stub"; //extract name of node from click event
		$(TITLE).text(name);

		var path = "dataset/d3/index.js";//extract the path from the click event
		getFileText(path).then(function(fileText) {
			$(TEXT).html(jQuery.parseHTML(fileText))
		});

	}


	//testing, remove

	nodeListener({});
});