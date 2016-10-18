<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Iterator" %>
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
	<script src="/code/settings.js" type="text/javascript"></script>
</head>

<body>
	<div data-role="page" id="settingsPage" data-theme="a">

		<%@include file="header.jsp" %>

		<div data-role="content">
			<div class="responsive">
				<div>
					<p><h3>Title:</h3>
					In this field, write a short description about experiment (e.g video title).<br>
					<i>WARNING!</i> This field allow only English characters.<br>

					<hr> <br>

					<p><h3>Video URL:</h3>
					In this field, write the url of the Youtube video.
					</p>

					<hr> <br>

					<p><h3>Start &#38; End Time:</h3>
					Choose a custom start and end video time.<br>
					<i>WARNING!</i> If you choose a custom time, interactions will still be stored in the original video time.<br />

					<hr> <br>

					<p><h3>Interaction time: </h3>
					Set the time that the user will have to interact with slider when pressed the <b>Start</b> button.<br>
					If you set zero (0), there will be no time limit.<br>

					<hr> <br>

					<p><h3>Questionarie:</h3>
					In this field, write the url from questionnaire. You can create the questionnaire using Google Drive. Go to <a href="http://drive.google.com/">drive.google.com</a>.
					Click on <b>New</b> -> <b>Google Forms</b>. Now you can create the form.
					After creating a form, click on <b>SEND</b> button, copy the link and place this link into the <b>Questionnaire</b> field<br>

					<hr> <br>

					<p><h3>Information:</h3>
					In this field, write the url from instructions document. This document contains information for the user.
					You can create this document using Google Drive. Go to <a href="http://drive.google.com/">drive.google.com</a>. Click on <b>New</b> -> <b>Google docs</b>.
					Enter your text and click <b>File</b> and <b>Publish to the web</b>. Click on <b>Publish</b> and copy the <b>Document link</b> and place this link into the <b>Information</b> field. <br />

					<hr> <br>

					<p><h3>Customize player:</h3>
					Change the colors of video player and select which buttons to include in the video player.<br />

					<hr> <br />
				</div>
			</div>
		</div>


		<%@include file="footer.jsp" %>
	</div>
</body>
</html>
