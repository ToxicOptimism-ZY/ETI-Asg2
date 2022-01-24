package main

//==================== Imports ====================
import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
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

var db *sql.DB

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

//==================== Database functions ====================

/*
Create (4) - DB Done
Read by Bid ID - DB Done
Update by Bid ID (5) - DB Done
Delete by Bid ID (5) - DB Done
Read all bids by student ID and SemesterStartDate (5, 8) - DB Done
Read all bids by Class ID and SemesterStartDate and PaxNo (If paxNo not supplied, Get all) (6) - DB Done

4. Create bid for a class -> /api/bids POST
5. View own bids, edit and delete appropriately  /api/bids/StudentID={studentID}
6. View all anonymized bids of classes (show self tho)

 /api/bids/ClassID={classID} and pax={paxNo} and Semester = {semesterStartDate}
 /api/bids/ClassID={classID} and Semester = {semesterStartDate}

7. View all bids of classes?

8. Show results of bidding /api/bids/StudentID={studentID}, Semester = {semesterStartDate}


9. Clear Bidding ? Unlikely

*/

func CreateBid(db *sql.DB, b Bid) {

	// BidID is auto incremented
	query := fmt.Sprintf("INSERT INTO Bid (SemesterStartDate, ClassID, StudentID, StudentName, TokenAmount, `Status`) VALUES ('%s','%d','%s', '%s','%d', '%s')",
		b.SemesterStartDate, b.ClassID, b.StudentID, b.StudentName, b.TokenAmount, b.Status)

	_, err := db.Query(query)

	if err != nil {
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
func UpdateBid(db *sql.DB, bidID int, b Bid) {
	// Update all details
	query := fmt.Sprintf("UPDATE Bid SET SemesterStartDate = '%s', ClassID = '%d', StudentID = '%s', StudentName = '%s', TokenAmount = '%d', `Status` = '%s' WHERE BidID = %d",
		b.SemesterStartDate, b.ClassID, b.StudentID, b.StudentName, b.TokenAmount, b.Status, bidID)

	_, err := db.Query(query)
	if err != nil {
		panic(err.Error())
	}
}

// Delete bid details by Bid ID
func DeleteBid(db *sql.DB, bidID int) string {
	query := fmt.Sprintf("DELETE FROM Bid WHERE BidID=%d", bidID)

	_, err := db.Query(query)
	var errMsg string

	if err != nil {
		errMsg = "Trip does not exist"
	}
	return errMsg
}

// Get list of bids by studentID and semester
func GetStudentBids(db *sql.DB, studentID string, semesterStartDate string) ([]Bid, string) {
	query := fmt.Sprintf("SELECT * FROM Bid where StudentID = '%s' and SemesterStartDate = '%s'", studentID, semesterStartDate)

	// Get all results
	results, err := db.Query(query)

	if err != nil {
		panic(err.Error())
	}

	var bids []Bid
	errMsg := "placeholder" //Temporary placeholder till any results existing determined

	// Loop through results
	for results.Next() {
		// Map a row to a Bid
		var bid Bid
		err := results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status)
		if err != nil {
			panic(err.Error())
		}

		errMsg = ""
		// Append mapped bid to bid array
		bids = append(bids, bid)
	}

	// If no result
	if errMsg != "" {
		errMsg = "No bids made by student that semester"
	}

	return bids, errMsg
}

// Get a list of bids length of PaxNo by Class ID, SemesterStartDate in highest to lowest TokenAmount
func GetTopClassBids(db *sql.DB, classID int, semesterStartDate string, paxNo int) ([]Bid, string) {

	var query string

	switch paxNo {
	case -1:
		query = fmt.Sprintf("SELECT * FROM Bid where ClassID = '%d' and SemesterStartDate = '%s' Order By TokenAmount DESC", classID, semesterStartDate)
	default:
		query = fmt.Sprintf("SELECT * FROM Bid where ClassID = '%d' and SemesterStartDate = '%s' Order By TokenAmount DESC Limit '%d'", classID, semesterStartDate, paxNo)
	}

	// Get all results
	results, err := db.Query(query)

	if err != nil {
		panic(err.Error())
	}

	var bids []Bid
	errMsg := "placeholder" //Temporary placeholder till any results existing determined

	// Loop through results
	for results.Next() {
		// Map a row to a Bid
		var bid Bid
		err := results.Scan(&bid.BidID, &bid.SemesterStartDate, &bid.ClassID, &bid.StudentID, &bid.StudentName, &bid.TokenAmount, &bid.Status)
		if err != nil {
			panic(err.Error())
		}

		errMsg = ""
		// Append mapped bid to bid array
		bids = append(bids, bid)
	}

	// If no result
	if errMsg != "" {
		errMsg = "No bids made for class that semester"
	}

	return bids, errMsg
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

	if err == nil { // If no error

		// Map json to trip
		var bid Bid
		json.Unmarshal([]byte(reqBody), &bid)

		// Check if all non-null information exist
		if bid.SemesterStartDate == "" || bid.ClassID == 0 || bid.StudentID == "" || bid.StudentName == "" || bid.TokenAmount == 0 || bid.Status == "" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			w.Write([]byte("422 - Please supply all neccessary bid information "))
		} else { // all not null
			// Run db CreateBid function
			CreateBid(db, bid)
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("201 - Bid created for: " + strconv.Itoa(bid.ClassID) + " at " + strconv.Itoa(bid.TokenAmount)))
		}

	} else { //incorrect format
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
	fmt.Sscan(params["BidID"], &bidID)

	var bid Bid
	var errMsg string

	// Run db GetBid function
	bid, errMsg = GetBid(db, bidID)
	if errMsg == "Bid does not exist" {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	} else {
		// Return trip
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

	if err == nil {
		// Retrieve new object
		var bid Bid
		json.Unmarshal([]byte(reqBody), &bid)

		// Check non-nullable attributes are not null
		if bid.SemesterStartDate == "" || bid.ClassID == 0 || bid.StudentID == "" || bid.StudentName == "" || bid.TokenAmount == 0 || bid.Status == "" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			w.Write([]byte("422 - Please supply all bid information "))
		} else { // All not null
			// Run db UpdateBid function
			UpdateBid(db, bidID, bid)
			w.WriteHeader(http.StatusAccepted)
			w.Write([]byte("202 - Bid details updated"))
		}

	} else {
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

	// Run db DeleteBid function
	errMsg := DeleteBid(db, bidID)
	if errMsg == "Bid does not exist" {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - No bid found"))
	} else {
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

	// If student ID and semester start date passed in, get all student bid records
	if okStudent && okSemester {
		// Run HTTP GetStudentBidRecords function
		GetStudentBidRecords(w, r)
		return
	} else if okClass && okSemester { // If class ID and semester start date passed in, get top bids
		// Run HTTP GetTopClassBidRecords function
		GetTopClassBidRecords(w, r)
		return
	} else { //else no appropriate function
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - Required parameters not found"))
		return
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
	if errMsg != "" {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	} else {
		// Return trips array
		json.NewEncoder(w).Encode(bids)
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

	// Get query string parameters of passenger ID and status
	queryString := r.URL.Query()
	var classID int
	fmt.Sscan(queryString["classID"][0], &classID)
	var semesterStartDate string
	fmt.Sscan(queryString["semesterStartDate"][0], &semesterStartDate)
	var paxNo int

	switch _, okClass := queryString["paxNo"]; okClass {
	case true:
		fmt.Sscan(queryString["paxNo"][0], &paxNo)
	default:
		paxNo = -1
	}

	var bids []Bid
	var errMsg string

	// Run db GetTopClassBids function
	bids, errMsg = GetTopClassBids(db, classID, semesterStartDate, paxNo)
	if errMsg != "" {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 - " + errMsg))
	} else {
		// Return trips array
		json.NewEncoder(w).Encode(bids)
	}
}

//==================== Main ====================
func main() {

	// Open connection
	var err error
	db, err = sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/asg2")

	// Handle error
	if err != nil {
		panic(err.Error())
	}

	// Define url functions
	router := mux.NewRouter()

	router.HandleFunc("/api/v1/bids", CreateBidRecord).Methods("POST")
	router.HandleFunc("/api/v1/bids/{bidID}", GetBidRecordByBidID).Methods("GET")
	router.HandleFunc("/api/v1/bids/{bidID}", UpdateBidRecord).Methods("PUT")
	router.HandleFunc("/api/v1/bids/{bidID}", DeleteBidRecord).Methods("DELETE")
	router.HandleFunc("/api/v1/bids", GetBidQueryStringValidator).Methods("GET")

	fmt.Println("Bid Service operating on port 9221")
	log.Fatal(http.ListenAndServe(":9221", router))

}
