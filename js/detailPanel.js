var txt = "";

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

    $("#tree-container").addClass("side-panel");
    $("#tree-svg").attr("width", $("#tree-container").width());
	$("#detail-container").css("visibility", "visible");

	var readmeName = d.name;
	var path = "dataset/d3-core-js/" + readmeName + ".js";


	if(d.type == "function"){
		readmeName = d.parent.name
	}
	var readmePath = "https://raw.githubusercontent.com/d3/" + readmeName + "/master/README.md"

	getReadme(readmePath).then(function(fileHTML) {
		var parsedReadme = extractReadmePart(fileHTML, d.type, readmeName, d.name)

		$(DESC).html(parsedReadme);
		var tagSelector;
		// if(d.type == "function") {
		// 	tagSelector = 'a[name=' + d.name + ']'
		// } else {
		// 	tagSelector = "#" + d.name.replace(/-/g, "")
		// }
		// console.log(tagSelector)
		// $("#dc-description-container").scrollTo(tagSelector);
	})

	updateCode(path);
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

	

	var head = '<h3><a id="parentModule">' + moduleName.trim() + '</a>/' + functionName.trim() + '</h3><hr/>'
	return head + apiReference;
}

function dummy () {
	console.log("h");
}

function closeDetails() {
    $("#tree-container").removeClass("side-panel");
    $("#tree-svg").attr("width", $("#tree-container").width());
    $("#detail-container").css("visibility", "hidden");
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
