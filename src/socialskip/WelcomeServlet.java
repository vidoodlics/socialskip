package socialskip;

import com.google.appengine.api.users.User;
import com.google.appengine.api.utils.SystemProperty;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;

import java.io.IOException;

import javax.servlet.http.*;

import socialskip.FusionApi;

import javax.servlet.ServletException;

/* This is the main servlet of the application. All incoming traffic comes here
 *  where the servlet decides the appropriate response.*/
public class WelcomeServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;

	/* This method determines if the user belongs to the researchers group. */
	private boolean isResearcher(User user)
			throws AuthenticationException, ServiceException, IOException, ServletException {
    	FusionApi tables = new FusionApi();
	 	String userMail = user.getEmail().toLowerCase();
	 	
		boolean found = false;
		
		
		// Check Researchers table to see if user is there
	 	tables.run("SELECT Mail FROM " + FusionApi.RESEARCHERS + " WHERE Mail='" + userMail.toLowerCase() + "'");
	 	try {
		 	if ((tables.getFirstRow()[0].toString()).equals(userMail)) {
		 		found = true;
		 	}
	 	} catch (IndexOutOfBoundsException e) {
	 		found = false;
	 	} catch (Exception e) {
	 		found = false;
	 	}
	 	return found;
	}
	
	/* An utility method used to construct the URL to watch the
	 * requested video.
	 */
	private String watchURL(String videoId) {
		StringBuffer url= new StringBuffer("/watch?videoId=" + videoId);
		return url.toString();
	}
	
	public static String getLoginUrl() {
		UserService userService = UserServiceFactory.getUserService();
		String login = userService.createLoginURL("/welcome");
		return login;
		
	}
	
	public static String getLogoutUrl() {
		UserService userService = UserServiceFactory.getUserService();
		String logout = userService.createLogoutURL("/welcome");
		return logout;
		
	}
	
	public static String getAppId() {
		return SystemProperty.applicationId.get();
	}

	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, ServletException {
		UserService userService = UserServiceFactory.getUserService();
	    User user = userService.getCurrentUser();
	    String videoId = req.getParameter("videoId");

		
			try {
				if (videoId != null) { // To watch video
					resp.sendRedirect(watchURL(videoId));
				} else {
					if (user == null) {
						resp.sendRedirect("/home");
					} else {
						if (isResearcher(user)) { // Yes
							resp.sendRedirect("/researcher");
						} else if (UserInfo.isAdministrator()) {
							resp.sendRedirect("/adminsignup");
						} else {
							resp.sendRedirect("/home?param=notresearcher");
						}
					}
				}
			} catch (Exception e) {
				resp.sendRedirect("/error.jsp");
			}
	}
}