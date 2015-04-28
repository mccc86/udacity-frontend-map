





var map;
var placesList;

function initialize() {
	var Encino = new google.maps.LatLng(34.163593, -118.521489);
	map = new google.maps.Map(document.getElementById('map-canvas'), {
	  center: Encino,
		zoom: 12
  });	

}
google.maps.event.addDomListener(window, 'load', initialize);


$(function() {
    var placesInEncino = [
        {
        name: "Aroma Bakery",
        address: "New Holland Brewing Company",
        style: "Imperial Stout"},
    {
        name: "Cafe Carolina",
        address: "Bell's",
        style: "Wheat"},
    {
        name: "McDonalds",
        address: "New Holland Brewing Company",
        style: "Mole Ale"}
        ];

    var viewModel = {
        query: ko.observable('')
    };

    viewModel.placesInEncino = ko.dependentObservable(function() {
        var search = this.query().toLowerCase();
        return ko.utils.arrayFilter(placesInEncino, function(place) {
            return place.name.toLowerCase().indexOf(search) >= 0;
        });
    }, viewModel);

    ko.applyBindings(viewModel);
});
  




