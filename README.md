<!-- TABLE OF CONTENTS -->
## Table Of Contents
<ol>
  <li>
    Introduction
  </li>
  <li>
    Bidding Dashboard Package
  </li>
  <li>
     Data Structures
  </li>
   <li>
     Bid Microservice Summary
  </li>
  <li>
     Bid Microservice
  </li>
  <li>
     Architecture Diagram
  </li>
  <li>
    Containerizing the service
  </li>
</ol>



<!-- INTRODUCTION -->
## 1 Introduction
Hi, I am Yap Zhao Yi, the developer of this repository, the codes provided are intended for Ngee Ann Polytechnic's Emerging IT Trends module, october semester 2021. This code covers the bidding dashboard package for the EduFI app. Additionally, as per the content page, explanation will be given for the design considerations, architecture diagram and the functionality for microservices discussed. 

<!-- Bidding Dashboard Package -->
## 2 Bidding Dashboard Package
As stated in the assignment specification, a semester spans from Monday to Friday and students are able to bid on a class they want to take for the next semester on Saturday. The results of the bidding are then released on Sunday for viewing.

Students can also able to bid using ETI Tokens, are able to view anonymized bids for all classes listed on Saturday before viewing the unanonymized version on Sunday. 

To further improve the user experience, users can view past bids through the semester start date. 

<!-- Structures -->
## 3 Data Structures
These struct declarations are critical in understanding how the data is laid out, do note that StudentID and ClassID are not defined as foreign keys in the database but are rather used as identifiers. Hence, there is no relations between the entities. <br/> <br/>


| Field Name | Type | Description  |
| :--------: | :---: | :----------: |
| BidID | Integer | Auto-Incremented Unique ID which identifies the bid |
| SemesterStartDate | String | Date written as "dd-mm-yyyy" which identifies the semester referenced |
| ClassID | Integer | Unique ID which identifies the class this bid is for |
| StudentID | String | Unique ID which identifies the student this bid is made by |
| StudentName | String | The name of the student this bid is made by |
| TokenAmount | Integer | The amount of tokens the bid is |
| Status | Integer | The bid status of "Pending", "Success" or "Failed" |

Json Version
```javascript
{
  bidid: 1 
  semesterstartdate: "02-04-2022"
  classid: 1
  studentid: "S10145383"
  studentname: "Student Name"
  tokenamount: 23
  status: "Pending"
}
```

<!-- Bid Microservice Summary -->
## 4 Bid Microservice Summary

Base URL: http://10.31.11.12:9221 <br/> <br/>

| No | URL | Method | Description  |
| :---: | :---: | :----: | :----------: |
| 1 | /api/v1/bids | POST | Create new bid, bid ID need not be supplied
| 2 | /api/v1/bids/{bidID} | GET | Get a bid by its bid ID
| 3 | /api/v1/bids/{bidID} | PUT | Update a bid by its bid ID, supplying a json object in accordance to struct
| 4 | /api/v1/bids/{bidID} | DELETE | Delete a bid by its bid ID
| 5 | /api/v1/bids?studentID={studentID}&semesterStartDate= {semesterStartDate} | GET | Get all bids made by a student for a particular semester 
| 6 | /api/v1/bids?studentID={studentID}&semesterStartDate= {semesterStartDate}&classID={classID} | GET | Get a bid made by a student for a class in a particular semester
| 7 | /api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate} | GET | Get all bids made for a class in a particular semester
| 8 | /api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate}&paxNo={paxNo} | GET | Get the top bids made for a class in a particular semester
| 9 | /api/v1/bids?studentID={studentID}&semesterStartDate={semesterStartDate}&status={status} | GET | Get all bids made by a student for a particular semester with a certain status
| 10 | /api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate}&status={status} | GET | Get all anonymized bids for a class in a particular semester with a certain status
| 11 | /api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate}&anonymousKey=gq123jad9dq | GET | Get all unanonymized bids for a class in a particular semester with a certain status
| 12 | /api/v1/bids?semesterStartDate={semesterStartDate}&status={status} | GET | Get all bids in a particular semester with a certain status

All the above APIs will require the usage of an authentication key through a query string:
?key = "2c78afaf-97da-4816-bbee-9ad239abb298"

<!-- Bid Microservice -->
## 5 Bid Microservice

### 5.1 POST: /api/v1/bids 
Create new bid, bid ID need not be supplied <br />
<br />

**Request Body:** 
<br/>
A bid in json format <br/>
<br/>

**Response:** <br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 201 | Bid created for: Class (classID) at (tokenAmount) Tokens | Successful creation of bid |

No Json response. <br/>

<br/>

**Error Responses:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 422 | Please supply bid information in JSON format | Bid information is not supplied into the request's body in a json format |
| 422 | Please supply all neccessary bid information | Some of the attributes required may be null | 
| 422 | Invalid status provided | Status is not of "Pending", "Success" or "Failed" |

<br/>

### 5.2 GET: /api/v1/bids/{bidID}
Get a bid by its bid ID <br />
<br />

**Request Body:** 
<br/>
No input required <br/>
<br/>

**Response:** <br/>
No HTTP status response. <br/>
Returns a single bid in json format.<br/>
<br/>

**Error Responses:** <br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Bid does not exist | Bid referenced by Bid ID does not exist

<br/>

### 5.3 PUT: /api/v1/bids/{bidID}
Update a bid by its bid ID, supplying a json object in accordance to struct <br />
<br/>

**Request Body:** 
<br/>
A bid in json format <br/>
<br/>

**Response:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 202 | Bid details updated | Successful update of bid |

No Json response. <br/>

<br/>

**Error Responses:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Bid does not exist | Bid referenced by Bid ID does not exist
| 422 | Please supply bid information in JSON format | Bid information is not supplied into the request's body in a json format |
| 422 | Please supply all neccessary bid information | Some of the attributes required may be null | 
| 422 | Invalid status provided | Status is not of "Pending", "Success" or "Failed" |

<br/>

### 5.4 DELETE: /api/v1/bids/{bidID}
Delete a bid by its bid ID <br />
<br/>

**Request Body:**
<br/>
A bid in json format <br/>
<br/>

**Response:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 202 | Bid deleted: (bidID) | Successful update of bid |

No Json response. <br/>

<br/>

**Error Responses:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Bid does not exist | Bid referenced by Bid ID does not exist

<br/>

### 5.5 GET: /api/v1/bids?studentID={studentID}&semesterStartDate= {semesterStartDate}
Get all bids made by a student for a particular semester <br />
<br />

**Request Body:** 
<br/>
No input required <br/>
<br/>

**Response:** 
<br/>
No HTTP status response. <br/>
Returns a list of bids in json format. <br/>
<br/>

**Error Responses:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made by student that semester | No results found

<br/>

### 5.6 GET: /api/v1/bids?studentID={studentID}&semesterStartDate= {semesterStartDate}&classID={classID} 
Get a bid made by a student for a class in a particular semester <br />
<br />

**Request Body:**
<br/>
No input required <br/>
<br/>

**Response:** 
<br/>
No HTTP status response. <br/>
Returns a bid in json format. <br/>
<br/>

**Error Responses:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made that semester with the following status: (status) | No results found

<br/>

### 5.7 GET: /api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate}
Get all bids made for a class in a particular semester <br />
<br />

**Request Body:** 
<br/>
No input required <br/>
<br/>

**Response:** 
<br/>
No HTTP status response. <br/>
Returns a list of bids in json format. <br/>
<br/>

**Error Responses:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made for class that semester | No results found

<br/>

### 5.8 GET: /api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate}&paxNo={paxNo} <br />
Get the top bids made for a class in a particular semester <br />
<br />

**Request Body:**
<br/>
No input required <br/>
<br/>

**Response:** 
<br/>
No HTTP status response. <br/>
Returns a list of bids in json format. <br/>
<br/>

**Error Responses:**
 <br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made for class that semester | No results found

<br/>

### 5.9 GET:/api/v1/bids?studentID={studentID}&semesterStartDate={semesterStartDate}&status={status}
Get all bids made by a student for a particular semester with a certain status <br />
<br />

**Request Body:** 
<br/>
No input required <br/>
<br/>

**Response:** 
<br/>
No HTTP status response. <br/>
Returns a list of bids in json format. <br/>
<br/>

**Error Responses:** 
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made by student that semester with the following status: (status) | No results found

<br/>

### 5.10 GET:/api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate}&status={status}
<br />
  Get all anonymized bids for a class in a particular semester with a certain status <br />
<br />

**Request Body:** 
<br/>
No input required
<br/>

**Response:**
 <br/>
No HTTP status response. <br/>
Returns a list of bids in json format.<br/>
<br/>

**Error Responses:** <br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made for class that semester with the following status: (status) | No results found
<br/>

### 5.11 GET:/api/v1/bids?classID={classID}&semesterStartDate={semesterStartDate}&anonymousKey=gq123jad9dq
<br />
Get all unanonymized bids for a class in a particular semester with a certain status <br />
<br />

**Request Body:**
<br/>
No input required
<br/>

**Response:**
<br/>
No HTTP status response. <br/>
Returns a list of bids in json format. <br/>
<br/>

**Error Responses:**
 <br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made for class that semester with the following status: (status) | No results found

<br/>

### 5.12 GET:/api/v1/bids?semesterStartDate={semesterStartDate}&status={status}
<br />
Get all bids in a particular semester with a certain status <br />
<br />

**Request Body:**
<br/>
No input required
<br/>

**Response:**
<br/>
No HTTP status response. <br/>
Returns a list of bids in json format. <br/>
<br/>

**Error Responses:**
<br/>

| Code | Message | Reason |
| :---: | :---: | :---: |
| 401 | Invalid key | Key was not included in query string |
| 404 | Required parameters not found | All combinations of query string for that particular url does not match the query string passed in
| 404 | No bids made that semester with the following status: (status) | No results found

<br/>

 <!-- ARCHITECTURE DIAGRAM -->
## 6 Architecture Diagram
<br />
<div align="center">
  <a href="https://github.com/ToxicOptimism-ZY/ETI-Asg1">
    <img src="architecture.png" alt="Logo" width="755" height="427">
  </a>
</div>
<br/>
As seen here, the bid microservice will communicate with the token and transaction micro services when creating and updating bids. 

The database is de-normalized where the student name is also stored, due to the fact that the student's name is unlikely to change at all. This student name however is important when showing the results every sunday through un-anonymized bids. However, in the event that it does change, a go routine pulling service is conducted to retrieve updated names every end of semester.

