<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
	<title>SocialSkip</title>
	<%@include file="head.jsp" %>
</head>

<body>

	<div data-role="page" data-theme="a" id="homePage">

		<%@include file="header.jsp" %>

		<div data-role="content" id="intro">
			<div class="responsive">
				<div id="intro-1">
					<table>
						<tr>
							<td>
								<span class="responhide-sm">
									<img src="/images/cloud.png" alt="home" class="img-intro">
								</span>
							</td>
							<td>
								<span class="intro-title">SocialSkip</span><br>
								<span class="intro-text">SocialSkip is an open source web application that can be employed in real or experimental scenarios to generate user activity graphs of an online video.</span>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>

		<div data-role="content" id	="socialbuttons">
			<div class="responsive" style="text-align:center;margin-top:5px;">
				<table style="margin: auto;">
					<tr>
						<td>
							<iframe src="http://ghbtns.com/github-btn.html?user=vidoodlics&repo=socialskip&type=watch&count=true" width="110" height="20"></iframe>
						</td>
						<td>
							<iframe src="http://ghbtns.com/github-btn.html?user=vidoodlics&repo=socialskip&type=fork" width="100" height="20"></iframe>
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

		<div data-role="content" id="whatis">
			<div class="responsive">
				<h1>What is SocialSkip?</h1>
				<p>SocialSkip can be employed in real or experimental scenarios to generate user activity graphs of an online video, by analyzing users' interactions with the system, such as play, pause, skip/scrub.The SocialSkip system employs a custom web-video player and a web-database to keep a record of basic user actions (play, pause, and skip).</p>
				<p>SocialSkip is also integrated with Google Drive, which allows the addition of a questionnaire next to the video. This feature has been useful in video experiments for learning, which include quiz questions next to the video.</p>
				<p>The main feature of SocialSkip is a video browser with custom player buttons that collect user interactions with the video to a database.</p>
				<p>This system operates on Google App Engine and provides integration of YouTube videos and Drive documents.</p>
			</div>
		</div>

		<div data-role="content" id="partners">
			<div class="responsive">
				<h2>Partner Organizations</h2>
				<div class="responsive">
					<div class="ui-grid-a">
						<div class="ui-block-a">
							<div>
								<p><a style="text-decoration:none" href="http://crtc.wm.edu/" target="_blank"><img alt="Center for Real-time Computing" style="width:130px;" src="https://crtc.cs.odu.edu/images/crtc.png"></a></p>
								<p><a style="text-decoration:none" href="http://crtc.wm.edu/" target="_blank">Center for Real-time Computing</a></p>
							</div>
						</div>
						<div class="ui-block-b">
							<div>
								<p><a style="text-decoration:none" href="http://www.ntnu.no/" target="_blank"><img alt=" Norwegian University of Science and Technology" style="width:150px;" src="http://www.ntnu.no/ntnu-theme/images/logo_ntnu.svg"></a></p>
								<p><a style="text-decoration:none" href="http://www.ntnu.no/" target="_blank">Norwegian University of Science and Technology</a></p>
							</div>
						</div>
					</div>
	           	</div>
			</div>
		</div>

		<div data-role="content" id="ionian">
			<div class="responsive">
				<p><a href="http://di.ionio.gr" target="_blank"><img src="/images/ionianuniversity.png" alt="ionian" class="img-ionian"></a></p>
				<p class="ionian-text">This web application was created as part of academic projects in Department of Informatics, Ionian University, Corfu, Greece.</p>
			</div>
		</div>

		<div data-role="footer" id="footer">
			<div class="responsive">
				<div class="ui-grid-a" style="margin:16px;">
					<div class="ui-block-a" style="text-align: left;">SocialSkip is maintained by <a style="text-decoration:none" href="https://github.com/vidoodlics" target="_blank">vidoodlics</a></div>
					<div class="ui-block-b" style="text-align: right;"><a style="text-decoration:none" data-ajax="false" href="/api">API</a>  |  Github: <a style="text-decoration:none" href="http://vidoodlics.github.io/socialskip/" target="_blank">Page</a>, <a style="text-decoration:none" href="https://github.com/vidoodlics/socialskip" target="_blank">Source</a></div>
				</div>
			</div>
		</div>

	</div>

</body>

</html>
