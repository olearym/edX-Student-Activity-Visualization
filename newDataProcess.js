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

var data = events_with_URL
var cf_data = crossfilter(data)
var by_grade = cf_data.dimension(function(d) {return d.grade;});
var by_date = cf_data.dimension(function(d) {return new Date(d.time).valueOf();});
var by_type = cf_data.dimension(function(d) {return eventValue(d.event_type);});

var organize = function() {

	by_type.filter(1)
	problem_data = by_type.top(Infinity)
	by_type.filterAll()
	by_type.filter(0)
	video_data = by_type.top(Infinity)

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
				if (minutes == undefined) {
					console.log(play, pause)
				}
			} else {
				var hour = new Date(video_data[i].time)
				round_date(hour)

				var play_minutes = (hour.getTime() - play.getTime())/60000
				var pause_minutes = (pause.getTime() - hour.getTime())/60000
				if (play_minutes == undefined || pause_minutes == undefined) {
					console.log(play, pause, hour)
				}

				video_data[unpaused[user][1]]["minutes"] = play_minutes
				video_data[i]["minutes"] = pause_minutes
			}
		}
	}

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

var nest_days = function(data) {
	console.log(data)
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

var count_events = function(days) {
	var out = []
	for (var i = 0; i < days.length; i++){
		for (var j = 0; j < days[i].values.length; j++) {
			out.push({y: days[i].values[j].values.length})
		}
	}
	return out
}

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

var new_data_format = function(all, time, grade) {
	var video_data = count_minutes(nest_days(all.video_data))
	var problem_data = count_events(nest_days(all.problem_data))
	var first_event = new Date(all.first_event.time)
	var last_event = new Date(all.last_event.time)

	return {"video_data": video_data,
			"problem_data": problem_data,
			"first_event": first_event, 
			"last_event": last_event}
}

