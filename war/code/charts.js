var chartdata = '*********************' // Id of Fusion Table containing the data for the chart

	
/* This function is executed when the user presses the Transactions chart button. It just loads
 * the Google Chart Api and calls the viewChart function after it is loaded.
 */
function backwardTimeseriesChart() {
	google.load("visualization", "1.0", {"callback" : backwardChart, 'packages':["table", "corechart"]});
}
	

function backwardChart() {
	
	var expid = ($("#charts").val());
	
	// Replace the data source URL on next line with your data source URL.
    // Specify that we want to use the XmlHttpRequest object to make the query.
	var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=');
	var queryString = "SELECT Time, SkipTime, Count() FROM " + chartdata + " WHERE VideoId='" + expid +
	 "' AND TransactionId='1' GROUP BY Time, SkipTime ORDER BY Time";
	query.setQuery(queryString);
	
	// Send the query with a callback function.
	query.send(handleQueryResponse1);
}


/* This function takes the response from the Fusion Table Service and prepares the */
function handleQueryResponse1(response) {
	if (response.isError()) {
		alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		return;
	}

	var charttable = backwardTimeseries(response)

	var view = new google.visualization.DataView(charttable);
	view.setColumns([0, {calc:zeroone, type:'number', label:'Count'}]);
	
	var chart = new google.visualization.LineChart(document.getElementById('visualization'));
	chart.draw(view, {width: 470, height: 450, strictFirstColumnType: true});

	$("#maxvalcount").text(charttable.getColumnRange(1).max);
	$("#minvalcount").text(charttable.getColumnRange(1).min);
	
	$.mobile.changePage($("#chart"));
	
}	
	

function backwardTimeseries(response) {
	var begin, end;
	
	var data = response.getDataTable(); //Get DataTable from Fusion Table response
	
	var length = data.getNumberOfRows();
	var bts = new google.visualization.DataTable(); // Create table to hold timeline values
	bts.addColumn('number', 'Second'); // Add timeline column
	bts.addColumn('number', 'Count');
	for (var i = 0; i < length; i++) { // Process all records
			begin = data.getValue(i, 0) ;
			end = data.getValue(i, 0) + data.getValue(i, 1);
			for (var r = bts.getNumberOfRows(); r <= end; r++) // Add timeline rows if they do not exist
				bts.addRow([r, 0]);
			var expval = data.getValue(i, 2)
			for (var j = begin; j <= end; j++) // For all timeline values in range add this value
				bts.setValue(j, 1, bts.getValue(j, 1) + expval);
	}
	
	return bts; // return backward timeseries table
}


/////////////////////////////////////////
/////////////////////////////////////////


function forwardTimeseriesChart() {
	google.load("visualization", "1.0", {"callback" : forwardChart, 'packages':["table", "corechart"]});
}
	

function forwardChart() {
	
	var expid = ($("#charts").val());
	
	// Replace the data source URL on next line with your data source URL.
    // Specify that we want to use the XmlHttpRequest object to make the query.
	var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=');
	var queryString = "SELECT Time, SkipTime, Count() FROM " + chartdata + " WHERE VideoId='" + expid +
	 "' AND TransactionId='2' GROUP BY Time, SkipTime ORDER BY Time";
	// Request only Time, TransactionId and Count grouped by Time and TransactionId. Replace ID with
	// your table ID (Table 4 in Implementation Document)
	query.setQuery(queryString);
	
	// Send the query with a callback function.
	query.send(handleQueryResponse2);
}


/* This function takes the response from the Fusion Table Service and prepares the */
function handleQueryResponse2(response) {
	if (response.isError()) {
		alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		return;
	}

	var charttable = forwardTimeseries(response)

	var view = new google.visualization.DataView(charttable);
	view.setColumns([0, {calc:zeroone, type:'number', label:'Count'}]);
	
	var chart = new google.visualization.LineChart(document.getElementById('visualization'));
	chart.draw(view, {width: 470, height: 450, strictFirstColumnType: true});

	$("#maxvalcount").text(charttable.getColumnRange(1).max);
	$("#minvalcount").text(charttable.getColumnRange(1).min);
	
	$.mobile.changePage($("#chart"));
	
}	
	

function forwardTimeseries(response) {
	var begin, end;
	
	var data = response.getDataTable(); //Get DataTable from Fusion Table response
	
	var length = data.getNumberOfRows();
	var bts = new google.visualization.DataTable(); // Create table to hold timeline values
	bts.addColumn('number', 'Second'); // Add timeline column
	bts.addColumn('number', 'Count');
	for (var i = 0; i < length; i++) { // Process all records
			begin = data.getValue(i, 0) - data.getValue(i, 1);
			begin = (begin < 0 )? 0 : begin;
			end = data.getValue(i, 0) ;
			for (var r = bts.getNumberOfRows(); r <= end; r++) // Add timeline rows if they do not exist
				bts.addRow([r, 0]);
			var expval = data.getValue(i, 2)
			for (var j = begin; j <= end; j++) // For all timeline values in range add this value
				bts.setValue(j, 1, bts.getValue(j, 1) + expval);
	}
	
	return bts; // return backward timeseries table
}


function zeroone(dataTable, rowNum){
	var max = dataTable.getColumnRange(1).max;
	return dataTable.getValue(rowNum, 1) / max; 
}


function downloadBackwardTimeseries() {
	google.load('visualization', '1.0',
			{"callback" : function () {
				var expid = ($("#dlexpid").val());
				var video_title = ($("#dltitle").val());
				
				// Replace the data source URL on next line with your data source URL.
			    // Specify that we want to use the XmlHttpRequest object to make the query.
				var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=');
				var queryString = "SELECT Time, SkipTime, Count() FROM " + chartdata + " WHERE VideoId='" + expid +
				 "' AND TransactionId='1' GROUP BY Time, SkipTime ORDER BY Time";
				// Request only Time, TransactionId and Count grouped by Time and TransactionId. Replace ID with
				// your table ID (Table 4 in Implementation Document)
				query.setQuery(queryString);
				
				// Send the query with a callback function.
				query.send( function (response) {
					if (response.isError()) {
						alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
						return;
					}
				
					var timeseries = backwardTimeseries(response);
				
					downloadCSV(timeseries, video_title, "Backward")
				});		
			}
			});
}


function downloadForwardTimeseries() {
	google.load('visualization', '1.0',
			{"callback" : function () {
				var expid = ($("#dlexpid").val());
				var video_title = ($("#dltitle").val());
				
				// Replace the data source URL on next line with your data source URL.
			    // Specify that we want to use the XmlHttpRequest object to make the query.
				var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=');
				var queryString = "SELECT Time, SkipTime, Count() FROM " + chartdata + " WHERE VideoId='" + expid +
				 "' AND TransactionId='2' GROUP BY Time, SkipTime ORDER BY Time";
				// Request only Time, TransactionId and Count grouped by Time and TransactionId. Replace ID with
				// your table ID (Table 4 in Implementation Document)
				query.setQuery(queryString);
				
				// Send the query with a callback function.
				query.send( function (response) {
					if (response.isError()) {
						alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
						return;
					}
				
					var timeseries = forwardTimeseries(response);
				
					downloadCSV(timeseries, video_title, "Forward");
				});		
			}
			});
}


function downloadCSV(timeseries, video_title, interaction) {
	var csvRows = [];
	
	csvRows.push('Time,Count');
	
	var numberOfRows = timeseries.getNumberOfRows();
	
	for(var i=0; i<numberOfRows; i++){
		csvRows.push(timeseries.getValue(i,0) + ',' + timeseries.getValue(i,1));
	}
	
	var output = csvRows.join("\n");
	//alert(output);
	var uri = 'data:attachment/csv;charset=UTF-8,' + encodeURIComponent(output);
	
	var a = document.createElement('a');
	a.href = uri;
	a.target = '_blank';
	a.download = interaction + '_Timeseries-' + video_title + '.csv';
	document.body.appendChild(a);
	a.click();
}
