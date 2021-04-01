// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

//full list of all genres
const genre_total_list = ['Comedies', 'Stand-Up Comedy & Talk Shows', 'LGBTQ Movies', 'Classic & Cult TV', 'Dramas',
'TV Action & Adventure', 'International Movies', 'TV Thrillers', 'Children & Family Movies', 'Korean TV Shows',
'Reality TV', 'Documentaries', 'Romantic TV Shows', 'Music & Musicals', 'Anime Features', 'Sci-Fi & Fantasy',
'Romantic Movies', 'Cult Movies', 'Spanish-Language TV Shows', 'Faith & Spirituality', 'Docuseries', 'TV Shows',
'TV Mysteries', 'TV Comedies', 'TV Horror', 'Science & Nature TV', 'Horror Movies', 'Stand-Up Comedy', 'Crime TV Shows',
'British TV Shows', 'International TV Shows', 'Sports Movies', 'Classic Movies', 'Thrillers', 'TV Dramas',
'Independent Movies', 'Movies', "Kids' TV", 'Action & Adventure', 'Teen TV Shows', 'TV Sci-Fi & Fantasy',
'Anime Series']

//three genre rotation used for network
const genre_rotation = ['Teen TV Shows', 'Cult Movies', 'TV Sci-Fi & Fantasy']


// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = MAX_HEIGHT/2 - 15;
let graph_2_width = (MAX_WIDTH/ 2) - 10, graph_2_height = MAX_HEIGHT/2 - 15;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

//popularity metric and genre variables, used for filtering network
let popularity_metric = 12
let curr_genre = genre_rotation[0]
let curr_genre_index = 0
let max_genre_index = genre_rotation.length - 1

//set up tooltip for all 3 subgraphs
let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//load data, update network
d3.csv('./data/netflix_pairs.csv').then(function(d) {
    data = d;
    updateDashboard();
});

//remove network, update the data, then create the new network
function updateDashboard() {
    removeGraph();
    updateData(popularity_metric, curr_genre);
    createFlowGraph();
}

//functions to change the genre, remove the old network, update the data, and create the new network
function nextGenre() {
    console.log("Next!");
    if (curr_genre_index < max_genre_index) {
        curr_genre_index = curr_genre_index + 1;
    } else {
        curr_genre_index = 0;
    }
    curr_genre = genre_rotation[curr_genre_index];
    removeGraph();
    updateData(popularity_metric, curr_genre);
    createFlowGraph();
}
function prevGenre() {
    console.log("Prev!");
    if (curr_genre_index > 0) {
        curr_genre_index = curr_genre_index - 1;
    } else {
        curr_genre_index = max_genre_index;
    }
    curr_genre = genre_rotation[curr_genre_index];
    removeGraph();
    updateData(popularity_metric, curr_genre);
    createFlowGraph();
}
