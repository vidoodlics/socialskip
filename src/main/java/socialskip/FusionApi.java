// Copyright 2012 Google Inc. All Rights Reserved.

package socialskip;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.fusiontables.Fusiontables;
import com.google.api.services.fusiontables.Fusiontables.Query.Sql;
import com.google.api.services.fusiontables.FusiontablesScopes;
import com.google.api.services.fusiontables.model.Sqlresponse;
import com.google.appengine.api.utils.SystemProperty;
import java.net.SocketTimeoutException;
import java.net.URISyntaxException;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Iterator;

import socialskip.XMLFileParser;
/**
 * Java class for communicating with the Fusion Table Service The code is based
 * on ApiExample.java from Kathryn Hurley (kbrisbin@google.com) Dependencies: -
 * GData Java Client Library - opencsv
 *
 */
public class FusionApi {

	private static final XMLFileParser config;

	static {
		XMLFileParser tmp = null;

		tmp = new XMLFileParser("/config.xml");
		config = tmp;
	}

	public static final String RESEARCHERS = config.RESEARCHERS; // Researchers table ID
	public static final String EXPERIMENTS = config.EXPERIMENTS; // Experiments table ID
	public static final String INTERACTIONS = config.INTERACTIONS; // Interactions table ID
	public static final String DOWNLOAD = config.MERGE_INTERACTIONS_TRANSACTIONS;    // Merge of Interactions and Transactions
	public static final String ACCESS_TOKENS = config.ACCESS_TOKENS;    // Access Tokens

	private HttpTransport HTTP_TRANSPORT;
	private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

	private Fusiontables fusiontables;

	private QueryResults last;

	private static GoogleCredential credential;

	public FusionApi() throws GeneralSecurityException, IOException, FileNotFoundException {

		HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
		try {
	        credential = new GoogleCredential.Builder()
				.setTransport(HTTP_TRANSPORT)
				.setJsonFactory(JSON_FACTORY)
			    .setServiceAccountId(config.SERVICE_ACCOUNT_EMAIL)
			    .setServiceAccountScopes(Collections.singleton(FusiontablesScopes.FUSIONTABLES))
				.setServiceAccountPrivateKeyFromP12File(new File(this.getClass().getResource( "/key.p12" ).toURI()))
		   .build();

	        fusiontables = new Fusiontables.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
	        	.setApplicationName(SystemProperty.applicationId.get() + "/" + SystemProperty.applicationVersion.get()).build();
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}


	/**
	 * Executes a Fusion Tables SQL query and store the results.
	 */
	public void run(String query) throws IOException, SocketTimeoutException, GeneralSecurityException {

	    Sql sql = fusiontables.query().sql(query);

	    Sqlresponse response = sql.execute();

	    last = getResults(response);

	}

	/**
	 * Returns the Fusion Tables CSV response as a {@code QueryResults} object.
	 *
	 * @return an object containing a list of column names and a list of row
	 *         values from the Fusion Tables response
	 */
	private QueryResults getResults(Sqlresponse response) throws IOException {

		List<List<Object>> rows = new ArrayList<List<Object>>();

		if (response.getRows() != null) {

			rows = response.getRows();

			Iterator<List<Object>> rowsIterator = rows.iterator();

			List<String[]> lst = new ArrayList<String[]>();

			while (rowsIterator.hasNext()) {
				List<Object> currentRow = rowsIterator.next();

				Object[] objectArray = currentRow.toArray();
				String[] stringArray = Arrays.copyOf(objectArray,
						objectArray.length, String[].class);

				lst.add(stringArray);
			}

			List<String> columns = response.getColumns();
			List<String[]> rowss = lst;
			QueryResults results = new QueryResults(columns, rowss);

			return results;
		}
		return new QueryResults(new ArrayList<String>(), new ArrayList<String[]>());

	}

	/**
	 * Print the results of the last query.
	 */
	public void print() {
		last.print();
	}

	/**
	 * Returns an Iterator over the results of the last query
	 *
	 * @return Iterator
	 */
	public Iterator<String[]> getRowsIterator() {
		return last.getRowsIterator();
	}

	/**
	 * Returns the number of rows of the last query
	 *
	 * @return Number of rows
	 */
	public int rowCount() {
		return last.rows.size();
	}

	/**
	 * Returns the first row of the last query
	 *
	 * @return First row
	 */
	public String[] getFirstRow() throws IndexOutOfBoundsException {
		return last.rows.get(0);
	}

	/**
	 * Returns an array containing the column names of the last query
	 *
	 * @return Array of strings
	 */
	public String[] getColumnNames() {
		return last.columnNames.toArray(new String[0]);
	}

	/**
	 * Result of a Fusion Table query.
	 */
	private static class QueryResults {
		final List<String> columnNames;
		final List<String[]> rows;

		public QueryResults(List<String> columnNames, List<String[]> rows) {
			this.columnNames = columnNames;
			this.rows = rows;
		}

		/**
		 * Returns an iterator over result rows
		 *
		 * @return Iterator
		 */
		public Iterator<String[]> getRowsIterator() {
			return rows.iterator();
		}

		/**
		 * Prints the results of the query.
		 *
		 */
		public void print() {
			String sep = "";
			for (int i = 0; i < columnNames.size(); i++) {
				System.out.print(sep + columnNames.get(i));
				sep = ", ";
			}
			System.out.println();

			for (int i = 0; i < rows.size(); i++) {
				String[] rowValues = rows.get(i);
				sep = "";
				for (int j = 0; j < rowValues.length; j++) {
					System.out.print(sep + rowValues[j]);
					sep = ", ";
				}
				System.out.println();
			}
		}
	}
}
