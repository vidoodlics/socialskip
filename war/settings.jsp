<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="socialskip.UserInfo" %>
<%@ page import="socialskip.FusionApi" %>

<% 
	String mail = UserInfo.getMail();
	
	FusionApi tables = new FusionApi();	

	if (mail.isEmpty() || mail == null || mail.equals("")) {
		response.sendRedirect(WelcomeServlet.getLoginUrl());
	}

	String user = "";
	
	try {
		if (!(UserInfo.isResearcher(mail))) {
			response.sendRedirect("/error.jsp?reason=noreseacher"); 
		}
	} catch (Exception e) {
		response.sendRedirect("/error.jsp");
	}
%>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="/css/responsive.css" />
	<link rel="stylesheet" type="text/css" href="/css/dropdownmenu/ddm.css" />
	
	<title>SocialSkip - Settings (<%= mail %>)</title>
	<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
	<script src="https://www.google.com/jsapi" type="text/javascript"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<link rel="stylesheet" href="css/themes/black-theme.min.css" />
	<link rel="stylesheet" type="text/css" href="/css/allpages.css" />
	<link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" />
	<script src="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.2/jquery.mobile.min.js"></script>
	<script src="/code/responsive.js" type="text/javascript"></script> 
	<script src="/code/settings.js" type="text/javascript"></script> 
	<script src="/css/dropdownmenu/ddm.js" type="text/javascript"></script> 
	<script src="/code/jscolor/jscolor.js" type="text/javascript"></script>
	<script src="/code/googleanalytics.js" type="text/javascript"></script> 
</head>

<body >	
<div data-role="page" id="settingsPage" data-theme="a">
	
	<%@include file="header.jsp" %>
	
	<%
	
	String query = "SELECT * FROM " + FusionApi.ACCESS_TOKENS + " WHERE ResearcherId=" + UserInfo.getResearcherID();
	
	tables.run(query);
	
	%>
	
	<div data-role="content" data-theme="b">
		<div class="responsive">
			<h1>My Account</h1>
			<br>
			<h2>Access token</h2>
			This access token grants full access to your data via API. Don't share this.
	 		<form id="createupdate" action="/researcher_videos" method="post" data-ajax="false">
	 			<fieldset class="ui-field-contain">
	 			
	 			<% if (tables.rowCount() > 0) { %>
    		  		<input  type="text" id="access-token-input" name="accesstoken" data-inline="true" value="<%=tables.getFirstRow()[1]%>"/>
    		  		<input data-inline="true" id="generate-access-token" value="Generate new token" type="button">
    		  	<% } else { %>
    		  		<input  type="text" id="access-token-input" name="accesstoken" data-inline="true"/>
    		  		<input data-inline="true" id="generate-access-token" value="Generate" type="button">
    		  	<% } %>
    		  	
    		  	</fieldset>
	 		</form>
	 		
	 		 
	 	</div>
	</div>
	
	<%@include file="footer.jsp" %> 
</div>
</body>
</html>