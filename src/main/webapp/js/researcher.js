var slide = 0x01; // Buttons - Slider bit mask
var play = 0x02; // Play button bit mask
//var jump = 0x3F << 4; // Jump duration bit mask (6 bits 0-63 seconds)
var interaction = 0xFF << 10; // Total interaction time bit mask (8 bits 0-255 minutes)
var volume = 0x40000; // Volume bit mask
var fullscreen = 0x80000; // fullscreen button bit mask
var quality = 0x100000  // quality button bit mask
var playbackrate = 0x200000  // playbackrate button bit mask

var starttime = 0x3FFF; // start time bit mask (14 bits 0-16384 seconds)
var endtime = 0x3FFF << 14; // end time bit mask (14 bits 0-16384 seconds)

var row;

// New experiment HTML code
var newrow = '<div data-role="collapsible-set" data-theme="b" data-mini="true" id="expdiv">' +
			 '<div data-role="collapsible" data-theme="b" >' +
			 '<h2><a class="ui-collapsible-heading-toggle ui-btn ui-mini ui-btn-icon-left ui-btn-b ui-icon-minus ui-btn-active" href="#"> </a></h2>' +

			 '<table id="exptable" style="margin:auto;">' +
			 '<tr>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"></td>' +
			 '<td class="hidden"><td>' +
			 '<td class="videohide" style="margin-right:5px">' +
			 '<iframe id="player" type="text/html" width="416" height="259"' +
					'src=""' +
					'frameborder="0"></iframe>' +
			'</td>' +
			'<td style="min-width:10px;"></td>' +
			'<td><input type="button" value="Edit" data-icon="edit" class="edit" data-mini="true" />' +
			'<input type="button" value="Charts" data-icon="eye" class="charts" data-mini="true" />' +
			'<input type="button" value="Get URL" data-icon="carat-r" class="geturl" data-mini="true" />' +
			'<input type="button" value="Embed" data-icon="carat-r" class="getcode" data-mini="true" />' +
			'<input type="button" value="Download data" data-icon="arrow-d" class="download" data-mini="true" />' +
			'<input type="button" value="Delete" data-icon="delete" class="delete" data-mini="true" />' +
			'</td>' +
			'</tr>' +
			'</table>' +

			'</div><div>';

/* This function translates the value that accepts as input to the corresponding
 * controls (Buttons/Slider, Play, Forward and Backward buttons plus the Jump value and total
 * Interaction time
 */
function toControls(fld) {
	var control ="";
	$("#sliderradio").prop("checked",false).checkboxradio("refresh");
	$("#buttonsradio").prop("checked",false).checkboxradio("refresh");
	$(control).prop("checked",true).checkboxradio("refresh");
	$("#play").val(((fld & play) != 0) ? 'on' : 'off').change().slider('refresh');
	$("#interaction").val((fld & interaction) >>> 10).slider('refresh');
	$("#volume").val(((fld & volume) != 0) ? 'on' : 'off').change().slider('refresh');
	$("#fullscreen").val(((fld & fullscreen) != 0) ? 'on' : 'off').change().slider('refresh');
	$("#quality").val(((fld & quality) != 0) ? 'on' : 'off').change().slider('refresh');
	$("#playbackrate").val(((fld & playbackrate) != 0) ? 'on' : 'off').change().slider('refresh');
}


/* This function is the opposite from the previous. It translates the values of the various
 * controls (Slider, Play, Volume, Fullscreen, Quality and Palyback Rate buttons plus the Jump value and total
 * Interaction time) selected by the user into an integer.
 */
function fromControls() {
	var fld = 0;
	if ($('#play option:selected').val() == 'on')
		fld |= play;
	if ($('#volume option:selected').val() == 'on')
		fld |= volume;
	if ($('#fullscreen option:selected').val() == 'on')
		fld |= fullscreen;
	if ($('#quality option:selected').val() == 'on')
		fld |= quality;
	if ($('#playbackrate option:selected').val() == 'on')
		fld |= playbackrate;
	fld |= ($("#interaction").val() << 10);

	return fld;
}


/* It translates the values of start and end time selected by the user into an integer. */
function fromVideoRange() {
	var fvr = 0;
	fvr |= ($("#starttime").val());
	fvr |= ($("#endtime").val() << 14);

	return fvr;
}


/* This function is executed when the user presses the embed button in a
 * experiments list
 */
function getcode() {
	row = $(this).closest("tr"); // List item that contains the experiment data
	var expid = $("td:eq(1)", row).html();
	$("#codearea").text('<div data-socialskip="true" data-expid="' + expid + '" ></div>');
	$.mobile.changePage($("#codeinfo"));
}


/* This function is executed when the user presses the edit button in a
 * experiment description. It fills the form input controls with the values
 * for the experiment so as to enable the user to edit them.
 */
function edit() {
	removeWarnings();
	row = $(this).closest("tr"); // Table row that contains the experiment data
	$("#descr").val($("td:eq(0)", row).html());
	$("#expid").val($("td:eq(1)", row).html()); // Experiment id
	$("#videourl").val($("td:eq(2)", row).html());
	$("#controls").val($("td:eq(3)", row).html());
	$("#question").val($("td:eq(4)", row).html());
	$("#info").val($("td:eq(5)", row).html());
	$("#vtimerange").val($("td:eq(6)", row).html());
	if (($("td:eq(7)", row).html()).length) {
		$("#icolor").val($("td:eq(7)", row).html());
		$("#icolor").css("background-color", $("td:eq(7)", row).html());
	} else {
		$("#icolor").val("#E6E0DF");
		$("#icolor").css("background-color", "#E6E0DF");
	}
	if (($("td:eq(8)", row).html()).length) {
		$("#pcolor").val($("td:eq(8)", row).html());
		$("#pcolor").css("background-color", $("td:eq(8)", row).html());
	} else {
		$("#pcolor").val("#00B3FF");
		$("#pcolor").css("background-color", "#00B3FF");
	}
	if (($("td:eq(9)", row).html()).length) {
		$("#bcolor").val($("td:eq(9)", row).html());
		$("#bcolor").css("background-color", $("td:eq(9)", row).html());
	} else {
		$("#bcolor").val("#454545");
		$("#bcolor").css("background-color", "#454545");
	}
	$("#action").val("1"); // Action code for an update
	setVideoRange($("#videourl").val());
	$.mobile.changePage($("#videoinfo")); // Open form as a dialog
	$("#submit").val("Update").button('refresh'); // Submit button label
	toControls($("#controls").val()); // Fill form controls

}

function convertISO8601ToSeconds(input) {

	 var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
	 var hours = 0, minutes = 0, seconds = 0, totalseconds;

	 if (reptms.test(input)) {
		 var matches = reptms.exec(input);
		 if (matches[1]) hours = Number(matches[1]);
		 if (matches[2]) minutes = Number(matches[2]);
		 if (matches[3]) seconds = Number(matches[3]);
		 totalseconds = hours * 3600  + minutes * 60 + seconds;
	 }

	 return (totalseconds);
 }

function setVideoRange(videourl) {

	if(videourl) {
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = videourl.match(regExp);
		if (match&&match[2].length==11){
			$("#videotimerange").show();

			var video_id = match[2];
			$("#videourl").val("https://www.youtube.com/embed/" + video_id)


			$.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + video_id + '&key=AIzaSyDXX-gRT3JDAwc25w3e_Q25Zwb6KkWrcoo&part=contentDetails',function(data,status,xhr){
			    var videoduration = convertISO8601ToSeconds(data.items[0].contentDetails.duration);
			    $("#starttime").attr("max", videoduration).slider("refresh");
			    $("#endtime").attr("max", videoduration).slider("refresh");
			    fvr = parseInt($("#vtimerange").val());
			    $("#starttime").val((fvr & starttime) ).slider('refresh');
				$("#endtime").val((fvr & endtime) >>> 14).slider('refresh');

				if(parseInt($("#endtime").val()) == 0 ) {
					$("#endtime").val(videoduration).slider('refresh');
				}
			});
		} else {
			$("#videotimerange").hide();
		}
	}else{
		$("#videotimerange").hide();
	}
}

function setInfoField(url) {
    var res = url.match(/[-\w]{25,}/);
    if ( res != null ) {
    	$("#info").val("https://docs.google.com/document/pub?id=" + res);
    }
}

/* This function is executed after update. It transfers the values from the
 * form to the columns of the table if the update was successfull.
 */
function postEdit(response) {
	if (response == "OK") {
		$("td:eq(0)", row).html($("#descr").val());
		$("td:eq(2)", row).html($("#videourl").val());
		$("td:eq(3)", row).html($("#controls").val());
		$("td:eq(4)", row).html($("#question").val());
		$("td:eq(5)", row).html($("#info").val());
		$("td:eq(6)", row).html($("#vtimerange").val());
		$("td:eq(7)", row).html($("#icolor").val());
		$("td:eq(8)", row).html($("#pcolor").val());
		$("td:eq(9)", row).html($("#bcolor").val());

		$('#' + $("#expid").val() + ' iframe').attr('src', $("#videourl").val() + '?enablejsapi=1&html5=1&theme=light&color=red');
	}
	else
		alert("Action failed.\nPlease try again.");
}


/* This function is executed after the insertion of the new experiment
 * It prints out a message and then inserts a new row in the HTML table
 * containing the info of the experiments.
 */
function postInsert(response) {
	if (response != "ERROR") {
		$("#experiments").append(newrow);
		$("#experiments").trigger("create");

		row = $("#experiments").children("div").last();
		$(row).attr('id', response);
		$("h2 a", row).html($("#descr").val());
		$('[data-role=collapsible-set]').collapsibleset().trigger('create');
		$("td:eq(0)", row).html($("#descr").val());
		$("td:eq(1)", row).html(response); // Rowid as videoId from server response
		$("td:eq(2)", row).html($("#videourl").val());
		$("td:eq(3)", row).html($("#controls").val());
		$("td:eq(4)", row).html($("#question").val());
		$("td:eq(5)", row).html($("#info").val());
		$("td:eq(6)", row).html($("#vtimerange").val());
		$("td:eq(7)", row).html($("#icolor").val());
		$("td:eq(8)", row).html($("#pcolor").val());
		$("td:eq(9)", row).html($("#bcolor").val());
		$('#' + response + ' iframe').attr('src', $("#videourl").val() + '?enablejsapi=1&html5=1&theme=light&color=red')
		$(".edit").click(edit);
		$(".delete").click(del);
		$(".geturl").click(getURL);
		$(".charts").click(getCharts);
		$(".viewbackward").click(backwardTimeseriesChart);
		$(".viewforward").click(forwardTimeseriesChart);
		$(".download").click(download);
		$(".backwarddata").click(downloadBackwardTimeseries);
		$(".forwarddata").click(downloadForwardTimeseries);
		$(".rowsdata").click(downloadData);
		$(".getcode").click(getcode);
	} else
		alert("Action failed.\nPlease try again.");
}

/* This function is executed when the user presses the Insert button.
 * It opens a form for the user to ill in the details of the experiment.
 */
function insert() {
	removeWarnings();
	$("#descr").val("");
	$("#videourl").val("");
	$("#controls").val("0");
	$("#vtimerange").val("0");
	$("#question").val("");
	$("#icolor").val("#E6E0DF");
	$("#icolor").css("background-color", "#E6E0DF");
	$("#pcolor").val("#00B3FF");
	$("#pcolor").css("background-color", "#00B3FF");
	$("#bcolor").val("#454545");
	$("#bcolor").css("background-color", "#454545");
	$("#more").hide();
	$("#info").val("");
	$("#action").val("2");
	$("#submit").val("Create"); // Submit button label
    $.mobile.changePage($("#videoinfo"));
    toControls($("#controls").val());
    $("#play").val('on').change().slider('refresh');
	$("#volume").val('on').change().slider('refresh');
	$("#fullscreen").val('on').change().slider('refresh');
	$("#quality").val('on').change().slider('refresh');
	$("#playbackrate").val('on').change().slider('refresh');
	$("#sliderradio").prop("checked",true).checkboxradio("refresh");
	$("#buttonsradio").prop("checked",false).checkboxradio("refresh");
	$("#buttonsdiv").hide();
}

/* This function is executed when the user presses the Delete button. It
 * prints out the info of the experiment and waits for the user to press
 * Delete button again for confirmation.
 */
function del() {
	removeWarnings();
	row = $(this).closest("tr"); // Table row that contains the experiment data
	$("#descr").val($("td:eq(0)", row).html());
	$("#expid").val($("td:eq(1)", row).html()); // Experiment id
	$("#videourl").val($("td:eq(2)", row).html());
	$("#controls").val($("td:eq(3)", row).html());
	$("#question").val($("td:eq(4)", row).html());
	$("#info").val($("td:eq(5)", row).html());
	$("#vtimerange").val($("td:eq(6)", row).html());
	$("#icolor").val($("td:eq(7)", row).html());
	$("#icolor").css("background-color", $("td:eq(7)", row).html());
	$("#pcolor").val($("td:eq(8)", row).html());
	$("#pcolor").css("background-color", $("td:eq(8)", row).html());
	$("#bcolor").val($("td:eq(9)", row).html());
	$("#bcolor").css("background-color", $("td:eq(9)", row).html());
	$("#more").hide();
	$("#action").val("3"); // Action code for an update
	$.mobile.changePage($("#videoinfo")); // Open form as a dialog
	$("#submit").val("Delete").button('refresh'); // Submit button label
	toControls($("#controls").val()); // Fill form controls
}


/* This function is executed after the deletion of the experiment.
 * It prints out a message and removes the experiment row from the HTML
 * table.
 */
function postDelete(response) {
	if (response == "OK") {
		$("#" + $("#expid").val()).remove();
		$('[data-role=collapsible-set]').collapsibleset().trigger('create');
	} else
		alert("Action failed. Please try again.");
}


/*
* This function is executed when the user presses the Get URL button and
* prints out the url that someone has to type to watch the video.
*/
function getURL() {
	row = $(this).closest("tr");
	var expid = $("td:eq(1)", row).html();
	$("#geturl").val(window.location.hostname + "/watch?videoId=" + expid);
	$.mobile.changePage($("#urlvideo"));
}

/*
* This function is executed when the user presses the
* Charts button and prints out buttons to view the charts.
*/
function getCharts() {
	row = $(this).closest("tr");
	$("#charts").val($("td:eq(1)", row).html());
	$("#controls").val($("td:eq(3)", row).html());
	//$("div#page").attr("class", "opacity");
	//$("#viewcharts").dialog({width: 600, beforeClose: function(event,ui){ $("div#page").removeAttr("class"); }});
	$.mobile.changePage($("#viewcharts"));
}


/*
* This function is executed when the user presses the
* Charts button and prints out buttons to view the charts.
*/
function download() {
	row = $(this).closest("tr");
	$("#dlexpid").val($("td:eq(1)", row).html());
	$("#dltitle").val($("td:eq(0)", row).html());
	//$("div#page").attr("class", "opacity");
	//$("#viewcharts").dialog({width: 600, beforeClose: function(event,ui){ $("div#page").removeAttr("class"); }});
	$.mobile.changePage($("#download"));
}


function downloadData() {

	var expid = ($("#dlexpid").val());
	var video_title = ($("#dltitle").val());

	window.location.href ="/download?videoid=" + expid + "&video=" + video_title;
	return false;
}


/* This function contains initialization code that is executed right after the
 * page is loaded and the DOM is ready to be manipulated.
 */
$(document).delegate("#researchersPage", "pageinit", function () {
	$(".edit").click(edit);
	$(".delete").click(del);
	$(".geturl").click(getURL);
	$(".charts").click(getCharts);
	$(".viewbackward").click(backwardTimeseriesChart);
	$(".viewforward").click(forwardTimeseriesChart);
	$(".download").click(download);
	$(".backwarddata").click(downloadBackwardTimeseries);
	$(".forwarddata").click(downloadForwardTimeseries);
	$(".rowsdata").click(downloadData);
	$(".getcode").click(getcode);
	$("form input[name='controltype']").change(function () {
		if ($(this).closest("form input[name='controltype']:checked").val() == "slide") {
			$("#buttons").slideUp();
		} else {
			$("#buttons").slideDown();
		}
	});
	$("#controls").val(fromControls()); // Controls value
	$("form#createupdate").submit(function (e) { // Custom submit function
		e.preventDefault(); // Cancel default action
		$("#controls").val(fromControls()); // Controls value
		$("#vtimerange").val(fromVideoRange());
		$.mobile.loading('show', {
			text: 'Please wait',
			textVisible: true,
			theme: 'b',
			html: ''
		}); // Show loading widget
		// Send request to server with the form data
		$.post("/researcher_videos", $("form").serialize(), function (data) {
			var action = $("#action").val();
			$.mobile.loading('hide');
			if (action == 1) {
				postEdit(data);
			} else if (action == 2) {
				postInsert(data);
			} else if (action == 3) {
				postDelete(data);
			}
			$("#videoinfo").dialog('close');
		}, "text");
	});


	$("#videotimerange").hide();

	$("#videourl").change(function() {
		setVideoRange($("#videourl").val());
	});

	$("#question").change(function() {
		//setQuestionField($("#question").val());
	});

	$("#info").change(function() {
		setInfoField($("#info").val());
	});

	$("#more").hide();
	$( "#custplayer" ).click(function() {
		$("#more").toggle();
	});

});



function validateForm()
{
	removeWarnings();
	var descr = $("#descr").val();
	var videourl = $("#videourl").val();
	var question = $("#question").val();
	var info = $("#info").val();
	var r = true;

	setVideoRange($("#videourl").val());

	if (question != "") {
		//setQuestionField(question)
	}

	if (info != "") {
		setInfoField(info)
	}

	if (descr==null || descr=="") {
		  $("#descr").parent().css('border-color','#FF0000');
		  $("#descr").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">This field is required.</span>");
		  r = false;

	}

	var regex_url=/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

	if (videourl==null || videourl=="") {
		$("#videourl").parent().css('border-color','#FF0000');
		$("#videourl").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">This field is required.</span>");
		r = false;
	} else if (!(regex_url.test(videourl))) {
		$("#videourl").parent().css('border-color','#FF0000');
		$("#videourl").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">This is not a valid youtube url.</span>");
		r = false;
	}

	return r;
}

function removeWarnings() {
	$("#descr").parent().css('border-color','#FFFFFF');
	$("#videourl").parent().css('border-color','#FFFFFF');
	$(".errormsg").remove();
}
