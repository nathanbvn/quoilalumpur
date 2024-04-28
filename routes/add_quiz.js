const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const mysql = require('mysql2');
app.set('view engine', 'pug');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'quiz_items'
});



app.post('/add_quiz', (req, res) => {
  const quizTitle = req.body.name;
  // Insert the new quiz into the Quizz table
  const insertQuizQuery = 'INSERT INTO Quizz (name) VALUES (?)';
  db.query(insertQuizQuery, [quizTitle], (error, results) => {
    if (error) {
      console.error('Error inserting quiz:', error.message);
      res.status(500).send('Internal Server Error');
      return;
    }

    const id_quizz = results.insertId;

    // Redirect to a page for adding questions to the quiz
    res.redirect(`/questions_form/${id_quizz}`);
  });
});



app.get('/questions_form/:id_quizz', (req, res) => {
  const id_quizz = req.params.id_quizz;
  // Vous pouvez utiliser id_quizz dans le rendu de la page ou pour d'autres opérations
  res.render('questions_form', { id_quizz });
});



app.get('/quiz/:id', (req, res) => {
  const quizId = req.params.id;
  // Récupérez les détails du quiz depuis la base de données et affichez-les
  res.render('quiz', { quizId: quizId });
});




app.post('/questions_form/:id_quizz', (req, res) => {
  const id_quizz = req.params.id_quizz;
  console.log(req.params.id_quizz);
  const { question, prop1, prop2, prop3, bonne_rep, action } = req.body;
  console.log(req.body);  

  if (action === 'addQuestion') {
    const insertQuestionQuery = 'INSERT INTO Questions (question, prop1, prop2, prop3, bonne_rep, id_quizz) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuestionQuery, [question, prop1, prop2, prop3, bonne_rep, id_quizz], (error) => {
      if (error) {
        console.error('Error inserting question:', error.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.redirect(`/questions_form/${id_quizz}`);
    });
  } else if (action === 'finishQuiz') {
    const insertQuestionQuery = 'INSERT INTO Questions (question, prop1, prop2, prop3, bonne_rep, id_quizz) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuestionQuery, [question, prop1, prop2, prop3, bonne_rep, id_quizz], (error) => {
      if (error) {
        console.error('Error inserting question:', error.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      const firstTwoChars = prop1.substring(0, 2)
      db.query("UPDATE quizz SET name = ? WHERE id_quizz = ?", [firstTwoChars, id_quizz], (updateError) => {
        if (updateError) {
          console.error('Error updating quiz name:', updateError.message);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.render('admin');
      });
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

app.post('/admin',(req,res)=>{
  res.render('admin');
})

//post plutot

//USER PAGE FOR ADMIN (GAME)  


//EDIT QUIZ
app.post('/edit', (req, res) => {
  console.log("edit");
  db.query('SELECT * FROM quizz', (err, results) => {
  if (err) throw err;
  res.render('edit', { quizz: results });
  });
 });

app.get('/edit',(req,res)=>{
    res.redirect('/index')
})



app.post('/edit2', (req, res) => {
  const { id_quizz } = req.body;
  
  // Récupérer les détails du quiz et ses questions depuis la base de données
  const getQuizQuery = 'SELECT * FROM Quizz WHERE id_quizz = ?';
  const getQuestionsQuery = 'SELECT * FROM Questions WHERE id_quizz = ?';

  db.query(getQuizQuery, [id_quizz], (err, quizResults) => {
      if (err) throw err;

      db.query(getQuestionsQuery, [id_quizz], (err, questionResults) => {
          if (err) throw err;

          const quiz = quizResults[0];
          console.log("quiz infos:",quiz);
          console.log(quiz.name);
          const questions = questionResults;

          res.render('edit2', { quiz, questions });
      });
  });
});


app.post('/deleteQuestion', (req, res) => {
  const { id_question, id_quizz } = req.body;
  console.log(id_question);
  console.log(id_quizz);
    
    const deleteQuestionQuery = 'DELETE FROM Questions WHERE id_question = ?';

      db.query(deleteQuestionQuery, [id_question], (error) => {
        if (error) {
          console.error('Error deleting question:', error.message);
          res.status(500).send('Internal Server Error');
          return;
        }
              db.query('SELECT * FROM quizz', (err, results) => {
      if (err) throw err;
      res.render('edit', { quizz: results });
      });
      })
  ;})


  app.post('/addQuestion2', (req, res) => {
    const { id_quizz, newQuestion, prop1, prop2, prop3, bonne_rep } = req.body;
    
    const addQuestionQuery = `
    INSERT INTO Questions (question, prop1, prop2, prop3, bonne_rep, id_quizz) VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.query(addQuestionQuery, [newQuestion, prop1, prop2, prop3, bonne_rep, id_quizz], (error) => {
      if (error) {
        console.error('Error adding question:', error.message);
        res.status(500).send('Internal Server Error');
        return;
        };
    });
      db.query('SELECT * FROM quizz', (err, results) => {
      if (err) throw err;
      res.render('edit', { quizz: results });
      });
  });





  //MODIFY QUESTION
///////////////////////////////////////////////////////
app.post('/modifyQuestion', (req, res) => {
  const {newQuestion, newProp1, newProp2, newProp3, newBonneRep,id_quizz, id_question} = req.body;
  
  const updateQuestionQuery = `
      UPDATE questions
      SET question = ?, prop1 = ?, prop2 = ?, prop3 = ?, bonne_rep = ?
      WHERE id_question = ? AND id_quizz = ?
  `;

  db.query(updateQuestionQuery, [newQuestion, newProp1, newProp2, newProp3, newBonneRep, id_question,id_quizz], (error) => {
      if (error) {
          console.error('Error updating question:', error.message);
          res.status(500).send('Internal Server Error');
          return;
      }

      db.query('SELECT * FROM quizz', (err, results) => {
      if (err) throw err;
      res.render('edit', { quizz: results });
      });
  });
});

///////////////////////////////////////////////////  




//DELETE QUIZ
app.get('/delete_quiz',(req,res)=>{
  res.redirect('/index')
})
app.post('/delete_quiz', (req, res) => {
  db.query('SELECT * FROM quizz', (err, results) => {
  if (err) throw err;
  res.render('delete_quiz', { quizz: results });
  });
 });


 app.post('/deleteQuiz', (req, res) => {
  const { id_quizz } = req.body;
  console.log(id_quizz);
    
    const deleteQuestionsQuery = 'DELETE FROM Questions WHERE id_quizz = ?';

      db.query(deleteQuestionsQuery, [id_quizz], (error) => {
        if (error) {
          console.error('Error deleting questions:', error.message);
          res.status(500).send('Internal Server Error');
          return;
        }

        const deleteQuizQuery = 'DELETE FROM Quizz WHERE id_quizz = ?';
        db.query(deleteQuizQuery, [id_quizz], (error) => {
          if (error) {
            console.error('Error deleting quiz:', error.message);
            res.status(500).send('Internal Server Error');
            return;
          }

          db.query('SELECT * FROM quizz', (err, results) => {
        if (err) throw err;
        res.render('delete_quiz', { quizz: results });
        });
      });
    });
  });


module.exports = router;
module.exports = app;
