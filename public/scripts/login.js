// ******************
//   FUNCTIONS
// ******************

// function to validate login input (client side validates form data)
async function validateLogin(event) {
    event.preventDefault();

    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `usr=${username}&pwd=${password}`,
        });

        if (response.ok) {
            // manually submit the form
            event.target.submit();
        } else {
            // display an alert with the error message
            const data = await response.json();
            alert(data.message || 'An error occurred.');
        }
    } catch (error) {
        console.error('An error occurred during login:', error);
        alert('An error occurred during login.');
    }
}





// Function to validate sign up input (client side validates form data)
async function validateSignup(event) {

    // prevent the default form submission
    event.preventDefault();


    // USERNAME REQUIREMENTS:

    // get the username input element
    var usernameInput = document.getElementById('signupUsername');
    var passwordInput = document.getElementById('signupPassword')

    // get the entered username, remove any leading and trailing whitespaces
    var username = usernameInput.value.trim();
    var password = passwordInput.value;

    // validate length of username 
    if (username.length < 4 || username.length > 20) {
        alert('Username must be between 4 and 20 characters.');
        return false;
    }

    // validate character set (alphanumeric only) of username 
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        alert('Username can only contain letters and numbers.');
        return false;
    }


    // check for leading or trailing spaces (incase) of username
    if (usernameInput.value !== username) {
        alert('Username should not start or end with spaces.');
        return false;
    }

    // PASSWORD REQUIREMENTS:

    // validate password length
    if (password.length < 8 || password.length > 20) {
        alert('Password must be between 8 and 20 characters.');
        return false;
    }


    //  complexity requirement for password
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]+$/.test(password)) {
        alert("Password must include at least one uppercase letter, one lowercase letter, one number, and one special character");
        return false;
    }

    // check username availability
    const isUsernameAvailable = await checkUsernameAvailability(username);

    if (!isUsernameAvailable) {
        alert('Username is already taken. Please choose a different username.');
        return false; // Prevent form submission if username is not available
    }

    // manually submit the form (prevents redirection to json response)
    document.forms['register'].submit();

    // allow form submission
    return true;

}

// function to check username availability
async function checkUsernameAvailability(username) {
    // sanitize
    username = username.toLowerCase();


    try {
        const response = await fetch(`http://localhost:3000/check-username?usr=${username}`);
        
        if (response.ok) {
            // wait for response and return error
            const data = await response.json();
            return data.available;
        } 
        else {
            // Handle error by assuming username is unavailable
            console.error('Error checking username availability');
            return false;
        }
    } 
    catch (error) {
        console.error('An error occurred during the username availability check:', error);
        return false;
    }
}