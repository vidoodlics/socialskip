/**
 * 
 * @author Kostas Pardalis
 */

package socialskip;

import net.tanesha.recaptcha.ReCaptchaImpl;
import net.tanesha.recaptcha.ReCaptchaResponse;


public class CheckCaptcha {

	/* This method checks if captcha is valid */
	public static boolean isValidCaptcha(String remoteAddr, String challenge, String uresponse) {
		
        String privateKey = "6Lf_qfMSAAAAAItUhNBMZZO7M54Ao9YPNXGCHfIN";
		
        ReCaptchaImpl reCaptcha = new ReCaptchaImpl();
        reCaptcha.setPrivateKey(privateKey);
  
        ReCaptchaResponse reCaptchaResponse = reCaptcha.checkAnswer(remoteAddr, challenge, uresponse);

		return reCaptchaResponse.isValid(); // return true or false
	}
	
}