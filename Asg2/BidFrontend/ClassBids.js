//==================== Structures & Variables ====================
//const classURL = "http://localhost:9101/api/v1/class"
//const bidURL = "http://localhost:9221/api/v1/bids"
const classURL = "http://10.31.11.12:9101/api/v1/class"
const bidURL = "http://10.31.11.12:9221/api/v1/bids"
const key = "2c78afaf-97da-4816-bbee-9ad239abb298"

//==================== Auxiliary Functions ====================

// Compute the current semester's start date. Saturdays and Sundays will use the next semester's start date.
function getSemesterStartDate() {
    date = new Date();
    if (date.getDay() <= 5) {
        amount = date.getDay() - 1
        date.setDate(date.getDate() - amount)
    }
    else if (date.getDay() >= 6) {
        amount = 8 - date.getDay()
        date.setDate(date.getDate() + amount)
    }

    return [`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`, date]
}

// Return a formatted string
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

//==================== API Callers ====================

//==================== Class API Callers ====================

// Get a class by its class ID
async function GetAClass(classID){ //async

    /*
    // Sample data
    aClass = 

    {
    
        "classid": 3,

        "modulecode": "ASG",

        "classdate": "12-2-2022",

        "classstart": "0800",

        "classend": "1000",

        "classcap": 5,

        "tutorname": "Zhao Yi",

        "tutorid": 420,

        "rating": 3.2,

        "classinfo": "Is this the real class? Or is it just fantasy?"

    }

    errMsg = ""
    */

    url = classURL + "/" + classID;
    await $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            aClass = JSON.parse(response);
            errMsg = ""
        },
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
                aClass = null;
            },
            404: function(response) {
                errMsg = response.responseText
                aClass = null;
            },
        }
    });
    return [errMsg, aClass]
}

//==================== Bidding API Callers ====================

// Create new bid record via json string
async function CreateBidRecord(jsonString){
    url = bidURL + "?key=" + key;
    await $.ajax({
        type: "POST",
        url: url,
        data: jsonString,
        contentType: "application/json",
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
            },
            402: function(response) {
                errMsg = response.responseText
            },
            422: function(response) {
                errMsg = response.responseText
            },
            201: function(response) {  
                errMsg = response.responseText
            },
        }
    });
    return errMsg
}

// Get a bid record by its bid ID
// Note, mostly used here to retrieve all data before updating
async function GetBidRecordByBidID(bidID){
    url = bidURL + "/" + bidID + "?key=" + key;
    await $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            errMsg = ""
            bid = JSON.parse(response);
        },
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
                bid = null;
            },
            404: function(response) {
                errMsg = response.responseText
                bid = null;
            },
        }
    });
    return [errMsg,bid]
}

// Update a bid record by its bidID via json string
async function UpdateBidRecord(bidID, jsonString){
    url = bidURL + "/" + bidID + "?key=" + key;
    await $.ajax({
        type: "PUT",
        url: url,
        data: jsonString,
        contentType: "application/json",
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
            },
            402: function(response) {
                errMsg = response.responseText
            },
            404: function(response) {
                errMsg = response.responseText
            },
            422: function(response) {
                errMsg = response.responseText
            },
            202: function(response) {
                errMsg = response.responseText
            },
        }
    });
    return errMsg
}

// Delete a bid record by its bidID
async function DeleteBidRecord(bidID){
    url = bidURL + "/" + bidID + "?key=" + key;
    await $.ajax({
        type: "DELETE",
        url: url,
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
            },
            202: function(response) {
                errMsg = response.responseText
            },
        }
    });
    return errMsg
}

// Get student's bid for a class in a particular semester
async function GetStudentBidRecordForClass(studentID, classID, semesterStartDate){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    await $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            bid = JSON.parse(response);
            errMsg = ""
        },
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
                bid = null
            },
            404: function(response) {
                errMsg = response.responseText
                bid = null
            },
        }
    });
    return [errMsg, bid]
}

// Get all of the bids for the class in a particular semester in highest to lowest bid order.
async function GetTopClassBidRecords(classID, semesterStartDate, anonKey){
    
    url = bidURL + "?key=" + key + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    
    // If attempting to get unanonymized version
    if (anonKey != null) {
        url += "&anonymousKey=" + anonKey
    }
    
    await $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            bids = JSON.parse(response);
            errMsg = ""
        },
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
                bids = null
            },
            404: function(response) {
                errMsg = response.responseText
                bids = null
            },
        }
    });
    return [errMsg, bid]
}


//==================== Templates ====================

// Used to populate the content of the html class details
sampleClassDesc = `
<div class='row'>
    <div class='col-sm-12 fontstyle' style='background-color: white;'>
        <table style='border-collapse: collapse; width:100%;'  >          
            <tr>
                <td>{0}, {1} - {2}</td>
                <td>Tutor: {3}</td>
                <td colspan="2" style="text-align:right;">
                {4} Stars
                </td>
            </tr>
            <tr>
                <td colspan="4"> {5} </td>
            </tr>
        </table>
    </div>
</div>`;

// Used to populate the content of the html your bid
sampleYourClassBid = `
<div class='row' style='padding:20px 20px 20px 20px;' >
    <div class='col-sm-12 fontstyle dataTable'>
        <table style='border-collapse: collapse; width:100%;'  >
            <tr>
                <td style='text-align:left;' colspan="2">
                    <b id ='yours'>#-</b> 
                    <b>{0}</b> 
                </td>
                <td>
                    Status: {1}
                </td>
                <td style='text-align: right;'>
                    <p id="errMsg" style="color:#FF4545"></p>
                </td>
                <td style='text-align: right;'>
                    <label style='color:black; width:40%; margin:0px 10px;'>Bid Amount:</label>
                    <input id='amountInput' bidID={3} type='number' name='bidAmount' value={2}>
                </td>
                <td style='text-align: right;'>
                    <button id='deleteAction' class='greyButton' disabled='true' onclick='deleteBid({3},{4},{5},{6},{7})'>Delete</button>
                </td>
            </td>
        </table>
    </div>
</div>`;

// Used to populate the content of the html all bids
sampleClassBid = `
<div class='row' style='padding:20px 20px 20px 20px;' >
    <div class='col-sm-12 fontstyle dataTable'>
        <table style='border-collapse: collapse; width:100%;'  >
            <tr>
                <td style='text-align:left;'>
                    <b>{0}</b> 
                    <b>{1}</b> 
                </td>
                <td>
                    Status: {2}
                </td>
                <td colspan="2" style='text-align: right;'>
                    <label style='color:black; width:40%; margin:0px 10px;'>Bid Amount: {3}</label>
                </td>
            </td>
        </table>
    </div>
</div>`;

// Used to present any error messages for the content of the html scroll list
sampleErr = `
<p class='fontstyle' style='text-align:center'>{0}</p>
<h1 class='fontstyle' style='text-align:center'>{1}</h1>
`;

// Used to populate the drop down list of semester start date history
sampleDropDown = `<option value="{0}">{0}</option>`;

//==================== JavaScript ====================

// Displays the class details
function listClassDesc(classID) {
    response = GetAClass(classID)
    errMsg = response[0]
    aClass = response[1]

    htmlString = ""

    if (errMsg == "") {

        // format string's {0} with attributes
        htmlString += sampleClassDesc.f(aClass.classdate,aClass.classstart,aClass.classend,aClass.tutorname,aClass.rating, aClass.classinfo)
    }
    else {
        htmlString += sampleErr.f("It appears an error has occured", errMsg)   
    }

    document.getElementById('classModule').innerHTML = aClass.modulecode+" - "+aClass.classid
    document.getElementById('classDesc').innerHTML = htmlString
}

// Displays your bid
function listYourBid(studentID, studentName, classID, currentSemesterStartDate, referencedSemesterStartDate) {
    
    response = GetStudentBidRecordForClass(studentID, classID, referencedSemesterStartDate)
    errMsg = response[0]
    bids = response[1]

    htmlString = ""
    current = false
    create = true

    date = new Date();

    // If the referenced semester date is during bidding day and current semester
    if (date.getDay() == 6 && currentSemesterStartDate == referencedSemesterStartDate) {
        current = true
    }

    if (errMsg == "") { // If bid exists
        if (current) { // Can alter bid, allow usage of deleting and editing token amount
            htmlString += sampleYourClassBid.f(studentName, bid.status, bid.tokenamount, bid.bidid,studentID, studentName, classID, currentSemesterStartDate)
            document.getElementById('deleteAction').classList.add('hollowedButton');
            document.getElementById('deleteAction').classList.remove('greyButton');
            document.getElementById('deleteAction').disabled='false'
            create = false
        } else {
            // Otherwise disable both
            htmlString += sampleClassBid.f(i, studentName, bid.status, bid.tokenamount)   
        }
    }
    else if (errMsg.substring(0,3) == "404") { //If bid does not exist
        if (current) { //Can alter bid, allow usage of editing token amount but not deleting
            htmlString += sampleYourClassBid.f(studentName, "Pending", 0, null)
        }
        else { // Otherwise state that no bid was made for that semester
            htmlString += sampleErr.f("","No bid was made by user that semester.")
        }
    }
    else { // Urgent error
        htmlString += sampleErr.f("It appears an error has occured",errMsg)
    }

    document.getElementById('yourBid').innerHTML = htmlString

    // Set up amount input, upon pressing enter, update
    amountInput = document.getElementById('amountInput')

    if (current && create) { // If new bid
        amountInput.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                createBid(currentSemesterStartDate, classID, studentID, studentName,amountInput.value)
            }
        });
    }
    else if (current) { // If existing bid
        amountInput.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                updateBid(amountInput.bidID,currentSemesterStartDate, classID, studentID, studentName,amountInput.value)
            }
        });
    }
}

// List all bids for the class in a particular semester
function listBids(studentID, classID, currentSemesterStartDate, referencedSemesterStartDate) {
    date = new Date();
    current = false

    // If the referenced semester date is during bidding day and current semester
    if (date.getDay() == 6 && currentSemesterStartDate == referencedSemesterStartDate) {
        current = true
        
    }
    
    // Using the anonymous key in this instance as need to check user's id to determine ranking
    response = GetTopClassBidRecords(classID, referencedSemesterStartDate, "gq123jad9dq")
    errMsg = response[0]
    bids = response[1]

    htmlString = ""
    
    if (errMsg == "") {

        for (var i = 0; i < bids.length; i++) {
            
            studentName = bid.studentName
            if (current && bids[i].studentid != studentID) { // If bidding in progress
                studentName = "Anonymized"
            }
            htmlString += sampleClassBid.f(i, studentName, bid.status, bid.tokenamount)

            // Display the ranking in the your bids section
            if (bid.studentID == studentID) {
                document.getElementById('yours').innerText = '#' + i+1
            }
        }
    }
    else if (errMsg.substring(0,3) == "404") {
        htmlString += sampleErr.f("","No bids could be found.")
    }
    else {
        htmlString += sampleErr.f("It appears an error has occured",errMsg)   
    }

    document.getElementById('bids').innerHTML = htmlString
}

// Calls api caller to create a new bid
function createBid(currentSemesterStartDate, classID, studentID, studentName,tokenAmount) {
    const obj = {}
    
    // Create json string
    obj.semesterstartdate = currentSemesterStartDate;
    obj.classid = classID;
    obj.studentid = studentID;
    obj.studentname = studentName;
    obj.tokenAmount = tokenAmount;
    obj.status = "Pending"
    const jsonString = JSON.stringify(obj);

    // Call api caller
    errMsg = CreateBidRecord(jsonString)

    // Update current display
    listYourBid(studentID, studentName, classID, currentSemesterStartDate, currentSemesterStartDate)
    
    if (errMsg == "") { // If sufficient balance
        // Update ranking
        listBids(studentID,classID,currentSemesterStartDate,currentSemesterStartDate)
    }
    else if (errMsg.substring(0,3) == "402") { // If insufficient balance status code
        // Error message
        document.getElementById('errMsg').innerText = "Insufficient Balance"
    }
}

// Calls api caller to update an existing bid
function updateBid(bidID, currentSemesterStartDate, classID, studentID, studentName,tokenAmount) {
    
    // Retrieve all untouched information
    response = GetBidRecordByBidID(bidID)
    errMsg = response[0]
    bid = response[1]

    // Edit altered information
    bid.tokenamount = tokenAmount

    // Create json string
    const jsonString = JSON.stringify(bid);

    // Call api caller
    errMsg = UpdateBidRecord(bidID, jsonString)

    // Update current display
    listYourBid(studentID, studentName, classID, currentSemesterStartDate, currentSemesterStartDate)
    
    if (errMsg == "") { // If sufficient balance
        // Update ranking
        listBids(studentID,classID,currentSemesterStartDate,currentSemesterStartDate)
    }
    else if (errMsg.substring(0,3) == "402") { // If insufficient balance
        // Error message
        document.getElementById('errMsg').innerText = "Insufficient Balance"
    }
}

// Calls api caller to delete the bid
function deleteBid(bidID, studentID, studentName, classID, currentSemesterStartDate) {

    DeleteBidRecord(bidID)

    // Update current display
    listYourBid(studentID, studentName, classID, currentSemesterStartDate, currentSemesterStartDate)
    listBids(studentID,classID,currentSemesterStartDate,currentSemesterStartDate)
}

// Populate drop down for semester start date to up to 10 semesters back
function populateDropDown(date) {
    htmlString = ""

    for (var i = 0; i < 10; i++) {
        referencedDate = date;
        referencedDate.setDate(date.getDate() - 7*i)

        formattedDate = `${referencedDate.getDate()}-${referencedDate.getMonth()+1}-${referencedDate.getFullYear()}`
        
        htmlString += sampleDropDown.f(formattedDate)
    }

    document.getElementById('semesterStartDate').innerHTML = htmlString
}

// New semester start date selected
function dropDownOnChange() {
    searchedSemesterStartDate = semesterStartDateInput.value
    sessionStorage.setItem("searchedSemesterStartDate", searchedSemesterStartDate);

    // Uses global variables to pass in, as its difficult to work a way to pass in these variables naturally
    listYourBid(studentID, studentName, classID, currentSemesterStartDate, searchedSemesterStartDate)
    listBids(studentID, classID, currentSemesterStartDate, searchedSemesterStartDate) 
}


//==================== Main ====================

// Get important data
startDateData = getSemesterStartDate()
currentSemesterStartDate = startDateData[0]
date = startDateData[1]

//studentID = sessionStorage.getItem("studentID") // From authentication
//studentName = sessionStorage.getItem("studentName") // From authentication

studentID = "S10196983"
studentName = "Yap Zhao Yi" 

if (sessionStorage.getItem("searchedSemesterStartDate") != null) {
    searchedSemesterStartDate = sessionStorage.getItem("searchedSemesterStartDate")
} else {
    searchedSemesterStartDate = currentSemesterStartDate
}

if (studentID != null) {
    // From choosing view detail button
    classID = sessionStorage.getItem("openBidsForClassID")

    if (classID != null) {
        // Populate neccessary html
        listClassDesc(classID)
        listYourBid(studentID, studentName, classID, currentSemesterStartDate, searchedSemesterStartDate)
        listBids(studentID, classID, currentSemesterStartDate, searchedSemesterStartDate) 
    } else {
        document.getElementById('scrollList').innerHTML = sampleErr.f("It appears an error has occured","No class was selected") 
    }
} else {
    document.getElementById('scrollList').innerHTML = sampleErr.f("It appears an error has occured","User not authenticated")
}

populateDropDown(date)