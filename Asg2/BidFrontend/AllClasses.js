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

    return [`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`, date];
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

// Get all classes
async function GetClasses(){ //async

    /*
    // Sample data
    classes = [

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
    
        },
    
        {
    
            "classid": 13,
    
            "modulecode": "ETI",
    
            "classdate": "12-2-2022",
    
            "classstart": "0800",
    
            "classend": "1000",
    
            "classcap": 5,
    
            "tutorname": "Zhao Yi",
    
            "tutorid": 420,
    
            "rating": 4.2,
    
            "classinfo": "Is this the real class? Or is it just fantasy?"
    
        }
    
    ]

    return ["", classes]
    */
    
    url = classURL + "/" + "?key=" + key;
    await $.ajax({
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
    return [errMsg, classes]
    
}

// Get classes with the following moduleCode
async function SearchClasses(searchKey){ //async

    /*
    // Sample data
    classes = [

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
    
    ]

    return ["", classes]
    */

    url = classURL + "/" + "?key=" + key + "&ModuleCode=" + searchKey;
    await $.ajax({
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
    return [errMsg, classes]
}

//==================== Bidding API Callers ====================

// Get student's bid for a class in a particular semester
async function GetStudentBidRecordForClass(studentID, classID, semesterStartDate){
    url = bidURL + "?key=" + key  + "&studentID=" + studentID + "&classID=" + classID + "&semesterStartDate=" + semesterStartDate;
    await $.ajax({
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
    return [errMsg, bid]
}

//==================== Templates ====================

// Used to populate the content of the html scroll list
sampleClassItem = `
<div class='row' style='padding:20px 20px 20px 20px;' >
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

// Used to present any error messages for the content of the html scroll list
sampleErr = `
<p class='fontstyle' style='text-align:center'>{0}</p>
<h1 class='fontstyle' style='text-align:center'>{1}</h1>
`;

// Used to populate the drop down list of semester start date history
sampleDropDown = `<option value="{0}">{0}</option>`;

//==================== JavaScript ====================

// List the classes
function classLister(classes, studentID, referencedSemesterStartDate) {
    htmlString = ""

    for (var i = 0; i < classes.length; i++) {
        synopsis = classes[i].classinfo

        if(synopsis.length > 140) synopsis = synopsis.substring(0,141) + " ..." //limit text length of synopsis in brief display
        response = GetStudentBidRecordForClass(studentID, classes[i].classid, referencedSemesterStartDate)
        bid = response[1]
        tokenAmount = "---"
        if (bid != null) {
            tokenAmount = bid.tokenamount
        }

        // Format the string to replace all {0} with attributes
        htmlString += sampleClassItem.f(classes[i].modulecode,classes[i].classid,classes[i].rating, tokenAmount, classes[i].classdate,classes[i].classstart,classes[i].classend,classes[i].tutorname,synopsis)
    }

    return htmlString
}

// Call api caller to get all classes to list
function listAllClasses(studentID, referencedSemesterStartDate) {
    response = GetClasses()
    errMsg = response[0]
    classes = response[1]

    htmlString = ""

    if (errMsg == "") {
        htmlString += classLister(classes, studentID, referencedSemesterStartDate)
        if (htmlString == "") {
            htmlString += sampleErr.f("","No classes could be found.")
        }
    }
    else if (errMsg.substring(0,3) == "404") { // Not an urgent error
        htmlString += sampleErr.f("","No classes could be found.")
        console.log(htmlString)
    }
    else { // Urgent error
        htmlString += sampleErr.f("It appears an error has occured",errMsg)   
    }

    document.getElementById('scrollList').innerHTML = htmlString
}

// Call api caller to get searched classes of the module code to list
function listSearchedClasses(studentID, referencedSemesterStartDate, searchKey) {
    response = SearchClasses(searchKey)
    errMsg = response[0]
    classes = response[1]

    htmlString = ""

    if (errMsg == "") {
        htmlString += classLister(classes, studentID, referencedSemesterStartDate)
        if (htmlString == "") {
            htmlString += sampleErr.f("","No classes could be found.")
        }
    }
    else if (errMsg.substring(0,3) == "404") { //Not an urgent error
        htmlString += sampleErr.f("","No classes could be found.")
    }
    else { // Urgent error
        htmlString += sampleErr.f("It appears an error has occured",errMsg)   
    }

    document.getElementById('scrollList').innerHTML = htmlString
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
}

//==================== Main ====================

// Get important data
startDateData = getSemesterStartDate()
currentSemesterStartDate = startDateData[0]
date = startDateData[1]

//studentID = sessionStorage.getItem("studentID") // From authentication

studentID = "S10196983"
studentName = "Yap Zhao Yi" 

if (sessionStorage.getItem("searchedSemesterStartDate") != null) {
    searchedSemesterStartDate = sessionStorage.getItem("searchedSemesterStartDate")
} else {
    searchedSemesterStartDate = currentSemesterStartDate
}

if (studentID != null) {
    // Populate neccessary html
    listAllClasses(studentID, searchedSemesterStartDate)
} else {
    document.getElementById('scrollList').innerHTML = sampleDivErr.f("It appears an error has occured","User not authenticated")
}
    
populateDropDown(date)

// Set up search bar, upon pressing enter, update
classModSearch = document.getElementById('classModSearch')

classModSearch.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13 && studentID != null) {
        if (classModSearch.value == "") {
            listAllClasses(studentID,searchedSemesterStartDate)
        }
        else {
            listSearchedClasses(studentID,searchedSemesterStartDate,classModSearch.value)
        }
    }
});