lucide.createIcons();
const apiKey = "281b784cd67433bfdea3add27756a2cc";

window.onload = () => {
    // Initialize icons
    lucide.createIcons();

    // Get user's current location
    navigator.geolocation.getCurrentPosition(pos => {
        fetchData(pos.coords.latitude, pos.coords.longitude);
    }, (error) => {
        console.error("Geolocation error:", error);
        fetchByCity("London");
    });
};

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) fetchByCity(city);
});

// Allow Enter key to search
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = document.getElementById('cityInput').value.trim();
        if (city) fetchByCity(city);
    }
});

async function fetchByCity(city) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const data = await res.json();
        if (data.coord) {
            fetchData(data.coord.lat, data.coord.lon);
        } else {
            console.error("City not found");
        }
    } catch (error) {
        console.error("Error fetching city data:", error);
    }
}

async function fetchData(lat, lon) {
    try {
        const [curRes, foreRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        ]);
        const current = await curRes.json();
        const forecast = await foreRes.json();

        if (current && forecast && forecast.list) {
            updateUI(current, forecast.list);
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function updateUI(current, forecastList) {
    // Update main city info
    document.getElementById('cityName').textContent = current.name;
    document.getElementById('mainTemp').textContent = `${Math.round(current.main.temp)}°`;
    document.getElementById('mainDesc').textContent = current.weather[0].description;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    // Update current location display (below search bar)
    updateLocationDisplay(current);

    // Update hourly forecast (Today's Forecast - next 24 hours)
    updateHourlyForecast(forecastList);

    // Update 7-day forecast
    update7DayForecast(forecastList);
}

function updateLocationDisplay(current) {
    const locationElement = document.getElementById('currentLocation');
    if (locationElement) {
        const country = current.sys.country || '';
        const locationText = `${current.name}${country ? ', ' + country : ''}`;
        locationElement.textContent = locationText;
    }
}

function updateHourlyForecast(forecastList) {
    const hourlyCont = document.getElementById('hourlyForecast');
    hourlyCont.innerHTML = '';

    // Filter to show only today's forecasts
    const now = new Date();
    const todayStr = now.toDateString();

    const todayData = forecastList.filter(item => {
        const forecastDate = new Date(item.dt * 1000);
        return forecastDate.toDateString() === todayStr;
    });

    todayData.forEach(item => {
        const forecastDate = new Date(item.dt * 1000);
        const timeDisplay = forecastDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });

        const temp = Math.round(item.main.temp);
        const weatherIcon = getWeatherIcon(item.weather[0].main);
        const description = item.weather[0].description;

        hourlyCont.innerHTML += `
            <div class="hourly-item">
                <p class="hourly-time">${timeDisplay}</p>
                <div class="hourly-icon">${weatherIcon}</div>
                <p class="hourly-temp">${temp}°</p>
                <p class="hourly-desc">${description}</p>
            </div>`;
    });
}

function update7DayForecast(forecastList) {
    const weeklyCont = document.getElementById('weeklyForecast');
    weeklyCont.innerHTML = '';

    // Group forecast data by day
    const dailyData = {};
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: item.weather[0],
                dt: item.dt
            };
        }
        dailyData[date].temps.push(item.main.temp);
    });

    // Get available days from API
    const days = Object.keys(dailyData);

    // Extend to 7 days if needed
    const now = new Date();
    const forecastDays = [];

    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + i);
        const dateStr = targetDate.toLocaleDateString('en-US');

        if (dailyData[dateStr]) {
            // Use actual data from API
            const dayData = dailyData[dateStr];
            forecastDays.push({
                date: targetDate,
                maxTemp: Math.round(Math.max(...dayData.temps)),
                minTemp: Math.round(Math.min(...dayData.temps)),
                weather: dayData.weather,
                isProjected: false
            });
        } else if (i < days.length) {
            // Use data from available days
            const fallbackDate = days[Math.min(i, days.length - 1)];
            const dayData = dailyData[fallbackDate];
            forecastDays.push({
                date: targetDate,
                maxTemp: Math.round(Math.max(...dayData.temps)),
                minTemp: Math.round(Math.min(...dayData.temps)),
                weather: dayData.weather,
                isProjected: true
            });
        } else {
            // Use last available day's data for extended forecast
            const lastDate = days[days.length - 1];
            const dayData = dailyData[lastDate];
            forecastDays.push({
                date: targetDate,
                maxTemp: Math.round(Math.max(...dayData.temps)),
                minTemp: Math.round(Math.min(...dayData.temps)),
                weather: dayData.weather,
                isProjected: true
            });
        }
    }

    // Display all 7 days
    forecastDays.forEach(day => {
        const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
        const weatherIcon = getWeatherIcon(day.weather.main);
        const weatherDesc = day.weather.main;

        weeklyCont.innerHTML += `
            <div class="weekly-row">
                <span class="weekly-day">${dayName}</span>
                <div class="weekly-weather">
                    <span class="weekly-icon">${weatherIcon}</span>
                    <span class="weekly-desc">${weatherDesc}</span>
                </div>
                <span class="weekly-temp">${day.maxTemp}° / ${day.minTemp}°</span>
            </div>`;
    });
}

function getWeatherIcon(weatherMain) {
    const icons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️'
    };
    return icons[weatherMain] || '🌤️';
}