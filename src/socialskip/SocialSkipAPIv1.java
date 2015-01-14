package socialskip;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;


public class SocialSkipAPIv1 extends HttpServlet {
	
	private static final long serialVersionUID = 7862415130921685895L;

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		resp.setContentType("application/json");

		PrintWriter out = resp.getWriter();
		
		Gson gson = new Gson(); // JSON conversion
		
		JsonObject entry = new JsonObject();
		JsonArray jarr = new JsonArray();
		
		String interactionsParam = req.getParameter("interactions");
		
		try {
			FusionApi at_table = new FusionApi();
			
			at_table.run("SELECT ResearcherId FROM " +  FusionApi.ACCESS_TOKENS + " WHERE AccessToken='" + req.getParameter("access_token") + "'");
			
			if ( at_table.rowCount() > 0 ) {
		
				FusionApi table = new FusionApi();
				
				StringBuilder where = new StringBuilder();
				where.append(" WHERE ");
				
				// get uri
				String [] uri = req.getRequestURI().split("/");
		
				boolean ok = true;
				String errorMsg = "";
				
				// minimum api/beta/[interactions|timeseries]/[video|experiment]/{Id}
				if (uri.length >= 6) {
						
							
					if (uri[4].toLowerCase().equals("experiment") && !uri[5].isEmpty()) {
						
						table.run("SELECT ROWID FROM " +  FusionApi.EXPERIMENTS + " WHERE ResearcherId='" + at_table.getFirstRow()[0] + "' AND ROWID='" + uri[5] + "'");
						
						if ( table.rowCount() > 0 ) {
							where.append("VideoId='" + uri[5] + "'");
						} else {
							ok = false;
							errorMsg = "experiment not found";
						}
					} 
					else if (uri[4].toLowerCase().equals("video") && !uri[5].isEmpty()) {
						
						
						String hasQuestionnaire = req.getParameter("has_questionnaire");
						if (hasQuestionnaire != null && !(hasQuestionnaire.isEmpty())) {
							if (hasQuestionnaire.toLowerCase().equals("yes")) {
								table.run("SELECT ROWID FROM " +  FusionApi.EXPERIMENTS + " WHERE ResearcherId='" + at_table.getFirstRow()[0] + "' AND VideoURL LIKE '%/" + uri[5] + "'  AND Questionnaire LIKE '%/%'");
							} else {
								table.run("SELECT ROWID FROM " +  FusionApi.EXPERIMENTS + " WHERE ResearcherId='" + at_table.getFirstRow()[0] + "' AND VideoURL LIKE '%/" + uri[5] + "' AND Questionnaire DOES NOT CONTAIN '/'");
							}
						} else {
							table.run("SELECT ROWID FROM " +  FusionApi.EXPERIMENTS + " WHERE ResearcherId='" + at_table.getFirstRow()[0] + "' AND VideoURL LIKE '%/" + uri[5] + "'");
						}
						
						if ( table.rowCount() > 0 ) {
							StringBuilder in = new StringBuilder();
							
							for (Iterator<String[]> rows = table.getRowsIterator(); rows.hasNext(); ) {
								String[] rowValues = rows.next();
								
								in.append("'" + rowValues[0] + "'");
								
								if (rows.hasNext()) {
									in.append(",");
								}
								
							}
							
							where.append("VideoId IN (" + in.toString() + ")");
						
						} else {
							ok = false;
							errorMsg = "video not found";
						}
						
					}
					
					if (uri[3].toLowerCase().equals("interactions")) {
						
						if (interactionsParam != null && !(interactionsParam.isEmpty())) {
							
							String [] interactions = interactionsParam.toLowerCase().split("-");
							
							
							StringBuilder in = new StringBuilder();
							
							for (int i=0; i<interactions.length; i++) {
								
								if (interactions[i].equals("play")) {
									in.append("'Play'");
								} else if (interactions[i].equals("pause")) {
									in.append("'Pause'");
								} else if (interactions[i].equals("forward")) {
									in.append("'Forward'");
								} else if (interactions[i].equals("backward")) {
									in.append("'Backward'");
								} else {
									ok = false;
								}
								
								if (i != interactions.length-1) {
									in.append(",");
								}
							}
							where.append(" AND Transaction IN (" + in.toString() + ")");
						}
						
					} else if (uri[3].toLowerCase().equals("timeseries") && uri.length == 7) {
						if (uri[6].toLowerCase().equals("backward")) {
							where.append(" AND Transaction='Backward'");
						} else if(uri[6].toLowerCase().equals("forward")) {
							where.append(" AND Transaction='Forward'");
						} else {
							ok = false;
							errorMsg = "incorrect request";
						}
					}
					System.out.println(where.toString());
						
				} else {
					ok = false;
					errorMsg = "incorrect request";
				}
		

		
				if (ok) {				
						
					String dataType = uri[3].toLowerCase();
					
					if (dataType.equals("interactions")) {
					
						table.run("SELECT * FROM " +  FusionApi.DOWNLOAD + where.toString());
						
						for (Iterator<String[]> rows = table.getRowsIterator(); rows.hasNext(); ) { 
							
							String[] rowValues = rows.next();
							
							entry.addProperty("video_id", rowValues[1]);
							entry.addProperty("interaction_id", rowValues[0]);
							entry.addProperty("interaction", rowValues[6]);
							entry.addProperty("tester_id", rowValues[2]);
							entry.addProperty("interaction_time", rowValues[3]);
							entry.addProperty("video_time", rowValues[4]);
							entry.addProperty("skip_time", rowValues[5]);
							
							jarr.add(entry);
							
							entry = new JsonObject();
						}
					} else if (dataType.equals("timeseries")) {
						
						table.run("SELECT Time, SkipTime FROM " +  FusionApi.DOWNLOAD + where + " ORDER BY Time");
						
						List<Integer> ts = timeseries(table, uri[6].toLowerCase());
						
						for(int i=0; i < ts.size(); i++) {
							
							entry.addProperty("video_time", i);
							entry.addProperty("count", ts.get(i));				
							
							jarr.add(entry);
							
							entry = new JsonObject();
						}
					}
						
				} else {
					entry.addProperty("status", "error");				
					entry.addProperty("message", errorMsg);				
					jarr.add(entry);
				}
			} else {
				entry.addProperty("status", "error");				
				entry.addProperty("message", "no permissions");				
				jarr.add(entry);
			}
		} catch (Exception e) {
			entry.addProperty("status", "error");
		}
		
		out.print(gson.toJson(jarr));
	}
	
	
	private List<Integer> timeseries(FusionApi data, String type) {
		int begin, end;
		
		List<Integer> bts = new ArrayList<Integer>();
		
		for (Iterator<String[]> rows = data.getRowsIterator(); rows.hasNext(); ) { 
			String[] rowValues = rows.next();
			
			if(type.equals("backward")) {
				begin = Integer.parseInt(rowValues[0]);
				end = Integer.parseInt(rowValues[0]) + Integer.parseInt(rowValues[1]);
			} else {
				begin = Integer.parseInt(rowValues[0]) - Integer.parseInt(rowValues[1]);
				end = Integer.parseInt(rowValues[0]);
			}
			
			for (int r = bts.size(); r <= end; r++) // Add timeline rows if they do not exist
				bts.add(r, 0);;
			for (int j = begin; j <= end; j++) // For all timeline values in range add this value
				bts.set(j, bts.get(j) + 1);
		}
		
		return bts;
	}
	
}

