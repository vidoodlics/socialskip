<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>
<html>
<head>
<title>SocialSkip - Error Page</title>
<%@include file="head.jsp" %>
</head>

<body>
	<div data-role="page" data-theme="a">

		<div data-role="header" data-tap-toggle="false" data-position="fixed">
			<div class="responsive">
				<a href="/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
			</div>
		</div>

		<%
		String errorMsg = "Sorry, something went wrong. Please try again.";

		if (request.getParameter("reason") != null) {

			if (request.getParameter("reason").equals("nopermission")) {
				errorMsg = "You do not have permission to access this page.";
			} else if (request.getParameter("reason").equals("noresearcher")) {
				errorMsg = "You do not have permission to access this page,<br>because you are not researcher";
			}

		}
		%>

		<div data-role="content">
			<div class="responsive error-message">
				<div><%= errorMsg %></div>
				<div>
					<a href="" onclick="history.go(-1);">Go back</a>
				</div>
			</div>
		</div>

		<%@include file="footer.jsp" %>

	</div>
</body>
</html>
