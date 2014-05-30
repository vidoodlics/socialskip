<%@page import="java.io.Console"%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.net.SocketTimeoutException"%>
<%@ page import="java.util.Iterator"%>
<%@ page import="socialskip.FusionApi"%>
<%@ page import="socialskip.UserInfo" %>
<%@ page import="socialskip.WelcomeServlet" %>

<% 
	String logout = WelcomeServlet.getLogoutUrl();
	String mail = UserInfo.getMail();

	//	if user is not admin redirect		
	if(!(UserInfo.isAdministrator())) {
		response.sendRedirect("/error.jsp?reason=nopermission"); 
	}

	FusionApi expTable = new FusionApi();
	FusionApi researchersTable = new FusionApi();

	// select data from experiments and researchers tables
	try {
		expTable.run("SELECT ROWID, Title, ResearcherId FROM " + FusionApi.EXPERIMENTS + " ORDER BY ResearcherId");
		researchersTable.run("SELECT ROWID, Name, Mail FROM " + FusionApi.RESEARCHERS);
	} catch(SocketTimeoutException e) {
		response.sendRedirect("/error.jsp");
	} catch(Exception e) {
		response.sendRedirect("/error.jsp");
	}
%>
<!DOCTYPE html>
<html>
<head>
<title>SocialSkip - Experiments  (<%= mail %>)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon" />
<link rel="stylesheet" type="text/css" href="/css/responsive.css" />
<link rel="stylesheet" type="text/css" href="/css/dropdownmenu/ddm.css" />
<link rel="stylesheet" href="css/themes/black-theme.min.css" />
<link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" /> 
<link rel="stylesheet" type="text/css" href="/css/allpages.css" />
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquerymobile/1.4.2/jquery.mobile.min.js"></script>
<script src="/code/signup.js" type="text/javascript"></script>
<script src="/code/responsive.js" type="text/javascript"></script>
<script src="/css/dropdownmenu/ddm.js" type="text/javascript"></script> 
</head>

<body>
	<div data-role="page" data-theme="a">
		<div data-role="header" data-tap-toggle="false" data-position="fixed">
			<div class="responsive">
				<a href="/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
				<div id="dd" class="wrapper-dropdown-5" tabindex="1" style="float:right;"><a data-icon="user" data-role="button" style="float:right;"><%=UserInfo.getNickname()%><span class="responhide">@gmail.com</span></a>
					<ul class="dropdown">
						<li><a href="/experiments" rel="external" data-ajax="false">Admin panel</a></li>
						<li><a href="/researcher" rel="external" data-ajax="false">Researcher panel</a></li>
						<li><a href="<%=logout%>" rel="external" data-ajax="false">Log out</a></li>
					</ul>
				</div>
			</div>
		</div>

		<div data-role="content" data-theme="b" class="responsive">
			<br/>
			<div style="width:90%;margin:auto;">
				<ul data-role="listview" data-filter="true" data-filter-placeholder="Search by name, mail or title..." >
				<%
				// for each row from experiments table
				for (Iterator<String[]> exprows = expTable.getRowsIterator(); exprows.hasNext();) {
					String[] expRowValues = exprows.next();
					// for each row from researchers table
					for (Iterator<String[]> resrows = researchersTable.getRowsIterator(); resrows.hasNext();) {
						String[] researcherRowValues = resrows.next();
						// if ROWID from reasearchers table = ResearcherId from expeiments table
						if( researcherRowValues[0].equals(expRowValues[2]) ) {
							// display experiment
				%>
							<li><a href="/?videoId=<%=expRowValues[0]%>" data-ajax="false"><%=researcherRowValues[1]%> | <%=expRowValues[1]%><span style="display:none;"><%=researcherRowValues[2]%></span></a></li>
				<%				
						}
					}
				}
				%>
				</ul>
			</div>
		</div>
		<br/><br><br>
	</div>
	
</body>
</html>