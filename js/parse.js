async function jsonifyModules(file, debug) {

    var fileText = await getFileText(file);

    var d3 = new Object();
    var modules = await getModulesInfo(fileText);

    d3.name = "d3";
    d3.children = modules;
    d3.type = "library";

    if (debug) {
        var url = 'data:text/json;charset=utf8,' +
                  encodeURIComponent(JSON.stringify(d3));
        window.open(url, '_blank');
        window.focus();
    }

    return d3;

}

async function getModulesInfo(fileText) {

    var modules = [];
    var module_regex = /export {([^\}]*)} from "([^\"]+)";/g;

    while (match = module_regex.exec(fileText)) {
        var info = await getModuleInfo(match);
        modules.push(info);
    }

    return modules;

}

async function getModuleInfo(module) {

    var module_body = module[1];
    var module_name = module[2];

    console.log("Loading " + module_name + "...");

    var export_regex = /(?:[\s]+)([^,\n]+)/g;
    var exports = []

		processMatches(export_regex, module_body, function(match) {
				if (notComment(match[1])) {
						var module_fun = new Object();
						module_fun.name = match[1];
						module_fun.type = "function";
						exports.push(module_fun);
				}
		});

    var module_info = new Object();
    module_info.name = module_name;
    module_info.type = "module";
    module_info.children = exports;
    if (module_name != "./build/package")
        module_info.readme = await getFileText("dataset/d3/node_modules/" + module_name + "/README.md")

    return module_info;

}

async function processMatches(regex, str, f_match) {

    while (match = regex.exec(str)) {
        if (f_match !== null) f_match(match);
    }

}

function getFileText(file) {

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

function notComment(match) {
	return match.indexOf("// DEPRECATED") != 0;
}
