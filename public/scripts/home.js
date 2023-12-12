// ************************
//      GLOBALS
// ************************

let username;
let visitedCountries = [];

// ************************
//      FUNCTIONS
// ************************

// Functions to log out of session
function logout() {
    // delete cookie
    deleteCookie(username);

    // fetch logout request
    fetch('/logout', {
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            // handle the success case
            console.log('Logout request sent successfully');
            // redirect after successful logout
            window.location.href = '/login.html';
        } else {
            // handle the case where logout was not successful
            console.error('Logout request failed:', response.status);
            // redirect to the login page even on failure
            window.location.href = '/login.html';
        }
    })
    .catch(error => {
        // handle errors
        console.error('Error sending logout request:', error);
        // redirect to the login page on error
        window.location.href = '/login.html';
    });
}

// Function to deleteCookie
function deleteCookie(name) {
    // make the cookie exist in the past, to be deleted
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}

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
    // form hidden
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
function displayCountryModal(countryName) {
    // fetch user visits to the selected country
    fetchUserVisits(username, countryName)
        .then(visits => {
            
            // update modal content with user's visits information
            let modalTitle = document.getElementById('countryModalLabel');
            let modalBody = document.getElementById('countryInfo');
            
            // populate the modal
            modalTitle.innerText = `Your Trips to ${countryName} at a Glance`;

            if (visits.length > 0) {
                const visitsList = visits.map(visit => {
                    // format the date strings
                    const formattedDepartDate = new Date(visit.depart_date).toLocaleDateString();
                    const formattedReturnDate = new Date(visit.return_date).toLocaleDateString();
                    
                    // populate the modal
                    return `<li class="mb-3" href="#visitDetails${visit.city}" role="button" aria-expanded="false" aria-controls="visitDetails${visit.city}">
                    <h5><b>${visit.city}, ${formattedDepartDate} - ${formattedReturnDate}</b><br></h5>
                    <div id="visitDetails${visit.city}">
                        <div class="card card-body">
                            <p>Notes:</p>
                            <div id="contentContainer_${visit.visit_id}">
                                <p id="content_${visit.visit_id}">${visit.notes}</p>
                            </div>
                            <div class="center-modal-buttons"> <!-- Apply the CSS class here -->
                                <svg onclick="editNotes(${visit.visit_id})" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-content-save-edit-outline" width="32" height="32" viewBox="0 0 24 24">
                                    <path d="M4 19H10V21H4C2.89 21 2 20.1 2 19V5C2 3.9 2.89 3 4 3H16L20 7V9.12L18 11.12V7.83L15.17 5H4V19M14 10V6H5V10H14M20.42 12.3C20.31 12.19 20.18 12.13 20.04 12.13C19.9 12.13 19.76 12.19 19.65 12.3L18.65 13.3L20.7 15.35L21.7 14.35C21.92 14.14 21.92 13.79 21.7 13.58L20.42 12.3M12 19.94V22H14.06L20.12 15.93L18.07 13.88L12 19.94M14 15C14 13.34 12.66 12 11 12S8 13.34 8 15 9.34 18 11 18C11.04 18 11.08 18 11.13 18L14 15.13C14 15.09 14 15.05 14 15" />
                                </svg>
                                <svg onclick="deleteVisit(${visit.visit_id})" id="deleteVisit(${visit.visit_id}" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-trash mt-1" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </li>`;
                }).join(''); // join the html onclick="deleteVisit(${visit.visit_id})"

                // update modal body
                modalBody.innerHTML = `
                    <h4><p><u>Visits</u></p></h4>
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

//function to edit notes
function editNotes(visit_id) {
    var contentContainer = document.getElementById("contentContainer_" + visit_id);
    var notes = document.getElementById("content_" + visit_id); 

    if (notes.tagName === "P") {
        // switch to input field
        var inputField = document.createElement("textarea");
        inputField.value = notes.innerHTML;
        inputField.id = "content_" + visit_id;
        inputField.rows = "3"; 
        inputField.cols = "45";
        
        contentContainer.replaceChild(inputField, notes);
    }
    else {
        // switch back to paragraph
        var inputField = document.getElementById("content_" + visit_id);
        var newNotes = document.createElement("p");
        newNotes.id = "content_" + visit_id;
        newNotes.innerHTML = inputField.value;

        contentContainer.replaceChild(newNotes, inputField);

        // update database
        const formData = new URLSearchParams();
        formData.append('visit_id', visit_id);
        formData.append('notes', newNotes.innerHTML);
        fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
    }
}

//function to delete a visit
function deleteVisit(visit_id) {

    // get the form data
    const formData = new URLSearchParams();
    formData.append('data', visit_id);
    
    // call /delete route to handle deleting on backend
    fetch('/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });
    
    //reload to update the page
    location.reload();
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

    // check if svg exist
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
   
    // return values from /user-vists call
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

// Function to validate country before submitting the form
function validateCountry(event) {
    var countryInput = document.getElementById("country");
    // list of countries based on title attributes of all paths in svg
    var countryList = ['Andorra',
                    'United Arab Emirates',
                    'Afghanistan',
                    'Antigua and Barbuda',
                    'Anguilla',
                    'Albania',
                    'Armenia',
                    'Angola',
                    'Argentina',
                    'American Samoa',
                    'Austria',
                    'Australia',
                    'Aruba',
                    'Aland Islands',
                    'Azerbaijan',
                    'Bosnia and Herzegovina',
                    'Barbados',
                    'Bangladesh',
                    'Belgium',
                    'Burkina Faso',
                    'Bulgaria',
                    'Bahrain',
                    'Burundi',
                    'Benin',
                    'Saint Barthelemy',
                    'Brunei Darussalam',
                    'Bolivia',
                    'Bermuda',
                    'Bonaire,  Saint Eustachius and Saba',
                    'Brazil',
                    'Bahamas',
                    'Bhutan',
                    'Bouvet Island',
                    'Botswana',
                    'Belarus',
                    'Belize',
                    'Canada',
                    'Cocos  (Keeling)  Islands',
                    'Democratic Republic of Congo',
                    'Central African Republic',
                    'Republic of Congo',
                    'Switzerland',
                    "Côte d'Ivoire",
                    'Cook Islands',
                    'Chile',
                    'Cameroon',
                    'China',
                    'Colombia',
                    'Costa Rica',
                    'Cuba',
                    'Cape Verde',
                    'Curaçao',
                    'Christmas Island',
                    'Cyprus',
                    'Czech Republic',
                    'Germany',
                    'Djibouti',
                    'Denmark',
                    'Dominica',
                    'Dominican Republic',
                    'Algeria',
                    'Ecuador',
                    'Egypt',
                    'Estonia',
                    'Western Sahara',
                    'Eritrea',
                    'Spain',
                    'Ethiopia',
                    'Finland',
                    'Fiji',
                    'Falkland Islands',
                    'Federated States of Micronesia',
                    'Faroe Islands',
                    'France',
                    'Gabon',
                    'United Kingdom',
                    'Georgia',
                    'Grenada',
                    'French Guiana',
                    'Guernsey',
                    'Ghana',
                    'Gibraltar',
                    'Greenland',
                    'Gambia',
                    'Guinea',
                    'Glorioso Islands',
                    'Guadeloupe',
                    'Equatorial Guinea',
                    'Greece',
                    'South Georgia and South Sandwich Islands',
                    'Guatemala',
                    'Guam',
                    'Guinea-Bissau',
                    'Guyana',
                    'Hong Kong',
                    'Heard Island and McDonald Islands',
                    'Honduras',
                    'Croatia',
                    'Haiti',
                    'Hungary',
                    'Indonesia',
                    'Ireland',
                    'Israel',
                    'Isle of Man',
                    'India',
                    'British Indian Ocean Territory',
                    'Iraq',
                    'Iran',
                    'Iceland',
                    'Italy',
                    'Jersey',
                    'Jamaica',
                    'Jordan',
                    'Japan',
                    'Juan De Nova Island',
                    'Kenya',
                    'Kyrgyzstan',
                    'Cambodia',
                    'Kiribati',
                    'Comoros',
                    'Saint Kitts and Nevis',
                    'North Korea',
                    'South Korea',
                    'Kosovo',
                    'Kuwait',
                    'Cayman Islands',
                    'Kazakhstan',
                    "Lao People's Democratic Republic",
                    'Lebanon',
                    'Saint Lucia',
                    'Liechtenstein',
                    'Sri Lanka',
                    'Liberia',
                    'Lesotho',
                    'Lithuania',
                    'Luxembourg',
                    'Latvia',
                    'Libya',
                    'Morocco',
                    'Monaco',
                    'Moldova',
                    'Madagascar',
                    'Montenegro',
                    'Saint Martin',
                    'Marshall Islands',
                    'Macedonia',
                    'Mali',
                    'Macau',
                    'Myanmar',
                    'Mongolia',
                    'Northern Mariana Islands',
                    'Martinique',
                    'Mauritania',
                    'Montserrat',
                    'Malta',
                    'Mauritius',
                    'Maldives',
                    'Malawi',
                    'Mexico',
                    'Malaysia',
                    'Mozambique',
                    'Namibia',
                    'New Caledonia',
                    'Niger',
                    'Norfolk Island',
                    'Nigeria',
                    'Nicaragua',
                    'Netherlands',
                    'Norway',
                    'Nepal',
                    'Nauru',
                    'Niue',
                    'New Zealand',
                    'Oman',
                    'Panama',
                    'Peru',
                    'French Polynesia',
                    'Papua New Guinea',
                    'Philippines',
                    'Pakistan',
                    'Poland',
                    'Saint Pierre and Miquelon',
                    'Pitcairn Islands',
                    'Puerto Rico',
                    'Palestinian Territories',
                    'Portugal',
                    'Palau',
                    'Paraguay',
                    'Qatar',
                    'Reunion',
                    'Romania',
                    'Serbia',
                    'Russia',
                    'Rwanda',
                    'Saudi Arabia',
                    'Solomon Islands',
                    'Seychelles',
                    'Sudan',
                    'Sweden',
                    'Singapore',
                    'Saint Helena',
                    'Slovenia',
                    'Svalbard and Jan Mayen',
                    'Slovakia',
                    'Sierra Leone',
                    'San Marino',
                    'Senegal',
                    'Somalia',
                    'Suriname',
                    'South Sudan',
                    'Sao Tome and Principe',
                    'El Salvador',
                    'Saint Martin',
                    'Syria',
                    'Swaziland',
                    'Turks and Caicos Islands',
                    'Chad',
                    'French Southern and Antarctic Lands',
                    'Togo',
                    'Thailand',
                    'Tajikistan',
                    'Tokelau',
                    'Timor-Leste',
                    'Turkmenistan',
                    'Tunisia',
                    'Tonga',
                    'Turkey',
                    'Trinidad and Tobago',
                    'Tuvalu',
                    'Taiwan',
                    'Tanzania',
                    'Ukraine',
                    'Uganda',
                    'Jarvis Island',
                    'Baker Island',
                    'Howland Island',
                    'Johnston Atoll',
                    'Midway Islands',
                    'Wake Island',
                    'United States',
                    'Uruguay',
                    'Uzbekistan',
                    'Vatican City',
                    'Saint Vincent and the Grenadines',
                    'Venezuela',
                    'British Virgin Islands',
                    'US Virgin Islands',
                    'Vietnam',
                    'Vanuatu',
                    'Wallis and Futuna',
                    'Samoa',
                    'Yemen',
                    'Mayotte',
                    'South Africa',
                    'Zambia',
                    'Zimbabwe'];

    // check if the entered country is in the list
    if (!countryList.includes(countryInput.value)) {
        alert("Invalid country name. Please input a valid country.");
        // prevent the form from submitting
        event.preventDefault(); 
    }
}
// Add an event listener to the form to validate country before submission
document.forms["Entry"].addEventListener("submit", validateCountry);

// Function to validate dates before submitting the form
function validateDates(event) {
    // get depart and return dates
    var departureDateInput = document.getElementById("departureDate");
    var returnDateInput = document.getElementById("returnDate");

    // check to make sure they both have a value
    if (departureDateInput.value && returnDateInput.value) {
        // get get values as a js date
        var departureDate = new Date(departureDateInput.value);
        var returnDate = new Date(returnDateInput.value);

        if (returnDate < departureDate) {
            alert("Return date cannot be before the departure date. Please select a valid return date.");
            event.preventDefault(); // Prevent the form from submitting
        }
    }
}
// Add an event listener to the form to validate dates before submission
document.forms["Entry"].addEventListener("submit", validateDates);

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

    // capitalize the first letter of the username and convert the rest to lowercase
    const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();

    // dynamically add the username where needed on home.html
    if (usernameElement) {
        usernameElement.innerText = formattedUsername;
    }
});

// Function to wait for SVG document to load and call fetchVisitedCountries
document.getElementById('world-map').addEventListener('load', function () {
    console.log("SVG LOADED");
    fetchVisitedCountries();
});

// Function to get ID and Name of country clicked and display modal if visited
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('world-map').addEventListener('load', function () {
        // get svg by id
        let svgDoc = document.getElementById('world-map').contentDocument;
        // get all paths inside svg file
        let paths = svgDoc.querySelectorAll('path');

        // loop throguh paths 
        paths.forEach(function (path) {
            path.addEventListener('click', function () {
                
                // get countryid and name from path title
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


// *******************************
//   WANDER STATISTICS FUNCTIONS
// *******************************

//fetch user statistics information
fetch('/statistics')
    .then(response => { // wait for reponse
        if (!response.ok) {
            // throw error if no reponse
            throw new Error('Failed to fetch user statistics');
        }
        return response.json();
    })
    .then(data => {
        // update the number of cities
        var span = document.getElementById('cityNum');
        var cities = JSON.stringify(data.statistics[0]);
        span.innerText = cities.substring(1,cities.length-1);
        // update the number of countries
        var span = document.getElementById('countryNum');
        var countries = JSON.stringify(data.statistics[1])
        span.innerText = countries.substring(1,countries.length-1);
        // update the number of days
        var span = document.getElementById('dayNum');
        var days = JSON.stringify(Math.round(data.statistics[2]));
        span.innerText = days;//.substring(1,days.length-1);
        // update the average triplength
        var span = document.getElementById('avgDay');
        var avg = JSON.stringify(Math.round(data.statistics[3]));
        span.innerText = avg;//.substring(1,avg.length-1);
        // update name
        var span = document.getElementById('showName');
        var name = JSON.stringify(data.statistics[4]);
        span.innerText = name.substring(1,name.length-1);
    })
    .catch(error => {
        // catch error
        console.error('Error:', error);
    });
