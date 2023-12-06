// ******************
//   FUNCTIONS
// ******************

// Function to validate sign up input (client side validates form data)
function validateSignup() {

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
    if (password.length < 8 ) {
        alert('Password must be at least 8 characters.');
        return false;
    }

    //  complexity requirement for password
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]+$/.test(password)) {
        alert("Password must include at least one uppercase letter, one lowercase letter, one number, and one special character");
        return false;
    }

    // allow form submission
    return true;

}

// function to check username availability 
function checkUsernameAvailability(username) {
    // sanatize
    username = username.toLowerCase();

    return true; 
}