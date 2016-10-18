SocialSkip
==========

http://www.socialskip.org/

### Introduction

SocialSkip can be employed in real or experimental scenarios to generate user activity graphs of an online video, by analyzing users’ interactions with the system, such as play, pause, skip/scrub. The SocialSkip system employs a custom web-video player and a web-database to keep a record of basic user actions (play, pause, and skip).

SocialSkip is also integrated with Google Drive, which allows the addition of a questionnaire next to the video. This feature has been useful in video experiments for learning, which include quiz questions next to the video.

The main feature of SocialSkip is a video browser with custom player buttons that collects user interactions with the video to a database.


This web app integrates the following technologies and tools:

* Google App Engine
* Apache Maven
* AppEngine Java SDK
* Java Servlets and Java Server Pages
* HTML5
* CSS3
* JavaScript
* JQuery
* JQuery Mobile
* Youtube IFrame Player API
* Google Charts
* Google Fusion Tables
* Datastore API

The instructions below provide step-by-step guidance to build your own copy of this web application.

### Requirements

* Java JDK 1.7 - [Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html) and [Install](http://docs.oracle.com/javase/7/docs/webnotes/install/index.html)
* Apache Maven - [Download](http://maven.apache.org/download.cgi) and [Install](http://maven.apache.org/install.html)
* Google account - Don't you have? [Create](https://accounts.google.com/)

### Creating Google App Engine Project

Google App Engine is a platform as a service (PaaS) cloud computing platform for developing and hosting web applications in Google-managed data centers.

In order to run and test this application either locally or online, you must create a new project on Google App Engine. The following steps provide instructions for the creation of a new project, the activation of appropriate Google APIs and the configuration of credentials.

1. Go to the [Google AppEngine](https://console.cloud.google.com/appengine).
2. Click on `Create a project` and create a new project.
3. Click on `Menu button` on the left side of screen and select `API Manager`.
4. Search for the `Fusion Tables API` and enable it.
3. Click on `Credentials` of the API Manager side menu.
4. Click on `Create Credentials` -> `Service account key`.
5. Create a new service account, select `P12` key type and click on `Create` to download it.
6. Rename the downloaded P12 key file to `key.p12` and put it in `/src/main/resources` folder.
7. Keep the `Service account ID`, it will be used below.

Lastly, enter your *Project ID* in the *pom.xml* file.

* pom.xml
```
...
<properties>
    <app.id> Project ID </app.id>
    <app.version>1</app.version>
    <appengine.version>1.9.42</appengine.version>
    ...
...
```


### Creating Fusion Tables

Fusion Tables is a web service provided by Google for data management. Fusion tables can be used for gathering, visualising and sharing data tables. Fusion tables provides an API for managing tables and table data.

Fusion Tables is used by SocialSkip system as a web database for storing users' data such as video interactions.

To create Fusion Tables, visit http://tables.googlelabs.com and sign in using your Google account.
Click on `Create a Fusion Table` and in the new window click on `Create empty table`. The creation is very simple. You can add or modify columns by clicking `Edit` -> `Add column` or `Edit` -> `Change columns`, respectively.

You must create the following tables.

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
|1			|	Backward|
|2			|   Forward	|
|3			|   Play	|
|4			|   Pause	|

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
Go to *Interactions* table  and select `File` -> `Merge`, in the next tab select the *Transactions* table.
In the `This table` drop down list select `TransactionId` and select `Id` of the `Transactions` list and click `Next`.
In the new tab, select all and click on *Merge*.

In each table, click on `File` -> `Share` and add a user with email the `Service account ID`.

Create a new XML file with name *config.xml* inside the `/src/main/resources` folder.

Copy the Ids from *Researchers*, *Interactions*, *Experiments*, *Merge of Interactions and Transactions* and *Access Tokens* tables and used them to create the *config.xml* file as shown below. To copy the IDs, open the table and select `File` -> `About this table`.

* config.xml
```
<?xml version="1.0" encoding="UTF-8"?>
<config>
    <fusion_tables>
        <researchers> Researchers table ID </researchers>
        <experiments> Experiments table ID </experiments>
        <interactions> Interactions table ID </interactions>
        <access_tokens> Access Tokens table ID </access_tokens>
        <merge_interactions_transactions> Merge of Interactions and Transactions ID </merge_interactions_transactions>
    </fusion_tables>

    <service_account_email> Service account ID </service_account_email>
</config>
```

### Testing

You can run and test the application locally using the following Maven command:

```
mvn appengine:devserver
```

### Deploy to Google App Engine

You can deploy this application using the following Maven command:

```
mvn appengine:update
```
