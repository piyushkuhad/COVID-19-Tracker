//Global var
let root = document.getElementById("root");

//Map Start
am4core.ready(function() {

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

// Create map instance
var chart = am4core.create("chartdiv", am4maps.MapChart);

// Set map definition
chart.geodata = am4geodata_worldLow;

// Set projection
chart.projection = new am4maps.projections.Miller();

// Create map polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

// Exclude Antartica
polygonSeries.exclude = ["AQ"];

// Make map load polygon (like country names) data from GeoJSON
polygonSeries.useGeodata = true;

// Configure series
var polygonTemplate = polygonSeries.mapPolygons.template;

//
polygonSeries.data = [
    {
      "id": "US",
      "name": "USA",
      "value": 100,
      "fill": am4core.color("#F05C5C")
    }
  ];

polygonTemplate.tooltipText = "{name}";
polygonTemplate.polygon.fillOpacity = 0.6;


// Create hover state and set alternative fill color
var hs = polygonTemplate.states.create("hover");
hs.properties.fill = chart.colors.getIndex(0);

// Add image series
var imageSeries = chart.series.push(new am4maps.MapImageSeries());
imageSeries.mapImages.template.propertyFields.longitude = "longitude";
imageSeries.mapImages.template.propertyFields.latitude = "latitude";
imageSeries.mapImages.template.tooltipText = "{title}";
imageSeries.mapImages.template.propertyFields.url = "url";

var circle = imageSeries.mapImages.template.createChild(am4core.Circle);
circle.radius = 3;
circle.propertyFields.fill = "color";

var circle2 = imageSeries.mapImages.template.createChild(am4core.Circle);
circle2.radius = 3;
circle2.propertyFields.fill = "color";


circle2.events.on("inited", function(event){
  animateBullet(event.target);
})

function animateBullet(circle) {
    var animation = circle.animate([{ property: "scale", from: 1, to: 5 }, { property: "opacity", from: 1, to: 0 }], 1000, am4core.ease.circleOut);
    animation.events.on("animationended", function(event){
      animateBullet(event.target.object);
    })
}

var colorSet = new am4core.ColorSet();

function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'longlat.json', false); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 

 function init() {
    loadJSON(function(response) {
        // Parse JSON string into object
        var actual_JSON = JSON.parse(response);
        imageSeries.data = actual_JSON;
    });
 }
init();


polygonTemplate.events.on("hit", function(event){
  // console.log(event.target.dataItem.dataContext.name);
  let country = event.target.dataItem.dataContext.name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
  let url = `https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php`;
  apiHit(url);
  openPop();
});

let apiHit = (url) => {
    fetch(url).then(function(response) {
    return response.json();
  }).then(function(json) {
    let result = json, leng = result.length;
    console.log(result);
    //console.log(result[leng - 1]);
  }).catch(function(err) {
    console.log('Fetch problem: ' + err.message);
  });
}


let openPop = () => {
  root.classList.add('pop-active');
}

document.getElementById("result-close").addEventListener('click', function(){
  root.classList.remove('pop-active');
});

}); // end am4core.ready()
//Map End

let summaryHit = (sumUrl) => {
    fetch(sumUrl, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
            "x-rapidapi-key": "f84844d573msh6b48f5d19dea0c8p139f12jsn1c76a48f8e0d"
        }
    })
    .then(response => {
        return response.json();
    }).then(function(json){
        cases_by_country_global = json["countries_stat"];
        let cases_by_country = json["countries_stat"], listElement = document.getElementById('summary-country'), numberOfListItems = cases_by_country.length, listItem,
        i, rowElement = document.querySelector('#covid-table tbody'), dataItem;
        console.log(cases_by_country);
        for (i = 0; i < numberOfListItems; ++i) {
            // create an item for each one
            let cbc_case = cases_by_country[i].cases,
            cbc_death = cases_by_country[i].deaths,
            cbc_recovered = cases_by_country[i].total_recovered,
            cbc_country_name = cases_by_country[i].country_name,
            cbc_new_deaths = cases_by_country[i].new_deaths,
            cbc_new_cases = cases_by_country[i].new_cases,
            cbc_serious_critical = cases_by_country[i].serious_critical,
            cbc_active_cases = cases_by_country[i].active_cases,
            cbc_total_per_mil = cases_by_country[i].total_cases_per_1m_population,
            cbc_new_case_flag, cbc_new_death_flag;

            listItem = document.createElement('li');

            // Add the item text
            listItem.innerHTML = cases_by_country[i].country_name + `<span class="cm-cbc-recovered">${cbc_recovered}</span><p><span class="cm-cbc-case">${cbc_case}</span><span class="cm-cbc-death">${cbc_death}</span></p>`;

            // Add listItem to the listElement
            listElement.appendChild(listItem);

            //Table Data
            //Only Report Updated Data
            cbc_new_cases_flag = Number(cbc_new_cases.replace( /,/g, "" ));
            cbc_new_cases_flag > 0 ? cbc_new_case_flag = true : cbc_new_case_flag =false;
            
            cbc_new_death_flag = Number(cbc_new_deaths.replace( /,/g, "" ));
            cbc_new_death_flag > 0 ? cbc_new_death_flag = true : cbc_new_death_flag =false;

            dataItem = document.createElement('tr');
            dataItem.innerHTML = `<td>${cbc_country_name}</td><td>${cbc_case}</td><td class=${cbc_new_case_flag ? "table-new-case":""}>${cbc_new_case_flag? "+" + cbc_new_cases : ""}</td><td>${cbc_death}</td><td class=${cbc_new_death_flag ? "table-new-death":""}>${cbc_new_death_flag? "+" + cbc_new_deaths : ""}</td><td>${cbc_active_cases}</td><td>${cbc_recovered}</td><td>${cbc_serious_critical}</td><td>${cbc_total_per_mil}</td>`;

            rowElement.appendChild(dataItem);
        }

        //Covid Data Table
        $('#covid-table').DataTable({
            "paging": false,
            fixedHeader: {
                header: true
            },
            "order": [[ 1, "desc" ]],
        });
    })
    .catch(err => {
        console.log(err);
    });
}

summaryHit('https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php');


//Fetching Total Cases Around the World

fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
		"x-rapidapi-key": "f84844d573msh6b48f5d19dea0c8p139f12jsn1c76a48f8e0d"
	}
})
.then(response => {
	return response.json();
}).then(function(json) {
    console.log(json);
    let tot_cases = document.querySelector('#summary-world-total p').innerHTML = json.total_cases, 
    tot_death = document.querySelector('#summary-world-deaths p').innerHTML = json.total_deaths, 
    tot_recovered = document.querySelector('#summary-world-recovered p').innerHTML = json.total_recovered, 
    tot_new_cases = document.querySelector('#summary-world-new-case p').innerHTML = '+' + json.new_cases, 
    tot_new_deaths = document.querySelector('#summary-world-new-deaths p').innerHTML = '+' + json.new_deaths, 
    tot_statistic_taken_at = document.querySelector('#summary-world-time span').innerHTML = json.statistic_taken_at;
    document.querySelector('title').innerHTML = `COVID-19 Updates(Live): Total Cases: ${tot_cases}, Total Deaths: ${tot_death}, Total Recovered: ${tot_recovered} - Last Updated: ${tot_statistic_taken_at}`;
})
.catch(err => {
	console.log(err);
});

//Data Table
// $(document).ready( function () {
//     $('#covid-table').DataTable();
// } );