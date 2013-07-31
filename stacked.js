var data_process = (function() {

	var exports = {};

	var video_events = []
	var problem_events = []

	var process_event_types = function(data) {

		// sort events so they are ordered chronologically with the oldest event first
		data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});

		for (var i = 0; i < data.length; i++) {
			if (data[i].event_type == "play_video" || data[i].event_type == "pause_video") {

				video_events.push(data[i]);

			} else if (data[i].event_type == "problem_check") {

				problem_events.push(data[i]);

			}
		}
	}

	// takes an array of arrays containing chronologically sorted event objects
	// returns an array containing arrays of "y" values for each hour for each
	// array entered. Each entered array contains an array of events of different types.
	var format_events = function(events) {

		var out = {};
		var stacked_data = []
		var total_events_by_hour = []

		var first_event = new Date(events[0][0].time);
		for (var index = 1; index < events.length; index++) {
			var looped_event = new Date(events[index][0].time)
			if (looped_event.getTime() < first_event.getTime()) {
				first_event = looped_event
			}
		}
		
		for (var index = 0; index < events.length; index++) {
			var events_by_hour = {};
			var num_events = [];
			var hour_offset = Math.floor((new Date(events[index][0].time).getTime() - first_event.getTime())/(1000*3600));

			// make events_by_hour
			// looks like {"date" : {0: [...], 1: [...], ...}}
			for (var i = 0; i < events[index].length; i++) {
				
				var event = events[index][i];

				var event_date = new Date(event.time);
				var event_day = (event_date.getMonth() + 1) +"/"+event_date.getDate();
				var event_hour = event_date.getHours();

				if (events_by_hour[event_day] == undefined) {
					events_by_hour[event_day] = {};
				}
				if (events_by_hour[event_day][event_hour] == undefined) {
					for (var j = 0; j < 24; j++) {
						events_by_hour[event_day][j] = [];
					}
				}
				events_by_hour[event_day][event_hour].push(event);
			}

			//make num_events
			//fills array with "y" values, each "y" value corresponds to an hour
			for (var i = 0; i < hour_offset; i++) {
				num_events.push({"y": 0 });
			}
			for (var i = 0; i < events[index].length; i++) {

				var current_event = new Date(events[index][i].time)
				var current_event_hour = new Date(events[index][i].time).getHours();

				if (i == 0) {
					num_events.push( {"y": 1} );

				} else {

					var prev_event = new Date(events[index][i-1].time)
					var prev_event_hour = new Date(events[index][i-1].time).getHours();

					if (current_event_hour == prev_event_hour) {
						num_events[num_events.length - 1]["y"] += 1;
					} else {
						var ms_diff = Math.abs(current_event.getTime() - prev_event.getTime());
						var diffHours = Math.floor(ms_diff / (1000 * 3600))
						if (diffHours > 1) {
							for (var j = 1; j < diffHours; j++) {
								num_events.push( {"y": 0} );
							}
						}
						num_events.push( {"y": 1} );
					}

				}
			}
			total_events_by_hour.push(events_by_hour)
			stacked_data.push(num_events)
		}

		out.stacked_data = stacked_data
		out.events_by_hour = total_events_by_hour
		return out;

	}

	exports.process_event_types = process_event_types;
	exports.format_events = format_events;
	exports.video_events = video_events;
	exports.problem_events = problem_events;

	return exports

})();

data_process.process_event_types(generated_data)
var data = data_process.format_events([data_process.problem_events, data_process.video_events]).stacked_data

var stacked_chart = (function() {

	var exports = {};

	var outer_height = 300;
	var outer_width = 3000;

	var margin = { top: 20, right: 20, bottom: 20, left: 20 }

	var chart_width = outer_width - margin.left - margin.right
	var chart_height = outer_height - margin.top - margin.bottom

	var stack = d3.layout.stack();
	var stacked_data = stack(data)
	var y_stack_max = d3.max(stacked_data, function(layer) {
						return d3.max(layer, function(d) { return d.y +d.y0
						})
					});

	var y_group_max = d3.max(stacked_data, function(layer) { return d3.max(layer, function(d) { return d.y })})

	var x_scale = d3.scale.ordinal()
					.domain(d3.range(data[0].length)).rangeBands([0, chart_width]);
	var y_scale = d3.scale.linear()
					.domain([0, y_stack_max]).range([chart_height, 0]);
	var color = d3.scale.linear()
				    .domain([0, 2])
				    .range(["#aad", "#556"]);

	var setup = function() {

		var chart = d3.select(".chart-div")
						.append("svg")
							.attr("class", "chart")
							.attr("height", outer_height)
							.attr("width", outer_width)
						.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

		chart.selectAll("line").data(y_scale.ticks(10))
			.enter().append("line")
				.attr("x1", 0)
				.attr("x2", chart_width)
				.attr("y1", y_scale)
				.attr("y2", y_scale);

		chart.selectAll(".y-scale-label").data(y_scale.ticks(10))
			.enter().append("text")
				.attr("class", "y-scale-label")
				.attr("x", 0)
				.attr("y", y_scale)
				.attr("text-anchor", "end")
				.attr("dy", "0.3em")
				.attr("dx", -margin.left/8)
				.text(String);

		var layer_groups = chart.selectAll(".layer").data(stacked_data)
								.enter().append('g')
									.attr("class", "layer")
									.style("fill", function(d, i) { return color(i); });

		var rects = layer_groups.selectAll("rect").data(function(d) { return d; })
						.enter().append("rect")
							.attr("x", function(d, i) { return x_scale(i) })
							.attr("y", function(d) { return y_scale(d.y0 + d.y)})
							.attr("width", x_scale.rangeBand())
							.attr("height", function(d) {return y_scale(d.y0) - y_scale(d.y0 + d.y)})
	}

	exports.setup = setup

	return exports

})();

$(document).ready(function() {
	$(".chart-div").each(function() {
		stacked_chart.setup()
	})
})