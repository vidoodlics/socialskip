package socialskip;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.SocketTimeoutException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * Servlet implementation class SignUpServlet
 */
public class SignUpServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, SocketTimeoutException {
		
		PrintWriter out = resp.getWriter();
		String result = "error";;
		
		String name = req.getParameter("name").trim();
		String mail = UserInfo.getMail();
		
		try {
			// if user is not admin or user is already researcher
			if (UserInfo.isAdministrator() || UserInfo.isResearcher(mail)) {
				result = "error1";
			} else { // else insert admin in database
				FusionApi tables = new FusionApi();
				String query = "INSERT INTO " + FusionApi.RESEARCHERS
						+ " (Mail, Name) VALUES ('" + mail + "', '" + name
						+ "')";
				tables.run(query);
				result = "ok";
			}
		} catch (Exception e) {
			result = "error";
		}
		
		out.print(result);
	}

}
