SocialSkip
==========

http://www.socialskip.org/

### Introduction

SocialSkip can be employed in real or experimental scenarios to generate user activity graphs of an online video, by analyzing users’ interactions with the system, such as play, pause, skip/scrub. The SocialSkip system employs a custom web-video player and a web-database to keep a record of basic user actions (play, pause, and skip).

SocialSkip is also integrated with Google Drive, which allows the addition of a questionnaire next to the video. This feature has been useful in video experiments for learning, which include quiz questions next to the video.

The main feature of SocialSkip is a video browser with custom player buttons that collects user interactions with the video to a data-base.


This web app integrates the following technologies and tools:

* Google App Engine
* AppEngine Java SDK
* Java Servlets and Java Server Pages
* JQuery
* JQuery Mobile
* HTML5 Canvas
* Youtube IFrame player API
* Google Charts
* Google Fusion Tables
* Datastore API




### Requirements

* Java JDK 1.7 - [Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html) and [Install](http://docs.oracle.com/javase/7/docs/webnotes/install/index.html)
* Eclipse IDE for Java EE Developers - [Download](http://www.eclipse.org/downloads/)
* Google Plugin for Eclipse - [Install](https://developers.google.com/eclipse/docs/download)
* EGit - [Install](http://www.eclipse.org/egit/download/)
* Google account - Don't have? [Create](https://accounts.google.com/)

### Configuration of the Eclipse

Go to Eclipse folder and edit the eclipse.ini file. 
Change the following lines with your path of JDK 1.7 and put this lines
```
-vm
C:\Program Files\Java\jdk1.7.x_xx\bin\javaw.exe
```
before `-vmargs` line.



### Importing Source into Eclipse

Open *Eclipse* and click on *File* --> *Import* -> *Git* > *Projects from Git*. Select *Clone URI* and click *Next*. In the *URI* field type the *URI* and click *Next* in the next windows and the last window click on *Finish*.

From menu select *Project* -> *Properties* -> *Java Built Path*, open the *Libraries* tab and you should see the following items.
```
> gdata-core-1.0.jar - socialskip/war/WEB-INF/lib
> gson-2.2.4.jar - socialskip/war/WEB-INF/lib
> opencsv-2.3.jar - socialskip/war/WEB-INF/lib
> recaptcha4j-0.0.7.jar - socialskip/war/WEB-INF/lib
> App Engine SDK[App Engine – 1.x.x]
> GWT SDK[GWT – 2.x.x]
> JRE System Library[jdk1.7.x…]
```
If in the brackets of *JRE System Library[…]* is not *jdk1.7.xx*, remove this item and add a JDK 1.7 library.
To do this, click on *Add Library* button, select *JRE System Library* and in the following screen select *jdk1.7.x*. If *jdk1.7.xx* is not your default JRE or not in the *Alternate JRE* list, then click on *Installed JREs*. In the window opened, click *Add*, select *Standard VM* and in *JRE home* type your JDK path, e.g *C:\Program Files\Java\jdk1.7.x_xx*.


### Creating Fusion Tables

To create fusion tables, visit http://tables.googlelabs.com and sign in using your Google account.
Click on *Create a Fusion Table* and in the new window click on *Create empty table*. The creation is very simple. You can add or modify columns by clicking *Edit* -> *Add column* or *Edit* -> *Change columns*, respectively. 

You must be create the following tables.

**Researchers**

|Column Name|	Type	|
|-----------|-----------|
|	Mail	|	Text	|
|	Name	|   Text	|

**Transactions**

|Column Name|	Type	|
|-----------|-----------|
|	Id		|	Number	|
|Transaction|   Text	|

Add the following rows in the Transactions table.

|Id|	Transaction	|
|-----------|-----------|
|	1		|	Backward	|
|2|   Forward	|
|3|   Play	|
|4|   Pause	|

**Experiments**

|Column Name	|	Type	|
|---------------|-----------|
|ResearcherId	|	Number	|
|Title			|   Text	|
|VideoURL		|   Text	|
|Questionnaire	|   Text	|
|Info			|   Text	|
|Controls		|   Number	|
|TimeRange		|   Number	|
|IconColor		|   Text	|
|PgsColor		|   Text	|
|BgColor		|   Text	|

**Interactions**

|Column Name	|	Type	|
|---------------|-----------|
|VideoId		|	Number	|
|TesterId		|   Text	|
|TransactionId	|   Number	|
|TransactionTime| Date/Time	|
|Time			|   Number	|
|SkipTime		|   Number	|

**Access Tokens**

|Column Name	|	Type	|
|---------------|-----------|
|ResearcherId	|	Number	|
|AccessToken	|   Text	|


The next table is a join table that represents a many-to-one relationship between *Interactions* and *Transactions* tables.
Go to *Interactions* table  and select *File* -> *Merge*, in the next tab select the *Transactions* table.
In the *This table* drop down list select *TransactionId* and select *Id* of the *Transactions* list and click *Next*.
In the new tab, select all and click on *Merge*.


Copy the Ids from *Researchers*, *Interactions*, *Experiments*, *Merge of Interactions and Transactions* and *Access Tokens* tables and put them in the *src/FusionApi.java* file. To copy the IDs, open the table and select *File* -> *About this table*. See the comments in the file and the code below.

```
public static final String RESEARCHERS = "**********";  // Researchers table ID
public static final String EXPERIMENTS = "**********";  // Experiments table ID
public static final String INTERACTIONS = "**********"; // Interactions table ID
public static final String DOWNLOAD = "**********";  // Merge of Interactions and Transactions
public static final String ACCESS_TOKENS = "**********";    // Access Tokens
```

A few lines below in the same file, enter your gmail and your password.
```
private static final String email = "**************@gmail.com"; // Enter your gmail
private static final String password = "**********"; // Enter password from your gmail
```


### Create a Google API key

Go to https://code.google.com/apis/console. Click on *Create project* and in the page that was opened click *Enable an API*. In the next page, change the *Fusion Tables API* to *ON*. In the sequel click on *Credentials* and in *Public API access* click *Create new key* -> *Server key* -> *Create* and then copy the *API key* and paste it in the *src/FusionApi.java* file.
```
public static final String APIkey = "********************"; // API key
```


### Setting up reCAPTCHA

Visit [https://www.google.com/recaptcha](https://www.google.com/recaptcha). Click on *Get reCaptcha*, then *Sign up Now*. Type your domain in *Domain* and click *Create*. Go to *My account* and open your site.

Copy the *Private key* and paste it in the src/socialskip/CheckCaptcha.java file.
```
String privateKey = "************************";
```
Copy the *Public Key* and paste in file war/home.jsp
```
........
<script type="text/javascript"
  src="http://www.google.com/recaptcha/api/challenge?k=***************************">
</script>
<noscript>
  <iframe src="http://www.google.com/recaptcha/api/noscript?***************************"
  .......
</noscript>
.......
```


### Creating App Engine Application

Go to https://appengine.google.com, sign in with your google account and create an application. If this is your first time creating applications on App Engine, you may be asked to verify your account. When complete account verification, click *Create Application* and enter the address you want in *Application Identifier* and optionally enter *Application Title* and click on *Create Application* button.

Enter your Application Identifier in the following files.

* war/WEB-INF/appengine-web.xml
```
<?xml version="1.0" encoding="utf-8"?>
  <appengine-web-app xmlns="http://appengine.google.com/ns/1.0">
  <application> Application_Identifier </application>
  <version>1</version>
  ......
  </appengine-web-app>
```
* war/code/socialskip.js
```
var url = "http://Application_Identifier.appspot.com/researcher_videos?callback=?";
var purl = "http://Application_Identifier.appspot.com/interactions";
```


### Deploy to Google App Engine

From the toolbar in Eclipse IDE click on *Google icon* -> *Deploy to App Engine* -> *Deploy*.

![Deploy](http://i58.tinypic.com/vqqpgj.jpg)
