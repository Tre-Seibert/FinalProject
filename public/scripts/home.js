// Function to toggle new experience form on click
function toggleForm() {
    // Get the form element by its ID
    var form = document.getElementById("cityEntryForm");

    // Get the computed style of the form's display property
    var formDisplayStyle = window.getComputedStyle(form).getPropertyValue('display');

    // Check if the form is currently hidden or not set (initial state)
    if (formDisplayStyle === 'none' || formDisplayStyle === '') {
        // If hidden or not set, display the form
        form.style.display = 'block';
    } else {
        // If visible, hide the form
        form.style.display = 'none';
    }
}
