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
function CreateBidRecord(jsonString){
    url = bidURL + "?key=" + key;
    $.ajax({
        type: "POST",
        url: url,
        data: jsonString,
        contentType: "application/json",
        statusCode: {
            401: function(response) {
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

function GetStudentBidRecordForClass(studentID, classID, semesterStartDate){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            bid = JSON.parse(response);
        },
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
                bid = null
            },
            404: function(response) {
                console.log(response.responseText)
                bid = null
            },
        }
    });
    return errMsg, bid
}

function GetTopClassBidRecords(classID, semesterStartDate){
    url = bidURL + "?key=" + key + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    $.ajax({
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
                console.log(response.responseText)
                bids = null
            },
        }
    });
    return errMsg, bid
}

//==================== Templates ====================
sampleDesc = `
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

sampleYourClassBid = `
<div class='row' style='padding:40px 80px 40px 80px;' >
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
                    <button id='deleteAction' class='greyButton' disabled='true' onclick='deleteBid({3})'>Delete</button>
                </td>
            </td>
        </table>
    </div>
</div>`;

sampleClassBid = `
<div class='row' style='padding:40px 80px 40px 80px;' >
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

sampleErr = `
<p class='fontstyle' style='text-align:center'>{0}</p>
<h1 class='fontstyle' style='text-align:center'>{1}</h1>
`;

sampleDropDown = `<option value="{0}">{0}</option>`;

//==================== JavaScript ====================
function listClassDesc(classID) {
    errMsg, aClass = JSON.parse(GetAClass(classID))
    htmlString = ""

    if (errMsg == "") {
        htmlString += sampleClassDesc.f(aClass.classdate,aClass.start_time,aClass.end_time,aClass.tutorname,aClass.rating, aClass.classinfo)
    }
    else {
        htmlString += sampleErr.f("It appears an error has occured", errMsg)   
    }
    document.getElementById('classModule').innerHTML = aClass.moduleid+" - "+aClass.classid
    document.getElementById('classDesc').innerHTML = htmlString
}

function listYourBid(studentID, studentName, classID, currentSemesterStartDate, referencedSemesterStartDate) {
    
    errMsg, bid = JSON.parse(GetStudentBidRecordForClass(studentID, classID, referencedSemesterStartDate))
    htmlString = ""
    current = false
    create = true

    date = new Date();

    if (date.getDay() == 6 && currentSemesterStartDate == referencedSemesterStartDate) {
        current = true
    }

    if (errMsg == "") {
        if (current) {
            htmlString += sampleYourClassBid.f(studentName, bid.status, bid.tokenamount, bid.bidid)
            document.getElementById('deleteAction').classList.add('hollowedButton');
            document.getElementById('deleteAction').classList.remove('greyButton');
            document.getElementById('deleteAction').disabled='false'
            create = false
        } else {
            htmlString += sampleClassBid.f(i, studentName, bid.status, bid.tokenamount)   
        }
    }
    else if (errMsg.substring(0,3) == 404) {
        if (current) {
            htmlString += sampleYourClassBid.f(studentName, "Pending", 0, null)
        }
        else {
            htmlString += sampleErr.f("","No bid was made by user.")
        }
    }
    else {
        htmlString += sampleErr.f("It appears an error has occured",errMsg)
    }

    document.getElementById('yourBid').innerHTML = htmlString

    amountInput = document.getElementById('amountInput')

    if (current && create) {
        amountInput.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                createBid(currentSemesterStartDate, classID, studentID, studentName,amountInput.value)
            }
        });
    }
    else if (current) {
        amountInput.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                updateBid(amountInput.bidID,currentSemesterStartDate, classID, studentID, studentName,amountInput.value)
            }
        });
    }
}

function listBids(studentID, classID, currentSemesterStartDate, referencedSemesterStartDate) {
    errMsg, bids = JSON.parse(GetTopClassBidRecords(classID, referencedSemesterStartDate))
    htmlString = ""
    
    if (errMsg == "") {
        date = new Date();
        current = false
        if (date.getDay() == 6 && currentSemesterStartDate == referencedSemesterStartDate) {
            current = true
        }

        for (var i = 0; i < bids.length; i++) {
            
            studentName = bid.studentName
            if (current && bids[i].studentid != studentID) {
                studentName = "Anonymized"
            }
            htmlString += sampleClassBid.f(i, studentName, bid.status, bid.tokenamount)

            if (bid.studentID == studentID) {
                document.getElementById('yours').innerText = '#' + i+1
            }
        }
    }
    else if (errMsg.substring(0,3) == 404) {
        htmlString += sampleErr.f("","No bids could be found.")
    }
    else {
        htmlString += sampleErr.f("It appears an error has occured",errMsg)   
    }

    document.getElementById('bids').innerHTML = htmlString
}

sampleJsonString = '{ bidid: 0, semesterstartdate: "", classid: 0, studentid: "", studentname: "", tokenamount: 0, status: "Pending"}'

function createBid(currentSemesterStartDate, classID, studentID, studentName,tokenAmount) {
    const obj = {}
    
    obj.semesterstartdate = currentSemesterStartDate;
    obj.classid = classID;
    obj.studentid = studentID;
    obj.studentname = studentName;
    obj.tokenAmount = tokenAmount;
    obj.status = "Pending"
    const jsonString = JSON.stringify(obj);

    CreateBidRecord(jsonString)
    listYourBid(studentID, studentName, classID, currentSemesterStartDate, currentSemesterStartDate)
    listBids(studentID,classID,currentSemesterStartDate,currentSemesterStartDate)
}

function updateBid(bidID, currentSemesterStartDate, classID, studentID, studentName,tokenAmount) {
    bid = JSON.parse(GetBidRecordByBidID(bidID))
    bid.tokenamount = tokenAmount

    const jsonString = JSON.stringify(obj);

    UpdateBidRecord(bidID, jsonString)
    listYourBid(studentID, studentName, classID, currentSemesterStartDate, currentSemesterStartDate)
    listBids(studentID,classID,currentSemesterStartDate,currentSemesterStartDate)
}

function deleteBid(bidID) {

    DeleteBidRecord(bidID)
    listYourBid(studentID, studentName, classID, currentSemesterStartDate, currentSemesterStartDate)
    listBids(studentID,classID,currentSemesterStartDate,currentSemesterStartDate)
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

listClassDesc(classID)
listYourBid(studentID, studentName, classID, currentSemesterStartDate, searchedSemesterStartDate)
listBids(studentID, classID, currentSemesterStartDate, searchedSemesterStartDate) 

populateDropDown(date)