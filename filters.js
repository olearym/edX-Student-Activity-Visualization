var filtered_data = generated_data_graded
var currentView='all'
var setupFilters= function(){
    var timeFilterBar = $("<div id='time'>Filter by Time<select class='time'><option value='all'>All</option><option value='compWeek'>Compiled Weekly View</option></select></div>")
    var gradeFilter = $("<div id='grade-slider'><span class='grade-title'>Filter by Grade</span></div><div><input type='text' id='amount' style='border: 0; color: #333333;'></input></div>")
    var typeFilters = $("<div id='typeFilters'></div>")
    var goButton = $("<button class='go btn' onclick='applyFilters()'>View Filtered Data</button>")
    $('.filter-div').append(timeFilterBar)
                    .append(gradeFilter)
                    .append(goButton)
    $(function() {
    $( "#grade-slider" ).slider({
      range: true,
      min: 0,
      max: 100,
      values: [ 0, 100 ],
      slide: function( event, ui ) {
        $( "#amount" ).val(  + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( $( "#grade-slider" ).slider( "values", 0 ) +
      " - " + $( "#grade-slider" ).slider( "values", 1 ) );
  });
    
    
}

var applyFilters=function(){
    filtered_data=generated_data_graded
    var timeFilter = $('.time').val()
    var upper = $( "#grade-slider" ).slider( "values", 1 )
    var lower = $( "#grade-slider" ).slider( "values", 0 )
    var oldView= currentView
    if (timeFilter == 'compWeek'){
        filtered_data=weeklyCompile(filtered_data)
        currentView='compWeek'
    }
    else{
        currentView='all'
    }
    
    filtered_data=sortByGrade(filtered_data,lower,upper)
     
    if (currentView==oldView){
        stacked_chart.redraw(format_stackable_data(filtered_data))
        }
    else{
        stacked_chart.setup(format_stackable_data(filtered_data))
    }
    var filtered_data=generated_data_graded
                                    
}

$('document').ready(function(){
    setupFilters()
})