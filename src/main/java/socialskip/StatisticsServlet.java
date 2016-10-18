package socialskip;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.google.gson.Gson;
import com.google.gson.JsonObject;


public class StatisticsServlet extends HttpServlet {
	
	private static final long serialVersionUID = 7862415130921685895L;

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		PrintWriter out = resp.getWriter();
		Gson gson = new Gson(); // JSON conversion
		
		JsonObject result = new JsonObject();
		result.addProperty("status", "success");
		
		try{
			FusionApi table=new FusionApi();
			table.run("SELECT COUNT(ROWID) FROM " +  FusionApi.DOWNLOAD);
			result.addProperty("interactions", table.getFirstRow()[0]);
			
			table.run("SELECT COUNT(ROWID) FROM " +  FusionApi.EXPERIMENTS);
			result.addProperty("videos",  table.getFirstRow()[0]);
			
			table.run("SELECT COUNT(ROWID) FROM " +  FusionApi.DOWNLOAD + " GROUP BY TesterId");
			result.addProperty("testers", table.rowCount());
			
		} catch (IndexOutOfBoundsException e) {
			result.remove("status");
			result.addProperty("status", "error");
    	} catch (Exception e) {
			result.remove("status");
			result.addProperty("status", "error");
    	}
		
		out.print(gson.toJson(result));
	}

}

