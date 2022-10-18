const express = require("express");
const cors = require("cors");
const { hashSync } = require("bcryptjs");

const app = express();

require('dotenv').config({path: './.env'});

const port = process.env.PORT || 3000


const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL);
connection.connect()

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Kraigslist Application" });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.get('/getallusers', (req, res) => {
  connection.query('SELECT * FROM users', function (err, rows, fields) {
    if (err) throw err

    res.send(rows)
  })
})

app.get('/getallposts', (req, res) => {
  connection.query('SELECT * FROM posts', function (err, rows, fields) {
    if (err) throw err

    res.send(rows)
  })
})

//hashSync();