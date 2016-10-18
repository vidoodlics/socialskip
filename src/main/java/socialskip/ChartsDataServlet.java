package socialskip;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;


public class ChartsDataServlet extends HttpServlet {

	private static final long serialVersionUID = 7862415130921685895L;

	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		resp.setContentType("application/json");

		PrintWriter out = resp.getWriter();

		Gson gson = new Gson();

		JsonObject entry = new JsonObject();
		JsonArray jarr = new JsonArray();

		String expid = req.getParameter("expid");
		String transid = req.getParameter("transid");

		try {
			FusionApi table = new FusionApi();

			if(ResearcherVideosServlet.isVideoResearcher(expid)) {

				table.run("SELECT Time, SkipTime, Count() FROM " +  FusionApi.DOWNLOAD + " WHERE VideoId='" + expid +"' AND TransactionId='" + transid + "' GROUP BY Time, SkipTime ORDER BY Time");

				for (Iterator<String[]> rows = table.getRowsIterator(); rows.hasNext(); ) {
					String[] rowValues = rows.next();

					entry.addProperty("t", rowValues[0]);
					entry.addProperty("s", rowValues[1]);
					entry.addProperty("c", rowValues[2]);
					jarr.add(entry);

					entry = new JsonObject();
				}

			}
		} catch (Exception e) {
			entry.addProperty("status", "error");
		}

		out.print(gson.toJson(jarr));
	}

}
