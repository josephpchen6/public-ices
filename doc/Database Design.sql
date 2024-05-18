CREATE TABLE Users (
    Username VARCHAR(255),
    Password VARCHAR(255),
    IsAdmin BIT,
    PRIMARY KEY(Username)
);

INSERT INTO Users VALUES ("anonymous", "", 0);

CREATE TABLE Courses (
	CourseNumber VARCHAR(7),
	MostRecentYear SMALLINT UNSIGNED,
	MostRecentTerm VARCHAR(255),
	Department VARCHAR(255), 
	CourseName VARCHAR(255), 
	CreditHours TINYINT, 
	PRIMARY KEY(CourseNumber)
);

CREATE TABLE GPA (
	Year SMALLINT UNSIGNED,
	Term VARCHAR(7),
	CourseNumber VARCHAR(255), 
	ProfessorName VARCHAR(255), 
	A_count SMALLINT UNSIGNED,
	Am_count SMALLINT UNSIGNED,
	Bp_count SMALLINT UNSIGNED,
	B_count SMALLINT UNSIGNED,
	Bm_count SMALLINT UNSIGNED,
	Cp_count SMALLINT UNSIGNED,
	C_count SMALLINT UNSIGNED,
	Cm_count SMALLINT UNSIGNED,
	Dp_count SMALLINT UNSIGNED,
	D_count SMALLINT UNSIGNED,
	Dm_count SMALLINT UNSIGNED,
	F_count SMALLINT UNSIGNED,
	Average_GPA FLOAT(24),
	PRIMARY KEY(Year, Term, CourseNumber, ProfessorName)
);

CREATE TABLE Professors (
	ProfessorName VARCHAR(255), 
	Rating SMALLINT UNSIGNED,
	LastRankedTerm VARCHAR(7), 
	LastRankedYear SMALLINT UNSIGNED,
	PRIMARY KEY(ProfessorName)
);

CREATE TABLE Reviews (
	ReviewID INT AUTO_INCREMENT PRIMARY KEY,
	Username VARCHAR(255), 
	CourseNumber VARCHAR(255), 
	ProfessorName VARCHAR(255),
	Workload TINYINT,
	AmountLearned TINYINT, 
	Difficulty TINYINT, 
	InstructionQuality TINYINT, 
	Management TINYINT, 
	ReviewText TEXT
);

CREATE TABLE Favorites (
	Username VARCHAR(255);
	CourseNumber VARCHAR(255);
	ProfessorName VARCHAR(255);
	PRIMARY KEY (Username, CourseNumber)
);

DELIMITER //

CREATE PROCEDURE compareFavorites(IN Username varchar(255))
BEGIN
	DECLARE myWorkload FLOAT;
	DECLARE myRating FLOAT;

	SELECT AVG(r.Workload) INTO myWorkload
	FROM Favorites f LEFT JOIN Reviews r ON f.CourseNumber = r.CourseNumber
	WHERE f.Username = Username;

	SELECT AVG(p.Rating) INTO myRating
	FROM Favorites f LEFT JOIN Professors p ON f.ProfessorName = p.ProfessorName
	WHERE f.Username = Username;

	SELECT f.CourseNumber FROM Favorites f LEFT JOIN Reviews r ON f.CourseNumber = r.CourseNumber
	WHERE f.Username = Username AND r.Workload > myWorkload;

	SELECT f.ProfessorName FROM Favorites f LEFT JOIN Professors p ON f.ProfessorName = p.ProfessorName
	WHERE f.Username = Username AND p.Rating > myRating;
END//

CREATE PROCEDURE insertReview(IN user_name VARCHAR(255), IN course_number VARCHAR(255), IN prof_id VARCHAR(255),
	IN work_load TINYINT, IN amount_learned TINYINT, IN diff TINYINT, IN lec_qual TINYINT, IN manage TINYINT, IN review_text TEXT)
BEGIN
	START TRANSACTION;
		IF EXISTS (SELECT * FROM GPA WHERE course_number = CourseNumber AND prof_id = ProfessorName)
			AND EXISTS (SELECT * FROM Users WHERE user_name = Username) THEN
			INSERT INTO Reviews(UserName, CourseNumber, ProfessorName, Workload, AmountLearned, Difficulty, InstructionQuality, Management, ReviewText)
				VALUES (user_name, course_number, prof_id, work_load, amount_learned, diff, lec_qual, manage, review_text);
		ELSE
			ROLLBACK;
		END IF;
	COMMIT;
END//

CREATE TRIGGER one_review_per_user
BEFORE INSERT ON Reviews FOR EACH ROW
BEGIN
	IF EXISTS (SELECT 1 FROM Reviews WHERE Username != "anonymous" AND Username = NEW.Username AND CourseNumber = NEW.CourseNumber) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A review from this user already exists.';
	END IF;
END//

CREATE TRIGGER delete_corresponding_reviews
AFTER DELETE ON Users FOR EACH ROW
BEGIN
    DELETE FROM Reviews WHERE Username = OLD.Username;
END//

DELIMITER ;