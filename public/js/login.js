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
    $('#login-form').submit(function(e) {
        e.preventDefault();

        // Capture login credentials
        const email = $('#login-email').val();
        const password = $('#login-password').val();

        // Put to login route
        $.ajax({
            url: '/api/login',
            method: 'PUT',
            data: {
                email,
                password
            }
        }).done((results) => console.log(results));
    });

});