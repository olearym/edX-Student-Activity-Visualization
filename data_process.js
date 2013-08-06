// contains functions for formatting raw data
var data_process = (function() {

	var exports = {};

	// sorts events into chronological order and separates them into different event types.
	// returns an object with event types as keys and arrays as values.
	var process_event_types = function(data) {

		var video_events = []
		var problem_events = []

		// sort events so they are ordered chronologically with the oldest event first
		data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});

		// put individual events into correct array
		for (var i = 0; i < data.length; i++) {
			if (data[i].event_type == "play_video" || data[i].event_type == "pause_video") {

				video_events.push(data[i]);

			} else if (data[i].event_type == "problem_check") {

				problem_events.push(data[i]);

			}
		}
		return {"video_events":video_events, "problem_events":problem_events}
	}

	var round_date = function(date) {
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

	}

	// takes an array of arrays containing chronologically sorted event objects
	// returns an array containing arrays of "y" values for each hour for each
	// array entered. Each entered array contains an array of events of different types.
	var format_events = function(events) {
		var out = {};

		// if the entered arrays do not have values, return an empty object. else, create arrays
		// to chart.
		if (events[0].length == 0 || events[1].length == 0) {

			return out;

		} else {

			// these two variables will be filled and returned
			var stacked_data = [];
			var total_events_by_hour = [];

			// find the first event and the input array containing it
			var first_event = new Date(events[0][0].time);
			var first_event_list = events[0];
			for (var index = 1; index < events.length; index++) {
				var looped_event = new Date(events[index][0].time);
				if (looped_event.getTime() < first_event.getTime()) {
					first_event = looped_event;
					first_event_type = events[index];
				}
			}
			round_date(first_event);

			// find the last event and the input array containing it
			var last_event = new Date(events[0][events[0].length - 1].time);
			var last_event_type = events[0];
			for (var index = 1; index < events.length; index++) {
				var looped_event = new Date(events[index][events[index].length - 1].time);
				if (looped_event.getTime() > last_event.getTime()) {
					last_event = looped_event;
					last_event_type = events[index];
				}
			}
			round_date(last_event);

			var events_by_hour = {};

			var first_day = new Date(first_event.getTime());
			first_day.setHours(0);
			var last_day = new Date(last_event.getTime());
			last_day.setHours(0);
			var num_days = Math.ceil((last_day.getTime() - first_day.getTime())/(3600 * 1000 * 24));

			for (var i = 0; i <= num_days; i++) {
				var ms_day = 3600*1000*24;
				
				var event_date = new Date(first_event.getTime() + i*ms_day);
				var event_day = (event_date.getMonth() + 1) +"/"+(event_date.getDate());
				events_by_hour[event_day] = {};

				for (var j = 0; j < 24; j++) {
			 		events_by_hour[event_day][j] = [];
			 	}
			}


			for (var index = 0; index < events.length; index++) {

				var num_events = [];
				var filled_events_by_hour = $.extend(true, {}, events_by_hour)

				// make events_by_hour
				// looks like {"date" : {0: [...], 1: [...], ...}}
				for (var i = 0; i < events[index].length; i++) {

					var event_date = new Date(events[index][i].time);
					var event_day = (event_date.getMonth() + 1) +"/"+event_date.getDate();
					var event_hour = event_date.getHours();

					filled_events_by_hour[event_day][event_hour].push(event);
				}

				// make num_events from events_by_hour
				for (var i in events_by_hour) {
					for (var j in events_by_hour[i]) {
						num_events.push({"y": filled_events_by_hour[i][j].length});
					}
				}

				total_events_by_hour.push(filled_events_by_hour);
				stacked_data.push(num_events);
			}

			out.stacked_data = stacked_data;
			out.events_by_hour = total_events_by_hour;
			out.first_event = first_event;
			out.last_event = last_event;
			return out;

		}
	}
		exports.round_date = round_date;
		exports.process_event_types = process_event_types;
		exports.format_events = format_events;

		return exports;
	
})();