var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
const bcrypt = require('bcrypt');

var connection = mysql.createConnection({
    host: 'HOST_NAME',
    user: 'USER',
    password: 'PASSWORD',
    database: 'DATABASE'
});
connection.connect;

var app = express();

// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

app.get('/', function(req, res) {
  res.render('inflation', { title: 'GPA Inflation' });
});

app.get('/reviews', function(req, res) {
  res.render('reviews', { title: 'Add a Review' });
});
 
app.get('/login', function(req, res) {
  res.render('login', { title: 'Login' });
});

app.get('/favorites', function(req, res) {
  res.render('favorites', { title: 'Favorites' });
});

app.get('/account', function(req, res) {
  res.render('account', { title: 'Account' });
});

app.get('/success', function(req, res) {
  res.send({'message': 'Professors Viewed Successfully!'});
});
  
app.get('/api/gpa_inflation', function(req, res) {
  var sql = "SELECT Year, Term, GPA.ProfessorName, Average_GPA, Rating " +
            "FROM GPA NATURAL JOIN Courses LEFT JOIN Professors ON GPA.ProfessorName = Professors.ProfessorName";
  if (req.query.courseNumber) {
    sql += ` WHERE GPA.CourseNumber = '${req.query.courseNumber}'`;
    if (req.query.year) {
      sql += ` AND GPA.Year >= ${req.query.year}`;
    }
  }
  sql += " ORDER BY Year DESC LIMIT 100";
  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching GPA data:', err);
      res.status(500).send({ message: 'Error fetching GPA data', error: err });
      return;
    }
    res.json(results);
  });
});

app.get('/api/course_search', function(req, res) {
  var sql = "SELECT DISTINCT CourseNumber, ProfessorName FROM GPA WHERE ";
  if (req.query.courseNumber) {
    sql += `CourseNumber = '${req.query.courseNumber}'`;
  }
  if (req.query.professorName) {
    if (req.query.courseNumber) {
      sql += " AND ";
    }
    sql += `ProfessorName LIKE '%${req.query.professorName}%'`;
  }
  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching course data:', err);
      res.status(500).send({ message: 'Error fetching course data', error: err });
      return;
    }
    res.json(results);
  });
});

app.get('/api/compare_favorites', function(req, res) {
  var sql = `CALL compareFavorites('${req.query.username}')`

  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching course data:', err);
      res.status(500).send({ message: 'Error fetching course data', error: err });
      return;
    }
    res.json(results);
  });
});

app.get('/api/show_favorites', function(req, res) {
  var sql = `SELECT CourseNumber, ProfessorName FROM Favorites WHERE Username = '${req.query.username}'`

  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching course data:', err);
      res.status(500).send({ message: 'Error fetching course data', error: err }); 
      return;
    }
    res.json(results);
  });
});

app.post('/api/remove_favorite', function(req, res) {
  var sql = `DELETE FROM Favorites WHERE Username = '${req.body.username}' AND CourseNumber = '${req.body.courseNumber}' AND ProfessorName = '${req.body.professorName}'`

  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching course data:', err);
      res.status(500).send({ message: 'Error fetching course data', error: err }); 
      return;
    }
    res.send('Form data received successfully');
  });
});

app.post('/api/add_favorite', function(req, res) {


  const sql = `INSERT INTO Favorites VALUES ("${req.body.username}", "${req.body.courseNumber}", "${req.body.professorName}")`;

  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send({ message: 'Error fetching data', error: err });
      return;
    }
    res.send('Form data received successfully');
  });
});

app.get('/api/course_overview', function(req, res) {

  const sql = "SELECT CourseName, CreditHours, Rating, "+
              "(4*SUM(Ap_count)+4*SUM(A_count)+3.67*SUM(Am_count)+3.33*SUM(Bp_count)+3*SUM(B_count)+ 2.67*SUM(Bm_count)+"+
                "2.33*SUM(Cp_count)+2*SUM(C_count)+1.67*SUM(Cm_count)+1.33*SUM(Dp_count)+SUM(D_count)+0.67*SUM(Dm_count))/"+
                  "(SUM(Ap_count)+SUM(A_count)+SUM(Am_count)+SUM(Bp_count)+SUM(B_count)+SUM(Bm_count)+SUM(Cp_count)+"+
                    "SUM(C_count)+SUM(Cm_count)+SUM(Dp_count)+SUM(D_count)+SUM(Dm_count)+SUM(F_count)) AS Cumulative_GPA "+
                      "FROM GPA NATURAL JOIN Courses LEFT OUTER JOIN Professors ON Professors.ProfessorName = GPA.ProfessorName "+
                        `WHERE CourseNumber = '${req.query.courseNumber}' AND GPA.ProfessorName = '${req.query.professorName}' `+
                          "GROUP BY GPA.ProfessorName, CourseNumber;"

  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching professor data:', err);
      res.status(500).send({ message: 'Error fetching professor data', error: err });
      return;
    }
    res.json(results); 
  });
});

app.get('/api/reviews', function(req, res) {

  const sql = `SELECT * FROM Reviews WHERE CourseNumber = '${req.query.courseNumber}'
                AND ProfessorName = '${req.query.professorName}'`
                
  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching review data:', err);
      res.status(500).send({ message: 'Error fetching review data', error: err });
      return;
    }
    res.json(results); 
  });
});

app.post('/api/add_review', function(req, res) {

  const sql = `CALL insertReview('${req.body.username}','${req.body.courseNumber}','${req.body.professorName}',`+
                `${req.body.workload},${req.body.amountLearned},${req.body.difficulty},${req.body.instructionQuality},`+
                  `${req.body.management},'${req.body.comments}');`

  connection.query(sql, function(err, results) {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send({ message: 'Error fetching data', error: err });
      return;
    }
    res.send('Form data received successfully');
  });
});

app.post('/api/create_account', (req, res) => {

  connection.query(`SELECT * FROM Users WHERE Username = "${req.body.username}"`, function(err, result) {
    if (err) {
      console.error('Error checking username uniqueness:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length != 0) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).send({ error: 'Internal server error' });
      }

      connection.query(`INSERT INTO Users VALUES ("${req.body.username}", "${hash}", 0)`, function(err, result) {
        if (err) {
          console.error('Error storing password:', err);
          res.status(500).send({ error: 'Username already exists!' });
          return;
        }
        res.send('Password stored successfully');
      });
    });
  });
});

app.post('/api/login', function(req, res) {
  
  connection.query(`SELECT * FROM Users WHERE Username = "${req.body.username}"`, function(err, result) {
    if (err || result.length == 0) {
      console.error('Error logging in:', err);
      res.status(500).send({ message: 'Invalid username/password!', error: err });
      return;
    }
    bcrypt.compare(req.body.password, result[0].Password, (bcryptErr, result) => {
      if (bcryptErr || !result) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      res.send({ message: 'Login successful' });
    });
  });
});

app.post('/api/delete_account', (req, res) => {

  connection.query(`DELETE FROM Users WHERE Username = "${req.body.username}"`, function(err, result) {
    if (err) {
      console.error('Error checking username uniqueness:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.send({ message: 'Deletion successful' });
  });
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});