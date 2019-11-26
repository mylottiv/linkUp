$(document).ready(function(){
    $('.parallax').parallax();
    $('.modal').modal();

    // Signup form submit listener
    $('#sign-up').submit(function(e) {
        e.preventDefault();
        
        // Capture new user information
        const firstName = $('#first-name-sign-up').val();
        const lastName = $('#last-name-sign-up').val();
        const username = $('#username-sign-up').val();
        const email = $('#email-sign-up').val();
        const password = $('#pass-sign-up').val();

        // Post to signup route
        $.post({
            url: "/api/signup",
            data: {
                firstName,
                lastName,
                username,
                email,
                password
            }
        }).done((results) => console.log('Done!', results));
    });

    // Login form submit listener


});