var filtered_data = data
var currentView='all'

//setupFilters builds the filter interface that appears below the graph.
var setupFilters= function(){
    var timeFilterBar = $("<div id='time'>Filter by Time<select class='time'><option value='all'>All</option><option value='compWeek'>Average Week</option><option value='2013-09-01T04:00:00,2013-09-08'>Week 1: 09/01 - 09/07</option><option value='2013-09-08T04:00:00,2013-09-15'>Week 2: 09/08 - 09/14</option><option value='2013-09-15T04:00:00,2013-09-22'>Week 3: 09/15 - 09/21</option><option value='2013-09-22T04:00:00,2013-09-29'>Week 4: 09/22 - 09/28</option></select></div>")
    var gradeFilter = $("<div id='grade-slider'><span class='grade-title'>Filter by Grade</span></div><div><input type='text' id='amount' style='border: 0; color: #000000;'></input></div>")
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
    var upper = $( "#grade-slider" ).slider( "values", 1 )
    var lower = $( "#grade-slider" ).slider( "values", 0 )
    var oldView= currentView
    
    if (timeFilter != 'all'){
        currentView='compWeek'
        
        if (timeFilter == 'compWeek'){
            filtered_data=weeklyCompile(filtered_data)
        }
        else{
            var start = new Date(timeFilter.split(',')[0])
            var end = new Date(timeFilter.split(',')[1])
            by_date.filterRange([start.valueOf(), end.valueOf()])
            filtered_data = by_date.top(Infinity)
            }
    }
    else{
        currentView='all'
        by_date.filterAll()
        filtered_data = by_date.top(Infinity)
        
    }
    by_grade.filterRange([lower, upper])
    filtered_data=by_grade.top(Infinity)
     
    if (currentView==oldView){
        if (timeFilter == 'compWeek') {
            separate_charts.redraw(data_process.averaged_data(format_separated_data(filtered_data), 5), true)
        } else {
            separate_charts.redraw(format_separated_data(filtered_data), false)
        }
    }
    else{
        if (timeFilter == 'compWeek') {
            separate_charts.setup(data_process.averaged_data(format_separated_data(filtered_data), 5), true)
        } else {
            separate_charts.setup(format_separated_data(filtered_data), false)
        }
    }
                                    
}

$('document').ready(function(){
    setupFilters()
})