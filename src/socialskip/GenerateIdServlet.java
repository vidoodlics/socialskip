package socialskip;

import java.io.IOException;


import java.io.PrintWriter;

import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class GenerateIdServlet extends HttpServlet {

	private static final long serialVersionUID = 161545915267243227L;
	private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

	/* This method increases by one the testerId */
	public void updateId() {
		Key key = KeyFactory.createKey("Cookies", "TesterId");
		Entity id;
		try {
			id = datastore.get(key);
			int tid = Integer.parseInt((String) id.getProperty("testerId"));
			tid += 1;
			Entity entry = new Entity("Cookies", "TesterId");
			entry.setProperty("testerId", Integer.toString(tid));
			datastore.put(entry);
		} catch (EntityNotFoundException e) {
			Entity entry = new Entity("Cookies", "TesterId");
			entry.setProperty("testerId", "1001");
			datastore.put(entry);
		} 
	}

	
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, ServletException {
		PrintWriter out = resp.getWriter();
		Transaction trx = datastore.beginTransaction();
		
		updateId();
		Key key = KeyFactory.createKey("Cookies", "TesterId");
		Entity id;
		try {
			id = datastore.get(key);
			out.print(id.getProperty("testerId"));
		} catch (EntityNotFoundException e) {
			out.print("1000");
		}

		trx.commit();

	}
 
	
}


