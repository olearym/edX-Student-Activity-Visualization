var filtered_data = generated_data_graded
var currentView='all'
var setupFilters= function(){
    var timeFilterBar = $("<div>Filter by Time<select class='time'><option value='all'>All</option><option value='compWeek'>Compiled Weekly View</option></select></div>")
    var gradeFilter = $("<div id='slider-range'>Filter by Grade</div><div><input type='text' id='amount' style='border: 0; color: #f6931f; font-weight: bold;'></input></div>")
    var goButton = $("<button class='go btn' onclick='applyFilters()'>View Filtered Data</button>")
    $('.filter-div').append(timeFilterBar)
                    .append(gradeFilter)
                    .append(goButton)
    $(function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 100,
      values: [ 0, 100 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 ) );
  });
    
    
}

var applyFilters=function(){
    filtered_data=generated_data_graded
    var timeFilter = $('.time').val()
    var upper = $('.upper').val()
    var lower=$('.lower').val()
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