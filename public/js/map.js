$(() => {
  // function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13
  });


  // Bind autocomplete functionality to place search bar
  var input = document.getElementById('pac-input');
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  // Specify just the place data fields that you need.
  autocomplete.setFields(['place_id', 'geometry', 'name', 'formatted_address']);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Client side events object
  const events = {
    markers: [],
    infowindows: []
  }

  // Initialize Event Markers and Infowindows
  $('.event-infowindow').each(function(index, elem) {
    let infowindow = new google.maps.InfoWindow();
    let infowindowContent = elem;
    infowindow.setContent(infowindowContent);
    console.log(infowindow.content);
    events.infowindows.push(infowindow);

    let marker = new google.maps.Marker({map: map});

    marker.addListener('click', function() {
      events.infowindows[index].open(map, marker);
    });
    console.log($(this).children('.place-id').attr('data-placeid'));
    console.log($(this).attr('data-latitude'), $(this).attr('data-longitude'));

    // Set the position of the marker using the place ID and location.
    marker.setPlace({
      placeId: $(this).children('.place-id').attr('data-placeid'),
      location: new google.maps.LatLng(parseFloat($(this).attr('data-latitude')), parseFloat($(this).attr('data-longitude')))
    });
    marker.setVisible(true);
    events.markers.push(marker);
  });



  autocomplete.addListener('place_changed', function() {

    var place = autocomplete.getPlace();

    if (!place.geometry) {
      return;
    }

    // Close previous infowindow
    events.infowindows[events.infowindows.length-1].close();

    // Once a place is selected, send API POST request to create new event
    let eventname = place.name;
    let address = place.formatted_address;
    let placeid = place.place_id;
    let lat =  place.geometry.location.lat();
    let lng = place.geometry.location.lng();
    console.log('place', placeid);
    console.log(lat);
    console.log(lng);
    $.post({
      url: '/api/events',
      data: {
        eventname,
        address,
        placeid,
        lat,
        lng
      },
    }).then(function(results) {
      console.log(results);
      console.log(place.name);
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      };
      console.log('keep going');

      // Find index of last event
      let index = events.markers.length + 1;
      console.log(index);

      // Create new infowindow html element (Note: this element isn't actually rendered)
      $('#event-infowindow-contents').append(function() {
        return $.parseHTML(
        `<div data-latitude=${lat} data-longitude=${lng} data-id=${index} id="${index}-infowindow-content" class='event-infowindow'>
          <span class="place-name" class="title" data-eventname="${eventname}">${eventname}</span><br>
          <strong>Place ID:</strong> <span class="place-id" data-placeid="${placeid}">${placeid}</span><br>
          <span class="place-address" data-address="${address}">${address}</span>
        </div>`
        );
      });
      console.log('and going');

      // Use html element appended above as element to set infowindow content
      let infowindow = new google.maps.InfoWindow();
      let infowindowContent = $(`#${index}-infowindow-content`)[0];
      infowindow.setContent(infowindowContent);
      events.infowindows.push(infowindow);
  
      let marker = new google.maps.Marker({map: map});
  
      marker.addListener('click', function() {
        events.infowindows[events.infowindows.length-1].open(map, marker);
      });

      // Set the position of the marker using the place ID and location.
      marker.setPlace({
        placeId: place.place_id,
        location: place.geometry.location
      });

      marker.setVisible(true);
      events.markers.push(marker);

      infowindow.open(map, marker);
    });
  });
  // }
  // initMap();
});