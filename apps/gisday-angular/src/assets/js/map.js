//"Rest/Admin/Users/GetEmailsAndNames/"


var map, markers, selectedPoint, selectedUser, markerGroup, sliderControl, users = [];
var baseUrl = "http://165.91.120.6/gisday.tamu.edu/";

function initMap() {


    map = L.map('map', {
        center: [30.616176, -96.339870],
        zoom: 17
    });

    L.tileLayer('http://{s}.tiles.mapbox.com/v3/atharmon91.o6b3o635/{z}/{x}/{y}.png', {
        id: 'MapID',
        attribution: "Mapbox"
    }).addTo(map);

    markerGroup = L.layerGroup();
    

    getMarkers();

}

function getMarkers(userGuid) {
    var pathToRestSession = "http://165.91.120.19/gisday.tamu.edu/Rest/Manhole/Get/?userInfo=true";
    $.ajax({
        url: pathToRestSession,
        type: 'POST',
        data: userGuid != null ? {
            "userGuid": userGuid
        } : {},
        dataType: "jsonp",
        async: true,
        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });

}

function jsonCallback(json) {
    markers = json.items;
    $("#total").text("Total: " + markers.length);
    for (item in markers) {
        var module = markers[item];
//                console.log(module);
        var lat = module["Location"]["lat"];
        var lon = module["Location"]["lon"];
        var acc = module["Location"]["accuracy"];
        var fillColor = '#3399ff';
        var strokeColor = '#3399ff';
        if (acc > 15) {
            acc = 2;
            fillColor = '#ff3333';
            strokeColor = '#ff3333';
        }
        var circle = L.circle([lat, lon], acc, {
            time: module["Location"]["FixTime"],
            color: strokeColor,
            fillColor: fillColor,
            fillOpacity: 0.8
        }).addTo(markerGroup);
        circle.addTo(markerGroup);
    
        


        circle["Lat"] = lat;
        circle["Lon"] = lon;
        circle["Coords"] = module.Location.lat + ", " + module.Location.lon;
        circle["Acc"] = acc;
        circle["FixTime"] = module.Location.fixTime;
        circle["Added"] = module.Added;
        circle["PhotoGuid"] = module.PhotoGuid;
        var firstName = module.FirstName;
        var lastName = module.LastName;
        var dept = module.Dept;
        circle["User"] = firstName + " " + lastName;
        if (dept != null && dept.length > 0) {
            circle["User"] += ", " + dept;
        }
        circle.on('click', markerClicked);

        users[module.LastName] = module.UserGuid;
    }
    markerGroup.addTo(map);
    sliderControl = L.control.sliderControl({position: "bottomleft", layer: markerGroup});
    map.addControl(sliderControl);
    sliderControl.startSlider();
    addNamesToDropdown();
}

function markerClicked(e) {
    console.log(e.target.Added);
    if (selectedPoint != null) {
        map.removeLayer(selectedPoint);    
    }
    $("#accuracy").text(e.target.Acc);
    $("#added").text(e.target.Added);
    $("#coordinates").text(e.target.Coords);
    $("#user").text(e.target.User);
    selectedPoint = L.marker([e.target.Lat, e.target.Lon]).addTo(map);
    var basePhotoUrl = "UploadedImages/";
    $("#manholePhoto").attr("src", basePhotoUrl + e.target.PhotoGuid + ".jpg");
}


function addNamesToDropdown() {
    for (lastName in users) {
        var option = $("<option></option>").attr("value", lastName).text(lastName);
        $("#combobox").append(option);

    }

    $(".custom-combobox-input").autocomplete({
        close: function (event, ui) {
            console.log("WORKED - close");
        },
        select: function (event, ui) {
            var value = ui.item.value;
            if (value != selectedUser) {
                var guid = users[value];
                markerGroup.clearLayers();
                selectedUser = value;
                map.removeLayer(selectedPoint);
                sliderControl.removeFrom(map);
                getMarkers(guid);
                
            }

        }
    });



}

function clearPointInfo() {
    $("#added").text("Added");   
    $("#user").text("User");
    $("#coordinates").text("Location");
    $("#accuracy").text("Accuracy");
    $("#total").text("Total");
    
    
}





