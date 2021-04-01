//set number of boxes to show
const NUM_YEARS = 40;

//set width of bars
let barWidth = 10;

//create svg
let svg2 = d3.select('#graph2').append('svg')
    .attr('width', graph_2_width)
    .attr('height', graph_2_height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

//mouseover and mouseout functions
let mouseover2 = function(d) {
    let html = `<b>${d.year}</b></span><br/>
                <p style='text-align: left'> Q1: ` + (d.quartiles[2]) + `<br/>
                    Median: ` + (d.quartiles[1]) + `<br/>
                    Q3: ` + (d.quartiles[0]) + `<br/>
                    Max: ` + (d.extents[0]) + `<br/>
                    Min: ` + (d.extents[1]) +
                `<p>`;

    tooltip.html(html)
        .style('top', `${(d3.event.pageY) + 20}px`)
        .style('left', `${(d3.event.pageX) - 20}px`)
        .transition()
        .duration(100)
        .style('opacity', 0.9)
};

let mouseout2 = function(d) {
    tooltip.transition()
        .duration(100)
        .style('opacity', 0);
};

//load data
d3.csv('./data/netflix_runtimes.csv').then(function(data)  {
    //convert runtimes and years to ints
    data = convertToInt(data)

    let runtime_domain = []
    let year_domain = []

    //loop through data, and store all of the year/runtime values
    for (let index = 0; index < data.length; index++) {
        year_domain.push(data[index].year)
        data[index].runtime = data[index].runtime.sort(function(a, b) { return a - b })

        for (let j = 0; j < data[index].runtime.length; j++) {
            runtime_domain.push(data[index].runtime[j])
        }

    }

    //loop through data, calculate quartiles and extremes, store it all in this array
    let box_plot_data = [];
    for (let index = 0; index < data.length; index++) {
        year = data[index].year
        runtimes = data[index].runtime
        let stats_data = {};
        let localMin = d3.min(runtimes);
        let localMax = d3.max(runtimes);

        stats_data['year'] = year;
        stats_data['quartiles'] = get_quartiles(runtimes);
        stats_data['extents'] = [localMax, localMin];

        box_plot_data.push(stats_data);
    }

    //x domain
    var x = d3.scalePoint()
        .domain(year_domain)
        .range([barWidth, graph_2_width - margin.left - barWidth - margin.right])
        .padding(0.2);

    //y domain
    var y = d3.scaleLinear()
        .range([graph_2_height - margin.top - margin.bottom, 0])
        .domain([d3.min(runtime_domain), d3.max(runtime_domain)]);

    //create group for all of the graph's objects
    var box_graph = svg2.append('g')

    //create color scale for boxes
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d['year'] }))
        .range(d3.quantize(d3.interpolateHcl('#ffcc5c', '#96ceb4'), NUM_YEARS));

    //draw the vertical lines of the boxes
    let vertical_lines = box_graph.selectAll('.vertical_lines')
        .data(box_plot_data)
        .enter()
        .append('line')
        .attr('x1', d => {return x(d.year) + barWidth/2;})
        .attr('y1', d =>  {return y(d.extents[0]);})
        .attr('x2', d =>  {return x(d.year) + barWidth/2;})
        .attr('y2', d => {return y(d.extents[1]);})
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,10')
        .attr('fill', 'none');

    //draw the boxes
    var rects = box_graph.selectAll('rect')
    .data(box_plot_data)
    .enter()
    .append('rect')
    .attr('width', barWidth)
    .attr('height', d => {return y(d.quartiles[2]) - y(d.quartiles[0]);})
    .attr('x', d => {return x(d.year);})
    .attr('y', d => {return y(d.quartiles[0]);})
    .attr('fill', d => {return color(d.year);})
    .attr('stroke', '#999')
    .attr('stroke-width', 1)
    .on('mouseover', mouseover2)
    .on('mouseout', mouseout2);

    //draw the top of the whisker
    let top_whisker = box_graph.selectAll('.extents')
        .data(box_plot_data)
        .enter()
        .append('line')
        .attr('x1', d => {return x(d.year)})
        .attr('y1', d => {return y(d.extents[0])})
        .attr('x2', d => {return x(d.year) + barWidth})
        .attr('y2', d => {return y(d.extents[0])})
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    //draw the median line
    let median_line = box_graph.selectAll('.extents')
        .data(box_plot_data)
        .enter()
        .append('line')
        .attr('x1', d => {return x(d.year)})
        .attr('y1', d => {return y(d.quartiles[1])})
        .attr('x2', d => {return x(d.year) + barWidth})
        .attr('y2', d => {return y(d.quartiles[1])})
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    //draw the bottom whisker
    let bottom_whisker = box_graph.selectAll('.extents')
        .data(box_plot_data)
        .enter()
        .append('line')
        .attr('x1', d => {return x(d.year)})
        .attr('y1', d => {return y(d.extents[1])})
        .attr('x2', d => {return x(d.year) + barWidth})
        .attr('y2', d => {return y(d.extents[1])})
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    //draw y-axis
    svg2.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(15));

    //draw x-axis, and rotate the year labels
    svg2.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + (graph_2_height - margin.bottom - margin.top + 3) + ')')
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-8px')
        .attr('dy', '1px')
        .attr('transform', 'rotate(-55)');;

    //x-axis label
    svg2.append('text')
        .attr('transform', `translate(${graph_2_width * 0.33},${graph_2_height - (margin.bottom * 2.05)})`)
        .style('text-anchor', 'middle')
        .text('Year');

    //y-axis label
    svg2.append('text')
        .attr('transform', `translate(${-125},${graph_2_height * 0.4})`)
        .style('text-anchor', 'middle')
        .text('Runtime');

    //title
    svg2.append('text')
        .attr('transform', `translate(${graph_2_width * 0.33},${-15})`)
        .style('text-anchor', 'middle')
        .style('font-size', 20)
        .text('Median Runtimes of Movies by Year');
});

//get the quartiles and median
function get_quartiles(d) {
    return [d3.quantile(d, .75), d3.quantile(d, .5), d3.quantile(d, .25)];
}

//convert values in d to ints
function convertToInt(d) {

    for(let i = 0; i < d.length; i++) {
        d[i].year = parseInt(d[i].year);
        runtimes = d[i].runtime.split(',')
        for (let j = 0; j < runtimes.length; j++) {
            runtimes[j] = parseInt(runtimes[j])
        }
        d[i].runtime = runtimes
    }
    return d
};
