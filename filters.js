var filtered_data = data
var currentView='all'

// setupFilters builds the filter interface that appears next to the graph.
// also includes a landmark manager
var setupFilters= function(){

    // html for filter interface
    var filter_label = $("<div class='filters'><div class='filter-title'><big>Filters</big></div></div>")
    var timeFilterBar = $("<div id='time'>Time Range:<select class='time'><option value='all'>All</option><option value='compWeek'>Average Week</option><option value='2013-09-01T04:00:00Z,2013-09-08T04:00:00Z'>Week 1: 09/01 - 09/07</option><option value='2013-09-08T04:00:00Z,2013-09-15T04:00:00Z'>Week 2: 09/08 - 09/14</option><option value='2013-09-15T04:00:00,2013-09-22T04:00:00Z'>Week 3: 09/15 - 09/21</option><option value='2013-09-22T04:00:00Z,2013-09-29T04:00:00Z'>Week 4: 09/22 - 09/28</option></select></div>")
    var gradeFilter = $("<div id='grade-slider'><span class='grade-title'>Grade Range:</span></div><div><input type='text' id='amount' style='border: 0; color: #000000;'></input></div>")
    var zoom = $("<div id='zoom'>View:<select class='zoom'><option value='fit'>View All</option><option value='zoom'>Zoom in<option></select></div>")
    var landmark_manager = $("<div class='manager'><div class='manager-filter-title'><big>Landmark Manager</big></div></div>")
    var landmark = $("<div id='landmark'><u>New Landmark:</u></div>")
    var name = $("<div class='landmark-name-label'>Name:<input class='landmark-name' type='text'></input></div>")
    var date = $("<div class='landmark-date-label'>Date:<input class='landmark-date' type='text' placeholder='mm/dd/yyyy'></input></div>")
    var time = $("<div class='landmark-time-label'>Time:<input class ='landmark-time' type='text' placeholder='hh:mm'></input></div>")
    var submit = $("<button class='landmark-submit'>Create!</button>")
    var alert = $("<div class='landmark-alert'></div>")
    var remove_landmark = $("<div class='landmark-remove-label'><u>Remove Landmark:</u><select class='remove'></select><button class='remove-landmark'>Remove</button></div>")

    landmark.append(name, date, time, submit, alert)
    landmark_manager.append(landmark, remove_landmark)
    filter_label.append(timeFilterBar, gradeFilter, zoom)
    $('.filter-div').append(filter_label)
                    .append(landmark_manager)

    // create options in the landmark manager for preexisting landmarks drawn from due_dates
    // (an object in separate.js)
    for (var i in due_dates) {
        var nameValue = i.replace(/\s+/g,"");
        $('.remove').append($("<option class="+nameValue+" value='"+i+"'>"+i+"</option>"))
    }
    
    // add landmark to graph when it's created, check to make sure all fields are filled correctly
    $('.landmark-submit').on("click", function() {
        if ($('.landmark-name').val() !== "" && $('.landmark-date').val() !== "" && $('.landmark-time').val() !== "") {
            var name = $('.landmark-name').val()
            var nameValue = name.replace(/\s+/g,"");
            var date = $('.landmark-date').val().split("/")
            var time = $('.landmark-time').val().split(":")
            if (!isNaN(parseInt(date[0])) && !isNaN(parseInt(date[1])) && !isNaN(parseInt(date[2])) && !isNaN(parseInt(time[0])) && !isNaN(parseInt(time[1]))) {
                if (date.length == 3 && time.length == 2) {
                    if (date[2].length == 2) {
                        date[2] = "20" + date[2]
                    }
                    due_dates[name] = new Date(date[2], date[0]-1, date[1], time[0], time[1], 0, 0)
                    $('.remove').append($("<option class="+nameValue+" value='"+name+"''>"+name+"</option>"))
                    separate_charts.redraw(currentData)
                    $('.landmark-name').val("")
                    $('.landmark-date').val("")
                    $('.landmark-time').val("")
                    $(".landmark-alert").html("")
                }
            } else {
                $(".landmark-alert").html("Either your date or your time is incorrectly formatted. Please try again.")
            }
        } else {
            $(".landmark-alert").html("One or more fields are blank. Please fill them and try again.")
        }
    })
    
    // attach click handler to remove landmark button
    $('.remove-landmark').on("click", function() {
        var name = $('.remove').val()
        if (name !== undefined) {
            var nameValue = name.replace(/\s+/g,"");
            delete due_dates[name]
            $(".remove").find("."+nameValue).remove()
            separate_charts.redraw(currentData)
        }
    })
    
    // attach update functions to the grade slider - on slide it updates the values below the slider
    // and on stop it filters/redraws the chart
    $(function() {
        $( "#grade-slider" ).slider({
          range: true,
          min: 0,
          max: 100,
          values: [0, 100 ],
          slide: function(event, ui) {
            $( "#amount" ).val( + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
          },
          stop: function(event, ui) {
            applyFilters();
          }
        });
        $( "#amount" ).val( $( "#grade-slider" ).slider( "values", 0 ) +
          " - " + $( "#grade-slider" ).slider( "values", 1 ) );
  });

    // when the time filter is changed, filters are reapplied
    $('.time').on("change", applyFilters)

    // when the view changes, the chart is redrawn with whatever data it currently has.
    $('.zoom').on("change", function() {
        var zoom = $('.zoom').val()
        separate_charts.redraw(currentData, false, zoom)
    })
    
}

// applyFilters takes the data from the DOM elements set up in setupFilters
// and calls a chart redraw function
var applyFilters=function(){
    var filtered_data=$.extend(true, [], data)
    var timeFilter = $('.time').val()
    var start = new Date(timeFilter.split(',')[0])
    var end = new Date(timeFilter.split(',')[1])
    var upper = $( "#grade-slider" ).slider( "values", 1 )
    var lower = $( "#grade-slider" ).slider( "values", 0 )
    var oldView= currentView
    var zoom = $('.zoom').val()
    
    if (timeFilter != 'all'){
        currentView='compWeek'
        
        if (timeFilter == 'compWeek'){
            filtered_data = average([lower, upper])
        }
        else{
            filtered_data = filter_format([lower, upper], [start, end])
            }
    }
    else{
        currentView='all'
        filtered_data = filter_format([lower, upper], "all")
        
    }
     
    if (currentView==oldView){
        if (timeFilter == 'compWeek') {
            separate_charts.redraw(filtered_data, true, zoom)
        } else {
            separate_charts.redraw(filtered_data, false, zoom)
        }
    }
    else{
        if (timeFilter == 'compWeek') {
            $('.zoom').val("fit")
            separate_charts.redraw(filtered_data, true, "fit")
        } else {
            separate_charts.redraw(filtered_data, false, zoom)
        }
    }
                                    
}

$('document').ready(function(){
    setupFilters()
})