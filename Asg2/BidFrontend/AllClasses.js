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

function GetStudentBidRecordForClass(studentID, classID, semesterStartDate){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    $.ajax({
        type: "GET",
        url: url,
        success: function (response, _) {
            errMsg = ''
            bid = JSON.parse(response);
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
    return errMsg, bid
}

//==================== Templates ====================
sampleClassItem = `
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
                    Your Bid:    {3}
                </td>
            </tr>           
            <tr>
                <td>{4}, {5} - {6}</td>
                <td colspan="2" style='text-align: right;'>Tutor: {7}</td>
            </tr>
            <tr>
                <td colspan="3"> {8} </td>
                <td style='text-align: right;'><a href='./ClassBids.html'><button class='viewDetails' onclick='setClassBidsSessionData({1})' style='color:white; outline:none; border:none;'>View Details</button></a></td>
            </tr>
        </table>
    </div>
</div>`;

sampleErr = `
<p class='fontstyle' style='text-align:center'>{0}</p>
<h1 class='fontstyle' style='text-align:center'>{1}</h1>
`;

sampleDropDown = `<option value="{0}">{0}</option>`;

//==================== JavaScript ====================
function listAllClasses(studentID, referencedSemesterStartDate) {
    errMsg, classes = JSON.parse(GetClasses())
    htmlString = ""

    if (errMsg == "") {
        for (var i = 0; i < classes.length; i++) {
            synopsis = classes[i].classinfo

            if(synopsis.length > 140) synopsis = synopsis.substring(0,141) + " ..."
            bid = JSON.parse(GetStudentBidRecordForClass(studentID, classID, referencedSemesterStartDate))
            tokenAmount = "---"
            if (bid != null) {
                tokenAmount = bid.tokenamount
            }
            htmlString += sampleClassItem.f(classes[i].moduleid,classes[i].classid,classes[i].rating, tokenAmount, classes[i].classdate,classes[i].start_time,classes[i].end_time,classes[i].tutorname,synopsis)
        }
    }
    else if (errMsg.substring(0,3) == 404) {
        htmlString += sampleErr.f("","No classes could be found.")
    }
    else {
        htmlString += sampleErr.f("It appears an error has occured",errMsg)   
    }

    document.getElementById('scrollList').innerHTML = htmlString
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

if (sessionStorage.getItem("searchedSemesterStartDate") != null) {
    searchedSemesterStartDate = sessionStorage.getItem("searchedSemesterStartDate")
} else {
    searchedSemesterStartDate = currentSemesterStartDate
}

listAllClasses(studentID, searchedSemesterStartDate)
populateDropDown(date)