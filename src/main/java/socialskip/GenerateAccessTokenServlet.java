package socialskip;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.SocketTimeoutException;
import java.util.UUID;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;


public class GenerateAccessTokenServlet  extends HttpServlet {

	private static final long serialVersionUID = -2013122986640593901L;

	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, SocketTimeoutException {
		
		PrintWriter out = resp.getWriter();
		
		Gson gson = new Gson(); // JSON conversion
		JsonObject entry = new JsonObject();
		
		
		try {		
			entry.addProperty("access_token", generateToken());

		} catch (Exception e) {
			entry.addProperty("access_token", "error");
		}
		
		out.print(gson.toJson(entry));
		
	}
	
	
	public String generateToken() {
		
		String uuid = UUID.randomUUID().toString();
		
		String query1, query2, query3;
		
		try {
			
			FusionApi tables = new FusionApi();
			
			query1 = "SELECT ROWID FROM " + FusionApi.ACCESS_TOKENS + " WHERE ResearcherId=" + UserInfo.getResearcherID();
			tables.run(query1);
			
			if (tables.rowCount() > 0) { // if already have token
				query2 = "UPDATE " + FusionApi.ACCESS_TOKENS
						+ " SET AccessToken='" + uuid + "'"
						+ " WHERE ROWID='" + tables.getFirstRow()[0] + "'";
				tables.run(query2);
			} else { // if not have token
				query3 = "INSERT INTO " + FusionApi.ACCESS_TOKENS
						+ " (ResearcherId, AccessToken) VALUES ('"
						+ UserInfo.getResearcherID() + "', '"
						+ uuid + "')";
				tables.run(query3);
			}			
			
		} catch (Exception e) {
			uuid = "error";
		}
		
		return uuid;
		
	}

}


