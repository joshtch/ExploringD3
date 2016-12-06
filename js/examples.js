async function getExamples() {
    var examplesjson = await getFileText("examples.json");
    examples = jQuery.parseJSON(examplesjson);
    return examples;
}

function getExample(name) {
    console.log(examples[name]);
    return examples[name];
}