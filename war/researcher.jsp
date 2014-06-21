<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="socialskip.UserInfo" %>
<%@ page import="socialskip.FusionApi" %>
<%@ page import="socialskip.WelcomeServlet" %>


<% 

	String login = WelcomeServlet.getLoginUrl(); 
	String logout = WelcomeServlet.getLogoutUrl();

	// user signs in with his google account 
    FusionApi tables = new FusionApi();
	String mail = UserInfo.getMail();
	
	
	if (mail.isEmpty() || mail == null || mail.equals("")) {
		response.sendRedirect(login);
	}

	String user = "";
	
	try {
		if (!(UserInfo.isResearcher(mail))) {
			response.sendRedirect("/error.jsp?reason=noreseacher"); 
		}
		
		user = UserInfo.getResearcherID();
	} catch (Exception e) {
		response.sendRedirect("/error.jsp");
	}
	
	if(user.isEmpty() || user == null) {
			response.sendRedirect("/error.jsp");
	}
	
	// Look for researcher videos
	try {
		tables.run("SELECT ROWID, VideoURL, Title, Controls, Questionnaire, Info, TimeRange, IconColor, PgsColor, BgColor FROM " + FusionApi.EXPERIMENTS + " WHERE ResearcherId='" + user + "'");
	} catch(Exception e) {
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
	
	<title>SocialSkip - Researcher (<%= mail %>)</title>
	<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
	<script src="https://www.google.com/jsapi" type="text/javascript"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<link rel="stylesheet" href="css/themes/black-theme.min.css" />
	<link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" />
	<script src="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.2/jquery.mobile.min.js"></script>
	<script src="/code/researcher.js" type="text/javascript"></script>
	<script src="/code/charts.js" type="text/javascript"></script>
	<script src="/code/responsive.js" type="text/javascript"></script> 
	<script src="/css/dropdownmenu/ddm.js" type="text/javascript"></script> 
	<script src="/code/jscolor/jscolor.js" type="text/javascript"></script>
	<script src="/code/googleanalytics.js" type="text/javascript"></script> 
</head>

<body >
	
	<div data-role="page" id="researchersPage" data-theme="a">
	
	<div data-role="header" data-tap-toggle="false" data-position="fixed">
		<div class="responsive">
			<a href="/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>      
			<div id="dd" class="wrapper-dropdown-5" tabindex="1" style="float:right;"><a data-icon="user" data-role="button" style="float:right;"><%=UserInfo.getNickname()%><span class="responhide">@gmail.com</span></a>
				<ul class="dropdown">
					<%
					  if( UserInfo.isAdministrator()) {
					%>
					<li><a href="/experiments" rel="external" data-ajax="false">Admin panel</a></li>
					<%
					  }
					%>
					<li><a href="/researcher" rel="external" data-ajax="false">Researcher panel</a></li>
					<li><a href="<%=logout%>" rel="external" data-ajax="false">Log out</a></li>
				</ul>
			</div>
		</div>
	</div>
	
	    
	
	<div data-role="content" data-theme="a">
	<div class="responsive">
	<br><br>
	<div id="experiments">
	<% 
		String col = "false"; 	
		for (Iterator<String[]> rows = tables.getRowsIterator(); rows.hasNext(); ) { 
						String[] rowValues = rows.next();
						
	%>
		
   		<div data-role="collapsible" data-theme="b" data-collapsed="<%= col %>" data-mini="true" id="<%=rowValues[0]%>" >
        <h2><%= rowValues[2] %></h2>

        <table id="exptable" style="margin:auto;">
				<tr>
				<td class="hidden"><%= rowValues[2] %></td>
					<td class="hidden"><%= rowValues[0] %></td>
					<td class="hidden"><%= rowValues[1] %></td>
					<td class="hidden"><%= rowValues[3] %></td>
					<td class="hidden"><%= rowValues[4] %></td>
					<td class="hidden"><%= rowValues[5] %></td>
					<td class="hidden"><%= rowValues[6] %></td>
					<td class="hidden"><%= rowValues[7] %></td>
					<td class="hidden"><%= rowValues[8] %></td>
					<td class="hidden"><%= rowValues[9] %></td>
					
				<td class="videohide" style="margin-right:5px">
					<iframe class="youtube-player" type="text/html" width="416" height="259"
  						src="<%=rowValues[1]%>?html5=1&theme=light&color=red"
  						frameborder="0"></iframe>
				</td>
				<td style="min-width:10px;"></td>
				<td><input type="button" value="Edit" data-icon="edit" class="edit" data-theme="b" data-mini="true" />
					<input type="button" value="Charts" data-icon="eye" class="charts" data-theme="b" data-mini="true" />
					<input type="button" value="Get URL" data-icon="bullets" class="geturl" data-theme="b" data-mini="true" />
					<input type="button" value="Embed" data-icon="carat-r" class="getcode" data-theme="b" data-mini="true" />
					<input type="button" value="Download data" data-icon="arrow-d" class="download" data-theme="b" data-mini="true" />
					<input type="button" value="Delete" data-icon="delete" class="delete" data-theme="b" data-mini="true" />
				</td>
				</tr>
		</table>
        
    	</div>
		
    
    
    <%
    		col = "true";
		}
	%>
	</div>

    <br><br>
    <div style="margin:auto;max-width:220px;">
    <input type="button" class="newexp" value="Create new experiment" onclick="insert();" data-mini="true" data-theme="b"/>
    </div>
    </div>
	</div>
	
	</div>
	
	<div data-role="dialog" id="codeinfo" data-theme="b" data-close-btn="right">
		<div data-role="header" data-theme="a">
    		<h1>Embed</h1>
 		</div>
		<div data-role="content" data-theme="b">
			Copy the following lines just before in the <code>&lt;/head&gt;</code> tag.
<textarea>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="http://<%=WelcomeServlet.getAppId()%>.appspot.com/code/socialskip.js" type="text/javascript"></script>
</textarea>
			Also copy the following line in the body.
			<textarea id="codearea"></textarea>
		</div> 
	</div>
	
	<div data-role="dialog" id="videoinfo" data-theme="b" data-close-btn="right">
		<div data-role="header" data-theme="a">
    		<h1>Experiment Info</h1>
  		</div>
  		<div data-role="content" data-theme="b">
  		<form id="createupdate" action="/researcher_videos" method="post" data-ajax="false">
  			<input type="text" class="hidden" name="action" id="action" data-role="none" />
  			<input type="text" class="hidden" name="expid" id="expid" data-role="none" />
  			<input type="text" class="hidden" name="researcher" value="<%=user%>" data-role="none" />
  			<input type="text" class="hidden" name="controls" id="controls" data-role="none" />
  			<input type="text" class="hidden" name="vtimerange" id="vtimerange" data-role="none" />
	  		<div class="ui-field-contain">
			  <label for="descr">Title:</label>
    		  <input type="text" id="descr" class="infotext" name="descr" placeholder="Title..." />
    		</div>
	  		<div>
	  			<fieldset class="ui-field-contain" data-type="horizontal">
    		  		<label for="videourl" >Video URL:</label>
	  	      		<input type="text" id="videourl" name="videourl" placeholder="Youtube video URL..." />
	  	      	</fieldset>
	  	    </div>

	  	    <div id="videotimerange">
		  	    <div class="ui-field-contain" id="videotimerange">
		  	    	<div data-role="rangeslider" data-mini="true">
						<label for="starttime">Start &amp; End Time (sec):</label>
						<input name="starttime" id="starttime" min="0" value="0" type="range" data-highlight="true" data-theme="b" />
						<label for="endtime">Video Start &amp; End Time:</label>
						<input name="endtime" id="endtime" min="0" value="100" type="range" data-highlight="true" data-theme="b" />
					</div>
		  	    </div>
	  	    </div>	 
			
			<div>
				<fieldset class="ui-field-contain" data-type="horizontal">
    		  		<label for="videourl">Interaction (min):</label>
	  	      		<input type="range" name="interaction" id="interaction" value="0" min="0" max="120" data-highlight="true" data-theme="b" data-mini="true"/>
	  	      	</fieldset>
	  	    </div>
	  	    
	  	    
	  	    <div>
	  	    	<fieldset class="ui-field-contain" data-type="horizontal">
			  		<label for="descr" >Questionnaire</label>
    		  		<input type="text" id="question" class="infotext" name="question" placeholder="Google doc url..." />
    		  	</fieldset>
    		</div>
    		
    		<div>
    			<fieldset class="ui-field-contain" data-type="horizontal">
			  		<label for="descr">Information:</label>
    		  		<input type="text" id="info" class="infotext" name="info" placeholder="Google doc url..." />
    		  	</fieldset>
    		</div>
    		
    		<div data-role="fieldcontain" >
			<a id="custplayer" data-mini="true" data-role="button" data-icon="gear">Customize player</a>
			</div>
			
			<div id="more">
		    	<div>
		    	  <fieldset class="ui-field-contain" >
		    	  <label for="play">Play/Pause:</label>
					<select name="play" id="play" data-role="slider" data-mini="true" data-theme="b">
	    				<option value="off">Off</option>
	    				<option value="on">On</option>
					</select>
				  </fieldset>
				</div>
				
	    	  	<fieldset class="ui-field-contain" data-type="horizontal">
		    	  	<label for="volume">Volume:</label>
					<select name="volume" id="volume" data-role="slider" data-mini="true" data-theme="b" >
	    				<option value="off">Off</option>
	    				<option value="on">On</option>
					</select>
				</fieldset>
				<fieldset class="ui-field-contain" data-type="horizontal">
					<label for="fullscreen">Fullscreen:</label>
					<select name="fullscreen" id="fullscreen" data-role="slider" data-mini="true" data-theme="b" >
	    				<option value="off">Off</option>
	    				<option value="on">On</option>
					</select>
			 	</fieldset>
			 	<fieldset class="ui-field-contain" data-type="horizontal">
		    	  	<label for="quality">Quality:</label>
					<select name="quality" id="quality" data-role="slider" data-mini="true" data-theme="b" >
	    				<option value="off">Off</option>
	    				<option value="on">On</option>
					</select>
					</fieldset>
				<fieldset class="ui-field-contain" data-type="horizontal">
					<label for="playbackrate">Playback Rate:</label>
					<select name="playbackrate" id="playbackrate" data-role="slider" data-mini="true" data-theme="b" >
	    				<option value="off">Off</option>
	    				<option value="on">On</option>
					</select>
			 	</fieldset>
		    	
		     	<fieldset class="ui-field-contain">	  		
		     	  	<label for="icolor">Icon Color:</label>
		     	  	<input id="icolor" name="icolor" class="color {hash:true, required:true}"  data-mini="true">
		     	</fieldset>
		        <fieldset class="ui-field-contain">	 
		          	<label for="bcolor">Progress Color:</label>
		    	  	<input id="pcolor" name="pcolor" class="color {hash:true, required:true}"  data-mini="true">
		  		</fieldset>
		  		<fieldset class="ui-field-contain">	 
		         	<label for="bcolor">Background Color:</label>
		    		<input id="bcolor" name="bcolor" class="color {hash:true, required:true}"  data-mini="true">
		  		</fieldset>
	  		</div>
    		
    		<div>
    			<fieldset class="ui-field-contain" data-type="horizontal">
			  		Please read the  <a title="Help" href="/instructions.html" target="_blank">instructions</a> before filling the form.
    		  	</fieldset>
    		</div>
    		
    		<div>
    			<fieldset class="ui-field-contain" data-type="horizontal">
			  		<input type="submit" id="submit" value="TEST" data-icon="check" onclick="return validateForm()" />
    		  	</fieldset>
    		</div>
    		
	  		
			
 		 </form>
	</div>
	</div>
	
	<div data-role="dialog" id="viewcharts" data-close-btn="right">
  		<div data-role="header" data-theme="a">
    		<h1>Data Visualization</h1>
 		 </div>
  
  		<div data-role="content" data-theme="b">
   			<input type="hidden" class="hidden" name="charts" id="charts" />
			<input type="hidden" class="hidden" name="controls" id="controls" />
			<input class="hidden" id="count" type="hidden"/>
			
			<input type="button" id="chbuttons" value="Backward Timeseries" class="viewbackward" data-mini="true"/>
			<input type="button" id="chbuttons" value="Forward Timeseries" class="viewforward" data-mini="true" />
  		</div>
	</div>


	<div data-role="dialog" id="chart" data-close-btn="right">
  		<div data-role="header" data-theme="a">
    		<h1>Data Visualization</h1>
 		 </div>
  
  		<div data-role="content" data-theme="a" >
  			<fieldset class="ui-field-contain">
   			 	<div id="visualization"></div>
  			</fieldset>
  		
  			<fieldset class="ui-field-contain">
	  			Actual values of Count.<br>
				Max value: <span id="maxvalcount"></span><br>
				Min value: <span id="minvalcount"></span>
			</fieldset>
		</div>
	</div>
	
	<div data-role="dialog" id="urlvideo" data-close-btn="right">
  		<div data-role="header">
    		<h1>Experiment URL</h1>
 		 </div>
  
  		<div data-role="content" data-theme="a" >
   			 <input type="text" id="geturl" />
  		</div>
	</div>	
	
	<div data-role="dialog" id="download" data-close-btn="right">
  		<div data-role="header" data-theme="a">
    		<h1>Download data</h1>
 		 </div>
  
  		<div data-role="content" data-theme="b">
   			<input type="hidden" class="hidden" name="dlexpid" id="dlexpid" />
			<input type="hidden" class="hidden" name="dltitle" id="dltitle" />
			<input class="hidden" id="count" type="hidden"/>
			
			<input type="button" value="Video Interactions Log" class="rowsdata" data-mini="true"/>
			<input type="button" value="Backward Timeseries data" class="backwarddata" data-mini="true"/>
			<input type="button" value="Forward Timeseries data" class="forwarddata" data-mini="true" />
  		</div>
	</div>

</body>
</html>