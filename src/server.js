const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

//*** create form parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


//*** set up mysql connections
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "blubbins",  // use your own MySQL root password
  database: "wonderlog"
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

    var name = req.body.name;
    var usr = req.body.usr;
    var pwd = req.body.pwd;

    if(name) {
        var sql_query_register = "INSERT INTO users (name, username, password) VALUES ('" + name + "', '" + usr + "', '" + pwd + "');"

        con.query(sql_query_register, function (err, result, fields) { // execute the SQL string
            if (err)
                res.send("Illegal Query" + err);                  // SQL error
            else {
                        console.log(sql_query_register);          // send query results to the console
                        res.redirect("http://localhost:3000/home?usr=" + usr);   // redirect to home
                }
        });
    }

    else {
        var sql_query_login = "SELECT username FROM users WHERE username='" + usr + "' AND password='" + pwd + "';"

        con.query(sql_query_login, function (err, result, fields) { // execute the SQL string
            if (err)
                res.send("Illegal Query" + err);                  // SQL error
            else if (result[0]) {
                console.log(sql_query_login);                     // send query results to the console
                res.redirect("http://localhost:3000/home?usr=" + usr);   // redirect to home
            }
            else 
                res.send("No Account");                //no account
        });
    }
});