// give event types numerical values so they can be filtered with crossfilter
// only specifically checks for play_video, pause_video, and problem_check, but all others
// are given a value of 2
var eventValue = function(event_type) {
	if (event_type == "play_video" || event_type == "pause_video") {
		return 0
	}
	else if (event_type == "problem_check") {
		return 1
	}
	else {
		return 2
	}
}

var round_date = function(date) {
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);

}

// data is currently randomly generated using a function from newDataGen.js
// this variable can be replaced with real data at some point in the future
var data = JSON.parse(makeFullData(200,200))

// separates data into video event data and problem event data 
// takes the argument "data", which is an array of event objects
// that follow the edX tracking logs format
// currently using randomly generated data, with each object having
// username, time, and event_type properties (video_play and video_pause
// events have a URL property as well - but this is unused in the current
// implementation of the chart)
// adds the "minutes" property to video events, assumes that every video_play
// event is followed by a video_pause event.
// if there are multiple video_play events before a video_pause event, it will use
// the last play event 
// returns the separated data and the first and last events
var organize = function(data) {

	// create a crossfilter for the data, give it an event_type dimension
	var cf_data = crossfilter(data)
	var by_type = cf_data.dimension(function(d) {return eventValue(d.event_type);});

	// create problem_data and video_data using crossfilter
	by_type.filter(1)
	problem_data = by_type.top(Infinity)
	by_type.filterAll()
	by_type.filter(0)
	video_data = by_type.top(Infinity)

	// sort problem_data and video_data so the events are in chronological order
	problem_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});
	video_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});

	// give each video event a "minutes" property. If both the play and
	// pause events occur in the same hour, the pause event contains all the minutes
	// if they occur in different hours, minutes before the hour change
	// are added to the play event and minutes after the hour change are added to
	// the pause event
	// currently minute values of over 60 minutes get set to zero, to avoid possible
	// problems if actual edX data is used
	var unpaused = {}
	for (var i = 0; i < video_data.length; i++) {
		var user = video_data[i].username
		var event_type = video_data[i].event_type

		if (event_type == "play_video") {
			unpaused[user] = [video_data[i], i]
		} else {
			var play = new Date(unpaused[user][0].time)
			var pause = new Date(video_data[i].time)
			var minutes = (pause.getTime() - play.getTime())/60000
			if (play.getHours() == pause.getHours()) {
				video_data[unpaused[user][1]]["minutes"] = 0
				video_data[i]["minutes"] = minutes
				if (minutes > 60) {
					video_data[i]["minutes"] = 0
				}
			} else {
				var hour = new Date(video_data[i].time)
				round_date(hour)

				var play_minutes = (hour.getTime() - play.getTime())/60000
				var pause_minutes = (pause.getTime() - hour.getTime())/60000

				video_data[unpaused[user][1]]["minutes"] = play_minutes
				video_data[i]["minutes"] = pause_minutes
				if (play_minutes > 60) {
					video_data[unpaused[user][1]]["minutes"] = 0
				}
				if (pause_minutes > 60) {
					video_data[i]["minutes"] = 0
				}
			}
		}
	}

	// find the first and last events of the data set
	var first_event =  video_data[0]
	if (new Date(problem_data[0].time).getTime() < new Date(video_data[0].time).getTime()) {
		first_event = problem_data[0]
	}
	var last_event = video_data[video_data.length - 1]
	if (new Date(problem_data[problem_data.length - 1].time).getTime() > new Date(video_data[video_data.length - 1].time).getTime()) {
		last_event = problem_data[problem_data.length - 1]
	}
	return {"video_data": video_data,
			"problem_data": problem_data,
			"first_event": first_event, 
			"last_event": last_event}
}

// double nests the data, first nesting is into days
// and second nesting is into hours
// if a day is not full, insert the missing hours at the correct index
// and give it a value of []
var nest_days = function(data) {
	var nest = d3.nest().key(function(d) {
		var event_date = new Date(d.time);
		return (event_date.getMonth() + 1) +"/"+event_date.getDate();
	}).key(function(d) {return new Date(d.time).getHours();})
		.entries(data)

	var day_hours= ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
	for (var i = 0; i < nest.length; i++) {
		if (nest[i].values.length < 24) {
			var hours = []
			for (var j = 0; j < nest[i].values.length; j++){
				hours.push(nest[i].values[j].key)
			}
			for (var j = 0; j < 24; j++) {
				if (hours.indexOf(day_hours[j]) == -1) {
					var empty_object = {key: day_hours[j], values: []}
					nest[i].values.splice(day_hours[j], 0, empty_object)
				}
			}
		}
	}
	return nest
}

// takes a nest of events and counts the number of events in each hour
// returns an array of objects with "y" attributes, used to graph with d3
// format of objects allows for creating stacked bar charts in d3
var count_events = function(days) {
	var out = []
	for (var i = 0; i < days.length; i++){
		for (var j = 0; j < days[i].values.length; j++) {
			out.push({y: days[i].values[j].values.length})
		}
	}
	return out
}

// takes a nest of video events and counts the number of minutes in each hour
// returns an array of objects with "y" attributes, used to graph with d3
// format of objects allows for creating stacked bar charts in d3
var count_minutes = function(days) {
	var out = []
	for (var i = 0; i < days.length; i++){
		for (var j = 0; j < days[i].values.length; j++) {
			var minutes = 0
			for (var k = 0; k < days[i].values[j].values.length; k++) {
				if (days[i].values[j].values[k].minutes !== undefined) {
					minutes += days[i].values[j].values[k].minutes
				}
			}
			out.push({y: minutes})
		}
	}
	return out
}

// "all" is an object in the form returned by organize
// returns an object with video and problem data in a format that separate_charts.setup
// can use
// problem_events and video_events are crossfilters of the separated data returned
// by organize, these are returned to be used the filter functions
var initial_format = function(all) {
	var video_data = count_minutes(nest_days(all.video_data))
	var problem_data = count_events(nest_days(all.problem_data))
	var video_events = crossfilter(all.video_data)
	var problem_events = crossfilter(all.problem_data)
	var first_event = new Date(all.first_event.time)
	var last_event = new Date(all.last_event.time)

	return {"video_data": video_data,
			"problem_data": problem_data,
			"first_event": first_event, 
			"last_event": last_event,
			"video_events": video_events,
			"problem_events": problem_events}
}

// takes a grade range (array of numbers between 0 and 100 of length 2)
// and a time range (array of Date objects of length 2)
var filter_format = function(grade_range, time_range) {

	if (time_range != "all") {
		p_date.filterRange(time_range)
		v_date.filterRange(time_range)
		var first_event = time_range[0]
		var last_event = time_range[1]
	} else {
		p_date.filterAll()
		v_date.filterAll()
		p_grade.filterAll()
		v_grade.filterAll()
		var int_problem_data = p_date.top(Infinity)
		var int_video_data = v_date.top(Infinity)
		int_problem_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});
		int_video_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});
		var first_event = new Date(int_problem_data[0].time)
		var last_event = new Date(int_problem_data[int_problem_data.length - 1].time)
		if (first_event.getTime() > new Date(int_video_data[0].time).getTime()) {
			first_event = new Date(int_video_data[0].time)
		}
		if (last_event.getTime() < new Date(int_video_data[int_video_data.length - 1].time).getTime()) {
			last_event = new Date(int_video_data[int_video_data.length - 1].time)
		}
	}
	p_grade.filterRange(grade_range)
	v_grade.filterRange(grade_range)
	var problem_data = p_grade.top(Infinity)
	var video_data = v_grade.top(Infinity)
	problem_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});
	video_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});
	problem_data = count_events(nest_days(problem_data))
	video_data = count_minutes(nest_days(video_data))
	if (problem_data.length !== video_data.length) {
		var small = problem_data
		var big = video_data
		if (problem_data.length > video_data.length) {
			small = video_data
			big = problem_data
		}
		var difference = big.length - small.length
		for (var i = 0; i < difference; i++) {
			small.splice(0,0, {"y": 0})
		}
	}
	return {"video_data": video_data,
			"problem_data": problem_data,
			"first_event": first_event, 
			"last_event": last_event}
}

// works like filter_format, but the two data sets it returns are only 168 hours long.
// the values for each of those hours is the average value of that hour over all the weeks in 
// the data set. first_event is the day of the first event in the data set, and last_event is one
// week later.
var average = function(grade_range) {
	p_grade.filterAll()
	v_grade.filterAll()
	p_date.filterAll()
	v_date.filterAll()
	p_grade.filterRange(grade_range)
	v_grade.filterRange(grade_range)
	var problem_data = p_grade.top(Infinity)
	var video_data = v_grade.top(Infinity)
	problem_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});
	video_data.sort(function(a,b){
		  a = new Date(a.time);
		  b = new Date(b.time);
		  return a<b?-1:a>b?1:0;
		});
	problem_data = count_events(nest_days(problem_data))
	video_data = count_minutes(nest_days(video_data))
	if (problem_data.length !== video_data.length) {
		var small = problem_data
		var big = video_data
		if (problem_data.length > video_data.length) {
			small = video_data
			big = problem_data
		}
		var difference = big.length - small.length
		for (var i = 0; i < difference; i++) {
			small.splice(0,0, {"y": 0})
		}
	}
	var weeks = Math.ceil(problem_data.length/(168))
	if (problem_data.length !== 0 && video_data.length !== 0) {
		for (var i = 0; i < 168; i++) {
			for (var j = 0; j < weeks; j++) {
				if (problem_data[j*i]["y"] !== undefined) {
					problem_data[i]["y"] = problem_data[j*i]["y"] + problem_data[i]["y"]
				}
				if (video_data[j*i]["y"] !== undefined) {
					video_data[i]["y"] = video_data[j*i]["y"] + video_data[i]["y"]
				}
			}
			video_data[i]["y"] = video_data[i]["y"]/weeks
			problem_data[i]["y"] = problem_data[i]["y"]/weeks
		}
	}
	video_data = video_data.slice(0, 168)
	problem_data = problem_data.slice(0, 168)
	var first_event = separated_data.first_event
	round_date(first_event)
	first_event.setHours(0)
	var last_event = new Date(first_event.getTime() + (3600 * 1000 * 24 * 7))
	return {"video_data": video_data,
			"problem_data": problem_data,
			"first_event": first_event, 
			"last_event": last_event}
}

