<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<!DOCTYPE html>
<html>
	<head>
		<title>SocialSkip</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
		<script src="/js/socialskip.min.js" type="text/javascript"></script>
		<style>
			body {
				background-color: #ecf0f1;
			}
		</style>
	</head>
	<body>
		<div data-socialskip="true" data-expid="<%=request.getParameter("videoId")%>" ></div>
	</body>
</html>
