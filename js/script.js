'use strict';

(function() {
  
  /**
   * Main ViewModel KO app.
   */
  function AppViewModel() {

    var self = this;

    this.query = ko.observable(' ');

    /**
     * Mouse over event lister.
     * @param  {Object} place Clickable place object    
     */
    this.onMouseOver = function(place) {
      //trigger click event
      google.maps.event.trigger(place.marker, 'click');
    };
    
    
    
    /**
     * Utility function in which hides or show all markers on the map.
     * @param {Object} map Google Map Object
     */
    this.setAllMarkers = function(map) {
      if(!self.places) {
        return;
      }

      for (var i = 0; i < self.places.length; i++) {
        var place = self.places[i];
        place.marker.setMap(map);
      }

    };

    /**
     * Callback utility method for ajax request
     * @param  {Objct} data JSON Object response from api call.
     * @return {void}      
     */
    this.handlePlaces = function(data) {

      if(!data) {
        return alert('FourSquare Api not available');
      }
      
      self.places = data.response.venues.slice(0,10);
      self.displayPlaces();

      //trigger value change for to fix race condition
      self.query('');
      
    };

    /**
     * Contrustor FourSquare API call. 
     */
    this.getPlaces = function() {

      var clientId = 'PBXSACZTMPAFLIMEURWTEI4HRRONHERVT21KHLJQGUFRZU5M';
      var clientSecret = 'AUUZ1ZUCFSYTXQHJCPMVBEKBTWA2AJO55AARMUUP3ZUD3C3O';
      
      var url =  'https://api.foursquare.com/v2/venues/search?ll=' 
        + self.centerLat 
        + ' , '
        + self.centerLon 
        + '&client_id=' 
        + clientId 
        + '&client_secret=' 
        + clientSecret 
        + '&v=20150428';
      
      $.ajax({
        dataType: "json",
        url: url,
        success: self.handlePlaces,
        error: function() {
          self.handlePlaces(null);
        }
      });
    };

    ko.bindingHandlers.googlemap = {
      init: function(element, valueAccessor) {
          var value = valueAccessor();
          self.centerLat = value.centerLat;
          self.centerLon = value.centerLon;
          var mapOptions = {
              zoom: 17,
              center: new google.maps.LatLng(value.centerLat, value.centerLon),
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          self.map = new google.maps.Map(element, mapOptions);
          self.getPlaces();

        }
    };
    
    
    this.displayPlaces = function() {
      //iterate over the places array and creates a marker and infowindow object on a click event.
      for (var i = 0; i < self.places.length; i++) {
        
        var place = self.places[i];

        var marker = new google.maps.Marker({
          map: this.map,
          title: place.name,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(place.location.lat, place.location.lng)
        });
        
        //build infowindow content
        var contentString = '<strong><a href="https://foursquare.com/v/' + place.id + '">' + place.name + '</a></strong>' + '<p>' + place.location.city + ', ' + place.location.state + '</p>';
        createInfoWindow(marker, contentString);
        
        //keeps a pointer for later use.
        place.marker = marker;  

      }
      
      var infoWindow = new google.maps.InfoWindow();
      
      function createInfoWindow(marker, popupContent) {
        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.setContent(popupContent);
          infoWindow.open(self.map, this);
        });
      }
    };

    /**
     * KO places array binding. Everytime the a user is typing in
     * the search box, this obserbable function is call and filter the
     * places by its name and depening on user input. 
     */
    this.filteredPlaces = ko.computed(function() {
      
      //get user input (needle)
      var search = self.query().toLowerCase().trim();
      
      if( search.length === 0 ) return self.places;

      //hides all markers on the map
      self.setAllMarkers(null);
      
      
      return ko.utils.arrayFilter(self.places, function(place) {
        
        //find the needle in the haystack (use the native indexOf on the place name)
        if(place.name.toLowerCase().indexOf(search) >= 0) {
          //display the marker to those found places
          place.marker.setMap(self.map);
          return true;
        }
        
        return false;
      });
    }, self);
  };
  
  ko.applyBindings(new AppViewModel());

})();
