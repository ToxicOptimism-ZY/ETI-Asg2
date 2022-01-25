CREATE database asg2_bids;

USE asg2_bids;

CREATE TABLE Bid (
    BidID int NOT NULL AUTO_INCREMENT,
    SemesterStartDate varchar(10) NOT NULL,
	ClassID int NOT NULL,
	StudentID varchar(10) NOT NULL,
    StudentName varchar(100) NOT NULL,
    TokenAmount int NOT NULL,
    `Status` varchar(50) NOT NULL,
    PRIMARY KEY (BidID),
    UNIQUE (ClassID,StudentID)
);

INSERT INTO Bid (SemesterStartDate, ClassID, StudentID, StudentName, TokenAmount, `Status`) VALUES 
('01-02-2022', 4, 'S10196983G', 'Yap Zhao Yi', 33, 'Pending');

Select * from bid