$(document).ready(function () {
	History = window.History;
	
	//save trips
	$("button#save_trips_popup").click(function () {
		if (IsLogin == 'N') {
			alert ("You have to sign in for this.");
			$("button#logIn").click();
			return;
		}
		
		//if (isSavedTrips == true) {
			
			var deptPlace = $("div#ways_wrap").find("div#way_view:first").find("p[name='tripLocationText']").text();
			var destPlace = $("div#ways_wrap").find("div#way_view:last").find("p[name='tripLocationText']").text();
			var distance = $("div#ways_wrap").find("div#way_view:last").find("div#way_distance").find("span").text();
			var duration = $("div#ways_wrap").find("div#way_view:last").find("div#way_time").find("span").text();
			//var fuelCost = $("#planTripLocationList").find("div#planTripLocationItem:last").find("#tripItemFuelCost").text();
			
			if (distance == "" || duration == "") {
				alert ("Please complete the plan trip.");
				return;
			}
			
			//$("#txtPlanTripTitle").val( "");
			var strDescription = "Departure Place : " + deptPlace + "\n";
			var strPageTitle = deptPlace + " - " + destPlace;
			strDescription += "Destination Place : " + destPlace + "\n";
			strDescription += "Distance : " + distance + "\n";
			strDescription += "Duration : " + duration + "\n";
			//strDescription += "Fuel Cost : " + fuelCost;
			$("form#tripsSaveForm").find("input[name='trips_page_title']").val( strPageTitle );
			$("form#tripsSaveForm").find("textarea[name='trips_description']").val( strDescription );
			$("div#trip_save_view").removeClass("hide");
			$("div#trips_view").hide();
			$("div#place_view").hide();
		//}else{
			//alert( _lang("Plan Trip updated successfully.") );
		//}
	});
	$("a#trip_save_cancel").click(function () {
		$("div#trip_save_view").addClass("hide");
		$("div#trips_view").show();
		$("div#place_view").hide();
	});
	$("a#trip_save").click(function () {
		//var planTripId = $("#planTripId").val();
		var tripKey = Trips_key;
		var planTripTitle = $("input[name='trips_name']").val();
		var planTripDescription= $("textarea[name='trips_description']").val();
		var planTripPageTitle= $("input[name='trips_page_title']").val();
		if( planTripTitle == "" ){ alert ("Please input Trip title."); return; }
		
		$.ajax({
			  url: Base_Url + "/trips/savePlanTrip",
			  dataType : "json",
			  type : "POST",
			  data : { 
				   		  	tripKey : tripKey, 
				   	  planTripTitle : planTripTitle, 
				planTripDescription : planTripDescription, 
				  planTripPageTitle : planTripPageTitle 
		      },
			  success : function (data) {
				  if (data.result == 'success') {
					  $("#planTripId").val( data.planTripId );
					  fnClearMapForNewTrip();
					  $("a#trip_save_cancel").click();
					  alert("Plan Trip saved successfully.");
					  
				  } else if (data.result == 'login_failed')
					  alert ("Login Failed please Login");
					  
			  }
		});
	});
	$("div#saved_trips_view").click(function () {
	    var tempUrl = Base_Url + '/trips/load_saved_trips_modal';
        $("div#ts_model").load(tempUrl, function () {
            $("div#savedTripsModal").modal('show');
        });
	});
});
function onClickTripItemAdd (obj, autoComplete) {
	isLoadPlanTrip = true;
	var objClone = $("#clone_way_view").clone();
	objClone.removeClass("hide").fadeIn(500);;
	objClone.attr("id", "way_view");
	if ( obj == null || obj == undefined ) {		
		$("div#ways_wrap").append(objClone);
	} else {
		$(obj).closest("div#way_view").find("div#way_distance").find("span").html( "&nbsp;" );
		$(obj).closest("div#way_view").find("div#way_time").find("span").html( "&nbsp;" );
		
		$(obj).closest("div#way_view").after( objClone );
	}
	//$("i#way_point_add").click(); 
	if (autoComplete) {
	    $("input[name='tripLocationText']").autocomplete({
	          source: function( request, response ) {
	            $.ajax({
	              url: Base_Url + "/trips/searchLocationOnGoogleMap",
	              dataType: "json",
	              data: {
	                  keyword: request.term
	              },
	              type : "POST",
	              success: function( data ) {
	                  if( data.location != null ){
	                      response( $.map( data.location, function( item ) {
	                        return {
	                          reference: item.reference,
	                          value: item.description
	                        }
	                      }));
	                  }
	              }
	            });
	          },
	          minLength: 2,
	          select: function (event, ui) {
	              // if searched, set marker and move focus
	              isLoadPlanTrip = true;
	              var reference = ui.item.reference;
	              var title = ui.item.value;
	              var selectedObj = $(this);
	              $.ajax({
	                  url: Base_Url + "/trips/getLocationInfoByReference",
	                  dataType : "json",
	                  type : "POST",
	                  data : { reference : reference },
	                  success : function (data) {
	                      if (data.result == "success") {
	                    	  var lat = data.locationInfo.result.geometry.location.lat;
	                          var lon = data.locationInfo.result.geometry.location.lng;
	                          
	                          //objClone.find("#planTripLocationLat").val( lat );
	                          //objClone.find("#planTripLocationLon").val( lon );
	                          //objClone.find("#planTripLocationType").val( 2 );
	                          var tripKeySelected = true;
	                          if (Trips_key == '') {
	                        	  Trips_key = GetRandomNumber(9);
	                        	  var tripKeySelected = false;
	                          }
	                          $.ajax({
	                              url: Base_Url + "/trips/addNewTripLocation",
	                              dataType : "json",
	                              type : "POST",
	                              data : {title : title, lat : lat, lon : lon, locationType : 2, tripKey: Trips_key},
	                              success : function(data){
	                                  if (data.result == "success") {
	                                      var tripKey = data.tripKey;
	                                      selectedObj.closest("div#way_view").find("div.way-detail").find("input#locationId").val(data.locationId);
	                                      selectedObj.replaceWith("<p class='form-control input-lg' name='tripLocationText' disabled>" + title + "</p>");
	                                      
	                                      if (!tripKeySelected) {
	                                    	  var state = { id: tripKey, type : "trips", 'reset' : 0 };
	                      	  	  		      History.replaceState(state, SiteName, "/user_trips/" + tripKey );
	                                      } else
	                                    	  fnDrawPlanTrip();
	                                      //fnSavePlanTripLocationList();
	                                  } else 
	                                	  alert("Failed");
	                              }
	                          });                          
	                      }else{
	                          alert( "Failed" );
	                          return;
	                      }
	                  }
	              });
	          },
	          open: function() {
	            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
	            $(this).autocomplete('widget').css('z-index', 300);
	          },
	          close: function() {
	            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
	          }
	    });
	    if (!(obj == null || obj == undefined)) { 
			fnDrawPlanTrip();
	    }
	    fnResetPlanTripItemNo();
	    
	    removeTripInput();
	}
}
function fnDrawPlanTrip () {
	var objList = $("div#trips_view").find("div#way_view");
	fnRemoveMarkers( MarkerPlanTripList );
	MarkerPlanTripList = [];
	
	fnRemoveDirection( DirectionPlanTripDisplayList );
	DirectionPlanTripDisplayList = [];
	
	var currentKey = window.location.pathname.split('/')[2];
	 $.ajax({
         url: Base_Url + "/trips/getTripLocationByKey",
         dataType : "json",
         type : "POST",
         data : {locationType : 2, currentKey: currentKey},
         success : function(data){
             if(data.result == "success") {
                 var locationInfo = data.tripLocations;
                 console.log(locationInfo);
                 for (var i = 0 ; i < locationInfo.length; i ++) {
             		var lat = locationInfo[i].ts_lat;
            		var lon = locationInfo[i].ts_lon;
            		var locationId = locationInfo[i].location_id;
            		//var locationType = objList.eq(i).find("#planTripLocationType").val();
              	  	if( lat != "" && lon != "") {
            	  	  	var myLatlng = new google.maps.LatLng( lat, lon);
            	  	  	var imageURL = "";
            	  	  	imageURL = Base_Url + "/assets/img/marker" + Number( i + 1 ) + ".png";
            	  	  	var image = {
            		  		url: imageURL,
            		  		size: new google.maps.Size(29, 40),
            		  		origin: new google.maps.Point(0,0),
            		  		anchor: new google.maps.Point(15, 37)
            	  	  	};
            	  	  	var markerTemp = new google.maps.Marker({
            	  	  		position: myLatlng,
            	  	  		map: map,
            	  	  		icon: image,
            	  	  		zIndex : 10000,
            	  	  		locationId : locationId
            	  	  	});
            	  	  	map.setCenter(new google.maps.LatLng( lat, lon ) );
            	  	  	MarkerPlanTripList[ i ] = markerTemp;
              	  	} else {
              	  		MarkerPlanTripList[i] = null;
              	  	}
                 }
             	for ( var i = 0; i < locationInfo.length - 1; i ++ ) {

            		var lat1 = locationInfo[i].ts_lat;
            		var lon1 = locationInfo[i].ts_lon;
            		var lat2 = locationInfo[i + 1].ts_lat;
            		var lon2 = locationInfo[i + 1].ts_lon;
            		
            		var departure = lat1 + "," + lon1;
            		var destination = lat2 + "," + lon2;
            		fnGetDistanceDuration(departure, destination, i);
            	}
             	DirectionPlanTripDisplayList = fnAddDirections( MarkerPlanTripList, true );	
            	
             } else {
           	  return;
             }
         }
     });                          

}

function fnSavePlanTripLocationList () {
//	var planTripId = $("#planTripId").val();
//	var objList = $("#planTripLocationList").find("div#planTripLocationItem").find("input#planTripLocationId");
//	var locationIds = [];
//
//	for (var i = 0; i < objList.length; i ++) {
//		if( objList.eq(i).val() != ""){
//			locationIds[locationIds.length] = objList.eq(i).val();
//		}		
//	}	
//    $.ajax({
//        url: "/async-savePlanTripLocationList.php",
//        dataType : "json",
//        type : "POST",
//        data : { planTripId : planTripId, locationIds : locationIds },
//        success : function(data){
//            if(data.result == "success"){
//            	fnDrawPlanTrip();
//            }
//        }
//    });		
	return true;
}

function fnGetDistanceDuration (departure, destination, pos) {
	if( departure == "," || destination == "," ){		
	  return;
	}
	$.ajax({
		  url: Base_Url + "/trips/getDistanceDuration",
		  dataType : "json",
		  type : "POST",
		  data : { departure : departure, destination : destination },
		  success : function (data) {
			  if (data.result == "success") {
				  var distance = data.info.rows[0].elements[0].distance.value;
				  var duration = data.info.rows[0].elements[0].duration.value;

				  $("div#ways_wrap").find("div#way_view").eq(pos).find("#tripItemDistanceValue").val( distance );
				  $("div#ways_wrap").find("div#way_view").eq(pos).find("#tripItemTimeValue").val( duration );
				  //$("#planTripLocationList").find("div#planTripLocationItem").eq(pos).find("#tripItemFuleCostValue").val( Number( distance * fuelPrice / 1000 ) );
				  //var fuelCost = Math.round(Number( distance * fuelPrice / 1000 ),1) + "$";
				  if( distance < 1000 )
					  distance = distance + "m";
				  else
					  distance = Math.floor( distance / 1000 ) + "km";
				  
				  var hour = Math.floor( duration / 3600 );
				  var min = Math.floor((duration % 3600) / 60);
				  duration = "";
				  if( hour != 0 )
					  duration = hour + "h ";
				  if( min != 0 )
					  duration = duration + min + "m";
				  
				  $("div#ways_wrap").find("div#way_view").eq(pos).find("div#way_distance").find("span").text( distance );
				  $("div#ways_wrap").find("div#way_view").eq(pos).find("div#way_time").find("span").text( duration );
				  //$("#ways_wrap").find("div#planTripLocationItem").eq(pos).find("div#tripItemFuelCost").text( fuelCost );
				  
				  var objList =$("div#ways_wrap").find("div#way_view");
				  duration = 0;
				  distance = 0;
				  
				  if (pos == objList.size() - 2) {
					  for (var i = 0 ; i < objList.length - 1; i ++) {
						  distance += Number(objList.eq(i).find("#tripItemDistanceValue").val());
						  duration += Number(objList.eq(i).find("#tripItemTimeValue").val());						  
					  }
					  //var fuelCost = Math.round(Number( distance / 1000 * fuelPrice ),1) + "$";
					  if( distance < 1000 )
						  distance = distance + "m";
					  else
						  distance = Math.floor( distance / 1000 ) + "km";
					  
					  hour = Math.floor( duration / 3600 );
					  min = Math.floor((duration % 3600) / 60);
					  duration = "";
					  if( hour != 0 )
						  duration = hour + "h ";
					  if( min != 0 )
						  duration = duration + min + "m";					  
					  
					  $("div#ways_wrap").find("div#way_view").eq(pos + 1).find("div#way_distance").find("span").text( distance );
					  $("div#ways_wrap").find("div#way_view").eq(pos + 1).find("div#way_time").find("span").text( duration );
					  //$("#planTripLocationList").find("div#planTripLocationItem").eq(pos + 1).find("div#tripItemFuelCost").text( fuelCost );
				  }				  
			  }
		  }
	});
}
//Add Directions
function fnAddDirections (markerList, draggable) {
	var markerNewList = [];
	for (var i = 0 ; i < markerList.length; i++) {
		if( markerList[i] != null ){
			markerNewList[ markerNewList.length ] = markerList[ i ];
		}
	}
	var arrDirectionList = [];
	for (var i = 0 ; i < markerNewList.length - 1; i++) {
		var start = markerNewList[i].getPosition();
		var end = markerNewList[i+1].getPosition();
		var directionsDisplay = fnAddDirection( start, end, i, draggable);
		arrDirectionList[i] = directionsDisplay;
	}
	return arrDirectionList;
}

// Add Direction
function fnAddDirection (start, end, pos, draggable) {
	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	
	directionsDisplay = new google.maps.DirectionsRenderer(  );
	directionsDisplay.setMap(map);
	directionsDisplay.setOptions({ draggable:draggable });
	directionsDisplay.setOptions({suppressMarkers : true});
	
    var request = {
        origin: start, 
        destination: end,   
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        optimizeWaypoints: true
    };

	directionsService.route(request, function(response, status) {
 		if (status == google.maps.DirectionsStatus.OK) {
	      directionsDisplay.setDirections(response);
 		}
	});
	if (draggable == true) {
		google.maps.event.addListener(directionsDisplay, 'directions_changed', function(){
			var waypoints = directionsDisplay.directions.routes[0].legs[0].via_waypoint;
			if (waypoints.length > 0) {
				var cntPos = 0;
				var lat, lon;
				for (var key in waypoints[0].location) {
					if( cntPos == 0 ) lat = waypoints[0].location[key];
					else if( cntPos == 1 ) lon = waypoints[0].location[key];
					else break;
					cntPos ++;
				}
				// if( waypoints[0].location.nb != "" && waypoints[0].location.ob != "" ){
					// var lat = waypoints[0].location.nb;
				    // var lon = waypoints[0].location.ob;
				    var objCurrent = $("#planTripLocationList").find("div#planTripLocationItem").find("a#tripItemAdd").get( pos );
				    onClickTripItemAdd( objCurrent, false );
				    $("#planTripLocationList").find("div#planTripLocationItem").eq( pos + 1).find("#planTripLocationLat").val( lat );
				    $("#planTripLocationList").find("div#planTripLocationItem").eq( pos + 1).find("#planTripLocationLon").val( lon );
				    $("#planTripLocationList").find("div#planTripLocationItem").eq( pos + 1).find("#planTripLocationType").val( 3 );
				    $("#planTripLocationList").find("div#planTripLocationItem").eq( pos + 1).find("#txtTripLocation").val("via")
				    $("#planTripLocationList").find("div#planTripLocationItem").eq( pos + 1).find("#txtTripLocation").prop("readonly", true);
	  				$.ajax({
						url: "/async-addNewLocation.php",
						dataType : "json",
						type : "POST",
						data : { title : "via", lat : lat, lon : lon, locationType : 3},
						success : function(data){
							if (data.result == "success") {
								$("#planTripLocationList").find("div#planTripLocationItem").eq( pos + 1).find("#planTripLocationId").val( data.locationId );
								fnSavePlanTripLocationList();
							} else {
								alert( _lang("Login Failed") );
								return;
							}
						}
					});				    
				// }
			}
				
		});
	}

	return directionsDisplay;
}
function fnResetPlanTripItemNo () {
	$("div#ways_wrap").find("div#way_view").each( function (index) {
		$(this).find("div#index").text( index + 1 );
	});
}
//remove
function removeTripInput () {
	$("div#trips_remove").click(function () {
		var locationId = $(this).closest("div#way_view").find("div.way-detail").find("input#locationId").val();

		if (!(locationId == undefined || locationId == null))
			fnRemoveLocationById (locationId);
		if ( $("div#ways_wrap").find("div#way_view").size() <= 2) {
			$(this).closest("div#way_view").find("i#way_point_add").click();
			$(this).closest("div#way_view").find("div#trips_remove").click();
		} else {
			$(this).closest("div#way_view").remove();
			fnResetPlanTripItemNo();
		}
		isLoadPlanTrip = true;	
		//fnSavePlanTripLocationList();
		var objList = $("div#ways_wrap").find("div#way_view");
		var cnt = 0;
		for ( var i = 0; i < objList.length; i ++ ) {
			if( objList.eq(i).find("input[name='tripLocationText']").val() != "" )
				cnt ++;
		}
//		if (cnt > 2) {
//			$("#locationInfoButton").find(".btnDeleteTrip").hide();
//			$("#locationInfoButton").find(".btnAddToTrip").show();		
//		}
	});
}
function fnRemoveLocationById (locationId) {
	$.ajax({
		url: Base_Url + "/trips/removeLocationById",
		dataType : "json",
		type : "POST",
		data : { locationId : locationId, Trips_key : Trips_key },
		success : function(data) {
//			if (data.result == "success") {
//			} else {
//				return;
//			}
			fnDrawPlanTrip ();
		}
	});	
}
//Remove Markers
function fnRemoveMarkers ( markers ) {
	if ( markers == null )
		return;
	for ( var i = 0 ; i < markers.length; i ++ ) {
		if ( markers[i] != null ) {
			markers[i].setMap(null);
			markers[i] = null;
		}
	}
}

//Remove Direction
function fnRemoveDirection ( DirectionDisplayList ) {
	for ( var i = 0; i < DirectionDisplayList.length; i ++ ) {
		DirectionDisplayList[i].setMap(null);
		DirectionDisplayList[i] = null;
	}
}

function fnClearMapForNewTrip () {
	$("div#ways_wrap").find("div#way_view").remove();
	onClickTripItemAdd (null, true);
	onClickTripItemAdd (null, true);
	
	fnRemoveMarkers( MarkerPlanTripList );
	MarkerPlanTripList = [];
	
	fnRemoveDirection( DirectionPlanTripDisplayList );
	DirectionPlanTripDisplayList = [];
	
	var state = { "type": "none" };
	History.pushState(state, SiteName, "/" );	
}