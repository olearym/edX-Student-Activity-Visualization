var filtered_data = data
var currentView='all'

//setupFilters builds the filter interface that appears below the graph.
var setupFilters= function(){
    var timeFilterBar = $("<div id='time'>Time Range:<select class='time'><option value='all'>All</option><option value='compWeek'>Average Week</option><option value='2013-09-01T04:00:00Z,2013-09-08T04:00:00Z'>Week 1: 09/01 - 09/07</option><option value='2013-09-08T04:00:00Z,2013-09-15T04:00:00Z'>Week 2: 09/08 - 09/14</option><option value='2013-09-15T04:00:00,2013-09-22T04:00:00Z'>Week 3: 09/15 - 09/21</option><option value='2013-09-22T04:00:00Z,2013-09-29T04:00:00Z'>Week 4: 09/22 - 09/28</option></select></div>")
    var gradeFilter = $("<div id='grade-slider'><span class='grade-title'>Grade Range:</span></div><div><input type='text' id='amount' style='border: 0; color: #000000;'></input></div>")
    var zoom = $("<div id='zoom'>View<select class='zoom'><option value='fit'>View All</option><option value='zoom'>Zoom in<option></select></div>")
    var landmark = $("<div id='landmark'>New Landmark:</div>")
    var name = $("<div class='landmark-name-label'>Name:<input class='landmark-name' type='text'></input></div>")
    var date = $("<div class='landmark-date-label'>Date:<input class='landmark-date' type='text' placeholder='(mm/dd/yyyy)'></input></div>")
    var time = $("<div class='landmark-time-label'>Time:<input class ='landmark-time' type='text' placeholder='hh:mm'></input></div>")
    var submit = $("<button class='landmark-submit'>Create!</button>")
    var remove_landmark = $("<div class='landmark-remove-label'>Remove Landmark:<select class='remove'></select><button class='remove-landmark'>Remove</button></div>")

    landmark.append(name, date, time, submit)
    $('.filter-div').append(timeFilterBar)
                    .append(gradeFilter)
                    .append(zoom)
                    .append(landmark)
                    .append(remove_landmark)
    for (var i in due_dates) {
        $('.remove').append($("<option value="+i+">"+i+"</option>"))
    }
    
    $('.landmark-submit').on("click", function() {
        var name = $('.landmark-name').val()
        var date = $('.landmark-date').val().split("/")
        var time = $('.landmark-time').val().split(":")
        if (date[2].length == 2) {
            date[2] = "20" + date[2]
        }
        due_dates[name] = new Date(date[2], date[0]-1, date[1], time[0], time[1], 0, 0)
        $('.remove').append($("<option value="+name+">"+name+"</option>"))
        separate_charts.redraw(currentData)
    })
    
    $(function() {
    $( "#grade-slider" ).slider({
      range: true,
      min: 0,
      max: 100,
      values: [0, 100 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      },
      stop: function(event, ui) {
        applyFilters();
      }
    });
    $( "#amount" ).val( $( "#grade-slider" ).slider( "values", 0 ) +
      " - " + $( "#grade-slider" ).slider( "values", 1 ) );
  });

    $('.time').on("change", applyFilters)
    $('.zoom').on("change", function() {
        var zoom = $('.zoom').val()
        separate_charts.redraw(currentData, false, zoom)
    })
    
}

// applyFilters takes the data from the DOM elements set up in setupFilters
// and calls a chart setup or redraw function
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