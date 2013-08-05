var maxGrade=100
var sortByGrade = function(list,lower, upper){
    var filteredList=[]
    if (lower == ""){
        lower= 0
    }
    if (upper==""){
        upper=maxGrade
    }
    
    parseInt(lower)
    parseInt(upper)
    for (var i=0;i<list.length;i++){
        
        var grade = list[i]['grade']
        if ((lower<=grade)&&(grade<=upper)){
            filteredList.push(list[i])
        }
    }
    return filteredList
}

var sortByType=function(list, type){
    var newList=[]
    
    var videoTypes=['play_video','pause_video']
    var problemType=['
    if (type=='video'){
        for (i=0;i<list.length;i++){
            if (list[i]['event_type']==)
        }
    }
    
}

var weeklyCompile = function(list){
    var copyList = list
    for (var i=0;i<copyList.length;i++){
        var day = (new Date(copyList[i]['time'])).getDay()
        var time =copyList[i]['time'].split('T')[1]
        if (day==0){
            copyList[i]['time']= '2013-09-01T'+time 
        }
        if (day==1){
            copyList[i]['time']= '2013-09-02T'+time 
        }
        if (day==2){
            copyList[i]['time']= '2013-09-03T'+time 
        }
        if (day==3){
            copyList[i]['time']= '2013-09-04T'+time 
        }
        if (day==4){
            copyList[i]['time']= '2013-09-05T'+time 
        }
        if (day==5){
            copyList[i]['time']= '2013-09-06T'+time 
        }
        if (day==6){
            copyList[i]['time']= '2013-09-07T'+time 
        }
    }
    return copyList
    
}

var sortByWeek = function(list, startDate, endDate){
    var copyList = list
    for (var i=0;i<copyList.length;i++){
            }
}
