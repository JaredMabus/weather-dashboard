// Selectors
const container = $("#page-layout");
const searchContainer = $("#search-container");
const weatherContainer = $("#weather-container");
const fiveDayForecastEl = $("#five-day-forecast");
const todayWeatherEl = $("#today-weather");
// Search
const searchForm = $("#search-form");
const searchInputEl = $("#search-input");
const searchHistoryList = $("#history-list");

const apiKey = "d40a97aa8657a190a859f3f282eef526";
let currDay = moment().format("DDD");
today = moment().format("DDD");
const weatherDays = [];
const searchHistory = [];
let todaysWeather;

// Fetch api call to get lon and lat of city
const getWeatherForecast = (city) => {
  const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  fetch(requestUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const { city } = data;
      addCityToHistory(city);
      return city.coord;
    })
    .then((coord) => {
      const { lat, lon } = coord;
      return forecastLatLonApi(lat, lon);
    })
    .catch((err) => {
      console.log(err);
    });
};

// API Lat and Lon
const forecastLatLonApi = (lat, lon) => {
  const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  console.log(lat, lon);
  return fetch(requestUrl)
    .then((response) => {
      return response.json();
    })
    .then((sampleData) => {
      // Set today's weather
      todaysWeather = [sampleData.city, sampleData.list[0]];

      // Clear weather array
      weatherDays.length = 0;

      sampleData.list.forEach(function (tsObj) {
        // Makes a moment date object for each record
        const dateObj = moment.unix(tsObj.dt);

        // Generate the day # for the day in the date object
        const dateNum = dateObj.format("DDD");

        // If the current date in tsObj hasn't had a record put into weatherDays, do that now
        // Then skip over all other records for this day
        if (
          dateNum !== currDay &&
          today !== dateNum &&
          weatherDays.length < 5
        ) {
          weatherDays.push(tsObj);
          currDay = dateNum;
        }
      });
    })
    .then(() => {
      renderTodayWeather();
      renderForecast();
    })
    .catch((err) => {
      console.log(err);
    });
};

// Render Element
const renderElement = (tag, content, appendTo) => {
  const elem = $(tag);
  elem.text(content);
  $(appendTo).append(elem);
};

// Render 5-day forecast card
const renderForecast = () => {
  console.log(weatherDays);
  fiveDayForecastEl.html("");

  weatherDays.forEach((day) => {
    const { dt, main, wind } = day;
    const weatherIcon = day.weather[0].icon;
    // Create Elements
    const dayCard = $("<div class='card'>");
    const dayCardBody = $("<div class='card-body'>");
    const dateEl = $("<h4 class='card-title'>");
    const tempEl = $("<p class='card-text'>");
    const windEl = $("<p class='card-text'>");
    const humidityEl = $("<p class='card-text'>");
    const weatherIconEl = $("<img class='card-text'>");
    weatherIconEl.attr(
      "src",
      `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`
    );

    dateEl.text(moment.unix(dt).format("M/D/YYYY"));
    tempEl.text(`Temp: ${main.temp} (\u00B0F)`);
    windEl.text(`Wind: ${wind.speed} MPH`);
    humidityEl.text(`Humidity: ${main.humidity}%`);

    // Append Elements
    fiveDayForecastEl.append(dayCard);
    dayCard.append(dayCardBody);
    dayCardBody.append(dateEl);
    dayCardBody.append(weatherIconEl);
    dayCardBody.append(tempEl);
    dayCardBody.append(windEl);
    dayCardBody.append(humidityEl);
  });
};

// Render today's weather
const renderTodayWeather = () => {
  todayWeatherEl.html("");
  const cityInfo = todaysWeather[0];
  const weather = todaysWeather[1];

  const { dt, main, wind } = weather;
  const weatherIcon = weather.weather[0].icon;
  // Create Elements
  const cityContainer = $("<div class='city-container'>");
  const cityEl = $("<h3>");
  const dateEl = $("<h4>");
  const tempEl = $("<p>");
  const windEl = $("<p>");
  const humidityEl = $("<p>");
  const weatherIconEl = $("<img class='card-text'>");
  weatherIconEl.attr(
    "src",
    `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`
  );

  cityEl.text(cityInfo.name);
  dateEl.text(moment.unix(dt).format("M/D/YYYY"));
  tempEl.text(`Temp: ${main.temp} (\u00B0F)`);
  windEl.text(`Wind: ${wind.speed} MPH`);
  humidityEl.text(`Humidity: ${main.humidity}%`);

  // Append Elements
  todayWeatherEl.append(cityContainer);
  cityContainer.append(cityEl);
  cityContainer.append(dateEl);
  cityContainer.append(weatherIconEl);

  todayWeatherEl.append(tempEl);
  todayWeatherEl.append(windEl);
  todayWeatherEl.append(humidityEl);
};

// Render search history
const renderSearchHisotry = () => {
  searchHistoryList.html("");
  searchHistory.forEach((item, i) => {
    searchHistoryList.append(
      $("<button>")
        .addClass("list-group-item list-group-item-action")
        .text(item.name)
        .attr("id", "history-item")
        .attr("value", item.name)
        .attr("data-lat", item.lat)
        .attr("data-lon", item.lon)
    );
  });
};

// Add city to array and update localstorage
const addCityToHistory = (city) => {
  // Used .some to test if already in history. url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
  const alreadyInHistory = (item) => city.name === item.name;
  if (searchHistory.some(alreadyInHistory)) {
    return;
  } else {
    searchHistory.unshift({
      name: city.name,
      lat: city.coord.lat,
      lon: city.coord.lon,
    });
    renderSearchHisotry();
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }
};

// Create local storage functions
const getLocalStorage = () => {
  const searchHistoryLocal = JSON.parse(localStorage.getItem("searchHistory"));
  if (searchHistoryLocal !== null) {
    searchHistoryLocal.forEach((item) => {
      searchHistory.push(item);
    });
  } else {
    return;
  }
};

// Run init at start
const init = function () {
  getLocalStorage();
  renderSearchHisotry();
};
init();

// Event listeners
// Run weather api on submit
searchForm.on("submit", (e) => {
  e.preventDefault();
  const searchInput = searchInputEl.val();
  if (searchInput && searchInput !== null) {
    getWeatherForecast(searchInput);
  } else {
    console.log("Empty search field");
  }
});

// Add event listener on search container to run another query
searchContainer.on("click", "#history-item", function () {
  console.log($(this).val());
  const lat = $(this).attr("data-lat");
  const lon = $(this).attr("data-lon");
  forecastLatLonApi(lat, lon);
});
