// Load environment variables from .env file
require("dotenv").config();
const mysql = require("mysql2");

// Debugging: Log environment variables to ensure they are loaded
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to MySQL");
});


// const mysql = require('mysql');
// require('dotenv').config();

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'users',
// });

// connection.connect(function(error){
// 	if(error)
// 	{
// 		throw error;
// 	}
// 	else
// 	{
// 		console.log('MySQL Database is connected Successfully');
// 	}
// });

// module.exports = connection;
