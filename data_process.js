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
	// returns an object with event types as keys and arrays of events as values.
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

	// rounds dates down to the hour.
	var round_date = function(date) {
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

	}

	// returns an object that looks like {Date: {0: [], 1: [], 2: [],....}}
	// each day between the day that the first event occurs and the day that
	// the last event occurs has 24 "hour" attributes, each containing an empty list.
	// first_event and last_event are JavaScript Date objects
	var make_events_by_hour = function(first_event, last_event) {

		var events_by_hour = {};

		// get JavaScript Date objects rounded down to the day for
		// both first_event and last_event
		var first_day = new Date(first_event.getTime());
		first_day.setHours(0);
		var last_day = new Date(last_event.getTime());
		last_day.setHours(0);

		// get the number of days between the first event and last event
		var num_days = Math.ceil((last_day.getTime() - first_day.getTime())/(3600 * 1000 * 24));

		// create each day
		for (var i = 0; i <= num_days; i++) {
			var ms_day = 3600*1000*24;
			
			var event_date = new Date(first_event.getTime() + i*ms_day);
			var event_day = (event_date.getMonth() + 1) +"/"+(event_date.getDate());
			events_by_hour[event_day] = {};

			// create 24 hours for this day
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


		// these two variables will be filled and returned
		var stacked_data = [];
		var total_events_by_hour = [];

		var first_event
		// find an event - if all input arrays are empty, first_event will remain undefined
		for (var index = 0; index < events.length; index++) {
			if (events[index][0] !== undefined) {
				first_event = new Date(events[index][0].time);
				break
			}
		}

		// if all input arrays are empty, format_events returns an array of empty arrays
		if (first_event == undefined) {
			var stacked_data = [] 
			for (var i = 0; i < events.length; i++) {
				stacked_data.push([])
			}
			out.stacked_data = stacked_data
			return out
		}

		// find the first event
		for (var index = 1; index < events.length; index++) {
			if (events[index][0] !== undefined) {
				var looped_event = new Date(events[index][0].time);
				if (looped_event.getTime() < first_event.getTime()) {
					first_event = looped_event;
				}
			}
		}
		round_date(first_event);

		// find the last event
		var last_event = new Date(events[0][events[0].length - 1].time);
		var last_event_type = events[0];
		for (var index = 1; index < events.length; index++) {
			if (events[index][0] !== undefined) {
				var looped_event = new Date(events[index][events[index].length - 1].time);
				if (looped_event.getTime() > last_event.getTime()) {
					last_event = looped_event;
				}
			}
		}
		round_date(last_event);

		// create an object with days and hours, the hours will be filled
		// with event objects
		var events_by_hour = make_events_by_hour(first_event, last_event)

		// loop through each group of events in the input array
		for (var index = 0; index < events.length; index++) {

			var num_events = [];
			// copy events_by_hour so it can be modified but can be used again in
			// the next iteration
			var filled_events_by_hour = $.extend(true, {}, events_by_hour)

			// fill filled_events_by_hour with events
			for (var i = 0; i < events[index].length; i++) {

				var event_date = new Date(events[index][i].time);
				var event_day = (event_date.getMonth() + 1) +"/"+event_date.getDate();
				var event_hour = event_date.getHours();

				filled_events_by_hour[event_day][event_hour].push(event);
			}

			// make num_events from events_by_hour - counts the number of events in each hour
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
	// this can be processed correctly by format_events and video_minutes
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

	// works like format_events, except instead of counting the number of events,
	// counts the number of minutes of video watched per hour
	var video_minutes = function(problem_events, video_events) {
		var out = {};

		var stacked_data = [];
		var total_minutes_by_hour = [];
		var events = [problem_events, video_events]

		var first_event
		for (var index = 0; index < events.length; index++) {
			if (events[index][0] !== undefined) {
				first_event = new Date(events[index][0].time);
				break
			}
		}
		var first_video_event 
		if (video_events[0] !== undefined) {
			first_video_event = video_events[0][0]
		}
		if (first_event == undefined || first_video_event == undefined) {
			var stacked_data = [] 
			for (var i = 0; i < events.length; i++) {
				stacked_data.push([])
			}
			out.stacked_data = stacked_data
			return out
		}

		for (var i = 0; i< video_events.length; i++) {
			if (new Date(video_events[i][0].time).getTime() < first_event.getTime()) {
				first_event = new Date(video_events[i][0].time);
			}
		}

		var last_event = new Date(video_events[0][video_events[0].length - 1].time);
		for (var i = 0; i< video_events.length; i++) {
			if (new Date(video_events[i][video_events[i].length - 1].time).getTime() > last_event.getTime()) {
				last_event = new Date(video_events[i][video_events[i].length - 1].time);
			}
		}
		if (new Date(problem_events[0].time).getTime() < first_event.getTime()) {
			first_event = new Date(problem_events[0].time);
		}
		if (new Date(problem_events[problem_events.length - 1].time).getTime() > last_event.getTime()) {
			last_event = new Date(problem_events[problem_events.length - 1].time);
		}

		round_date(first_event)
		round_date(last_event)

		var events_by_hour = make_events_by_hour(first_event, last_event);
		var stacked_data = []

		for (var index = 0; index < video_events.length; index++) {
			var filled_events_by_hour = $.extend(true, {}, events_by_hour)

			var unpaused_events = {}

			for (var i = 0; i < video_events[index].length; i++) {
				var num_minutes = []

				var event = video_events[index][i]
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

					if (play_event == undefined) {
						play_event = event
						var play_event_date = new Date(play_event.time)
						round_date(play_event_date)
						var minutes = (new Date(event.time).getTime() - play_event_date.getTime())/(60000)
					} else {
						var minutes = (new Date(event.time).getTime() - new Date(play_event.time).getTime())/(60000)
					}

					var play_event_hour = new Date(play_event.time).getHours()

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
						if (filled_events_by_hour[play_event_day] !== undefined) {
							filled_events_by_hour[play_event_day][play_event_hour].push(after_minutes)
						} else {
							console.log(play_event_day, play_event_date, event_date)
						}
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
			stacked_data.push(num_minutes)
			}
			out.stacked_data = stacked_data;
			out.first_event = first_event;
			out.last_event = last_event;
			out.data = stacked_data
			return out;
		}

		var averaged_data = function(formatted_data, weeks) {
			var problem_data = formatted_data.problem_data
			var video_data = formatted_data.video_data

			for (var i = 0; i < problem_data.length; i++) {
				problem_data[i].y = problem_data[i].y/weeks
			}

			for (var i = 0; i < video_data.stacked_data.length; i++) {
				for (var j = 0; j < video_data.stacked_data[i].length; j++){
					video_data.stacked_data[i][j].y = video_data.stacked_data[i][j].y/weeks
				}
			}

			return {"problem_data": problem_data, 
					"video_data": video_data, 
					"first_event": formatted_data.first_event,
					"last_event": formatted_data.last_event}
		}

		exports.video_minutes = video_minutes;
		exports.process_videos = process_videos;
		exports.round_date = round_date;
		exports.process_event_types = process_event_types;
		exports.format_events = format_events;
		exports.averaged_data = averaged_data;

		return exports;
	
})();

// var test = function(data) {
// 	var video_events = data_process.process_event_types(data).video_events;
// 	var problem_events = data_process.process_event_types(data).problem_events;
// 	console.log(data_process.process_videos(video_events))

// 	console.log(data_process.video_minutes(problem_events, data_process.process_videos(video_events)));
// }

// test(events_with_URL)


