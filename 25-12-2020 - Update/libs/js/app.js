
//declare the variable globally
let iso_code2;
let iso_code3;
let capital = '';
let currency_symbol;
let cur_symbol;
let currencyCode;
let countryCode;
let countryName = '';
let countryGeoJson = [];
let geoJsonLayer = [];
let lat;
let lng;
let mymap ;




//style for geojson 
var geoJsonStyle = {
    "color": "black",
    "opacity": 0.6,
    "weight": 4,
}


//create a function  for country List
function getCountryList(){
    $.ajax({
        url: 'libs/php/countryList.php',
        type:'POST',
        dataType:'JSON',
        success:(result) => {
            console.log(result);
            selCountry = $('#selCountry')
            result['data'].forEach(country => {
                selCountry.append(`<option value = ${country['iso3']}>${country['countryName']}</option>`);

                
            });
        },error: function(jqXHR, textStatus, errorThrown){
            console.log('country not selected');
        }
    })
}

function main(){

    getCountryList();
    mainFunction();
    
}


//main function 
function mainFunction(){
    if(navigator.geolocation){
        console.log("Geolocation is available");
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    }
    else{
        alert("Geolocation is not supported to your browser");
    }

}

//successFunction
function successFunction(position){
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    console.log(lat,lng)
    mymap = L.map('map').setView([lat, lng],5);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri',
       
    }).addTo(mymap);

      //add easy button icon on map to show data
      
      L.easyButton('fa fa-info',function(){
        $('#countryInfo').modal("show");
    },'Country Information').addTo(mymap );

    L.easyButton('fa-wikipedia-w',function(){
        $('#wikiInfo').modal("show");
    },'Wikipedia Information').addTo(mymap );

    L.easyButton('fa fa-cloud',function(){
    $('#weatherInfo').modal("show");
    },'Weather Information').addTo(mymap );

    L.easyButton('fa-clock',function(){
        $('#timeInfo').modal("show");
    },'TimeZone').addTo(mymap);

    L.easyButton('fa fa-dollar',function(){
        $('#curInfo').modal("show");
    },'Currency Information').addTo(mymap);


     //to get the current country name
     $.ajax({
        url:'libs/php/currentCountry.php',
        type:'POST',
        dataType:'json',
        data:{
            latitude: lat,
            longitude:lng
        },
        success: function(result){
            console.log(result)
             iso_code3 = result['results'][0]['components']['ISO_3166-1_alpha-3'];
             cur_symbol = result['results'][0]['annotations']['currency']['symbol'];

             //countryCode = result['results'][0]['components']['country_code'];
             $(`#selCountry option[value='`+iso_code3+`']`).prop('selected', true);
            countryInformation(iso_code3)

            
        //to set coutry borders with geojson Layer
        $.ajax({
            url:'libs/php/countryList.php',
            type:'POST',
            data:{iso_code3 :iso_code3 },
            dataType: 'JSON',
            success:(result) => {
                console.log("-------------data for geoJson Layer-------")
                console.log(result);
                countryGeoJson = result['geoJson'];
                createGeoJson(countryGeoJson);
            }

             })
        }
    })
}

//error function
function errorFunction(e){
    console.log(e.message);
}

//function for geoJson Layer for country Border
function  createGeoJson(geoJson){
    console.log(geoJson);
    if(geoJsonLayer){
        mymap.removeLayer(geoJsonLayer)
    }
    geoJsonLayer = L.geoJson(geoJson, {
        style: geoJsonStyle
    }).addTo(mymap);
    mymap.fitBounds(geoJsonLayer.getBounds());

}

//get countryInformation
function countryInformation(iso_code3){
    $.ajax({
        url:'libs/php/countryInfo.php',
        type:'POST',
        dataType: 'json',
        data:{
            iso_code3 : iso_code3
        },
        success:function(result){
            console.log(result);
            if(result.status.name == "ok"){
                capital = result['data'][0]['capital'];
                currencyCode = result['data'][0]['currencies'][0]['code'];
                countryCode = result['data'][0]['alpha2Code'];

                console.log("-------------------------get capital, currencyCode from country information--------------------");
                console.log(capital,currencyCode, countryCode);

                //show the data inside model
              //  $('#flag').html(result['data'][0]['flag']);
                $('#flag').attr("src",result['data'][0]['flag']);
                $('#country_name').html(result['data'][0]['name']);
                $('#capital').html(result['data'][0]['capital']);
              let population = `${result['data'][0]['population'].toLocaleString("en-US")}`;
              $('#population').html(`${population}`);
              let area = `${result['data'][0]['area'].toLocaleString("en-US")}`;
              $('#area').html(`${area}` + `km<sup>2</sup>`);
                //$('#area').html(result['data'][0]['area']);
                $('#language').html(result['data'][0]['languages'][0]['name']);
                $('#region').html(result['data'][0]['region']);
                $('#subregion').html(result['data'][0] ['subregion']);
                $('#language').html(result['data'][0] ['languages'][0]['name']);
                $('#Currencies').html(result['data'][0]['currencies'][0]['code']);
                $('#Currencies').html;
                $('#dialing_code').html("+" +result['data'][0]['callingCodes']);
                cur_symbol = result['data'][0]['currencies'][0]['symbol'];
                $("#country_code").html(result['data'][0]['region']);
                var t = result['data'][0]['timezones'][0];
                $("#timezone").html(t);
                $('#currencyName').html(result['data'][0]['currencies'][0]['name']);
                console.log(cur_symbol);
                getWeather(capital);
                wikipediaData(capital);
                
                getExchangeRate(currencyCode);
            }
        },
        error:function(jqXHR, textStatus, errorThrown){
            console.log('Country data not found');
        }
    })

}

//get weather information
function getWeather(capital){
    $.ajax({
        url:'libs/php/getWeather.php',
        type:'POST',
        dataType:'json',
        data:{
            capitalCity : capital
        },
        success:function(result){
            console.log("------------get weather data------------")
            console.log(result);
            if(result.status.name == "ok"){
                   //show the data inside model
                   var iconcode = result.data.weather[0].icon;;
                   var src = "http://openweathermap.org/img/w/" + iconcode + ".png";
                  $('#wi').attr("src",src);
                  
                
                  $('#city').html(result['data']['name']);
                 // $('#feels').html(result['data']['main']['feels_like']);
                  $('#humidity').html(result['data']['main']['humidity'] + '%');
                 // $('#temp').html(result['data']['main']['temp']);
                  $('#description').html(result['data']['weather'][0]['description']);
                  $('#windspeed').html(result['data']['wind']['speed'] + " m/s");
                  $('#pressure').html(result['data']['main']['pressure'] + " hPa");

                  let temp = `${Math.round(result.data.main.temp)} F`;
                  $('#temp').html(`${temp}`);
                  let feelsLike = `${Math.round(result.data.main.feels_like)} F`;
                  $('#feels').html(`${feelsLike}`);

                  //Time zone data conversion
         
                 let sunrise = result['data']['sys']['sunrise'];
                 let sunriseTime = new Date(sunrise*1000);
                 $('#sunrise_id').html(sunriseTime.toUTCString());

                 let sunset = result['data']['sys']['sunset'];
                 let sunsetTime = new Date(sunset*1000);
                 $('#sunset_id').html(sunsetTime.toUTCString());
               
            }

        }
    })

}

//get wikiData information
function  wikipediaData(capital){
    $.ajax({
        url:'libs/php/wikipedia.php',
        type:'POST',
        dataType:'json',
        data:{
            capitalCity : capital
        },
        success:function(result){
            console.log("----------------------Wikidata-------------------------");
            console.log(result);
            //console.log(result['data']['geonames'][0]['countryCode'])
            if(result.status.name =="ok"){
                 //show the data inside model
                $('#title1').html(result['data']['geonames'][0]['title']);
                $('#sum1').html(result['data']['geonames'][0]['summary']);
                $('#thumb1').attr("src",result['data']['geonames'][0]['thumbnailImg']);
                $('#thumb1').css("width","40%");
                $('#url1').html(`<p><a href=https://${result['data']['geonames'][0]['wikipediaUrl']} target="blank">Click link for more info... </a></p>`);

                $('#title2').html(result['data']['geonames'][1]['title']);
                $('#sum2').html(result['data']['geonames'][1]['summary']);
                $('#thumb2').attr("src",result['data']['geonames'][1]['thumbnailImg']);
                $('#thumb2').css("width","40%");
                $('#url2').html(`<p><a href=https://${result['data']['geonames'][1]['wikipediaUrl']} target="blank">Click link for more info... </a></p>`);

                $('#title3').html(result['data']['geonames'][2]['title']);
                $('#sum3').html(result['data']['geonames'][2]['summary']);
                $('#thumb3').attr("src",result['data']['geonames'][2]['thumbnailImg']);
                $('#thumb3').css("width","40%");
                $('#url3').html(`<p><a href=https://${result['data']['geonames'][2]['wikipediaUrl']} target="blank">Click link for more info... </a></p>`);
       
               
            }
           
        }
    })

}

//exchange Rate data
function getExchangeRate(currencyCode){
    $.ajax({
        url: 'libs/php/exchangeRate.php',
        type:'POST',
        data:{currencyCode:currencyCode},
        dataType:'json',
        success:function(result){
            console.log('---------------------exchangeRate Data------------------------')
            console.log(result);
            s = result.data.rates[currencyCode];
            $('#base').html(result['data']['base']);
            $('#date').html(result['data']['date']);
            $("#er").html(s);
            $("#cc").html(currencyCode);
            $("#cs").html(cur_symbol);   
        }

    })

}

//on  country select chage data
$('#selCountry').change(function(){
    var sel_iso3 =  $('#selCountry').find(':selected').val();
   

    countryInformation(sel_iso3);
        $.ajax({
            url:'libs/php/countryList.php',
            type:'POST',
            data : {"iso_code3":sel_iso3},
            dataType: 'JSON',
            success:(result) => {
               countryGeoJson = result['geoJson'];;
               createGeoJson(countryGeoJson);
                    
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log('Country not found');
        }
      });

 });

//when document ready call the function
$(document).ready(function(){
    main();
     
 })
