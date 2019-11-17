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

    // Initializes places autocomplete search
    const input = document.getElementById('place-autocomplete-input');
    const autocomplete = new google.maps.places.Autocomplete(input);

    // Specify just the place data fields that you need.
    autocomplete.setFields(['place_id', 'geometry', 'name', 'formatted_address']);

    // Listener is triggered every time a character changes in the autocomplete form
    autocomplete.addListener('place_changed', function() {

        var place = autocomplete.getPlace();
        
        // Checks if an actual place has been selected with this character change
        if (!place.geometry) {

            // If no place selected, return out of callback
            return;
        }

        // Once a place is selected, capture relevant fields
        let eventname = place.name;
        let address = place.formatted_address;
        let placeid = place.place_id;
        let lat =  place.geometry.location.lat();
        let lng = place.geometry.location.lng();
        console.log('place', placeid);
        console.log(lat);
        console.log(lng);

        // Send new place data as API POST request to server
        $.post({
            url: '/api/events',
            data: 
            {
                eventname,
                address,
                placeid,
                lat,
                lng
            },
            success: (results) => {

                // NOTE: THIS AND ERROR BLOCK ARE NOT FIRING CURRENTLY

                // Server POST route should return a 202 status. 
                console.log('POST resolution results', results, results.status);

                // For the client who created the new event, map will recenter onto event
                map.setCenter({lat, lng});
                map.setZoom(15);

                },
            error: (err) => console.log(err)
        });
    });
});