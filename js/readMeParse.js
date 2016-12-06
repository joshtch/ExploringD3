function htmlReadMe (readme) {
    var converter = new showdown.Converter();
    return converter.makeHtml(readme);
}

// return:
// - module part
// - descriptions for each function

function getModuleDesc (module_name, readme) {

    var html = htmlReadMe(readme);
    var tryItLink = '<p><a href="https://tonicdev.com/npm/' + module_name + 
                    '" target="_blank">Try it out!</a></p>';

    endOfDescription = html.search('<h2 id="installing"');
    if(endOfDescription != -1){
        return html.slice(0, endOfDescription) + tryItLink
    }
    // console.log(parsedReadme + tryItLink)
    return html + tryItLink;

}

// create a function table with which to later link up

function getModuleFunDescs (readme) {

    var html = htmlReadMe(readme);

    // slice everything before the API reference tag
    var apiReferenceTag = '<h2 id="apireference">API Reference</h2>';
    var apiReferenceStart = html.search(apiReferenceTag);
    html = html.slice(apiReferenceStart + apiReferenceTag.length + 1);

    // eliminate any lists if they appear next
    var list_start = "<ul>";
    if (html.indexOf(list_start) == 0) {

        // there is a list next - eliminate it
        var list_end = "</ul>";
        html = html.substring(html.indexOf(list_end) + list_end.length + 1);

    }

    // now we're in the main part of the ReadMe; there are two types of sections:
    //
    // 1. header + content
    // 2. content

    var funDescs = new Object();
    var header = "";

    var steps = 0;

    while (html) {

        var header_start = "<h3";
        var function_start = "#</a> d3.";

        // see if there is a header, retain it
        if (html.indexOf(header_start) == 0) {

            // there is a header; save it
            header = html.substring(0, html.lastIndexOf("<p>", html.indexOf(function_start)));

            // console.log("header", header);
            
        }

        html = html.substring(html.indexOf("d3", html.indexOf(function_start)));

        // console.log("HTML Excerpt: ", html.substring(0, 40));

        // find the next function and save its text up until the next function, header, or end of file --- whichever comes first
    
        // console.log(html);

        var start_i = 0;
        var fun_regex = /<b>([^\<]+)/;
        var curr_fun = fun_regex.exec(html)[1];
        // console.log(curr_fun);

        // if (curr_fun == "max")
            // console.log(html);

        var next_fun_init;
        next_fun_init = html.indexOf(function_start);
        // console.log(next_fun_init);
        var next_fun = html.lastIndexOf("<p>", next_fun_init);
        // console.log(next_fun);
        var next_header = html.indexOf(header_start);
        // console.log(next_header);

        var end_i;
        if (next_fun_init == -1) {
            funDescs[curr_fun] = header + html;
            break;
        } else if (next_fun_init != -1 && (next_header == -1 || next_fun < next_header)) {
            funDescs[curr_fun] = header + html.substring(start_i, next_fun);
            //console.log("CURR FUN: ", html.substring(start_i, next_fun));
            // console.log("html", html);
            html = html.substring(next_fun + 3);
        } else {
            // console.log(next_header, next_fun_init);
            // console.log("curr header: ", html.substring(start_i, next_header));
            funDescs[curr_fun] = header + html.substring(start_i, next_header);
            html = html.substring(next_header);
        }
    }

    // console.log(funDescs);

    return funDescs;


    // if there is a heading, gather it


    // console.log(html);

    /*

    // first extract portion until API Reference title
    var descriptionStart = '#</a> d3.<b>' + functionName.trim();
    var apiReferenceStartInd = html.search(descriptionStart);


    var parsed_readme = readme.substring(readme.indexOf("## API Reference") + 16);

    // eliminate any bullet points after that


    return htmlReadMe(parsed_readme);

    var html = htmlReadMe(readme);
    var descriptionStart = '#</a> d3.<b>' + functionName.trim();
    var apiReferenceStartInd = html.search(descriptionStart);

    var apiReference = html.slice(apiReferenceStartInd);
    var apiReferenceEndInd = apiReference.indexOf('<h2', 1);
    apiReference = apiReference.slice(0, apiReferenceEndInd);

    return apiReference; */
}

function getFunsInfo (funs, readme) {

    funs_info = [];
    funDescs = getModuleFunDescs(readme)

    funs.forEach(function(fun) {
        fun.readme = funDescs[fun.name];
        funs_info.push(fun);
    });

    return funs_info;

}