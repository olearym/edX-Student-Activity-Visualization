var filtered_data = data
var currentView='all'

//setupFilters builds the filter interface that appears below the graph.
var setupFilters= function(){
    var timeFilterBar = $("<div id='time'>Time Range:<select class='time'><option value='all'>All</option><option value='compWeek'>Average Week</option><option value='2013-09-01T04:00:00Z,2013-09-08T04:00:00Z'>Week 1: 09/01 - 09/07</option><option value='2013-09-08T04:00:00Z,2013-09-15T04:00:00Z'>Week 2: 09/08 - 09/14</option><option value='2013-09-15T04:00:00,2013-09-22T04:00:00Z'>Week 3: 09/15 - 09/21</option><option value='2013-09-22T04:00:00Z,2013-09-29T04:00:00Z'>Week 4: 09/22 - 09/28</option></select></div>")
    var gradeFilter = $("<div id='grade-slider'><span class='grade-title'>Grade Range:</span></div><div><input type='text' id='amount' style='border: 0; color: #000000;'></input></div>")
    $('.filter-div').append(timeFilterBar)
                    .append(gradeFilter)
    
    
    
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
    
}

//applyFilters takes the data from the DOM elements set up in setupFilters, and returns a list with the appropriate filters applied. It uses the list "data" defined in seperate.js as the base list.
var applyFilters=function(){
    var filtered_data=$.extend(true, [], data)
    var timeFilter = $('.time').val()
    var start = new Date(timeFilter.split(',')[0])
    var end = new Date(timeFilter.split(',')[1])
    var upper = $( "#grade-slider" ).slider( "values", 1 )
    var lower = $( "#grade-slider" ).slider( "values", 0 )
    var oldView= currentView
    
    if (timeFilter != 'all'){
        currentView='compWeek'
        
        if (timeFilter == 'compWeek'){
            filtered_data=weeklyCompile(filtered_data)
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
            separate_charts.redraw(filtered_data)
        } else {
            separate_charts.redraw(filtered_data)
        }
    }
    else{
        if (timeFilter == 'compWeek') {
            separate_charts.setup(filtered_data)
        } else {
            separate_charts.setup(filtered_data)
        }
    }
                                    
}

$('document').ready(function(){
    setupFilters()
})