$(document).ready(function(){

    // Initializes modals
    $('.modal').modal();

    // Sets listener for navbar toggle button
    $('#toggle-button').click(function(e) {
        e.preventDefault();

        // Moves navbar in or out depending on current position
        var elem = document.getElementById("navID"),
        style = window.getComputedStyle(elem),
        top = style.getPropertyValue("right");

        if (top == "0px"){
            elem.style.right = "-260px";
        } else{
            elem.style.right = "0px";
        }
    });

    // Triggers set username modal if no username cookie saved
    // if (document.cookie.username === undefined) {
    //     console.log(document.cookie);
    //     $('#set-username').modal('open');
    //     $('#create-username-button').on('click', function(e) {
    //         e.preventDefault();
    //         document.cookie = 'username=' + $('#username').val();
    //         $('#username').val('');
    //         $('#set-username').modal('close');
    //     })
    // }

    // Initializes places autocomplete search
    const input = document.getElementById('place-autocomplete-input');
    const autocomplete = new google.maps.places.Autocomplete(input);

    // Specify just the place data fields that you need.
    autocomplete.setFields(['place_id', 'geometry', 'name', 'formatted_address']);

    // Initialize container for place results from place autocomplete
    // It's outside of the 'place_changed' handler so that we can access the place data when submitting the whole form
    let eventPlace;

    // Listener is triggered every time a character changes in the autocomplete form
    autocomplete.addListener('place_changed', function() {

        let place = autocomplete.getPlace();
        
        // Checks if an actual place has been selected with this character change
        if (!place.geometry) {

            // If no place selected, return out of callback
            return;
        }

        // If a place has been selected then save in eventPlace
        else {
            eventPlace = place;
        }
    });

    $('#create-event-form').submit(function(e) {

        // Prevent page refresh
        e.preventDefault();

        // Once a place is selected, capture relevant fields, mostly from eventPlace
        let eventname = ($('#event-name').val() !== '') ? $('#event-name').val() : eventPlace.name;
        let address = eventPlace.formatted_address;
        let placeid = eventPlace.place_id;
        let description = $('#event-description').val();
        let lat =  eventPlace.geometry.location.lat();
        let lng = eventPlace.geometry.location.lng();
        let username = document.cookie;
        console.log('name', eventname)
        console.log('place', placeid);
        console.log(lat);
        console.log(lng);

        // Send new place data as API POST request to server
        $.post({
            url: '/api/events', 
            data: {
                eventname,
                address,
                placeid,
                description,
                lat,
                lng
            },
        }).done((results) => {

            // Clear input fields and close modal
            $('#event-name').val('');
            $('#event-description').val('');
            $('#place-autocomplete-input').val('');
            $('#create-event-form').modal();

            // Server POST route should return a 201 status. 
            console.log('POST resolution results', results, results.status);

            // For the client who created the new event, map will recenter onto event
            // Need to find a way to hoist the map, basically. Might be as simple as making a new function for this code
            // if (map) {
            //     map.setCenter({lat, lng});
            //     map.setZoom(15);
            // }
        }).catch((err) => console.log(err));
    });
});