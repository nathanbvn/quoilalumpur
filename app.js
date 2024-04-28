var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mysql = require('mysql2');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var app = express();
const bodyParser = require('body-parser');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const addQuizRouter = require('./routes/add_quiz');
app.use('/', addQuizRouter);

const  password = "PASSWORD";

const jwt = require('jsonwebtoken');
const secretKey = 'SECRETKEY'; 

bcrypt 
 .genSalt(saltRounds) 
 .then(salt => { 
 console.log('Output 1 | Salt: ' + salt); 
 return bcrypt.hash(password, salt); 
 }) 
 .then(hash => { 
 console.log('Output 1 | Hash: ' + hash); 
 }) 
 .catch(err => console.error(err.message));

 
bcrypt 
 .hash(password, saltRounds) 
 .then(hash => { 
  console.log('Output 2 | Hash: ' + hash); 
 }) 
 .catch(err => console.error(err.message)); 


bcrypt 
 .hash(password, saltRounds) 
 .then(hash => { 
 userHash = hash; 
 console.log('Output 3 | Hash ', hash); 
 validateUser(hash); 
 }) 
 .catch(err => console.error(err.message)); 


function validateUser(hash) { 
 bcrypt 
  .compare(password, hash) 
  .then(res => { 
   console.log(res); // returns true 
  }) 
 .catch(err => console.error(err.message)); 
} 


function generateToken(username) { 
    const payload = { username }; //objet contenant username
    const options = { expiresIn: '20s' }; //Options pour le jeton Token expiration time 
    return jwt.sign(payload, secretKey, options); //retourne un jeton signé pour authentification
   }


function verifyToken(token) { //prend une chaine jeton
    try { 
    const decoded = jwt.verify(token, secretKey); //token decoded if authentification successful
    return decoded.username; //return decoded token name
    } catch (err) { 
    return null; // Token is invalid or expired 
    } 
   } 


const db = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 password: 'root',
 database: 'quiz_items',
});
db.connect((err) => {
 if (err) {
 console.error('Database connection failed:', err);
 } else {
 console.log('Connected to the database');
 }
});

app.get('/choice',(req,res)=>{
  res.redirect('/index')
})
app.post('/choice', (req, res) => {
 db.query('SELECT * FROM quizz', (err, results) => {
 if (err) throw err;
 res.render('choice', { quizz: results });
 });
});

app.post('/play',(req,res)=>{
  const {quizz_id} = req.body;
  console.log(quizz_id);
  db.query('SELECT * FROM questions WHERE id_quizz = ?', [quizz_id], (err, results) => {
  if (err) throw err;
  console.log('Rendering template')
  res.render('play', { questions: results, quizz_id });
 });
})

app.get('/play',(req,res)=>{
  res.redirect('index');
})

app.post('/results',(req,res)=>{
  const {score, quizz_id} = req.body;
  db.query('SELECT COUNT(*) as count FROM questions WHERE id_quizz = ?',[quizz_id],(err,results)=>{
    if (err) throw err;
    const nb_question = results[0].count;
    res.render('results',{nb_question, score})
  })
})



//salome

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/index', (req, res) => {
  res.render('index');
});

app.get('/info', (req, res) => {
    const token = req.cookies.jwtToken; // Get token from cookie
    if (!token) {
      res.redirect('/login');
      return;
    }
  
    // Verify token
    try {
      const decoded = jwt.verify(token, secretKey);
      // If valid token, can go to ressource
      res.render('info');
    } catch (err) {
      // If invalid token user goes to login page
      res.redirect('/login');
    }
  })

app.get('/register2', (req, res) => {
  res.render('register2', { errorMessage: "User not found" });
});

app.get('/login2', (req, res) => {
  res.render('login2', { errorMessage: "Incorrect password" });
});

app.get('/admin', (req, res) => {
  res.redirect('index');
});

app.get('/add_quiz', (req, res) => {
  res.render('add_quiz');
});

app.get('/edit', (req, res) => {
  res.render('edit');
});

app.get('/questions_form', (req, res) => {
  res.render('questions_form');
});

app.get('/quiz/:id', (req, res) => {
  const quizId = req.params.id;
  // Récupérez les détails du quiz depuis la base de données et affichez-les
  res.render('quiz', { quizId: quizId });
});

app.get('/delete_quiz', (req, res) => {
  res.render('delete_quiz');
});

app.get('/edit2', (req, res) => {
  res.render('edit2');
});



app.post('/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Nom d\'utilisateur :', username);

  bcrypt.genSalt(saltRounds)
    .then(salt => {
      console.log('Generated salt :', salt);
      return bcrypt.hash(password, salt);
    })
    .then(hash => {
      console.log('Hashed password :', hash);

      const query = 'INSERT INTO usr (mdp_user, username) VALUES (?, ?)';
      db.query(query, [hash, username], (err, results) => {
       if (err) {
        console.error(err.sqlMessage);
        res.status(500).send("Register Error");
       }else {
        res.redirect('/login');
       }
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).send("Registration error");
  });
});



const { v4: uuidv4 } = require('uuid');

function generateSessionID() {
  return uuidv4();
}




app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Username :', username);


  // User exists in db?
  const query = 'SELECT * FROM usr WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Login Error1");
    } else {
      if (results.length > 0) {
        // User exists, verify if password hashed ?
        const hashedPassword = results[0].mdp_user;
        const isAdmin = results[0].is_admin;

        bcrypt.compare(password, hashedPassword, (err, passwordMatch) => {
          if (err) {
            console.error(err);
            res.status(500).send("Login Error2");
          } else {
            if (passwordMatch) {
              // Correct password
              const token = generateToken(username);
              res.cookie('jwtToken', token, { maxAge: 20000, httpOnly: true });
              
              // Stock date and lastactivity of user
              const lastActivityTime = new Date().getTime();
              res.cookie('lastActivityTime', lastActivityTime, { httpOnly: true });

              if(isAdmin){
                res.render('admin');
              }
              else{
                 db.query('SELECT * FROM quizz', (err, results) => {
                 if (err) throw err;
                 res.render('choice', { quizz: results });
                 });
              }
            } else {
              res.redirect('/login2');
            }
          }
        });
      } else {
        res.redirect('/register2');//if user not found
      }
    }
  });
});





app.use((req, res, next) => {
const currentTime = new Date().getTime();
const lastActivityTime = req.cookies.lastActivityTime;

if (lastActivityTime && currentTime - lastActivityTime > 20000) {
    // More than 20sec, user disconnected
    res.clearCookie('jwtToken'); // Token delete from cookie
    res.clearCookie('lastActivityTime'); // Date deleted from cookie
    res.redirect('/login');
} else {
    // Update the latest activity of the user
    res.cookie('lastActivityTime', currentTime, { httpOnly: true });
    
    const token = req.cookies.jwtToken;
if (token) {
    try {
    const decoded = jwt.verify(token, secretKey);
    // Valid token, user's info can be stored on req.res
    req.user = decoded;
    } catch (err) {
    // Invalid token, user disconnected
    res.clearCookie('jwtToken'); // Token deleted from cookie
    res.clearCookie('lastActivityTime'); // Latest date deleted from cookie
    res.redirect('/login');
    return;
    }
}

next()
}
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));//rajouté

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
