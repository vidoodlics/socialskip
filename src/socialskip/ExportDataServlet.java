package socialskip;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.util.Iterator;

import socialskip.ResearcherVideosServlet;

public class ExportDataServlet extends HttpServlet {
	private static final long serialVersionUID = -296698971282506430L;
	
	/* This method receives a HTTP GET request and responds a CSV file with interactions */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		PrintWriter out = resp.getWriter();
        
        
		String videoid = req.getParameter("videoid");
		String videoname = "video";
		videoname = req.getParameter("video");
		
		//check if the user provided a 'videoid' parameter
		if(videoid == null) {
			resp.setStatus(400); //Bad request
			out.println("You must specify a video id!");
			return;
		}		
		
		resp.setContentType("text/plain");
		resp.setHeader("Content-Disposition", "attachment;filename=\""+videoname+"-data.csv\"");

		try{
			if (ResearcherVideosServlet.isVideoResearcher(videoid)) {
				FusionApi table=new FusionApi();
				table.run("SELECT TesterId, Time, TransactionId, TransactionTime, Transaction, SkipTime FROM " +  FusionApi.DOWNLOAD + " WHERE VideoId='" + req.getParameter("videoid") + "'");
				
				out.println("TesterId,Time,TransactionId,TransactionTime,Transaction, SkipTime");
				
				// for all rows
				for (Iterator<String[]> rows = table.getRowsIterator(); rows.hasNext(); ) { 
					String[] rowValues = rows.next();
					
					out.print(rowValues[0] + ",");
					out.print(rowValues[1] + ",");
					out.print(rowValues[2] + ",");
					out.print(rowValues[3] + ",");
					out.print(rowValues[4] + ",");
					out.println(rowValues[5]);
				}
			} else {
				resp.sendRedirect("/error.jsp?reason=nopermission");
			}
		} catch (IndexOutOfBoundsException e) {
    		resp.sendRedirect("/error.jsp?reason=nopermission");
    	} catch (Exception e) {
    		resp.sendRedirect("/error.jsp");
    	}
	}

}

