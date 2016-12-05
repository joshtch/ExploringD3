$(document).ready(function () {

    // if we aren't running locally, hide the refresh button
    var url = window.location.href;
    var local_re = /http:\/\/localhost.*/

    if (url.match(local_re) == null) {    
        $("#refresh-button").css("display", "none");

    // otherwise, bind the button as necessary
    } else {

        $("#refresh-button").click(async function() {
            closeDetails();
            $("#tree-container").empty();
            d3info = await jsonifyModules("dataset/d3/index.js", false);
            createD3Tree(d3info);
        });

    }

});