var filtered_data = events_with_URL
var currentView='all'
var setupFilters= function(){
    var timeFilterBar = $("<div id='time'>Filter by Time<select class='time'><option value='all'>All</option><option value='compWeek'>Compiled Weekly View</option></select></div>")
    var gradeFilter = $("<div id='grade-slider'><span class='grade-title'>Filter by Grade</span></div><div><input type='text' id='amount' style='border: 0; color: #000000;'></input></div>")
//    var typeFilters = $('<div id="typeFilters"><form name="types" class="types"><input type="checkbox" class="video"  name ="video" checked=true value="video">Show Video Events<br><input type="checkbox" name="problem" class="problem" checked=true value="problem">Show Problem Events</form></div>')
    var goButton = $("<button class='go btn' onclick='applyFilters()'>View Filtered Data</button>")
    $('.filter-div').append(timeFilterBar)
                    .append(gradeFilter)
//                    .append(typeFilters)
                    .append(goButton)
    $(function() {
    $( "#grade-slider" ).slider({
      range: true,
      min: 50,
      max: 100,
      values: [ 50, 100 ],
      slide: function( event, ui ) {
        $( "#amount" ).val(  + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( $( "#grade-slider" ).slider( "values", 0 ) +
      " - " + $( "#grade-slider" ).slider( "values", 1 ) );
  });
    
    
}

var applyFilters=function(){
    var filtered_data=$.extend(true, [], events_with_URL)
    var timeFilter = $('.time').val()
    var upper = $( "#grade-slider" ).slider( "values", 1 )
    var lower = $( "#grade-slider" ).slider( "values", 0 )
    var oldView= currentView
//    var typesList = []
//    if (types.video.checked==true){
//        typesList.push('video')
//    }
//    if (types.problem.checked==true){
//        typesList.push('problem')
//    }
//    
//    filtered_data=sortByType(filtered_data,typesList)
    
    if (timeFilter == 'compWeek'){
        filtered_data=weeklyCompile(filtered_data)
        currentView='compWeek'
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