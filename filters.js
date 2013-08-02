var filtered_data = generated_data
var currentView='all'
var setupFilters= function(){
    var timeFilterBar = $("<div>Filter by Time<select class='time'><option value='all'>All</option><option value='compWeek'>Compiled Weekly View</option></select></div>")
    var gradeFilter = $("<div>Filter by Grade<input class='lower' placeholder='Lower limit'></input><input class='upper' placeholder='Upper limit'></input></div>")
    var goButton = $("<button class='go btn' onclick='applyFilters()'>View Filtered Data</button>")
    $('.filter-div').append(timeFilterBar)
                    .append(gradeFilter)
                    .append(goButton)
    
}

var applyFilters=function(){
    filtered_data=generated_data
    var timeFilter = $('.time').val()
    var upper = parseInt($('.upper').val())
    var lower=parseInt($('.lower').val())
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
    var filtered_data=generated_data
                                    
}

$('document').ready(function(){
    setupFilters()
})