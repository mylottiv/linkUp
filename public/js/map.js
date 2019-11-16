// Main event loop
$(document).ready(function() {

  // Upon document load, get map center from geolocation (if available)
  getCenter()

  // Once a client location has been obtained, use the center information to initialize map and events
  .then((center) => initMap(center));
});

// Asynchronous call to browser geolocation API for starting map center coordinates
async function getCenter() {
  let lat = 0.0;
  let lng = 0.0;

  /* geolocation is available */
  if ("geolocation" in navigator) {

    // Wait for request to browser geolocation to resolve
    const position = await new Promise(function(resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    // Then capture location information
    lat = position.coords.latitude;
    lng = position.coords.longitude;

    /* geolocation IS NOT available */
  } else {

    // Set a default center for client view (currently Sydney)
    lat = -33.8688;
    lng = 151.2195;
  };
  console.log(lat);
  console.log(lng);

  // lat and lng wrapped in an object this way because we'll be using the data as a Google Maps LatLng Literal Object
  return {lat, lng};
}

// initMap is passed a center location from resolution of getCenter
function initMap(center) {

  // Initialize socket connection to server
  const socket = io('http://localhost:3000');
  socket.on('connect', function() {
    
    // Initialize map with passed center location
    console.log(center);
    const map = new google.maps.Map(document.getElementById('map'), {
      center,
      zoom: 13
    });


    // Bind autocomplete functionality to places search bar
    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    // Specify just the place data fields that you need.
    autocomplete.setFields(['place_id', 'geometry', 'name', 'formatted_address']);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Client side events object with arrays for event markers and respective infowindows
    const events = {
      markers: [],
      infowindows: []
    }

    // Initialize Event Markers and Infowindows from Handlebars rendered templates
    $('.event-infowindow').each(function(index, elem) {

      // Takes each event template and assigns it to a google InfoWindow object
      let infowindow = new google.maps.InfoWindow();

      // Rather than the actual template element, instead passes an HTML string without the "hide" class
      let infowindowContent = elem.innerHTML.replace(' hide', '').replace('-template', '');

      // setContent will create a new DOM element based on the html passed to it
      infowindow.setContent(infowindowContent);

      // Add infowindow to infowindows array
      events.infowindows.push(infowindow);

      // This marker will have same index as previously added infowindow
      let marker = new google.maps.Marker({map: map});

      // Marker click listener
      marker.addListener('click', function() {
        // Close all windows then open window for the new event
        events.infowindows.forEach((window) => window.close());
        events.infowindows[index].open(map, marker);
      });

      // Set the position of the marker using the place ID and location.
      marker.setPlace({
        
        // Variables captured from data variables on relevant infowindow template
        placeId: $(this).children('.place-id').attr('data-placeid'),
        location: new google.maps.LatLng(parseFloat($(this).attr('data-latitude')), parseFloat($(this).attr('data-longitude')))
      
      });

      // Place marker on map and add to array
      marker.setVisible(true);
      events.markers.push(marker);
    });

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
        data: {
          eventname,
          address,
          placeid,
          lat,
          lng
        },
        success: (results) => {

          // NOTE: THIS AND ERROR BLOCK ARE NOT FIRING CURRENTLY

          // Server POST route should return a 202 status. 
          console.log('line 149 results', results, results.status);

          // For the client who created the new event, map will recenter onto event
          map.setCenter({lat, lng});
          map.setZoom(15);

        },
        error: (err) => console.log(err)
      });
    });
    
    // Socket event listener for new events (I'm seeing a potential namespace problem here)
    socket.on('new event', function(newEvent) {

      console.log('newEvent', newEvent)

      // Capture new event id
      let id = newEvent.id;

      // Create new infowindow html element (Note: this element isn't actually rendered)
      $('#event-infowindow-content-templates').append(function() {
        return $.parseHTML(
        `<div data-latitude=${newEvent.latitude} data-longitude=${newEvent.longitude} data-id=${id} id="${id}-infowindow-content-template" class='event-infowindow hide'>
          <span class="place-name" class="title" data-eventname="${newEvent.eventname}">${newEvent.eventname}</span><br>
          <strong>Place ID:</strong> <span class="place-id" data-placeid="${newEvent.placeid}">${newEvent.placeid}</span><br>
          <span class="place-address" data-address="${newEvent.address}">${newEvent.address}</span><br>
          <span><a href='/events/${id}'>Join Live Chatroom!</a></span>
        </div>`
        );
      });
      console.log('and going');

      // Use html element appended above as template to set infowindow content
      let infowindow = new google.maps.InfoWindow();

      // Again using an HTML string rather than actual HTML element with "hide" class and '-template' id identifier removed
      // Surely there is a cleaner and more logical way of delivering storing and rendering event infowindows...
      let infowindowContent = $(`#${id}-infowindow-content-template`)[0].innerHTML.replace(' hide', '').replace('-template', '');
      infowindow.setContent(infowindowContent);
      events.infowindows.push(infowindow);
  
      let marker = new google.maps.Marker({map: map});
  
      marker.addListener('click', function() {

        // Close all infowindows then open the infowindow for the new event
        events.infowindows.forEach((window) => window.close());

        // Index of new event is the id of the new event minus 1
        events.infowindows[id-1].open(map, marker);

      });

      // Set the position of the marker using the place ID and location.
      marker.setPlace({
        placeId: newEvent.placeid,
        location: {lat: parseFloat(newEvent.latitude), lng: parseFloat(newEvent.longitude)}
      });

      // Set marker visible on map and fire click event for it
      marker.setVisible(true);
      google.maps.event.trigger(marker, 'click');

      // Push to markers array in events object
      events.markers.push(marker);

    });
  });
}