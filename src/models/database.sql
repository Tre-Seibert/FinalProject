CREATE DATABASE wanderlog;


CREATE TABLE users (
	name VARCHAR (50),
	username VARCHAR (20) NOT NULL,
    password VARCHAR (255),
    PRIMARY KEY(username)
);

CREATE TABLE visits (
    visit_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20),
    city VARCHAR(120) NOT NULL,
    country VARCHAR(120) NOT NULL,
    depart_date DATE,
    return_date DATE,
    notes TEXT,
    CONSTRAINT check_dates_order CHECK (depart_date <= return_date),
    FOREIGN KEY (username) REFERENCES users(username)
);