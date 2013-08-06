var template = {"username":undefined,
  "event_type":undefined ,
  "time":undefined
}

var generateTimestamp= function(){
    var year = '2013'
    var month = '09'
    var day = ""+Math.floor((Math.random()*30)+1)
    if (day.length == 1){
        day = '0'+day
    }
    var hour
    var random1to5 = Math.floor((Math.random()*5)+1)
    if (random1to5 == 1){
        hour = '0'+Math.floor((Math.random()*10))
    }
    else if (random1to5 == 5){
        hour= ""+(Math.floor(Math.random()*6)+10)
    }
    else{
        hour= ""+(Math.floor(Math.random()*8)+16)
    }
    
    var min = ""+(Math.floor(Math.random()*60))
    if (min.length == 1){
        min = '0'+min
    }
    var sec = ""+(Math.floor(Math.random()*60))
    if (sec.length == 1){
        sec = '0'+sec
    }
    
    var timestamp = year+'-'+month+'-'+day+'T'+hour+':'+min+':'+sec+".000"
    return timestamp
}

var generateNames = function(numberOfNames){
    var names = []
    var firstNames=["John","Rob", "James", "Dylan", "Rocky", "Carolyn", "Megan", "Sue", "Sally", "Michelle", "Christopher", "Jamie", "Madison", "Malcolm","Ryan", "Justin"]
    var middleInitial= [ "A","B","C","D","F","G","H","I","J","K","L","M","N","O","P"]
    var lastNames =["Jacobs", "Robertson", "Nguyen", "Jordan", "Kim", "O'Ryan", "McDonald","Heaton","Wiggins", "Reynolds", "Jackson", "Pierz", "Welsh","Wallace"]
    for (var i=0;i<numberOfNames;i++){
        var randFirst = firstNames[Math.floor(Math.random()*firstNames.length)]
        var randInit = middleInitial[Math.floor(Math.random()*middleInitial.length)]
        var randLast = lastNames[Math.floor(Math.random()*lastNames.length)]
        var name = randFirst+randInit+randLast
        if (names.indexOf(name)==-1){
            names.push(name)
        }
        else{
            i-=1   
        }
    }
    
    return names
}

var playedVideo= []
var generateEventType= function(name){
    var random1to5 = Math.floor((Math.random()*6))
    var typeList = ["play_video","pause_video","problem_check","seq_next","seq_prev","seq_goto"]
    if (typeList[random1to5] == "play_video"){
        if (playedVideo.indexOf(name)==-1){
            playedVideo.push(name)
            return typeList[random1to5]
        }
        else{
            return generateEventType(name)
        }
    }
    else if (typeList[random1to5] == "pause_video"){
        if (playedVideo.indexOf(name)==-1){
            return generateEventType(name)
        }
        else{
            var pos = playedVideo.indexOf(name)
            playedVideo.splice(pos, 1)
            return typeList[random1to5]
        }
    }
    else{
        return typeList[random1to5]
    }
}
var date_sort_asc = function (date1, date2) {
  // This is a comparison function that will result in dates being sorted in
  // ASCENDING order.
  if (date1 > date2) return 1;
  if (date1 < date2) return -1;
  return 0;
};

var generateGrade = function(){
    var random1to5 = Math.floor(Math.random()*5)+1
    if (random1to5==1){
        return 55+(Math.random()*15)
    }
    if(random1to5==5){
        return 85+(Math.random()*15)   
    }
    else{
        return 70+(Math.random()*15)
    }
}
var pickRandomProperty=function(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

var makeURL = function(){
    var videoURLs= [ 'https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_3/Circuits_with_Nonlinear_Elements/', 'https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_1/Administrivia_and_Circuit_Elements/', 'https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_4/Week_4_Tutorials/', 'https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_7/Speed_of_Digital_Circuits/', 'https://courses.edx.org/courses/MITx/6.002x/2013_Spring/courseware/Week_9/Undamped_Second-Order_Systems/'
                   ]
    
}

var makeFullData = function(numberStudents, avgActions){
    var names = generateNames(numberStudents)
    var gradebook = {}
    for (var i=0;i<names.length;i++){
        gradebook[names[i]]= generateGrade()
    }
    var finalList= []
    var timestamps = []
    var times= []
    for (var key in names){
        var randomNum = avgActions+(Math.floor(Math.random()*10)-5)
        for (var j= 0;j<randomNum;j++){
            var dateStr = generateTimestamp()
            var date = new Date(dateStr)
            timestamps.push(date)
        }
        
    }
    timestamps.sort(date_sort_asc)
     for (var i=0;i<timestamps.length;i++){
         var JSONEntry = {}
         JSONEntry['username']=names[Math.floor(Math.random()*names.length)]
         JSONEntry['grade']=gradebook[JSONEntry['username']]
         JSONEntry['event_type']=generateEventType(JSONEntry['username'])
         JSONEntry['time']=timestamps[i].toJSON()
         finalList.push(JSONEntry)
     }
    $('.textholder').text(JSON.stringify(finalList))
    return JSON.stringify(finalList)
}