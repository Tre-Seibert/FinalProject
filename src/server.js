const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Cookie parser for storing creds
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//*** create form parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// This sql connection works for joe. Joe use this when working

//*** set up mysql connections
//  var mysql = require('mysql');


//  var con = mysql.createConnection({
//      host: "localhost",
//      user: "root",
//      password: "blubbins",  // use your own MySQL root password
//      database: "wanderlog"
//    });


// This sql connection works for Tre. Tre use this when working

var mysql = require('mysql2');

var con = mysql.createConnection({
 host: "localhost",
port: "3306",
 user: "root",
 password: "Alexemma1",
 database: "WanderLog"
});

//*** connect to the database
con.connect(function(err) {
  if (err)
      throw err;
  console.log("Connected to MySQL");
});

//---------------------------------------------------------------------------

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve home.html when /home is accessed
app.get('/home', (req, res) => {

    // get username from cookies
    const username = req.cookies.username;

    // handle case where username is not found
    if (!username) {
        res.status(401).send('Unauthorized');
        return;
    }

    res.sendFile(path.join(__dirname, '../public', 'home.html'));
});

// Serve login.html when /login is accessed
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Serve landing.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'landing.html'));
});

//---------------------------------------------------------------------------

app.post('/login', (req, res) => {
    const name = req.body.name;
    const usr = req.body.usr;
    const pwd = req.body.pwd;

    if (name) {
        // vars for registration queries
        const sqlQueryRegister = "INSERT INTO users (name, username, password) VALUES (?, ?, ?)";
        const values = [name, usr, pwd];

        // send query
        con.query(sqlQueryRegister, values, (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                res.status(500).send('Internal Server Error');
            } 
            else {
                console.log('User registered successfully.');
                
                // store user information in a cookie or session
                res.cookie('username', usr); 
                
                // redirect back home 
                res.redirect(`http://localhost:3000/home?usr=${usr}`);
            }
        });
    } 
    else {
        // vars for login query
        const sqlQueryLogin = "SELECT username FROM users WHERE username=? AND password=?";
        const values = [usr, pwd];

        // send login query
        con.query(sqlQueryLogin, values, (err, result) => {
            if (err) {
                console.error('Error logging in:', err);
                res.status(500).send('Internal Server Error');
            } 
            else if (result[0]) {
                console.log('User logged in successfully.');
                
                // store user information in a cookie or session
                res.cookie('username', usr);

                // redirect back to home
                res.redirect(`http://localhost:3000/home?usr=${usr}`);
            } 
            else {
                // send error message
                res.status(401).json({ message: "Username or password is incorrect. Please try again, or create an account" });
            }
        });
    }
});


//---------------------------------------------------------------------------

app.post('/home', (req, res) => {
    
    // extract data from the form submission
    const username = req.cookies.username; 
    const city = req.body.city;
    const country = req.body.country;
    const departureDate = req.body.departureDate;
    const returnDate = req.body.returnDate;
    const notes = req.body.notes;

    // validate that required fields are not null or empty
    if (!city || !country || !departureDate || !returnDate || !notes) {
        return res.status(400).send('Invalid form data. Please fill in all required fields.');
    }

    // Insert the form data into the database

    // var sql_query_cityid = "SELECT city_id FROM cities WHERE username='" + username + "' AND city_name='" + city + "';"
    // var sql_query_cmax = "SELECT MAX(city_id) AS max FROM cities WHERE username='" + username + "';"
    // var sql_query_cinput = "INSERT INTO cities (username, city_id, city_name, country) VALUES ('" + username + "', '" + city_id + "', '" + city + "', '" + country + "');"

    // var sql_query_vmax = "SELECT MAX(visit_number) AS max FROM visits WHERE username='" + username + "' AND city_id='" + city_id + "';"
    // var sql_query_vinput = "INSERT INTO visits (username, visit_number, city_id, start_date, end_date, notes) VALUES ('" + username + "', '" + visit_number + "', '" + city_id + "', '" + start + "', '" + end + "', '" + notes + "');"

    const sqlQuery = `INSERT INTO visits (username, city, country, depart_date, return_date, notes) VALUES (?, ?, ?, ?, ?, ?)`;
                    
    const values = [username, city, country, departureDate, returnDate, notes]; 

    con.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Data inserted into the database successfully.');
            // redirect the user back to the home page
            res.redirect(`http://localhost:3000/home?usr=${username}`);
        }
    });
});


//app.get('/home', (req, res) => {});