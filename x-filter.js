//need:
//-date-range filter
//-grade filter
//-video "week" filter
console.log(data)
var cf_data = crossfilter(data)
// var by_type = cf_data.dimension(function(d) {return d.event_type;});
var by_grade = cf_data.dimension(function(d) {return d.grade;});
var by_date = cf_data.dimension(function(d) {return new Date(d.time).valueOf();});
// var by_video = cf_data.dimension(function(d) {return d.URL;});

