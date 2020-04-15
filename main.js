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
    //console.log(result);
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

//Fetching country by history
// let histData = (event) => {
//   let countryName = event.target.innerText;
//   fetch(`https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_particular_country.php?country=${countryName}`, {
//     "method": "GET",
//     "headers": {
//       "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
//       "x-rapidapi-key": "f84844d573msh6b48f5d19dea0c8p139f12jsn1c76a48f8e0d"
//     }
//   })
//   .then(response => {
//     return response.json();
//   }).then(function(json){
//     countryHistoryData = json;
//     console.log(countryHistoryData);
//   })
//   .catch(err => {
//     console.log(err);
//   });
  
//   document.body.classList.add('cm-pop-active');
// }

//Covid Bookmark Data Table
var bookmarkTable = $('#covid-bookmark-table').DataTable({
  "paging": false,
  stateSave: false,
  responsive: true,
  "order": [[ 2, "desc" ]],
});

//Fetching Global Stat
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

            if(cbc_country_name != ""){
              listItem = document.createElement('span');

              // Add the item text
              //listItem.innerHTML = cases_by_country[i].country_name + `<span class="cm-cbc-recovered">${cbc_recovered}</span><p><span class="cm-cbc-case">${cbc_case}</span><span class="cm-cbc-death">${cbc_death}</span></p>`;
              listItem.innerHTML = cases_by_country[i].country_name + ` (Active Cases: <i>${cbc_active_cases}</i>)`
              // Add listItem to the listElement
              listElement.appendChild(listItem);
            }

            //Table Data
            //Only Report Updated Data
            cbc_new_cases_flag = Number(cbc_new_cases.replace( /,/g, "" ));
            cbc_new_cases_flag > 0 ? cbc_new_case_flag = true : cbc_new_case_flag =false;
            
            cbc_new_death_flag = Number(cbc_new_deaths.replace( /,/g, "" ));
            cbc_new_death_flag > 0 ? cbc_new_death_flag = true : cbc_new_death_flag =false;

            if(cbc_country_name != ''){
              dataItem = document.createElement('tr');
              dataItem.innerHTML = `<td class="cm-bookmark" onClick="bookmark(this)"><i>&#9733;</i></td><td class="cm-country-name" onClick="histData(event)">${cbc_country_name}</td><td class="cm-tot-case">${cbc_case}</td><td class=${cbc_new_case_flag ? "table-new-case":""}>${cbc_new_case_flag? "+" + cbc_new_cases : ""}</td><td class="cm-tot-death">${cbc_death}</td><td class=${cbc_new_death_flag ? "table-new-death":""}>${cbc_new_death_flag? "+" + cbc_new_deaths : ""}</td><td>${cbc_active_cases}</td><td>${cbc_recovered}</td><td>${cbc_serious_critical}</td><td>${cbc_total_per_mil}</td>`;
              rowElement.appendChild(dataItem);
            }
        }
        // Marquee Country Active Cases Data
        $('.marquee').marquee({
          duration: 35000,
          gap: 10,
          delayBeforeStart: 0,
          direction: 'left',
          duplicated: true,
          pauseOnHover: true,
          allowCss3Support: false
        });        

        //Covid Data Table
        $('#covid-table').DataTable({
            "paging": false,
            fixedHeader: {
                header: true
            },
            responsive: true,
            "order": [[ 2, "desc" ]],
        });

        //Show Local Storage Data
        console.log("Local Storage is:", JSON.parse(localStorage.getItem("countryBookmark")));

        function showBookmarked(){
          let getLocalStore =  JSON.parse(localStorage.getItem("countryBookmark"));
          if(getLocalStore){
            $('.cm-covid-bookmark-container').removeClass('cm-bookmark-active');
            for(let i=0; i < getLocalStore.length; i++){
              console.log(getLocalStore[i]);
              $('#covid-table tbody tr td:contains(' + getLocalStore[i] + ')').parent('tr').addClass('cm-bookmarked');
              bookmarkTable.row.add($('#covid-table tbody tr td:contains(' + getLocalStore[i] + ')').parent('tr').clone()).draw(false);
            }
          }
        }

        showBookmarked();

        //Bookmark End
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
    //console.log(json);
    let tot_cases = document.querySelector('#summary-world-total p').innerHTML = json.total_cases, 
    tot_death = document.querySelector('#summary-world-deaths p').innerHTML = json.total_deaths, 
    tot_recovered = document.querySelector('#summary-world-recovered p').innerHTML = json.total_recovered, 
    tot_new_cases = document.querySelector('#summary-world-new-case p').innerHTML = '+' + json.new_cases, 
    tot_new_deaths = document.querySelector('#summary-world-new-deaths p').innerHTML = '+' + json.new_deaths, 
    tot_statistic_taken_at = document.querySelector('#summary-world-time span').innerHTML = new Date(json.statistic_taken_at).toLocaleString();
    document.querySelector('title').innerHTML = `COVID-19 Updates(Live): Total Cases: ${tot_cases}, Total Deaths: ${tot_death}, Total Recovered: ${tot_recovered} - Last Updated: ${tot_statistic_taken_at}`;

    //Top Gap in Mobile
    setHeight();
    $(window).resize(function(){
      setHeight();
    });
})
.catch(err => {
	console.log(err);
});

//Data in Popup

function getSiblings(elem) {
  let siblings = [elem.innerText], sibling = elem.parentNode.firstChild, skipMe = elem;
  for ( ; sibling; sibling = sibling.nextSibling ) 
    if ( sibling.nodeType == 1 && sibling != elem )
        siblings.push( sibling.innerText );
  //console.log(siblings);
  return siblings;
}

let histData = (event) => { 
// console.log(event.target); 
let currentRow = getSiblings(event.target), valArr = ["country_name",'bookmarked', 'cases', 'new_cases', 'deaths', 'new_deaths', 'active_cases', 'total_recovered', 'critical_cases', 'tot_per_mil'];

console.log("1) ", currentRow);

var resultObj = currentRow.reduce(function(result, field, index) {
    result[valArr[index]] = field;
    return result;
  }, {});

console.log("2) ", resultObj);

fetch(`https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_particular_country.php?country=${resultObj["country_name"]}`, {
  "method": "GET",
  "headers": {
    "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
    "x-rapidapi-key": "f84844d573msh6b48f5d19dea0c8p139f12jsn1c76a48f8e0d"
  }
})
.then(response => {
  return response.json();
}).then(function(json){
  let popData = json.stat_by_country, popDataDate=[], popDataTotCase=[], dupArr = [], dupArrVal=[], popDataDateClean= [],
  popActCase=[],popActCaseClean =[], popRecCase=[], popRecCaseClean =[], popNewCase=[], popNewCaseClean=[], popTotDeath = [], popTotDeathClean = [],
  popNewDeath=[], popNewDeathClean=[];

  //Showing Data in popup
  document.querySelector('.cm-country-detail-pop h2').innerText = resultObj.country_name;
  document.querySelector('#pop-tot-case p').innerText = resultObj.cases;
  document.querySelector('#pop-tot-deaths p').innerText = resultObj.deaths;
  document.querySelector('#pop-tot-recoveries p').innerText = resultObj.total_recovered;
  document.querySelector('#pop-new-cases p').innerText = resultObj.new_cases;
  document.querySelector('#pop-new-deaths p').innerText = resultObj.new_deaths;
  document.querySelector('#pop-critical-cases p').innerText = resultObj.critical_cases

  document.body.classList.add('cm-pop-active');
  //Getting All dates
  for(let i=0; i< popData.length; i++){
    popDataDate.push(popData[i].record_date.split(" ")[0]);
  }
  
  //Removing Repeated Dates
  for(let k= 0; k < popDataDate.length; k++){
      if((popDataDate[k] != popDataDate[k + 1] && (k+1) < popDataDate.length) || k == (popDataDate.length - 1)){
        dupArr.push(k);
      }
  }

  //Removing Comma From data
  for(let j=0; j< popData.length; j++){
    popDataTotCase.push(parseInt(popData[j].total_cases.split(',').join(''), 10));
    if(popData[j].new_cases.length > 1){
      popActCase.push(parseInt(popData[j].active_cases.split(',').join(''), 10));
    }
    else {
      popActCase.push(parseInt(popData[j].active_cases));
    }
    
    popRecCase.push(parseInt(popData[j].total_recovered.split(',').join(''), 10));
    popNewCase.push(parseInt(popData[j].new_cases.split(',').join(''), 10));
    popNewDeath.push(parseInt(popData[j].new_deaths.split(',').join(''), 10));
  }
  
  //Getting only Last Updated Data for Each Day
  for(let x= 0; x < dupArr.length; x++){
    let index = dupArr[x];
    dupArrVal.push(popDataTotCase[index]);
    popDataDateClean.push(popDataDate[index]);

    //Active Cases
    popActCaseClean.push(popActCase[index]);

    //Recovered Cases
    popRecCaseClean.push(popRecCase[index]);

    //New Cases
    popNewCaseClean.push(popNewCase[index]);

    //New Deaths
    popNewDeathClean.push(popNewDeath[index]);
  }


  //Total Cases Chart
  document.getElementById("pop-tot-cases-wrapper").innerHTML = '&nbsp;';
  document.getElementById("pop-tot-cases-wrapper").innerHTML = '<canvas id="pop-tot-cases"></canvas>';
  var ctx = document.getElementById('pop-tot-cases').getContext('2d');

  let chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',
      // The data for our dataset
      data: {
          labels: popDataDateClean,
          datasets: [{
              label: 'Total Cases',
              borderColor: '#f67019',
              data: dupArrVal
          }]
      },

      // Configuration options go here
      options: {
        legend: {
          labels: {
            fontColor: 'white'
          }
        },
        title: {
          display: false,
          fontColor: 'white',
          text: 'Total Number of Cases'
        }     ,
        scales: {
          yAxes: [{
            ticks: {
                beginAtZero:true,
                fontColor: 'white'
            },
          }],
          xAxes: [{
            ticks: {
              fontColor: 'white'
            },
          }]
        } 
      }//Options End
  });

  //New Cases vs Recovered Chart
  document.getElementById("pop-new-rec-cases-wrapper").innerHTML = '&nbsp;';
  document.getElementById("pop-new-rec-cases-wrapper").innerHTML = '<canvas id="pop-new-rec-cases"></canvas>';
  let ctx2 = document.getElementById('pop-new-rec-cases').getContext('2d');

  let popActCaseGdata = {
    label: "Active Cases",
    data: popActCaseClean,
    borderColor: '#33ccff'
  };

  let popRecGdata = {
    label: "Recovered Cases",
    data: popRecCaseClean,
    borderColor: '#76ae19'
  };

  let chart2 = new Chart(ctx2, {
      // The type of chart we want to create
      type: 'line',
      // The data for our dataset
      data: {
          labels: popDataDateClean,
          datasets: [popActCaseGdata, popRecGdata]
      },

      // Configuration options go here
      options: {
        legend: {
          labels: {
            fontColor: 'white'
          }
        },
        title: {
          display: false,
          fontColor: 'white'
          //text: 'Total Number of Cases'
        }     ,
        scales: {
          yAxes: [{
            ticks: {
                beginAtZero:true,
                fontColor: 'white'
            },
          }],
          xAxes: [{
            ticks: {
              fontColor: 'white'
            },
          }]
        } 
      }//End
  });

  //Daily Cases and Daily Deaths Bar Graph
  document.getElementById("pop-daily-new-case-wrapper").innerHTML = '&nbsp;';
  document.getElementById("pop-daily-new-case-wrapper").innerHTML = '<canvas id="pop-daily-new-case"></canvas>';
  let ctx3 = document.getElementById('pop-daily-new-case').getContext('2d');

  let chart3 = new Chart(ctx3, {
      // The type of chart we want to create
      type: 'bar',
      // The data for our dataset
      data: {
          labels: popDataDateClean,
          datasets: [{
              label: 'Daily New Case',
              borderColor: '#33ccff',
              backgroundColor: "#33ccff",
              data: popNewCaseClean
          }]
      },

      // Configuration options go here
      options: {
        legend: {
          labels: {
            fontColor: 'white'
          }
        },
        title: {
          display: false,
          fontColor: 'white',
          text: 'Total Number of Cases'
        }     ,
        scales: {
          yAxes: [{
            ticks: {
                beginAtZero:true,
                fontColor: 'white'
            },
          }],
          xAxes: [{
            ticks: {
              fontColor: 'white'
            },
          }]
        } 
      }//Options End
  });

  //Daily Deaths Bar Graph
  document.getElementById("pop-daily-new-death-wrapper").innerHTML = '&nbsp;';
  document.getElementById("pop-daily-new-death-wrapper").innerHTML = '<canvas id="pop-daily-new-death"></canvas>';
  let ctx4 = document.getElementById('pop-daily-new-death').getContext('2d');

  let chart4 = new Chart(ctx4, {
      // The type of chart we want to create
      type: 'bar',
      // The data for our dataset
      data: {
          labels: popDataDateClean,
          datasets: [{
              label: 'Daily Deaths',
              borderColor: '#f00',
              backgroundColor: "#f00",
              data: popNewDeathClean
          }]
      },

      // Configuration options go here
      options: {
        legend: {
          labels: {
            fontColor: 'white'
          }
        },
        title: {
          display: false,
          fontColor: 'white',
          text: 'Total Number of Cases'
        }     ,
        scales: {
          yAxes: [{
            ticks: {
                beginAtZero:true,
                fontColor: 'white'
            },
          }],
          xAxes: [{
            ticks: {
              fontColor: 'white'
            },
          }]
        } 
      }//Options End
  });

})
.catch(err => {
  console.log(err);
});
}

//Close Popup
document.querySelector('.cm-country-detail-pop-close').addEventListener('click', function(){
  document.body.classList.remove('cm-pop-active');
});


var storageArr = [];

function bookmark(e) {
  let boookmarkHTML = e, bookCountryName = $(boookmarkHTML).parents('tr').find('.cm-country-name').text(), bookmarkLength; 
  console.log(boookmarkHTML);
  if(!$(boookmarkHTML).parents('tr').hasClass('cm-bookmarked')){
    $(boookmarkHTML).parents('tr').addClass('cm-bookmarked');
    //$(boookmarkHTML).parents('tr').clone().appendTo('#covid-bookmark-table tbody');
    console.log("Run");
    bookmarkTable.row.add($(boookmarkHTML).parents('tr').clone()).draw(false);
    // bookmarkTable.rows().remove();
    // $('#covid-table tbody tr.cm-bookmarked').each(function(){
    //   var trHTML = $(this).clone();
    //   bookmarkTable.row.add(trHTML).draw(false);
    // });
  }
  else {
    $('#covid-table tbody tr td:contains(' + bookCountryName +')').parent('tr').removeClass('cm-bookmarked');
    console.log(bookCountryName);
    //$('#covid-bookmark-table tbody tr td:contains(' + bookCountryName +')').parent('tr').remove();
    bookmarkTable.row($('#covid-bookmark-table tbody tr td:contains(' + bookCountryName +')').parent('tr')).remove().draw()
    // bookmarkTable.rows().remove();
    // $('#covid-table tbody tr.cm-bookmarked').each(function(){
    //   var trHTML = $(this).clone();      
    //   bookmarkTable.row.add(trHTML).draw(false);
    // });
  }

  $('#covid-bookmark-table tbody tr td.dataTables_empty').parent('tr').remove();
  
  bookmarkLength = $('#covid-bookmark-table tbody tr').length;

  if(bookmarkLength){
    $('.cm-covid-bookmark-container').removeClass('cm-bookmark-active');
  }
  else {
    $('.cm-covid-bookmark-container').addClass('cm-bookmark-active');
  }

  storageArr = [];

  if($('#covid-bookmark-table tr.cm-bookmarked').length > 0){
    $('#covid-bookmark-table tr.cm-bookmarked').each(function(){
      let bookmarkedCountryName = $(this).find('.cm-country-name').text();
      //storageData = {countryName: bookmarkedCountryName};
      storageArr.push(bookmarkedCountryName);
      localStorage.setItem('countryBookmark', JSON.stringify(storageArr));
    });
  }
  else {
    storageArr = [];
    console.log('Clear');
    localStorage.clear();
  }

  console.log(storageArr);
  console.log('This: ' + $('#covid-bookmark-table tr.cm-bookmarked').length)
  
}

//Set Top Gap in Mobile

function setHeight() {
  if($(window).width() < 768){
    let topHt = $('.cm-summary-container').outerHeight();
    $('#root').css('padding-top', topHt);
  }
}