$(document).ready(function () {

    // if we aren't running locally, hide the refresh button
    var url = window.location.href;
    var local_re = /http:\/\/localhost.*/

    if (url.match(local_re) == null) {    
        $("#refresh-button").css("display", "none");

    // otherwise, bind the button as necessary
    } else {

        $("#refresh-button").click(function() {
            closeDetails();
            $("#tree-container").empty();
            jsonifyModules("dataset/d3/index.js", createD3Tree, false);
        });

    }

});