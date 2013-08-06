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

var sortByType=function(list, types){
    var newList=[]
    
    var videoTypes=['play_video','pause_video']
    var problemTypes=['problem_check']
    for (var i=0;i<types.length;i++){
        if (types[i]=='video'){
            for (var j=0;j<list.length;j++){
                if (videoTypes.indexOf(list[j]['event_type'])!=-1){
                    newList.push(list[j])
                }
            }
        }
        if (types[i]=='problem'){
            for (var k=0;k<list.length;k++){
                if (problemTypes.indexOf(list[k]['event_type'])!=-1){
                    newList.push(list[k])
                }
            }
        }
    }
    return newList
    
}

var weeklyCompile = function(list){
    var copyList = $.extend(true, [], list)
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

var obj_date_sort=function (obj1, obj2){
    var date1= new Date(obj1['time'])
    var date2= new Date(obj2['time'])
    if (date1 > date2) return 1;
    if (date1 < date2) return -1;
    return 0;
}

//var sortByWeeks = function(list){
//    var copyList = $.extend(true, [], list)//Creates a deep copy
//    copyList.sort(obj_date_sort)
//    for (var i=0;i<copyList.length;i++){
//        copyList[i]['time']=new Date( copyList[i]['time'])
//        copyList[i]['day']= copyList[i]['time'].d
//    }
//    
//}
