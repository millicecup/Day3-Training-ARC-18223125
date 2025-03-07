// api.js
const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=-6.9222&longitude=107.6069&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_80m,uv_index,uv_index_clear_sky,is_day,sunshine_duration&daily=weather_code,sunrise,sunset,daylight_duration,precipitation_sum,precipitation_hours&timezone=auto&past_days=7";

async function fetchRawWeatherData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Check if data contains 'hourly' to prevent undefined errors
        if (!data || !data.hourly) {
            throw new Error("Invalid weather data format received");
        }

        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null; // Return null instead of undefined
    }
}


// script.js

document.addEventListener("DOMContentLoaded", async () => {
    const loadingElement = document.getElementById("loading");
    const currentWeatherCard = document.getElementById("current-weather-card");
    
    try {
        const weatherData = await fetchRawWeatherData();
        document.getElementById("current-temp").textContent = `${weatherData.hourly.temperature_2m[0]}°C`;
        document.getElementById("humidity").textContent = `${weatherData.hourly.relative_humidity_2m[0]}%`;
        document.getElementById("wind-speed").textContent = `${weatherData.hourly.wind_speed_80m[0]} km/h`;
        document.getElementById("uv-index").textContent = weatherData.hourly.uv_index[0];
        
        loadingElement.style.display = "none";
        currentWeatherCard.style.display = "block";
    } catch (error) {
        console.error("Error updating weather:", error);
        document.getElementById("api-result").textContent = "Failed to load weather data.";
    }
});

function getProcessedWeatherData(rawData) {
    if (!rawData || !rawData.hourly) {
        console.error("Invalid raw data received:", rawData);
        return null; // Return null instead of breaking
    }

    return {
        temperature: rawData.hourly.temperature_2m[0],
        humidity: rawData.hourly.relative_humidity_2m[0],
        windSpeed: rawData.hourly.wind_speed_80m[0],
        uvIndex: rawData.hourly.uv_index[0],
    };
}

export { fetchRawWeatherData, getProcessedWeatherData };

