//==================== Structures & Variables ====================
const tokenURL = "http://10.31.11.12:9071/api/v1/Token"
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

//==================== API Callers ====================

//==================== Class API Callers ====================



//==================== Bidding API Callers ====================
function CreateBidRecord(){
    url = bidURL + "?key=" + key;
    $.ajax({
        type: "POST",
        url: url,
        statusCode: {
            401: function(response) {
                console.log(response.responseText)
            },
            422: function(response) {
                console.log(response.responseText)
            },
            201: function(response) {  
                console.log(response.responseText)
            },
        }
    });
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
                console.log(response.responseText)
                bid = null;
            },
            404: function(response) {
                console.log(response.responseText)
                bid = null;
            },
        }
    });
    return bid
}

function UpdateBidRecord(bidID){
    url = bidURL + "/" + bidID + "?key=" + key;
    $.ajax({
        type: "PUT",
        url: url,
        statusCode: {
            401: function(response) {
                console.log(response.responseText)
            },
            404: function(response) {
                console.log(response.responseText)
            },
            422: function(response) {
                console.log(response.responseText)
            },
            202: function(response) {
                console.log(response.responseText)
            },
        }
    });
}

function DeleteBidRecord(bidID){
    url = bidURL + "/" + bidID + "?key=" + key;
    $.ajax({
        type: "GET",
        url: url,
        statusCode: {
            401: function(response) {
                console.log(response.responseText)
            },
            404: function(response) {
                console.log(response.responseText)
            },
            202: function(response) {
                console.log(response.responseText)
            },
        }
    });
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

//==================== JQuery ====================