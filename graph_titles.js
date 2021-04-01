//set number of bars to show
let NUM_EXAMPLES = 15

//create svg
let svg = d3.select("#graph1")
    .append("svg")
    .attr('width', graph_1_width)
    .attr('height', graph_1_height)
    .append("g")
    .attr('transform', `translate(${margin.left},${margin.top})`);

//mouseover and mouseout functions
let mouseover = function(d) {
    let html = `<b>${d.genre}</b></span><br/>
                Count: ${d.count}</span>`;

    tooltip.html(html)
        .style('top', `${(d3.event.pageY) + 20}px`)
        .style('left', `${(d3.event.pageX) - 20}px`)
        .transition()
        .duration(100)
        .style('opacity', 0.9)
};

let mouseout = function(d) {
    tooltip.transition()
        .duration(100)
        .style('opacity', 0);
};

//load data
d3.csv('./data/netflix_counts.csv').then(function(data) {

    //parse ints, sort data, and grab NUM_EXAMPLES with highest counts
    data = get_highest(data, NUM_EXAMPLES);

    //x domain
    let x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {return d.count})])
        .range([0, graph_1_width - margin.left - margin.right]);

    //y domain
    let y = d3.scaleBand()
        .domain(data.map(function(d) { return d["genre"]}))
        .range([0, graph_1_height - margin.top])
        .padding(0.15);

    //y axis
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(5));

    //gradient for bar graph
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["genre"] }))
        .range(d3.quantize(d3.interpolateHcl("#96ceb4", "#ff6f69"), NUM_EXAMPLES));

    //add bars
    let bars = svg.selectAll("rect").data(data);

    bars.enter()
        .append("rect")
        .merge(bars)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .attr("fill", function(d) { return color(d['genre']) })
        .attr("x", x(0))
        .attr("y", function(d) {return y(d.genre)})
        .attr("width", function(d) {return x(d.count)})
        .attr("height",  y.bandwidth());

    //create count objects for data labels
    let counts = svg.append("g").selectAll("text").data(data);

    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d) {return x(d.count) + 10})
        .attr("y", function(d) {return y(d.genre) + 10})
        .style("text-anchor", "start")
        .style("font-size", 10)
        .text(function(d) {return d.count});


    //x label
    svg.append("text")
        .attr("transform", `translate(${graph_1_width * 0.33},${graph_1_height - 45})`)
        .style("text-anchor", "middle")
        .text("Count");

    //y label
    svg.append("text")
        .attr("transform", `translate(${-125},${graph_1_height * 0.4})`)
        .style("text-anchor", "middle")
        .text("Genre");

    //title
    svg.append("text")
        .attr("transform", `translate(${graph_1_width * 0.33},${-15})`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Top Genres on Netflix");
});

//get the x highest value data points
function get_highest(data, x) {
    for (var key in data) {
        data[key]['count'] = parseInt(data[key]['count'], 10)
    }

    data.sort((a, b) => b.count - a.count);
    data = data.slice(0, x)
    return data
}
