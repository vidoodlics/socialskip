// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var socialskip_testerId = Math.floor((Math.random() * 999) + 1);
var players = {};
//var url = "http://127.0.0.1:8888/researcher_videos?callback=?";
//var purl = "http://127.0.0.1:8888/interactions";
var url = "http://MY_APP_ID.appspot.com/researcher_videos?callback=?";
var purl = "http://MY_APP_ID.appspot.com/interactions";
var slide = 0x01; // Buttons - Slider bit mask
var play = 0x02; // Play button bit mask
//var forward = 0x04; // Forward button bit mask
//var backward = 0x08; // Backward button bit mask
var volume = 0x40000; // Volume bit mask
var fullscreen = 0x80000; // Fullscreen button bit mask
var quality = 0x100000  // Quality button bit mask
var playbackrate = 0x200000  // Playbackrate button bit mask

var SEEK_START = '0';

var playerwidth = 600;
var playerheight = 337;


function createPlayer($elem, analysisid, videoinfo) {
	
	// videoinfo cells
	// 0 -> ResearcherId
	// 1 -> VideoURL
	// 2 -> Questionnaire
	// 3 -> Controls
	// 4 -> Info
	// 5 -> Title
	// 6 -> TimeRange
	// 7 -> IconColor
	// 8 -> PgsColor
	// 9 -> BgColor
	
	var pos = videoinfo[1].lastIndexOf('/'); // get the position of the last occurrence of "/" character
	
	var params = { 	height: playerheight, 
					width: playerwidth,
					videoId: videoinfo[1].substr(pos), // extract only id from video url
					events: {
						'onReady': onPlayerReady
              		}
              	 };
	
	var controls = parseInt(videoinfo[3]);
	var elemid = 'socialskip' + analysisid;
	
	if ($elem.attr('data-socialskip') == 'true') {
		$elem.wrap('<div id="socialskipplayer' + analysisid + ' style="border-radius: 0px;"></div>');
		createMarkup($elem, analysisid, videoinfo);
		params.playerVars = { 
				'modestbranding': 1,
				'enablejsapi': 1, 
				'iv_load_policy': 3, 
				'showinfo': 0, 
				'autohide': 1, 
				'controls': 0, 
				'disablekb': 1,
				'rel': 0,
				'html5': 1
		};
	}
	
	$elem.removeAttr('data-expid');
	$elem.removeAttr('data-socialskip');
	$elem.attr('id', elemid);
	
	players[analysisid] = new YT.Player(elemid, params); // create new object
	
	players[analysisid].video_id = analysisid; // experiment id
	players[analysisid].video_controls = controls; // controls value
	players[analysisid].exp_start = true; // boolean value to check if the experiment has started
	
	if(parseInt(((videoinfo[3] & (0xFF << 10)) >>> 10) * 60) != 0 || videoinfo[2] != "") {
		players[analysisid].exp_start = false;
	}
	
	players[analysisid].video_startTime = (videoinfo[6] & (0x3FFF)); // customized video start time
	players[analysisid].video_endTime = (videoinfo[6] & (0x3FFF) << 14) >>> 14; // customized video end time
	
	players[analysisid].video_interactionTime = ((videoinfo[3] & (0xFF << 10)) >>> 10) * 60; // interaction time in seconds
	
	players[analysisid].state_ended = false; // boolean value for check if the video playback has ended
	
	players[analysisid].interactions = []; // buffer for interactions
	
	// check if icons color is not empty
	if (videoinfo[7] != "") {
		players[analysisid].icolor = videoinfo[7];
	} else { // else set a default color
		players[analysisid].icolor = "#E6E0DF";
	}
	
	// check if progress color is not empty
	if (videoinfo[8] != "") {
		players[analysisid].pcolor = videoinfo[8];
	} else { // else set a default color
		players[analysisid].pcolor = "#00B3FF";
	}
	
	// check if background color is not empty
	if (videoinfo[9] != "") {
		players[analysisid].bcolor = videoinfo[9];
	} else { // else set a default color
		players[analysisid].bcolor = "#454545";
	}
	
	// call function for responsive layout
	responsivelayout(analysisid);
}

function onPlayerReady(event) 
{	
	var analysisid = event.target.video_id;
	var controls = event.target.video_controls;
	var mouse = false;
	
	event.target.playVideo();
	
	updateHandler = setTimeout(updatePlayersInfo, 1000);
	
	if(players[analysisid].video_endTime == 0) {
		players[analysisid].video_endTime = players[analysisid].getDuration() - 1;
	}
	
	
	// draw pause button
	drawPauseButton(analysisid);
	// draw circle seekpos
	drawCircleSeekpos(analysisid)
	// draw fullscreen button
	drawFullscreenButton(analysisid);
	// draw options button
	drawOptionsButton(analysisid);
	// draw Start button
	drawStartButton(analysisid)
	
	
	// play/pause button click
	$( "#socialskip" + analysisid + "_play" ).click(function() { 
		var p = players[analysisid];
		if ( p.getPlayerState() != YT.PlayerState.PLAYING ) { // if player state is playing
			// draw pause button			
			drawPauseButton(analysisid);
		} else { // if player state is paused or cued
			// draw play button
			drawPlayButton(analysisid)
		}
		if ($( "#socialskip" + analysisid + "_volume_seekpos" ).length) {
			if(parseInt($( "#socialskip" + analysisid + "_volume_seekpos" ).width()) == 0 ) {
				p.mute();
			} else {
				p.setVolume((parseInt($( "#socialskip" + analysisid + "_volume_seekpos" ).width() * 100/60)));
			}
		} else {
			p.unMute();
		}
		
		playpause(analysisid);
	});	
	
	
	// set volume to 100
	volumeOn(100, analysisid)
	
	
	var vol;
	
	// volume seekbar click
	$( "#socialskip" + analysisid + "_volume_seekbar" ).click( function(e) { 
		var player = players[analysisid];
		var seekbar = document.getElementById("socialskip" + analysisid + "_volume_seekbar");
		var seekpos = document.getElementById("socialskip" + analysisid + "_volume_seekpos");      
		
		if (seekbar != null && seekpos != null) {
			var element = seekbar;
			var seekbarX = element.offsetLeft;
			
			element = element.offsetParent;
			while(element != null) {
				seekbarX += element.offsetLeft;
				element = element.offsetParent;
			}	
			var clickX = e.clientX - seekbarX;
			
			var barWidth = seekbar.offsetWidth;        
      
			$( "#socialskip" + analysisid + "_volume_seekpos" ).css('width', clickX);
			
			var seekto = clickX / barWidth * 100;
			volumeOn(seekto, analysisid);
			player.setVolume(seekto);
		}
	}).hide()
	.mouseover( function() {
		clearTimeout(vol); 
		$( "#socialskip" + analysisid + "_volume_seekbar" ).show('slow');
	}).mouseout( function() { 
		// when mouse out hide after 1 second
		vol = setTimeout(function(){
				$( "#socialskip" + analysisid + "_volume_seekbar" ).hide('slow')
			  },1000);
	});
	
	
	// volume button click
	$( "#socialskip" + analysisid + "_volume" ).click( function() {
			var p = players[analysisid];
			
			// if video is not mute
			if ( !(p.isMuted()) ) {
				volumeOff(analysisid);
				$( "#socialskip" + analysisid + "_volume_seekpos" ).css('width', '0px');
				p.mute();
			} else {
				volumeOn(p.getVolume(), analysisid);
				p.unMute();
				$( "#socialskip" + analysisid + "_volume_seekpos" ).css('width', p.getVolume() * 0.6); // ( 0 <= p.getVolume() <= 100 ) * ( 0.6 -> seekbar.width=60px)
			}
	}).mouseover( function() {
			clearTimeout(vol);
			$( "#socialskip" + analysisid + "_volume_seekbar" ).show('slow');
	}).mouseout( function() {
		// when mouse out hide after 1 second
		vol=setTimeout(function(){
				$( "#socialskip" + analysisid + "_volume_seekbar" ).hide('slow')
			},900); 
	});
			
	
	// options button click
	$("#socialskip" + analysisid + "_playbackOptions").click(function() {
		var player = players[analysisid];
		var availableQuality =  player.getAvailableQualityLevels();
		
		var i =0;
		for (i=0;i<availableQuality.length;i++) {
			if (availableQuality[i] == 'small') {
				$( "#socialskip" + analysisid + "_240p").show();
	        } else if (availableQuality[i] == 'medium') {
	        	$( "#socialskip" + analysisid + "_360p").show();
	        } else if (availableQuality[i] == 'large') {
	        	$( "#socialskip" + analysisid + "_480p").show();
	        } else if (availableQuality[i] == 'hd720') {
	        	$( "#socialskip" + analysisid + "_720p").show();
	        } else if (availableQuality[i] == 'hd1080') {
	        	$( "#socialskip" + analysisid + "_1080p").show();
	        }
		}
		
		// hide options box
		$( "#socialskip" + analysisid + "_options" ).toggle();
				
	});
	
	
	// playback rate select list click
	$( "#socialskip" + analysisid + "_playbackRateList" ).click(function() {
		var player = players[analysisid];
        var valRate = $(this).find(":selected").text();  
        player.setPlaybackRate(parseInt(valRate));
    });
	
	
	// quality select list click
	$( "#socialskip" + analysisid + "_playbackQualityList" ).click(function() {			
		var player = players[analysisid];
		
        var valQuality = $(this).find(":selected").text();
        
        if (valQuality == '240p') {
        	valQuality = 'small';
        } else if (valQuality == '360p') {
        	valQuality = 'medium';
        } else if (valQuality == '480p') {
        	valQuality = 'large';
        } else if (valQuality == '720p') {
        	valQuality = 'hd720';
        } else if (valQuality == '720p') {
        	valQuality = 'hd1080';
        }
        player.setPlaybackQuality(valQuality);
    });
	
	
	// fullscreen button click
	$( "#socialskip" + analysisid + "_fullscreen" ).click( function() { 
			var player = players[analysisid];
			var el = document.getElementById("socialskip" + analysisid);
			if (el.requestFullScreen) {
			  el.requestFullScreen();
			} else if (el.mozRequestFullScreen) {
			  el.mozRequestFullScreen();
			} else if (el.webkitRequestFullScreen) {
			  el.webkitRequestFullScreen();
			}
		});
	

	var mouse = false;
	var initial_pos;
	
	$( "#socialskip" + analysisid + "_seekbar" ).mousedown(function(e) {
		var player = players[analysisid];
		if (player.exp_start) {
			var seekpos = document.getElementById("socialskip" + analysisid + "_seekpos"); 
			initial_pos = seekpos.offsetWidth;
			mouse = true;
		} else {
			$("#socialskip" + analysisid + "_seekbarMsg").show();
			setTimeout(function(){$("#socialskip" + analysisid + "_seekbarMsg").hide();}, 3000);
		}	
		  
	}).mousemove (function(e) {
		var player = players[analysisid];
		var seekbar = document.getElementById("socialskip" + analysisid + "_seekbar");
		var seekpos = document.getElementById("socialskip" + analysisid + "_seekpos");      
		
		if (player.exp_start) {
			if (seekbar != null && seekpos != null) {
				var element = seekbar;
				var seekbarX = element.offsetLeft;
				
				element = element.offsetParent;
				while(element != null) {
					seekbarX += element.offsetLeft;
					element = element.offsetParent;
				}
				
				var clickX = e.clientX - seekbarX;
				var barWidth = seekbar.offsetWidth;    
				var seekto = clickX / barWidth * (player.video_endTime - player.video_startTime);
				
				$("#socialskip" + analysisid + "_timebox").text(toTime(seekto));
				$("#socialskip" + analysisid + "_timebox").show();
				
				$( "#socialskip" + analysisid + "_timebox").css('left', e.clientX-18);
			}
		}
	}).mouseout(function() {
		if (!mouse) {
			$( "#socialskip" + analysisid + "_timebox").hide();
		}
	});
	 
	
	$("#socialskipplayer" + analysisid).mousemove(function( e ) {
		var player = players[analysisid];
		if (player.exp_start) {
			if (mouse) {
				moveSeekBar(analysisid, e);
			}
		}	
	});
	  
	  
	
	$( "#socialskip" + analysisid + "_toolbar").mouseup(function(e) {
		var player = players[analysisid];
		if (player.exp_start) {
			if(mouse){
				var seekbar = document.getElementById("socialskip" + analysisid + "_seekbar");
				var seekpos = document.getElementById("socialskip" + analysisid + "_seekpos");      
				var today = new Date(); // Get the current time
				
				moveSeekBar(analysisid, e);
				
				if(player.state_ended) {
					player.playVideo();
					player.state_ended = false;
				}
				
				if (seekbar != null && seekpos != null) {
		
					var element = seekbar;
					var seekbarX = element.offsetLeft;
					
					element = element.offsetParent;
					while(element != null) {
						seekbarX += element.offsetLeft;
						element = element.offsetParent;
					}
					
					var curr_width = seekpos.offsetWidth;
					
					var new_pos = e.clientX - seekbarX;
					
					var barWidth = seekbar.offsetWidth; 
					var total = player.video_endTime - player.video_startTime;
					var startf = initial_pos / barWidth * total;
					var seekto = new_pos / barWidth * total;
					var seektime = seekto - startf;
					seekto = seekto + player.video_startTime;
					
			    //store the new playback position and skip time
					if(seektime < 0) {
						seektime = -seektime;
						player.interactions.push({
					        'expid': analysisid,
					        'tester': socialskip_testerId,
					        'code': '1',
					        'vtime': Math.round(seekto),
					        'ctime': today.getTime(),
					        'jump': Math.round(seektime)
					    }); 
					} else {
						player.interactions.push({
					        'expid': analysisid,
					        'tester': socialskip_testerId,
					        'code': '2',
					        'vtime': Math.round(seekto),
					        'ctime': today.getTime(),
					        'jump': Math.round(seektime)
					    });
					}
				}
			}
		}
		
		mouse = false;
		initial_pos = 0;
		$( "#socialskip" + analysisid + "_timebox").hide();
		
	});
	
	$( "#socialskip" + analysisid + "_toolbar").mouseleave(function(e) {
		var player = players[analysisid];
		if (player.exp_start) {
			if(mouse){
				var seekbar = document.getElementById("socialskip" + analysisid + "_seekbar");
				var seekpos = document.getElementById("socialskip" + analysisid + "_seekpos");      
				var today = new Date(); // Get the current time
				
				moveSeekBar(analysisid, e);
				
				if(player.state_ended) {
					player.playVideo();
					player.state_ended = false;
				}
				
				if (seekbar != null && seekpos != null) {
		
					var barWidth = seekbar.offsetWidth;  
					var new_pos = seekpos.offsetWidth;
					var total = player.video_endTime - player.video_startTime;
					var startf = initial_pos / barWidth * total;
					var seekto = new_pos / barWidth * total;
					var seektime = seekto - startf;
					seekto = seekto + player.video_startTime;
					
			    //store the new playback position and skip time
					if(seektime < 0) {
						seektime = -seektime;
							player.interactions.push({
					        'expid': analysisid,
					        'tester': socialskip_testerId,
					        'code': '1',
					        'vtime': Math.round(seekto),
					        'ctime': today.getTime(),
					        'jump': Math.round(seektime)
					    }); 
						
					} else {
						player.interactions.push({
					        'expid': analysisid,
					        'tester': socialskip_testerId,
					        'code': '2',
					        'vtime': Math.round(seekto),
					        'ctime': today.getTime(),
					        'jump': Math.round(seektime)
					    });
					}
				}
			}
		}
		
		mouse = false;
		initial_pos = 0;
		$( "#socialskip" + analysisid + "_timebox").hide();
		
	});
		
	// Start button click	
	$( "#socialskip" + analysisid + "_startlink" ).click(function() {
			var player = players[analysisid];
			player.seekTo( player.video_startTime, true); // Go to the beginning of the video
			player.playVideo();
			$(".pbutton").show(500); 
			$("#socialskip" + analysisid + "_questionnaire").show();
			$("#socialskip" + analysisid + "_remainTime").show("slow"); // The counter also
			display(analysisid);
			$("#socialskip" + analysisid + "_startlink").hide("fast"); // The previous link is not available anymore
			$("#socialskip" + analysisid + "_instructions").hide(); // Hide the instructions
			$("#socialskip" + analysisid + "_seekbarMsg").hide();
			player.exp_start = true;
			
			setInterval(function(){ 
				if ((player.interactions).length > 0) {
					$.post(purl, { data : JSON.stringify(player.interactions)});
				}
				player.interactions = [];
			}, 15000);
			
			updatePlayersInfo();
    });
	

	// add style tag in head	
	$('head').append('<style>#socialskip' + analysisid + '_timebox:before{content:""; position:absolute;top:100%;left: 13px;width: 0px;height: 0;border-top: 5px solid ' + players[analysisid].bcolor + ';border-left: 5px solid transparent;border-right: 5px solid transparent;}</style>');
	
	
	$( "#socialskip" + analysisid + "_toolbar").css({
		'background-color': players[analysisid].bcolor,
		'width' : '600px', 
		'border-radius' : '0px'
	});
	
	
	$( "#socialskip" + analysisid + "_timebox").css({
		'background-color' : players[analysisid].bcolor,
		'color' : players[analysisid].icolor, 
		'margin-top' : '-20px', 
		'height' : '12px', 
		'width' : '31px', 
		'position' : 'absolute', 
		'text-align' : 'center', 
		'padding' : '2px', 
		'font-family' : '"Arial", sans-serif', 
		'font-size' : '10px',
		'border-radius' : '0px',
		'display' : 'none'
	});
	
	
	$( "#socialskip" + analysisid + "_options" ).css({
		'color' : players[analysisid].icolor,
		'background-color' : players[analysisid].bcolor,
		'font-size' : '10px',
		'margin-top' : '-93px',
		'border-radius' : '0px' 
	});

	
	
	$( "#socialskip" + analysisid + "_circle_seekpos").css({
		'position': 'absolute',
		'margin-top': '-5px'
	});
	
	
	$( "#socialskip" + analysisid + "_counter" ).css('color', players[analysisid].icolor);
	
	$( "#socialskip" + analysisid + "_seekbar" ).css({
		'height' : '6px',
		'background-color' : players[analysisid].icolor,
		'margin' : '0px',
		'border-radius' : '0px'
	});
	
	$( ".socialskip" + analysisid + "_options_td" ).css({
		'color' : players[analysisid].icolor,
		'font-size' : '12px'
	});

	$( "#socialskip" + analysisid + "_seekpos" ).css({
		'height' : '6px',
		'width' : '0px',
		'background-color' : players[analysisid].pcolor
	});
	
	
	$( "#socialskip" + analysisid + "_volume_seekbar" ).css({
		'height' : '4px',
		'background-color' : players[analysisid].icolor,
		'border-radius' : '0px'
	});
	
	
	$( "#socialskip" + analysisid + "_volume_seekpos" ).css({
		'height' : '4px',
		'width' : '60px',
		'background-color' : players[analysisid].pcolor
	});
	
	 
	$( "#socialskipplayer" + analysisid).css({ 
		"-webkit-user-select": "none", 
		"-khtml-user-select": "none",  
		"-moz-user-select": "none", 
		"-o-user-select": "none", 
		"user-select": "none", 
		"cursor":"default"
	});
	
	
	$( "#socialskip" + analysisid + "_240p" ).hide();
	//$( "#socialskip" + analysisid + "_360p" ).hide();
	$( "#socialskip" + analysisid + "_480p" ).hide();
	$( "#socialskip" + analysisid + "_720p" ).hide();
	$( "#socialskip" + analysisid + "_1080p" ).hide();
	$( "#socialskip" + analysisid + "_4k" ).hide();
	
	
	players[analysisid].addEventListener('onStateChange', function(e) {
		if ( players[analysisid].getPlayerState() != YT.PlayerState.PLAYING ) { // if player state is playing
			// draw pause button			
			drawPlayButton(analysisid)
			
		} else { // if player state is paused or cued
			// draw play button
			drawPauseButton(analysisid);
		}
    });
	
	
	event.target.video_ready = true;	
	
	responsivelayout(analysisid);
	
	$(window).resize(function() {
		responsivelayout(analysisid);
	});
	

	window.onunload = closePage(analysisid);
	
} 

function closePage(analysisid) {
	var player = players[analysisid];
	if ((player.interactions).length > 0) {
		$.post(purl, { data : JSON.stringify(player.interactions)})
	}
}

// This functions drawing play button with canvas
function drawPlayButton(analysisid) {
	var canvas=document.getElementById('socialskip' + analysisid + '_play');
	if (canvas != null) {
		var c2 = canvas.getContext('2d');
		c2.clearRect(0, 0, canvas.width, canvas.height);
		c2.fillStyle = players[analysisid].icolor;
		c2.beginPath();
		c2.moveTo(7, 3);
		c2.lineTo(20,10);
		c2.lineTo(7, 17);
		c2.closePath();
		c2.fill();
	}
}


//This functions drawing play button with canvas
function drawReplayButton(analysisid) {
	var canvas=document.getElementById('socialskip' + analysisid + '_play');
	if (canvas != null) {
		var c1 = canvas.getContext("2d");
		c1.clearRect(0, 0, canvas.width, canvas.height);
		c1.strokeStyle = players[analysisid].icolor;
		c1.beginPath();
		c1.arc(13,10,6,0.4,5.3);
		c1.lineWidth = 2;
		c1.stroke();

		c1.fillStyle = players[analysisid].icolor;
		c1.beginPath();
		c1.moveTo(19, 3);
		c1.lineTo(20,9);
		c1.lineTo(14, 8);
		c1.closePath();
		c1.fill();
	}
}



//This functions drawing pause button with canvas
function drawPauseButton(analysisid) {
	var canvas=document.getElementById('socialskip' + analysisid + '_play');
	if (canvas != null) {
		var ctx=canvas.getContext("2d");
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.fillStyle=players[analysisid].icolor;
		ctx.fillRect(7,4,4,12);
		ctx.fillRect(15,4,4,12);
	}
}

//This functions drawing options button with canvas
function drawOptionsButton(analysisid) {
	var c=document.getElementById("socialskip" + analysisid + "_playbackOptions");
	if (c != null) {
		var ctx=c.getContext("2d");
		ctx.strokeStyle=players[analysisid].icolor;
		ctx.beginPath();
	    // kyklos
		ctx.arc(15,11,4,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // aristera
	    ctx.beginPath();
		ctx.arc(9.5,11,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // deksia
	    ctx.beginPath();
		ctx.arc(20.5,11,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // panw deksia
	    ctx.beginPath();
		ctx.arc(18.8,7.2,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // panw aristera
	    ctx.beginPath();
		ctx.arc(11.2,7.2,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // katw aristera
	    ctx.beginPath();
		ctx.arc(11.2,14.8,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // katw deksia
	    ctx.beginPath();
		ctx.arc(18.8,14.8,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // katw
	    ctx.beginPath();
		ctx.arc(15,16.5,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	
	    // panw
	    ctx.beginPath();
		ctx.arc(15,5.2,0.7,0,2*Math.PI);
		ctx.lineWidth=2;
		ctx.stroke();
	}
}

//This functions drawing fullscreen button with canvas
function drawFullscreenButton(analysisid) {
	var c=document.getElementById('socialskip' + analysisid + '_fullscreen');
	if (c != null) {
		var ctx=c.getContext("2d");
		ctx.strokeStyle=players[analysisid].icolor;
		ctx.lineWidth = 2;
	
		// panw aristera
		ctx.moveTo(12,5);
		ctx.lineTo(8,5);
		ctx.lineTo(8,9);
		ctx.stroke();
		
		// panw deksia
		ctx.moveTo(19,5);
		ctx.lineTo(23,5);
		ctx.lineTo(23,9);
		ctx.stroke();
		
		// katw deksia
		ctx.moveTo(19,17);
		ctx.lineTo(23,17);
		ctx.lineTo(23,13);
		ctx.stroke();
		
		// panw deksia
		ctx.moveTo(12,17);
		ctx.lineTo(8,17);
		ctx.lineTo(8,13);
		ctx.stroke();
	}
}

//This functions drawing Start button with canvas
function drawStartButton(analysisid) {
	var c=document.getElementById('socialskip' + analysisid + '_startbtn');
	if (c != null) {
		var ctx=c.getContext("2d");
		ctx.strokeStyle=players[analysisid].bcolor;
		ctx.arc(25,25,24,0,2*Math.PI);
		ctx.lineWidth = 2;
		ctx.shadowColor=players[analysisid].bcolor;
		ctx.stroke();
		ctx.lineWidth = 1;
		var ctx1=c.getContext("2d");
		ctx1.font="18px Arial";
		ctx1.strokeText("Start",5,31);
	}
	
}


function moveSeekBar(analysisid, e) {
  	var player = players[analysisid];
  	var seekbar = document.getElementById("socialskip" + analysisid + "_seekbar");
	var seekpos = document.getElementById("socialskip" + analysisid + "_seekpos");    
	var toolbar = document.getElementById("socialskip" + analysisid + "_toolbar")
	var today = new Date(); // Get the current time
	
	if (seekbar != null && seekpos != null) {
    //seekbar x
		var element = seekbar;
		var seekbarX = element.offsetLeft;
		
		element = element.offsetParent;
		while(element != null) {
			seekbarX += element.offsetLeft;
			element = element.offsetParent;
		}
		
		var curr_width = seekpos.offsetWidth;
		
		var clickX = e.clientX - seekbarX;

		var barWidth = seekbar.offsetWidth; 

		if (clickX < 0) {
			clickX = 0;
		} else if (clickX > parseInt(toolbar.offsetWidth)) {
			clickX = parseInt(toolbar.offsetWidth) - 5;
		}

		
		$( "#socialskip" + analysisid + "_seekpos" ).css('width', clickX);

		$( "#socialskip" + analysisid + "_circle_seekpos" ).css('margin-left', clickX);
		
		var seekto = clickX / barWidth * (player.video_endTime - player.video_startTime);
		seek(analysisid, seekto + player.video_startTime, SEEK_START);
		$("#socialskip" + analysisid + "_timebox").text(toTime(seekto));
	}
}

//this function set volume off and redrawing volume button
function volumeOff(analysisid) { 
	var c=document.getElementById('socialskip' + analysisid + '_volume');
	if (c != null) {
		var ctx=c.getContext("2d");
	
		ctx.clearRect(0, 0, c.width, c.height); // clear canvas
		
		ctx.fillStyle=players[analysisid].icolor;
		ctx.fillRect(4,7,7,6);
	
		ctx.beginPath();
		ctx.arc(14,10,6,0.45*Math.PI,1.55*Math.PI);
		ctx.fill();
	
		// draw X
		ctx.strokeStyle=players[analysisid].icolor;
		ctx.lineWidth=1.5;
		ctx.beginPath();
		ctx.moveTo(19,7);
		ctx.lineTo(25,13);
	
		ctx.moveTo(25,7);
		ctx.lineTo(19,13);
		ctx.stroke();
	}
}

//this function set volume and redrawing volume button
function volumeOn(val, analysisid) {
	// draw dynamic volume button
	var c=document.getElementById('socialskip' + analysisid + '_volume');
	if (c != null) {
		var ctx=c.getContext("2d");
	
		ctx.clearRect(0, 0, c.width, c.height); // clear canvas
		
		ctx.fillStyle=players[analysisid].icolor;
		ctx.fillRect(4,7,7,6);
	
		ctx.beginPath();
		ctx.arc(14,10,6,0.45*Math.PI,1.55*Math.PI);
		ctx.fill();
		ctx.closePath();
	
	
		ctx.strokeStyle=players[analysisid].icolor;
	
		ctx.beginPath();
		ctx.arc(17,10,1,1.79*Math.PI,0.21*Math.PI);
		ctx.lineWidth=1.6;
		ctx.stroke();
		ctx.closePath();
		
		if(val > 65) {
			ctx.beginPath();
			ctx.arc(17,10,4.2,1.79*Math.PI,0.21*Math.PI);
			ctx.stroke();
			ctx.closePath();
	
			ctx.beginPath();
			ctx.arc(17,10,7.4,1.79*Math.PI,0.21*Math.PI);
			ctx.stroke();
			ctx.closePath();
		} else if (val > 30) {
			ctx.beginPath();
			ctx.arc(17,10,4.2,1.79*Math.PI,0.21*Math.PI);
			ctx.stroke();
			ctx.closePath();
		}
	}
}

// this function drawing circle of seekbar with canvas
function drawCircleSeekpos(analysisid) {
	var c=document.getElementById('socialskip' + analysisid + '_circle_seekpos');
	if (c != null) {
		var ctx=c.getContext("2d");
		ctx.beginPath();
		ctx.arc(8,8,6,0,2*Math.PI);
		ctx.shadowBlur=1;
		ctx.shadowColor="black";
		ctx.fillStyle = players[analysisid].icolor;
		ctx.fill();
		ctx.closePath();
		
		var ctx1=c.getContext("2d");
		ctx1.beginPath();
		ctx1.arc(8,8,2,0,2*Math.PI);
		ctx1.fillStyle = players[analysisid].pcolor;
		ctx1.fill();
		ctx1.closePath();
	}
}

// responsive
function responsivelayout(analysisid) {
	var player = players[analysisid];
	var width = parseInt(window.innerWidth);
	
	var seekbar_width = parseInt( $("#socialskip" + analysisid + "_seekbar" ).width());
	var seekpos_width = parseInt( $("#socialskip" + analysisid + "_seekpos" ).width() );
	var pos = seekpos_width / seekbar_width;
	
	
	if (width <= 520) {
		$('.googledoc').attr('width', width-10 + "px")
		player.setSize(width-12, parseInt((width-7)/16*9));
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', width-12);
		
	}
	else if (width <= 700) {
		$('.googledoc').attr('width', '500px')
		player.setSize(500, 280);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '500px');
	}
	else if (width < 800) {
		$('.googledoc').attr('width', '500px')
		player.setSize(500, 280);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '500px');
	}
	else if (width <= 900) {
		$('.googledoc').attr('width', '350px')
		player.setSize(350, 197);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '350px');
	}
	else if (width <= 1000) {
		$('.googledoc').attr('width', '400px')
		player.setSize(410, 230);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '410px');
	}
	else if (width <= 1100) {
		$('.googledoc').attr('width', '450px')
		player.setSize(440, 248);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '440px');
	}
	else if (width <= 1200) {
		$('.googledoc').attr('width', '500px')
		player.setSize(500, 280);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '500px');
	}
	else if (width <= 1300) {
		$('.googledoc').attr('width', '550px')
		player.setSize(530, 300);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '530px');
	} else {
		$('.googledoc').attr('width', '600px')
		player.setSize(600, 337);
		$( "#socialskip" + analysisid + "_toolbar" ).css('width', '600px');
		
	}
	
	updatePlayersInfo();
	
	if (width <= 800) {
		$('body').css('margin', '0px');
		$('body').css('padding', '0px');
		$('#rightpanel').css('margin-left', '0px');
		$('#expcontent').css('padding', '2px');
		$("#socialskip" + analysisid + "_leftpanel" ).css('display', 'table-row');
		$("#socialskip" + analysisid + "_rightpanel" ).css('display', 'table-row');
	} else {
		$('body').css('margin', '20px');
		$('#rightpanel').css('margin-left', '10px');
		$('#expcontent').css('padding', '15px');
		$("#socialskip" + analysisid + "_leftpanel" ).css('display', 'table-cell');
		$("#socialskip" + analysisid + "_rightpanel" ).css('display', 'table-cell')
	}
	
	var seekbar_new_width = parseInt( $( "#socialskip" + analysisid + "_seekbar" ).width() )
	$( "#socialskip" + analysisid + "_seekpos" ).css('width', pos * seekbar_new_width )
	$( "#socialskip" + analysisid + "_circle_seekpos" ).css('margin-left', (pos * seekbar_new_width) - 8 )
}

// This function generate HTML code
function createMarkup($elem, analysisid, videoinfo) {
	var controls = parseInt(videoinfo[3]);
	var html;
	 
	var playButtonHtml = '<canvas style="cursor:pointer;" id="socialskip' + analysisid + '_play" width="30" height="18">Play</canvas>';
	var volumeButtonHtml = '<canvas style="cursor:pointer;" id="socialskip' + analysisid + '_volume" width="30" height="18">Volume</canvas>';
	var counterHtml = '<td style="display:inline-block;overflow: hidden; white-space: nowrap;font-family:Arial, Sans-serif;font-size:11px" id="socialskip' + analysisid + '_counter"></td>';
	var playbackOptionsButtonHtml = '<canvas style="cursor:pointer;" id="socialskip' + analysisid + '_playbackOptions" width="30" height="19">Options</canvas>';
	var playbackRateListHtml = '<tr><td class="socialskip' + analysisid + '_options_td" style="font-size:10px;">Playback rate</td><td> <select style="font-size:11px;" id="socialskip' + analysisid + '_playbackRateList"><option value="025">0.25x</option><option value="05">0.5x</option><option value="1" selected>1.0x</option><option value="2">2.0x</option></select></td></tr>';
	var playbackQualityListHtml = '<tr><td class="socialskip' + analysisid + '_options_td" style="font-size:10px;">Playback quality</td><td><select style="font-size:11px;" id="socialskip' + analysisid + '_playbackQualityList"><option id="socialskip' + analysisid + '_240p" value="240">240p</option><option id="socialskip' + analysisid + '_360p" value="360" selected>360p</option><option id="socialskip' + analysisid + '_480p" value="480">480p</option><option id="socialskip' + analysisid + '_720p" value="720">720p</option><option id="socialskip' + analysisid + '_1080p" value="1080">1080p</option><option id="socialskip' + analysisid + '_4k" value="4K">4K</option></select> </td></tr>';
	var fullscreenButtonHtml = '<canvas style="cursor:pointer;" id="socialskip' + analysisid + '_fullscreen" width="30" height="18"></canvas>';
	
	html = ['<div>'];
	
	// toolbar div
	html.push('<div id="socialskip' + analysisid + '_toolbar" style="margin-top: -6px; padding: 0px 0px 0px 0px;" >');
	
	// toolbar table
	html.push('<table style="width:100%">');
	
	//if (controls & slide) {
	// seekbar
	html.push('<tr style="padding: 0px;"><td colspan="100%">');
	html.push('<div id="socialskip' + analysisid + '_timebox"></div>');
	html.push('<div class="socialskip' + analysisid + '_seekbar" id="socialskip' + analysisid + '_seekbar"><canvas id="socialskip' + analysisid + '_circle_seekpos" width="16" height="16"></canvas><div id="socialskip' + analysisid + '_seekpos"></div></div>');
	html.push('</td></tr>');
	
	html.push('<tr>');
	
	// play button
	if (controls & play) {
		html.push('<td style="width:25px;overflow: hidden;white-space: nowrap;">');
		html.push(playButtonHtml);
		html.push('</td>');
	} 
	
	// volume button
	if(controls & volume ) {
		// volume button
		html.push('<td style="width:30px;overflow: hidden;white-space: nowrap;">');
		html.push(volumeButtonHtml);	
		html.push('</td>');
		// volume seekbar
		html.push('<td style="display:inline-block;"><div style="cursor:pointer;width:60px;" id="socialskip' + analysisid + '_volume_seekbar"><div id="socialskip' + analysisid + '_volume_seekpos"></div></div></td>');
	}
	
	// counter
	html.push(counterHtml);

	// fullscreen button
	if(controls & fullscreen) {
		html.push('<td style="float:right;width:30px;">');
		html.push(fullscreenButtonHtml);
		html.push('</td>');
	}
	
	// options
	if((controls & quality) ||  (controls & playbackrate)) {
		// options button
		html.push('<td style="float:right;width:27px;overflow: hidden;white-space: nowrap;width:30px;">');
		html.push(playbackOptionsButtonHtml);
		
		// options box
		html.push('<div id="socialskip' + analysisid + '_options" style="font-family:Arial, Sans-serif;min-height:48px;max-height:48px;padding:5px;display:none;margin-left:-135px;position:absolute;z-index:1000;opacity:0.9;">');
		html.push('<table id="socialskip' + analysisid + '_options_table" >');
		
		// playbackrate list
		if(controls & playbackrate) {
			html.push(playbackRateListHtml);
		}
		
		// quality list
		if(controls & quality) {
			html.push(playbackQualityListHtml);	
		}
		
		html.push('</table>')
		html.push('</div>'); // end options box
		
		html.push('</td>'); // end option button td
	}
	
	
	
	html.push('</tr></table>'); // end toolbar table
	html.push('</div>'); // end toolbar div
	
	// if interaction time != 0 OR questionnaire is not empty
	if (parseInt(((videoinfo[3] & (0xFF << 10)) >>> 10) * 60) != 0 || videoinfo[2] != "") {
		// show start button
		html.push('<br><center><a href="#" id="socialskip' + analysisid + '_startlink"><canvas style="cursor:pointer;" id="socialskip' + analysisid + '_startbtn" width="50" height="50">Start</canvas></a></center>');
		html.push('<center><span id="socialskip' + analysisid + '_seekbarMsg" style="color:#FF0000;display:none;">You must press <b>Start</b> to enable Seekbar.</span></center>');
	} 
	
	// input which shows remain time
	html.push('<input type="text" size="21" id="socialskip' + analysisid + '_remainTime" style="display:none;">');
	html.push('</div>');
	
	$elem.wrap('<div id="socialskip' + analysisid + '_experiment"><table><tr><td id="socialskip' + analysisid + '_leftpanel" valign="top"></td></tr></table></div>');
	
	$elem.after(html.join('\n'));
	
	if(videoinfo[4] != "" || videoinfo[2] != "" ) {
		// create new td rightpanel
		html = ['<td id="socialskip' + analysisid + '_rightpanel">'];
		
		// instructions iframe
		if (videoinfo[4]) {
			html.push('<div id="socialskip' + analysisid + '_instructions"><iframe src="' + videoinfo[4] + '"  width="600" height="500" class="googledoc"></iframe></div>');
		} 
		
		// questionnaire iframe
		if (videoinfo[2]) {
			html.push('<div id="socialskip' + analysisid + '_questionnaire" style="display:none;"> <iframe src="' + videoinfo[2] + '" width="600" height="500" frameborder="0" marginheight="0" marginwidth="0" class="googledoc"></iframe></div>');
		}

		html.push('</td>'); // end rightpanel
		
		$elem.parent().after(html.join('\n'));

	}

}



function playpause(analysisid) {
	var player = players[analysisid];	
	var time = Math.round(player.getCurrentTime()); // Collects the current second for the database
	var today = new Date(); // Get the current time
	
	// if state is paused, ended or pause
	if (player.getPlayerState() == YT.PlayerState.PAUSED || player.getPlayerState() == YT.PlayerState.ENDED || player.getPlayerState() == YT.PlayerState.CUED) { 
		player.playVideo(); // Play video
		if (time >= player.video_endTime) {
			seek(analysisid,  player.video_startTime, SEEK_START); // Go to the beginning of the video
		}
		if (player.exp_start) {
			player.interactions.push({
		        'expid': analysisid,
		        'tester': socialskip_testerId,
		        'code': '3',
		        'vtime': Math.round(time),
		        'ctime': today.getTime(),
		        'jump': 0
		    });
		 }
	}
	else if (player.getPlayerState() == YT.PlayerState.PLAYING) { // if state is playing
		player.pauseVideo(); // Pause video
		if (player.exp_start) {
			player.interactions.push({
		        'expid': analysisid,
		        'tester': socialskip_testerId,
		        'code': '4',
		        'vtime': Math.round(time),
		        'ctime': today.getTime(),
		        'jump': 0
		    });
		}
	}
		
}


function seek(eid, dist, origin) {
	var p = players[eid];
	var curpos = Math.round(p.getCurrentTime()); // Gets video's current time
	var duration = p.getDuration(); // Gets video's duration
	var today = new Date(); // Get the current time
	var newpos;
	
	newpos = eval(origin);
	newpos += dist;
	if (newpos < p.video_startTime) {
		newpos = p.video_startTime;
		
	} else if (newpos >= p.video_endTime) {
		newpos = p.video_endTime - 0.5;
		p.pauseVideo();
		drawReplayButton(eid);
		p.state_ended = true;
	}
	
	p.seekTo(newpos, true);	
	updatePlayersInfo();
}


//This function converts seconds to minutes or hours
function toTime(secs) { 
	var t = new Date(0,0,0);
	t.setSeconds(secs);
	if (secs <= 3600)
		return t.toTimeString().substr(3,5);
	else return t.toTimeString().substr(0,8)
}


function isEmptyObject(obj) {
  for(var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}


function drawSeekBar(value, analysisid) {
	var seekbar = document.getElementById("socialskip" + analysisid + "_seekbar");
	var seekpos = document.getElementById("socialskip" + analysisid + "_seekpos");
	if (seekbar != null && seekpos != null) {
		var barWidth = seekbar.offsetWidth;        
		$( "#socialskip" + analysisid + "_seekpos" ).css('width', value * barWidth);
		$( "#socialskip" + analysisid + "_circle_seekpos").css('margin-left', (value * barWidth)-8);
	}
}


function updatePlayersInfo() {
	if (!isEmptyObject(players)) {
		for (x in players) {
			var p = players[x];
			if (p.video_ready) {
				var cur = Math.round(p.getCurrentTime());
				total = p.video_endTime - p.video_startTime;
				
				curtime = cur - p.video_startTime;

				if (curtime < 0) {
					curtime = 0;
					p.seekTo(p.video_startTime, true);
				}
				
				if (cur >= p.video_endTime) {
					p.pauseVideo();
					drawReplayButton(x)
					p.state_ended = true;
					p.seekTo(p.video_endTime, true);
				}
				
				var counter = toTime(curtime) + '/' + toTime(p.video_endTime - p.video_startTime);
				
				drawSeekBar(curtime/total, x);
				
				$("#socialskip" + p.video_id + "_counter").text(counter);

			}
		}
	}
	
	
	updateHandler = setTimeout(updatePlayersInfo, 1000);
}



// Replace the 'ytplayer' element with an <iframe> and
// YouTube player after the API code downloads.
function onYouTubePlayerAPIReady() {
	checkCookie();
	$('[data-socialskip]').each(function () {
		var $elem = $(this);
		$elem.html("<br><br><center><img src=\"http://www.socialskip.org/images/loading.gif\"><br><br><span style=\"font-size:16px;font-family:Arial, serif;color:#111111;\">Please wait while loading the video...</span><center>")
		var analysisid = $elem.attr('data-expid');
		$.getJSON(url, { expid : analysisid }, function (data) {
			if ('string' == typeof(data) || data.length == 0) {
				alert('Error retrieving video info.');
			} else {
				createPlayer($elem, analysisid, data);
			}
		});
	});
}


// function for update the remain timer 
function display(analysisid) { 
	var player = players[analysisid];

	player.video_interactionTime -= 1; 
	
	// if interaction time has finished
	if (player.video_interactionTime<=-1) { 
		player.video_interactionTime += 1; 
		player.stopVideo();
		player.clearVideo();
		$("#socialskip" + analysisid + "_toolbar").hide();
		
		// if isset interactions save in database
		if ((player.interactions).length > 0) {
			$.post(purl, { data : JSON.stringify(player.interactions)});
		}
	} 

	$("#socialskip" + analysisid + "_remainTime").val("Remain Time: " + toTime(player.video_interactionTime)); 
	
	setTimeout("display(" + analysisid + ")", 1000);
}


// Cookies
function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return unescape(y);
		}
	}
}

function setCookie(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value)
			+ ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}

function checkCookie() {
	var testerId = getCookie("testerId");
	if (testerId == null || testerId == "") {
		$.post("/cookies", function (data) {
			if (data != null && data != "") {
				socialskip_testerId = data;
				setCookie("testerId", data, 100);
			} else {
				socialskip_testerId = Math.floor((Math.random() * 999) + 1);
			}
		}, "text");
	} else {
		socialskip_testerId = testerId;
	}
}
