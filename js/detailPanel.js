var txt = "";

$(document).ready(function() {
    d3.select("#toggle-tab").on("click", toggleTab);
});

jQuery.fn.scrollTo = function(elem) {
	$(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
	return this;
};

// Constants for id's of elements within the detail-container
var TITLE = "#dc-title";
var TEXT = "#dc-code-text";
var DESC = "#dc-description";

$("#parentModule").click(function(d){
	console.log("clicked");
});

function updateDetails (d) {
	console.log("updateDetails called")

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

}

function populateDetails(d) {
	console.log("populateDetails called")

    // default pane is ReadMe
    $("#toggle-tab").removeClass("show-code");

    // show appropriate detail pane for module vs. function
    if (d.type == "module") {
        $("#info-container").addClass("show-module");
    } else {
        $("#info-container").removeClass("show-module");
    }

	var readmeName = d.name;
	var path = "dataset/d3-core-js/" + readmeName + ".js";


	if (d.type == "function"){
		readmeName = d.parent.name
	}

	// var readmePath = "https://raw.githubusercontent.com/d3/" + readmeName + "/master/README.md"

	// getReadme(readmePath).then(function(fileHTML) {
	// 	var parsedReadme = extractReadmePart(fileHTML, d.type, readmeName, d.name)

	// 	$(DESC).html(parsedReadme);

	// 	if(d.type == "function"){
	// 		$("#pathModule").html("<a>" + readmeName.trim() + "</a>");
	// 		$("#pathFunction").html("/" + d.name);

	// 	} else {
	// 		$("#pathModule").html(readmeName.trim());
	// 		$("#pathFunction").html("")
	// 	}

	// 	// var tagSelector;
	// 	// if(d.type == "function") {
	// 	// 	tagSelector = 'a[name=' + d.name + ']'
	// 	// } else {
	// 	// 	tagSelector = "#" + d.name.replace(/-/g, "")
	// 	// }
	// 	// console.log(tagSelector)
	// 	$("#dc-description-container").scrollTop(0);
	// })


	var readmePath = "dataset/d3/node_modules/" + readmeName + "/README.md"

    var exampleLink = getExample(d.name);
    if (exampleLink) {
        $("#view-example").addClass("show");
        $("#view-example").attr("href", exampleLink);
    } else {
        $("#view-example").removeClass("show");
    }

    /* var parsedReadme;
    if (d.readme)
        parsedReadme = extractReadmePart(d.readme, d.type, readmeName, d.name)    
    else {
        var curr_node = d;
        while (curr_node.readme == undefined) {
            curr_node = curr_node.parent;
        }
        parsedReadme = extractReadmePart(curr_node.readme, d.type, readmeName, d.name)    
    } */

    $(DESC).html(d.readme);


	updateCode(d);
}

function extractReadmePart(readme, fileType, moduleName, functionName) {
	var parsedReadme = parseReadme(readme);
	if(fileType == "module") {
		var tryItLink = '<p><a href="https://tonicdev.com/npm/' + moduleName + 
		                '" target="_blank">Try it out!</a></p>';
		txt = parsedReadme;
		endOfDescription = parsedReadme.search('<h2 id="installing"');
		if(endOfDescription != -1){
			return parsedReadme.slice(0, endOfDescription) + tryItLink
		}
		// console.log(parsedReadme + tryItLink)
		return parsedReadme + tryItLink;
	} 
	// fileType is "function" otherwise

	var descriptionStart = '#</a> d3.<b>' + functionName.trim();
	var apiReferenceStartInd = parsedReadme.search(descriptionStart);

	var apiReference = parsedReadme.slice(apiReferenceStartInd);
	var apiReferenceEndInd = apiReference.indexOf('<h2', 1);
	apiReference = apiReference.slice(0, apiReferenceEndInd);
	// var node = d3.findOne()

	

	// var head = '<h3><a id="parentModule">' + moduleName.trim() + '</a>/' + functionName.trim() + '</h3><hr/>'
	return apiReference;
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

function getReadme(file) {
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

function toggleTab() {

		var tab = d3.select("#toggle-tab");
		tab.classed("show-code", !tab.classed("show-code"))

    var code = "View Code";
    var readme = "View Read Me";

    $("#toggle-tab").text() == readme ? $("#toggle-tab").text(code)
                                      : $("#toggle-tab").text(readme);

}
