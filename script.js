// ============================================================
// CONFIGURATION: YOUR GOOGLE SHEETS PUBLISHED CSV URL
// ============================================================
const YOUR_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ40Sg6V8T4Ekp28JCBHgorNUI4cWVdm4S8JLgqDXfOGlz-qXaPEveeZzGnwNOsl5GL7f__oYiUCclT/pub?output=csv";
const USE_DEMO = false;  // Set to false because you have a real sheet now

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

// Generate weekly forecast data (based on current temperature trend)
function generateWeeklyForecast(currentTemp) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const conditions = ['Sunny', 'Partly Cloudy', 'Rainy', 'Cloudy', 'Clear', 'Showers'];
    const icons = ['☀️', '⛅', '🌧️', '☁️', '🌤️', '🌦️'];
    const today = new Date().getDay();
    const forecast = [];
    
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        // Gradual temperature change - more realistic than random
        let tempChange = 0;
        if (i === 0) tempChange = 0;
        else if (i <= 2) tempChange = Math.random() * 3;
        else tempChange = (Math.random() * 6) - 1;
        
        const conditionIndex = (i + Math.floor(currentTemp)) % conditions.length;
        forecast.push({
            day: days[dayIndex],
            temp: Math.round(currentTemp + tempChange),
            condition: conditions[conditionIndex],
            icon: icons[conditionIndex]
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

// Fallback mock weather data (used only if CSV fetch fails)
function getMockWeather() {
    const temp = 24;
    return {
        mainTemp: temp,
        condition: "Showers in Vicinity",
        dayHigh: 36,
        nightLow: 22,
        feelsLike: 26,
        humidity: 87,
        pressure: 1005.8,
        windSpeed: 14,
        rain: 0.6,
        co: 0.58,
        no2: 12.4,
        pm25: 38,
        pm10: 65,
        aqiValue: 78,
        aqiLevel: "Satisfactory",
        aqiDesc: "May cause minor breathing discomfort to sensitive people.",
        moonPhase: "Waxing Gibbous",
        moonIllum: 94,
        sunrise: "05:08",
        sunset: "18:10",
        pollenInfo: "🌾 Grass pollen is low in your area.",
        forecast: generateWeeklyForecast(temp)
    };
}

// Parse CSV from Google Sheets - matches your exact column headers
function parseCSVtoWeather(csvText) {
    const rows = csvText.trim().split(/\r?\n/);
    if (rows.length < 2) throw new Error("No data rows");
    
    const headers = rows[0].split(',').map(h => h.replace(/["']/g, '').trim().toLowerCase());
    const last = rows[rows.length - 1].split(',').map(c => c.replace(/["']/g, '').trim());
    
    function findIndex(keywords) {
        for (let kw of keywords) {
            const idx = headers.findIndex(h => h.includes(kw));
            if (idx !== -1) return idx;
        }
        return null;
    }
    
    function getNumber(idx, defaultValue) {
        if (idx !== null && last[idx] !== undefined && last[idx] !== '' && !isNaN(parseFloat(last[idx]))) {
            return parseFloat(last[idx]);
        }
        return defaultValue;
    }
    
    function getString(idx, defaultValue) {
        if (idx !== null && last[idx] !== undefined && last[idx] !== '') {
            return last[idx];
        }
        return defaultValue;
    }
    
    const temp = getNumber(findIndex(['temp', 'temperature']), 24);
    
    return {
        mainTemp: Math.round(temp),
        condition: getString(findIndex(['condition']), "Live Data"),
        dayHigh: Math.round(getNumber(findIndex(['day_high', 'high', 'max']), 36)),
        nightLow: Math.round(getNumber(findIndex(['night_low', 'low', 'min']), 22)),
        feelsLike: Math.round(getNumber(findIndex(['feels_like', 'feelslike']), temp + 1.5)),
        humidity: Math.round(getNumber(findIndex(['humidity', 'rh']), 87)),
        pressure: getNumber(findIndex(['pressure', 'baro']), 1005.8),
        windSpeed: Math.round(getNumber(findIndex(['wind_speed', 'wind', 'windspeed']), 14)),
        rain: getNumber(findIndex(['rain', 'precip']), 0.6),
        co: getNumber(findIndex(['co']), 0.58),
        no2: getNumber(findIndex(['no2']), 12.4),
        pm25: Math.round(getNumber(findIndex(['pm25']), 38)),
        pm10: Math.round(getNumber(findIndex(['pm10']), 65)),
        aqiValue: Math.round(getNumber(findIndex(['aqi']), 78)),
        aqiLevel: getString(findIndex(['aqi_level']), "Satisfactory"),
        aqiDesc: getString(findIndex(['aqi_desc']), "May cause minor breathing discomfort to sensitive people."),
        moonPhase: getString(findIndex(['moon_phase']), "Waxing Gibbous"),
        moonIllum: Math.round(getNumber(findIndex(['moon_illum']), 94)),
        sunrise: getString(findIndex(['sunrise']), "05:08"),
        sunset: getString(findIndex(['sunset']), "18:10"),
        pollenInfo: getString(findIndex(['pollen_info']), "🌾 Grass pollen is low in your area."),
        forecast: generateWeeklyForecast(Math.round(temp))
    };
}

// Update UI with weather data
function updateUI(weather) {
    document.getElementById('mainTemp').textContent = weather.mainTemp;
    document.getElementById('weatherCondition').textContent = weather.condition;
    document.getElementById('dayHigh').textContent = weather.dayHigh;
    document.getElementById('nightLow').textContent = weather.nightLow;
    document.getElementById('feelsLike').textContent = weather.feelsLike;
    document.getElementById('humidityVal').innerHTML = weather.humidity + '<span class="unit-sm">%</span>';
    document.getElementById('pressureVal').innerHTML = weather.pressure.toFixed(1) + '<span class="unit-sm"> mb</span>';
    document.getElementById('windInfo').innerHTML = weather.windSpeed + '<span class="unit-sm"> km/h</span>';
    document.getElementById('rainVal').innerHTML = weather.rain.toFixed(1) + '<span class="unit-sm"> mm/h</span>';
    document.getElementById('coVal').innerHTML = weather.co.toFixed(2) + '<span class="unit-sm"> ppm</span>';
    document.getElementById('no2Val').innerHTML = weather.no2.toFixed(1) + '<span class="unit-sm"> ppb</span>';
    document.getElementById('pm25val').innerHTML = weather.pm25 + '<span class="unit-sm"> µg/m³</span>';
    document.getElementById('pm25valSide').textContent = weather.pm25;
    document.getElementById('pm10valSide').textContent = weather.pm10;
    document.getElementById('aqiValue').textContent = weather.aqiValue;
    document.getElementById('aqiValueLarge').textContent = weather.aqiValue;
    document.getElementById('aqiLevel').textContent = weather.aqiLevel;
    document.getElementById('aqiDesc').textContent = weather.aqiDesc;
    document.getElementById('moonPhaseName').textContent = weather.moonPhase;
    document.getElementById('moonIllum').textContent = weather.moonIllum;
    document.getElementById('sunriseTime').textContent = weather.sunrise;
    document.getElementById('sunsetTime').textContent = weather.sunset;
    document.getElementById('pollenInfo').innerHTML = `<i class="fas fa-seedling"></i> ${weather.pollenInfo}`;
    
    renderForecast(weather.forecast);
    
    const now = new Date();
    document.getElementById('updateTimestamp').innerHTML = `Last update: ${now.toLocaleString()}`;
}

// Fetch live data from your Google Sheet
async function fetchLiveWeather() {
    const statusHint = document.getElementById('refreshHint');
    
    try {
        if (statusHint) statusHint.innerHTML = "Loading...";
        const response = await fetch(YOUR_SHEETS_CSV_URL, { cache: 'no-store' });
        
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const csvText = await response.text();
        if (!csvText || csvText.length < 20) throw new Error("Empty CSV data");
        
        const parsedData = parseCSVtoWeather(csvText);
        updateUI(parsedData);
        
        if (statusHint) statusHint.innerHTML = "Live";
    } catch (error) {
        console.warn("Fetch error:", error);
        if (statusHint) statusHint.innerHTML = "Offline Mode";
        updateUI(getMockWeather());
    }
}

// Refresh button functionality
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Loading';
        refreshBtn.disabled = true;
        await fetchLiveWeather();
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
    });
}

// Initial load and auto-refresh every 60 seconds
fetchLiveWeather();
setInterval(fetchLiveWeather, 60000);
