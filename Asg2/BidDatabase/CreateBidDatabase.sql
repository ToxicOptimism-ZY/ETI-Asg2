CREATE TABLE Bid (
    BidID int NOT NULL AUTO_INCREMENT,
    SemesterStartDate varchar(10) NOT NULL,
	ClassID int NOT NULL,
	StudentID varchar(9) NOT NULL,
    StudentName varchar(100) NOT NULL,
    TokenAmount int NOT NULL,
    `Status` varchar(50) NOT NULL,
    PRIMARY KEY (BidID),
    UNIQUE (ClassID,StudentID)
);