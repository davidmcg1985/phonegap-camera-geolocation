// global variables 
var watchID;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

	console.log("Entering onDeviceReady");
    console.log("Cordova: " + device.cordova);

    //Setup the watch
	//Read the compass every second (500 milliseconds)
	var watchOptions = {
		frequency: 500,
	};

	console.log('Creating watch: %s', JSON.stringify(watchOptions));
  	watchID = navigator.compass.watchHeading(onSuccess, onError, watchOptions);


	$('#items').on('click', '.delete', function (e) {
		itemList.deleteItem(parseInt($(this).parent().find('.key').text()));
		return false;
	});
		
	itemList.open();

    if( $('#items li').length > 0 ) {
		console.log('there is items in the list');
		$('#itemHeading').text('Your recent photos');
	} else {
		console.log('no items in list');
		$('#itemHeading').text('Nothing to show, why dont you take a photo?');
	}

  	console.log("Leaving onDeviceReady");
};


// compass
function onSuccess(heading) {
  console.log("Entering onSuccess");
  console.log('Received Heading');
  console.log(JSON.stringify(heading));
  var hv = Math.round(heading.magneticHeading);
  $('#headingInfo').html('Heading: ' + hv + ' &deg;');
  console.log('Rotating to ' + hv + ' &deg;');
  $("#compassImg").rotate(-hv);
  console.log("Leaving onSuccess");
}

function onError(err) {
  var msg;
  console.log("Entering onError");
  console.error('Error: ' + JSON.stringify(err));
  //Remove the watch since we're having a problem
  navigator.compass.clearWatch(watchID);
  //Clear the heading value from the page  
  $('#headingInfo').html('<b>Heading: </b>None');
  //Then tell the user what happened.
  switch (err.code) {
  case CompassError.COMPASS_NOT_SUPPORTED:
    msg = 'Compass not supported';
    break;
  case CompassError.COMPASS_INTERNAL_ERR:
    msg = 'Internal compass error';
    break;
  default:
    msg = 'Unknown heading error!';
  }
  console.error(msg);
  navigator.notification.alert(msg, null, "Compass Error", "Continue");
  console.log("Leaving onError");
}


// geolocation and localstorage
// bind button and ul
$(function () {
	$('#submit').on('click', function (e) {

		navigator.camera.getPicture(onPhotoDataSuccess, onFail, { 
			quality: 75,
			destinationType: Camera.DestinationType.DATA_URL,
			allowEdit: true,
			saveToPhotoAlbum: true
		});

		function onPhotoDataSuccess(imageData) {
			var myImage = document.getElementById('myImage');
			myImage.src = "data:image/jpeg;base64," + imageData;
			console.log(myImage.src);

			itemList.addItem(
				myImage.src,
				$('#name').val(),
				'',
				'',
				$('#headingInfo').html(),
				''
			);
			$('input:text').val('');
			$('#itemHeading').text('Your recent photos');
			return false;			
		}

		$('#items').on('click', '.delete', function (e) {
			itemList.deleteItem(parseInt($(this).parent().find('.key').text()));
			return false;
		});
		
		itemList.open();

		function onFail(message) {
			console.log('Failed because: ' + message);
		}
	});
});

itemList = {}; 

itemList.open = function() {
	this.list = { }; 
	if (localStorage.itemList) {
		 this.list = JSON.parse(localStorage.itemList);
	}
	itemList.getAllItems();
};

// add - method renamed and more arguments
itemList.addItem = function(photo,name,lat,lng,headingInfo,timestamp) {
	console.log(arguments.callee.name, arguments);
	key = new Date().getTime();
	this.list[key] = {
		'photo':photo,
		'name':name,
		'lat':lat,
		'lng':lng,
		'headingInfo':headingInfo,
		'timestamp':timestamp
		};
	localStorage.itemList = JSON.stringify(this.list);
	
	this.getAllItems();

	if (navigator.geolocation) {

		var timeoutVal = 55000; 
		var maximumAgeVal = 60000;
		var options = { enableHighAccuracy: true };

			navigator.geolocation.getCurrentPosition(
				function (position) {
					updatePosition(position,key)
				}, 
				displayError, options
			);
		}
		else {
			alert("Geolocation is not supported by this browser or device");
	}
};

// read each item from list and render on display
itemList.getAllItems = function() {
	$('#items').html('');
	for (var key in this.list) {
		renderItem(key, this.list[key]);
	}
};

// delete
itemList.deleteItem = function(key) { 
	console.log(arguments.callee.name, arguments);
	delete this.list[key];
	localStorage.itemList = JSON.stringify(this.list);
	this.getAllItems(); 
	if ($('#items li').length == 0) {
		$('#itemHeading').text('Nothing to show, why dont you take a photo?');
	}
};


// update - method has more arguments
itemList.updatePosition = function(lat,lng,timestamp,key) {
	console.log(arguments); 
	this.list[key]['lat'] = lat;
	this.list[key]['lng'] = lng;
	this.list[key]['timestamp'] = timestamp;
	localStorage.itemList = JSON.stringify(this.list); 
	this.getAllItems();  
};
	

// render output to #items ul
function renderItem(key,value,timestamp) {

	var today = new Date(value.timestamp);
	var dd = today.getDate();
	var mm = today.getMonth()+1;//January is 0, so always add + 1

	var yyyy = today.getFullYear();
	if(dd<10){dd='0'+dd}
	if(mm<10){mm='0'+mm}
	var today = dd+'/'+mm+'/'+yyyy;

	var li = '<li><span class="photo"><img src="'+ value.photo +'" style="width: 100%; border-bottom: #38C 2px solid;"/></span><br/>';
	li += '<i class="fa fa-user"></i>&nbsp;<span class="name">'+value.name+'</span><br/>';
	li += '<i class="fa fa-map-marker"></i>&nbsp;<span class="lat">'+value.lat+' (Lat)</span><br/>';
	li += '<i class="fa fa-map-marker"></i>&nbsp;<span class="lng">'+value.lng+' (Lng)</span><br/>';
	li += '<i class="fa fa-compass"></i>&nbsp;<span class="heading">'+value.headingInfo+'</span><br/>';
	li += '<i class="fa fa-calendar"></i>&nbsp;<span class="timestamp">'+ today +'</span><br/>';
	li += '<a href="#" class="delete ui-btn">Delete</a><span class="key">'+key+'</span></li>';
	$('#items').prepend(li);

}

// update coords
function updatePosition(position, key) {
	console.table(position); // postion Object
	console.log(position.coords.latitude, position.coords.longitude, position.timestamp);
	console.log(key); // when GPS called and record to be updated
	console.table(new Date().getTime()); // when GPS returned
	console.log(position.timestamp);
	itemList.updatePosition(position.coords.latitude, position.coords.longitude, position.timestamp, key);
}

// error handling
function displayError(error) {
	var errors = { 
		1: 'Geolocation permission denied',
		2: 'Position unavailable',
		3: 'Geolocation request timeout'
	};
	alert("Error: " + errors[error.code]);
	console.log("Error: " + errors[error.code]);
}