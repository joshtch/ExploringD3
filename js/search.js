$(document).ready(function() {

    $("#search-bar").keypress(function(e) {
        if(e.which == 13) {
            search();
        }
    });

    $("#search-button").click(function(e) {
        if ($(this).hasClass("fa-search"))
            search();
        else
            clearSearch();
    });

});

function search() {

    unhighlightSearchNodes();

    var terms = $("#search-bar").val().split(" ");
    console.log("search for", terms);

    highlightSearchNodes(terms, root);
    update(root);

    $("#search-button").removeClass("fa-search");
    $("#search-button").addClass("fa-times");
    $("#search-instr").css("display", "block");

}

function highlightSearchNodes(term, node) {

    // to highlight a node, ensure that each search term
    // appears in it at least once

    var appears = true;

    for (var i = 0; i < term.length; i++) {

        var regex = new RegExp(term[i] ,"g");
        if (node.name.match(regex) == null) {
            if (!node.readme ||
                node.readme.match(regex) == null)
                appears = false;
        }

    }

    if (appears) {
        console.log(node.name);
    }

    node.search = appears;

    var appears_in_children = false;

    if (node._children) {
        for (var i = 0; i < node._children.length; i++) {
            appears_in_children |= highlightSearchNodes(term, node._children[i]);
        }
    }

    if (appears_in_children)
        console.log("appears in child of", node.name);

    node.search_children = appears_in_children;

    return appears;

}

function unhighlightSearchNodes() {

    unhighlightSearchNode(root);
    update(root);

}

function unhighlightSearchNode(node) {

    node.search = false;
    node.search_children = false;

    if (node.children)
        node.children.forEach(unhighlightSearchNode);

}

function clearSearch() {

    unhighlightSearchNodes();
    $("#search-bar").val('');
    $("#search-button").removeClass("fa-times");
    $("#search-button").addClass("fa-search");
    $("#search-instr").css("display", "none");

}