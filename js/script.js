var map;
var  placesInEncino = [];

var setupKO = function() {
	var viewModel = {
		query: ko.observable(''),
		logMouseOver: function(place) {
			google.maps.event.trigger(place.marker, 'click');
		}
	};

	viewModel.placesInEncino = ko.dependentObservable(function() {
		var search = this.query().toLowerCase();
		setAllMarkers(null);
		return ko.utils.arrayFilter(placesInEncino, function(place) {
			
			if(place.name.toLowerCase().indexOf(search) >= 0) {
				place.marker.setMap(map);
				return true;
			}
			
			return false;
		});
	}, viewModel);

	ko.applyBindings(viewModel);
}

var setAllMarkers = function(map) {
	
	for (var i = 0; i < placesInEncino.length; i++) {
		var place = placesInEncino[i];
		place.marker.setMap(map);
		
	}

}

var displayPlaces = function(map) {
	for (var i = 0; i < placesInEncino.length; i++) {
		
		var place = placesInEncino[i];
		var marker = new google.maps.Marker({
			map: map,
			title: place.name,
			animation: google.maps.Animation.DROP,
			position: new google.maps.LatLng(place.location.lat, place.location.lng)
		});
		var contentString = '<strong><a href="https://foursquare.com/v/' + place.id + '">' + place.name + '</a></strong>' + '<p>' + place.location.city + ', ' + place.location.state + '</p>';
		createInfoWindow(marker, contentString);
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

function getFoursquareData(callback) {
	
	var url =  'https://api.foursquare.com/v2/venues/search' +
	'?ll=34.16,-118.52&client_id=PBXSACZTMPAFLIMEURWTEI4HRRONHERVT21KHLJQGUFRZU5M' +
	'&client_secret=AUUZ1ZUCFSYTXQHJCPMVBEKBTWA2AJO55AARMUUP3ZUD3C3O&v=20150428';

	$.getJSON( url, callback);
}

function initialize() {
	var Encino = new google.maps.LatLng(34.163593, -118.521489);
	
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: Encino,
		zoom: 15
	});	
	
	
	var callback = function(data) {
		placesInEncino = data.response.venues.slice(0,15);
		displayPlaces(map);
		setupKO();
	};
	
	getFoursquareData(callback);
}

google.maps.event.addDomListener(window, 'load', initialize);
