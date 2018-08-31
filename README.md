edX Student Activity Visualization
==================================

### Introduction

This edX Student Activity Visualization consists of two charts that measure students' use
of videos and practice problems. The first chart measures student problem activity by 
charting the number of problem submits per hour over the entire course. The second chart
measures student video activity by charting the total number of minutes of video watched per
hour over the entire course. Currently, instead of using actual edX tracking logs data, 
the visualization uses randomly generated data that is formatted in the same way as the edX tracking logs.


### Instructions

##### Files

You will need the following files:
	
	activity-vis.js
	activity-vis.css
	crossfilter.min.js
	data_process.js
	filters.js

If you are not planning to replace the random data, you will also need the following:

	newDataGen.js

##### HTML Instructions

Include the following block in the head of your HTML file:

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js"></script> 
	<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />
    <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
    <script src="crossfilter.min.js"></script>
    <script src="newDataGen.js"></script>
    <script src= "data_process.js"></script>
	<script src="activity-vis.js"></script>
    <script src='filters.js'></script>
	<link href="activity-vis.css" rel="stylesheet">

If you are planning to replace the random data, remove the newDataGen.js script tag.

In the body of your HTML file, where you want the chart to appear, include the following:

	<div class="chart-div"></div>
    <div class="filter-div"></div>

##### Choosing Charted Data

On the line 3 of data_process.js, there is a variable named data, which currently calls a function from
newDataGen.js that generates approximately 50000 random tracking logs events. You can replace this function with
your own data. Your data should be an array of objects, where the objects are edX tracking logs events that at minimum
have time, user, and event_type properties.

##### Some Concerns
This visualization was developed using randomly generated data. As such, we made some assumptions in our processing functions which may or may not be problematic when they are run on real data. In addition, the visualization is very
slow to process data that contains more than 100000 events.
