$(document).delegate("#settingsPage", "pageinit", function () {

	$("#generate-access-token").click(function () {
		$.mobile.loading('show', {
			text: 'Please wait',
			textVisible: true,
			theme: 'b',
			html: ''
		}); // Show loading widget

		$.post("/get-access-token", function (data) {
			$.mobile.loading('hide');

			if(data.access_token == "error") {
				alert("Error...\nPlease try again.")
			} else {
				$("#access-token-input").val(data.access_token);
				$("#generate-access-token").val("Generate new token").button('refresh');;
			}
		}, "json");

	});

});
