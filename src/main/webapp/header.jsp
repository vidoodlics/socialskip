<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="socialskip.UserInfo" %>
<%@ page import="socialskip.WelcomeServlet" %>

<div data-role="header" data-tap-toggle="false" data-position="fixed" data-theme="a">
	<div class="responsive">
		<a href="http://www.socialskip.org/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
		<% 
		boolean isResearcher = false;
		
		isResearcher = UserInfo.isResearcher(UserInfo.getMail());
		if(!isResearcher) { %>
			<a style="float:right;" href="<%=WelcomeServlet.getLoginUrl()%>" rel="external" data-ajax="false" data-role="button" id="login-with-google"><i class="fa fa-google fa-lg"></i>&nbsp;&nbsp;Login with Google</a>
		<% } else {%>
			<div id="dd" class="dropdown" tabindex="1" style="float:right;">
			<a data-icon="user" data-role="button" style="float:right;">
				<%=UserInfo.getMail().split("@")[0]%><span class="responhide">@<%=UserInfo.getMail().split("@")[1]%></span>
			</a>
				<ul>
					<%
						if (UserInfo.isAdministrator()) {
							%>
							<li><a href="/experiments" rel="external" data-ajax="false">Admin panel</a></li>
							<%
						}					
					%>
					<li><a href="/researcher" rel="external" data-ajax="false">Researcher panel</a></li>
					<li><a href="/settings" rel="external" data-ajax="false">Settings</a></li>
					<li><a href="<%=WelcomeServlet.getLogoutUrl()%>" rel="external" data-ajax="false">Log out</a></li>
				</ul>
			</div>			
		<% } 
		
		%>
	</div>
</div>	