<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
	<title>SocialSkip API v1</title>
	<%@include file="head.jsp" %>   
</head>

<body>
	<div data-role="page" data-theme="a" id="homePage">
		
		<%@include file="header.jsp" %>	
		
		<div data-role="content" id="api-v1-page">
			<div class="responsive">
				<h1>SocialSkip <span id="api-v1">API v1</span></h1>
				
				<h2>Authentication</h2>
				
				<div>
					<p>SocialSkip API v1 use a Token-based authentication.</p>
					<p>Token-based authentication requires an access token that is used by a client to access the resources from the server. To get the access token, sign in and visit your <a href="/settings" rel="nofollow" data-ajax="false">account settings</a> page.</p>
					<p>The provided access token you will need to add it to all requests. You can do by adding the access token as a <code>access_token</code> GET parameter. (See below)</p>
					<div class="ui-body ui-body-a">					
						<code>http://www.socialskip.org/api/v1/interactions/experiment/123456?<b>access_token=YOUR_ACCESS_TOKEN</b></code>
					</div>
				</div>
				<br>
				
				<h2>Resources</h2>
				<h3>Video interactions log</h3>
				<h4>Experiment-based retrieval</h4>
				<table data-role="table" data-mode="reflow" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>method</th>
							<th>path</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>GET</td>
							<td>/api/v1/interactions/experiment/{experiment_id}</td>
							<td>http://www.socialskip.org/api/v1/interactions/experiment/123456?access_token=***</td>
							<td>video interactions log of the experiment with id={experiment_id}</td>
						</tr>
					</tbody>
				</table>
				
				<h4>Filters</h4>
				<table data-role="table" data-mode="reflow" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>parameter</th>
							<th>accepted values</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>interactions</td>
							<td><i>forward</i>, <i>backward</i>, <i>play</i> and <i>pause</i></td>
							<td>http://www.socialskip.org/api/v1/interactions/experiment/123456?interactions=forward-backward&amp;access_token=***</td>
							<td>returns only selected interactions on the video interactions log</td>
						</tr>
					</tbody>
				</table>
				
				<br>
				
				<h4>Video-based retrieval</h4>
				<table data-role="table" data-mode="reflow" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>method</th>
							<th>path</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>GET</td>
							<td>/api/v1/interactions/video/{youtube_video_id}</td>
							<td>http://www.socialskip.org/api/v1/interactions/video/tVIIgpIqoPw?access_token=***</td>
							<td>video interactions log of the video with id={youtube_video_id}</td>
						</tr>
					</tbody>
				</table>
				
				<h4>Filters</h4>
				<table data-role="table" data-mode="reflow" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>parameter</th>
							<th>accepted values</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>interactions</td>
							<td><i>forward</i>, <i>backward</i>, <i>play</i> and <i>pause</i></td>
							<td>http://www.socialskip.org/api/v1/interactions/video/tVIIgpIqoPw?interactions=forward-backward&amp;access_token=***</td>
							<td>returns only selected interactions on the video interactions log</td>
						</tr>
						<tr>
							<td>has_questionnaire</td>
							<td><i>yes</i> or <i>no</i></td>
							<td>http://www.socialskip.org/api/v1/interactions/video/tVIIgpIqoPw?has_questionnaire=no&amp;access_token=***</td>
							<td>returns interactions only for experiments which include (or not include) a questionnaire</td>
						</tr>
					</tbody>
				</table>
				
				
				<h4>Example</h4>
				<div class="ui-body ui-body-a">
					<h5>Request</h5>
					
					<code>http://www.socialskip.org/api/v1/interactions/experiment/123456?interactions=backward-forward-pause&amp;access_token=***</code>
					
					<h5>Response</h5>
						<pre><code>		
[{
  "video_id":"123456",
  "interaction_id":"1",
  "interaction":"Backward",
  "tester_id":"1000",
  "interaction_time":"15/03/2014 18:03:51",
  "video_time":"79",
  "skip_time":"10"
},
{
  "video_id":"123456",
  "interaction_id":"2",
  "interaction":"Forward",
  "tester_id":"1000",
  "interaction_time":"15/03/2014 18:04:03",
  "video_time":"194",
  "skip_time":"103"
},
{
  "video_id":"123456",
  "interaction_id":"4",
  "interaction":"Pause",
  "tester_id":"1000",
  "interaction_time":"15/03/2014 18:04:07",
  "video_time":"198",
  "skip_time":"0"
}]
						
						</code></pre>
				</div>
				
				
				<br>
				<h3>Timeseries</h3>
				<h4>Experiment-based retrieval</h4>
				<table data-role="table" data-mode="reflow" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>method</th>
							<th>path</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>GET</td>
							<td>/api/v1/timeseries/experiment/{experiment_id}/backward</td>
							<td>http://www.socialskip.org/api/v1/timeseries/experiment/123456/backward?access_token=***</td>
							<td>backward timeseries of the experiment with id={experiment_id}</td>
						</tr>
						<tr>
							<td>GET</td>
							<td>/api/v1/timeseries/experiment/{experiment_id}/forward</td>
							<td>http://www.socialskip.org/api/v1/timeseries/experiment/123456/forward?access_token=***</td>
							<td>forward timeseries of the experiment with id={experiment_id}</td>
						</tr>
					</tbody>
				</table>
				
				<h4>Filters</h4>
				<table data-role="table" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>parameter</th>
							<th>accepted values</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colspan="4"><i>No filters for this retrieval method.</i></td>
						</tr>
					</tbody>
				</table>
				
				<h4>Video-based retrieval</h4>
				<table data-role="table" data-mode="reflow" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>method</th>
							<th>path</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>GET</td>
							<td>/api/v1/timeseries/video/{youtube_video_id}/backward</td>
							<td>http://www.socialskip.org/api/v1/timeseries/video/tVIIgpIqoPw/backward?access_token=***</td>
							<td>backward timeseries of the video with id={youtube_video_id}</td>
						</tr>
						<tr>
							<td>GET</td>
							<td>/api/v1/timeseries/video/{youtube_video_id}/forward</td>
							<td>http://www.socialskip.org/api/v1/timeseries/video/tVIIgpIqoPw/forward?access_token=***</td>
							<td>forward timeseries of the video with id={youtube_video_id}</td>
						</tr>
					</tbody>
				</table>
				
				<h4>Filters</h4>
				<table data-role="table" data-mode="reflow" class="api-list ui-responsive">
					<thead>
						<tr>
							<th>parameter</th>
							<th>accepted values</th>
							<th>example</th>
							<th>description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>has_questionnaire</td>
							<td><i>yes</i> or <i>no</i></td>
							<td>http://www.socialskip.org/api/v1/timeseries/video/tVIIgpIqoPw/backward?has_questionnaire=no&amp;access_token=***</td>
							<td>returns data only for experiments which include (or not include) a questionnaire</td>
						</tr>
					</tbody>
				</table>
				
				<h4>Example</h4>
				<div class="ui-body ui-body-a">
					<h5>Request</h5>
					
					<code>http://www.socialskip.org/api/v1/timeseries/video/tVIIgpIqoPw/forward?access_token=***</code>
					
					<h5>Response</h5>
						<pre><code>		
[{
  "video_time":0,
  "count":12
},
{
  "video_time":1,
  "count":14
},
{
  "video_time":2,
  "count":14
},
{
  "video_time":3,
  "count":15
},
{
  "video_time":4,
  "count":15
}]
						
						</code></pre>
				</div>
				<br>
			</div>
	
		</div>
		
		<%@include file="footer.jsp" %>
		   
	</div>
</body>

</html>
