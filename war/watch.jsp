<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<!DOCTYPE html>
<html>
<head>
<title>SocialSkip - Experiment</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="/code/socialskip.js" type="text/javascript"></script>
<style>
body {
	background-color: #ecf0f1;
}
</style>

</head>

<body>
	<center><div data-socialskip="true" data-expid="<%=request.getParameter("videoId")%>" ></div></center>
</body>
</html>
