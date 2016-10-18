package socialskip;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.text.SimpleDateFormat;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

import javax.servlet.http.*;

import socialskip.FusionApi;

/**
 * This servlet is responsible for collecting the interactions on the watched
 * video, preparing a record for each one and sending them for insertion at
 * Fusion Table Service.
 * 
 */
public class InteractionsServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = -296698971282506430L;

	

	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		
		PrintWriter out = resp.getWriter();
		String result = "OK";
		
		SimpleDateFormat d = new SimpleDateFormat("dd/MM/yyyy KK:mm:ss");
		StringBuffer s = new StringBuffer();

		JsonParser jsonParser = new JsonParser();
		JsonArray interactions = (JsonArray) jsonParser.parse(req.getParameter("data")).getAsJsonArray();
		
		for (int n = 0; n < interactions.size(); n++) {
			JsonObject jo = interactions.get(n).getAsJsonObject();
			
			s.append("INSERT INTO " + FusionApi.INTERACTIONS + " (VideoId, TesterId, TransactionId, Time, SkipTime, TransactionTime) "
					+ "VALUES (" + jo.get("expid").getAsString() + ", '"); // One record for each interaction
			s.append(jo.get("tester").getAsString() + "', ");
			s.append(jo.get("code").getAsString() + ", "); // TransactionId
			s.append(jo.get("vtime").getAsString() + ", "); // Video time
			s.append(jo.get("jump").getAsString() + ", "); // Video time
			s.append("'" + d.format(new Date(Long.parseLong(jo.get("ctime").getAsString()))) + "');"); // TransactionTime
		    
		}
		
		try {
			FusionApi tables = new FusionApi();
			tables.run(s.toString()); // Send request to Fusion Table Service
		} catch (Exception e) {
			result = "ERROR";
		}
		out.print(result);
	
	 }
	
	
}