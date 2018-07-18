var browser_width = window.innerWidth;

var width = browser_width,
	height = 200;

var projection = d3.geoMercator()
    .scale(10*(width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 4])
    .rotate([60, 23, 0])
    .precision(.1);

var path = d3.geoPath()
    .projection(projection);

var graticule = d3.geoGraticule();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "map");

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

d3.csv("route.csv", function(error, track) {
	console.log(track);
	
	d3.json("world-50m.json", function(error, world) {
	    
	    svg.insert("path", ".graticule")
	      .datum(topojson.feature(world, world.objects.land))
	      .attr("class", "land")
	      .attr("d", path);

	    svg.insert("path", ".graticule")
	      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
	      .attr("class", "boundary")
	      .attr("d", path);
	    

	    var line_generator = d3.line()
		    .x(function(track) { return projection([track.lat,track.lon])[0] ; })
		    .y(function(track) { return projection([track.lat,track.lon])[1]; });

	    var route_zuid_amerika = svg.append("path")
		    .attr("d",line_generator(track))
		    .attr("class","route");

	});
});


d3.select(self.frameElement).style("height", height + "px");