//setting up default variables
var map;
var  placesInEncino = [];

//This function is in charge of setting up KO search box binding and filtering the array of
//places based user input.
var setupKO = function() {
	
	//KO view model definition
	var viewModel = {
		//search box text binding
		query: ko.observable(''),
		
		//mouseOver event handler
		logMouseOver: function(place) {
			google.maps.event.trigger(place.marker, 'click');
		}
	};
	
	
	//KO placesInEncino array binding. Everytime the a user is typing in
	//the search box, this obserbable function is call and filter the
	//places by its name and depening on user input.
	viewModel.placesInEncino = ko.dependentObservable(function() {
		
		//get user input (needle)
		var search = this.query().toLowerCase();
		
		//hides all markers on the map
		setAllMarkers(null);
		
		
		return ko.utils.arrayFilter(placesInEncino, function(place) {
			
			//find the needle in the haystack (use the native indexOf on the place name)
			if(place.name.toLowerCase().indexOf(search) >= 0) {
				//display the marker to those found places
				place.marker.setMap(map);
				return true;
			}
			
			return false;
		});
	}, viewModel);

	ko.applyBindings(viewModel);
}

//utility function in which hides/show the markers on the map
var setAllMarkers = function(map) {
	
	for (var i = 0; i < placesInEncino.length; i++) {
		var place = placesInEncino[i];
		place.marker.setMap(map);
	}

}

//bootstrap the places and makers on the map
var displayPlaces = function(map) {
	
	//iterate over the places array and creates a marker and infowindow object on a click event.
	for (var i = 0; i < placesInEncino.length; i++) {
		
		var place = placesInEncino[i];
		var marker = new google.maps.Marker({
			map: map,
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
			infoWindow.open(map, this);
		});
	}
}


//Performs a Foursqure Api request
function getFoursquareData(callback) {
	
	var clientId = 'PBXSACZTMPAFLIMEURWTEI4HRRONHERVT21KHLJQGUFRZU5M';
	var clientSecret = 'AUUZ1ZUCFSYTXQHJCPMVBEKBTWA2AJO55AARMUUP3ZUD3C3O';
	
	var url =  'https://api.foursquare.com/v2/venues/search' +
	'?ll=34.16,-118.52&client_id=' + clientId + 
	'&client_secret=' + clientSecret + '&v=20150428';

	$.getJSON( url, callback);
}

//main initalization function for google maps and the project in general.
function initialize() {
	var Encino = new google.maps.LatLng(34.163593, -118.521489);
	
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: Encino,
		zoom: 15
	});	
	
	
	var callback = function(data) {
		placesInEncino = data.response.venues.slice(0,10);
		displayPlaces(map);
		setupKO();
	};
	
	//get nearby places from foursquare
	getFoursquareData(callback);
}

google.maps.event.addDomListener(window, 'load', initialize);
