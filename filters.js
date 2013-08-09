var filtered_data = data
var currentView='all'

//setupFilters builds the filter interface that appears below the graph.
var setupFilters= function(){
    var timeFilterBar = $("<div id='time'>Filter by Time<select class='time'><option value='all'>All</option><option value='compWeek'>Compiled Weekly View</option><option value='2013-09-01,2013-09-07'>09/01 - 09/07</option><option value='2013-09-08,2013-09-14'>09/08 - 09/14</option><option value='2013-09-15,2013-09-21'>09/15 - 09/21</option><option value='2013-09-22,2013-09-28'>09/22 - 09/28</option></select></div>")
    var gradeFilter = $("<div id='grade-slider'><span class='grade-title'>Filter by Grade</span></div><div><input type='text' id='amount' style='border: 0; color: #000000;'></input></div>")
// var typeFilters = $('<div id="typeFilters"><form name="types" class="types"><input type="checkbox" class="video" name ="video" checked=true value="video">Show Video Events<br><input type="checkbox" name="problem" class="problem" checked=true value="problem">Show Problem Events</form></div>')
    var goButton = $("<button class='go btn' onclick='applyFilters()'>View Filtered Data</button>")
    $('.filter-div').append(timeFilterBar)
                    .append(gradeFilter)
// .append(typeFilters)
                    .append(goButton)
    
    
    
    $(function() {
    $( "#grade-slider" ).slider({
      range: true,
      min: 0,
      max: 100,
      values: [0, 100 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( $( "#grade-slider" ).slider( "values", 0 ) +
      " - " + $( "#grade-slider" ).slider( "values", 1 ) );
  });
    
    
}

//applyFilters takes the data from the DOM elements set up in setupFilters, and returns a list with the appropriate filters applied. It uses the list "data" defined in seperate.js as the base list.
var applyFilters=function(){
    var filtered_data=$.extend(true, [], data)
    var timeFilter = $('.time').val()
    var upper = $( "#grade-slider" ).slider( "values", 1 )
    var lower = $( "#grade-slider" ).slider( "values", 0 )
    var oldView= currentView
// var typesList = []
// if (types.video.checked==true){
// typesList.push('video')
// }
// if (types.problem.checked==true){
// typesList.push('problem')
// }
//
// filtered_data=sortByType(filtered_data,typesList)
    
    if (timeFilter != 'all'){
        currentView='compWeek'
        
        if (timeFilter == 'compWeek'){
            filtered_data=weeklyCompile(filtered_data)
        }
        else{
            var start = new Date(timeFilter.split(',')[0])
            var end = new Date(timeFilter.split(',')[1])
            filtered_data=getTimeRange(filtered_data,start,end)
            }
    }
    else{
        currentView='all'
        
    }
    
    filtered_data=sortByGrade(filtered_data,lower,upper)
     
    if (currentView==oldView){
        separate_charts.redraw(format_separated_data(filtered_data))
        }
    else{
        separate_charts.setup(format_separated_data(filtered_data))
    }
                                    
}

$('document').ready(function(){
    setupFilters()
})