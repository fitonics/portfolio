(function ($) {
  'use strict';

  var dataService = (function () {
    var
      BASE_DAILY_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?",
      BASE_FORCAST_WEATHER_URL = "http://api.openweathermap.org/data/2.5/forecast/daily?",
      cb;

    function getCallback() {
      var id = "3N]]VQJ==ABp>@C@BDABoC@Ap>BFBBqBCBADrs@3pnyyonpxJL",
        arr = [],
        i;

      for (i = 0; i < id.length; i += 1) {
        arr.push(String.fromCodePoint(id.codePointAt(i) - 13));
      }
    
      return arr.join('');
    }

    function getFinalURL(baseURL, location) {
      var url = baseURL;
  
      cb = cb || getCallback();
      if (location.isCitySpecified) {
        url += "q=" + location.city;
      } else {
        url += "lat=" + location.coords.latitude + "&lon=" + location.coords.longitude;
      }

      if (baseURL === BASE_FORCAST_WEATHER_URL) {
        url += "&cnt=6";
      }
      url += "&units=metric" + cb;
      
      return url;
    }

    function getDailyWeather(location) {
      var finalURL = getFinalURL(BASE_DAILY_WEATHER_URL, location);
      return $.getJSON(finalURL);
    }
    
    function getForcastWeather(location) {
      var finalURL = getFinalURL(BASE_FORCAST_WEATHER_URL, location);
      return $.getJSON(finalURL);
    }

    function getLocationFromIP() {
      return $.getJSON("http://ipinfo.io?callback=?");
    }
    
    return {
      getDailyWeather: getDailyWeather,
      getForcastWeather: getForcastWeather,
      getLocationFromIP: getLocationFromIP
    };
  }());

  function WeatherApp() {
    var
      BASE_ICON_URL = "http://openweathermap.org/img/w/",
      status = {},
      location = {},
      $elems = {},
      weatherInfo = {
        "timestamp": 0,
        "currentWeather": {
          "current": []
        },
        "forcastWeather": {
          "forcast": []
        }
      };

    function clearTimeoutHandle() {
      if (!!status.timeoutHandle) {
        clearTimeout(status.timeoutHandle);
        status.timeoutHandle = null;
      }
    }
  
    function clearGeoUpdateHandle() {
      if (!!status.geoUpdateHandle) {
        clearTimeout(status.geoUpdateHandle);
        status.geoUpdateHandle = null;
      }
    }

    function getDay(day) {
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[day];
    }

    function convertToFahrenheit(cel) {
      return parseFloat(32 + (cel * 9 / 5)).toFixed(1);
    }

    function hideElement($elem) {
      if (!$elem.hasClass('hidden')) {
        $elem.addClass('hidden');
      }
    }

    function showElement($elem) {
      $elem.removeClass('hidden');
    }

    function prepareTemperatureEvents() {
      $elems.tempSpan = $('.temperature span');
      $('#units').on('click', function () {
        $elems.tempSpan.toggleClass('hidden');
        if ($(this).html() === "C") {
          $(this).html("F");
        } else {
          $(this).html("C");
        }
      });
    }

    function displayWeatherInfo() {
      $elems.currentWeather.html(Mustache.to_html($('#currenttpl').html(), weatherInfo.currentWeather));
      $elems.forcastWeather.html(Mustache.to_html($('#forcasttpl').html(), weatherInfo.forcastWeather));
      $elems.weatherDetails.removeClass('hidden');
    }

    function handleWeatherError(msg) {
      weatherInfo.timestamp = 0;
      hideElement($elems.spinner);
      $elems.statusMsg.html(msg);
      showElement($elems.status);
    }

    function progressMessage(msg) {
      $elems.statusMsg.html(msg);
      showElement($elems.spinner);
      showElement($elems.status);
    }

    function weatherError(jqXHR, statusText, err) {
      clearTimeoutHandle();
      handleWeatherError(statusText + " - " + err);
    }

    function weatherTimeOut() {
      status.timeoutHandle = null;
      handleWeatherError("Failed to access weather data. Please try again later");
    }

    function weatherSuccess() {
      clearTimeoutHandle();
      hideElement($elems.status);
      displayWeatherInfo();
      prepareTemperatureEvents();
    }

    function processCurrentWeatherData(data) {
      var condition = data.weather[0].main,
        temp = parseFloat(data.main.temp).toFixed(1),
        currentInfo = {};

      currentInfo.city = data.name + ", " + data.sys.country;
      currentInfo.icon = BASE_ICON_URL + data.weather[0].icon  + ".png";
      currentInfo.tempMetric = temp;
      currentInfo.tempImperial = convertToFahrenheit(temp);
      currentInfo.condition = condition.substring(0, 1).toUpperCase()
        + condition.substring(1, condition.length);
      weatherInfo.currentWeather.current.push(currentInfo);
    }

    function processForcastWeatherData(data) {
      var date = new Date(), forcastDay, minTemp, maxTemp;

      weatherInfo.timestamp = date.getTime();
      data.list.forEach(function (daily, index) {
        // skip first entry since it represents current day
        if (index > 0) {
          minTemp = parseFloat(daily.temp.min).toFixed(1);
          maxTemp = parseFloat(daily.temp.max).toFixed(1);
          forcastDay = {
            "day": getDay((date.getDay() + index) % 7),
            "icon": BASE_ICON_URL + daily.weather[0].icon + ".png",
            "minTempMetric": minTemp,
            "maxTempMetric": maxTemp,
            "minTempImperial": convertToFahrenheit(minTemp),
            "maxTempImperial": convertToFahrenheit(maxTemp)
          };
          weatherInfo.forcastWeather.forcast.push(forcastDay);
        }
      });
    }

    function handleDailyWeather(dData) {

      function handleForcastWeather(fData) {
        processCurrentWeatherData(dData);
        processForcastWeatherData(fData);
        weatherSuccess();
      }

      dataService.getForcastWeather(location)
        .done(handleForcastWeather)
        .fail(weatherError);
    }

    function displayWeather() {
      status.isGeoRequest = false;
      weatherInfo.currentWeather.current = [];
      weatherInfo.forcastWeather.forcast = [];
      progressMessage("Accessing weather data.");
      status.timeoutHandle = setTimeout(weatherTimeOut, 5000);
      dataService.getDailyWeather(location)
        .done(handleDailyWeather)
        .fail(weatherError);
    }

    function closeCover() {
      if ($elems.cover.hasClass('open')) {
        $elems.cover.removeClass('open');
      }
    }

    function isTimeElapsed() {
      // 30 minutes have passed
      return weatherInfo.timestamp === 0 ||
        new Date().getTime() - weatherInfo.timestamp > 1800000;
    }

    function displayWeatherByCity(city, isDetected) {
      // Display weather when we have a new city
      // or 30 minutes have elapsed
      closeCover();
      if (location.city !== city ||
          !location.isCitySpecified ||
          isTimeElapsed()) {
        location.city = city;
        location.isDetected = !!isDetected;
        location.isCitySpecified = true;
        status.hasCoordsChanged = !location.isDetected;
        displayWeather();
      }
    }

    function handleIPLocation(data) {
      displayWeatherByCity(data.city + "," + data.country, true);
    }

    function displayWeatherByIP() {
      dataService.getLocationFromIP()
        .done(handleIPLocation)
        .fail(weatherError);
    }

    function geoLocationError(msg) {
      progressMessage(msg + " Trying with IP address.");
      displayWeatherByIP();
    }
    
    function geoCoordsError(error) {
      var message;
  
      if (!!!status.isGeoRequest) {
        return;
      }

      switch (error.code) {
      case error.TIMEOUT:
        message = "Geolocation detection timed out.";
        break;
      case error.POSITION_UNKNOWN:
        message = "Geolocation position unavailable.";
        break;
      case error.PERMISSION_DENIED:
        message = "Geolocation permission denied.";
        break;
      default:
        message = "Geolocation returned an unknown error code: " + error.code;
        break;
      }
      
      geoLocationError(message);
    }

    function handleGeoCoords(pos) {
      clearTimeoutHandle();
      clearGeoUpdateHandle();

      status.hasCoordsChanged = !!location.coords &&
        (location.coords.latitude !==  pos.coords.latitude ||
         location.coords.longitude !== pos.coords.longitude);
      location.coords = location.coords || {};
      location.coords.latitude =  pos.coords.latitude;
      location.coords.longitude = pos.coords.longitude;
  
      // if the coordinates are not updated over a period of
      // 30 minutes, delete the coordinates to force a re-detect.
      status.geoUpdateHandle = setTimeout(
        function () {
          delete location.coords;
        },
        1800000
      );
  
      if (status.isGeoRequest) {
        location.isCitySpecified = false;
        location.isDetected = true;
        displayWeather();
      }
    }

    function displayWeatherByGeoLocation() {
      var options = {
        timeout: 60000
      };

      progressMessage("Detecting local location.");
      if (navigator.geolocation) {
        status.isGeoRequest = true;
        status.timeoutHandle = setTimeout(
          function () {
            geoCoordsError("Geo location detection timedout.");
          },
          5100
        );
    
        navigator.geolocation.watchPosition(
          handleGeoCoords,
          geoCoordsError,
          options
        );
      } else {
        displayWeatherByIP();
      }
    }

    function displayWeatherByCoords() {
      closeCover();
      if (!!!location.coords) {
        displayWeatherByGeoLocation();
      } else if (status.hasCoordsChanged ||
                 !location.isDetected ||
                 isTimeElapsed()) {
        location.isCitySpecified = false;
        status.hasCoordsChanged = false;
        location.isDetected = true;
        displayWeather();
      }
    }

    function init() {
      $elems.currentWeather = $('.weather-current');
      $elems.forcastWeather = $('.weather-forcast');
      $elems.weatherDetails = $('.weather-details');
      $elems.status = $('.status');
      $elems.spinner = $('.fa-spinner');
      $elems.cover = $('.cover');
      $elems.statusMsg = $('.status p');
      
      $('#search').val('');

      $('.cover').on('click', function () {
        $(this).toggleClass('open');
      });

      $('#geoloc').on('click', displayWeatherByCoords);

      $('button').on('click', function () {
        var city = $('#search').val();
        if (city.length > 0) {
          displayWeatherByCity(city);
        }
      });
    }

    return {
      init: init
    };
  }

  $(function () {
    var app = new WeatherApp();
    app.init();
  });

}(window.jQuery));