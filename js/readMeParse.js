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
            
        }

        // html = html.substring(html.indexOf("d3", html.indexOf(function_start)));
        html = html.substring(html.lastIndexOf("<p>", html.indexOf(function_start)));

        var start_i = 0;
        var fun_regex = /<b>([^\<]+)/;
        var curr_fun = fun_regex.exec(html)[1];
        var curr_fun_start = html.indexOf(function_start);

        var next_fun_init;
        next_fun_init = html.indexOf(function_start, curr_fun_start + 1);
        var next_fun = html.lastIndexOf("<p>", next_fun_init);
        var next_header = html.indexOf(header_start);

        function setFunInfo (fun, info) {
            if (!funDescs[fun])
                funDescs[fun] = info;
        }

        if (next_fun_init == -1) {
            setFunInfo(curr_fun, header + html);
            break;
        } else if (next_fun_init != -1 && (next_header == -1 || next_fun < next_header)) {

            if (next_fun != 0 && next_fun != -1) {

                setFunInfo(curr_fun, header + html.substring(start_i, next_fun));
                html = html.substring(next_fun);

            } else {

                next_fun = html.lastIndexOf("<a", next_fun_init);

                // now gather the relevant text to fill
                var curr_next_fun = next_fun_init;
                var index_p = html.lastIndexOf("<p>", curr_next_fun);
                while (index_p == 0 || index_p == -1) {
                    curr_next_fun = html.indexOf(function_start, curr_next_fun + 1);
                    if (curr_next_fun == -1)
                        break;
                    index_p = html.lastIndexOf("<p>", curr_next_fun);
                }

                if (curr_next_fun != - 1)
                    setFunInfo(curr_fun, header + html.substring(start_i, index_p));
                else 
                    setFunInfo(curr_fun, header + html.substring(start_i));

                html = html.substring(next_fun);

            }

        } else {

            funDescs[curr_fun] = header + html.substring(start_i, next_header);
            html = html.substring(next_header);
        }

    }

    return funDescs;

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