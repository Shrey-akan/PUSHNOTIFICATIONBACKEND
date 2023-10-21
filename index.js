const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const admin = require('firebase-admin'); // Import the Firebase Admin SDK
const cors = require('cors');
const User = require('./models/userModel');
const fs = require('fs');
const https =  require('https');

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: ['https://rocknwoods.website:3001','http://localhost:3001'], // Set the allowed origin (the URL of your React frontend)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed HTTP methods
  preflightContinue: false, // Disable preflight requests
  optionsSuccessStatus: 204, // Set the status code for successful preflight requests
  allowedHeaders: 'Content-Type, Authorization', // Specify allowed headers
  credential:true
};
app.use(cors(corsOptions));


const privkey = fs.readFileSync('/etc/letsencrypt/live/rocknwoods.website/privkey.pem','utf-8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/rocknwoods.website/fullchain.pem','utf-8');
const credential ={
  key:privkey,
  cert:certificate
};



const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
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


// Initialize the Firebase Admin SDK with your service account credentials
const serviceAccount = require("./service-account-key.json"); // Replace with the path to your service account key JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pushnotification-bbb51-default-rtdb.firebaseio.com', // Replace with your Firebase project's database URL
});

app.use(bodyParser.json());

app.post('/api/users', (req, res) => {
  const { token, id, phoneNumber } = req.body;

  if (!token || !id || !phoneNumber) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  db.query(
    'INSERT INTO users (token, id, phoneNumber) VALUES (?, ?, ?)',
    [token, id, phoneNumber],
    (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.error('Duplicate token:', token);
          res.status(400).json({ message: 'Token already exists' });
        } else {
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

app.post('/send-notification', async (req, res) => {
  const { token, data } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const message = {
      notification: {
        title: 'Jay shree shyam ji baba ki jai ho mata di jai ho jai ho  ',
        body: 'Hello',
      },
      data: data,
      token: token,
    };

    const response = await admin.messaging().send(message);

    console.log('Successfully sent message:', response);
    res.status(200).json({ message: 'Notification request sent successfully' });
  } catch (error) {
    console.error('Error sending FCM message:', error);
    res.status(500).json({ message: 'Error sending FCM message' });
  }
});

app.get('/api/user', (req, res) => {
  db.query('SELECT * FROM users', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.status(200).json(results);
    }
  });
});



const httpsServer = https.createServer(credential,app);
httpsServer.listen(3000,()=>{
  console.log("server started on 3000");
})