// Constants for id's of elements within the detail-container
var txt = "";

jQuery.fn.scrollTo = function(elem) {
    $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
    return this;
};

var TITLE = "#dc-title";
var TEXT = "#dc-code-text";
var DESC = "#dc-description";

	function updateDetails (d) {

		$("#detail-container").css("visibility", "visible");

		var name = d.name;
		$(TITLE).text(name);

		var path = "dataset/d3-core-js/" + name + ".js";

		var readmeName = d.name;

		if(d.type == "function"){
			readmeName = d.parent.name
		}

		console.log(readmeName);

		var readmePath = "https://raw.githubusercontent.com/d3/" + readmeName + "/master/README.md"

		getReadme(readmePath).then(function(fileHTML) {
			var parsedReadme = parseReadme(fileHTML);

			$(DESC).html(parsedReadme);
			var tagSelector
			if(d.type == "function") {
				tagSelector = 'a[name=' + d.name + ']'
			} else {
				tagSelector = "#" + d.name.replace(/-/g, "")
			}
			$("#dc-description-container").scrollTo(tagSelector);
		})

		updateCode(path);
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
