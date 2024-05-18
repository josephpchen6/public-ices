import pandas as pd

term_dict = {"fa" : "Fall", "sp" : "Spring", "su" : "Summer"}

def _ProfessorsTermSplitter(term_string):
    term, year = term_string[:2], term_string[2:]
    return term_dict[term], int(year)

def ExcellentProfessorsParser(filename):
    teachers = pd.read_csv(filename, usecols = [0, 2, 3, 4, 5])
    teachers = teachers[teachers["role"] == "Instructor"]

    teachers["ranking"] = teachers["ranking"].map({"Excellent" : 1, "Outstanding" : 2})
    teachers["lname"] = teachers["fname"] + " " + teachers["lname"].str.replace(r" |-", "")
    teachers = teachers.groupby(["lname"]).agg({"term" : "last", "ranking" : "sum"})

    teachers[["Last_Ranked_Term", "Last_Ranked_Year"]] = teachers["term"].apply(_ProfessorsTermSplitter).apply(pd.Series)
    teachers.drop(columns = ["term"], inplace = True)
    teachers.to_csv("Professors.csv")

def _GPAInstructorSplitter(instructor_string):
    raw_last, first = instructor_string.split(", ", 1)
    last = ""
    for char in raw_last:
        if char == " ":
            break
        elif char == "-":
            continue
        last += char.upper()
    return first[0] + " " + last

def GPAParser(filename):
    gpa = pd.read_csv(filename, usecols = [0, 1, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21])
    gpa.dropna(subset = ["Primary Instructor"], inplace = True)
    gpa["Subject"] += gpa["Number"].astype("string")
    gpa["Number"] = gpa["Primary Instructor"].apply(_GPAInstructorSplitter)
    gpa = gpa.groupby(["Year", "Term", "Subject", "Number"]).agg({"A+" : "sum", "A" : "sum", "A-" : "sum", "B+" : "sum", "B" : "sum",
            "B-" : "sum", "C+" : "sum", "C" : "sum", "C-" : "sum", "D+" : "sum", "D" : "sum", "D-" : "sum", "F" : "sum"})
    gpa.index.names = ["Year", "Term", "Course_Number", "Professor"]
    gpa["Average GPA"] = round((4*gpa["A+"] + 4*gpa["A"] + 3.67*gpa["A-"] + 3.33*gpa["B+"] + 3*gpa["B"] + 2.67*gpa["B-"] +
                            2.33*gpa["C+"] + 2*gpa["C"] + 1.67*gpa["C-"] + 1.33*gpa["D+"] + gpa["D"] + 0.67*gpa["D-"])\
                                / (gpa["A+"] + gpa["A"] + gpa["A-"] + gpa["B+"] + gpa["B"] + gpa["B-"] + gpa["C+"]
                                    + gpa["C"] + gpa["C-"] + gpa["D+"] + gpa["D"] + gpa["D-"] + gpa["F"]), 2)
    gpa.to_csv("GPA.csv")

def CourseParser(filename):
    courses = pd.read_csv(filename, usecols = [0, 1, 3, 4, 5, 7])
    courses["Number"] = courses["Subject"] + courses["Number"].astype("string")
    courses.drop_duplicates(subset = ["Number"], inplace = True)
    courses["Credit Hours"] = courses["Credit Hours"].map({"0 hours." : 0, "1 hours." : 1, "2 hours." : 2, "3 hours." : 3, "4 hours." : 4})
    courses.rename({"Year" : "Most_Recent_Year", "Term" : "Most_Recent_Term", "Number" : "Course_Number", "Name" : "Course_Name"}, axis = 1, inplace = True)
    courses.set_index("Course_Number", inplace = True)
    courses.to_csv("Courses.csv")

ExcellentProfessorsParser("excellent_teachers_2023.csv")
GPAParser("uiuc-gpa-dataset.csv")
CourseParser("course-catalog.csv")