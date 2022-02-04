//==================== Structures & Variables ====================
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

    return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`, date
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
function GetAClass(classID){
    url = classURL + "/" + classID;
    $.ajax({
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
    return errMsg, aClass
}

//==================== Bidding API Callers ====================
function GetBidRecordByBidID(bidID){
    url = bidURL + "/" + bidID + "?key=" + key;
    $.ajax({
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
    return errMsg,bid
}

function UpdateBidRecord(bidID, jsonString){
    url = bidURL + "/" + bidID + "?key=" + key;
    $.ajax({
        type: "PUT",
        url: url,
        data: jsonString,
        contentType: "application/json",
        statusCode: {
            401: function(response) {
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

function DeleteBidRecord(bidID){
    url = bidURL + "/" + bidID + "?key=" + key;
    $.ajax({
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

function GetStudentBidRecords(studentID, semesterStartDate){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&semesterStartDate=" + semesterStartDate;
    $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            bids = JSON.parse(response);
        },
        statusCode: {
            401: function(response) {
                console.log(response.responseText)
                bids = []
            },
            404: function(response) {
                console.log(response.responseText)
                bids = []
            },
        }
    });
    return bids
}

//==================== Templates ====================
sampleYourBids = `
<div class='row' style='padding:40px 80px 40px 80px;' >
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
                    <label style='color:black; width:40%; margin:0px 10px;'>Bid Amount:</label>
                    <input id='amountInput' bidID={9} type='number' name='bidAmount' value={3}>
                </d>
                <td style='text-align: right;'>
                <button id='deleteAction' class='greyButton' disabled='true' onclick='deleteBid({9})'>Delete</button>
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

sampleYourBids = `
<div class='row' style='padding:40px 80px 40px 80px;' >
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
                <button id='deleteAction' class='hollowedButton' onclick='deleteBid({9},{10},{11},{12})'>Delete</button>
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

sampleErr = `
<p class='fontstyle' style='text-align:center'>{0}</p>
<h1 class='fontstyle' style='text-align:center'>{1}</h1>
`;

sampleDivErr = `
<div class='row' style='padding:40px 80px 40px 80px;' >
    <div class='col-sm-12 fontstyle'>
        <p class='fontstyle' style='text-align:center'>{0}</p>
        <h1 class='fontstyle' style='text-align:center'>{1}</h1>
    </div>
</div>
`

sampleDropDown = `<option value="{0}">{0}</option>`;

//==================== JavaScript ====================
function listYourBids(studentID, studentName, currentSemesterStartDate, referencedSemesterStartDate) {
    
    errMsg, bids = JSON.parse(GetStudentBidRecords(studentID, referencedSemesterStartDate))
    htmlString = ""
    current = false

    date = new Date();

    if (date.getDay() == 6 && currentSemesterStartDate == referencedSemesterStartDate) {
        current = true
    }

    if (errMsg == "") {
        for (var i = 0; i < bids.length; i++) {
            errMsg, aClass = JSON.parse(GetAClass(bids[i].classid))
            if (errMsg == "") {
                if (current) {
                    htmlString += sampleYourClassBid.f(aClass.moduleid, aClass.classid, aClass.rating, bid.tokenamount,aClass.classdate, aClass.start_time, aClass.end_time, aClass.tutorname, bid.bidID, studentID, studentName, currentSemesterStartDate)
                } else {
                    htmlString += sampleClassBid.f(i, studentName, bid.status, bid.tokenamount)   
                }
            }
            else {
                htmlString += sampleDivErr.f("It appears an error has occured",errMsg)
            }
        }
    }
    else if (errMsg.substring(0,3) == 404) {
        htmlString += sampleErr.f("","No bid was made by user.")
    }
    else {
        htmlString += sampleErr.f("It appears an error has occured",errMsg)
    }

    document.getElementById('scrollList').innerHTML = htmlString

    amountInputs = document.getElementsByClassName('amountInput')

    if (current) {
        for (var i = 0; i < amountInputs.length; i++) {
            amountInputs[i].addEventListener("keyup", function(event) {
                // Number 13 is the "Enter" key on the keyboard
                if (event.keyCode === 13) {
                    updateBid(amountInput.bidID,currentSemesterStartDate, studentID, studentName,amountInput.value)
                }
            });
        }
    }
}

function updateBid(bidID, currentSemesterStartDate, studentID, studentName,tokenAmount) {
    bid = JSON.parse(GetBidRecordByBidID(bidID))
    bid.tokenamount = tokenAmount

    const jsonString = JSON.stringify(bid);

    errMsg = UpdateBidRecord(bidID, jsonString)

    if (errMsg == "") {
        listBids(studentID,studentName,currentSemesterStartDate,currentSemesterStartDate)
    }
    else if (errMsg.substring(0,3) == 402) {
        document.getElementById('errMsg'+bidID).innerText = "Insufficient Balance"
    }
}

function deleteBid(bidID, studentID, studentName, currentSemesterStartDate) {

    DeleteBidRecord(bidID)
    listYourBids(studentID, studentName, currentSemesterStartDate, currentSemesterStartDate)
}

function setClassBidsSessionData(classID) {
    sessionStorage.setItem("openBidsForClassID", classID);
}

function populateDropDown(date) {
    htmlString = ""

    for (var i = 0; i < 10; i++) {
        referencedDate = date;
        referencedDate.setDate(date.getDate() - 7)

        formattedDate = `${referencedDate.getDate()}-${referencedDate.getMonth()+1}-${referencedDate.getFullYear()}`
        
        htmlString += sampleDropDown.f(formattedDate)
    }

    document.getElementById('semesterStartDate').innerHTML = htmlString
}

function dropDownOnChange() {
    searchedSemesterStartDate = semesterStartDateInput.value
    sessionStorage.setItem("searchedSemesterStartDate", searchedSemesterStartDate);
}


//==================== Main ====================

currentSemesterStartDate, date = getSemesterStartDate()
studentID = sessionStorage.getItem("studentID") 
studentName = sessionStorage.getItem("studentName") 
classID = sessionStorage.getItem("openBidsForClassID")

if (sessionStorage.getItem("searchedSemesterStartDate") != null) {
    searchedSemesterStartDate = sessionStorage.getItem("searchedSemesterStartDate")
} else {
    searchedSemesterStartDate = currentSemesterStartDate
}

listYourBids(studentID, studentName, currentSemesterStartDate, searchedSemesterStartDate)

populateDropDown(date)

