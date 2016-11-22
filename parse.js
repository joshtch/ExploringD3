function jsonifyModules(file, callback) {

    getFileText(file).then(function(fileText) {
       
        var d3 = new Object();

        var module_regex = /export {([^\}]*)} from "([^\"]+)";/g;
        var modules = []

        processMatches(module_regex, fileText, function(match) {
            var info = getModuleInfo(match);
            modules.push(info);
        });

        d3.name = "d3";
        d3.children = modules;

        callback(d3);

    }).catch(function(error) {
        console.log(error.stack);
    });

}

function getModuleInfo(module) {

    var module_body = module[1];
    var module_name = module[2];

    var export_regex = /(?:[\s]+)([^,]+)/g;
    var exports = []

    processMatches(export_regex, module_body, function(match) { 
        exports.push(match[1]); 
    });

    var module_info = new Object();
    module_info.name = module_name;
    module_info.children = exports;

    return module_info;

}

function processMatches(regex, str, f_match) {

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