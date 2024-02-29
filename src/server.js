const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const https = require('https');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Load SSL certificate files
const privateKey = fs.readFileSync('/etc/nginx/ssl/key1.key', 'utf8');
const certificate = fs.readFileSync('/etc/nginx/ssl/cert1.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server with your Express app
const httpsServer = https.createServer(credentials, app);

// listen on port 3000
httpsServer.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at https://192.168.1.164:${port}`);
});
// cookie parser for storing creds
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// create form parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// generate a random secret key for session
const secretKey = crypto.randomBytes(32).toString('hex');

// use the express-session middleware for session mgmt.
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    //  session expires after 30 minutes of inactivity
    cookie: { maxAge: 1800000 }
}));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});


// This sql connection works for joe. Joe use this when working

// //*** set up mysql connections
//    var mysql = require('mysql');

//    var con = mysql.createConnection({
//        host: "localhost",
//        user: "root",
//        password: "blubbins", 
//        database: "wanderlog"
//      });


// This sql connection works for Tre. Tre use this when working

var mysql = require('mysql2'); // this sql library must be used to work on tres mac
const { Console } = require('console');



// connect to the database
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

    // Check if the user is logged in (session contains username)
    if (!req.session.username) {
        res.redirect('/login');
        return;
    }

    // handle case where username is not found
    if (!username) {
        res.redirect('/login');
        return;
    }

    res.sendFile(path.join(__dirname, '../public', 'home.html'));
});

// Serve login.html when /login is accessed
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Serve logout route
app.post('/logout', (req, res) => {
    // destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Logout successful');
            // respond with a success message or status
            res.status(200).send('Logout successful');
        }
    });
});


// Serve landing.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'landing.html'));
});

//---------------------------------------------------------------------------
// Handles post during login
//---------------------------------------------------------------------------
app.post('/login', async (req, res) => {
    // get the name, username, password from call
    const name = req.body.name;
    const usr = req.body.usr;
    const pwd = req.body.pwd;

    // check if name is present
    if (name) {
        // vars for registration queries. 10 is num of salt rounds
        const hashedPassword = await bcrypt.hash(pwd, 10);

        // construct query
        const sqlQueryRegister = "INSERT INTO users (name, username, password) VALUES (?, ?, ?)";
        const values = [name, usr, hashedPassword];

        // send query
        con.query(sqlQueryRegister, values, (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('User registered successfully.');

                // store user information in a cookie or session
                res.cookie('username', usr);
                req.session.username = usr;

                // redirect back home
                res.redirect(`https://wanderlog.treseibert.com/home?usr=${usr}`);
            }
        });
    } else {
        // vars for login query
        const sqlQueryLogin = "SELECT username, password FROM users WHERE username=?";
        const values = [usr];

        // send login query
        con.query(sqlQueryLogin, values, async (err, result) => {
            if (err) {
                console.error('Error logging in:', err);
                res.status(500).send('Internal Server Error');
            } 
            else if (result[0]) {
                const hashedPassword = result[0].password;

                // compare hashed password with the provided password
                const passwordMatch = await bcrypt.compare(pwd, hashedPassword);

                // if passwords match
                if (passwordMatch) {
                    console.log('User logged in successfully.');
                    // store user information in a cookie
                    res.cookie('username', usr);

                    // store user information in session for session tracking
                    req.session.username = usr;

                    // redirect back to home
                    res.redirect(`https://wanderlog.treseibert.com/home?usr=${usr}`);
                } 
                else {
                    // send error message
                    res.status(401).json({ message: "Username or password is incorrect. Please try again, or create an account" });
                }
            } else {
                // send error message
                res.status(401).json({ message: "Username or password is incorrect. Please try again, or create an account" });
            }
        });
    }
});


//---------------------------------------------------------------------------
// Hanldes post during travel experience form submission
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

    // construct query
    const sqlQuery = `INSERT INTO visits (username, city, country, depart_date, return_date, notes) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [username, city, country, departureDate, returnDate, notes]; 
    
    // Insert the form data into the database
    con.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Data inserted into the database successfully.');
            // redirect the user back to the home page
            res.redirect(`https://wanderlog.treseibert.com/home?usr=${username}`);
        }
    });
});

//---------------------------------------------------------------------------
// Hanldes get during world.csg loading
//---------------------------------------------------------------------------
// Handles fetching visited countries
app.get('/visited-countries', (req, res) => {
    // Get the username from cookies
    const username = req.cookies.username;

    // if theres no username, user needs to log back in
    if (!username) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    // construct query for the database to get visited countries for the user
    const sqlQuery = 'SELECT DISTINCT country FROM visits WHERE username = ?';

    // send query
    con.query(sqlQuery, [username], (err, result) => {
        if (err) {
            console.error('Error fetching visited countries:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
        else {
            // send visited countries back as json response
            const visitedCountries = result.map(row => row.country);
            res.json({ visitedCountries });
        }
    });
});

// Handles GET requests for user visits to a specific country
app.get('/user-visits', (req, res) => {
    // get username and country from call
    const username = req.query.usr;
    const country = req.query.country;

    console.log(username);
    console.log(country)

    // not enough parms to fulfill request
    if (!username || !country) {
        // display error
        res.status(400).json({ error: 'Invalid request parameters' });
        return;
    }

    // query the database to get user visits to the specified country
    const sqlQuery = 'SELECT visit_id, city, depart_date, return_date, notes FROM visits WHERE username = ? AND country = ?';

    // send query
    con.query(sqlQuery, [username, country], (err, result) => {
        if (err) {
            // log errors
            console.log('Error fetching user visits:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
        else {
            // build the json response with necessary fields
            const userVisits = result.map(row => ({
                visit_id: row.visit_id,
                city: row.city,
                depart_date: row.depart_date,
                return_date: row.return_date,
                notes: row.notes,
            }));
            console.log(userVisits);
            // send a json response
            res.json({ visits: userVisits });
        }
    });
});

//handles updating a visit's notes
app.post('/update', (req, res) => {
    // get visit id and notes from call
    const visit_id = req.body.visit_id;
    const notes = req.body.notes

    // construct SQL query to delete specified visit
    const sqlQuery = 'UPDATE visits SET notes = ? WHERE visit_id = ?';

    // execute the query
    con.query(sqlQuery, [notes, visit_id], (err, result) => {
        if (err) {
            // log errors
            console.error('Error deleting visit:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
        else {
            console.log('Data updated successfully.');
        }
    });
});

//handles deleting a visit
app.post('/delete', (req, res) => {
    
    // get visit_id from call
    const visit_id = req.body.data;

    // construct SQL query to delete specified visit
    const sqlQuery = 'DELETE FROM visits WHERE visit_id = ?';

    // execute the query
    con.query(sqlQuery, [visit_id], (err, result) => {
        if (err) {
            // log errors
            console.error('Error deleting visit:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
        else {
            console.log('Data deleted successfully.');
        }
    });
});

//handles GET requests for wander statistics
app.get('/statistics', (req, res) => {
   
    // get username from call
    const username = req.cookies.username;

    // construct query
    const sqlQuery = 'SELECT statistics FROM (SELECT COUNT(DISTINCT city) AS statistics, 1 AS count FROM visits WHERE username = ? UNION SELECT COUNT(DISTINCT country), 2 FROM visits WHERE username = ? UNION SELECT SUM(DATEDIFF(return_date, depart_date)), 3 FROM visits WHERE username = ? UNION SELECT AVG(DATEDIFF(return_date, depart_date)), 4 FROM visits WHERE username = ? UNION SELECT name, 5 FROM users WHERE username = ?) AS subquery;';

    // execute query
    con.query(sqlQuery, [username,username,username,username,username], (err, result) => {
        if (err) {
            // log errors
            console.error('Error fetching user visits:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        else {
            // build the json response with necessary fields
            const userStatistics = result.map(row => row.statistics);
            res.json({ statistics: userStatistics });
        }
    });
});

// Handles GET requests for checking username availability on signup
app.get('/check-username', (req, res) => {
   
    // get username from call
    const username = req.query.usr;

    // construct query for the database to check if the username exists
    const sqlQuery = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';

    // execute query
    con.query(sqlQuery, [username], (err, result) => {
        // check for backend errors
        if (err) {
            // send errors
            console.error('Error checking username availability:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } 
        else {
            // send response
            const count = result[0].count;
            const available = count === 0;
            res.json({ available });
        }
    });
});