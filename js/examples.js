function getExamples() {
    getFileText("examples.json").then(function (examplesjson) {
        examples = jQuery.parseJSON(examplesjson);
    });
}

function getExample(name) {
    return examples[name];
}