package main

//==================== Imports ====================
import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/robfig/cron" //used for go routine

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

//==================== Structures & Variables ====================
type Bid struct {
	BidID             int
	SemesterStartDate string //dd-mm-yyyy
	ClassID           int
	StudentID         string
	StudentName       string
	TokenAmount       int
	Status            string
}

type Student struct {
	StudentID    string `json:"student_id"`
	Name         string `json:"name"`
	Dob          string `json:"date_of_birth"`
	Address      string `json:"address"`
	Phone_number string `json:"phone_number"`
}

type TokenType struct { // map this type to the record created in the table
	TokenTypeID   int    //int 5
	TokenTypeName string //varchar 5
}

type TokenTypeBalance struct {
	TokenTypeID   int
	TokenTypeName string
	Balance       int
}

type Transactions struct {
	TransactionID   int //int 3
	StudentID       string
	ToStudentID     string
	TokenTypeID     int    //int 5
	TransactionType string //varchar 30
	Amount          int    //int 3,
}

var db *sql.DB
var ETITokenID int

const anonymousKeyPass = "gq123jad9dq"
const studentURL = "http://10.31.11.12:9211/api/v1/students"
const tokenURL = "http://10.31.11.12:9071/api/v1/Token"
const transactionURL = "http://10.31.11.12:9072/api/v1/Transactions"

//==================== Auxiliary Functions ====================
// Check for valid key within query string
func validKey(r *http.Request) bool {
	v := r.URL.Query()
	if key, ok := v["key"]; ok {
		if key[0] == "2c78afaf-97da-4816-bbee-9ad239abb298" {
			return true
		} else {
			return false
		}
	} else {
		return false
	}
}

//==================== API Callers ====================

//==================== Student API Callers ====================

// Get all students
func GetStudents() (string, []Student) {

	// Set up url
	url := studentURL + "/"

	// Get method
	response, err := http.Get(url)

	var students []Student
	var errMsg string

	switch err {
	case nil:
		data, _ := ioutil.ReadAll(response.Body)
		// Get fail or success msg
		if response.StatusCode == 401 {
			errMsg = string(data)
		} else if response.StatusCode == 404 {
			errMsg = string(data)
		} else {
			errMsg = "Success"
			json.Unmarshal([]byte(data), &students) // Convert json to student details
		}
	default:
		fmt.Printf("The HTTP request failed with error %s\n", err)
	}

	response.Body.Close()

	return errMsg, students
}

//==================== Wallet API Callers ====================

// Get token ID
func GetTokenID(tokenName string) (string, int) {

	// Set up url
	url := tokenURL + "/search/" + tokenName

	// Get method
	response, err := http.Get(url)

	var token TokenType
	var errMsg string
	var tokenID int

	switch err {
	case nil:
		data, _ := ioutil.ReadAll(response.Body)
		// Get fail or success msg
		if response.StatusCode == 401 {
			errMsg = string(data)
		} else if response.StatusCode == 404 {
			errMsg = string(data)
		} else {
			errMsg = "Success"
			json.Unmarshal([]byte(data), &token) // Convert json to token details
			tokenID = token.TokenTypeID
		}
	default:
		fmt.Printf("The HTTP request failed with error %s\n", err)
	}

	response.Body.Close()

	return errMsg, tokenID
}

// Get student balance of ETI tokens
func GetStudentTokenBalance(studentID string, tokenID int) (string, int) {

	// Set up url
	url := tokenURL + "/student/" + studentID

	// Get method
	response, err := http.Get(url)

	var tokens []TokenTypeBalance
	var errMsg string
	var balance int

	switch err {
	case nil:
		data, _ := ioutil.ReadAll(response.Body)
		// Get fail or success msg
		if response.StatusCode == 401 {
			errMsg = string(data)
		} else if response.StatusCode == 404 {
			errMsg = string(data)
		} else {
			errMsg = "Success"
			json.Unmarshal([]byte(data), &tokens) // Convert json to tokenTypeBalance details
			for _, value := range tokens {
				switch value.TokenTypeID {
				case tokenID:
					return errMsg, value.Balance
				default:
				}

			}
		}
	default:
		fmt.Printf("The HTTP request failed with error %s\n", err)
	}

	response.Body.Close()

	return errMsg, balance
}

// Send earmarked tokens to admin, refunding only if bid failed
func SendTokens(transaction Transactions) string {

	// Set up url
	url := transactionURL + "/maketransaction/" + transaction.StudentID

	// Convert to Json
	jsonValue, _ := json.Marshal(transaction)

	// Post with object
	response, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))

	var errMsg string

	if err != nil {
		fmt.Printf("The HTTP request failed with error %s\n", err)
	} else {
		data, _ := ioutil.ReadAll(response.Body)
		// Get fail or success msg
		if response.StatusCode == 401 {
			errMsg = string(data)
		} else if response.StatusCode == 422 {
			errMsg = string(data)
		} else {
			errMsg = "Success"
		}
	}

	response.Body.Close()

	return errMsg
}

//==================== Database functions ====================

// Create bid
func CreateBid(db *sql.DB, b Bid) {

	// BidID is auto incremented
	query := fmt.Sprintf("INSERT INTO Bid (SemesterStartDate, ClassID, StudentID, StudentName, TokenAmount, `Status`) VALUES ('%s',%d,'%s', '%s',%d, '%s')",
		b.SemesterStartDate, b.ClassID, b.StudentID, b.StudentName, b.TokenAmount, b.Status)

	switch _, err := db.Query(query); err {
	case nil:
	default:
		panic(err.Error())
	}

}

// Get bid details by bid ID
func GetBid(db *sql.DB, bidID int) (Bid, string) {

	query := fmt.Sprintf("SELECT * FROM Bid where BidID = %d", bidID)

	// Get first result, only one exists
	results := db.QueryRow(query)

	var bid Bid
	var errMsg string

	// Map result to a bid
	switch err := results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status); err {
	case sql.ErrNoRows: //If no result
		errMsg = "Bid does not exist"
	case nil:
	default:
		panic(err.Error())
	}

	return bid, errMsg
}

// Update bid details by Bid ID
func UpdateBid(db *sql.DB, bidID int, b Bid) string {
	// Update all details
	query := fmt.Sprintf("UPDATE Bid SET SemesterStartDate = '%s', ClassID = %d, StudentID = '%s', StudentName = '%s', TokenAmount = %d, `Status` = '%s' WHERE BidID = %d",
		b.SemesterStartDate, b.ClassID, b.StudentID, b.StudentName, b.TokenAmount, b.Status, bidID)

	var errMsg string

	switch _, err := db.Query(query); err {
	case nil:
	default:
		errMsg = "Bid does not exist"
	}

	return errMsg
}

// Delete bid details by Bid ID
func DeleteBid(db *sql.DB, bidID int) string {
	query := fmt.Sprintf("DELETE FROM Bid WHERE BidID=%d", bidID)

	var errMsg string

	switch _, err := db.Query(query); err {
	case nil:
	default:
		errMsg = "Bid does not exist"
	}

	return errMsg
}

// Get list of bids by semester and status
func GetSemesterBidsByStatus(db *sql.DB, semesterStartDate string, status string) ([]Bid, string) {
	query := fmt.Sprintf("SELECT * FROM Bid where SemesterStartDate = '%s' and `Status` = '%s'", semesterStartDate, status)

	// Get all results
	results, err := db.Query(query)

	switch err {
	case nil:
	default:
		panic(err.Error())
	}

	var bids []Bid
	errMsg := "placeholder" //Temporary placeholder till any results existing determined

	// Loop through results
	for results.Next() {
		// Map a row to a Bid
		var bid Bid
		err := results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status)

		switch err {
		case nil:
		default:
			panic(err.Error())
		}

		errMsg = ""
		// Append mapped bid to bid array
		bids = append(bids, bid)
	}

	// If no result
	switch errMsg {
	case "":
	default:
		errMsg = "No bids made that semester with the following status:" + status
	}

	return bids, errMsg
}

// Get list of bids by studentID and semester
func GetStudentBids(db *sql.DB, studentID string, semesterStartDate string) ([]Bid, string) {
	query := fmt.Sprintf("SELECT * FROM Bid where StudentID = '%s' and SemesterStartDate = '%s'", studentID, semesterStartDate)

	// Get all results
	results, err := db.Query(query)

	switch err {
	case nil:
	default:
		panic(err.Error())
	}

	var bids []Bid
	errMsg := "placeholder" //Temporary placeholder till any results existing determined

	// Loop through results
	for results.Next() {
		// Map a row to a Bid
		var bid Bid
		err := results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status)

		switch err {
		case nil:
		default:
			panic(err.Error())
		}

		errMsg = ""
		// Append mapped bid to bid array
		bids = append(bids, bid)
	}

	// If no result
	switch errMsg {
	case "":
	default:
		errMsg = "No bids made by student that semester"
	}

	return bids, errMsg
}

// Get list of bids by studentID and semester and status
func GetStudentBidsByStatus(db *sql.DB, studentID string, semesterStartDate string, status string) ([]Bid, string) {
	query := fmt.Sprintf("SELECT * FROM Bid where StudentID = '%s' and SemesterStartDate = '%s' and `Status` = '%s'", studentID, semesterStartDate, status)

	// Get all results
	results, err := db.Query(query)

	switch err {
	case nil:
	default:
		panic(err.Error())
	}

	var bids []Bid
	errMsg := "placeholder" //Temporary placeholder till any results existing determined

	// Loop through results
	for results.Next() {
		// Map a row to a Bid
		var bid Bid
		err := results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status)

		switch err {
		case nil:
		default:
			panic(err.Error())
		}

		errMsg = ""
		// Append mapped bid to bid array
		bids = append(bids, bid)
	}

	// If no result
	switch errMsg {
	case "":
	default:
		errMsg = "No bids made by student that semester with the following status:" + status
	}

	return bids, errMsg
}

// Get bid by studentID and semester for a particular classID
func GetStudentBidForClass(db *sql.DB, studentID string, semesterStartDate string, classID int) (Bid, string) {
	query := fmt.Sprintf("SELECT * FROM Bid where StudentID = '%s' and SemesterStartDate = '%s' and ClassID = %d", studentID, semesterStartDate, classID)

	// Get first result, only one exists
	results := db.QueryRow(query)

	var bid Bid
	var errMsg string

	// Map result to a bid
	switch err := results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status); err {
	case sql.ErrNoRows: //If no result
		errMsg = "No bids made by student that semester"
	case nil:
	default:
		panic(err.Error())
	}

	return bid, errMsg
}

// Get a list of bids length of PaxNo by Class ID, SemesterStartDate in highest to lowest TokenAmount
// If anonymous == True, don't retrieve names
func GetTopClassBids(db *sql.DB, classID int, semesterStartDate string, paxNo int, anonymous bool) ([]Bid, string) {

	var query string

	// If pax provided
	switch paxNo {
	case -1:
		query = fmt.Sprintf("SELECT * FROM Bid where ClassID = %d and SemesterStartDate = '%s' Order By TokenAmount DESC", classID, semesterStartDate)
	default:
		query = fmt.Sprintf("SELECT * FROM Bid where ClassID = %d and SemesterStartDate = '%s' Order By TokenAmount DESC Limit %d", classID, semesterStartDate, paxNo)
	}

	// Get all results
	results, err := db.Query(query)

	switch err {
	case nil:
	default:
		panic(err.Error())
	}

	var bids []Bid
	errMsg := "placeholder" //Temporary placeholder till any results existing determined

	// Loop through results
	for results.Next() {
		// Map a row to a Bid
		var bid Bid
		var err error

		// If anonymous, don't retrieve student ID and student Name
		switch anonymous {
		case true:
			var throwAway string
			err = results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &throwAway, &throwAway, &bid.TokenAmount, &bid.Status)
		default:
			err = results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status)
		}

		switch err {
		case nil:
		default:
			panic(err.Error())
		}

		errMsg = ""
		// Append mapped bid to bid array
		bids = append(bids, bid)
	}

	// If no result
	switch errMsg {
	case "":
	default:
		errMsg = "No bids made for class that semester"
	}

	return bids, errMsg
}

// Get a list of bids length of PaxNo by Class ID, SemesterStartDate, Status in highest to lowest TokenAmount
// If anonymous == True, don't retrieve names
func GetTopClassBidsByStatus(db *sql.DB, classID int, semesterStartDate string, paxNo int, status string, anonymous bool) ([]Bid, string) {

	var query string

	switch paxNo {
	case -1:
		query = fmt.Sprintf("SELECT * FROM Bid where ClassID = %d and SemesterStartDate = '%s' and `Status` = '%s' Order By TokenAmount DESC", classID, semesterStartDate, status)
	default:
		query = fmt.Sprintf("SELECT * FROM Bid where ClassID = %d and SemesterStartDate = '%s' and `Status` = '%s' Order By TokenAmount DESC Limit %d", classID, semesterStartDate, status, paxNo)
	}

	// Get all results
	results, err := db.Query(query)

	switch err {
	case nil:
	default:
		panic(err.Error())
	}

	var bids []Bid
	errMsg := "placeholder" //Temporary placeholder till any results existing determined

	// Loop through results
	for results.Next() {
		// Map a row to a Bid
		var bid Bid
		var err error
		switch anonymous {
		case true:
			var throwAway string
			err = results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &throwAway, &throwAway, &bid.TokenAmount, &bid.Status)
		default:
			err = results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status)
		}

		switch err {
		case nil:
		default:
			panic(err.Error())
		}

		errMsg = ""
		// Append mapped bid to bid array
		bids = append(bids, bid)
	}

	// If no result
	switch errMsg {
	case "":
	default:
		errMsg = "No bids made for class that semester with the following status:" + status
	}

	return bids, errMsg
}

// Update student names by student ID
func UpdateStudentName(db *sql.DB, studentID string, studentName string) string {
	// Update all details
	query := fmt.Sprintf("UPDATE Bid SET StudentName = '%s' WHERE StudentID = '%s'",
		studentName, studentID)

	var errMsg string

	switch _, err := db.Query(query); err {
	case nil:
	default:
		errMsg = "No bids exist"
	}

	return errMsg
}

//==================== HTTP Functions ====================

//Post method for a bid record
func CreateBidRecord(w http.ResponseWriter, r *http.Request) {
	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	reqBody, err := ioutil.ReadAll(r.Body)

	switch err {
	case nil:
		// Map json to bid
		var bid Bid
		json.Unmarshal([]byte(reqBody), &bid)

		// Check if all non-null information exist
		if bid.SemesterStartDate == "" || bid.ClassID == 0 || bid.StudentID == "" || bid.StudentName == "" || bid.TokenAmount == 0 || bid.Status == "" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			w.Write([]byte("422 - Please supply all neccessary bid information "))
		} else if bid.Status != "Pending" && bid.Status != "Success" && bid.Status != "Failed" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			w.Write([]byte("422 - Invalid status provided"))
		} else { // data has no issue

			if ETITokenID == 0 {
				errMsg, tokenID := GetTokenID("ETI")
				switch errMsg {
				case "Success":
					ETITokenID = tokenID
				default:
					panic(err.Error())
				}
			}

			_, balance := GetStudentTokenBalance(bid.StudentID, ETITokenID)

			if balance >= bid.TokenAmount {
				//Check if enough funds otherwise error 402
				var transaction Transactions
				transaction.StudentID = bid.StudentID
				transaction.ToStudentID = "0" // admin account
				transaction.TokenTypeID = ETITokenID
				transaction.TransactionType = "Earmark"
				transaction.Amount = bid.TokenAmount

				SendTokens(transaction)

				// Run db CreateBid function
				CreateBid(db, bid)

				w.WriteHeader(http.StatusCreated)
				w.Write([]byte("201 - Bid created for: Class " + strconv.Itoa(bid.ClassID) + " at " + strconv.Itoa(bid.TokenAmount) + " Tokens"))
			} else {
				w.WriteHeader(http.StatusPaymentRequired)
				w.Write([]byte("402 - Insufficient balance"))
			}
		}
	default:
		w.WriteHeader(http.StatusUnprocessableEntity)
		w.Write([]byte("422 - Please supply bid information in JSON format"))
	}
}

// Get bid details with bid ID
func GetBidRecordByBidID(w http.ResponseWriter, r *http.Request) {

	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get param for bidID
	params := mux.Vars(r)
	var bidID int
	fmt.Sscan(params["bidID"], &bidID)

	var bid Bid
	var errMsg string

	// Run db GetBid function
	bid, errMsg = GetBid(db, bidID)
	switch errMsg {
	case "Bid does not exist":
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	default:
		// Return bid
		json.NewEncoder(w).Encode(bid)
	}
}

// Update all bid details together
func UpdateBidRecord(w http.ResponseWriter, r *http.Request) {

	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get param for bidID
	params := mux.Vars(r)
	var bidID int
	fmt.Sscan(params["bidID"], &bidID)

	reqBody, err := ioutil.ReadAll(r.Body)

	switch err {
	case nil:
		// Retrieve new object
		var bid Bid
		json.Unmarshal([]byte(reqBody), &bid)

		// Check non-nullable attributes are not null
		if bid.SemesterStartDate == "" || bid.ClassID == 0 || bid.StudentID == "" || bid.StudentName == "" || bid.TokenAmount == 0 || bid.Status == "" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			w.Write([]byte("422 - Please supply all bid information "))
		} else if bid.Status != "Pending" && bid.Status != "Success" && bid.Status != "Failed" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			w.Write([]byte("422 - Invalid status provided"))
		} else { // All not null

			// Get the old bid amount
			oldBid, errMsg := GetBid(db, bidID)
			switch errMsg {
			case "Bid does not exist":
				w.WriteHeader(http.StatusNotFound)
				w.Write([]byte("404 - No bid found"))
			default:

				//If a transaction is needed
				if oldBid.TokenAmount != bid.TokenAmount {

					if ETITokenID == 0 {
						errMsg, tokenID := GetTokenID("ETI")
						switch errMsg {
						case "Success":
							ETITokenID = tokenID
						default:
							panic(err.Error())
						}
					}

					// Getting neccessary funds / refunding amount
					var transaction Transactions
					transaction.TokenTypeID = ETITokenID

					// If increase in tokens required
					if oldBid.TokenAmount < bid.TokenAmount {
						_, balance := GetStudentTokenBalance(bid.StudentID, ETITokenID)

						// If sufficient balance
						if balance >= bid.TokenAmount-oldBid.TokenAmount {
							transaction.TransactionType = "Earmark"
							transaction.StudentID = bid.StudentID
							transaction.ToStudentID = "0" //admin account
							transaction.Amount = bid.TokenAmount - oldBid.TokenAmount
						} else {
							w.WriteHeader(http.StatusPaymentRequired)
							w.Write([]byte("402 - Insufficient balance"))
							return
						}
					} else if oldBid.TokenAmount > bid.TokenAmount { // Otherwise if decrease in tokens, refund
						transaction.TransactionType = "Un-earmark"
						transaction.StudentID = "0" //admin account
						transaction.ToStudentID = bid.StudentID
						transaction.Amount = oldBid.TokenAmount - bid.TokenAmount
					}

					SendTokens(transaction)

				}

				// Run db UpdateBid function, no other errors exist due to get bid already checking
				_ = UpdateBid(db, bidID, bid)

				w.WriteHeader(http.StatusAccepted)
				w.Write([]byte("202 - Bid details updated"))

			}
		}

	default:
		w.WriteHeader(http.StatusUnprocessableEntity)
		w.Write([]byte("422 - Please supply bid information in JSON format"))
	}
}

// Delete bid by BidID
func DeleteBidRecord(w http.ResponseWriter, r *http.Request) {
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get bidID to delete
	params := mux.Vars(r)
	var bidID int
	fmt.Sscan(params["bidID"], &bidID)

	// Run db GetBid function
	bid, errMsg := GetBid(db, bidID)

	switch errMsg {
	case "Bid does not exist":
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - No bid found"))
	default:

		// No need to check balance, as its a full refund
		var transaction Transactions
		transaction.TokenTypeID = ETITokenID

		transaction.TransactionType = "Un-earmark"
		transaction.StudentID = "0" //admin account
		transaction.ToStudentID = bid.StudentID
		transaction.Amount = bid.TokenAmount

		SendTokens(transaction)

		// Run db DeleteBid function
		DeleteBid(db, bidID) //No Errors needed, covered by GetBid

		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte("202 - Bid deleted: " + strconv.Itoa(bidID)))
	}
}

// Help function that calls appropriate function in accordance to parameters in the query string
func GetBidQueryStringValidator(w http.ResponseWriter, r *http.Request) {

	// Get query string parameters
	queryString := r.URL.Query()
	_, okStudent := queryString["studentID"]
	_, okSemester := queryString["semesterStartDate"]
	_, okClass := queryString["classID"]
	_, okStatus := queryString["status"]

	// If student ID and semester start date and class ID passed in,
	if okStudent && okSemester && okClass {
		GetStudentBidRecordForClass(w, r)
	} else if okStudent && okSemester { // If student ID and semester start date passed in, get all student bid records
		if okStatus { //Filter check
			// Run HTTP GetStudentBidRecordsByStatus function
			GetStudentBidRecordsByStatus(w, r)
		} else {
			// Run HTTP GetStudentBidRecords function
			GetStudentBidRecords(w, r)
		}
		return
	} else if okClass && okSemester { // If class ID and semester start date passed in, get top bids
		if okStatus { //Filter check
			// Run HTTP GetTopClassBidRecordsByStatus function
			GetTopClassBidRecordsByStatus(w, r)
		} else {
			// Run HTTP GetTopClassBidRecords function
			GetTopClassBidRecords(w, r)
		}
		return
	} else if okSemester {
		if okStatus {
			// Run HTTP GetSemesterBidRecordsByStatus function
			GetSemesterBidRecordsByStatus(w, r)
		}
		return
	} else {
		//else no appropriate function
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - Required parameters not found"))
	}
}

// Get bid records with semester start date and status
func GetSemesterBidRecordsByStatus(w http.ResponseWriter, r *http.Request) {

	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get query string parameters of semester start date and status
	queryString := r.URL.Query()
	var semesterStartDate string
	fmt.Sscan(queryString["semesterStartDate"][0], &semesterStartDate)
	var status string
	fmt.Sscan(queryString["status"][0], &status)

	var bids []Bid
	var errMsg string

	// Run db GetSemesterBidsByStatus function
	bids, errMsg = GetSemesterBidsByStatus(db, semesterStartDate, status)
	switch errMsg {
	case "":
		// Return bids array
		json.NewEncoder(w).Encode(bids)
	default:
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	}
}

// Get bid records with student ID and semester start date
func GetStudentBidRecords(w http.ResponseWriter, r *http.Request) {

	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get query string parameters of student ID and semester start date
	queryString := r.URL.Query()
	var studentID string
	fmt.Sscan(queryString["studentID"][0], &studentID)
	var semesterStartDate string
	fmt.Sscan(queryString["semesterStartDate"][0], &semesterStartDate)

	var bids []Bid
	var errMsg string

	// Run db GetStudentBids function
	bids, errMsg = GetStudentBids(db, studentID, semesterStartDate)
	switch errMsg {
	case "":
		// Return bids array
		json.NewEncoder(w).Encode(bids)
	default:
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	}
}

// Get bid records with student ID and semester start date and status
func GetStudentBidRecordsByStatus(w http.ResponseWriter, r *http.Request) {

	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get query string parameters of student ID and semester start date
	queryString := r.URL.Query()
	var studentID string
	fmt.Sscan(queryString["studentID"][0], &studentID)
	var semesterStartDate string
	fmt.Sscan(queryString["semesterStartDate"][0], &semesterStartDate)
	var status string
	fmt.Sscan(queryString["status"][0], &status)

	var bids []Bid
	var errMsg string

	// Run db GetStudentBidsByStatus function
	bids, errMsg = GetStudentBidsByStatus(db, studentID, semesterStartDate, status)
	switch errMsg {
	case "":
		// Return bids array
		json.NewEncoder(w).Encode(bids)
	default:
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	}
}

// Get bid record with student ID and semester start date for a particular class
func GetStudentBidRecordForClass(w http.ResponseWriter, r *http.Request) {

	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get query string parameters of student ID and semester start date
	queryString := r.URL.Query()
	var studentID string
	fmt.Sscan(queryString["studentID"][0], &studentID)
	var semesterStartDate string
	fmt.Sscan(queryString["semesterStartDate"][0], &semesterStartDate)
	var classID int
	fmt.Sscan(queryString["classID"][0], &classID)

	var bid Bid
	var errMsg string

	// Run db GetBid function
	bid, errMsg = GetStudentBidForClass(db, studentID, semesterStartDate, classID)
	switch errMsg {
	case "":
		// Return bid
		json.NewEncoder(w).Encode(bid)
	default:
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	}
}

// Get bids records with class ID and semester start date in highest to lowest TokenAmount
// Specify number retrieved with PaxNo, if none specified get all.
func GetTopClassBidRecords(w http.ResponseWriter, r *http.Request) {
	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get query string parameters of class ID and semester start date
	queryString := r.URL.Query()
	var classID int
	fmt.Sscan(queryString["classID"][0], &classID)
	var semesterStartDate string
	fmt.Sscan(queryString["semesterStartDate"][0], &semesterStartDate)
	var paxNo int

	// If top pax provided
	switch _, okPax := queryString["paxNo"]; okPax {
	case true:
		fmt.Sscan(queryString["paxNo"][0], &paxNo)
	default:
		paxNo = -1
	}

	// If anonymous key provided correctly, don't anonymize
	var anonKey string
	var anon bool

	switch _, okAnon := queryString["anonymousKey"]; okAnon {
	case true:
		fmt.Sscan(queryString["anonymousKey"][0], &anonKey)
		switch anonKey {
		case anonymousKeyPass:
			anon = false
		default:
			anon = true
		}
	default:
		anon = true
	}

	var bids []Bid
	var errMsg string

	// Run db GetTopClassBids function
	bids, errMsg = GetTopClassBids(db, classID, semesterStartDate, paxNo, anon)
	switch errMsg {
	case "":
		// Return bids array
		json.NewEncoder(w).Encode(bids)
	default:
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	}
}

// Get bids records with class ID and semester start date in highest to lowest TokenAmount
// Specify number retrieved with PaxNo, if none specified get all.
func GetTopClassBidRecordsByStatus(w http.ResponseWriter, r *http.Request) {
	// Valid key for API check
	if !validKey(r) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("401 - Invalid key"))
		return
	}

	// Get query string parameters of passenger ID and status
	queryString := r.URL.Query()
	var classID int
	fmt.Sscan(queryString["classID"][0], &classID)
	var semesterStartDate string
	fmt.Sscan(queryString["semesterStartDate"][0], &semesterStartDate)
	var status string
	fmt.Sscan(queryString["status"][0], &status)
	var paxNo int

	// If top pax provided
	switch _, okPax := queryString["paxNo"]; okPax {
	case true:
		fmt.Sscan(queryString["paxNo"][0], &paxNo)
	default:
		paxNo = -1
	}

	// If anonymous key provided correctly, don't anonymize
	var anonKey string
	var anon bool

	switch _, okAnon := queryString["anonymousKey"]; okAnon {
	case true:
		fmt.Sscan(queryString["anonymousKey"][0], &anonKey)
		switch anonKey {
		case anonymousKeyPass:
			anon = false
		default:
			anon = true
		}
	default:
		anon = true
	}

	var bids []Bid
	var errMsg string

	// Run db GetTopClassBidsByStatus function
	bids, errMsg = GetTopClassBidsByStatus(db, classID, semesterStartDate, paxNo, status, anon)
	switch errMsg {
	case "":
		// Return bids array
		json.NewEncoder(w).Encode(bids)
	default:
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	}
}

// Update every student's name once a saturday
func UpdateNames(db *sql.DB) {
	errMsg, students := GetStudents()
	switch errMsg {
	case "Success":
		for _, value := range students {
			UpdateStudentName(db, value.StudentID, value.Name)
		}
	default:
	}

}

//==================== Main ====================
func main() {

	// Open connection
	var err error
	db, err = sql.Open("mysql", "root:asg2_bid_database@tcp(asg2-biddatabase:3306)/asg2_bids")

	// Handle error
	switch err {
	case nil:
	default:
		panic(err.Error())
	}

	// Define url functions
	router := mux.NewRouter()

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type"})

	originsOk := handlers.AllowedOrigins([]string{"*"})

	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})

	router.HandleFunc("/api/v1/bids", CreateBidRecord).Methods("POST")
	router.HandleFunc("/api/v1/bids/{bidID}", GetBidRecordByBidID).Methods("GET")
	router.HandleFunc("/api/v1/bids/{bidID}", UpdateBidRecord).Methods("PUT")
	router.HandleFunc("/api/v1/bids/{bidID}", DeleteBidRecord).Methods("DELETE")
	router.HandleFunc("/api/v1/bids", GetBidQueryStringValidator).Methods("GET")

	fmt.Println("Bid Service operating on port 9221")
	log.Fatal(http.ListenAndServe(":9221", handlers.CORS(originsOk, headersOk, methodsOk)(router)))

	// Update every student's name once a saturday
	c := cron.New()
	c.AddFunc("@weekly", func() { UpdateNames(db) })
	c.Start()
	c.Stop() // Stop the scheduler (does not stop any jobs already running).
}
