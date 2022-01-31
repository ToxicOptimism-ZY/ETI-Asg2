//==================== Structures & Variables ====================

//==================== API Callers ====================
const tokenURL = "http://10.31.11.12:9071/api/v1/Token"
const classURL = "http://10.31.11.12:9101/api/v1/class"
const bidURL = "http://10.31.11.12:9221/api/v1/bids"
const key = "2c78afaf-97da-4816-bbee-9ad239abb298"

//==================== Class API Callers ====================



//==================== Bidding API Callers ====================
function GetBidRecordByBidID(bidID){
    url = bidURL + "/" + bidID + "?key=" + key;
    $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            bid = JSON.parse(response);
        },
        error: function (_, _, response) {
            console.log(response);
            bid = null;
        }
    });
    return bid
}

GetSemesterBidRecordsByStatus
GetStudentBidRecords
GetStudentBidRecordByStatus

function GetStudentBidRecordForStatus(studentID, semesterStartDate, bidStatus){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            bid = JSON.parse(response);
        },
        error: function (_, _, response) {
            console.log(response);
            bid = null;
        }
    });
    return bid
}

function GetStudentBidRecordForClass(studentID, classID, semesterStartDate){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            bid = JSON.parse(response);
        },
        error: function (_, _, response) {
            console.log(response);
            bid = null;
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
        error: function (_, _, response) {
            console.log(response);
            bids = [];
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
        error: function (_, _, response) {
            bids = [];
        }
    });
    return bids
}

