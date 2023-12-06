// ************************
//      GLOBALS
// ************************

let username;

// ************************
//      FUNCTIONS
// ************************

// Function to toggle new experience form on click
function toggleForm() {
    // get the form element by its ID
    var form = document.getElementById("cityEntryForm");

    // get the style of the form's display property
    var formDisplayStyle = window.getComputedStyle(form).getPropertyValue('display');

    // check if the form is currently hidden or not set (initial state)
    if (formDisplayStyle === 'none' || formDisplayStyle === '') {
        // if hidden or not set, display the form
        form.style.display = 'block';
        // toggle button visibility
        document.getElementById("addLocationBtn").style.display = 'none';
        document.getElementById("closeFormBtn").style.display = 'block';
    } 
    else {
        // if visible then hide the form
        form.style.display = 'none';
        // toggle button visibility
        document.getElementById("addLocationBtn").style.display = 'block';
        document.getElementById("closeFormBtn").style.display = 'none';
    }
}

// Function to close the form and show the "Add New Location" button
function closeForm() {
    var form = document.getElementById("cityEntryForm");
    form.style.display = 'none';
    // toggle button visibility
    document.getElementById("addLocationBtn").style.display = 'block';
    document.getElementById("closeFormBtn").style.display = 'none';
}

// Function to display country modal
function displayCountryModal(countryId, countryName) {
    
    // static for now... get trip information here from mysql
    // dynamically get a list of cities and their associated information
    let countryInfo = {
        name: 'United States',
        capital: 'Washington, D.C.',
        population: '331 million',
        attractions: ['Statue of Liberty', 'Grand Canyon', 'Disney World'],
    };
    

    // update modal content with country information
    let modalTitle = document.getElementById('countryModalLabel');
    let modalBody = document.getElementById('countryInfo');

    // populate the modal
    modalTitle.innerText = `${username}'s Trips to ${countryName} at a Glance`;
    modalBody.innerHTML = `
        <p>Capital: ${countryInfo.capital}</p>
        <p>Population: ${countryInfo.population}</p>
        <!-- Add more information as needed -->
    `;

    // display the modal
    let countryModal = new bootstrap.Modal(document.getElementById('countryModal'));
    countryModal.show();
}

// *******************************
//   EVENT LISTENER FUNCTIONS
// *******************************

// Function to get the currently logged in username
document.addEventListener('DOMContentLoaded', function () {
    
    // get the username from the URL
    const urlParams = new URLSearchParams(window.location.search);
    username = urlParams.get('usr');

    console.log('Username:', username);

    // update username tag in home.html
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.innerText = username;
    }
});

// static retrieve all countries ... we can turn this into a function to get all visited countries
const visitedCountries = ["US", "QA", "ID", "JM", "IT"];

// function that fills countries white if visited
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM LOADED");

    // wait for the SVG image to fully load
    const worldMapObject = document.getElementById("world-map");
    
    worldMapObject.addEventListener("load", function () {
        
        // access world.svg
        const svgDoc = worldMapObject.contentDocument;

        if (svgDoc) {
            console.log("SVG Document is available");

            // dynamically get list of visitedCountries - use username global variable
            // visitedCountries = select * countries where username ...

            // loop through the paths in the svg
            visitedCountries.forEach(code => {
               
                // find the country using the id in world.svg
                const path = svgDoc.getElementById(code);
                
                console.log("Country Code:", code);
                console.log("Path Element:", path);

                // if the countryid is in world.svg 
                if (path !== null) {
                    // fill the country white
                    path.style.fill = 'white';
                } 
                else {
                    console.warn(`Path with ID ${code} not found.`);
                }
            });
        } 
        else {
            console.warn("SVG Document not available");
        }
    });
});


// Function to get ID and Name of country clicked and display modal if visited
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('world-map').addEventListener('load', function () {
        
        // waits for DOM to load
        // wait for svg to load

        // access world.svg
        let svgDoc = document.getElementById('world-map').contentDocument;
        // select all paths
        let paths = svgDoc.querySelectorAll('path');
        
        // listen for a click for each 'path'(country) in world.svg
        paths.forEach(function (path) {
            path.addEventListener('click', function () {
                
                // get the country id and name
                let clickedCountryId = path.id;
                let clickedCountryName = path.getAttribute('title');

                console.log("Country Code:", clickedCountryId);
                console.log("Country Name:", clickedCountryName);

                // check if the clicked country is in the visitedCountries list
                if (visitedCountries.includes(clickedCountryId)) {
                    // display modal with country information
                    displayCountryModal(clickedCountryId, clickedCountryName);
                }
            });
        });
    });
});

