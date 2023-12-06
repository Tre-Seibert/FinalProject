// ************************
//      GLOBALS
// ************************

let username;
let visitedCountries = [];

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
    // Form hidden
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
    //  find form id and hide
    var form = document.getElementById("cityEntryForm");
    form.style.display = 'none';

    // toggle button visibility
    document.getElementById("addLocationBtn").style.display = 'block';
    document.getElementById("closeFormBtn").style.display = 'none';
}

// Function to display country modal
function displayCountryModal(countryId, countryName) {
    // fetch user visits to the selected country
    fetchUserVisits(username, countryName)
        .then(visits => {
            // update modal content with user's visits information
            let modalTitle = document.getElementById('countryModalLabel');
            let modalBody = document.getElementById('countryInfo');

            // populate the modal
            modalTitle.innerText = `${username}'s Trips to ${countryName} at a Glance`;

            if (visits.length > 0) {
                const visitsList = visits.map(visit => {
                    // format the date strings
                    const formattedDepartDate = new Date(visit.depart_date).toLocaleDateString();
                    const formattedReturnDate = new Date(visit.return_date).toLocaleDateString();
                    
                    // populate the modal
                    return `<li class="mb-3" href="#visitDetails${visit.city}" role="button" aria-expanded="false" aria-controls="visitDetails${visit.city}">
                        <b>${visit.city}, ${formattedDepartDate} - ${formattedReturnDate}</b><br>
                        ${visit.notes}
                        
                        <div class="collapse" id="visitDetails${visit.city}">
                            <div class="card card-body">
                                <p>Notes:</p>
                                <p>${visit.notes}</p>
                            </div>
                        </div>
                    </li>`;
                }).join(''); // join the html

                // update modal body
                modalBody.innerHTML = `
                    <p><u>Visits</u></p>
                    <ol>${visitsList}</ol>
                `;
            } 
            else {
                // return no visits recorded if not visited.
                modalBody.innerHTML = '<p>No visits recorded for this country.</p>';
            }

            // Display the modal
            let countryModal = new bootstrap.Modal(document.getElementById('countryModal'));
            countryModal.show();
        })
        .catch(error => {
            // catch errors
            console.error('Error fetching user visits:', error);
        });
}




// Function to fetch visited countries from the server
function fetchVisitedCountries() {
    // send get request
    fetch('/visited-countries')
        .then(response => { // wait for reponse
            if (!response.ok) {
                // throw error if no response
                throw new Error('Failed to fetch visited countries');
            }
            return response.json();
        })
        .then(data => {
            // update vars
            visitedCountries = data.visitedCountries;
            console.log(visitedCountries)
            updateVisitedCountries();
        })
        .catch(error => {
            // catch error
            console.error('Error:', error);
        });
}

// Function to update visited countries to white in the SVG map
function updateVisitedCountries() {
    const worldMapObject = document.getElementById("world-map");
    const svgDoc = worldMapObject.contentDocument;

    if (svgDoc) {
        visitedCountries.forEach(code => {
            
            // use querySelector to select elements by attribute
            const path = svgDoc.querySelector(`[title="${code}"]`);

            // if path exists fill the country white
            if (path !== null) {
                path.style.fill = 'white';
            } else {
                console.warn(`Path with title "${code}" not found.`);
            }
        });
    } 
    else {
        // log no svg available
        console.warn("SVG Document not available");
    }
}

// Function to fetch user visits to a specific country
function fetchUserVisits(username, country) {
    return fetch(`/user-visits?usr=${username}&country=${country}`)
        .then(response => { // wait for reponse
            if (!response.ok) {
                // throw error if no reponse
                throw new Error('Failed to fetch user visits');
            }
            return response.json();
        })
        .then(data => data.visits)
        .catch(error => {
            // catch and throw errors
            console.error('Error:', error);
            throw error;
        });
}

// *******************************
//   EVENT LISTENER FUNCTIONS
// *******************************

// Function to get the currently logged in username
document.addEventListener('DOMContentLoaded', function () {
    // search url parms
    const urlParams = new URLSearchParams(window.location.search);
    // get the username from the usr parm
    username = urlParams.get('usr');
    const usernameElement = document.getElementById('username');

    // dynamically add the username where needed on home.html
    if (usernameElement) {
        usernameElement.innerText = username;
    }
});

// Function to load SVG document and fetch visited countries
document.getElementById('world-map').addEventListener('load', function () {
    console.log("SVG LOADED");
    fetchVisitedCountries();
});

// Function to get ID and Name of country clicked and display modal if visited
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('world-map').addEventListener('load', function () {
        let svgDoc = document.getElementById('world-map').contentDocument;
        let paths = svgDoc.querySelectorAll('path');

        paths.forEach(function (path) {
            path.addEventListener('click', function () {
                
                // get path from 
                let clickedCountryId = path.id;
                let clickedCountryName = path.getAttribute('title');
                
                // check if the clicked country is in the visitedCountries list
                if (visitedCountries.includes(clickedCountryName)) {
                    // display modal with country information
                    displayCountryModal(clickedCountryId, clickedCountryName);
                } 
                else {
                    // if not visited, you can show a message or handle it as needed
                    console.log(`${clickedCountryName} has not been visited.`);
                }
            });
        });
    });
});

