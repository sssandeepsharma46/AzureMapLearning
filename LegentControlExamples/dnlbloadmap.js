var dnlbMap = (function(){
    
    var openMapHandler = function(){
        var openURL = "https://dotnetlittleboy55.crm.dynamics.com/main.aspx?appid=a63100da-0891-ee11-be37-000d3a9ac3d5&pagetype=webresource&webresourceName=dnlb_/html/dnlbloadmap.html";
        window.open(openURL, "_blank");
    }
    
    var map;
    var subsKey = "Ju0RuuORzuihf0yrr1e2_XVmciuMrSuu-EVovuptO5g";
    var defaultMapSetting = {
        language: "en-US",
        center: [77.580643,12.972442],
        zoom: 10,
        view: "Auto"
    };
    var legend;
    var legendFullnessColor = {
        "0%-50%": { Name: "0%-50%", Color: "rgb(123, 188, 78)" },
        "51%-75%": { Name: "51%-75%", Color: "rgb(250, 171, 52)" },
        "76%-100%": { Name: "76%-100%", Color: "rgb(237, 77, 30)" }
      };
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
        addLegentControl();
    };
    
    var addLegentControl = function(){
        
        legend = new atlas.control.LegendControl({
      //Global title to display for the legend.
      title: "Legend",
      //Hide the button to collapse the legend.
      showToggle: true,
      //All legend cards to display within the legend control.
      legends: [
        {
                            type: 'category',
                            subtitle: 'Category',
                            layout: 'column',
                            itemLayout: 'row',
                            footer: 'A category legend that uses a combination of shapes and icons.',
                            strokeWidth: 2,
                            items: [
                                {
                                    color: 'DodgerBlue',
                                    label: 'Hello',
                                    shape: 'https://azuremapscodesamples.azurewebsites.net/Common/images/icons/campfire.png'
                                }, {
                                    color: 'Yellow',
                                    label: 'World',
                                    shape: 'square'
                                }, {
                                    color: 'Orange',
                                    label: 'Ricky',
                                    shape: 'line'
                                }, {
                                    color: 'Red',
                                    label: 'is',
                                    shape: 'circle'
                                }, {
                                    color: 'purple',
                                    label: 'awesome!',
                                    shape: 'triangle'
                                }
                            ]
                        },{
                            type: 'gradient',
                            subtitle: 'Gradient legend',
                            footer: 'A gradient legend that uses multiple color stops, some having labels.',

                            stops: [
                                {
                                    offset: 0,
                                    color: 'royalblue',
                                    label: 'low'
                                },
                                {
                                    offset: 0.25,
                                    color: 'cyan'
                                },
                                {
                                    offset: 0.5,
                                    color: 'lime',
                                    label: 'medium'
                                }, 
                                {
                                    offset: 0.75,
                                    color: 'yellow'
                                },{
                                    offset: 1,
                                    color: 'red',
                                    label: 'high'
                                }
                            ]
                        }
      ]
    });
        //Add the legend control to the map.
        map.controls.add(legend, {
          position: "bottom-left",
        });
    }
    
    return{
        loadMap: loadMap,
        openMapHandler: openMapHandler
    }
    
})();