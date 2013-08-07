var fake_videos = {"https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_3/Circuits_with_Nonlinear_Elements/": "Video 1",
					"https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_1/Administrivia_and_Circuit_Elements/": "Video 2",
					"https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_4/Week_4_Tutorials/": "Video 3",
					"https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_7/Speed_of_Digital_Circuits/": "Video 4",
					"https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_9/Undamped_Second-Order_Systems/": "Video 5"
}

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

	var make_events_by_hour = function(first_event, last_event) {

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

		return events_by_hour
	}

	// takes an array of arrays containing chronologically sorted event objects
	// returns an array containing arrays of "y" values for each hour for each
	// array entered. Each entered array contains an array of events of different types.
	var format_events = function(events) {
		var out = {};

		// if the entered arrays do not have values, return an empty object. else, create arrays
		// to chart.
		// if (events[0].length == 0 || events[1].length == 0) 

		// these two variables will be filled and returned
		var stacked_data = [];
		var total_events_by_hour = [];

		var first_event
		// find the first event and the input array containing it
		for (var index = 0; index < events.length; index++) {
			if (events[index][0] !== undefined) {
				first_event = new Date(events[index][0].time);
				break
			}
		}
		if (first_event == undefined) {
			var stacked_data = [] 
			for (var i = 0; i < events.length; i++) {
				stacked_data.push([])
			}
			out.stacked_data = stacked_data
			return out
		}
		
		var first_event_list = events[0];
		for (var index = 1; index < events.length; index++) {
			if (events[index][0] !== undefined) {
				var looped_event = new Date(events[index][0].time);
				if (looped_event.getTime() < first_event.getTime()) {
					first_event = looped_event;
					first_event_type = events[index];
				}
			}
		}
		round_date(first_event);

		// find the last event and the input array containing it
		var last_event = new Date(events[0][events[0].length - 1].time);
		var last_event_type = events[0];
		for (var index = 1; index < events.length; index++) {
			if (events[index][0] !== undefined) {
				var looped_event = new Date(events[index][events[index].length - 1].time);
				if (looped_event.getTime() > last_event.getTime()) {
					last_event = looped_event;
					last_event_type = events[index];
				}
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
		out.data = stacked_data
		return out;


	}

	// returns array of arrays, with each inside array corresponding to each video
	// this can be processed correctly by format_events
	var process_videos = function(video_data) {
		var out = {}
		var sorted_videos = {}
		var video_array = []

		for (var URL in fake_videos) {
			sorted_videos[URL] = []
		}

		for (var i = 0; i < video_data.length; i++) {
			URL = video_data[i].URL
			sorted_videos[URL].push(video_data[i])
		}

		for (var URL in fake_videos) {
			video_array.push(sorted_videos[URL])
		}
		return video_array
		

	}

	var video_minutes = function(problem_events, video_events) {
		var out = {};

		var stacked_data = [];
		var total_minutes_by_hour = [];

		var first_event = new Date(video_events[0].time);
		var last_event = new Date(video_events[video_events.length - 1].time);
		var first_video_event = video_events[0];
		if (new Date(problem_events[0].time).getTime() < new Date(first_event.time).getTime()) {
			first_event = new Date(problem_events[0].time);
		}
		if (new Date(problem_events[problem_events.length - 1].time).getTime() > new Date(last_event.time).getTime()) {
			last_event = new Date(problem_events[problem_events.length - 1].time);
		}

		round_date(first_event)
		round_date(last_event)

		var events_by_hour = make_events_by_hour(first_event, last_event);
		var filled_events_by_hour = $.extend(true, {}, events_by_hour)

		var unpaused_events = {}

		for (var i = 0; i < video_events.length; i++) {
			var num_minutes = []

			var event = video_events[i]
			var event_type = event.event_type
			var user = event.username

			if (event_type == "play_video") {
				unpaused_events[user] = event
			}
			else if (event_type = "pause_video") {
				var play_event = unpaused_events[user]
				var event_hour = new Date(event.time).getHours()
				var event_date = new Date(event.time);
				var event_day = (event_date.getMonth() + 1) +"/"+event_date.getDate();
				var play_event_hour = new Date(play_event.time).getHours()
				var minutes = (new Date(event.time).getTime() - new Date(play_event.time).getTime())/(60000)
				
				if (play_event_hour == event_hour) {
					filled_events_by_hour[event_day][event_hour].push(minutes)
				}
				else {
					var rounded_hour = new Date(event.time)
					round_date(rounded_hour)

					var before_minutes = (rounded_hour.getTime() - new Date(play_event.time).getTime())/(60000)
					var after_minutes = (new Date(event.time).getTime() - rounded_hour.getTime())/(60000)

					var event_day = (event_date.getMonth() + 1) +"/"+event_date.getDate();
					var play_event_date = new Date(play_event.time);
					var play_event_day = (play_event_date.getMonth() + 1) +"/"+event_date.getDate();

					filled_events_by_hour[event_day][event_hour].push(before_minutes)
					filled_events_by_hour[play_event_day][play_event_hour].push(after_minutes)
				}
			}

		}
		for (var i in events_by_hour) {
				for (var j in events_by_hour[i]) {
					var minutes = 0
					for (var k = 0; k < filled_events_by_hour[i][j].length; k++) {
						minutes += filled_events_by_hour[i][j][k]
					}
					num_minutes.push({"y": minutes});
				}
			}

		}

		exports.video_minutes = video_minutes;
		exports.process_videos = process_videos;
		exports.round_date = round_date;
		exports.process_event_types = process_event_types;
		exports.format_events = format_events;

		return exports;
	
})();

var test = function(data) {
	var video_events = data_process.process_event_types(data).video_events;
	var problem_events = data_process.process_event_types(data).problem_events;

	data_process.video_minutes(problem_events, video_events);
}

test(events_with_URL)


