// Constants for id's of elements within the detail-container
var txt = "";

var TITLE = "#dc-title";
var TEXT = "#dc-code-text";
var DESC = "#dc-description";

	function updateDetails (d) {

		$("#detail-container").css("visibility", "visible");

		var name = d.name;
		$(TITLE).text(name);

		var path = "dataset/d3-core-js/" + name + ".js";

		//TODO check to see if this is a 

		getFileText(path).then(function(fileText) {
			$(TEXT).html(jQuery.parseHTML(fileText))
		});

		var readmeName = d.name;

		if(d.type == "function"){
			readmeName = d.parent.name
		}

		console.log(readmeName);

		var readmePath = "https://raw.githubusercontent.com/d3/" + readmeName + "/master/README.md"

		getReadme(readmePath).then(function(fileHTML) {
			var parsedReadme = parseReadme(fileHTML)
			// console.log(parsed)
			
			$(DESC).html(parsedReadme);
		})
	}


function getReadme (file) {
	console.log("getReadme called")
	return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState == XMLHttpRequest.DONE) {
                    resolve(req.responseText);
                }
            }
            req.onerror = reject;
            req.open("GET", file);
            req.send();
        });
}

function parseReadme (readme) {
	var converter = new showdown.Converter();
    return converter.makeHtml(readme);
}
