$(document).on("pageinit",function(event){
	responsiveLayout();
});


$(window).resize(function() {
	responsiveLayout();
});

function responsiveLayout() {
	var width = parseInt(window.innerWidth);
	if (width <= 500) {
		$(".responsive").css("width", "100%");
		$(".responhide").hide();
		$(".videohide").hide();
	}
	else if (width <= 700) {
		$(".responsive").css("width", "100%");
		$(".responhide").hide();
		$(".videohide").hide();
	}
	else if (width <= 800) {
		$(".responsive").css("width", "100%");
		$(".responhide").show();
		$(".videohide").show();
	}
	else if (width <= 1000) {
		$(".responsive").css("width", "90%");
		$(".responhide").show();
		$(".videohide").show();
	}
	else if (width <= 1280) {
		$(".responsive").css("width", "80%");
		$(".responhide").show();
		$(".videohide").show();
	}
	else if (width <= 1440) {
		$(".responsive").css("width", "70%");
		$(".responhide").show();
		$(".videohide").show();
	}
	else if (width <= 1700) {
		$(".responsive").css("width", "60%");
		$(".responhide").show();
		$(".videohide").show();
	}
	else {
		$(".responsive").css("width", "50%");
		$(".responhide").show();
		$(".videohide").show();
	}
}