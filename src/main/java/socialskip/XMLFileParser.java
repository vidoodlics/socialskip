package socialskip;

import java.io.File;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;

public class XMLFileParser {
	public String RESEARCHERS;
	public String EXPERIMENTS;
	public String INTERACTIONS;
	public String MERGE_INTERACTIONS_TRANSACTIONS;
	public String ACCESS_TOKENS;
	public String SERVICE_ACCOUNT_EMAIL;

	public XMLFileParser(String filepath) {
		try {
			File fXmlFile = new File(this.getClass().getResource(filepath).toURI());

			DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
			Document doc = dBuilder.parse(fXmlFile);

			RESEARCHERS =  doc.getElementsByTagName("researchers").item(0).getTextContent();
			EXPERIMENTS =  doc.getElementsByTagName("experiments").item(0).getTextContent();
			INTERACTIONS =  doc.getElementsByTagName("interactions").item(0).getTextContent();
			MERGE_INTERACTIONS_TRANSACTIONS =  doc.getElementsByTagName("merge_interactions_transactions").item(0).getTextContent();
			ACCESS_TOKENS =  doc.getElementsByTagName("access_tokens").item(0).getTextContent();

			SERVICE_ACCOUNT_EMAIL = doc.getElementsByTagName("service_account_email").item(0).getTextContent();
	    } catch (Exception e) {
	    	e.printStackTrace();
	    }
	}
}
