// Your Google Apps Script URL (paste your URL here)
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx4A2o5p1FymFgrOOrnIb2MjvsmmRBKWr5yyccOQoo5ZhtaZly4ZxXK3ka6LRwOHH7ntg/exec";

// Set current date
function setCurrentDate() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    document.getElementById('currentDate').textContent = `${dayName}, ${date} ${monthName} ${year}`;
}
setCurrentDate();

// Generate weekly forecast
function generateWeeklyForecast(currentTemp) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const icons = ['☀️', '⛅', '🌧️', '☁️', '🌤️', '🌦️'];
    const today = new Date().getDay();
    const forecast = [];
    
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        let tempChange = 0;
        if (i === 0) tempChange = 0;
        else if (i <= 2) tempChange = Math.random() * 3;
        else tempChange = (Math.random() * 6) - 1;
        
        forecast.push({
            day: days[dayIndex],
            temp: Math.round(currentTemp + tempChange),
            icon: icons[i % icons.length]
        });
    }
    return forecast;
}

function renderForecast(forecast) {
    const container = document.getElementById('forecastContainer');
    if (!container) return;
    container.innerHTML = forecast.map(day => `
        <div class="forecast-card">
            <div class="forecast-day">${day.day.substring(0, 3)}</div>
            <div class="forecast-icon">${day.icon}</div>
            <div class="forecast-temp">${day.temp}°</div>
        </div>
    `).join('');
}

// Fetch data from Google Apps Script
async function fetchWeatherData() {
    const statusHint = document.getElementById('refreshHint');
    
    try {
        if (statusHint) statusHint.innerHTML = "Loading...";
        const response = await fetch(APP_SCRIPT_URL);
        const result = await response.json();
        
        if (result.status === 'success' && result.data.length > 0) {
            const currentData = result.data[0];
            
            // Map columns based on your Google Sheet structure
            // Adjust these indices based on your sheet columns
            const weatherData = {
                temp: parseFloat(currentData[0]) || 24,      // Column A
                humidity: parseFloat(currentData[1]) || 87,   // Column B
                pressure: parseFloat(currentData[2]) || 1005.8, // Column C
                windSpeed: parseFloat(currentData[3]) || 14,   // Column D
                rain: parseFloat(currentData[4]) || 0.6,       // Column E
                co: parseFloat(currentData[5]) || 0.58,        // Column F
                no2: parseFloat(currentData[6]) || 12.4,       // Column G
                pm25: parseFloat(currentData[7]) || 38,        // Column H
                pm10: parseFloat(currentData[8]) || 65,        // Column I
                aqi: parseFloat(currentData[9]) || 78,         // Column J
                dayHigh: parseFloat(currentData[10]) || 36,    // Column K
                nightLow: parseFloat(currentData[11]) || 22,   // Column L
                feelsLike: parseFloat(currentData[12]) || 26,  // Column M
                condition: currentData[13] || "Showers",       // Column N
                sunrise: currentData[14] || "05:08",           // Column O
                sunset: currentData[15] || "18:10",            // Column P
                moonPhase: currentData[16] || "Waxing Gibbous", // Column Q
                moonIllum: parseFloat(currentData[17]) || 94,   // Column R
                aqiLevel: currentData[18] || "Satisfactory",    // Column S
                aqiDesc: currentData[19] || "May cause minor breathing discomfort", // Column T
                pollenInfo: currentData[20] || "Grass pollen is low in your area"   // Column U
            };
            
            updateUI(weatherData);
            if (statusHint) statusHint.innerHTML = "Live";
        } else {
            throw new Error("No data available");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        if (statusHint) statusHint.innerHTML = "Offline Mode";
        updateUI(getFallbackData());
    }
}

// Fallback data (if fetch fails)
function getFallbackData() {
    return {
        temp: 24, humidity: 87, pressure: 1005.8, windSpeed: 14,
        rain: 0.6, co: 0.58, no2: 12.4, pm25: 38, pm10: 65,
        aqi: 78, dayHigh: 36, nightLow: 22, feelsLike: 26,
        condition: "Showers", sunrise: "05:08", sunset: "18:10",
        moonPhase: "Waxing Gibbous", moonIllum: 94,
        aqiLevel: "Satisfactory", aqiDesc: "May cause minor breathing discomfort",
        pollenInfo: "Grass pollen is low in your area"
    };
}

// Update all displays
function updateUI(w) {
    document.getElementById('mainTemp').textContent = w.temp;
    document.getElementById('weatherCondition').textContent = w.condition;
    document.getElementById('dayHigh').textContent = w.dayHigh;
    document.getElementById('nightLow').textContent = w.nightLow;
    document.getElementById('feelsLike').textContent = w.feelsLike;
    document.getElementById('humidityVal').innerHTML = w.humidity + '<span class="unit-sm">%</span>';
    document.getElementById('pressureVal').innerHTML = w.pressure.toFixed(1) + '<span class="unit-sm"> mb</span>';
    document.getElementById('windInfo').innerHTML = w.windSpeed + '<span class="unit-sm"> km/h</span>';
    document.getElementById('rainVal').innerHTML = w.rain.toFixed(1) + '<span class="unit-sm"> mm/h</span>';
    document.getElementById('coVal').innerHTML = w.co.toFixed(2) + '<span class="unit-sm"> ppm</span>';
    document.getElementById('no2Val').innerHTML = w.no2.toFixed(1) + '<span class="unit-sm"> ppb</span>';
    document.getElementById('pm25val').innerHTML = w.pm25 + '<span class="unit-sm"> µg/m³</span>';
    document.getElementById('pm25valSide').textContent = w.pm25;
    document.getElementById('pm10valSide').textContent = w.pm10;
    document.getElementById('aqiValue').textContent = w.aqi;
    document.getElementById('aqiValueLarge').textContent = w.aqi;
    document.getElementById('aqiLevel').textContent = w.aqiLevel;
    document.getElementById('aqiDesc').textContent = w.aqiDesc;
    document.getElementById('moonPhaseName').textContent = w.moonPhase;
    document.getElementById('moonIllum').textContent = w.moonIllum;
    document.getElementById('sunriseTime').textContent = w.sunrise;
    document.getElementById('sunsetTime').textContent = w.sunset;
    document.getElementById('pollenInfo').innerHTML = `<i class="fas fa-seedling"></i> ${w.pollenInfo}`;
    
    renderForecast(generateWeeklyForecast(w.temp));
    document.getElementById('updateTimestamp').innerHTML = `Last update: ${new Date().toLocaleString()}`;
}

// Refresh button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Loading';
        refreshBtn.disabled = true;
        await fetchWeatherData();
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
        refreshBtn.disabled = false;
    });
}

// Start fetching
fetchWeatherData();
setInterval(fetchWeatherData, 60000);
