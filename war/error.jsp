<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SocialSkip - Error Page</title>
<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
<link rel="stylesheet" type="text/css" href="/css/responsive.css" />
<link rel="stylesheet" href="css/themes/black-theme.min.css" />
<link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" /> 
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.2/jquery.mobile.min.js"></script>
<script src="/code/responsive.js" type="text/javascript"></script>
</head>


<body>

 	<div data-role="page" data-theme="a">
 	
		<div data-role="header" data-tap-toggle="false" data-position="fixed">
			<div class="responsive">
				<a href="/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
			</div>
		</div>
		<%
			if (request.getParameter("reason") != null && (request.getParameter("reason")).equals("nopermission")) {
		%>
			<div data-role="content" style="text-align:center;">
			<br><br>
				<span style="font-size: 20px;">You do not have permission to access this page.</span>
				<br><br>
				<a style="color:#000000;font-size: 20px;" href="" onclick="history.go(-1);">Go back</a>
			</div>
		<%
			} else if (request.getParameter("reason") != null && (request.getParameter("reason")).equals("noresearcher")) {
		%>
			<div data-role="content" style="text-align:center;">
			<br><br>
				<span style="font-size: 20px;">You do not have permission to access this page,</span>
				<br>
				<span style="font-size: 20px;">because you are not researcher</span><br><br>
				<a style="color:#000000;font-size: 20px;" href="" onclick="history.go(-1);">Go back</a>
			</div>		
		<%
			} else  {
		%>
			<div data-role="content" style="text-align:center;">
			<br><br>
				<span style="font-size: 25px;">Sorry, something went wrong. Please try again.</span>
				<br><br>
				<a style="color:#000000;font-size: 24px;" href="" onclick="history.go(-1);">Go back</a>
			</div>
		<%
			}
		%>
	</div>
</body>
</html>