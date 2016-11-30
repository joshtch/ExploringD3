function highlight(d) {
    fadeAllPaths();
    highlightNodePath(d);
}

// highlight the current node (and any path that led to it)
// and then highlight the current route up the tree
function highlightNodePath(d) {    
    d3.selectAll("." + d.name).attr("opacity", 1.0);
    if (d.parent) { highlightNodePath(d.parent) }
}

function unhighlight() {
    unfadeAllPaths();
}

function unfadeAllPaths()   { setPathOpacities(1.0); }
function fadeAllPaths()     { setPathOpacities(0.3); }

function setPathOpacities(op) {
    d3.selectAll("path.link").attr("opacity", op);
    d3.selectAll("circle.nodeCircle").attr("opacity", op);
    d3.selectAll("text.nodeText").attr("opacity", op);
}