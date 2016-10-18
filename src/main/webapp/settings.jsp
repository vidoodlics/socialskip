<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="socialskip.UserInfo" %>
<%@ page import="socialskip.FusionApi" %>

<%
	String mail = UserInfo.getMail();
	FusionApi tables = new FusionApi();

	try {
		if ("".equals(mail)) {
			response.sendRedirect(WelcomeServlet.getLoginUrl());
		}

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
	<title>SocialSkip - Settings (<%= mail %>)</title>
	<%@include file="head.jsp" %>
	<script src="/js/settings.js" type="text/javascript"></script>
</head>

<body>
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
