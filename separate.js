
// object with assignment names as keys and Date objects as values, represents when assignments
// are due in the class. 
var due_dates = {"PSet 1": new Date(2013, 8, 10, 21, 0, 0, 0), "PSet 2": new Date(2013, 8, 20, 21, 0, 0, 0), "Quiz 1":new Date(2013, 8, 25, 18, 0, 0, 0)}

var format_separated_data = function(data) {
	var video_events = data_process.process_event_types(data).video_events;
	var problem_events = data_process.process_event_types(data).problem_events;

	var processed_data = data_process.format_events([problem_events, video_events]).stacked_data;
	var problem_data = processed_data[0];
	var video_data = processed_data[1];
	
	var first_event = data_process.format_events([problem_events, video_events]).first_event;
	var last_event = data_process.format_events([problem_events, video_events]).last_event;

	return {"problem_data": problem_data,
			"video_data": video_data,
			"first_event": first_event,
			"last_event": last_event};
}

var separate_charts = (function() {

	var exports = {};

	var outer_height = 300;
	var outer_width = 3000;

	var margin = { top: 20, right: 20, bottom: 20, left: 20 }

	var chart_width = outer_width - margin.left - margin.right;
	var chart_height = outer_height - margin.top - margin.bottom;

	// corresponds to data returned from format_separated_data
	var data_types = ["problem_data", "video_data"]

	var setup = function(data) {
		
		if (data.video_data.length < 200) {
			outer_width = 1200;
			chart_width = outer_width - margin.left - margin.right;
		}

		if(data.video_data.length > 200) {
			outer_width = 3000;
			chart_width = outer_width - margin.left - margin.right;
		}

		$('.chart').remove();
		$('.due-dates').remove();

		for (var i = 0; i < data_types.length; i++) {
			
			var separate_data = data[data_types[i]]

			var y_max = d3.max(separate_data, function(d) {return d.y;})

			var x_scale = d3.scale.ordinal()
							.domain(d3.range(separate_data.length)).rangeBands([0, chart_width]);
			var x_label_scale = d3.time.scale()
							.domain([data.first_event, data.last_event]).range([0, chart_width]).nice(d3.time.day);
			var y_scale = d3.scale.linear()
							.domain([0, y_max]).range([chart_height, 0]);

			var constant_labels = d3.select(".chart-div")
						.append("svg")
							.attr("class", "labels")
							.attr("class", data_types[i]+"_labels")
							.attr("height", outer_height)
							.attr("width", "10%")
						.append("g")
							.attr("class", "labels-holder")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			$(".chart-div").append($("<div class='chart-holder "+data_types[i]+"_chart'></div>"));

			// counters svg annoyingness when making new chart
			if ($("."+data_types[i]+"_labels").length > 1) {
				$("."+data_types[i]+"_labels")[1].parentNode.insertBefore($("."+data_types[i]+"_labels")[1],$("."+data_types[i]+"_labels")[1].parentNode.firstChild);
				$("."+data_types[i]+"_labels")[1].remove();
			}

			var chart_holder = d3.select("."+data_types[i]+"_chart")
			var chart = chart_holder.append("svg")
							.attr("class", "chart")
							.attr("height", outer_height)
							.attr("width", outer_width)
						.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			chart.selectAll("line").remove()

			chart.selectAll("line").data(y_scale.ticks(10))
				.enter().append("line")
					.attr("x1", 0)
					.attr("x2", chart_width)
					.attr("y1", y_scale)
					.attr("y2", y_scale)
					.attr("opacity", ".5");

			constant_labels.selectAll(".y-scale-label").data(y_scale.ticks(10))
				.enter().append("text")
					.attr("class", "y-scale-label")
					.attr("x", "60%")
					.attr("y", y_scale)
					.attr("text-anchor", "end")
					.attr("dy", "0.3em")
					.attr("dx", -margin.left/8)
					.attr("font-size", "9px")
					.text(String);

			var xAxis = d3.svg.axis()
			    .scale(x_label_scale)
			    .orient('bottom')
			    .ticks(d3.time.days, 1)
			    .tickFormat(d3.time.format('%a %d'))
			    .tickSize(0)
			    .tickPadding(50);
			
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

			for (date in due_dates) {
				var first_day = new Date(data.first_event.getTime())
				data_process.round_date(first_day)
				first_day.setHours(0)
				var diff_hours = Math.floor((due_dates[date].getTime() - first_day.getTime())/(3600*1000));

				var dueTick = chart.append("g")
								.attr("class", "date-tick")
								.attr("transform", 'translate('+x_scale.rangeBand() * (diff_hours)+', '+(chart_height+27)+')');
				var dueMark = chart.append("g")
								.attr("class", "date-tick")
								.attr("transform", 'translate('+x_scale.rangeBand() * (diff_hours)+', '+(chart_height+8)+')');
				dueMark.append("text")
					.attr("text-anchor", "middle")
					.attr('opacity', '.5')
					.text("|");
				dueTick.append('text')
					.attr("text-anchor", "middle")
					.attr('opacity', '.5')
					.text(date);
			}	
			var layer_group = chart.selectAll(".layer").data([separate_data])
								.enter().append('g')
									.attr("class", "layer")
									.style("fill", "blue");
			var rects = layer_group.selectAll("rect").data(function(d) {return d;})
							.enter().append("rect")
								.attr("x", function(d, i) { return x_scale(i) })
								.attr("y", function(d) {return y_scale(d.y)})
								.attr("width", x_scale.rangeBand())
								.attr("height", function(d) {return y_scale(0) - y_scale(d.y)})
		}

	}

	var redraw = function(data) {

		for (var i = 0; i < data_types.length; i++) {
			var separate_data = data[data_types[i]]

			var y_max = d3.max(separate_data, function(d) {return d.y;})

			var x_scale = d3.scale.ordinal()
							.domain(d3.range(separate_data.length)).rangeBands([0, chart_width]);
			var x_label_scale = d3.time.scale()
							.domain([data.first_event, data.last_event]).range([0, chart_width]).nice(d3.time.day);
			var y_scale = d3.scale.linear()
							.domain([0, y_max]).range([chart_height, 0]);

			d3.select("."+data_types[i]+"_chart").selectAll("line").remove()
			d3.select("."+data_types[i]+"_chart").selectAll("line").data(y_scale.ticks(10))
				.enter().append("line")
					.attr("x1", 0)
					.attr("x2", chart_width)
					.attr("y1", y_scale)
					.attr("y2", y_scale)
					.attr("opacity", ".5")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		}

	}

	exports.setup = setup
	exports.redraw = redraw
	return exports

})();

$(document).ready(function() {
	$(".chart-div").each(function() {
		separate_charts.setup(format_separated_data(generated_data_graded));
	})
})


