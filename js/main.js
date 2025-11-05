// =================== Get elements ==================

const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const myLocationBtn = document.querySelector('.my-location-btn');
const loaderSection = document.querySelector('.loader');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txts');
const tempTxt = document.querySelector('.temp-text');
const conditionTxt = document.querySelector('.condition-txt');
const humidityTxt = document.querySelector('.humidity-value-txt');
const windTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImage = document.querySelector('.weather-summary-img');
const currentTxt = document.querySelector('.current-date');


const apiKey = '33a0c815d32f46bfb5b95204250311';

// ================= Event listeners ================

searchBtn.addEventListener('click', () => {
    if(cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});
cityInput.addEventListener('keydown', (event) => {
    if(event.key == "Enter" && cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }   
});
locationBtn.addEventListener('click', getUserLocation);
myLocationBtn.addEventListener('click', getUserLocation);

// =============== Get user location ===============

async function getUserLocation() {
    try {
        showDisplaySection(loaderSection);
        
        const locationData = await fetch('https://ip-api.com/json/').then(res => res.json());
        // console.log(locationData);
        
        
        if (locationData.status === 'success') {
            const city = locationData.city || locationData.regionName;
            // console.log(city);
            
            updateWeatherInfo(city);
        } else {
            throw new Error('Could not get your location');
        }
    } catch (error) {
        console.error('Location error:', error);
        showDisplaySection(notFoundSection);
    }
}

// =============== Fetch current data ===============

async function fetchCurrentData(endPoint, city){
     const apiUrl = `https://api.weatherapi.com/v1/${endPoint}.json?key=${apiKey}&q=${city}&aqi=yes`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

// ================= Update weather ================

async function updateWeatherInfo(city){
    try {
        showDisplaySection(loaderSection);

        const weatherData = await fetchCurrentData('current', city);
        // console.log('Full API response:', weatherData); // Debug log
        
        // Check if the data structure is what we expect
        if (!weatherData.location || !weatherData.current) {
            throw new Error('Invalid data structure from API');
        }
        
        const { location, current } = weatherData;
        
        // Update DOM elements
        countryTxt.textContent = `${location.name}, ${location.country}`;
        tempTxt.textContent = `${current.temp_c} °C`;
        conditionTxt.textContent = current.condition.text;
        weatherSummaryImage.src = `assets/weather/${getWeatherIcon(current.condition.code)}`;
        humidityTxt.textContent = `${current.humidity}%`;
        windTxt.textContent = `${current.wind_mph} Mph`;
        
        // Update current date
        const now = new Date();
        currentTxt.textContent = now.toLocaleDateString('en-GB', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        await updateForecastInfo(city);
        showDisplaySection(weatherInfoSection); 
    } catch (error) {
        console.error('Error:', error);
        showDisplaySection(notFoundSection); 
    }   
}

// ============== Show display section ==============

function showDisplaySection(sectionToShow){
    [weatherInfoSection, searchCitySection, notFoundSection, loaderSection]
    .forEach(section => {
        section.classList.add('d-none');
    });

    sectionToShow.classList.remove('d-none');
}

// =============== Fetch forecast data =============

async function fetchForecastData(endPoint, city, days){
     const apiUrl = `https://api.weatherapi.com/v1/${endPoint}.json?key=${apiKey}&q=${city}&days=${days}&aqi=no&alerts=no`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

// =============== Update forecast info ============

async function updateForecastInfo(city){
    try {
        const forecastData = await fetchForecastData('forecast', city, 5);
        // console.log('Forecast API response:', forecastData); 
        
        const forecastDays = forecastData.forecast?.forecastday;
        // console.log(forecastDays);
        
        if (forecastDays && forecastDays.length > 0) {
            updateForecastDOM(forecastDays);
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    } 
}

// ============= Update forecast DOM elements =============

function updateForecastDOM(forecastDays) {
    const forecastContainer = document.querySelector('.forecast-items-container');
    forecastContainer.innerHTML = ''; 
    
    forecastDays.forEach((dayData, index) => {
        // console.log(dayData);
        
        const forecastItem = createForecastItem(dayData);
        forecastContainer.appendChild(forecastItem);
    });
}

// ============= Create forecast item element =============

function createForecastItem(dayData) {
    const { date, day } = dayData;
    
    const forecastDate = new Date(date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
    
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item col-3';
    
    forecastItem.innerHTML = `
        <h5 class="forecast-item-date regular-txt">${forecastDate}</h5>
        <img src="assets/weather/${getWeatherIcon(day.condition.code)}" class="forecast-item-img" alt="${day.condition.text}">
        <h5 class="forecast-item-temp">${Math.round(day.avgtemp_c)} °C</h5>
    `;
    
    return forecastItem;
}

// ================ Get weather icon ===============

function getWeatherIcon(code){
    const weatherIcons = {
        // Clear
        1000: 'clear.svg',
        
        // Cloudy
        1003: 'clouds.svg',
        1006: 'clouds.svg', 
        1009: 'clouds.svg',
        
        // Fog
        1030: 'fog.png',
        1135: 'fog.png',
        1147: 'fog.png',
        
        // Rain
        1063: 'rain.svg',
        1180: 'rain.svg',
        1186: 'rain.svg',
        1192: 'rain.svg',
        1240: 'rain.svg',
        1183: 'rain.svg',
        
        // Snow
        1066: 'snow.svg',
        1210: 'snow.svg',
        1216: 'snow.svg',
        1222: 'snow.svg',
        1255: 'snow.svg',
        
        // Thunderstorm
        1273: 'thunderstorm.svg',
        1276: 'thunderstorm.svg',
        1279: 'thunderstorm.svg',
        1282: 'thunderstorm.svg',
    };
    
    return weatherIcons[code] || 'atmosphere.svg'; // Default
}


