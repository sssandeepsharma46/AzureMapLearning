var dnlbMap = (function(){
    
    var openMapHandler = function(){
        var openURL = "https://dotnetlittleboy55.crm.dynamics.com/main.aspx?appid=a63100da-0891-ee11-be37-000d3a9ac3d5&pagetype=webresource&webresourceName=dnlb_/html/dnlbloadmap.html";
        window.open(openURL, "_blank");
    }
    
    var map;
    var legend;
    var subsKey = "Ju0RuuORzuihf0yrr1e2_XVmciuMrSuu-EVovuptO5g";
    var defaultMapSetting = {
        language: "en-US",
        center: [77.580643,12.972442],
        zoom: 10,
        view: "Auto"
    };
    
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
    
    var loadMap = function(){
        map = new atlas.Map("myMap",{
            language: defaultMapSetting.language,
            center: defaultMapSetting.center,
            zoom: defaultMapSetting.zoom,
            view: defaultMapSetting.view,
            
            authOptions: {
                authType: "subscriptionKey",
                "subscriptionKey": subsKey
            }
        });
        addLegendControl();
    };
    
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