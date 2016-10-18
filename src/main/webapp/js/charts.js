/* This function is executed when the user presses the Transactions chart button. It just loads
 * the Google Chart Api and calls the backwardChart function after it is loaded.
 */
function backwardTimeseriesChart() {
	$.mobile.loading('show', {
		text: 'Please wait',
		textVisible: true,
		theme: 'b',
		html: ''
	}); // Show loading widget
	
	google.load("visualization", "1.0", {"callback" : backwardChart, 'packages':["table", "corechart"]});
}
	

function backwardChart() {
	
	var expid = ($("#charts").val());
	
	$.post("/chart_data", { 'expid': expid, 'transid': 1 }, function (data) {
		if (data) {
			var charttable = backwardTimeseries(data)

			var view = new google.visualization.DataView(charttable);
			view.setColumns([0, {calc:zeroone, type:'number', label:'Count'}]);
			
			var chart = new google.visualization.LineChart(document.getElementById('visualization'));
			chart.draw(view, {width: 470, height: 450, strictFirstColumnType: true});

			$("#maxvalcount").text(charttable.getColumnRange(1).max);
			$("#minvalcount").text(charttable.getColumnRange(1).min);
			
			$.mobile.loading('hide');
			
			$.mobile.changePage($("#chart"));
			
		} else {
			alert("Error. Please try again.")
		}
	});

}	

function backwardTimeseries(data) {
	var begin, end;
	var length = data.length;
	
	var bts = new google.visualization.DataTable(); // Create table to hold timeline values
	bts.addColumn('number', 'Second'); // Add timeline column
	bts.addColumn('number', 'Count');

	
	for (var i = 0; i < length; i++) { // Process all records
			var col = data[i];
			begin = parseInt(col.t);
			end = begin + parseInt(col.s);
			
			for (var r = bts.getNumberOfRows(); r <= end; r++) // Add timeline rows if they do not exist
				bts.addRow([r, 0]);
			var expval = parseInt(col.c);
			for (var j = begin; j <= end; j++) // For all timeline values in range add this value
				bts.setValue(j, 1, bts.getValue(j, 1) + expval);
	}

	return bts; // return backward timeseries table
}


/////////////////////////////////////////
/////////////////////////////////////////


function forwardTimeseriesChart() {
	$.mobile.loading('show', {
		text: 'Please wait',
		textVisible: true,
		theme: 'b',
		html: ''
	}); // Show loading widget
	
	google.load("visualization", "1.0", {"callback" : forwardChart, 'packages':["table", "corechart"]});
}
	

function forwardChart() {
	
	var expid = ($("#charts").val());
	
	$.post("/chart_data", { 'expid': expid, 'transid': 2 }, function (data) {
		if (data) {
			var charttable = forwardTimeseries(data);
	
			var view = new google.visualization.DataView(charttable);
			view.setColumns([0, {calc:zeroone, type:'number', label:'Count'}]);
			
			var chart = new google.visualization.LineChart(document.getElementById('visualization'));
			chart.draw(view, {width: 470, height: 450, strictFirstColumnType: true});

			$("#maxvalcount").text(charttable.getColumnRange(1).max);
			$("#minvalcount").text(charttable.getColumnRange(1).min);
			
			$.mobile.loading('hide');
			
			$.mobile.changePage($("#chart"));
			
		} else {
			alert("Error. Please try again.")
		}
	});

}

	

function forwardTimeseries(data) {
	var begin, end;
	var length = data.length;
	var bts = new google.visualization.DataTable(); // Create table to hold timeline values
	
	bts.addColumn('number', 'Second'); // Add timeline column
	bts.addColumn('number', 'Count');
	
	for (var i = 0; i < length; i++) { // Process all records
			col = data[i];
			begin = parseInt(col.t) - parseInt(col.s);
			begin = (begin < 0 )? 0 : begin;
			end = parseInt(col.t);
			for (var r = bts.getNumberOfRows(); r <= end; r++) // Add timeline rows if they do not exist
				bts.addRow([r, 0]);
			var expval = parseInt(col.c)
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
	$.mobile.loading('show', {
		text: 'Please wait',
		textVisible: true,
		theme: 'b',
		html: ''
	}); // Show loading widget
	
	google.load("visualization", "1.0", {"callback" : function () {
	
		var expid = ($("#dlexpid").val());
		var video_title = ($("#dltitle").val());
		
		$.post("/chart_data", { 'expid': expid, 'transid': 1 }, function (data) {
			if (data) {
				
				var timeseries = backwardTimeseries(data);
				
				downloadCSV(timeseries, video_title, "Backward")
				
			} else {
				alert("Error. Please try again.")
			}
		});
	}});
	
}


function downloadForwardTimeseries() {
	$.mobile.loading('show', {
		text: 'Please wait',
		textVisible: true,
		theme: 'b',
		html: ''
	}); // Show loading widget
	
	google.load("visualization", "1.0", {"callback" : function () {
		var expid = ($("#dlexpid").val());
		var video_title = ($("#dltitle").val());
		
		$.post("/chart_data", { 'expid': expid, 'transid': 2 }, function (data) {
			if (data) {
				
				var timeseries = forwardTimeseries(data);
				
				downloadCSV(timeseries, video_title, "Forward");
				
			} else {
				alert("Error. Please try again.")
			}
		});
	}});

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
	
	$.mobile.loading('hide');
	
	var a = document.createElement('a');
	a.href = uri;
	a.target = '_blank';
	a.download = interaction + '_Timeseries-' + video_title + '.csv';
	document.body.appendChild(a);
	a.click();
}
