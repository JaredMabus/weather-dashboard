// Selectors
const container = $("#page-layout");
const searchContainer = $("#search-container");
const weatherContainer = $("#weather-container");
const fiveDayForecastEl = $("#five-day-forecast");
// Search
const searchForm = $("#search-form");
const searchInputEl = $("#search-input");
const searchHistoryList = $("#history-list");

/* Weather API Log and Lat
    url: https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=d40a97aa8657a190a859f3f282eef526
    url: https://api.openweathermap.org/data/2.5/forecast?q={city_name}&appid=d40a97aa8657a190a859f3f282eef526
*/

const apiKey = "d40a97aa8657a190a859f3f282eef526";
const searchHistory = [];
let currDay = null;
const weatherDays = [];

// Fetch api call to get lon and lat of city
const getWeatherForecast = (city) => {
  const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  fetch(requestUrl)
    .then((response) => {
      // console.log(response);
      return response.json();
    })
    .then((data) => {
      // console.log(data.city.coord);
      const { city } = data;
      addCityToHistory(city);
      return city.coord;
    })
    .then((coord) => {
      const { lat, lon } = coord;
      const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
      return fetch(requestUrl);
    })
    .then((response) => {
      // console.log(response);
      return response.json();
    })
    .then((sampleData) => {
      sampleData.list.forEach(function (tsObj) {
        // Makes a moment date object for each record
        const dateObj = moment.unix(tsObj.dt);

        // Generate the day # for the day in the date object
        const dateNum = dateObj.format("DDD");

        // If the current date in tsObj hasn't had a record put into weatherDays, do that now
        // Then skip over all other records for this day
        if (dateNum !== currDay && weatherDays.length < 5) {
          weatherDays.push(tsObj);
          currDay = dateNum;
          // console.log(tsObj);
        }
      });
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

// Render search history
const renderSearchHisotry = () => {
  searchHistoryList.html("");
  searchHistory.forEach((item) => {
    const newHistoryItem = $("<button 'type:button'>");
    newHistoryItem.addClass("list-group-item list-group-item-action");
    newHistoryItem.text(item.name);
    searchHistoryList.append(newHistoryItem);
  });
};

// Add city to array and update localstorage
const addCityToHistory = (city) => {
  // Used .some to test if already in history
  // url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
  const alreadyInHistory = (item) => city.name === item.name;
  console.log(searchHistory.some(alreadyInHistory));
  if (searchHistory.some(alreadyInHistory)) {
    return;
  } else {
    searchHistory.push({
      name: city.name,
      lat: city.coord.lat,
      lon: city.coord.lon,
    });
    renderSearchHisotry();
  }
  // update localstorage
};

// Create local storage functions

// Run init at start
const init = function () {
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
