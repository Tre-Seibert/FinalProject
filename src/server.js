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

// This sql connection works for joe. Joe use this when working

//*** set up mysql connections
 var mysql = require('mysql');


 var con = mysql.createConnection({
     host: "localhost",
     user: "root",
     password: "blubbins",  // use your own MySQL root password
     database: "wanderlog"
   });


// This sql connection works for Tre. Tre use this when working

//var mysql = require('mysql2');

//var con = mysql.createConnection({
//  host: "localhost",
//port: "3306",
//  user: "root",
//  password: "Alexemma1",
//  database: "WanderLog"
//});

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
                res.status(401).json({ message: "Username or password is incorrect. Please try again, or create an account" }) //no account
                
        });
    }
});

//---------------------------------------------------------------------------

app.post('/home', (req, res) => {

    var username = req.query.usr;
    var city = req.body.city;
    var country = req.body.country;
    var start = req.body.deparetureDate;
    var end = req.body.returnDate;
    var notes = req.body.notes;

    var city_id;
    var visit_number;

    var sql_query_cityid = "SELECT city_id FROM cities WHERE username='" + username + "' AND city_name='" + city + "';"
    var sql_query_cmax = "SELECT MAX(city_id) AS max FROM cities WHERE username='" + username + "';"
    var sql_query_cinput = "INSERT INTO cities (username, city_id, city_name, country) VALUES ('" + username + "', '" + city_id + "', '" + city + "', '" + country + "');"

    var sql_query_vmax = "SELECT MAX(visit_number) AS max FROM visits WHERE username='" + username + "' AND city_id='" + city_id + "';"
    var sql_query_vinput = "INSERT INTO visits (username, visit_number, city_id, start_date, end_date, notes) VALUES ('" + username + "', '" + visit_number + "', '" + city_id + "', '" + start + "', '" + end + "', '" + notes + "');"

    con.query(sql_query_cityid, function (err, result, fields) { // execute the SQL string
        if (err)
            res.send("Illegal Query" + err);                  // SQL error
        else {
            console.log(sql_query_cityid);                     // send query results to the console
            city_id = result[0];                //retreive city id
            }
    });

    //if city is not in database
    if(!city_id) {
        con.query(sql_query_cmax, function (err, result, fields) { // execute the SQL string
            if (err)
                res.send("Illegal Query" + err);                  // SQL error
            else {
                console.log(sql_query_cmax);                     // send query results to the console                          
                if(result[0])                                    //get new city id
                    city_id = result[0].max + 1;
                else
                    city_id = 1;
                }
        });
        //create new tuple
        con.query(sql_query_cinput, function (err, result, fields) { // execute the SQL string
            if (err)
                res.send("Illegal Query" + err);                  // SQL error
            else 
                console.log(sql_query_cinput);                     // send query results to the console
        });
    }
    else
        city_id = city_id.city_id;

    con.query(sql_query_vmax, function (err, result, fields) { // execute the SQL string
        if (err)
            res.send("Illegal Query" + err);                  // SQL error
        else {
            console.log(sql_query_vmax);                     // send query results to the console
            var vmax = result[0];                             //get new visit number
            if(vmax)
                visit_number = vmax.max + 1;
            else
                visit_number = 1;
            }
    });
    //create new tuple
    con.query(sql_query_vinput, function (err, result, fields) { // execute the SQL string
        if (err)
            res.send("Illegal Query" + err);                  // SQL error
        else {
            console.log(sql_query_vinput);                     // send query results to the console
            }
    });
});

//app.get('/home', (req, res) => {});