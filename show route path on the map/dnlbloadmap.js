var dnlbMap = (function(){
    
    var openMapHandler = function(){
        var openURL = "https://dotnetlittleboy55.crm.dynamics.com/main.aspx?appid=a63100da-0891-ee11-be37-000d3a9ac3d5&pagetype=webresource&webresourceName=dnlb_/html/dnlbloadmap.html";
        window.open(openURL, "_blank");
    }
    
    var map;
    var legend;
    var subsKey = "ekOI_df5XyhHtwqcIvpxC6FO-Lceg9rMgng0QIU8AkQ";
    var defaultMapSetting = {
        language: "en-US",
        center: [77.580643,12.972442],
        zoom: 10,
        view: "Auto"
    };
    var mapControlPosition = "top-left";
    var cateogryLegend = {
        "circle" : {shape: "circle", label: "Circle1", color: "red"},
        "square": {shape: "square", label: "Square1", color: "green"},
        "triangle": {shape: "triangle", label: "triangle1", color: "blue"}
    }
    var gradientLegend = {
        "low" : {offset: 0, label: "low", color: "green"},
        "medium": {offset: 0.5, label: "medium", color: "yellow"},
        "high": {offset: 1, label: "high", color: "red"}
    }
    var boundingBoxIndia = [68.1766451354, 7.96553477623, 97.4025614766, 35.4940095078];
    var dataSource;
    var addressDataSource;
    var popup;
    var lineDataSource;
    var routeURL;
    var features = [];
    var startPosition = [77.7068,13.1989];
    var vehicleRouteProperties = {
        aborterTimeout: 20000,
        vehicleType: "car",
        vehicleWidth: 3,
        vehicleHeight: 3,
        vehicleLength: 10,
        vehicleLoad: null,
        strokeColor: "#2272A9",
        strokeWidth: 5,
        index: 0,
        docKm: "truckkm",
        docH: "truckh",
    };
    
    var fuzzySearchURLTemplate = "https://{azMapsDomain}/search/{searchType}/json?typeahead=true&api-version=1&query={query}&language={language}&lon={lon}&lat={lat}&countrySet={countrySet}&view=Auto";
    
    var loadMap = function(){
        map = new atlas.Map("myMap",{
            language: defaultMapSetting.language,
            center: defaultMapSetting.center,
            zoom: defaultMapSetting.zoom,
            view: defaultMapSetting.view,
            maxBounds: boundingBoxIndia,
            authOptions: {
                authType: "subscriptionKey",
                "subscriptionKey": subsKey
            }
        });
        
        
        addLegendControl();
        map.events.add("ready", function(){
            var styleMap = new atlas.control.StyleControl({
                mapStyles : ["grayscale_light", "road", "high_contrast_dark", "satellite", "grayscale_dark", "night"]
            });
            map.controls.add(styleMap, {
                position: mapControlPosition,
            });
            map.controls.add(new atlas.control.PitchControl(),{
                position: mapControlPosition                 
            });
            map.controls.add(new atlas.control.ZoomControl(),{
                position: mapControlPosition
            });
            map.imageSprite.add("cirChecked", "/WebResources/dnlb_/images/checkedcircle");
            
            // Use SubscriptionKeyCredential with a subscription key.
            var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(
                atlas.getSubscriptionKey()
            );
            // Use subscriptionKeyCredential to create a pipeline.
            var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);
            // Construct the RouteURL object.
            routeURL = new atlas.service.RouteURL(pipeline);
            
            dataSource = new atlas.source.DataSource();
            map.sources.add(dataSource);
            
            addressDataSource = new atlas.source.DataSource();
            map.sources.add(addressDataSource);
            
            map.layers.add(new atlas.layer.SymbolLayer(addressDataSource, null, {
                iconOptions:{
                        image: "pin-round-red"     
                    }                                           
            }));
            
            lineDataSource = new atlas.source.DataSource();
            map.sources.add(lineDataSource);
            map.layers.add(new atlas.layer.LineLayer(lineDataSource, null, {
                strokeColor: ["get", "strokeColor"],
                    strokeWidth: ["get", "strokeWidth"],
                    lineJoin: "round",
                    lineCap: "round",
            }),"labels");
            
            popup = new atlas.Popup({
                position: [0,0],
                pixelOffset: [0, -20]
            });
            
            map.events.add("mousemove", mouseMoveHandler);
            addResources();
            addAddressFuzzySearch();
            
        });
    };
    
    var displayPathOnMap = function () {
        if (features.length <= 0) {
            return;
        }
        var startPoint = new atlas.data.Feature(
            new atlas.data.Point(startPosition),
            {
                title: "Bangalore Airport",
                iconImage: "pin-blue",
            }
        );
        lineDataSource.add(startPoint);
        var coordinates = [];
        coordinates = [
            [startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]],
        ];
        features.forEach(function (item, index, arr) {
            coordinates.push([
                item.geometry.coordinates[0],
                item.geometry.coordinates[1],
            ]);
        });
        coordinates.push([
            startPoint.geometry.coordinates[0],
            startPoint.geometry.coordinates[1],
        ]);
        // Make a search route request for a truck.
        getRoute(
            vehicleRouteProperties.aborterTimeout,
            vehicleRouteProperties.vehicleType,
            vehicleRouteProperties.vehicleWidth,
            vehicleRouteProperties.vehicleHeight,
            vehicleRouteProperties.vehicleLength,
            vehicleRouteProperties.vehicleLoad,
            vehicleRouteProperties.strokeColor,
            vehicleRouteProperties.strokeWidth,
            vehicleRouteProperties.index,
            vehicleRouteProperties.docKm,
            vehicleRouteProperties.docH,
            coordinates,
            lineDataSource
        );
        
    };
    
    var getRoute = function (
        milliseconds,
        mode,
        vWidth,
        vHeight,
        vLength,
        vLoad,
        strokeClr,
        strokeWidth,
        index,
        docKm,
        docH,
        coordinates,
        dataSourceName
    ) {
        // Mode can be one of: bicycle, bus, car, motorcycle, pedestrian, taxi, truck, van.
        // Vehicle dimensions are in meters.
        // Load type is only considered for trucks.
        routeURL.calculateRouteDirections(
                atlas.service.Aborter.timeout(milliseconds),
                coordinates,{
                    travelMode: mode,
                    vehicleWidth: vWidth,
                    vehicleHeight: vHeight,
                    vehicleLength: vLength,
                    vehicleLoadType: vLoad,
                }).then(
                (directions) => {
                    // Get data features from the response.
                    var data = directions.geojson.getFeatures();

                    // Get the route line, and add some st  yle properties to it.
                    var routeLine = data.features[0];
                    routeLine.properties.strokeColor = strokeClr;
                    routeLine.properties.strokeWidth = strokeWidth;

                    // Add the route line to the data source.
                    dataSourceName.add(routeLine, index);

                    // Calculate travel distance and times.
                    //var km = directions.routes[0].summary.lengthInMeters / 1000;
                    //var hours = directions.routes[0].summary.travelTimeInSeconds / 3600;
                    //console.log(km.toFixed(1) + " Km");
                    //console.log(hours.toFixed(1) + " Hr");
                },
                (reason) => {
                    var alertStrings = { confirmButtonLabel: "OK", text: "No route found", title: "Error!" };
                    var alertOptions = { height: 120, width: 260 };
                    parent.Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                    //console.error("No route found");
                }
            );
    };
    
    var addAddressFuzzySearch = function(){
        $("#searchAddress").autocomplete({
            minLength: 3,
            source: function(request, response){
                var center = map.getCamera().center;
                var requestURL = fuzzySearchURLTemplate.replace("{searchType}", "fuzzy").replace("{query}", encodeURIComponent(request.term)).replace("{language}", "en-US").replace("{lon}", center[0]).replace("{lat}", center[1]).replace("{countrySet}", "IN");
                requestSearch(requestURL).then((data)=>{
                    response(data.results);
                })
                
            },
            select: function(event, ui){
                addressDataSource.clear();
                addressDataSource.add(new atlas.data.Feature(new atlas.data.Point([ui.item.position.lon, ui.item.position.lat]), ui.item));
                
                map.setCamera({
                    bounds:[
                        ui.item.viewport.topLeftPoint.lon, ui.item.viewport.btmRightPoint.lat,
                        ui.item.viewport.btmRightPoint.lon, ui.item.viewport.topLeftPoint.lat
                    ],
                    padding: 30
                });
            }
        }).autocomplete("instance")._renderItem = function(ul, item){
            var suggestAddress = item.address.freeformAddress;
            if(item.address){
                suggestAddress = `${item.address.streetName}, ${item.address.municipalitySubdivision}, ${item.address.municipality}, ${item.address.countrySubdivision}, ${item.address.country}`;
            }
            return $("<li>").append("<a>"+ suggestAddress + "</a>").appendTo(ul);
        };
    };
    
    var requestSearch = function(url){
        return new Promise((resolve, reject)=>{
            url =  url.replace("{azMapsDomain}", atlas.getDomain());
            var requerstParams = map.authentication.signRequest({url: url});
            fetch(requerstParams.url, {
                method: "GET",
                mode: "cors",
                headers: new Headers(requerstParams.headers),
            }).then(
                (r)=>r.json(),
                (e)=>reject(e)
            ).then(
                r => { resolve(r);}, 
                e => reject(e)
            )
        });
    };
    
    
    var mouseMoveHandler = function(e){
        popup.close();
        var popupContent="";
        if(e.shapes && e.shapes.length > 0){
            var properties = e.shapes[0].data.properties;
            popupContent = `<div style='padding: 10px; border-radius:10px;'><b>${properties.assetName}</b><br/>Latitude: ${properties.assetLat} & Longitude: ${properties.assetLong}<br/><img src='${properties.imageURL}' width='200' height='200'></div>`;
            
            popup.setOptions({
                content: popupContent,
                position: e.shapes[0].getCoordinates(),
                pixelOffset: [0, -20]
            });
            
            popup.open(map);
        }
    }
    
    var addResources = function(){
        var fetchXML = "?fetchXml=<fetch mapping='logical'>" +
                        "<entity name='msdyn_customerasset'>" +
                        "<attribute name='createdon'/>" +
                        "<attribute name='msdyn_account'/>" +
                        "<attribute name='msdyn_accountname' />"+
                        "<attribute name='msdyn_name'/>" +
                        "<attribute name='msdyn_latitude'/>" +
                        "<attribute name='msdyn_longitude'/>" +
                        "<attribute name='dnlb_uploadimage' />"+
                        "<attribute name='dnlb_assetsstatus' />"+
                        "<filter type='and'>"+
                            "<condition attribute='msdyn_latitude' operator='not-null' />"+
                            "<condition attribute='msdyn_longitude' operator='not-null' />"+
                        "</filter>"+
                        "</entity>" +
                        "</fetch>";
        parent.Xrm.WebApi.retrieveMultipleRecords("msdyn_customerasset", fetchXML).then(
            function success(results){
                console.log("Total Records: " + results.entities.length);
                for(var i=0; i< results.entities.length; i++){
                    var name = results.entities[i].msdyn_name;
                    var lat = results.entities[i].msdyn_latitude;
                    var long = results.entities[i].msdyn_longitude;
                    var image = results.entities[i].dnlb_uploadimage;
                    var imageURL = "data:image/jpg;base64,"+image;
                    var assetStatus = results.entities[i].dnlb_assetsstatus;
                    var feature = new atlas.data.Feature(new atlas.data.Point([long, lat]),{
                        assetName: name,
                        assetLong: long,
                        assetLat: lat,
                        imageURL: imageURL,
                        assetStatus: assetStatus
                        
                    });
                    features.push(feature);
                    //showAssetsOnMap(feature);
                    showAssetsOnMapUsingSymbolLayer(feature);
                    
                }
                displayPathOnMap();
            },
            function error(err){
               console.error(er.message); 
            });
    }
    
    var showAssetsOnMapUsingSymbolLayer = function(feature){
        dataSource.add(feature);
        lineDataSource.add(feature);
        var symbolLayer = new atlas.layer.SymbolLayer(dataSource, null, {
            iconOptions:{
                allowOverlap: true,
                image:[
                    "match", ["get", "assetStatus"],
                    1, "marker-blue",
                    2, "marker-darkblue",
                    3, "cirChecked",
                    "pin-red"
                ],
                offset: [0,0],
                size: 1,
                rotation: 0
            },
            textOptions:{
                textField: ["get", "assetName"],
                color: "black",
                font: ["StandardFont-Regular"],
                size: 12,
                offset:[0,0]
            }
        });
        map.layers.add(symbolLayer);
    }
    
    var showAssetsOnMap = function(feature){
        dataSource.add(feature);
        
        var bubbleLayer = new atlas.layer.BubbleLayer(dataSource, null, 
        {
            color: "green",
            radius: 10,
            strokeColor: "red",
            strokeWidth: 0.5,
            blur: 0.2
        
        });
        map.layers.add(bubbleLayer);
    }
    
    var addLegendControl = function(){
        legend = new atlas.control.LegendControl({
            title: "This is legend title",
            legends:[
                {
                    type: "category",
                    subtitle: "this is category subtitle",
                    layout: "column",
                    itemLayout: "row",
                    footer: "This is footer message",
                    items:[
                        {
                            label: cateogryLegend.circle.label,
                            color: cateogryLegend.circle.color,
                            shape: "/WebResources/dnlb_/images/clickme.jpg"
                        },{
                            label: cateogryLegend.square.label,
                            color: cateogryLegend.square.color,
                            shape: cateogryLegend.square.shape
                        },{
                            label: cateogryLegend.triangle.label,
                            color: cateogryLegend.triangle.color,
                            shape: cateogryLegend.triangle.shape
                        }
                    ]
                },{
                    type: "gradient",
                    subtitle: "This is gradient subtitle",
                    layout: "column",
                    footer: "This is gradient footer messate",
                    stops:[
                        {
                            offset: gradientLegend.low.offset,
                            color: gradientLegend.low.color,
                            label: gradientLegend.low.label
                        },
                        {
                            offset: gradientLegend.medium.offset,
                            color: gradientLegend.medium.color,
                            label: gradientLegend.medium.label
                        },
                        {
                            offset: gradientLegend.high.offset,
                            color: gradientLegend.high.color,
                            label: gradientLegend.high.label
                        }
                    ]
                }
            ]
        });
        map.controls.add(legend,{position: "top-left"});
    }
    
    return{
        loadMap: loadMap,
        openMapHandler: openMapHandler
    }
    
})();