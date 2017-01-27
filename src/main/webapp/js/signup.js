function validationSignUpForm() {
	clearWarnings();

	var ok = true;
	var name=document.validation.name.value;
	name = name.trim();
	var regex_name=/^[A-Za-z][A-Za-z\s]+$/;

	if (name==null || name=="" ) {
		$("#name").parent().css('border-color','#FF0000');
		$("#name").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">This field is required.</span>");
		ok = false;
	} else if (name.length < 5 || !(regex_name.test(name))) {
		if (!(regex_name.test(name))) {
			$("#name").parent().css('border-color','#FF0000');
			$("#name").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">Invalid name. Please use only letters (A-Za-z).</span>");
			ok = false;
		} else if (name.length < 5) {
			$("#name").parent().css('border-color','#FF0000');
			$("#name").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">Invalid name. Your name is too short.</span>");
			ok = false;
		}
	}

	return ok;
}

function clearWarnings() {
	$(".infotext").parent().css('border-color','#FFFFFF');
	$(".errormsg").remove();
}


$(document).delegate("#signupPage", "pageinit", function () {
	$("form").submit(function (e) { // Custom submit function
		e.preventDefault(); // Cancel default action
		if(validationSignUpForm()) {
			$.mobile.loading('show', {
				text: 'Please wait',
				textVisible: true,
				theme: 'b',
				html: ''
			}); // Show loading widget
			// Send request to server with the form data
			$.get("/sign_up", $("form").serialize(), function (data) {
				$.mobile.loading('hide');

				if (data == "ok") {
					window.location.href = '/welcome';
				} else if (data == "error" || data == "error1") {
					window.location.href = '#errorSignUpPage';
				}

			}, "text");
		}
	});
});
