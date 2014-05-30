package socialskip;

import java.io.IOException;

import javax.servlet.ServletException;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;


public class UserInfo {

    private static UserService userService = UserServiceFactory.getUserService();

    /* This method return the gmail of user */
    public static String getMail() {
        User user = userService.getCurrentUser();
        if(user==null) {return "";}
        else {return user.getEmail().toLowerCase();}
    }
    
    /* This methos checks if user is logged in with google account */
    public static boolean isUserLoggedIn() {
        User user = userService.getCurrentUser();
        if(user==null) {return false;}
        else {return true;}
    }
    
    /* This method returns true if user is admin
     * or false if user is not admin */
    public static boolean isAdministrator() {
    	return userService.isUserAdmin();    	
    }
    
    /* This method checks if user is researcher and
     * returns true if it is otherwise returns false*/
	public static boolean isResearcher(String mail)
			throws AuthenticationException, ServiceException, IOException, IndexOutOfBoundsException, ServletException {
    	FusionApi tables = new FusionApi();
		boolean found = false;
		mail = mail.toLowerCase();
		// Check Researchers table to see if user is there
	 	tables.run("SELECT Mail FROM " + FusionApi.RESEARCHERS + " WHERE Mail='" + mail +"'");
	 	
	 	try {
		 	String[] firstrow = tables.getFirstRow();
			if ((firstrow[0].toString()).equals(mail)) {
		 		found = true;
		 	}
	 	} catch (IndexOutOfBoundsException e) {
	 		found = false;
	 	} catch (Exception e) {
	 		found = false;
	 	}
	 	
	 	return found;
	}
	
	/* This method returns the researcher Id*/
	public static String getResearcherID()
			throws AuthenticationException, ServiceException, IOException, IndexOutOfBoundsException, ServletException {
    	FusionApi tables = new FusionApi();
	 	tables.run("SELECT ROWID FROM " + FusionApi.RESEARCHERS + " WHERE Mail='" + getMail() + "'");
		return tables.getFirstRow()[0].toString();
	}
	
    /* This method returns the nickname of the user */
    public static String getNickname() {
        User user = userService.getCurrentUser();
        if(user==null) {return "";}
        else {return user.getNickname();}
    }
    
}
