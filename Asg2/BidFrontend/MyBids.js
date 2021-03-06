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
async function GetStudentBidRecords(studentID, semesterStartDate){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&semesterStartDate=" + semesterStartDate;
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
                bids = []
            },
            404: function(response) {
                errMsg = response.responseText
                bids = []
            },
        }
    });
    return [errMsg,bids]
}

//==================== Templates ====================

// Used to populate the content of the html your bids
sampleYourPastBids = `
<div class='row' style='padding:20px 20px 20px 20px;' >
    <div class='col-sm-12 fontstyle dataTable'>
        <table style='border-collapse: collapse; width:100%;'  >
            <tr>
                <td style='text-align:left;'>
                    <b id='classTitle'>{0} - {1}</b> 
                </td>
                <td colspan="1" style="text-align:right;">
                    {2} Stars
                </td>
                <td rowspan="2"style='text-align: right;'>
                    <p id="errMsg{9}" style="color:#FF4545"></p>
                </td>
                <td style='text-align: right;'>
                    <label style='color:black; width:40%; margin:0px 10px;'>Bid Amount: {3}</label>
                </d>
                <td style='text-align: right;'>
                <button class='greyButton' disabled='true' onclick='deleteBid({9})'>Delete</button>
            </td>
            </tr>           
            <tr>
                <td>{4}, {5} - {6}</td>
                <td colspan="1" style='text-align: right;'>Tutor: {7}</td>
                <td>
                    Status: {8}
                </td>
                <td style='text-align: right;'><a href='./ClassBids.html'><button class='viewDetails' onclick='setClassBidsSessionData({1})' style='color:white; outline:none; border:none;'>View Details</button></a></td>
            </tr>
        </table>
    </div> 
</div>`;

// Used to populate the content of the html your bids
sampleYourBids = `
<div class='row' style='padding:40px 20px 40px 20px;' >
    <div class='col-sm-12 fontstyle dataTable'>
        <table style='border-collapse: collapse; width:100%;'  >
            <tr>
                <td style='text-align:left;'>
                    <b id='classTitle'>{0} - {1}</b> 
                </td>
                <td colspan="2" style="text-align:right;">
                    {2} Stars
                </td>
                <td style='text-align: right;'>
                    <label style='color:black; width:40%; margin:0px 10px;'>Bid Amount:</label>
                    <input class='amountInput' bidID={9} type='number' name='bidAmount' value={3}>
                </d>
                <td style='text-align: right;'>
                <button class='hollowedButton' onclick='deleteBid({9},{10},{11},{12})'>Delete</button>
            </td>
            </tr>           
            <tr>
                <td>{4}, {5} - {6}</td>
                <td colspan="2" style='text-align: right;'>Tutor: {7}</td>
                <td>
                    Status: {8}
                </td>
                <td style='text-align: right;'><a href='./ClassBids.html'><button class='viewDetails' onclick='setClassBidsSessionData({1})' style='color:white; outline:none; border:none;'>View Details</button></a></td>
            </tr>
        </table>
    </div> 
</div>`;

// Used to present any error messages for the content of the html scroll list
sampleErr = `
<p class='fontstyle' style='text-align:center'>{0}</p>
<h1 class='fontstyle' style='text-align:center'>{1}</h1>
`;

// Used to present any error messages for the content of the html scroll list
sampleDivErr = `
<div class='row' style='padding:40px 20px 40px 20px;' >
    <div class='col-sm-12 fontstyle'>
        <p class='fontstyle' style='text-align:center'>{0}</p>
        <h1 class='fontstyle' style='text-align:center'>{1}</h1>
    </div>
</div>
`

// Used to populate the drop down list of semester start date history
sampleDropDown = `<option value="{0}">{0}</option>`;

//==================== JavaScript ====================
// Displays your bids
function listYourBids(studentID, studentName, currentSemesterStartDate, referencedSemesterStartDate) {
    
    response = GetStudentBidRecords(studentID, referencedSemesterStartDate)
    errMsg = response[0]
    bids = response[1]

    htmlString = ""
    current = false

    date = new Date();

    // If the referenced semester date is during bidding day and current semester
    if (date.getDay() == 6 && currentSemesterStartDate == referencedSemesterStartDate) {
        current = true
    }

    if (errMsg == "") { // If bid exists
        for (var i = 0; i < bids.length; i++) {
            response = GetAClass(bids[i].classid)
            errMsg = response[0]
            aClass = response[1]
            if (errMsg == "") {
                if (current) { // Can alter bid, allow usage of deleting and editing token amount
                    htmlString += sampleYourBids.f(aClass.modulecode, aClass.classid, aClass.rating, bid.tokenamount,aClass.classdate, aClass.classstart, aClass.classend, aClass.tutorname, bid.bidID, studentID, studentName, currentSemesterStartDate)
                } else { // Otherwise disable both
                    htmlString += sampleYourPastBids.f(aClass.modulecode, aClass.classid, aClass.rating, bid.tokenamount,aClass.classdate, aClass.classstart, aClass.classend, aClass.tutorname, bid.bidID, studentID, studentName, currentSemesterStartDate)
                }
            }
            else { // No class information exists anymore
                htmlString += sampleDivErr.f("It appears an error has occured",errMsg)
            }
        }
    }
    else if (errMsg.substring(0,3) == "404") { // Not urgent error
        htmlString += sampleErr.f("","No bid was made by user.")
    }
    else { // Urgent error
        htmlString += sampleErr.f("It appears an error has occured",errMsg)
    }

    document.getElementById('scrollList').innerHTML = htmlString

     // Set up amount inputs, upon pressing enter, update
    amountInputs = document.getElementsByClassName('amountInput')

    if (current) {
        for (var i = 0; i < amountInputs.length; i++) {
            amountInputs[i].addEventListener("keyup", function(event) {
                // Number 13 is the "Enter" key on the keyboard
                if (event.keyCode === 13) {
                    updateBid(amountInput.bidID, amountInput.value)
                }
            });
        }
    }
}

// Calls api caller to update an existing bid
function updateBid(bidID, tokenAmount) {
    
    // Retrieve all untouched information
    bid = JSON.parse(GetBidRecordByBidID(bidID))
    
    // Edit altered information
    bid.tokenamount = tokenAmount

    // Create json string
    const jsonString = JSON.stringify(bid);

    // Call api caller
    errMsg = UpdateBidRecord(bidID, jsonString)

    if (errMsg.substring(0,3) == "402") { // If insufficient balance
        // Error Message
        document.getElementById('errMsg'+bidID).innerText = "Insufficient Balance"
    }
}

// Calls api caller to delete the bid
function deleteBid(bidID, studentID, studentName, currentSemesterStartDate) {

    DeleteBidRecord(bidID)

    // Update current display
    listYourBids(studentID, studentName, currentSemesterStartDate, currentSemesterStartDate)
}

// Set session data before proceeding to next page
function setClassBidsSessionData(classID) {
    sessionStorage.setItem("openBidsForClassID", classID);
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
    listYourBids(studentID, studentName, classID, currentSemesterStartDate, searchedSemesterStartDate)
}


//==================== Main ====================

// Get important data
startDateData = getSemesterStartDate()
currentSemesterStartDate = startDateData[0]
date = startDateData[1]

//studentID = sessionStorage.getItem("studentID") 
//studentName = sessionStorage.getItem("studentName") 

studentID = "S10196983"
studentName = "Yap Zhao Yi" 

if (sessionStorage.getItem("searchedSemesterStartDate") != null) {
    searchedSemesterStartDate = sessionStorage.getItem("searchedSemesterStartDate")
} else {
    searchedSemesterStartDate = currentSemesterStartDate
}

if (studentID != null) {
// Populate neccessary html
listYourBids(studentID, studentName, currentSemesterStartDate, searchedSemesterStartDate)
} else {
    document.getElementById('scrollList').innerHTML = sampleErr.f("It appears an error has occured","User not authenticated")
}

populateDropDown(date)

