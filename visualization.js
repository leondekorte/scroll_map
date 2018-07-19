// wait untill page is loaded
window.document.addEventListener('DOMContentLoaded', load);

function load() {
	
    // throttle function
    function throttle (callback, limit) {
        var wait = false;                 // Initially, we're not waiting
        return function () {              // We return a throttled function
            if (!wait) {                  // If we're not waiting
                callback.call();          // Execute users function
                wait = true;              // Prevent future invocations
                setTimeout(function () {  // After a period of time
                    wait = false;         // And allow future invocations
                }, limit);
            }
        }
    }
	
	// array of all the triggers-ids
    var triggers = Array.from(window.document.querySelectorAll('[data-trigger-id]'));
    
    // map trigger id and margin to the top of window
    var triggerPositionMap = triggers.map(function (trigger) {
      return {
        id: trigger.dataset.triggerId,
        top: trigger.getBoundingClientRect().top,
      }
    });

	// load data from csv
    d3.csv("route.csv", function(error, track) {

		var browser_width = window.innerWidth;
		// var browser_height = window.innerHeight;

		var initial_offset = window.pageYOffset;

		var width = browser_width,
			height = 150;

		var projection = d3.geoMercator()
		    .scale(5*(width + 1) / 2 / Math.PI)
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

		var new_track = track.filter(function filter_data(d){ if (d['plaats'] <= 1) { return true; } });


		d3.json("world-50m.json", function(error, world) {
			    
		    svg.insert("path", ".graticule")
		      .datum(topojson.feature(world, world.objects.land))
		      .attr("class", "land")
		      .attr("d", path);

		    svg.insert("path", ".graticule")
		      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
		      .attr("class", "boundary")
		      .attr("d", path);
		    
			

		});
		

		// draw route
		var line_generator = d3.line()
			    .x(function(track) { return projection([track.lat,track.lon])[0] ; })
			    .y(function(track) { return projection([track.lat,track.lon])[1]; });

		var route_zuid_amerika = svg.append("path")
			    .attr("d",line_generator(new_track))
			    .attr("class","route");
		
		var update_map = function(event) {
      		

		    var lowestTriggerAboveThreshold;
		    var threshold = window.pageYOffset - initial_offset;
		      
		    // check which trigger is below the threshold
		    triggerPositionMap.forEach(function (trigger) {
		        if (trigger.top < threshold) {
		          if (!lowestTriggerAboveThreshold || trigger.top > lowestTriggerAboveThreshold.top) {
		            lowestTriggerAboveThreshold = trigger;
		        	}
		        }
		    });


			var new_track = track.filter(function filter_data(d){ if (d['plaats'] <= parseInt(lowestTriggerAboveThreshold.id)) { return true; } });
		    var route = d3.select(".route");
			
			route.remove();
			
			var route_zuid_amerika = svg.append("path")
			    .attr("d",line_generator(new_track))
			    .attr("class","route");
		    

		    console.log(lowestTriggerAboveThreshold.id);
		    // var dataToUse = dashboardData[0];

		    // if (lowestTriggerAboveThreshold) {

		    //     dataToUse = dashboardData[lowestTriggerAboveThreshold.id];
		    //     kosten_value.innerHTML = dataToUse['money'];
		    //     documenten_value.innerHTML = dataToUse['documents'];
		    //     displayEmoticon(dataToUse['frustratie']);
	        
	     //  	}



		};

		window.addEventListener('scroll', throttle( update_map, 100 ));


	});


	// d3.select(self.frameElement).style("height", height + "px");
}