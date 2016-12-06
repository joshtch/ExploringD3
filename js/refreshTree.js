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
            jsonifyModules("dataset/d3/index.js", false).then(function (d3info) {
                d3info = d3info;
                createD3Tree(d3info);
            });
        });

    }

});