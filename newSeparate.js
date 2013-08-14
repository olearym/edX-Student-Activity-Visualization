// object with assignment names as keys and Date objects as values, represents when assignments
// are due in the class. 
var due_dates = {"PSet 1": new Date(2013, 8, 10, 21, 0, 0, 0), "PSet 2": new Date(2013, 8, 20, 21, 0, 0, 0), "Quiz 1":new Date(2013, 8, 25, 18, 0, 0, 0)}

// takes a raw data variable and applies several functions from data_process in order to return
// an object with all of the information needed to chart the data.
// see data_process.js for function explanations
var format_separated_data = function(data) {
	var video_events = data_process.process_event_types(data).video_events;
	var problem_events = data_process.process_event_types(data).problem_events;

	var processed_data = data_process.format_events([problem_events, video_events]).stacked_data;
	var problem_data = processed_data[0];
	var video_data = data_process.video_minutes(problem_events, data_process.process_videos(video_events));
	
	var first_event = data_process.format_events([problem_events, video_events]).first_event;
	var last_event = data_process.format_events([problem_events, video_events]).last_event;
	console.log("Old data format:", problem_data, video_data, first_event, last_event)
	return {"problem_data": problem_data,
			"video_data": video_data,
			"first_event": first_event,
			"last_event": last_event};
}

// contains function to create separate charts for video and problem events
var separate_charts = (function() {

	var exports = {};

	// sizes of individual charts
	var outer_height = 200;
	var outer_width = 3000;

	var margin = { top: 20, right: 20, bottom: 20, left: 20 }

	var chart_width = outer_width - margin.left - margin.right;
	var chart_height = outer_height - margin.top - margin.bottom;

	// corresponds to data returned from format_separated_data
	var data_types = ["problem_data", "video_data"]

	// data is the data object returned by a data_process function, average is a boolean value representing
	// whether or not the data being charted is averaged over multiple weeks or not
	var setup = function(data, average) {

		// set chart width depending on how long of a data set we are charting
		if (data.problem_data.length < 200) {
			outer_width = 900;
			chart_width = outer_width - margin.left - margin.right;
		}

		if(data.problem_data.length > 200) {
			outer_width = 3000;
			chart_width = outer_width - margin.left - margin.right;
		}

		// because setup is called to regraph data sometimes, remove any existing chart
		$('.chart-div').children().remove();
		$('.due-dates').remove();

		// loop through data_types - created this way to support additional data types
		for (var i = 0; i < data_types.length; i++) {
			
			var separate_data = data[data_types[i]]

			var y_max = d3.max(separate_data, function(d) {return d.y;})

			var x_scale = d3.scale.ordinal()
							.domain(d3.range(separate_data.length)).rangeBands([0, chart_width]);
			var x_label_scale = d3.time.scale()
							.domain([data.first_event, data.last_event]).range([0, chart_width]).nice(d3.time.day);
			var y_scale = d3.scale.linear()
							.domain([0, y_max]).range([chart_height, 0]);
			var color = d3.scale.linear()
					    .domain([0, 2])
					    .range(["#aad", "#556"]);

			// create a container for y-axis markings. This is recreated each time the graph is redrawn.
			var constant_labels = d3.select(".chart-div")
						.append("svg")
							.attr("class", "labels")
							.attr("class", data_types[i]+"_labels")
							.attr("height", outer_height)
							.attr("width", "10%")
						.append("g")
							.attr("class", "labels-holder")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			if (i == 0) {
				$(".chart-div").append($("<div class='all-charts-holder'></div>"))
			}

			// create container for the chart, giving it a class with the data type name so it can
			// be selected easily
			$(".all-charts-holder").append($("<div class='chart-holder "+data_types[i]+"_chart'></div>"));

			// counters svg annoyingness when making new chart - moves new labels to the front and deletes old
			// labels if somehow previously existing labels weren't deleted.
			// may not be needed.
			if ($("."+data_types[i]+"_labels").length > 1) {
				$("."+data_types[i]+"_labels")[1].parentNode.insertBefore($("."+data_types[i]+"_labels")[1],$("."+data_types[i]+"_labels")[1].parentNode.firstChild);
				$("."+data_types[i]+"_labels")[1].remove();
			}

			// create svg chart
			var chart_holder = d3.select("."+data_types[i]+"_chart")
			var chart = chart_holder.append("svg")
							.attr("class", "chart")
							.attr("height", outer_height)
							.attr("width", outer_width)
						.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			chart.selectAll("line").remove()

			// make y axis lines
			chart.selectAll("line").data(y_scale.ticks(10))
				.enter().append("line")
					.attr("class", "y-tick")
					.attr("x1", 0)
					.attr("x2", chart_width)
					.attr("y1", y_scale)
					.attr("y2", y_scale)
					.attr("opacity", ".5");

			// make y axis number labels
			constant_labels.selectAll(".y-scale-label").data(y_scale.ticks(10))
				.enter().append("text")
					.attr("class", "y-scale-label")
					.attr("x", "50%")
					.attr("y", y_scale)
					.attr("text-anchor", "end")
					.attr("dy", "0.3em")
					.attr("dx", -margin.left/8)
					.attr("font-size", "9px")
					.text(String);

			// make day labels for x axis
			if (!average) {
				var xAxis = d3.svg.axis()
				    .scale(x_label_scale)
				    .orient('bottom')
				    .ticks(d3.time.days, 1)
				    .tickFormat(d3.time.format('%a %d'))
				    .tickSize(0)
				    .tickPadding(50);
			} else {
				var xAxis = d3.svg.axis()
				    .scale(x_label_scale)
				    .orient('bottom')
				    .ticks(d3.time.days, 1)
				    .tickFormat(d3.time.format('%A'))
				    .tickSize(0)
				    .tickPadding(50);
			}
			
			var xTicks = d3.svg.axis()
			    .scale(x_label_scale)
			    .orient('bottom')
			    .ticks(d3.time.hours, 12)
			    .tickFormat("|")
			    .tickSize(0)
			    .tickPadding(41);


			chart.append('g')
				.attr("class", "due-dates")
				.attr('transform', 'translate(0, ' + (chart_height - margin.top - margin.bottom) + ')');

			chart.selectAll('.x-axis').remove();
			chart.selectAll('.x-ticks').remove();

			chart.append('g')
			    .attr('class', 'x-axis')
			    .attr('transform', 'translate(0, ' + (chart_height - margin.top - margin.bottom) + ')')
			    .call(xAxis);	

			chart.append('g')
			    .attr('class', 'x-ticks')
			    .attr('transform', 'translate(0, ' + (chart_height - margin.top - margin.bottom) + ')')
			    .attr('opacity', '.3')
			    .call(xTicks);

			// create week landmark lines
			if (data.problem_data.length > 200) {
				chart.selectAll(".week-label").data(x_label_scale.ticks(d3.time.weeks, 1))
				.enter().append("line")
					.attr("x1", x_label_scale)
					.attr("x2", x_label_scale)
					.attr("y1", chart_height + 5)
					.attr("y2", 0)
					.attr("opacity", ".5");

			chart.selectAll(".week-label").data(x_label_scale.ticks(d3.time.weeks, 1))
				.enter().append("text")
					.attr("x", x_label_scale)
					.attr("y", -3)
					.attr("opacity", ".5")
					.text(function(d, i) {return "Week " + (i+1);});
			}

			// create landmark line for each assignment
			for (date in due_dates) {
				var first_day = new Date(data.first_event.getTime())
				round_date(first_day)
				first_day.setHours(0)
				var diff_hours = Math.floor((due_dates[date].getTime() - first_day.getTime())/(3600*1000));
				var dueTick = chart.append("g")
								.attr("class", "date-tick")
								.attr("transform", 'translate('+x_scale.rangeBand() * (diff_hours)+', '+(-4)+')');
				var dueMark = chart.append("g")
								.attr("class", "date-tick")
								.attr("transform", 'translate('+x_scale.rangeBand() * (diff_hours)+', '+(chart_height+8)+')');
				dueMark.append("line")
					.attr("y1", -10)
					.attr("y2", -chart_height - 5)
					.attr("opacity", ".8");

				dueTick.append('text')
					.attr("text-anchor", "middle")
					.attr('opacity', '.5')
					.text(date);
			}	
			
			// create y-axis label and bars for problem data chart
				if (data_types[i] == "problem_data") {
					constant_labels.append("text")
			        .attr("transform", "rotate(-90)")
			        .attr("y", -10)
			        .attr("x", 0 - (outer_height / 2) + 15)
			        .attr("dy", "1em")
			        .style("text-anchor", "middle")
			        .text("Problem Attempts");
				} else {
					constant_labels.append("text")
			        .attr("transform", "rotate(-90)")
			        .attr("y", -10)
			        .attr("x", 0 - (outer_height / 2) + 15)
			        .attr("dy", "1em")
			        .style("text-anchor", "middle")
			        .text("Minutes of Video Watched");
				}

				var layer_group = chart.selectAll(".layer").data([separate_data])
								.enter().append('g')
									.attr("class", "layer")
									.style("fill", color(i));

				var rects = layer_group.selectAll("rect").data(function(d) {return d;})
								.enter().append("rect")
									.attr("x", function(d, i) { return x_scale(i) })
									.attr("y", function(d) {return y_scale(d.y)})
									.attr("width", x_scale.rangeBand())
									.attr("height", function(d) {return y_scale(0) - y_scale(d.y)})			
		}
		return {"video_events": data.video_events, "problem_events": data.problem_events}

	}
	// called when data is filtered
	var redraw = function(data, average) {

		for (var i = 0; i < data_types.length; i++) {
			
			// data.first_event is undefined if the filtered data set is empty.
			// sets all bars to zero but doesn't change any labels.
			if (data.video_data.length == 0 && data.problem_data.length == 0) {

				var layer_groups = d3.select("."+data_types[i]+"_chart").select('.chart').selectAll(".layer")
			
				layer_groups.selectAll("rect")
					.transition()
					.duration(2000)
					.attr("height", 0)
					.attr("y", chart_height)

			} else {
				
				var separate_data = data[data_types[i]]

				var y_max = d3.max(separate_data, function(d) {return d.y;})

				var x_scale = d3.scale.ordinal()
								.domain(d3.range(separate_data.length)).rangeBands([0, chart_width]);
				var x_label_scale = d3.time.scale()
								.domain([data.first_event, data.last_event]).range([0, chart_width]).nice(d3.time.day);
				var y_scale = d3.scale.linear()
								.domain([0, y_max]).range([chart_height, 0]);

				var chart_holder = d3.select("."+data_types[i]+"_chart")

				var chart = chart_holder.select(".chart")
				

				// redraw y-axis tickmarks
				//d3.select("."+data_types[i]+"_chart").selectAll("line").remove()

				chart.selectAll(".y-tick line").data(y_scale.ticks(10))
					.enter().append("line")
						.attr("class", "y-tick")
						.attr("x1", 0)
						.attr("x2", chart_width)
						.attr("y1", 0)
						.attr("y2", 0)
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


				chart.selectAll(".y-tick").data(y_scale.ticks(10))
					.transition()
					.duration(2000)
						.attr("y1", y_scale)
						.attr("y2", y_scale)
						.attr("opacity", ".5")

				chart.selectAll(".y-tick").data(y_scale.ticks(10)).exit().remove()


				d3.select("."+data_types[i]+"_labels").selectAll(".y-scale-label").remove()
				d3.select("."+data_types[i]+"_labels").selectAll("labels-holder").remove()

				d3.select("."+data_types[i]+"_labels").selectAll(".y-scale-label").data(y_scale.ticks(10))
					.enter().append("text")
						.attr("class", "y-scale-label")
						.attr("x", "50%")
						.attr("y", y_scale)
						.attr("text-anchor", "end")
						.attr("dy", "0.3em")
						.attr("dx", -margin.left/8)
						.attr("font-size", "9px")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
						.text(String);

				// redraw x-axis
				chart.selectAll('.x-axis').remove();
				chart.selectAll('.x-ticks').remove();

				if (!average) {
					var xAxis = d3.svg.axis()
					    .scale(x_label_scale)
					    .orient('bottom')
					    .ticks(d3.time.days, 1)
					    .tickFormat(d3.time.format('%a %d'))
					    .tickSize(0)
					    .tickPadding(50);
				} else {
					var xAxis = d3.svg.axis()
					    .scale(x_label_scale)
					    .orient('bottom')
					    .ticks(d3.time.days, 1)
					    .tickFormat(d3.time.format('%A'))
					    .tickSize(0)
					    .tickPadding(50);
				}
				
				var xTicks = d3.svg.axis()
				    .scale(x_label_scale)
				    .orient('bottom')
				    .ticks(d3.time.hours, 12)
				    .tickFormat("|")
				    .tickSize(0)
				    .tickPadding(41);

				 chart.append('g')
				    .attr('class', 'x-axis')
				    .attr('transform', 'translate(20, ' + (chart_height - margin.top) + ')')
				    .call(xAxis);	

				chart.append('g')
				    .attr('class', 'x-ticks')
				    .attr('transform', 'translate(20, ' + (chart_height - margin.top) + ')')
				    .attr('opacity', '.3')
				    .call(xTicks);

				chart.selectAll(".date-tick").remove()
				for (date in due_dates) {
					var first_day = new Date(data.first_event.getTime())
					round_date(first_day)
					first_day.setHours(0)
					if (data.problem_data.length > 200) {
						var diff_hours = Math.floor((due_dates[date].getTime() - first_day.getTime())/(3600*1000)) + 5;
					} else {
						var diff_hours = Math.floor((due_dates[date].getTime() - first_day.getTime())/(3600*1000)) + 3;
					}
					var dueTick = chart.append("g")
									.attr("class", "date-tick")
									.attr("transform", 'translate('+x_scale.rangeBand() * (diff_hours)+', '+(16)+')');
					var dueMark = chart.append("g")
									.attr("class", "date-tick")
									.attr("transform", 'translate('+x_scale.rangeBand() * (diff_hours)+', '+(chart_height+14)+')');
					dueMark.append("line")
						.attr("y1", 0)
						.attr("y2", -chart_height + 5)
						.attr("opacity", ".8");

					dueTick.append('text')
						.attr("text-anchor", "middle")
						.attr('opacity', '.5')
						.text(date);
				}


				// resize bars based on filtered data
				var layer_group = chart.selectAll(".layer").data([separate_data])

				layer_group.selectAll("rect").data(function(d) {return d;})
					.enter().append("rect")
						.attr("x", function(d, i) { return x_scale(i) })
						.attr("y", function(d) {return y_scale(d.y0 + d.y)})
						.attr("width", x_scale.rangeBand())

				var rects = layer_group.selectAll("rect").data(function(d) {return d;})
							.transition()
							.duration(2000)
						 		.attr("x", function(d, i) { return x_scale(i) })
								.attr("y", function(d) {return y_scale(d.y)})
								.attr("width", x_scale.rangeBand())
								.attr("height", function(d) {return y_scale(0) - y_scale(d.y)})

				layer_group.selectAll("rect").data(function(d) {return d;})
					.exit().remove();
			}
		}

	}

	exports.setup = setup
	exports.redraw = redraw
	return exports

})();

var all = organize()
var separated_data
var p_grade
var p_date
var v_grade
var v_date

$(document).ready(function() {
	$(".chart-div").each(function() {
		separated_data = separate_charts.setup(initial_format(all));
		p_grade = separated_data.problem_events.dimension(function(d) {return d.grade;})
		p_date = separated_data.problem_events.dimension(function(d) {return new Date(d.time).valueOf();});
		v_grade = separated_data.video_events.dimension(function(d) {return d.grade;})
		v_date = separated_data.video_events.dimension(function(d) {return new Date(d.time).valueOf();});
	})
})


