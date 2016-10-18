<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="java.util.Iterator"%>
<%@ page import="socialskip.FusionApi" %>
<%@ page import="socialskip.UserInfo"%>
<%@ page import="socialskip.WelcomeServlet" %>

<%
	String login = WelcomeServlet.getLoginUrl();
	String logout = WelcomeServlet.getLogoutUrl();
%>
<!DOCTYPE html>
<html>
<head>
	<title>SocialSkip - Administration Sign up</title>
	<%@include file="head.jsp" %>
	<script src="/js/signup.js" type="text/javascript"></script>
</head>

<body>
	<div data-role="page" data-theme="a" id="signupPage">

		<%@include file="header.jsp" %>

		<div data-role="content" data-theme="a" >
			<div class="responsive" style="text-align:center;">
				<br><p class="pstyle">Hello, <%= request.getParameter("user") %>!<br/><br/>Please fill the "Full name" field to continue.</p>
			</div>
		</div>

		<div id="form" data-role="content">
			<form name="validation" data-ajax="false">
				<div class="ui-dialog-contain" style="margin-top:3%;">
    				<ul data-role="listview" data-inset="true" data-theme="b">

						<li data-role="list-divider" style="text-align:center;">
							<span style="font-size:18px;">Sign up</span>
						</li>

						<li data-role="fieldcontain">
			 				<fieldset class="input-no-border" data-role="controlgroup" data-type="horizontal" data-mini="true">
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
							<input type="submit" data-mini="true" value="Continue" >
	    				</li>

					</ul>
				</div>
			</form>
		</div>

		<%@include file="footer.jsp" %>

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
	</div>

</body>
</html>
