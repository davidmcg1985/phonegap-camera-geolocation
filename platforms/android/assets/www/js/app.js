// events
$(function () {
	$('[type=submit]').on('click', function (e) {
		venueList.addVenue(
			$('#name').val(),
			$('#address').val(),
			$('#type').val(),
			'######',
			'######'
		);
		$('input:text').val(''); // reset form elements of type text after the input data has been stored
		return false;
	});

	$('#venues').on('click', '.delete', function (e) {
		venueList.deleteVenue(parseInt($(this).parent().find('.key').text()));
		return false;
	});
	
	// DWT - add update event handler to [Update] text, this event handler modelled on delete event handler which also refers to a specific record
	$('#venues').on('click', '.update', function (e) {
		// use six classes to address the five pieces of information plus the key
		var name = $(this).parent().find('.name').text(); 
		var address = $(this).parent().find('.address').text();
		var type = $(this).parent().find('.type').text();
		//var lat = $(this).parent().find('.lat').text();
		//var lng = $(this).parent().find('.lng').text();
		var key = parseInt($(this).parent().find('.key').text()); // DWT - key that identifies the record is within the invisble span
		venueList.updateVenue(name,address,type,key);
		return false;
	});

	venueList.open(); // open displays the data previously saved

});



venueList = {}; // addVenue, getAllVenues, deleteVenue, updateVenue - are own methods

// open/create - method & variable(s) renamed but otherwise no changes
venueList.open = function() {
	this.list = { }; // create an empty data structure by default
	if (localStorage.venueList) {
		 // do work here - Read from serialized data from persistent storage
		 this.list = JSON.parse(localStorage.venueList);
	} 
	venueList.getAllVenues(); // Refresh the screen
};		


// add - method renamed and more arguments
venueList.addVenue = function(name,address,type,lat,lng) {
	console.log(arguments.callee.name, arguments); // DWT - handy for debugging functions
	//name="mark";address="high st";type="bar";lat=55;lng=-4;
	key = new Date().getTime();
	this.list[key] = {
		'name':name,
		'address':address,
		'type':type,
		'lat':lat,
		'lng':lng
		};
	// stringify the list as before
	localStorage.venueList = JSON.stringify(this.list);
	this.getAllVenues(); // Refresh the screen
	// having stored with dummy position attempt to find position to upadte record wehn position available
	if (navigator.geolocation) {
			var timeoutVal = 55000; // 50 seconds for GPS or other geolocation to work
			var maximumAgeVal = 60000 // 60 seconds
			navigator.geolocation.getCurrentPosition(
				function (position) {updatePosition(position,key)}, 
				displayError
				
			);
		}
		else {
			alert("Geolocation is not supported by this browser or device");
	}
};
// following optional parameters not suitabl for ripple, restore for developer app and fully built app on GPS enabled device
// { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: maximumAgeVal }

// read each item from list and render on display - no changes required!!!
venueList.getAllVenues = function() {
	$('#venues').html('');
	for (var key in this.list) {
		renderVenue(key, this.list[key]);
	}
};

// delete - no changes required!!!
venueList.deleteVenue = function(key) { 
	console.log(arguments.callee.name, arguments); // DWT - handy for debugging functions
	delete this.list[key];// do work here - delete the element from data structure
	localStorage.venueList = JSON.stringify(this.list); // do work here - serialize data and refresh (store in) persistent data
	this.getAllVenues();  // Refresh the screen
};

// update - method has more arguments
venueList.updateVenue = function(name,address,type,key) {
	console.log(arguments); // DWT - handy for debugging functions
	//name="mark";address="high st";type="bar";lat=55;lng=-4;
	this.list[key]['name'] = name;
	this.list[key]['address'] = address;
	this.list[key]['type'] = type;
	/* this.list[key] = {
		'name':name,
		'address':address,
		'type':type,
		'lat':lat,
		'lng':lng
	};	// list item is an object rather than a primitive string */
	localStorage.venueList = JSON.stringify(this.list); // do work here - Refresh persistent Storage
	this.getAllVenues();  // no change other than name of method
};		

// update - method has more arguments
venueList.updatePosition = function(lat,lng,key) {
	console.log(arguments); // DWT - handy for debugging functions
	this.list[key]['lat'] = lat;
	this.list[key]['lng'] = lng;
	localStorage.venueList = JSON.stringify(this.list); // do work here - Refresh persistent Storage
	this.getAllVenues();  // no change other than name of method
};		



// helper
function renderVenue(key,value) {
	// console.log(arguments); // DWT - handy for debugging functions
	var li = '<li>Name: <span class="name" contenteditable="true">'+value.name+'</span><br/>';
	li += 'Address: <span class="address" contenteditable="true">'+value.address+'</span><br/>';
	li += 'Venue Type: <span class="type" contenteditable="true">'+value.type+'</span><br/>';
	li += 'Latitude: <span class="lat">'+value.lat+'</span><br/>';
	li += 'Longitude: <span class="lng">'+value.lng+'</span><br/>';
	// must have three editable and five addressable sections sections for five pieces of information
	li += '<a href="#" class="update">Update</a> &nbsp;'; 
	li += '<a href="#" class="delete">Delete</a><span class="key">'+key+'</span></li>';
	$('#venues').append(li);
}


function displayError(error) {
	var errors = { 
		1: 'Geolocation Permission denied',
		2: 'Position unavailable',
		3: 'Geolocation Request timeout - is your GPS ***really*** switched on?'
	};
	alert("Error: " + errors[error.code]);
	console.log("Error: " + errors[error.code]);
}

function updatePosition(position, key) {
	console.table(position); // postion Object
	console.log(position.coords.latitude, position.coords.longitude);
	console.log(key); // when GPS called and record to be updated
	console.table(new Date().getTime()); // when GPS returned
	venueList.updatePosition(position.coords.latitude, position.coords.longitude, key);
	
}