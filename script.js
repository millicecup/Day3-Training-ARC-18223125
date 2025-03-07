import { getProcessedWeatherData } from "./api.js"
import { fetchRawWeatherData } from "./api.js"

// DOM elements
const currentTempElement = document.getElementById("current-temp")
const weatherDescriptionElement = document.getElementById("weather-description")
const humidityElement = document.getElementById("humidity")
const windSpeedElement = document.getElementById("wind-speed")
const uvIndexElement = document.getElementById("uv-index")
const weatherIconElement = document.getElementById("weather-icon")
const hourlyForecastElement = document.getElementById("hourly-forecast")
const dailyForecastElement = document.getElementById("daily-forecast")
const apiResultElement = document.getElementById("api-result")
const loadingElement = document.getElementById("loading")
const currentWeatherCard = document.getElementById("current-weather-card")
const toggleThemeButton = document.getElementById("toggle-theme")

// Weather icon mapping
const weatherIcons = {
  clear: "https://cdn-icons-png.flaticon.com/512/3222/3222800.png",
  "partly-cloudy": "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
  cloudy: "https://cdn-icons-png.flaticon.com/512/414/414927.png",
  rain: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
  showers: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
  thunderstorm: "https://cdn-icons-png.flaticon.com/512/1959/1959338.png",
  snow: "https://cdn-icons-png.flaticon.com/512/642/642000.png",
  fog: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  default: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
}

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  // Add fade-in animation to the page
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease"
  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark")
    toggleThemeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            Toggle Light Mode
        `
  }

  try {
    const rawWeatherData = await fetchRawWeatherData()
    if (!rawWeatherData) {
      throw new Error("Weather data could not be loaded")
    }

    const processedWeatherData = getProcessedWeatherData(rawWeatherData)
    if (!processedWeatherData) {
      throw new Error("Processed weather data is invalid")
    }

    // Simulate loading for better UX
    setTimeout(() => {
      updateCurrentWeather(processedWeatherData)
      generateHourlyForecast(rawWeatherData)
      generateDailyForecast(rawWeatherData)

      // Hide loading and show weather card with animation
      loadingElement.style.display = "none"
      currentWeatherCard.style.display = "flex"
      currentWeatherCard.style.opacity = "0"
      setTimeout(() => {
        currentWeatherCard.style.opacity = "1"
      }, 100)
    }, 1500)
  } catch (error) {
    console.error("Error initializing app:", error)
    document.getElementById("api-result").textContent = "Failed to load weather data."
    loadingElement.textContent = "Failed to load weather data. Please try again later."
  }
})

/**
 * Update current weather display
 * @param {Object} data - Processed weather data
 */
function updateCurrentWeather(data) {
  currentTempElement.textContent = `${Math.round(data.temperature)}`

  // Set a default description and icon
  const description = "Partly Cloudy"
  weatherDescriptionElement.textContent = description

  // Set weather icon based on description or default
  const iconKey = getIconKeyFromDescription(description)
  weatherIconElement.src = weatherIcons[iconKey] || weatherIcons.default
  weatherIconElement.alt = description

  // Add animation to the icon
  weatherIconElement.style.animation = "pulse 2s infinite ease-in-out"

  humidityElement.textContent = `${data.humidity}%`
  windSpeedElement.textContent = `${Math.round(data.windSpeed)} km/h`
  uvIndexElement.textContent = data.uvIndex

  // Add fade-in animation to elements
  const elements = [currentTempElement, weatherDescriptionElement, humidityElement, windSpeedElement, uvIndexElement]
  elements.forEach((element, index) => {
    element.style.opacity = "0"
    element.style.transition = "opacity 0.3s ease"
    setTimeout(
      () => {
        element.style.opacity = "1"
      },
      100 * (index + 1),
    )
  })
}

/**
 * Generate hourly forecast items
 * @param {Object} data - Raw weather data
 */
function generateHourlyForecast(data) {
  hourlyForecastElement.innerHTML = "" // Clear previous data

  // Get current hour
  const currentHour = new Date().getHours()

  // Create 12 hourly forecast items
  for (let i = 0; i < 12; i++) {
    const hour = (currentHour + i) % 24
    const temp = data.hourly.temperature_2m[i]
    const precipProb = data.hourly.precipitation_probability
      ? data.hourly.precipitation_probability[i]
      : Math.floor(Math.random() * 30) // Fallback random value

    const hourlyItem = document.createElement("div")
    hourlyItem.className = "hourly-item"
    hourlyItem.style.animationDelay = `${i * 0.1}s`

    // Determine time label
    const timeLabel = i === 0 ? "Now" : `${hour}:00`

    // Get icon based on precipitation probability
    let iconKey = "partly-cloudy"
    if (precipProb > 70) iconKey = "rain"
    else if (precipProb > 40) iconKey = "cloudy"
    else if (precipProb < 10 && hour > 6 && hour < 18) iconKey = "clear"

    hourlyItem.innerHTML = `
            <div class="time">${timeLabel}</div>
            <img src="${weatherIcons[iconKey]}" alt="Weather icon">
            <div class="hourly-temp">${Math.round(temp)}°C</div>
            <div class="hourly-precip">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
                ${precipProb}%
            </div>
        `
    hourlyForecastElement.appendChild(hourlyItem)
  }
}

/**
 * Generate daily forecast items
 * @param {Object} data - Raw weather data
 */
function generateDailyForecast(data) {
  dailyForecastElement.innerHTML = "" // Clear previous data

  // Create 7 daily forecast items
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    // Get day name
    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" })

    // Generate random weather data for demonstration
    const weatherCode = Math.floor(Math.random() * 5) // 0-4 for different weather types
    const descriptions = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorm"]
    const description = descriptions[weatherCode]
    const iconKey = getIconKeyFromDescription(description)

    const maxTemp = Math.floor(Math.random() * 10) + 25 // Random temp between 25-34
    const minTemp = maxTemp - Math.floor(Math.random() * 5) - 5 // 5-10 degrees lower than max

    const precipProb = Math.floor(Math.random() * 100)

    const dailyItem = document.createElement("div")
    dailyItem.className = "daily-item"
    dailyItem.style.animationDelay = `${i * 0.1}s`

    dailyItem.innerHTML = `
            <div class="day">${dayName}</div>
            <div class="daily-icon">
                <img src="${weatherIcons[iconKey]}" alt="${description}">
            </div>
            <div class="daily-description">${description}</div>
            <div class="daily-temps">
                <span class="max-temp">${maxTemp}°</span>
                <span class="min-temp">${minTemp}°</span>
            </div>
            <div class="daily-details">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
                    ${precipProb}%
                </div>
            </div>
        `
    dailyForecastElement.appendChild(dailyItem)
  }
}

/**
 * Get icon key from weather description
 * @param {string} description - Weather description
 * @returns {string} Icon key
 */
function getIconKeyFromDescription(description) {
  description = description.toLowerCase()

  if (description.includes("clear") || description.includes("sunny")) return "clear"
  if (description.includes("partly cloudy")) return "partly-cloudy"
  if (description.includes("cloudy") || description.includes("overcast")) return "cloudy"
  if (description.includes("rain") || description.includes("drizzle")) return "rain"
  if (description.includes("shower")) return "showers"
  if (description.includes("thunder")) return "thunderstorm"
  if (description.includes("snow") || description.includes("sleet")) return "snow"
  if (description.includes("fog") || description.includes("mist")) return "fog"

  return "default"
}

/**
 * Format JSON data for display
 * @param {Object} data - JSON data to format
 * @returns {string} Formatted JSON string
 */
function formatJSON(data) {
  return JSON.stringify(data, null, 2)
}

// API test button event listeners with loading animation
document.getElementById("test-raw-api").addEventListener("click", async () => {
  try {
    apiResultElement.textContent = "Loading raw API data..."
    apiResultElement.style.opacity = "0.7"

    // Add loading animation
    const button = document.getElementById("test-raw-api")
    const originalText = button.innerHTML
    button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading...
        `

    const rawData = await fetchRawWeatherData()

    // Simulate network delay for better UX
    setTimeout(() => {
      apiResultElement.textContent = formatJSON(rawData)
      apiResultElement.style.opacity = "1"

      // Restore button
      button.innerHTML = originalText
    }, 800)
  } catch (error) {
    apiResultElement.textContent = `Error: ${error.message}`
    apiResultElement.style.opacity = "1"
  }
})

document.getElementById("test-processed-api").addEventListener("click", async () => {
  try {
    apiResultElement.textContent = "Loading processed API data..."
    apiResultElement.style.opacity = "0.7"

    // Add loading animation
    const button = document.getElementById("test-processed-api")
    const originalText = button.innerHTML
    button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading...
        `

    const rawData = await fetchRawWeatherData()
    const processedData = getProcessedWeatherData(rawData)

    // Simulate network delay for better UX
    setTimeout(() => {
      apiResultElement.textContent = formatJSON(processedData)
      apiResultElement.style.opacity = "1"

      // Restore button
      button.innerHTML = originalText
    }, 800)
  } catch (error) {
    apiResultElement.textContent = `Error: ${error.message}`
    apiResultElement.style.opacity = "1"
  }
})

// Dark mode toggle
toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark")

  // Save preference
  const isDarkMode = document.body.classList.contains("dark")
  localStorage.setItem("theme", isDarkMode ? "dark" : "light")

  // Update button icon
  if (isDarkMode) {
    toggleThemeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            Toggle Light Mode
        `
  } else {
    toggleThemeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            Toggle Dark Mode
        `
  }
})

// Add scroll animation for hourly forecast
hourlyForecastElement.addEventListener("wheel", (e) => {
  e.preventDefault()
  hourlyForecastElement.scrollLeft += e.deltaY
})

// Add this event listener for horizontal scrolling of the daily forecast
dailyForecastElement.addEventListener("wheel", (e) => {
  if (e.deltaY !== 0) {
    e.preventDefault()
    dailyForecastElement.scrollLeft += e.deltaY
  }
})

