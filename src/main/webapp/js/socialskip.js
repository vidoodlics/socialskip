var socialskip_url = getDomainOfCurrentScript();

var socialskip_urls = {
	get_exp_info : socialskip_url + "/researcher_videos",
	post_interactions : socialskip_url + "/interactions"
}

function getDomainOfCurrentScript() {
	var src;
	if (document.currentScript) {
		src = document.currentScript.src;
	} else {
		var scripts = document.getElementsByTagName('script');
		src = scripts[scripts.length-1].src;
	}
	return src.match(/^(https?:)?(\/\/)?(www.)?[^\/]+/g);
};

window.onload = function () {
	// Load the IFrame Player API code asynchronously.
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/player_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	$('html > head').append("<style>" + socialskip_static_css + "</style>");
};

// YouTube player after the API code downloads.
function onYouTubePlayerAPIReady() {
	cookie.check();
	$('[data-socialskip]').each(function () {
		var elem = $(this);
		elem.html('<div class="socialskip-video-loading"><div><img src="' + socialskip_url + '/images/loading.gif"><p>Video Loading...</p></div></div>');
		var exp_id = elem.attr('data-expid');
		$.ajax({
            url: socialskip_urls.get_exp_info,
            method: "GET",
            dataType: "jsonp",
            data: {
                expid : exp_id
            }
        })
        .done(function(data) {
			if ('string' == typeof(data) || data.length == 0) {
				$(".socialskip-video-loading > div").text("Error retrieving video info.")
			} else {
				createPlayer(elem, exp_id, data);
			}
        }).fail(function () {
			$(".socialskip-video-loading > div").text("Error loading video.")
		});

	});
}

function createPlayer(html_element, exp_id, exp_info) {
	var newExperiment = new SocialSkipExperiment(exp_id, html_element, exp_info);
	newExperiment.initialize();
}

var cookie = {
	tester_id :  Math.floor((Math.random() * 999) + 1),

	get : function (c_name) {
		var i, x, y, ARRcookies = document.cookie.split(";");
		for (i = 0; i < ARRcookies.length; i++) {
			x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
			y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g, "");
			if (x == c_name) {
				return unescape(y);
			}
		}
	},

	set : function (c_name, value, exdays) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value)	+ ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
	},

	check : function () {
		var testerId = cookie.get("testerId");
		if (testerId == null || testerId == "") {
			$.post("/cookies", function (data) {
				if (data != null && data != "") {
					this.tester_id = data;
					cookie.set("testerId", data, 100);
				}
			}, "text");
		} else {
			this.tester_id = testerId;
		}
	}
}

var SocialSkipExperiment = function (id, html_element, experiment_info) {
	/*
	id : Experiment ID
	html_element : html element in which will be placed the html code
	exp_info : array that contains the experiment info
		[
			0 -> ResearcherId
			1 -> VideoURL
			2 -> Questionnaire
			3 -> Controls
			4 -> Info
			5 -> Title
			6 -> TimeRange
			7 -> IconColor
			8 -> PgsColor
			9 -> BgColor
		]
	*/
	this._id = id;
	this._html_element = html_element;
	this._exp_info = experiment_info;
	this._has_start = false;
	this._interactions = [];
	this._start_at = null;
	this._video_player = null;
	this._google_docs = null;
}

SocialSkipExperiment.prototype = {

	initialize : function () {
		this._video_player = new SocialSkipVideoPlayer(this, this._id, this._exp_info[1], 600, 337, this.getControls(), this.getColors(), this.getTimeTrimmer());
		this._google_docs = new SocialSkipDocs(this._id, this._exp_info[2], this._exp_info[4]);
		this._html_element.html(this.generateHTML());
		this._video_player.initialize();
		this.bindEvents();
	},

	generateHTML : function () {
		var left_panel = [
			'<div class="socialskip-left-panel">',
			 	this._video_player.generateHTML(),
				'',
				'<div class="socialskip-remaining-time"><input type="text" size="22"/></div>',
			'</div>'
		];

		var right_panel = [];
		if (this._google_docs.hasDocs()) {
			right_panel.push('<div class="socialskip-right-panel">', this._google_docs.generateHTML(), '</div>');
		}
		if (this._google_docs.hasDocs() || this.getInteractionTime() != 0) {
			left_panel[2] = '<div class="socialskip-start-btn">START</div>';
		} else {
			this._has_start = true;
		}
		var html = [
			'<div id="socialskip-id-' + this._id + '">',
				left_panel.join(""),
				right_panel.join(""),
			'</div>'
		];

		return html.join("\n");
	},

	getInteractionTime : function () {
		return ((this._exp_info[3] & (0xFF << 10)) >>> 10) * 60; // in seconds
	},

	getControls : function () {
		var play = 0x02; // Play button bit mask
		var volume = 0x40000; // Volume bit mask
		var fullscreen = 0x80000; // Fullscreen button bit mask
		var quality = 0x100000  // Quality button bit mask
		var speed = 0x200000  // Speed button bit mask

		var controls = {
			play : this._exp_info[3] & play,
		    volume : this._exp_info[3] & volume,
		    fullscreen: this._exp_info[3] & fullscreen,
		    quality: this._exp_info[3] & quality,
		    speed: this._exp_info[3] & speed
		}

		return controls;
	},

	getColors : function () {
		var colors = {
		    icon : this._exp_info[7],
		    progress: this._exp_info[8],
		    background: this._exp_info[9]
		}

		return colors;
	},

	getTimeTrimmer : function () {
		var time_trimmer = {
			start : this._exp_info[6] & (0x3FFF),
			end : (this._exp_info[6] & (0x3FFF) << 14) >>> 14
		}
		 return time_trimmer;
	},

	bindEvents : function () {
		var _this = this;
		$("#socialskip-id-" + _this._id + " .socialskip-start-btn").click(function (e) {
			_this._google_docs.showQuestionnaire();
			$("#socialskip-id-" + _this._id + " .socialskip-start-btn").hide();
			_this._has_start = true;
			_this._video_player.playFromStart();
			_this._start_at = (new Date()).getTime();

			$("#socialskip-id-" + _this._id + " .socialskip-remaining-time").show();
		});
	},

	finished : function () {
		this._video_player._youtube_player.stopVideo();
		this._video_player.changeCustomState("ended");
		$("#socialskip-video-player-id-" + this._id).empty();
		$("#socialskip-video-player-id-" + this._id).css("background-color", this.getColors().background)
	}
}


var SocialSkipDocs = function (id, questionnaire_url, info_url) {
	/*
	id : Experiment ID,
	questionnaire_url : Questionnaire URL,
	info_url : Info URL
	*/
	this._id = id;
	this._info_url = info_url;
	this._questionnaire_url = questionnaire_url;
}

SocialSkipDocs.prototype = {

	hasDocs : function () {
		if (this._info_url != "" || this._questionnaire_url != "") {
			return true;
		} else {
			return false;
		}
	},

	showQuestionnaire : function () {
		$("#socialskip-questionnaire-id-" + this._id).show();
		$("#socialskip-info-id-" + this._id).hide();
	},

	generateHTML : function () {
		var html = [
			'<div id="socialskip-questionnaire-id-' + this._id + '" style="display:none;">',
				'<iframe src="' + this._questionnaire_url + '" width="600" height="500" frameborder="0" marginheight="0" marginwidth="0" class="googledoc"></iframe>',
			'</div>',
			'<div id="socialskip-info-id-' + this._id + '">',
				'<iframe src="' + this._info_url + '" width="600" height="500" frameborder="0" marginheight="0" marginwidth="0" class="googledoc"></iframe>',
			'</div>'
		].join("\n");

		return html;
	}

}


var SocialSkipVideoPlayer = function (experiment, id, url, width, height, controls, colors, time_trimmer) {
	/*
	experiment : Experiment object
	id : Experiment ID,
	url : Youtube Video URL,
	width : Player width,
	height : Player height,
	controls : {
	    play : Boolean,
	    volume : Boolean,
	    fullscreen: Boolean,
	    quality: Boolean,
	    speed: Boolean
	}
	colors : {
	    icon : String-HEX,
	    progress: String-HEX,
	    background: String-HEX
	}
	time_trimmer : {
		start : Time value in seconds
		end : Time value in seconds
	}
	*/
	this._experiment = experiment;
    this._id = id;
    this._url = url;
    this._width = width;
    this._height = height;
    this._controls = controls;
    this._colors = colors;
	this._time_trimmer = time_trimmer;
	this._youtube_player = null;
	this._custom_state = "unstarted"; // unstarted | ended | playing | paused
	this._interactions = [];
}

SocialSkipVideoPlayer.prototype = {

    initialize : function () {
        this.generateCSS();
		this.loadYoutubeVideo();
    },

	loadYoutubeVideo : function () {
		var _this = this;
		var params = {
			height : this._height,
			width : this._width,
			videoId : this._url.substr(this._url.lastIndexOf('/') + 1), // extract only video id from video url
			events : {
				'onReady': function () {
					_this.youtubePlayerReady();
				}
	  		},
			playerVars : {
				'modestbranding': 1,
				'enablejsapi': 1,
				'iv_load_policy': 3,
				'showinfo': 0,
				'autohide': 1,
				'controls': 0,
				'disablekb': 1,
				'rel': 0,
				'html5': 1
			}
	  	 };
		this._youtube_player = new YT.Player("socialskip-youtube-video-id-" + this._id, params);
	},

	youtubePlayerReady : function () {
		this.bindControlsEvents();
		this.update();
		if (this._time_trimmer.start == 0 && this._time_trimmer.end == 0) {
			this._time_trimmer.end = this._youtube_player.getDuration();
		}

		if (this._time_trimmer.end > this._youtube_player.getDuration()) {
			this._time_trimmer.end = this._youtube_player.getDuration();
		}
		$("#socialskip-video-player-id-" + this._id + " .socialskip-video-player-duration").text(toTime(this.getCustomDuration()));
		this.saveInteractions();
		this.responsive();
	},

	playFromStart : function () {
		this._youtube_player.seekTo(this._time_trimmer.start, true);
		this._youtube_player.playVideo();
		this.changeCustomState("playing");
	},

	saveInteractions : function () {
		var _this = this;
		setInterval(function () {
			if ((_this._interactions).length > 0) {
				$.post(socialskip_urls.post_interactions, {
					data : JSON.stringify(_this._interactions)
				});
			}
			/*
			for (var i=0;i<_this._interactions.length;i++) {
				console.log(JSON.stringify(_this._interactions[i]));
			}
			*/
			_this._interactions = [];

		}, 15000);

		window.onunload = function () {
			if ((_this._interactions).length > 0) {
				$.post(socialskip_urls.post_interactions, {
					data : JSON.stringify(_this._interactions)
				});
			}
		};
	},

	update : function () {
		var id = this._id;
		var _this = this;
		var yt_player = this._youtube_player;
		var updateInterval = setInterval(function () {
			var level = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-progress");
			var sliderWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width()
			level.width(((_this.getCustomCurrentTime()) / _this.getCustomDuration()) * sliderWidth);
			if (yt_player.getCurrentTime() >= _this._time_trimmer.end) {
				yt_player.stopVideo();
				_this.changeCustomState("ended");
			}

			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-current-time").text(toTime(_this.getCustomCurrentTime()));

			if (_this._experiment._has_start) {
				var date = new Date();
				if (_this._experiment.getInteractionTime() > 0) {
					var timeRemain = _this._experiment.getInteractionTime() - ((date.getTime() - _this._experiment._start_at) / 1000);

					$("#socialskip-id-" + _this._id + " .socialskip-remaining-time > input").val("Remaining time: " + toTime(timeRemain));
					if (timeRemain < 0) {
						_this._experiment.finished();
						$("#socialskip-video-player-id-" + id + " .socialskip-video-player-current-time");
						clearInterval(updateInterval);
					}
				}
			}

		}, 500)
	},

	getCustomCurrentTime : function () {
		var cur_time = this._youtube_player.getCurrentTime() - this._time_trimmer.start;
		if (this._custom_state == "ended") {
			cur_time = this.getCustomDuration();
		}
		return cur_time;
	},

	getCustomDuration : function () {
		return this._time_trimmer.end - this._time_trimmer.start;
	},

	changeCustomState : function (new_state) {
		var id = this._id;
		this._custom_state = new_state;
		if (new_state == "ended") {
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-overlay").css("background-image", "url('http://img.youtube.com/vi/" + this._url.substr(this._url.lastIndexOf('/') + 1) + "/hqdefault.jpg')");
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-big-play-btn").fadeIn(100);
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-playpause").addClass('socialskip-video-player-replay').removeClass('socialskip-video-player-play socialskip-video-player-pause');
		} else {
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-overlay").css("background-image", "none");
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-big-play-btn").fadeOut(100);
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-overlay").removeClass("socialskip-video-player-overlay-on");
			if (new_state == "playing") {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-playpause").removeClass('socialskip-video-player-replay socialskip-video-player-play').addClass('socialskip-video-player-pause');
			} else if (new_state == "paused") {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-playpause").removeClass('socialskip-video-player-replay socialskip-video-player-pause').addClass('socialskip-video-player-play');
			}

		}
	},

    generateHTML : function () {
        var id = this._id;
        var html = [
            '<div id="socialskip-video-player-id-' + id + '" class="socialskip-video-player-wrapper">',
        		'<div id="socialskip-youtube-video-id-' + id + '" class="socialskip-youtube-video"></div>',
				'<div class="socialskip-video-player-overlay socialskip-video-player-overlay-on">',
					'<div class="socialskip-video-player-big-play-btn"></div>',
				'</div>',
        		'<div class="socialskip-video-player-controls">',
        			'<div class="socialskip-video-player-slider">',
        				'<div class="socialskip-video-player-slider-progress"></div>',
						'<div class="socialskip-video-player-slider-timebox"></div>',
						'<div class="socialskip-video-player-slider-msg">Press START to enable slider.</div>',
        			'</div>',
        			'<div class="socialskip-video-player-controls-left">',
        				'<div class="socialskip-video-player-playpause socialskip-video-player-play"></div>',
        				'<div class="socialskip-video-player-volume-icon socialskip-video-player-volume-full-icon"></div>',
        				'<div class="socialskip-video-player-volume-bar">',
        					'<div class="socialskip-video-player-volume-slider">',
        						'<div class="socialskip-video-player-volume-level"></div>',
        					'</div>',
        				'</div>',
						'<div class="socialskip-video-player-time">',
							'<div>',
								'<span class="socialskip-video-player-current-time"></span>',
								'/',
								'<span class="socialskip-video-player-duration"></span>',
							'</div>',
						'</div>',
        			'</div>',
        			'<div class="socialskip-video-player-controls-right">',
        				'<div class="socialskip-video-player-options"></div>',
        				'<div class="socialskip-video-player-options-box">',
        					'<div class="socialskip-video-player-options-menu">',
        						'<div class="socialskip-video-player-speed">',
        							'<div>Speed</div>',
        							'<div>',
        								'<span class="socialskip-video-player-selected-speed">1</span>',
        							'</div>',
        						'</div>',
        						'<div class="socialskip-video-player-quality">',
        							'<div>Quality</div>',
        							'<div>',
        								'<span class="socialskip-video-player-selected-quality"></span>',
        							'</div>',
        						'</div>',
        					'</div>',
        					'<div class="socialskip-video-player-quality-box">',
        						'<span>Quality</span>',
        						'<hr>',
        						'<ul class="socialskip-video-player-quality-list">',
        						'</ul>',
        					'</div>',
        					'<div class="socialskip-video-player-speed-box">',
        						'<span>Speed</span>',
        						'<hr>',
        						'<ul class="socialskip-video-player-speed-list">',
        						'</ul>',
        					'</div>',
        				'</div>',
        				'<div class="socialskip-video-player-fullscreen socialskip-video-player-fullscreen-on"></div>',
        			'</div>',
        		'</div>',
        	'</div>'
		];

        return html.join("");
    },

	addInteraction : function (interaction_type, video_time, jump) {
		var today = new Date();

		if (this._experiment._has_start) {
			if (interaction_type == "play") {
				this._interactions.push({
					'expid': this._id,
					'tester': cookie.tester_id,
					'code': '3',
					'vtime': video_time,
					'ctime': today.getTime(),
					'jump': 0
				});
			} else if (interaction_type == "pause") {
				this._interactions.push({
					'expid': this._id,
					'tester': cookie.tester_id,
					'code': '4',
					'vtime': video_time,
					'ctime': today.getTime(),
					'jump': 0
				});
			} else if (interaction_type == "forward") {
				this._interactions.push({
					'expid': this._id,
					'tester': cookie.tester_id,
					'code': '2',
					'vtime': video_time,
					'ctime': today.getTime(),
					'jump': jump
				});
			} else if (interaction_type == "backward") {
				this._interactions.push({
					'expid': this._id,
					'tester': cookie.tester_id,
					'code': '1',
					'vtime': video_time,
					'ctime': today.getTime(),
					'jump': jump
				});
			}
		}
	},

	responsive : function() {
			var _this = this;

			var width = ($(window).width() > 600) ? 600 : $(window).width() - 10;
			_this.changeSize(width);

			$(window).resize(function() {
				if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
					var width = ($(window).width() > 600) ? 600 : $(window).width() - 10;
					_this.changeSize(width);
				}
			});
	},

	changeSize : function(width) {
		this._width = width;
		this._height = parseInt(width * 9/16);

		var id = this._id;

		$("#socialskip-video-player-id-" + id).width(width + "px");
		$("#socialskip-video-player-id-" + id).height(width * 9/16 + "px");
		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").width(width + "px");

		$("#socialskip-youtube-video-id-" + id).attr("width", width);
		$("#socialskip-youtube-video-id-" + id).attr("height", width * 9/16);

		$("#socialskip-questionnaire-id-" + id + " iframe").attr("width", width);
		$("#socialskip-info-id-" + id + " iframe").attr("width", width);

		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width(width - 12 + "px");
	},

    generateCSS : function () {
        var id = this._id;
        var colors = this._colors;

		// check if colors exists else fill default colors
		colors.icon = (colors.icon == "") ? "#E6E0DF" : colors.icon;
		colors.progress = (colors.progress == "") ? "#00B3FF" : colors.progress;
		colors.background = (colors.background == "") ? "#454545" : colors.background;

        $("#socialskip-video-player-id-" + id).width(this._width + "px");
		$("#socialskip-video-player-id-" + id).height(this._height + "px");
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").hide();
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").css("background-color", colors.background);
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").css("color", colors.icon);
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-box").css("background-color", colors.background);
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-box").css("color", colors.icon);
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").css("background-color", colors.icon);
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-progress").css("background-color", colors.progress);
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").css("background-color", colors.icon);
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-level").css("background-color", colors.progress);
		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-overlay").css("background-image", "url('http://img.youtube.com/vi/" + this._url.substr(this._url.lastIndexOf('/') + 1) + "/hqdefault.jpg')");
		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-big-play-btn").css("background-color", colors.background);
		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-time").css("color", colors.icon);

        var css = [
            '#socialskip-video-player-id-' + id + ' .socialskip-video-player-slider-progress:after,',
            '#socialskip-video-player-id-' + id + ' .socialskip-video-player-volume-level:before',
            '{',
            '   background-color: ', colors.progress,
            '}',
            "#socialskip-video-player-id-" + id + " .socialskip-video-player-li-selected",
            '{',
            '   background-color: ', colors.progress, ';',
            '   border-radius: 5px',
            '}',
			"#socialskip-id-" + id + " .socialskip-start-btn",
            '{',
            '   background-color: ', colors.background, ';',
			'   color: ', colors.icon, ';',
            '}',
			"#socialskip-video-player-id-" + id + " .socialskip-video-player-controls",
			'{',
			'    width: ', this._width, 'px;',
			'    height: 36px;',
			'}',
			"#socialskip-video-player-id-" + id + " .socialskip-video-player-slider",
			'{',
		    '    width: ', this._width - 12, 'px;',
		    '}',
			"#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-timebox",
            '{',
            '   background-color: ', colors.background, ';',
			'   color: ', colors.icon, ';',
			'	-ms-transform: translateX(-50%); ',
    		'	-webkit-transform: translateX(-50%); ',
    		'	transform: translateX(-50%);',
            '}',
			"#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-msg",
            '{',
            '   background-color: ', colors.background, ';',
			'   color: ', colors.progress, ';',
            '}',
			'.socialskip-video-player-big-play-btn:before {',
			'    color: ', colors.icon, ';',
			'}'
        ].join("");

        $('html > head').append("<style>" + css + "</style>");
    },


    bindControlsEvents : function () {
        var id = this._id;
		var _this = this;
		var yt_player = this._youtube_player;

        $("#socialskip-video-player-id-" + id).hover(function () {
			var timeout = null;
			$("#socialskip-video-player-id-" + id).on('mousemove', function() {
				clearTimeout(timeout);
				if(!$("#socialskip-video-player-id-" + id + " .socialskip-video-player-overlay").hasClass("socialskip-video-player-overlay-on")) {
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").fadeIn(300);
				}
				timeout = setTimeout(function() {
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").fadeOut(300);
				}, 3000);
			});
        }, function () {
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").fadeOut(300);
        });

		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-overlay").click(function () {
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-playpause").trigger("click");
			$("#socialskip-video-player-id-" + id).trigger("mouseenter");
        });

		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-fullscreen").click(function() {
			var player_element = document.getElementById("socialskip-video-player-id-" + id);

			if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) { // full-screen available?
				if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {

					if (player_element.requestFullScreen) {
						player_element.requestFullScreen();
					} else if (player_element.mozRequestFullScreen) {
						player_element.mozRequestFullScreen();
					} else if (player_element.webkitRequestFullScreen) {
						player_element.webkitRequestFullScreen();
					} else if (player_element.msRequestFullscreen) {
						player_element.msRequestFullscreen();
					}

					yt_player.setSize(screen.width, screen.height);
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").width(screen.width + "px");
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width(screen.width - 12 + "px");
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-fullscreen").addClass("socialskip-video-player-fullscreen-on").removeClass("socialskip-video-player-fullscreen-off");

					$(document).on('webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange', function(e) {
						if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
							yt_player.setSize(_this._width, _this._height);
							$("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").width(_this._width + "px");
							$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width(_this._width - 12 + "px");
							$("#socialskip-video-player-id-" + id + " .socialskip-video-player-fullscreen").removeClass("socialskip-video-player-fullscreen-off").addClass("socialskip-video-player-fullscreen-on");
							$(document).off('webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange');
						}
					});
				} else {
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
					}
					yt_player.setSize(_this._width, _this._height);
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-controls").width(_this._width + "px");
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width(_this._width - 12 + "px");
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-fullscreen").removeClass("socialskip-video-player-fullscreen-on").addClass("socialskip-video-player-fullscreen-off");
					$(document).off('webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange');
				}
			}
		});

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-playpause").click(function () {
			if ($(this).hasClass("socialskip-video-player-replay")) {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-overlay").css("background-image", "none");
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-big-play-btn").fadeOut(100);
			}
			if (yt_player.getPlayerState() != YT.PlayerState.PLAYING) {
				_this.addInteraction("play", Math.round(yt_player.getCurrentTime()), 0);
				yt_player.playVideo();
				if (_this._custom_state == "unstarted" || _this._custom_state == "ended") {
					yt_player.seekTo(_this._time_trimmer.start, true);
				}
				_this.changeCustomState("playing");
			} else {
				_this.addInteraction("pause", Math.round(yt_player.getCurrentTime()), 0);
				yt_player.pauseVideo();
				_this.changeCustomState("paused");
			}
        });

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-fullscreen").click(function () {
            if ($(this).hasClass("socialskip-video-player-fullscreen-on")) {
                $(this).addClass('socialskip-video-player-fullscreen-off').removeClass('socialskip-video-player-fullscreen-on');
			} else {
				$(this).addClass('socialskip-video-player-fullscreen-on').removeClass('socialskip-video-player-fullscreen-off');
			}
        });

        var volumeSliderTimeout;
		var lastVolumeLevel = 100;

		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").click(function (e) {
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").removeClass("socialskip-video-player-volume-full-icon socialskip-video-player-volume-mute-icon socialskip-video-player-volume-low-icon socialskip-video-player-volume-medium-icon");

			if ($("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").hasClass("socialskip-video-player-volume-mute-on")) {
				yt_player.setVolume(lastVolumeLevel);
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").removeClass("socialskip-video-player-volume-mute-on");
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-level").css("width", (lastVolumeLevel / 100) * 60 + "px")
				if (lastVolumeLevel < 33) {
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-low-icon");
				} else if (lastVolumeLevel < 66) {
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-medium-icon");
				} else {
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-full-icon");
				}
			} else {
				yt_player.setVolume(0);
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-mute-icon socialskip-video-player-volume-mute-on");
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-level").css("width", "0px")
			}

		});

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").click(function (e) {
            var posX = $(this).offset().left;
			var newWidth = e.pageX - posX;
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-level").css("width", newWidth + "px");
			var levelWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-level").width()
			var sliderWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").width()
			var volumnePercent = (levelWidth / sliderWidth) * 100;
			lastVolumeLevel = parseInt(volumnePercent);
			yt_player.setVolume(parseInt(volumnePercent));
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").removeClass("socialskip-video-player-volume-mute-on socialskip-video-player-volume-full-icon socialskip-video-player-volume-mute-icon socialskip-video-player-volume-low-icon socialskip-video-player-volume-medium-icon");
			if (volumnePercent == 0) {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-mute-icon");
			} else if (volumnePercent < 33) {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-low-icon");
			} else if (volumnePercent < 66) {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-medium-icon");
			} else {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-full-icon");
			}
        });

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").mousedown(function (e) {
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").bind('mousemove', function(e) {
                clearTimeout(volumeSliderTimeout);
                var posX = $(this).offset().left;
                var width = (e.pageX - posX > 60) ? 60 : e.pageX - posX;
                $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-level").css("width", width + "px")
                var levelWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-level").width()
                var sliderWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").width()
                var volumnePercent = (levelWidth / sliderWidth) * 100;
				lastVolumeLevel = parseInt(volumnePercent);
				yt_player.setVolume(parseInt(volumnePercent));
                $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").removeClass("socialskip-video-player-volume-mute-on socialskip-video-player-volume-full-icon socialskip-video-player-volume-mute-icon socialskip-video-player-volume-low-icon socialskip-video-player-volume-medium-icon");

                if (volumnePercent == 0) {
                    $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-mute-icon");
                } else if (volumnePercent < 33) {
                    $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-low-icon");
                } else if (volumnePercent < 66) {
                    $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-medium-icon");
                } else {
                    $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon").addClass("socialskip-video-player-volume-full-icon");
                }
            });

            $(document).bind('mouseup',function(){
                $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").unbind('mousemove');
            });
        });

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options").click(function () {
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-box").toggle();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-menu").show();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-speed-box").hide();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-quality-box").hide();

			var qualities = {
				'small' : '240p',
				'medium' : '360p',
				'large' : '480p',
				'hd720' : '720p HD',
				'hd1080' :  '1080p HD'
			}
			var reverse_qualities = {
				'240p' : 'small',
				'360p' : 'medium',
				'480p' : 'large',
				'720p HD' : 'hd720',
				'1080p HD' : 'hd1080'
			}

			var availableQuality = yt_player.getAvailableQualityLevels();

			var current_quality = yt_player.getPlaybackQuality();
			if ($("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-selected-quality").text() != "") {
				current_quality = reverse_qualities[$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-selected-quality").text()];
			}

			if (availableQuality.length > 0) {
				$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-quality-list").empty();
				for (var i=0;i<availableQuality.length;i++) {
					if (qualities.hasOwnProperty(availableQuality[i])) {
						if (current_quality == availableQuality[i]) {
							$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-quality-list").append('<li class="socialskip-video-player-li-selected" data-value="' + availableQuality[i] + '">' + qualities[availableQuality[i]] + '</li>');
						} else {
							$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-quality-list").append('<li data-value="' + availableQuality[i] + '">' + qualities[availableQuality[i]] + '</li>');
						}
						$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-selected-quality").text(qualities[current_quality]);
					}
				}
			}

			var availableSpeeds = yt_player.getAvailablePlaybackRates();

			$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-speed-list").empty();
			for (var i=availableSpeeds.length -1;i>=0;i--) {
				if (yt_player.getPlaybackRate() == availableSpeeds[i]) {
					$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-speed-list").append('<li class="socialskip-video-player-li-selected" data-value="' + availableSpeeds[i] + '">' + availableSpeeds[i] + 'x</li>');
				} else {
					$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-speed-list").append('<li data-value="' + availableSpeeds[i] + '">' + availableSpeeds[i] + 'x</li>');
				}
				$("#socialskip-video-player-id-" + _this._id + " .socialskip-video-player-selected-speed").text(yt_player.getPlaybackRate() + "x");
			}
        });

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-speed").click(function () {
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-menu").hide();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-speed-box").show();
        });

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-quality").click(function () {
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-menu").hide();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-quality-box").show();
        });

        $(document).on("click", "#socialskip-video-player-id-" + id + " .socialskip-video-player-speed-box li", function () {
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-menu").show();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-speed-box").hide();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-selected-speed").text($(this).text());
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-speed-box li").removeClass("socialskip-video-player-li-selected");
            $(this).addClass("socialskip-video-player-li-selected");
			yt_player.setPlaybackRate($(this).attr("data-value"));
        });

        $(document).on("click", "#socialskip-video-player-id-" + id + " .socialskip-video-player-quality-box li", function () {
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-options-menu").show();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-quality-box").hide();
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-selected-quality").text($(this).text());
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-quality-box li").removeClass("socialskip-video-player-li-selected");
            $(this).addClass("socialskip-video-player-li-selected");
			yt_player.setPlaybackQuality($(this).attr("data-value"));
        });

		var initialVideoTime;
		var disableSliderTimeout;
        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").click(function (e) {
			if (_this._experiment._has_start) {
				initialVideoTime = _this.getCustomCurrentTime();
	            var posX = $(this).offset().left;
	            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-progress").css("width", e.pageX - posX + "px");
				var levelWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-progress").width();
				var sliderWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width();
				var newPos = (levelWidth / sliderWidth) * _this.getCustomDuration();
				var seekto = parseInt(newPos) + _this._time_trimmer.start;

				yt_player.seekTo(seekto, true);
				if (_this._custom_state == "ended") {
					_this.changeCustomState("playing");
				}
				var skip = parseInt(newPos - initialVideoTime);
				if (skip > 0) {
					_this.addInteraction("forward", seekto, skip);
				} else {
					_this.addInteraction("backward", seekto, -skip);
				}
			} else {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-msg").fadeIn(200);
				clearTimeout(disableSliderTimeout);
				disableSliderTimeout = setTimeout(function () {
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-msg").fadeOut(200);

				}, 2000);
			}
        });

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").mousedown(function (e) {
			if (_this._experiment._has_start) {
				initialVideoTime = _this.getCustomCurrentTime();
				var mouse_move = false;
	            $("#socialskip-video-player-id-" + id).bind('mousemove', function (e) {
	                var posX = $(this).offset().left;
	                var width = (e.pageX - posX > $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width()) ? $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width() : e.pageX - posX;
	                $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-progress").css("width", width + "px");
					mouse_move = true;
	            });

	            $(document).bind('mouseup', function () {
					$("#socialskip-video-player-id-" + id).unbind('mousemove');
					$(document).unbind('mouseup');
					var levelWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-progress").width()
	                var sliderWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width()
	                var newPos = (levelWidth / sliderWidth) * (_this.getCustomDuration());
					var seekto = parseInt(newPos) + _this._time_trimmer.start;

					yt_player.seekTo(seekto, true);

					if (_this._custom_state == "ended") {
						_this.changeCustomState("playing");
					}

					if (mouse_move) {
						var skip = parseInt(newPos - initialVideoTime);

						if (skip > 0) {
							_this.addInteraction("forward", seekto, skip);
						} else {
							_this.addInteraction("backward", seekto, -skip);
						}
					}
	            });
			} else {
				$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-msg").fadeIn(200);
				clearTimeout(disableSliderTimeout);
				disableSliderTimeout = setTimeout(function () {
					$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-msg").fadeOut(200);
				}, 3000);
			}
        });

		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").mousemove(function (e) {
			var posX = $(this).offset().left;
			var sliderWidth = $("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").width();
			var pos = ((e.pageX - posX) / sliderWidth) * _this.getCustomDuration();
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-timebox").show();
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-timebox").text(toTime(parseInt(pos)));
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-timebox").css({"left": e.pageX - posX + "px"})
		});
		$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider").mouseout(function (e) {
			$("#socialskip-video-player-id-" + id + " .socialskip-video-player-slider-timebox").hide();
		});

        $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-icon, #socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").hover(function () {
			clearTimeout(volumeSliderTimeout);
            $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").fadeIn(400);
        }, function () {
            volumeSliderTimeout = setTimeout(function () {
                $("#socialskip-video-player-id-" + id + " .socialskip-video-player-volume-slider").fadeOut(300);
            }, 2000);
        });
    }
}

//This function converts seconds to minutes or hours
function toTime(secs) {
	var t = new Date(0,0,0);
	t.setSeconds(secs);
	if (secs <= 3600) {
		return t.toTimeString().substr(3,5);
	} else {
		return t.toTimeString().substr(0,8);
	}
}

var socialskip_static_css = [
	'@font-face {',
    '    font-family: "SocialSkip";',
    '    src: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiID4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8bWV0YWRhdGE+R2VuZXJhdGVkIGJ5IEljb01vb248L21ldGFkYXRhPgo8ZGVmcz4KPGZvbnQgaWQ9IlNvY2lhbFNraXAiIGhvcml6LWFkdi14PSIxMDI0Ij4KPGZvbnQtZmFjZSB1bml0cy1wZXItZW09IjEwMjQiIGFzY2VudD0iOTYwIiBkZXNjZW50PSItNjQiIC8+CjxtaXNzaW5nLWdseXBoIGhvcml6LWFkdi14PSIxMDI0IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4MjA7IiBob3Jpei1hZHYteD0iNTEyIiBkPSIiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTAwOyIgZ2x5cGgtbmFtZT0icmVsb2FkIiBob3Jpei1hZHYteD0iMTA5NyIgZD0iTTEwMjIuMDE4IDkzMy4wNTJjLTMuMzAzLTMuMzAzLTE5LjQ4OS0xNi4xODYtMzUuMzQ1LTI5LjA2OC0xNi4xODYtMTIuNTUyLTMxLjcxMS0yNS40MzUtMzUuMDE0LTI4LjA3N3MtMTAuOTAxLTguNTg4LTE2Ljg0Ni0xMy4yMTNjLTUuOTQ2LTQuNjI1LTEzLjU0My0xMC41Ny0xNi41MTYtMTMuMjEzLTMuMzAzLTIuNjQzLTExLjU2MS05LjI0OS0xOC40OTgtMTQuODY1LTYuOTM3LTUuMjg1LTE1LjUyNS0xMi4yMjItMTkuMTU5LTE1LjE5NS02LjkzNy01LjYxNS05LjI0OS00LjI5NC00My4yNzIgMjIuNzkyLTguMjU4IDYuNjA2LTU0LjgzNCAzMy4zNjMtNzIuNjcxIDQxLjYyMS0zMy4wMzIgMTUuNTI1LTUxLjIgMjEuODAxLTg5LjE4NyAzMS43MTEtOTguNDM2IDI1LjEwNS0yMTAuNzQ2IDE3LjgzNy0zMDIuMjQ1LTE5LjgxOS02NS43MzQtMjcuMDg2LTExNy41OTUtNjEuNDQtMTY2LjgxMy0xMTAuNjU4LTc2LjYzNS03Ni45NjUtMTIyLjU1LTE2NS40OTItMTQxLjcwOC0yNzQuNDk4LTcuOTI4LTQyLjk0Mi02LjI3Ni0xMjYuODQ0IDMuMzAzLTE3My4wODkgMTcuNTA3LTg2LjIxNCA1Mi44NTItMTU5LjIxNSAxMTAuNjU4LTIyNi45MzIgMTguMTY4LTIxLjE0MSAyOS43MjktMzIuMzcyIDY0LjA4My02Mi4xMDEgMjcuNDE3LTIzLjQ1MyA4My4yNDEtNTUuODI1IDEzNS40MzItNzcuOTU2IDIwLjE1LTguNTg4IDczLjY2Mi0yMi40NjIgMTA3LjM1NS0yNy43NDcgNjQuMDgzLTEwLjI0IDE4Mi42NjggMS42NTIgMjMyLjg3NyAyMy4xMjMgNS42MTUgMi4zMTIgMTMuNTQzIDUuMjg1IDE4LjE2OCA2LjYwNiA0Mi42MTIgMTIuNTUyIDEyMS41NTkgNjMuNzUyIDE2NS4xNjEgMTA3LjM1NSAzNy42NTcgMzcuMzI2IDQzLjYwMyA0NC4yNjMgNjUuMDc0IDc2LjMwNSAyNS4xMDUgMzcuNjU3IDU3LjgwNiAxMDIuNzMgNTMuNTEyIDEwNy4wMjUtMS4zMjEgMC45OTEtNTEuNTMgMTQuNTM0LTY0LjA4MyAxNi44NDYtMy42MzQgMC42NjEtMzAuMDU5IDYuOTM3LTU4LjQ2NyAxMy44NzRsLTUyLjE5MSAxMi44ODMtNS45NDYtMTAuMjRjLTMuMzAzLTUuNjE1LTYuOTM3LTEyLjg4My04LjI1OC0xNi4xODYtMTEuMjMxLTI5LjcyOS03Mi4zNDEtOTQuNDcyLTExMC42NTgtMTE3LjI2NS0yMy40NTMtMTMuODc0LTY0Ljc0My0zMi4wNDEtNzkuOTM4LTM0LjY4NC00LjYyNS0wLjk5MS0xMC41Ny0yLjY0My0xMy4yMTMtMy42MzQtMjEuMTQxLTcuNTk3LTkwLjUwOC05LjU3OS0xMjQuMjAxLTMuNjM0LTEzNC40NDEgMjMuNzgzLTIzMC44OTUgMTE5LjU3Ny0yNTcuNjUyIDI1Ni0zLjk2NCAyMC44MS00LjI5NCA5My4xNTEtMC4zMyAxMDcuNjg1IDAuOTkxIDMuOTY0IDIuNjQzIDEyLjIyMiAzLjYzNCAxOC4xNjggNy41OTcgNDguNTU3IDQyLjk0MiAxMTMuNjMxIDgzLjkwMiAxNTQuNTkxIDc3Ljk1NiA3OC45NDcgMTc2LjA2MiAxMDkuMDA2IDI4OS4zNjMgODguMTk2IDIyLjEzMi0zLjk2NCA3Mi4wMTAtMjQuNDQ0IDk1LjQ2My0zOC45NzhsMTIuNTUyLTcuOTI4LTIwLjgxLTE2LjE4NmMtMTEuNTYxLTguOTE5LTIxLjQ3MS0xNy4xNzctMjIuNDYyLTE4LjE2OHMtMTUuODU1LTEyLjg4My0zMy4wMzItMjYuNDI2Yy0xNy4xNzctMTMuNTQzLTMyLjA0MS0yNS40MzUtMzMuMDMyLTI2LjQyNnMtMTMuMjEzLTEwLjkwMS0yNy43NDctMjIuNDYyYy0xNC4yMDQtMTEuMjMxLTI1LjQzNS0yMC40OC0yNC43NzQtMjAuODEgMC42NjEgMCAzLjYzNC0wLjY2MSA2LjI3Ni0xLjMyMXMxOC40OTgtMy4zMDMgMzQuNjg0LTYuMjc2YzE2LjUxNi0yLjk3MyAzNy45ODctNy4yNjcgNDcuODk3LTguOTE5IDkuOTEtMS45ODIgMjEuMTQxLTMuOTY0IDI0Ljc3NC00LjYyNSAzLjYzNC0wLjMzIDIyLjEzMi0zLjk2NCA0MS4yOS03LjU5NyAxOS4xNTktMy45NjQgMzguMzE3LTcuNTk3IDQyLjk0Mi04LjU4OCAxOC4xNjgtMi45NzMgODQuODkzLTE1LjE5NSA5Mi40OS0xNi44NDYgNC42MjUtMC45OTEgMTcuMTc3LTMuMzAzIDI4LjA3Ny00Ljk1NSAxMC45MDEtMS45ODIgMzAuMzktNS42MTUgNDIuOTQyLTguMjU4IDEyLjg4My0yLjY0MyAyOC40MDgtNS42MTUgMzQuNjg0LTYuNjA2IDE0LjUzNC0yLjMxMiA0My45MzMtNy45MjggNjAuNDQ5LTExLjU2MWwxMi4yMjItMi42NDN2MjI5LjI0NGMwIDI0My43NzggMC4zMyAyMzcuNTAyLTE1LjE5NSAyMjMuNjI4eiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5MDE7IiBnbHlwaC1uYW1lPSJwcm9ncmVzcy1iYXItaWNvbiIgaG9yaXotYWR2LXg9IjEwOTciIGQ9Ik00ODMuOTIzIDc1My42ODZjLTM1LjAxNC03LjU5Ny01OS40NTgtMTYuODQ2LTkwLjUwOC0zMy4zNjMtMjcuMDg2LTE0LjIwNC0zMy4wMzItMTguNDk4LTYxLjExLTQyLjYxMi03NC42NTMtNjQuMDgzLTExNS45NDMtMTU5LjIxNS0xMTIuMzEtMjYwLjI5NCA1LjI4NS0xNTQuMjYxIDEyMS44ODktMjg4LjA0MSAyNzMuMTc3LTMxMi44MTUgMjQuNzc0LTQuMjk0IDkyLjgyMS00LjYyNSAxMTQuNjIyLTAuNjYxIDMzLjY5MyA2LjI3NiA4Mi4yNSAyNC40NDQgMTEyLjMxIDQyLjk0MiAxNjIuMTg4IDk4Ljc2NiAyMDkuMDk0IDMwOS44NDMgMTA0LjA1MiA0NjguMDY3LTM3LjY1NyA1Ni40ODUtOTcuNzc1IDEwMi40LTE2OC40NjUgMTI4LjE2NS00NC41OTQgMTYuNTE2LTEyMy4yMSAyMS4xNDEtMTcxLjc2OCAxMC41N3oiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTAyOyIgZ2x5cGgtbmFtZT0icGxheSIgaG9yaXotYWR2LXg9IjEwOTciIGQ9Ik0xMzguNzM1IDkwMC4wMTljLTAuNjYxLTkuNTc5IDAuMzMtOTQzLjczMiAwLjk5MS05NDQuMzkyIDAuNjYxLTAuMzMgNTQuMTczIDMwLjA1OSAxMTYuMjc0IDY2LjM5NSAyNi40MjYgMTUuNTI1IDIwNS43OTEgMTE5LjI0NiAyMzEuMjI2IDEzMy43ODEgMTQuMjA0IDguMjU4IDEyOS4xNTYgNzQuNjUzIDE2OC40NjUgOTcuNDQ1IDY4LjcwNyAzOS42MzkgMTE3LjI2NSA2Ny43MTYgMTI4LjQ5NSA3My45OTIgNi4yNzYgMy42MzQgMTcuNTA3IDEwLjI0IDI0Ljc3NCAxNC44NjUgNy4yNjcgNC45NTUgMTQuMjA0IDguNTg4IDE1LjE5NSA4LjU4OCAwLjY2MSAwIDE2LjE4NiA4LjkxOSAzNC4zNTQgMTkuNDg5IDE4LjE2OCAxMC45MDEgMzkuMzA4IDIzLjEyMyA0Ni45MDYgMjcuNDE3czE2LjE4NiA5LjI0OSAxOS4xNTkgMTAuOTAxYzIuOTczIDEuOTgyIDEyLjU1MiA3LjU5NyAyMS40NzEgMTIuNTUybDE1Ljg1NSA5LjU3OS05Mi4xNiA1Mi44NTJjLTEzNy43NDUgNzkuMjc3LTI4NS43MjkgMTY0LjgzMS0zMzkuNTcyIDE5NS44ODEtNjYuNzI1IDM4LjY0OC0xODIuMDA4IDEwNS4wNDMtMTk2LjU0MiAxMTMuMzAxLTguMjU4IDQuNjI1LTQyLjI4MSAyNC4xMTQtNzUuOTc0IDQzLjYwMy04Mi45MTEgNDcuODk3LTExNC45NTIgNjYuMDY1LTExNy4yNjUgNjYuMDY1LTAuOTkxIDAtMS42NTItMC45OTEtMS42NTItMi4zMTJ6IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4ZTkwMzsiIGdseXBoLW5hbWU9InBhdXNlIiBob3Jpei1hZHYteD0iMTA5NyIgZD0iTTEzNS40MzIgNDMxLjYyMnYtNDc0LjAxM2gyNTEuMDQ1djk0OC4wMjZoLTI1MS4wNDV2LTQ3NC4wMTN6TTcwNi44OSA0MzEuNjIydi00NzQuMDEzaDI1MS4wNDV2OTQ4LjAyNmgtMjUxLjA0NXYtNDc0LjAxM3oiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlOTA0OyIgZ2x5cGgtbmFtZT0iZ2VhciIgaG9yaXotYWR2LXg9IjEwOTciIGQ9Ik00OTQuODIzIDkxMy44OTNjLTAuOTkxLTEuMzIxLTE2Ljg0Ni0zLjk2NC0yNC40NDQtNC42MjUtMi4zMTItMC4zMy00LjYyNS0xMS41NjEtNi4yNzYtMjkuMDY4LTEuMzIxLTE2LjE4Ni0yLjY0My0zMS4zODEtMy4zMDMtMzQuMDIzcy0xLjk4Mi0xNy4xNzctMy4zMDMtMzIuMzcyYy0xLjMyMS0xNS4xOTUtMi42NDMtMzAuMDU5LTIuOTczLTMyLjcwMi0wLjY2MS0yLjk3My02LjYwNi03LjU5Ny0xMy44NzQtMTAuMjQtNi45MzctMi42NDMtMjUuNDM1LTkuOTEtNDAuNjMtMTYuNTE2LTE1LjE5NS02LjI3Ni0yOC40MDgtMTAuMjQtMjkuNzI5LTguNTg4LTAuOTkxIDEuNjUyLTEyLjIyMiAxMS4yMzEtMjUuMTA1IDIxLjE0MS0xMi41NTIgOS45MS0yMy43ODMgMTguODI4LTI0Ljc3NCAxOS44MTlzLTEyLjg4MyAxMC45MDEtMjYuNDI2IDIyLjEzMmwtMjUuMTA1IDIwLjE1LTEyLjg4My05LjU3OWMtMzAuNzItMjIuNzkyLTYzLjA5Mi01My41MTItOTAuNTA4LTg2Ljg3NS0xNC4yMDQtMTcuNTA3LTE0LjUzNC0xNS44NTUgMS45ODItMzUuMDE0IDMuNjM0LTQuNjI1IDIxLjgwMS0yNS43NjUgMzkuOTY5LTQ3LjIzNmwzMy4wMzItMzguOTc4LTEwLjkwMS0yMi4xMzJjLTUuOTQ2LTEyLjIyMi0xMi44ODMtMjguNDA4LTE1LjE5NS0zNi4zMzVzLTYuNjA2LTE1LjUyNS05LjI0OS0xNy4xNzdjLTIuOTczLTEuMzIxLTE3LjgzNy0zLjYzNC0zMy4zNjMtNC42MjUtMTUuNTI1LTEuMzIxLTMyLjM3Mi0yLjY0My0zNy45ODctMy4zMDMtNS4yODUtMC42NjEtMjEuODAxLTIuMzEyLTM2LjMzNS0zLjYzNHMtMjYuNzU2LTIuMzEyLTI3LjA4Ni0yLjY0M2MtMC4zMy0wLjMzLTEuOTgyLTExLjIzMS0zLjk2NC0yMy43ODMtNC4yOTQtMzAuNzItMS4zMjEtMTMwLjgwOCAzLjk2NC0xMzUuNzYzIDAuOTkxLTAuOTkxIDQwLjYzLTQuOTU1IDYwLjExOS02LjI3NiA5LjI0OS0wLjY2MSAyNy4wODYtMi4zMTIgMzkuNjM5LTMuNjM0IDEyLjg4My0xLjMyMSAyNi40MjYtMi42NDMgMzAuMDU5LTIuNjQzIDUuNjE1IDAgOC4yNTgtMy42MzQgMTIuODgzLTE2LjUxNiAzLjMwMy05LjI0OSAxMC41Ny0yNi43NTYgMTYuODQ2LTM4LjY0OGwxMC45MDEtMjEuODAxLTIzLjQ1My0yNy43NDdjLTEyLjg4My0xNS4xOTUtMzAuMDU5LTM1LjY3NS0zOC4zMTctNDUuMjU0LTMwLjcyLTM2LjAwNS0zMC4wNTktMjkuMzk5LTQuNjI1LTU4Ljc5NyAyNS43NjUtMzAuMzkgNDguNTU3LTUyLjE5MSA3NS4zMTQtNzIuMzQxbDE5LjE1OS0xNC4yMDQgNDEuMjkgMzMuNjkzYzIyLjc5MiAxOC4xNjggNDMuNjAzIDM1LjM0NSA0Ni4yNDUgMzcuNjU3IDE1LjE5NSAxNC4yMDQgMTguODI4IDE0Ljg2NSAzNy4zMjYgNS45NDYgOS41NzktNC42MjUgMjcuMDg2LTExLjg5MiAzOC42NDgtMTYuMTg2IDIzLjEyMy03LjkyOCAyMS44MDEtNS45NDYgMjUuMTA1LTQxLjk1MSA2LjI3Ni03My4zMzIgOC45MTktOTcuNDQ1IDkuOTEtOTguNDM2IDAuOTkxLTEuMzIxIDExLjg5Mi0yLjk3MyAzMS4zODEtNS42MTUgMTYuODQ2LTEuOTgyIDg0LjIzMi0yLjMxMiA5NC4xNDItMC4zMyAzLjYzNCAwLjk5MSAxMS44OTIgMS42NTIgMTguMTY4IDEuNjUyIDYuMjc2IDAuMzMgMTMuNTQzIDEuNjUyIDE2LjE4NiAzLjMwMyA0LjI5NCAyLjk3MyA0Ljk1NSA1LjYxNSA4LjU4OCA0OS44NzkgMC45OTEgMTMuNTQzIDIuNjQzIDMwLjA1OSAzLjMwMyAzNi4zMzUgMC45OTEgNi4yNzYgMi4zMTIgMjAuMTUgMy42MzQgMzAuMzkgMi4zMTIgMTkuMTU5IDIuMzEyIDE5LjE1OSAxNS44NTUgMjIuNzkyIDcuMjY3IDEuOTgyIDI1LjEwNSA4LjkxOSAzOC45NzggMTUuMTk1bDI1LjQzNSAxMS41NjEgNTEuNTMtNDEuNjIxYzI4LjA3Ny0yMi43OTIgNTMuMTgyLTQxLjYyMSA1NS40OTQtNDEuNjIxIDUuOTQ2IDAgNDUuMjU0IDMxLjcxMSA2Ny43MTYgNTQuODM0IDE5LjgxOSAyMC4xNSA0Ni45MDYgNTMuMTgyIDQ2LjkwNiA1Ni44MTUgMCAxLjMyMS00Ljk1NSA3LjU5Ny0xMC45MDEgMTMuODc0cy0yNS43NjUgMjkuMzk5LTQ0LjI2MyA1MS41M2wtMzMuMzYzIDM5LjYzOSA1Ljk0NiA4LjI1OGMyLjk3MyA0LjI5NCAxMC45MDEgMjEuMTQxIDE3LjUwNyAzNy4zMjYgMTEuMjMxIDI4LjQwOCAxMi4yMjIgMjkuNzI5IDIyLjc5MiAzMC4zOSA1Ljk0NiAwLjMzIDE5LjgxOSAxLjY1MiAzMC43MiAyLjk3MyAxMC45MDEgMC45OTEgMjkuMzk5IDIuOTczIDQxLjI5IDMuNjM0IDExLjg5MiAwLjk5MSAyNi4wOTUgMi4zMTIgMzEuMzgxIDIuOTczIDUuNjE1IDAuNjYxIDEyLjU1MiAxLjMyMSAxNS41MjUgMS4zMjEgMy42MzQgMC4zMyA2LjI3NiAzLjk2NCA3LjU5NyAxMS4yMzEgMC45OTEgNS42MTUgMi4zMTIgMTUuMTk1IDMuMzAzIDIwLjQ4IDEuOTgyIDExLjIzMSAyLjMxMiA3NS45NzQgMC4zMyA5Ni40NTQtMi45NzMgMjguNzM4LTQuOTU1IDM0LjAyMy0xNC41MzQgMzQuMzU0LTQuOTU1IDAtMTEuODkyIDAuNjYxLTE1LjUyNSAxLjMyMXMtMTcuMTc3IDEuOTgyLTI5LjcyOSAyLjk3M2MtNTUuODI1IDQuMjk0LTY5LjY5OCA1LjYxNS03NS45NzQgNi45MzctNC45NTUgMC45OTEtOC45MTkgNi42MDYtMTIuODgzIDE4LjgyOC0zLjYzNCA5LjU3OS0xMC45MDEgMjYuNzU2LTE2LjE4NiAzOC4zMTdsLTkuOTEgMjAuNDggNi42MDYgNy41OTdjMy42MzQgMy45NjQgMjMuMTIzIDI3LjA4NiA0My42MDMgNTEuMiAzNy4zMjYgNDMuNjAzIDM3LjMyNiA0My45MzMgMzEuNzExIDUyLjE5MS0yMi40NjIgMzQuMzU0LTEwNy42ODUgMTEyLjY0LTExMy42MzEgMTA0LjcxMi0wLjk5MS0xLjY1Mi05LjI0OS04LjU4OC0xOC40OTgtMTUuODU1LTguOTE5LTcuNTk3LTMxLjcxMS0yNS43NjUtNTAuNTM5LTQwLjk2bC0zMy42OTMtMjcuNzQ3LTI1Ljc2NSAxMS44OTJjLTEzLjg3NCA2LjI3Ni0zMS43MTEgMTMuMjEzLTM5LjMwOCAxNS4xOTUtMTEuMjMxIDIuOTczLTE0LjIwNCA1LjYxNS0xNC41MzQgMTEuMjMxIDAgMy45NjQtMC42NjEgOS41NzktMS4zMjEgMTIuNTUyLTAuMzMgMy4zMDMtMS45ODIgMTYuODQ2LTMuMzAzIDMwLjcyLTAuOTkxIDE0LjIwNC0yLjk3MyAzMy4wMzItMy42MzQgNDIuNjEyLTAuOTkxIDkuNTc5LTIuMzEyIDIyLjEzMi0yLjY0MyAyOC4wNzctMC45OTEgMTIuNTUyLTEuMzIxIDEyLjg4My0xMy41NDMgMTUuODU1LTkuOTEgMi4zMTItMTIyLjU1IDQuOTU1LTEyNC41MzIgMi45NzN6TTU3Mi4xMTkgNjE5LjkwNmM0NS41ODUtMy4zMDMgOTYuMTI0LTMyLjA0MSAxMjUuNTIzLTcxLjM1IDM0LjAyMy00NS41ODUgNDQuOTI0LTEwNS43MDMgMjguNzM4LTE1Ny44OTQtMzMuNjkzLTEwOS4zMzctMTU4LjIyNS0xNjAuODY3LTI2Mi45MzctMTA4LjY3NnMtMTMxLjEzOCAxOTAuNTk2LTUzLjE4MiAyNzguMTMyYzI5LjA2OCAzMi43MDIgNzMuMzMyIDU1LjgyNSAxMTUuNjEzIDYwLjExOSAxMS41NjEgMC45OTEgMjEuNDcxIDIuNjQzIDIyLjEzMiAzLjMwM3MyLjY0MyAwLjMzIDMuOTY0LTAuNjYxYzEuNjUyLTAuOTkxIDEwLjU3LTIuMzEyIDIwLjE1LTIuOTczeiIgLz4KPGdseXBoIHVuaWNvZGU9IiYjeGU5MDU7IiBnbHlwaC1uYW1lPSJmdWxsc2NyZWVuLW9uIiBob3Jpei1hZHYteD0iMTA5NyIgZD0iTTIuMzEyIDkwMC42OGMtMC4zMy0xLjY1Mi0wLjY2MS04MS45Mi0wLjY2MS0xNzguMzc0bDAuMzMtMTc1LjA3MSA2Ni4wNjUtMC45OTEgNjYuMDY1LTAuNjYxLTAuMzMgMTA5LjY2N2MwIDYwLjQ0OSAwLjMzIDExMS42NDkgMC42NjEgMTEzLjMwMSAwLjY2MSAxLjk4MiA0My4yNzIgMy4zMDMgMTE5LjkwNyAzLjMwM2wxMTguOTE2LTAuMzN2MTMyLjQ1OWgtMTg0Ljk4MWMtMTIzLjg3MSAwLTE4NS4zMTEtMC45OTEtMTg1Ljk3Mi0zLjMwM3pNNzI2LjcxIDkwMi45OTJjLTEuOTgyLTAuNjYxLTMuMzAzLTI1Ljc2NS0zLjMwMy02Ni4zOTV2LTY1LjA3NGwxMTQuOTUyIDAuMzNjNjMuMDkyIDAgMTE2LjkzNC0wLjMzIDExOS41NzctMC45OTEgNC4yOTQtMC45OTEgNC45NTUtMTUuODU1IDQuNjI1LTExMy4zMDFsLTAuMzMtMTExLjk3OSA2Ni4zOTUgMC42NjEgNjYuMDY1IDAuOTkxIDAuMzMgMTcxLjc2OGMwIDk0LjQ3Mi0wLjMzIDE3NC43NDEtMC45OTEgMTc4LjM3NC0wLjk5MSA2LjYwNi0yLjk3MyA2LjkzNy0xODIuNjY4IDYuNjA2LTk5Ljc1NyAwLTE4Mi42NjgtMC4zMy0xODQuNjUtMC45OTF6TTEwMTguNzE1IDMxNS4wMThsLTU2LjE1NS0wLjY2MXYtMTEyLjMxYzAuMzMtOTYuNzg1LTAuMzMtMTExLjk3OS00LjYyNS0xMTIuOTctMi42NDMtMC42NjEtNTYuNDg1LTAuOTkxLTExOS41NzctMC45OTFsLTExNC45NTIgMC4zM3YtMTMyLjQ1OWwxODQuMzItMC4zM2MxMDEuMDc5IDAgMTg0LjY1IDAuOTkxIDE4NS42NDEgMi4zMTJzMS42NTIgODEuNTkgMS42NTIgMTc4LjM3NGwtMC4zMyAxNzYuMDYyLTkuNTc5IDEuOTgyYy01LjYxNSAwLjk5MS0zNS4zNDUgMS4zMjEtNjYuMzk1IDAuNjYxek0yLjMxMiAxMzguNjI2YzAtOTYuNzg1IDAuMzMtMTc3LjcxNCAwLjY2MS0xNzkuNjk1IDAuMzMtMi4zMTIgNTcuODA2LTMuMzAzIDE4NC42NS0yLjk3M2wxODMuOTkgMC4zMyAwLjk5MSA2Ni4wNjUgMC42NjEgNjYuMDY1aC0xMTguNTg2Yy0xMDMuMDYxLTAuMzMtMTE4LjkxNiAwLjMzLTExOS45MDcgNC42MjUtMC42NjEgMi42NDMtMC45OTEgNTMuNTEyLTAuOTkxIDExMy4zMDFsMC4zMyAxMDguMDE1aC0xMzIuNDU5bDAuNjYxLTE3NS43MzJ6IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4ZTkwNjsiIGdseXBoLW5hbWU9ImZ1bGxzY3JlZW4tb2ZmIiBob3Jpei1hZHYteD0iMTA5NyIgZD0iTTI4MS43NjUgOTAyLjMzMmwtMzkuMzA4LTEuNjUyIDAuMzMtMTExLjMxOWMwLTcxLjY4LTEuMzIxLTExMS45NzktMy4zMDMtMTEyLjY0LTEuNjUyLTAuMzMtNTUuODI1LTAuNjYxLTExOS41NzctMC42NjFsLTExNi42MDQgMC4zM3YtMTMyLjQ1OWgxODQuOTgxYzEyNS41MjMtMC4zMyAxODQuOTgxIDAuOTkxIDE4NS4zMTEgMy4zMDMgMC4zMyAxLjY1MiAwLjY2MSA4Mi4yNSAwLjk5MSAxNzkuMDM1bDAuMzMgMTc1LjczMi0yNy4wODYgMC45OTFjLTE0Ljg2NSAwLjY2MS00NC41OTQgMC4zMy02Ni4wNjUtMC42NjF6TTcyMi43NDYgODk3LjM3N2MtMC42NjEtMy42MzQtMC45OTEtODQuNTYzLTAuOTkxLTE4MC4wMjZsMC4zMy0xNzMuNDE5aDM3MS4yODN2MTMyLjQ1OWgtMTE3LjU5NWMtMTAxLjQwOS0wLjMzLTExNy45MjUgMC4zMy0xMTkuOTA3IDQuNjI1LTEuMzIxIDIuNjQzLTIuMzEyIDUzLjUxMi0yLjMxMiAxMTMuMzAxbDAuMzMgMTA4LjAxNWgtMjYuNDI2Yy0xNC41MzQgMC4zMy00My45MzMgMC42NjEtNjUuMDc0IDAuOTkxLTM2LjMzNSAwLjY2MS0zOC42NDggMC4zMy0zOS42MzktNS45NDZ6TTQuNjI1IDMxNC42ODhjLTAuNjYxLTAuNjYxLTEuMzIxLTMwLjcyLTEuMzIxLTY2LjM5NXYtNjUuMDc0bDExNC45NTIgMC4zM2M2My4wOTIgMC4zMyAxMTYuOTM0IDAgMTE5LjU3Ny0wLjY2MSA0LjI5NC0wLjk5MSA0Ljk1NS0xNi4xODYgNC42MjUtMTEzLjMwMXYtMTExLjk3OWw4LjI1OC0wLjMzYzM2LjAwNS0wLjY2MSAxMjAuODk4IDAuNjYxIDEyMi4yMTkgMi4zMTIgMS45ODIgMS42NTIgMi45NzMgMzQzLjUzNSAwLjk5MSAzNTEuNzk0LTAuOTkxIDQuMjk0LTIxLjE0MSA0Ljk1NS0xODQuMzIgNC45NTUtMTAxLjA3OS0wLjMzLTE4NC4zMi0wLjk5MS0xODQuOTgxLTEuNjUyek03MjMuMDc2IDMxNC42ODhjLTAuMzMtMS4zMjEtMC42NjEtODEuNTktMC45OTEtMTc4LjcwNWwtMC4zMy0xNzYuNzIzIDQ1LjI1NC0xLjY1MmMyNC43NzQtMC45OTEgNTQuNTAzLTEuMzIxIDY2LjA2NS0wLjY2MWwyMS4xNDEgMS4zMjEtMC4zMyAxMDcuNjg1Yy0wLjMzIDU5LjQ1OCAwLjMzIDExMC4zMjggMC45OTEgMTEyLjk3IDAuOTkxIDQuMjk0IDE2Ljg0NiA0Ljk1NSAxMTkuOTA3IDQuNjI1bDExOC41ODYtMC4zM3YxMzIuNzlsLTE4NC45ODEgMC4zM2MtMTAxLjczOSAwLTE4NC45ODEtMC42NjEtMTg1LjMxMS0xLjY1MnoiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlYTI2OyIgZ2x5cGgtbmFtZT0idm9sdW1lLWhpZ2giIGhvcml6LWFkdi14PSIxMDg4IiBkPSJNODkwLjA0MCAzNy45NmMtMTIuMjg2IDAtMjQuNTY2IDQuNjg2LTMzLjk0MiAxNC4wNTYtMTguNzQ0IDE4Ljc0Ni0xOC43NDQgNDkuMTM2IDAgNjcuODgyIDg3LjYzOCA4Ny42NDIgMTM1LjkwNCAyMDQuMTYgMTM1LjkwNCAzMjguMSAwIDEyMy45MzgtNDguMjY2IDI0MC40NTgtMTM1LjkwNCAzMjguMDk4LTE4Ljc0NCAxOC43NDYtMTguNzQ0IDQ5LjEzOCAwIDY3Ljg4MnM0OS4xMzggMTguNzQ0IDY3Ljg4MiAwYzEwNS43Ny0xMDUuNzcyIDE2NC4wMjItMjQ2LjQgMTY0LjAyMi0zOTUuOThzLTU4LjI1Mi0yOTAuMjA4LTE2NC4wMjItMzk1Ljk4Yy05LjM3Mi05LjM3Mi0yMS42NTYtMTQuMDU4LTMzLjk0LTE0LjA1OHpNNzE5LjUzIDEyOC40N2MtMTIuMjg2IDAtMjQuNTY2IDQuNjg2LTMzLjk0MiAxNC4wNTYtMTguNzQ0IDE4Ljc0NC0xOC43NDQgNDkuMTM2IDAgNjcuODgyIDEzMS4wMDYgMTMxLjAwNiAxMzEuMDA2IDM0NC4xNyAwIDQ3NS4xNzYtMTguNzQ0IDE4Ljc0Ni0xOC43NDQgNDkuMTM4IDAgNjcuODgyIDE4Ljc0NCAxOC43NDIgNDkuMTM4IDE4Ljc0NCA2Ny44ODIgMCA4MS41OTQtODEuNTkgMTI2LjUzLTE5MC4wNzQgMTI2LjUzLTMwNS40NjYgMC0xMTUuMzktNDQuOTM2LTIyMy44NzYtMTI2LjUzLTMwNS40Ny05LjM3Mi05LjM3NC0yMS42NTYtMTQuMDYwLTMzLjk0LTE0LjA2MHYwek01NDkuMDIwIDIxOC45OGMtMTIuMjg2IDAtMjQuNTY4IDQuNjg2LTMzLjk0MiAxNC4wNTgtMTguNzQ2IDE4Ljc0Ni0xOC43NDYgNDkuMTM0IDAgNjcuODggODEuMSA4MS4xIDgxLjEgMjEzLjA1OCAwIDI5NC4xNTYtMTguNzQ2IDE4Ljc0Ni0xOC43NDYgNDkuMTM4IDAgNjcuODgyczQ5LjEzNiAxOC43NDQgNjcuODgyIDBjMTE4LjUzLTExOC41MyAxMTguNTMtMzExLjM5MiAwLTQyOS45MjItOS4zNzItOS4zNjgtMjEuNjU2LTE0LjA1NC0zMy45NC0xNC4wNTR6TTQxNi4wMDYgMGMtOC4zMjggMC0xNi41MTIgMy4yNS0yMi42MzQgOS4zNzRsLTI0Ni42MjYgMjQ2LjYyNmgtMTE0Ljc0NmMtMTcuNjcyIDAtMzIgMTQuMzI2LTMyIDMydjMyMGMwIDE3LjY3MiAxNC4zMjggMzIgMzIgMzJoMTE0Ljc0NmwyNDYuNjI2IDI0Ni42MjhjOS4xNTQgOS4xNTQgMjIuOTE2IDExLjg5IDM0Ljg3NCA2LjkzNiAxMS45NTgtNC45NTIgMTkuNzU0LTE2LjYyMiAxOS43NTQtMjkuNTY0di04MzJjMC0xMi45NDQtNy43OTYtMjQuNjEyLTE5Ljc1NC0yOS41NjQtMy45NTgtMS42NC04LjExOC0yLjQzNi0xMi4yNC0yLjQzNnoiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlYTI3OyIgZ2x5cGgtbmFtZT0idm9sdW1lLW1lZGl1bSIgZD0iTTcxOS41MyAxMjguNDdjLTEyLjI4NiAwLTI0LjU2NiA0LjY4Ni0zMy45NDIgMTQuMDU2LTE4Ljc0NCAxOC43NDQtMTguNzQ0IDQ5LjEzNiAwIDY3Ljg4MiAxMzEuMDA2IDEzMS4wMDYgMTMxLjAwNiAzNDQuMTcgMCA0NzUuMTc2LTE4Ljc0NCAxOC43NDYtMTguNzQ0IDQ5LjEzOCAwIDY3Ljg4MiAxOC43NDQgMTguNzQyIDQ5LjEzOCAxOC43NDQgNjcuODgyIDAgODEuNTk0LTgxLjU5IDEyNi41My0xOTAuMDc0IDEyNi41My0zMDUuNDY2IDAtMTE1LjM5LTQ0LjkzNi0yMjMuODc2LTEyNi41My0zMDUuNDctOS4zNzItOS4zNzQtMjEuNjU2LTE0LjA2MC0zMy45NC0xNC4wNjB2MHpNNTQ5LjAyMCAyMTguOThjLTEyLjI4NiAwLTI0LjU2NiA0LjY4Ni0zMy45NDIgMTQuMDU4LTE4Ljc0NiAxOC43NDYtMTguNzQ2IDQ5LjEzNCAwIDY3Ljg4IDgxLjEgODEuMSA4MS4xIDIxMy4wNTggMCAyOTQuMTU2LTE4Ljc0NiAxOC43NDYtMTguNzQ2IDQ5LjEzOCAwIDY3Ljg4MnM0OS4xMzYgMTguNzQ0IDY3Ljg4MiAwYzExOC41My0xMTguNTMgMTE4LjUzLTMxMS4zOTIgMC00MjkuOTIyLTkuMzcyLTkuMzY4LTIxLjY1Ni0xNC4wNTQtMzMuOTQtMTQuMDU0ek00MTYuMDA2IDBjLTguMzI4IDAtMTYuNTEyIDMuMjUtMjIuNjM0IDkuMzc0bC0yNDYuNjI2IDI0Ni42MjZoLTExNC43NDZjLTE3LjY3MiAwLTMyIDE0LjMyNi0zMiAzMnYzMjBjMCAxNy42NzIgMTQuMzI4IDMyIDMyIDMyaDExNC43NDZsMjQ2LjYyNiAyNDYuNjI4YzkuMTU0IDkuMTU0IDIyLjkxNiAxMS44OSAzNC44NzQgNi45MzYgMTEuOTU4LTQuOTUyIDE5Ljc1NC0xNi42MjIgMTkuNzU0LTI5LjU2NHYtODMyYzAtMTIuOTQ0LTcuNzk2LTI0LjYxMi0xOS43NTQtMjkuNTY0LTMuOTU4LTEuNjQtOC4xMTgtMi40MzYtMTIuMjQtMi40MzZ6IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4ZWEyODsiIGdseXBoLW5hbWU9InZvbHVtZS1sb3ciIGQ9Ik01NDkuMDIwIDIxOC45OGMtMTIuMjg2IDAtMjQuNTY2IDQuNjg2LTMzLjk0MiAxNC4wNTgtMTguNzQ2IDE4Ljc0Ni0xOC43NDYgNDkuMTM0IDAgNjcuODggODEuMSA4MS4xIDgxLjEgMjEzLjA1OCAwIDI5NC4xNTYtMTguNzQ2IDE4Ljc0Ni0xOC43NDYgNDkuMTM4IDAgNjcuODgyczQ5LjEzNiAxOC43NDQgNjcuODgyIDBjMTE4LjUzLTExOC41MyAxMTguNTMtMzExLjM5MiAwLTQyOS45MjItOS4zNzItOS4zNjgtMjEuNjU2LTE0LjA1NC0zMy45NC0xNC4wNTR6TTQxNi4wMDYgMGMtOC4zMjggMC0xNi41MTIgMy4yNS0yMi42MzQgOS4zNzRsLTI0Ni42MjYgMjQ2LjYyNmgtMTE0Ljc0NmMtMTcuNjcyIDAtMzIgMTQuMzI2LTMyIDMydjMyMGMwIDE3LjY3MiAxNC4zMjggMzIgMzIgMzJoMTE0Ljc0NmwyNDYuNjI2IDI0Ni42MjhjOS4xNTQgOS4xNTQgMjIuOTE2IDExLjg5IDM0Ljg3NCA2LjkzNiAxMS45NTgtNC45NTIgMTkuNzU0LTE2LjYyMiAxOS43NTQtMjkuNTY0di04MzJjMC0xMi45NDQtNy43OTYtMjQuNjEyLTE5Ljc1NC0yOS41NjQtMy45NTgtMS42NC04LjExOC0yLjQzNi0xMi4yNC0yLjQzNnoiIC8+CjxnbHlwaCB1bmljb2RlPSImI3hlYTI5OyIgZ2x5cGgtbmFtZT0idm9sdW1lLW11dGUiIGQ9Ik00MTYuMDA2IDBjLTguMzI4IDAtMTYuNTEyIDMuMjUtMjIuNjM0IDkuMzc0bC0yNDYuNjI2IDI0Ni42MjZoLTExNC43NDZjLTE3LjY3MiAwLTMyIDE0LjMyNi0zMiAzMnYzMjBjMCAxNy42NzIgMTQuMzI4IDMyIDMyIDMyaDExNC43NDZsMjQ2LjYyNiAyNDYuNjI4YzkuMTU0IDkuMTU0IDIyLjkxNiAxMS44OSAzNC44NzQgNi45MzYgMTEuOTU4LTQuOTUyIDE5Ljc1NC0xNi42MjIgMTkuNzU0LTI5LjU2NHYtODMyYzAtMTIuOTQ0LTcuNzk2LTI0LjYxMi0xOS43NTQtMjkuNTY0LTMuOTU4LTEuNjQtOC4xMTgtMi40MzYtMTIuMjQtMi40MzZ6IiAvPgo8Z2x5cGggdW5pY29kZT0iJiN4ZWEyYTsiIGdseXBoLW5hbWU9InZvbHVtZS1tdXRlMiIgZD0iTTk2MCAzNDAuODUydi04NC44NTJoLTg0Ljg1MmwtMTA3LjE0OCAxMDcuMTQ4LTEwNy4xNDgtMTA3LjE0OGgtODQuODUydjg0Ljg1MmwxMDcuMTQ4IDEwNy4xNDgtMTA3LjE0OCAxMDcuMTQ4djg0Ljg1Mmg4NC44NTJsMTA3LjE0OC0xMDcuMTQ4IDEwNy4xNDggMTA3LjE0OGg4NC44NTJ2LTg0Ljg1MmwtMTA3LjE0OC0xMDcuMTQ4IDEwNy4xNDgtMTA3LjE0OHpNNDE2LjAwNiAwYy04LjMyOCAwLTE2LjUxMiAzLjI1LTIyLjYzNCA5LjM3NGwtMjQ2LjYyNiAyNDYuNjI2aC0xMTQuNzQ2Yy0xNy42NzIgMC0zMiAxNC4zMjYtMzIgMzJ2MzIwYzAgMTcuNjcyIDE0LjMyOCAzMiAzMiAzMmgxMTQuNzQ2bDI0Ni42MjYgMjQ2LjYyOGM5LjE1NCA5LjE1NCAyMi45MTYgMTEuODkgMzQuODc0IDYuOTM2IDExLjk1OC00Ljk1MiAxOS43NTQtMTYuNjIyIDE5Ljc1NC0yOS41NjR2LTgzMmMwLTEyLjk0NC03Ljc5Ni0yNC42MTItMTkuNzU0LTI5LjU2NC0zLjk1OC0xLjY0LTguMTE4LTIuNDM2LTEyLjI0LTIuNDM2eiIgLz4KPC9mb250PjwvZGVmcz48L3N2Zz4=),',
    '        url(dataapplication/font-woff;charset=utf-8;base64,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) format("woff"),',
    '        url(data:application/font-sfnt;charset=utf-8;base64,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) format("truetype"),',
    '        url(data:application/vnd.ms-fontobject;charset=utf-8;base64,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);',
    '    font-weight: normal;',
    '    font-style: normal;',
    '}',
	'.socialskip-video-loading {',
	'	font-size: 20px;',
	'	font-family:Arial, serif;',
	'	font-weight: 700;',
	'	color: #454545;',
	'	width: 600px;',
	'	height: 337px;',
	'	text-align: center;',
	'	position: relative;',
	'	box-shadow: 0px 0px 5px #454545;',
	'}',
	'.socialskip-video-loading > div {',
	'	position: absolute;',
	'	top: 50%;',
	'	left: 50%;',
	'	-ms-transform: translate(-50%, -50%); ',
	'	-webkit-transform: translate(-50%, -50%); ',
	'	transform: translate(-50%, -50%);',
	'}',
	'.socialskip-video-loading img {',
	'	padding-bottom: 30px;',
	'}',
    '.socialskip-left-panel,',
	'.socialskip-right-panel {',
	'	all: initial;',
	'	display: inline-block;',
	'	vertical-align:top;',
	'}',
	'.socialskip-right-panel {',
	'	max-height: 600px;',
	'}',
    '.socialskip-video-player-controls-right {',
    '    float: right;',
    '}',
    '.socialskip-video-player-controls-left,',
    '.socialskip-video-player-controls-right {',
    '    display: inline-block;',
    '}',
	'.socialskip-start-btn {',
	'    font-family: Verdana;',
	'    font-size: 14px;',
	'    font-weight: 700;',
    '    position: relative;',
    '    width: 80px;',
    '    padding: 7px 0;',
    '    margin-top: 20px;',
	'    margin-left: -40px;',
	'    border-radius: 20px;',
	'    text-align: center;',
	'    left: 50%;',
	'    opacity: 0.8;',
	'    filter: alpha(opacity=80);',
	'    cursor: pointer;',
    '}',
    '.socialskip-video-player-slider {',
    '    position: relative;',
    '    display: block;',
    '    margin: 0 6px;',
    '    height: 4px;',
	'    border-radius: 1px;',
    '}',
    '.socialskip-video-player-slider-progress {',
    '    position: relative;',
    '    width: 0px;',
    '    height: 4px;',
    '    margin: 0px;',
    '}',
    '.socialskip-video-player-slider-progress:after {',
    '    position: absolute;',
    '    content: "";',
    '    width: 12px;',
    '    height: 12px;',
    '    border-radius: 50%;',
    '    margin: 0px;',
    '    right: -6px;',
    '    top: -3px;',
    '}',
	'.socialskip-video-player-slider-timebox {',
	'    position: absolute;',
	'    width: auto;',
	'    padding: 3px 5px;',
	'    font-size: 12px;',
	'    border-radius: 5px;',
	'    top: -25px;',
	'    display: none;',
	'}',
	'.socialskip-video-player-slider-msg {',
	'    position: absolute;',
	'    width: auto;',
	'    padding: 5px 7px;',
	'    font-size: 14px;',
	'    font-weight: 700;',
	'    border-radius: 5px;',
	'    top: -30px;',
	'    margin-left: 50%;',
	'    display: none;',
	'	-ms-transform: translateX(-50%); ',
	'	-webkit-transform: translateX(-50%); ',
	'	transform: translateX(-50%);',
	'}',
    '.socialskip-video-player-play,',
    '.socialskip-video-player-pause,',
    '.socialskip-video-player-replay,',
    '.socialskip-video-player-volume-icon,',
    '.socialskip-video-player-options,',
    '.socialskip-video-player-fullscreen {',
    '    display: inline-block;',
    '    width: 32px;',
    '    height: 32px;',
    '    position: relative;',
    '    padding: 0px;',
    '    cursor: pointer;',
    '}',
    '.socialskip-video-player-volume-bar {',
    '    display: inline-block;',
    '    height: 32px;',
    '    position: relative;',
    '    padding: 0px;',
    '    cursor: pointer;',
    '}',
	'.socialskip-remaining-time {',
	'    display: none;',
	'    font-family: Arial;',
    '    position: relative;',
	'    font-size: 12px;',
	'    margin: 20px 0;',
    '}',
	'.socialskip-video-player-time {',
    '    display: inline-block;',
    '    height: 32px;',
    '    position: relative;',
    '    padding: 0px;',
	'    font-size: 12px;',
    '}',
	'.socialskip-video-player-time > div {',
    '    position: absolute;',
	'	 padding: 9px 0px 0 10px;',
    '}',
    '.socialskip-video-player-volume-slider {',
    '    display: none;',
    '    position: relative;',
    '    width: 60px;',
    '    height: 4px;',
    '    top: 14px;',
    '    margin: 0px;',
    '}',
    '.socialskip-video-player-volume-level {',
    '    position: relative;',
    '    width: 100%;',
    '    height: 4px;',
    '    margin: 0px;',
    '}',
    '.socialskip-video-player-volume-level:before {',
    '    position: absolute;',
    '    content: "";',
    '    width: 12px;',
    '    height: 12px;',
    '    border-radius: 50%;',
    '    margin: 0px;',
    '    right: -6px;',
    '    top: -4px;',
    '}',
    '.socialskip-video-player-play:before,',
    '.socialskip-video-player-pause:before,',
	'.socialskip-video-player-replay:before,',
    '.socialskip-video-player-volume-full-icon:before,',
    '.socialskip-video-player-volume-medium-icon:before,',
    '.socialskip-video-player-volume-low-icon:before,',
    '.socialskip-video-player-volume-mute-icon:before,',
    '.socialskip-video-player-options:before,',
    '.socialskip-video-player-fullscreen-on:before,',
    '.socialskip-video-player-fullscreen-off:before {',
    '    font-family: "SocialSkip";',
    '    font-size: 18px;',
    '    font-style: normal;',
    '    position: absolute;',
    '    top: 50%;',
    '    left: 50%;',
    '    -ms-transform: translate(-50%, -50%); /* IE 9 */',
    '    -webkit-transform: translate(-50%, -50%); /* Safari */',
    '    transform: translate(-50%, -50%);',
    '    margin: 0px;',
    '}',
    '.socialskip-video-player-play:before {',
    '    content: "\\e902"',
    '}',
    '.socialskip-video-player-pause:before {',
    '    content: "\\e903"',
    '}',
    '.socialskip-video-player-replay:before {',
    '    content: "\\e900"',
    '}',
    '.socialskip-video-player-volume-full-icon:before {',
    '    content: "\\ea26";',
    '}',
    '.socialskip-video-player-volume-medium-icon:before {',
    '    content: "\\ea27";',
    '}',
    '.socialskip-video-player-volume-low-icon:before {',
    '    content: "\\ea28";',
    '}',
    '.socialskip-video-player-volume-mute-icon:before {',
    '    content: "\\ea29";',
    '}',
    '.socialskip-video-player-options:before {',
    '    content: "\\e904"',
    '}',
    '.socialskip-video-player-fullscreen-on:before {',
    '    content: "\\e905"',
    '}',
    '.socialskip-video-player-fullscreen-off:before {',
    '    content: "\\e906"',
    '}',
    '/* for production */',
    '.socialskip-video-player-wrapper {',
    '    position: relative;',
    '}',
    '.socialskip-video-player-options {',
    '    position: relative;',
    '}',
    '.socialskip-video-player-options-box {',
    '    display: none;',
    '    position: absolute;',
    '    right: 15px;',
    '    bottom: 47px;',
    '    padding: 10px;',
    '    font-family: Arial;',
    '    font-weight: 600;',
    '    font-size: 12px;',
    '    border-radius: 5px;',
    '    cursor:initial;',
    '}',
    '.socialskip-video-player-speed > div,',
    '.socialskip-video-player-quality > div {',
    '    display: table-cell;',
    '    min-width: 50px;',
    '    padding: 5px 5px;',
    '    cursor: pointer;',
    '}',
    '.socialskip-video-player-options-box ul {',
    '    list-style-type:none;',
    '    padding: 0px;',
    '}',
    '.socialskip-video-player-options-box ul li {',
    '    margin: 3px 0px;',
    '    cursor: pointer;',
    '}',
    '.socialskip-video-player-quality-box,',
    '.socialskip-video-player-speed-box {',
    '    min-width: 60px;',
    '    text-align: center;',
    '    display: none;',
    '}',
    '.socialskip-video-player-controls {',
	'    font-family: Arial;',
    '    position: absolute;',
	'    z-index: 10000;',
    '    bottom: 0px;',
	'    border-radius: 0px;',
    '    opacity: 0.8;',
    '    filter: alpha(opacity=80);',
	'    -webkit-user-select: none;',
	'    -moz-user-select: none;',
	'    -ms-user-select: none;',
	'    user-select: none; ',
    '}',
	'.socialskip-video-player-overlay {',
	'    position: absolute;',
	'    z-index: 1000;',
	'    width: 100%;',
	'    height: 100%;',
    '    top: 0px;',
	'    left: 0px;',
	'	 background-size: 100% auto;',
	'	 background-position-y: center;',
    '}',
	'.socialskip-video-player-big-play-btn {',
	'    position: absolute;',
	'    z-index: 10000;',
	'    width: 100px;',
	'    height: 80px;',
	'    margin-top: -40px;',
	'    margin-left: -50px;',
	'    border-radius: 10px;',
    '    top: 50%;',
	'    left: 50%;',
    '    opacity: 0.8;',
    '    filter: alpha(opacity=80);',
	'    cursor: pointer;',
    '}',
	'.socialskip-video-player-big-play-btn:before {',
	'    font-family: "SocialSkip";',
    '    font-style: normal;',
	'    position: absolute;',
	'    content: "\\e902";',
	'    font-size: 40px;',
	'    margin-top: -20px;',
	'    margin-left: -20px;',
	'    border-radius: 10px;',
    '    top: 50%;',
	'    left: 50%;',
    '    opacity: 0.8;',
    '    filter: alpha(opacity=80);',
    '}'
].join("")
