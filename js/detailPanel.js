// Constants for id's of elements within the detail-container
var txt = "";

$(document).ready(function() {
    $("#toggle-tab").click(toggleTab);
});

jQuery.fn.scrollTo = function(elem) {
    $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
    return this;
};

var TITLE = "#dc-title";
var TEXT = "#dc-code-text";
var DESC = "#dc-description";

function updateDetails (d) {

    // transition
    $("#tree-container").addClass("side-panel");
    $("#tree-svg").attr("width", $("#tree-container").width());
    $("#detail-container").addClass("expanded");
    $("#detail-container").removeClass("show-caption");
    $("#detail-container").addClass("hide-caption");
    setTimeout(function() {
        $("#detail-container").addClass("show-info");
        populateDetails(d);
    }, 125);

    // show appropriate detail pane for module vs. function
    if (d.type == "module") {
        $("#info-container").addClass("show-module");
    } else {
        $("#info-container").removeClass("show-module");
    }

	var name = d.name;
	$(TITLE).text(name);

	var path = "dataset/d3-core-js/" + name + ".js";

	var readmeName = d.name;

	if (d.type == "function"){
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
            $("#dc-description-container").scrollTo(tagSelector);
		} else {
			/* tagSelector = "#" + d.name.replace(/-/g, "") */
            $("#dc-description-container").scrollTop(0);
		}
		
	});

	updateCode(path);
    
}

function closeDetails() {
    $("#tree-container").removeClass("side-panel");
    $("#tree-svg").attr("width", $("#tree-container").width());
    $("#detail-container").removeClass("show-info");
    $("#detail-container").removeClass("expanded");
    setTimeout(function() {
        $("#detail-container").removeClass("hide-caption");
        // trick the container to fade in - TO CLEAN
        setTimeout(function() {
            $("#detail-container").addClass("show-caption");
        }, 0);
    }, 125);    
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

function toggleTab () {

    $("#toggle-tab").toggleClass("show-code");

    var code = "View Code";
    var readme = "View Read Me";

    $("#toggle-tab").text() == readme ? $("#toggle-tab").text(code)
                                      : $("#toggle-tab").text(readme);

}