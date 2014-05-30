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

import socialskip.FusionApi;
import socialskip.CheckCaptcha;

public class SignUpServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, SocketTimeoutException {
		
		PrintWriter out = resp.getWriter();
		
		// captcha fields 
		String remoteAddr = req.getRemoteAddr();
        String challenge = req.getParameter("recaptcha_challenge_field");
        String uresponse = req.getParameter("recaptcha_response_field");


        String mail = req.getParameter("mail").trim().toLowerCase();	
		String name = req.getParameter("name").trim();
		String result = "ok";
		
		boolean captchaIsValid = CheckCaptcha.isValidCaptcha(remoteAddr, challenge, uresponse);
		
		if (captchaIsValid == false) {
			result = "valid";
		} else if(!(mail.isEmpty()) && !(name.isEmpty()) && (mail.endsWith("@gmail.com")) && (name.length() > 3)) { // check if parameters are correct
			try {
				if (!(UserInfo.isResearcher(mail))) { // if user isn't already registered
					FusionApi tables = new FusionApi();
					String query = "INSERT INTO " + FusionApi.RESEARCHERS
							+ " (Mail, Name) VALUES ('"
							+ mail + "', '"
							+ name + "')";
					tables.run(query);
				}
				else { // if user is already registered
					result = "no";
				}
				
			} catch (AuthenticationException e) {
				result = "error";
			} catch (ServiceException e) {
				result = "error";
			} catch (Exception e) {
				result = "error";
			}
		} else {
			result = "error";
		}
			
		out.print(result);
	}
}