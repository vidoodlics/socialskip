	<div data-role="header" data-tap-toggle="false" data-position="fixed">
		<div class="responsive">
			<a href="http://www.socialskip.org/home" data-icon="home" rel="external" data-ajax="false" data-role="button">SocialSkip</a>
			<% 
			boolean isResearcher = false;
			try {
			isResearcher = UserInfo.isResearcher(UserInfo.getMail());
			if(!isResearcher) { %>
			 	<a href="#add-form" data-icon="action" rel="external" data-ajax="false" data-role="button" style="float:right;">Sign up</a>
				<a href="<%=login%>" data-icon="lock" rel="external" data-ajax="false" data-role="button" style="float:right;">Login</a>
			<% } else {%>
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
						<li><a href="/settings" rel="external" data-ajax="false">Settings</a></li>
						<li><a href="<%=logout%>" rel="external" data-ajax="false">Log out</a></li>
					</ul>
				</div>			
			<% } 
			} catch (Exception e) {
				response.sendRedirect("/error.jsp"); 
			}
			%>
		</div>
	</div>	