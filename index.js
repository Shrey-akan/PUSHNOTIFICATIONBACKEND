const express = require('express');
const mysql = require('mysql2'); // Import the mysql2 library
const bodyParser = require('body-parser');
const User = require('./models/userModel');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: 'http://localhost:3001', // Set the allowed origin (the URL of your React frontend)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed HTTP methods
  preflightContinue: false, // Disable preflight requests
  optionsSuccessStatus: 204, // Set the status code for successful preflight requests
  allowedHeaders: 'Content-Type, Authorization', // Specify allowed headers
};
app.use(cors(corsOptions));
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'pushnotification',                                                                                                                                   
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.use(bodyParser.json());

// Create a new user
// app.post('/api/users', async (req, res) => {
//   try {
//     const { token, id, phoneNumber } = req.body;
//     if (!token || !id || !phoneNumber) {
//       return res.status(400).json({ message: 'Please provide all required fields' });
//     }

//     // Use SQL queries to insert data into MySQL
//     db.query('INSERT INTO users (token, id, phoneNumber) VALUES (?, ?, ?)', [token, id, phoneNumber], (error, results) => {
//       if (error) {
//         res.status(400).json({ message: 'Error creating the user' });
//         // res.json({token,id,phoneNumber});
//         console.log(token,id,phoneNumber);
//       } else {
//         res.status(201).json({ token, id, phoneNumber });
//       }
//     });
//   } catch (error) {
//     res.json({ message: 'Error creating the user' });
//   }
// });
app.post('/api/users', (req, res) => {
  const { token, id, phoneNumber } = req.body;

  if (!token || !id || !phoneNumber) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Use SQL queries to insert data into MySQL
db.query(
  'INSERT INTO users (token, id, phoneNumber) VALUES (?, ?, ?)',
  [token, id, phoneNumber],
  (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        // Handle the case where the token is a duplicate
        console.error('Duplicate token:', token);
        res.status(400).json({ message: 'Token already exists' });
      } else {
        // Handle other database errors
        console.error('Error creating the user:', error);
        res.status(400).json({ message: 'Error creating the user' });
      }
    } else {
      console.log('User created:', { token, id, phoneNumber });
      res.status(201).json({ token, id, phoneNumber });
    }
  }
);

});
app.get('/api/user', (req, res) => {
  // Fetch data from MySQL and send it as JSON
  db.query('SELECT * FROM users', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.status(200).json(results);
    }
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
