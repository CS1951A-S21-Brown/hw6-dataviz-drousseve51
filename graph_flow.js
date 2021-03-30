//create variable for filtered data
let data_f;

//create svg
var svg3 = d3.select('#graph3')
    .append('svg')
    .attr('width', graph_3_width)
    .attr('height', graph_3_height)
    .append('g')
    .attr('transform', `translate(0, ${margin.top})`);

//set up forces, half strength on x makes graph into an ellipse, and low strength lets the clusters spread nicely
const forceX = d3.forceX((graph_3_width / 2) - (margin.left + margin.right)/2).strength(0.1);
const forceY = d3.forceY((graph_3_height + margin.top) / 2).strength(0.2);

//create force sim
let simulation = d3.forceSimulation()
    .force('x', forceX)
    .force('y',  forceY)
    .force('link', d3.forceLink().id(function(d){return d.id;}))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter((graph_3_width - margin.right) / 2,
        (graph_3_height - margin.top) / 2));

//color scheme
let color_actors = d3.scaleOrdinal(d3.schemeSet3);

//graph title
let graph_title = svg3.append('text')
    .attr('transform', `translate(${(graph_3_width / 2)}, 0)`)
    .style('text-anchor', 'middle')
    .style('font-size', 20);

//mouseover and mouseout functions for tooltip + node/link highlighting
let mouseover3 = function(d, attr, id) {
    if (id === 'node') {
        svg3.select(`#node-${d.node_id}`).attr('r', function(d) {
            return node_size(parseInt(d.count)) * 1.75;
        });
    } else if (id === 'link') {
        svg3.select(`#link-${d.id}`).attr('stroke-width', '4');
    }

    tooltip.html(`${d[attr]}`)
        .style('top', `${(d3.event.pageY) + 20}px`)
        .style('left', `${(d3.event.pageX) - 20}px`)
        .transition()
        .duration(100)
        .style('opacity', 0.9)
};

let mouseout3 = function(d, attr, id) {
    if (id === 'node') {
        svg3.select(`#node-${d.node_id}`).attr('r', function(d) {
            return node_size(parseInt(d.count));
        })
    } else if (id === 'link') {
        svg3.select(`#link-${d.id}`).attr('stroke-width', '2');
    }

    tooltip.transition()
        .duration(100)
        .style('opacity', 0);
};

let node_size = d3.scaleLinear().range([4, 12]);

//filtering function
function checkThreshold(val, thresh) {
    if (val > thresh) {
        return true
    } else {
        return false
    }

}

//filter the data based on the threshold, then based on the genre
function updateData(popularity_thresh, genre) {
    data_f = []
    threshold = parseInt(popularity_thresh)

    let thresholdData = data.filter(function(a) {
        return (a.occur > threshold)
    });


    let filteredData = thresholdData.filter(function(b) {
        genres_list = b.genres.split(', ')
        return genres_list.includes(genre)
    });

    data_f = filteredData
}

//set up the data in the nodes + links format
function createFlowGraph() {
    graph_title.text(`Popular Actor Pairs in ${curr_genre}*`);
    let temp_links = []

    let actors = new Set();

    //go through filtered data
    for (let i = 0; i < data_f.length; i++){
        let entry = data_f[i];

        //store the pairs and titles
        temp_links.push([entry.source, entry.target, entry.title])
        //add actors to set of actors
        actors.add(entry.source)
        actors.add(entry.target)

    }

    //turn the set into an array so we can loop through
    actors = [...actors];

    //create set for actors that have enough pairs
    valid_actors = new Set();

    //loop through actors, only create a node for them if they have enough pairs
    let nodes = [];
    let i = 0;
    let node_group_id = 0;
    actors.forEach(function(a) {
        //assign group id by spreading the nodes across 10 groups
        let group = Math.round(node_group_id * (10 / actors.length));
        //count the number of pairs that contain the actor we're looking at
        let count = temp_links.filter(function(link) {
            return link[0] === a || link[1] === a;
        }).length;
        if (count > 4) {
            nodes.push({id: a, group: group, node_id: i, count: count});
            i++;
            valid_actors.add(a);
        }

        node_group_id++;

    });

    //loop through initial links, add the link if both actors are valid, and add the tooltip html with the title and names
    let links = [];
    let j = 0;
    temp_links.forEach(function(a) {
        let tooltip_html = `<b>${a[2]}</b> <br/> ${a[0]} &#38; ${a[1]}`;
        if (valid_actors.has(a[0]) && valid_actors.has(a[1])) {
            links.push({source: a[0], target: a[1], id: j, tooltip_html: tooltip_html});
            j++;
        };
    });

    //run the network with the final nodes and links
    runNetwork({nodes: nodes, links: links});
}

//run animation
function runNetwork(graph) {

    //set domain of the size range
    node_size.domain(d3.extent(graph.nodes, function(d) { return parseInt(d.count); }));

    //add link objects
    let link = svg3.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', '2')
        .attr('id', function(d) { return `link-${d.id}` })
        .on('mouseover', function(d) { mouseover3(d, 'tooltip_html', 'link') })
        .on('mouseout', function(d) { mouseout3(d, 'tooltip_html', 'link')} );

    //add node objects
    let node = svg3.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(graph.nodes)
        .enter().append('g');
    //add node style and shape values
    node.append('circle')
        .attr('r', function(d) { return node_size(parseInt(d.count)) })
        .attr('fill', function(d) { return color_actors(d.group); })
        .attr('id', function(d) { return `node-${d.node_id}` })
        .on('mouseover', function(d) { mouseover3(d, 'id', 'node') })
        .on('mouseout', function(d) { mouseout3(d, 'id', 'node') })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    //pass the nodes and links to the force sim
    simulation.nodes(graph.nodes).on('tick', ticked);
    simulation.force('link').links(graph.links);

    //when the animation runs, do this
    function ticked() {
        link.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node.attr('transform', function(d) {
                //limit x and y to be inside the graph
                d.x = Math.max(Math.min(graph_3_width, d.x), 0);
                d.y = Math.max(Math.min(graph_3_height - margin.top - margin.bottom, d.y), 0);
                return 'translate(' + d.x + ',' + d.y + ')';
            });
    }

};

//dragging functions
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

//function to remove current nodes and links, and restart sim
function removeGraph() {
    svg3.selectAll('g.nodes').remove();
    svg3.selectAll('g.links').remove();
    simulation.alpha(0.9).restart()
}