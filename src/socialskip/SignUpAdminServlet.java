/**
 * 
 * @author Kostas Pardalis
 */

package socialskip;

import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.SocketTimeoutException;

import javax.servlet.http.*;


public class SignUpAdminServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, SocketTimeoutException {
		
		PrintWriter out = resp.getWriter();
		String result = "ok";
		
		String name = req.getParameter("name").trim();
		String mail = req.getParameter("mail").toLowerCase().trim();
		
		try {
			// if user is not admin or user is already researcher
			if (!(UserInfo.isAdministrator()) || (UserInfo.isResearcher(mail))) {
				result = "error";
			} else { // else insert admin in database
				FusionApi tables = new FusionApi();
				String query = "INSERT INTO " + FusionApi.RESEARCHERS
						+ " (Mail, Name) VALUES ('" + mail + "', '" + name
						+ "')";
				tables.run(query);
				result = "ok";
			}
		} catch (AuthenticationException e) {
			result = "error";
		} catch (ServiceException e) {
			result = "error";
		} catch (Exception e) {
			result = "error";
		}
		
		out.print(result);
	}
	
}