/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

// sanatize the D3 JSON 
function createD3Tree(d3JSON) {

    for (var i = 0; i < d3JSON.children.length;) {
        if (d3JSON.children[i].name == "./build/package") {
            d3JSON.children.splice(i, 1);
        } else {
            i++;
        }
    }

    createTree(d3JSON);
}

// Get JSON data
function createTree(treeData) {

    //Nodes Visited History

    function expandNode(d) {
        closing = toggleChildren(d);
        
        update(d);
        centerClick(d);
    }

    function moveToNode (d) {
        var root = treeData;
        root.x0 = viewerHeight / 2;
        root.y0 = 0;
        root._children = root.children;

        // Layout the tree initially and center on the root node.
        collapseAllBut(root);
        
        if(d.type == "function"){
            expandNode(d.parent);
        }
        expandNode(d);
        highlight(d);

        updateDetails(d);
    }

    nodesVisited = {}
    nodesVisited.visited = []
    nodesVisited.currentIndex = -1;
    nodesVisited.moveBack = function() {
        if(nodesVisited.currentIndex >= 0){
            nodesVisited.currentIndex += (-1);
            moveToNode(nodesVisited.visited[nodesVisited.currentIndex])
            nodesVisited.setBack();
            nodesVisited.setForward();
        }
    }
    nodesVisited.moveForward = function() {
        if(nodesVisited.currentIndex <= nodesVisited.visited.length - 2){
            nodesVisited.currentIndex += 1;
            moveToNode(nodesVisited.visited[nodesVisited.currentIndex])
            nodesVisited.setBack();
            nodesVisited.setForward();
        }
    }
    nodesVisited.addNode = function(d) {
        nodesVisited.visited.push(d);
        nodesVisited.currentIndex = nodesVisited.visited.length - 1;
    }

    nodesVisited.setBack = function() {
        if(nodesVisited.currentIndex > 0){
            $("#back-id").html(nodesVisited.visited[nodesVisited.currentIndex - 1].name);
        } else {
            $("#back-id").html("")
        }
    }

    nodesVisited.setForward = function() {
        if(nodesVisited.currentIndex < nodesVisited.visited.length - 1) {
            $("#forward-id").html(nodesVisited.visited[nodesVisited.currentIndex + 1].name);
        } else {
            $("#forward-id").html("")
        }
    }

    $("#back-id").click(function () {
        nodesVisited.moveBack();
    });

    $("#forward-id").click(function () {
        nodesVisited.moveForward();
    })



    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;

	// size of the entire page
	var pageWidth = $("#tree-container").width();
	var pageHeight = $("#tree-container").height();
    var viewerWidth = pageWidth,
        viewerHeight = pageHeight;

    /* // dimensions of detail panel
	var sidePanelWidth = $("#detail-container").width();
	var sidePanelHeight = $("#detail-container").height();
	// dimensions of tree viewer region
	var viewerWidth = pageWidth - sidePanelWidth;
	var viewerHeight = pageHeight; */

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);
    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    /**************************************************************************
     *                                                                        *
     *                           Navigation Behavior                          *
     *                                                                        *
     **************************************************************************/

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
    var curr_scale = 1.0;

    // define the zoom function for the zoomable tree
    function zoom() {
        curr_scale = d3.event.scale;
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // center appropriate associated node when a node is clicked
    function centerClick(source) {

        // if the node has no children, do not center
        if (source.children == undefined && source._children == undefined)
            return;

        // else, center the relevant component
        else {

            // if we just opened a node, center its middle child
            if (source.children != undefined) {

                to_center = getMiddleChild(source);

                // scale the tree according to the number of children
                num_children = source.children.length;
                children_height = num_children * (25 * curr_scale);

                if (children_height > viewerHeight) {
                    adjust = (children_height / viewerHeight) * 1.1;
                    scale = zoomListener.scale() / adjust;
                    curr_scale /= adjust;
                } else {
                    scale = resetScale();
                }

            // if we just closed a node, center the nodes on its level
            } else if (source._children != undefined) {
                to_center = getMiddleChild(source.parent);
                scale = resetScale();
            }

            centerNodeOnScreen(to_center, scale);

        }

    }

    function resetScale() {
        new_scale = zoomListener.scale() / curr_scale * start_scale;
        curr_scale = start_scale;
        return new_scale;
    }

    function centerNodeOnScreen(to_center, scale) {

        x = -to_center.y0;
        y = -to_center.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;

        d3.select('g')
          .transition()
          .duration(duration)
          .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    function getMiddleChild(node) {
        num_children = node.children.length;
        middle_child = Math.floor(num_children / 2);
        return node.children[middle_child];
    }

    /**************************************************************************
     *                                                                        *
     *                              Click Behavior                            *
     *                                                                        *
     **************************************************************************/

    // Toggle children on click.
    function click(d) {
        nodesVisited.addNode(d);
        closing = toggleChildren(d);
        closing ? closeDetails() : updateDetails(d);
        update(d);
        centerClick(d);
    }

    // Helper functions for collapsing and expanding nodes.
    function collapse(d) { 
        d.children = null; 
        unhighlight();
    }

	function expand(d) { 
        d.children = d._children;
        collapseOthers(d);
        highlight(d);
    }

    // close all other children at your level
    function collapseOthers(d) {
        console.log(d.parent)
        for (var i = 0; i < d.parent.children.length; i++) {
            if (d.parent.children[i] == d)
                continue;
            else
                collapse(d.parent.children[i]);
        }
    }
 
	function collapseAll(d) { collapse(d) && d.children.forEach(collapse); }
    function expandAll(d)		{ expand(d) && d.children.forEach(expand); }

    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Toggle children function
	function hasChildren(d) { return d._children ? true : false; }
	expanded = function (d) { return d.children ? true : false; }

    // return true if the node was closed;
    //        false if the node was opened or selected
    function toggleChildren(d) {

		if (hasChildren(d)) {
			expanded(d) ? collapse(d) : expand(d);
		}

        if (d.children != undefined && d.children != null)
            return false;
        else if (d._children != undefined)
            return true;
        else
            return false;

    }

    update = function (source) {
        console.log("source in update")
        console.log(source)
        //update the back and forward buttons 
        nodesVisited.setBack();
        nodesVisited.setForward();

        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse();
        var links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 5)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", function(d) {
                return "node " + d.name;
            })
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr("class", function(d) {
                return "nodeCircle " + d.name;
            })
            .attr("r", 0)
            .style("fill", getNodeColor)

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr("class", function(d) {
                return "nodeText " + d.name;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", getNodeColor)

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", function(d) {
                return "link " + d.target.name;
            })
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    function collapseAll(node) {

        if (node.children) {
            node._children = node.children;
            node.children = null;
        }

        if (node._children != undefined) {

            for (var i = 0; i < node._children.length; ++i) {
                collapseAll(node._children[i]);
            }

        }

    }

    function collapseAllBut(node) {
        if (node.children != undefined) {
            for (var i = 0; i < node.children.length; ++i) {
                collapseAll(node.children[i]);
            }
        }
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("id", "tree-svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;
    root._children = root.children;

    var start_scale = initScale();

    function initScale() {

        if (root.children != undefined) {

            num_children = root.children.length;
            children_height = num_children * (25 * curr_scale);

            if (children_height > viewerHeight) {
                adjust = (children_height / viewerHeight) * 1.1;
                return 1.0 / adjust;
            }

        }

        return 1.0;

    }

    // Layout the tree initially and center on the root node.
    collapseAllBut(root);
    update(root);
    centerClick(root);

    $("#reset-button").click(function() {
        collapseAllBut(root);
        closeDetails();
        unhighlight();
        update(root);
        centerClick(root);
    });

    $(window).resize(function() {
        $("svg").attr("height", $("#tree-container").height());
        $("svg").attr("width", $("#tree-container").width());
    });

    $("#pathModule").click(function(d) {
        var parentElemTag = "." + d.toElement.textContent
        var selection = d3.selectAll("g").filter(parentElemTag)
        var node = selection[0][0].__data__
        // update(node);
        centerClick(node);
        updateDetails(node);
    });

}

function getNodeColor(d) {
    if (d.search) {
        console.log("in search", d.name);
        return "#ffff00";
    } else if (d.search_children && !expanded(d)) {
        console.log("not expanded!");
        return "#ffff00";
    } else if (d.children || d._children)
        return "#7f9b66";
    else 
        return "#A6D785";
}
