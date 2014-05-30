<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="socialskip.UserInfo" %>
<%@ page import="socialskip.WelcomeServlet" %>
<% 
	String login = WelcomeServlet.getLoginUrl(); 
	String logout = WelcomeServlet.getLogoutUrl();
%>

<!DOCTYPE html>
<html>
<head>
	<title>SocialSkip</title>
	<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
	
	<!-- Facebook Meta Data -->
	<meta property="og:title" content="SocialSkip"/>
	<meta property="og:image" content="http://i57.tinypic.com/do2qs6.jpg"/>
	<meta property="og:url" content="http://socialskip.appspot.com" />
	<meta property="og:site_name" content="SocialSkip" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content="SocialSkip can be employed in real or experimental scenarios to generate user activity graphs of an online video, by analyzing users’ interactions with the system, such as play, pause, skip/scrub.The SocialSkip system employs a custom web-video player and a web-database to keep a record of basic user actions (play, pause, and skip)." />
	
	<meta name="description" content="SocialSkip. The implementation of a web-video system with a novel user-based sense-making method. SocialSkip can be employed in real or experimental scenarios to generate user activity graphs of an online video, by analyzing users’ interactions with the system, such as play, pause, skip/scrub.The SocialSkip system employs a custom web-video player and a web-database to keep a record of basic user actions (play, pause, and skip)." />
	<meta name="keywords" content="socialskip,service,web,video,experiment,interaction,appengine,ionian,university">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="/css/responsive.css" />
	<link rel="stylesheet" type="text/css" href="/css/dropdownmenu/ddm.css"/>
	<link rel="stylesheet" href="css/themes/black-theme.min.css" />
	<link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
	<link rel="stylesheet" href="css/owl-carousel/owl.carousel.css" />
	<link rel="stylesheet" href="css/owl-carousel/owl.theme.css" />
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" /> 
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.2/jquery.mobile.min.js"></script>
	<script src="css/owl-carousel/owl.carousel.min.js"></script>
	<script src="/code/responsive.js" type="text/javascript"></script> 
	<script src="/css/dropdownmenu/ddm.js" type="text/javascript"></script> 
	<script>
	$(document).ready(function() {
	 	$("#owl-demo").owlCarousel({
		 	slideSpeed : 300,
			paginationSpeed : 400,
			singleItem:true,
			autoPlay: 8000
		});
	});
	</script>
	
	<script>
	    var RecaptchaOptions = {
	    		theme : 'custom',
	    		custom_theme_widget: 'recaptcha_widget'
	    };
	</script>
	
	
	<style>
	
	#recaptcha_image {
	    max-width: 210px;
	    overflow: hidden;
	    border:1px solid #B0B0B0;
		border-radius:6px;
	}
	
	#recaptcha_image img {
	    max-width: 210px;
	}
	
	</style>	
	            
</head>


<body>

<div data-role="page" data-theme="a" id="homePage">
	<div data-role="header" data-tap-toggle="false" data-position="fixed">
		<div class="responsive">
			<a href="/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
			<% 
			boolean isResearcher = false;
			try {
			isResearcher = UserInfo.isResearcher(UserInfo.getMail());
			if(!isResearcher) { %>
			 	<a href="#add-form" data-icon="action" rel="external" data-ajax="false" data-role="button" style="float:right;">Sign up</a>
				<a href="<%=login%>" data-icon="lock" rel="external" data-ajax="false" data-role="button" style="float:right;">Login</a>
			<% } else {%>
				<div id="dd" class="wrapper-dropdown-5" tabindex="1" style="float:right;"><a data-icon="user" data-role="button" style="float:right;"><%=UserInfo.getNickname()%><span class="responhide">@gmail.com</span></a>
					<ul class="dropdown">
						<%
						  if( UserInfo.isAdministrator()) {
						%>
						<li><a href="/experiments" rel="external" data-ajax="false">Admin panel</a></li>
						<%
						  }
						%>
						<li><a href="/researcher" rel="external" data-ajax="false">Researcher panel</a></li>
						<li><a href="<%=logout%>" rel="external" data-ajax="false">Log out</a></li>
					</ul>
				</div>			
			<% } 
			} catch (Exception e) {
				response.sendRedirect("/error.jsp"); 
			}
			%>
		</div>
	</div>	
	
	<div data-role="content" style="background-color:#3498db;min-height:400px;color:#FFFFFF;font-size:16px;">
		<div class="responsive">
			<div id="owl-demo" class="owl-carousel">
    			<div class="item" style="height:370px;">
    				<table style="height:100%">
    					<tr>
    						<td valign="middle">
	    						<span class="responhide">
	    							<img src="/images/cloud.png" alt="home" style="float:left;margin-right:40px;margin-left:40px;" >
								</span>
							</td>
							
							<td valign="middle">
								<span style="font-size:55px;">SocialSkip</span><br>
								<span>SocialSkip is an open source web application that can be employed in real or experimental scenarios to generate user activity graphs of an online video.</span>
							</td>
    					</tr>
    				</table>
    			</div>
				<div class="item" style="height:370px;">
					<table style="height:100%">
    					<tr>
    						<td valign="middle">
								<span class="responhide"><br>
									<img src="/images/ionianuniversity.png" alt="graph" style="float:left;margin-right:40px;margin-left:40px;">
								</span>
							</td>
							
							<td valign="middle">
								<span style="font-size:48px;">Ionian University</span><br>
								<span style="font-size:26px;">Department of Informatics</span><br><br>
								<span>The Ionian University is a university located in the city of Corfu, Greece.</span>
							</td>
    					</tr>
    				</table>
				</div>
			</div>
		</div>
	</div>
	
	<div data-role="content" style="background-color:#ecf0f1;height:24px;">
		<div class="responsive" style="text-align:center;">
			<table style="margin: auto;">
				<tr>
					<td>
						<iframe src="http://ghbtns.com/github-btn.html?user=vidoodlics&repo=socialskip&type=watch&count=true" allowtransparency="true" frameborder="0" scrolling="0" width="110" height="20"></iframe>
  					</td>
  					<td>
  						<iframe src="http://ghbtns.com/github-btn.html?user=vidoodlics&repo=socialskip&type=fork" allowtransparency="true" frameborder="0" scrolling="0" width="100" height="20"></iframe>
					</td>
					<td class="responhide">
						<!-- Place this tag where you want the +1 button to render. -->
						<div class="g-plusone" data-size="medium"></div>
						
						<!-- Place this tag after the last +1 button tag. -->
						<script type="text/javascript">
						  window.___gcfg = {lang: 'en-GB'};
						
						  (function() {
						    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
						    po.src = 'https://apis.google.com/js/platform.js';
						    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
						  })();
						</script>
					</td>
				</tr>
			</table>
		</div>
	</div>
	
	<div data-role="content" style="min-height:350px;color:#000000;">
		<div class="responsive">
			<p style="font-size:26px;">What is SocialSkip?</p>
			<p>SocialSkip can be employed in real or experimental scenarios to generate user activity graphs of an online video, by analyzing users’ interactions with the system, such as play, pause, skip/scrub.The SocialSkip system employs a custom web-video player and a web-database to keep a record of basic user actions (play, pause, and skip).</p>
			<p>SocialSkip is also integrated with Google Drive, which allows the addition of a questionnaire next to the video. This feature has been useful in video experiments for learning, which include quiz questions next to the video.</p>
			<p>The main feature of SocialSkip is a video browser with custom player buttons that collect user interactions with the video to a data-base.</p>
			<p>The SocialSkip system operates on Google App Engine and provides integration of YouTube videos and Drive documents.</p>
		</div>
	</div>
	
	<div data-role="content" style="background-color:#ecf0f1;text-align:center;">
		<div class="responsive">
			<p style="font-size:22px;color:#000000;">Partner Organization</p>
			<p><img alt="Center for Real-time Computing" src="http://www.spl.harvard.edu/SPLWeb/images/1/12/Logo_CRTC.png"></p>
			<p><a href="http://crtc.wm.edu/" target="_blank">Center for Real-time Computing</a></p>
		</div>
	</div>
	
	<div data-role="footer">
		<div class="responsive">
			<a href="/welcome" rel="external" data-ajax="false" data-role="button">socialskip.appspot.com</a>
		</div>
	</div>
	
	<div data-role="panel" data-position="right" data-position-fixed="true" data-display="overlay" data-theme="a" id="add-form">
		<div id="signUpFormDiv">
	        <form id="signUpForm" name="validation" action="/sign_up" method="post" data-ajax="false">
	            <h2>Sign up</h2>
	            <label for="name">Full name:</label>
	            <input name="name" id="name" value="" data-clear-btn="true" data-mini="true" type="text" class="infotext">
	            <br>
	            <label for="mail">Gmail:</label>
	            <input name="mail" id="mail" value="" data-clear-btn="true" data-mini="true" type="text" class="infotext">
	            <br>
	           <div id="recaptcha_widget" style="display:none">
		            <span class="recaptcha_only_if_image" >Enter the words below:</span>
					<span class="recaptcha_only_if_audio" >Enter the numbers you hear:</span>
						
					<table>	
					<tr>
					 	<td>
					 		<div id="recaptcha_image" style="text-align:center;font-size:11px;width:200px;"></div>
						</td>
						<td style="padding-left: 6px;">
							<div data-mini="true"><a href="javascript:Recaptcha.reload()" ><img src="/css/themes/images/icons-png/refresh-black.png" alt="Reload" /></a></div>
					 		<div class="recaptcha_only_if_image"><a href="javascript:Recaptcha.switch_type('audio')" ><img src="/css/themes/images/icons-png/audio-black.png" alt="Image" /></a></div>
					 		<div class="recaptcha_only_if_audio"><a href="javascript:Recaptcha.switch_type('image')" ><img src="/css/themes/images/icons-png/camera-black.png" alt="Audio" /></a></div>
					
					 <div><a href="javascript:Recaptcha.showhelp()" ><img src="/css/themes/images/icons-png/info-black.png" alt="Info" /></a></div>
						</td>
					</tr>
					</table>
					 <div class="recaptcha_only_if_incorrect_sol" style="color:red">Incorrect please try again</div>
					
					 <input type="text" id="recaptcha_response_field" name="recaptcha_response_field" data-mini="true"/>
				
				 </div>

				
				<script type="text/javascript"
				src="http://www.google.com/recaptcha/api/challenge?k=***************************">
				</script>
				<noscript>
				<iframe src="http://www.google.com/recaptcha/api/noscript?***************************"
				height="200" width="300" frameborder="0"></iframe><br>
				<textarea name="recaptcha_challenge_field" rows="3" cols="40">
				</textarea>
				<input type="hidden" name="recaptcha_response_field"
				value="manual_challenge">
				</noscript>

				<br>
	            
	            <div class="ui-grid-a">
	                <div class="ui-block-a"><a href="#" data-rel="close" class="ui-btn ui-shadow ui-corner-all ui-btn-b ui-mini">Cancel</a></div>
	                <div class="ui-block-b"><input type="submit" value="Sign up" class="ui-shadow ui-corner-all ui-btn-a" data-mini="true"/></div>
	            </div>
	        </form>
        </div>
        <br>
        <div id="successSignUpDiv" style="display:none;">
        	<br>
        	Your registration has been successfully completed!
        	<br><br>
        	Now you can sign in using your Google account.
        	<br><br>
        	<div class="ui-grid-a">
                <div class="ui-block-a"><a href="#" data-rel="close" class="ui-btn ui-shadow ui-corner-all ui-btn-b ui-mini">Close</a></div>
                <div class="ui-block-b"></div>
            </div>
        </div>
        
        <div id="alreadyRegisteredDiv" style="display:none;">
        	<center><span id="imageAlreadyRegistered"></span><br></center><br>
        	You are already registered with this email address (<span id="gmailhere"></span>).
        	<br><br>
        	<div class="ui-grid-a">
                <div class="ui-block-a"><a href="#" data-rel="close" class="ui-btn ui-shadow ui-corner-all ui-btn-b ui-mini">Cancel</a></div>
                <div class="ui-block-b"><a href="#" id="tryagain1" class="ui-btn ui-shadow ui-corner-all ui-btn-b ui-mini">Try again</a></div>
            </div>
        </div>
      
        <div id="errorSignUpDiv" style="display:none;">
        	<center><span id="imageErrorSignUp"></span><br></center><br>
        	Your registration is not complete!<br>Please try again later.
        	<br><br>
        	<div class="ui-grid-a">
                <div class="ui-block-a"><a href="#" data-rel="close" class="ui-btn ui-shadow ui-corner-all ui-btn-b ui-mini">Cancel</a></div>
                <div class="ui-block-b"><a href="#" id="tryagain2" class="ui-btn ui-shadow ui-corner-all ui-btn-b ui-mini">Try again</a></div>
            </div>
        </div>
        
    </div><!-- /panel -->
    
    
    <% if (request.getParameter("param") != null && request.getParameter("param").equals("notresearcher") && !(isResearcher) ) { %>
    
    <div data-role="popup" id="popupDialog" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="width:300px;">
	    <div data-role="header" data-theme="a">
		    <h1>Error message</h1>
	    </div>
	    <div role="main" class="ui-content">
	        <p style="font-size: 18px;text-align:center;"><b>You are not a researcher.<br>
	    	Please sign up.</b></p>
	        <center><a href="#add-form" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" id="errorsign">Sign up</a></center>
	    </div>
	</div>
    	
	<script>
	$(document).bind("pageinit", function(){
	    $( "#popupDialog" ).popup( "open");
	    $( "#popupDialog" ).popup({ positionTo: "window" });
	    $("#errorsign").click(function() {
	    	$( "#popupDialog" ).popup( "close" );
	    });
	    
	});
    </script>
	<% } %>
</div>    

<script src="/code/signup.js" type="text/javascript"></script>

</body>

</html>
