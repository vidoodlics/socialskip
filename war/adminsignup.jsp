<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="java.util.Iterator"%>
<%@ page import="socialskip.FusionApi" %>
<%@ page import="socialskip.UserInfo"%>
<%@ page import="socialskip.WelcomeServlet" %>

<% 
	String login = WelcomeServlet.getLoginUrl(); 
	String logout = WelcomeServlet.getLogoutUrl();

	// if user is researcher redirect in Researchers page		
	if(UserInfo.isResearcher(UserInfo.getMail())) {
		response.sendRedirect("/welcome");
	}
	
	// if user is not administrator		
	if(!(UserInfo.isAdministrator())) {
		response.sendRedirect("/error.jsp?msg=nopermission"); 
	}
	
%>
<!DOCTYPE html>
<html>
<head>
	<title>SocialSkip - Administration Sign up</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
	<link rel="stylesheet" type="text/css" href="/css/responsive.css" />
	<link rel="stylesheet" type="text/css" href="/css/dropdownmenu/ddm.css" />
	<link rel="stylesheet" href="css/themes/black-theme.min.css" />
	<link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" /> 
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.2/jquery.mobile.min.js"></script>
	<script src="/code/signup.js" type="text/javascript"></script>
	<script src="/code/responsive.js" type="text/javascript"></script>
	<script src="/css/dropdownmenu/ddm.js" type="text/javascript"></script> 
</head>

<body>
	<div data-role="page" data-theme="a" id="signupAdminPage">
		<div data-role="header" data-tap-toggle="false" data-position="fixed">
			<div class="responsive">
				<a href="/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
				<div id="dd" class="wrapper-dropdown-5" tabindex="1" style="float:right;"><a data-icon="user" data-role="button" style="float:right;"><%=UserInfo.getNickname()%><span class="responhide">@gmail.com</span></a>
					<ul class="dropdown">
						<li><a href="<%=logout%>" rel="external" data-ajax="false">Log out</a></li>
					</ul>
				</div>        
			</div>
		</div>
 	
		<div data-role="content" data-theme="a" >
			<div class="responsive" style="text-align:center;">
				<br><p class="pstyle">Hello, administrator!<br/><br/>Please fill the "Full name" field to continue.</p>
			</div>
		</div>

		<div id="form" data-role="content">
		
			<form name="validation" action="/signup_admin" method="post" data-ajax="false">		
				<div class="ui-dialog-contain" style="margin-top:3%;">
    				<ul data-role="listview" data-inset="true" data-theme="b">
    				
						<li data-role="list-divider" style="text-align:center;">
							<span style="font-size:18px;">Admin</span>
						</li>
		
						<li data-role="fieldcontain"  >
			 				<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true" >
								<legend>Gmail:</legend>
								<input type="text" id="mail" class="infotext" readonly="readonly" name="mail" value="<%=UserInfo.getMail()%>">
							</fieldset>
						</li>
						
						<li data-role="fieldcontain" >
			 				<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true" >
								<legend>Full name:</legend>
								<input type="text" id="name" class="infotext" name="name">
							</fieldset>
						</li>
						
						<li>
							<center><input type="submit" data-mini="true" value="Continue" ></center>
	    				</li>
	    				
					</ul>
				</div>
			</form>
			
		</div>

	</div>
	
	<div data-role="page" data-theme="a" id="errorSignUpPage" >
 		<div data-role="header" data-tap-toggle="false" data-position="fixed">
			<div class="responsive">
				<a href="/welcome" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
				<a href="<%=login%>" data-icon="lock" rel="external" data-ajax="false" data-role="button" style="float:right;">Login</a>
			</div>
		</div> 
  		
  		<div data-role="content" style="text-align:center;font-size:18px;margin-top:3%;">
  			<p>Error...</p>
			<p>Your registration is not complete!</p>
			<p>Please try again later.</p>
  		</div>
  		
  		<div data-role="footer" data-position="fixed">
			<div class="responsive">
				<a href="/welcome" rel="external" data-ajax="false" data-role="button">socialskip.appspot.com</a>
			</div>
		</div>
	</div>

</body>
</html>