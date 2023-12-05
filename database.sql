CREATE DATABASE wonderlog;

CREATE TABLE users (
    name VARCHAR (20) NOT NULL,
    username VARCHAR (20),
    password VARCHAR (20),
    PRIMARY KEY(username)
);

CREATE TABLE cities( 
    -- database from https://simplemaps.com/data/world-cities
    city_id INT(10) NOT NULL,
    city_name VARCHAR(120),
    latitude DECIMAL(8,6),
    longitude DECIMAL(9,6),
    country VARCHAR(120),
    admin_name VARCHAR(120),
    capital VARCHAR(7),
    population INT(8),
    CONSTRAINT latitude_const CHECK (latitude BETWEEN -90 and 90),
    CONSTRAINT longitude_const CHECK (longitude BETWEEN -180 and 180),
    CONSTRAINT capital_constraint CHECK (capital IN ('primary', 'admin','minor', NULL)),
    PRIMARY KEY(city_id)
);

CREATE TABLE visits (
    username VARCHAR (20),
    visit_number INT(6),	-- relative to each username
    city_id INT(10),
    start_date DATE,
    end_date DATE,
    notes VARCHAR (10000),
    FOREIGN KEY(username) REFERENCES users(username),
    FOREIGN KEY(city_id) REFERENCES cities(city_id)
);

CREATE TABLE activities (
    username VARCHAR (20),
    visit_number INT(6),
    activity_number INT(3),	-- relative to each visit
    day DATE,
    location VARCHAR (100),
    description VARCHAR (10000),
    FOREIGN KEY(username) REFERENCES users(username)
);
