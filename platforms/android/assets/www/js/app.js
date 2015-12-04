$(document).ready(function() {
	
	$("#takePhoto").click(function() {

		navigator.camera.getPicture(onSuccess, onFail, { 
			quality: 100,
		    destinationType: Camera.DestinationType.DATA_URL,
		    allowEdit : true,
		    saveToPhotoAlbum: true
		});

		function onSuccess(imageData) {
		    var image = document.getElementById('myImage');
		    image.src = "data:image/jpeg;base64," + imageData;
		}

		function onFail(message) {
		    alert('Failed because: ' + message);
		}
	});

});


// bind button and ul
$(function () {
	$('[type=submit]').on('click', function (e) {
		photoList.addPhoto(
			$('#name').val(),
			'check location settings',
			'check location settings'
		);
		$('input:text').val('');
		return false;
	});
	$('#photos').on('click', '.delete', function (e) {
		photoList.deletePhoto(parseInt($(this).parent().find('.key').text()));
		return false;
	});
	photoList.open();
});

photoList = {}; 

photoList.open = function() {
	this.list = { }; 
	if (localStorage.photoList) {
		 this.list = JSON.parse(localStorage.photoList);
	} 
	photoList.getAllPhotos();
};		

// add - method renamed and more arguments
photoList.addPhoto = function(name,address,type,lat,lng) {
	console.log(arguments.callee.name, arguments);
	key = new Date().getTime();
	this.list[key] = {
		'name':name,
		'lat':lat,
		'lng':lng
		};
	localStorage.photoList = JSON.stringify(this.list);
	this.getAllPhotos();
	if (navigator.geolocation) {
			var timeoutVal = 55000; 
			var maximumAgeVal = 60000;
			navigator.geolocation.getCurrentPosition(
				function (position) {updatePosition(position,key)}, 
				displayError
			);
		}
		else {
			alert("Geolocation is not supported by this browser or device");
	}
};

// read each item from list and render on display
photoList.getAllPhotos = function() {
	$('#photos').html('');
	for (var key in this.list) {
		renderPhoto(key, this.list[key]);
	}
};

// delete
photoList.deletePhoto = function(key) { 
	console.log(arguments.callee.name, arguments);
	delete this.list[key];
	localStorage.photoList = JSON.stringify(this.list);
	this.getAllPhotos(); 
};

// update - method has more arguments
photoList.updatePosition = function(lat,lng,key) {
	console.log(arguments); 
	this.list[key]['lat'] = lat;
	this.list[key]['lng'] = lng;
	localStorage.photoList = JSON.stringify(this.list); 
	this.getAllPhotos();  
};		

// render output to #photos ul
function renderPhoto(key,value) {
	var li = '<li>Name: <span class="name">'+value.name+'</span><br/>';
	li += 'Latitude: <span class="lat">'+value.lat+'</span><br/>';
	li += 'Longitude: <span class="lng">'+value.lng+'</span><br/>';
	li += '<a href="#" class="delete">Delete</a><span class="key">'+key+'</span></li>';
	$('#photos').append(li);
}

// update coords
function updatePosition(position, key) {
	console.table(position); // postion Object
	console.log(position.coords.latitude, position.coords.longitude);
	console.log(key); // when GPS called and record to be updated
	console.table(new Date().getTime()); // when GPS returned
	photoList.updatePosition(position.coords.latitude, position.coords.longitude, key);
	
}

// error handling
function displayError(error) {
	var errors = { 
		1: 'Geolocation Permission denied',
		2: 'Position unavailable',
		3: 'Geolocation Request timeout - is your GPS ***really*** switched on?'
	};
	alert("Error: " + errors[error.code]);
	console.log("Error: " + errors[error.code]);
}