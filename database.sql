CREATE DATABASE wanderlog;

CREATE TABLE users (
	name VARCHAR (20),
	username VARCHAR (20) NOT NULL,
    password VARCHAR (20),
    PRIMARY KEY(username)
);

CREATE TABLE cities( 
	username VARCHAR (20),
    city_id INT(6) NOT NULL,	-- relative to each username
    city_name VARCHAR(120),
    country VARCHAR(120),
    FOREIGN KEY(username) REFERENCES users(username)
);

CREATE TABLE visits (
	username VARCHAR (20),
	visit_number INT(6),	-- relative to each username
    city_id INT(10),
    start_date DATE,
    end_date DATE,
    notes VARCHAR (10000),
    FOREIGN KEY(username) REFERENCES users(username)
);