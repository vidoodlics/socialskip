package socialskip;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.SocketTimeoutException;
import java.util.Iterator;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ServiceException;
import com.google.gson.Gson;

import socialskip.FusionApi;

/* This servlet is executed in response to a Researchers action of Inserting,
 * Updating or Deleting an experiment from his list of active ones.
 */
public class ResearcherVideosServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;
	
	public static boolean isVideoResearcher(String videoID)
			throws SocketTimeoutException, AuthenticationException, IOException, ServiceException, ServletException{
		FusionApi tables = new FusionApi();
		boolean found = false;
	 	tables.run("SELECT ROWID FROM " + FusionApi.EXPERIMENTS + " WHERE ResearcherId='" + UserInfo.getResearcherID() + "' AND ROWID='" + videoID +"'");

	 	for (Iterator<String[]> rows = tables.getRowsIterator(); rows.hasNext(); ) { 
			String[] rowValues = rows.next();
			if ((rowValues[0].toString()).equals(videoID)) {
		 		found = true;
		 	}
	 	}
	 	
		return found;
	}
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, SocketTimeoutException {
		int action = Integer.parseInt(req.getParameter("action")); // Kind of action requested from user
		PrintWriter out = resp.getWriter();
		String result = "OK";
		String descr = req.getParameter("descr").trim();
		
		if (action == 1 || action == 2) {
				descr = descr.replaceAll("[<>]","");
				descr = descr.replace("'", "&#39;");
				descr = descr.replace("\"", "&#34;");
		}

    	try {
			if ((req.getParameter("researcher")).equals(UserInfo.getResearcherID()) ) {
				
				FusionApi tables = new FusionApi();
				if (action == 1) { // Update experiment info
					if (isVideoResearcher(req.getParameter("expid"))) {
						String query = "UPDATE " + FusionApi.EXPERIMENTS
								+ " SET VideoURL='" + req.getParameter("videourl").replaceAll("[<>'\"]","") 
									+ "', Title='" + descr 
									+ "', Controls='" + req.getParameter("controls")
									+ "', TimeRange='" + req.getParameter("vtimerange")
									+ "', Questionnaire='" + req.getParameter("question").replaceAll("[<>'\"]","") 
									+ "', Info='" + req.getParameter("info").replaceAll("[<>'\"]","") 
									+ "', IconColor='" + req.getParameter("icolor").replaceAll("[<>'\"]","") 
									+ "', PgsColor='" + req.getParameter("pcolor").replaceAll("[<>'\"]","") 
									+ "', BgColor='" + req.getParameter("bcolor").replaceAll("[<>'\"]","") 
								+ "' WHERE ROWID='" + req.getParameter("expid") + "'";
						tables.run(query);
					} else {
						result = "ERROR";
					}
					
				} else if (action == 2) { // Create new experiment
					
					String query = "INSERT INTO "
							+ FusionApi.EXPERIMENTS
							+ " (ResearcherId, VideoURL, "
							+ "Title, Controls, Questionnaire, Info, TimeRange, IconColor, PgsColor, BgColor) VALUES ('"
							+ req.getParameter("researcher") + "', '"
							+ req.getParameter("videourl").replaceAll("[<>'\"]","")  + "', '" + descr + "', '"
							+ req.getParameter("controls") + "', '" 
							+ req.getParameter("question").replaceAll("[<>'\"]","") + "', '"
							+ req.getParameter("info").replaceAll("[<>'\"]","") + "', '"
							+ req.getParameter("vtimerange") + "', '"
							+ req.getParameter("icolor").replaceAll("[<>'\"]","") + "', '"
							+ req.getParameter("pcolor").replaceAll("[<>'\"]","") + "', '"
							+ req.getParameter("bcolor").replaceAll("[<>'\"]","") + "')";
					tables.run(query);
					result = tables.getFirstRow()[0];
					
				} else if (action == 3) { // Delete experiment
					if (isVideoResearcher(req.getParameter("expid"))) {
						String query = "DELETE FROM " + FusionApi.EXPERIMENTS
								+ " WHERE ROWID='" + req.getParameter("expid")
								+ "'";
						tables.run(query);
					} else {
						result = "ERROR";
					}
				}
			} else {
				result = "ERROR";
			}
	    } catch (IndexOutOfBoundsException e ) {
	    	result = "ERROR";
	    } catch (Exception e) {
	    	result = "ERROR";
	    }
    	out.print(result);
	}
	
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		Gson gson = new Gson(); // JSON conversion
		PrintWriter out = resp.getWriter();
		String result = "[]";
		String callback = req.getParameter("callback");
		
    	try {
    		FusionApi tables = new FusionApi();
    		String query = "SELECT ResearcherId, VideoURL, Questionnaire, Controls, Info, Title, TimeRange, IconColor, PgsColor, BgColor "
    				+ "FROM " + FusionApi.EXPERIMENTS
    				+ " WHERE ROWID='" + req.getParameter("expid") + "'";
    		tables.run(query);
    		if (tables.rowCount() == 1) {
    			result = gson.toJson(tables.getFirstRow());
    		}
	    } catch (AuthenticationException e) {
	    	result = gson.toJson("ERROR");
	    } catch (ServiceException e) {
	    	result = gson.toJson("ERROR");
	    }
    	resp.setContentType("text/javascript");
    	out.print(callback + "(" + result + ");");
	}
}