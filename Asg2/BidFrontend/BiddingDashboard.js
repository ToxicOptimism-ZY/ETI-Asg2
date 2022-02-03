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

    return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
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
function GetClasses(){
    url = classURL + "/" + "?key=" + key;
    $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            classes = JSON.parse(response);
            errMsg = ""
        },
        statusCode: {
            401: function(response) {
                errMsg = response.responseText
                classes = null;
            },
            404: function(response) {
                errMsg = response.responseText
                classes = null;
            },
        }
    });
    return errMsg, classes
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

function DeleteBidRecord(bidID, jsonString){
    url = bidURL + "/" + bidID + "?key=" + key;
    $.ajax({
        type: "GET",
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
            202: function(response) {
                errMsg = response.responseText
            },
        }
    });
    return errMsg
}

function GetSemesterBidRecordsByStatus(semesterStartDate, bidStatus){
    url = bidURL + "?key=" + key  + "&semesterStartDate=" + semesterStartDate + "&status=" + bidStatus;
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

function GetStudentBidRecordByStatus(studentID, semesterStartDate, bidStatus){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&semesterStartDate=" + semesterStartDate + "&status=" + bidStatus;
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
                console.log(response.responseText)
                bid = null
            },
            404: function(response) {
                console.log(response.responseText)
                bid = null
            },
        }
    });
    return bid
}

function GetTopClassBidRecords(classID, semesterStartDate){
    url = bidURL + "?key=" + key + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
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

function GetTopClassBidRecordsByStatus(classID, semesterStartDate, bidStatus){
    url = bidURL + "?key=" + key + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate + "&status=" + bidStatus;
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

//==================== Create JSON String ====================
function createBid(semesterStartDate, classID, studentID, studentName, tokenAmount, status) {
    const obj = JSON.parse(sampleString);
    obj.bidID = parseInt(obj.CommentID);
    obj.semesterStartDate = parseInt(obj.TargetID);
    obj.classID = parseInt(obj.CreatorID);
    obj.studentID = parseInt(obj.Anonymous);
    const jsonString2 = JSON.stringify(obj);
}

//==================== Templates ====================
sampleJsonString = '{ bidid: 0, semesterstartdate: "", classid: 0, studentid: "", studentname: "", tokenamount: 0, status: "Pending"}'
sampleClassItem = `
<div class='row' style='padding:40px 80px 40px 80px;' >
    <div class='col-sm-12 fontstyle dataTable'>
        <table style='border-collapse: collapse; width:100%;'  >
            <thead>
                <tr>
                    <td style='text-align:left;'>
                        <b id='classTitle'>{0} - {1}</b> 
                    </td>
                    <td colspan="2" style="text-align:right;">
                        {2} Stars
                    </td>
                    <td style='text-align: right;'>
                        Your Bid:    {3}
                    </td>
                </tr>           
            </thead>
            <tr>
                <td>{4}, {5} - {6}</td>
                <td colspan="2" style='text-align: right;'>Tutor: {7}</td>
            </tr>
            <tr>
                <td colspan="3"> {8} </td>
                <td style='text-align: right;'><a href='INSERT LINK HERE'><button class='viewDetails' classid='{9}' semesterstartdate='{10}' style='color:white; outline:none; border:none;'>View Details</button></a></td>
            </tr>
        </table>
    </div>
</div>`;

//==================== JavaScript ====================
function listAllClasses() {
    classes = JSON.parse(GetClasses())
    htmlString = ""

    // check if input vs semesterStartDate, check if valid
    semesterStartDate = currentSemesterStartDate 

    for (var i = 0; i < classes.length; i++) {
        htmlString += sampleClassItem.f(classes[i].modulecode,classes[i].classcode,classes[i].classrating,classes[i].tutorname,classes[i].classinfo,classes[i].classcode)
    }

    document.getElementById('scrollList').innerHTML = htmlString
}

function listClassBids() {

}

function listMyBids() {

}

function updateBid() {
    bid = JSON.parse(GetBidRecordByBidID(bidID))
}

function deleteBid() {

}


currentSemesterStartDate = getSemesterStartDate()