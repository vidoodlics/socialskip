function validationSignUpForm() {
	clearWarnings();
	
	var ok = true;
	
	var mail=document.validation.mail.value;
	var filter=/^[A-Za-z0-9\_\.\-]+(@gmail.com)$/;

	if (mail==null || mail=="" ) {
		$("#mail").parent().css('border-color','#FF0000');
		$("#mail").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">This field is required.</span>");
		ok = false;
	} else if (!(filter.test(mail))) {
		$("#mail").parent().css('border-color','#FF0000');
		$("#mail").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">Invalid mail. Please give your gmail.</span>");
		ok = false;
	}
	

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
			$("#name").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">Invalid name. Please use only letters (a-z).</span>");
			ok = false;
		} else if (name.length < 5) {
			$("#name").parent().css('border-color','#FF0000');
			$("#name").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">Invalid name. Your name is too short.</span>");
			ok = false;
		}
	}
	
	if( !ok ) {
		Recaptcha.reload();
	}
	
	return ok;
}

function clearWarnings() {
	$(".infotext").parent().css('border-color','#FFFFFF');
	$("#recaptcha_response_field").parent().css('border-color','#FFFFFF');
	$(".errormsg").remove();
}


/* This function contains initialization code that is executed right after the
 * page is loaded and the DOM is ready to be manipulated.
 */

$(document).delegate("#homePage", "pageinit", function () {
	$("#signUpForm").submit(function (e) { // Custom submit function
		e.preventDefault(); // Cancel default action
		if(validationSignUpForm()) {
			$.mobile.loading('show', {
				text: 'Please wait',
				textVisible: true,
				theme: 'b',
				html: ''
			}); // Show loading widget
			// Send request to server with the form data
			$.post("/sign_up", $("form").serialize(), function (data) {
				$.mobile.loading('hide');
			
				if (data == "no") { 
					var mail=document.validation.mail.value;
					$('#signUpFormDiv').hide();
					$('#alreadyRegisteredDiv').show();
					$('#gmailhere').text(mail);
					
					var img = $("<img />").attr('src', '/images/warning1.png')
				    .load(function() {
				        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
				            //alert('broken image!');
				        } else {
				            $("#imageAlreadyRegistered").append(img);
				        }
				        img.addClass('eimg');
				    });
				} else if (data == "ok") {
					$('#signUpFormDiv').hide();
					$('#successSignUpDiv').show();
				} else if (data == "error") {
					$('#signUpFormDiv').hide();
					$('#errorSignUpDiv').show();
					var img = $("<img />").attr('src', '/images/warning1.png')
				    .load(function() {
				        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
				           // alert('broken image!');
				        } else {
				            $("#imageErrorSignUp").append(img);
				        }
				        img.addClass('eimg');
				    });
				} else if (data == "valid") {
					$("#recaptcha_response_field").parent().css('border-color','#FF0000');
					$("#recaptcha_response_field").parent().after("<span class=\"errormsg\" style=\"color:red;;font-size:12px;\">Invalid captcha. Please try again.</span>");
					Recaptcha.reload();
				}
			
			}, "text");
		}
	});
	
	$( "#tryagain1" ).bind( "click", function(event, ui) {
		$('#signUpFormDiv').show();
		$('#alreadyRegisteredDiv').hide();
		$('#errorSignUpDiv').hide();
		$('.eimg').remove();
		Recaptcha.reload();
	});
	
	$( "#tryagain2" ).bind( "click", function(event, ui) {
		$('#signUpFormDiv').show();
		$('#alreadyRegisteredDiv').hide();
		$('#errorSignUpDiv').hide();
		$('.eimg').remove();
		Recaptcha.reload();
	});
});


$(document).delegate("#signupAdminPage", "pageinit", function () {
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
			$.post("/signup_admin", $("form").serialize(), function (data) {
				$.mobile.loading('hide');
			
				if (data == "ok") {
					window.location.href = '/welcome';
				} else if (data == "error") {
					window.location.href = '#errorSignUpPage';
				}
			
			}, "text");
		}
	});
});
