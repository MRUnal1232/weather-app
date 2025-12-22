lucide.createIcons();

// Backend API URL
const apiBaseUrl = "http://localhost:3000/api";

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
        const res = await fetch(`${apiBaseUrl}/weather?q=${city}`);
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
            fetch(`${apiBaseUrl}/weather?lat=${lat}&lon=${lon}`),
            fetch(`${apiBaseUrl}/forecast?lat=${lat}&lon=${lon}`)
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

    // Update Cities Page Data
    updateCitiesPage(current);

    // Update hourly forecast (Today's Forecast - next 24 hours)
    updateHourlyForecast(forecastList);

    // Update 7-day forecast
    update7DayForecast(forecastList);
}

function updateCitiesPage(current) {
    // City Name
    document.getElementById('city-page-name').textContent = current.name;

    // Temperature
    document.getElementById('city-page-temp').textContent = Math.round(current.main.temp) + '°';

    // Humidity
    document.getElementById('city-page-humidity').textContent = current.main.humidity + '%';

    // Sunrise
    const sunrise = new Date(current.sys.sunrise * 1000);
    document.getElementById('city-page-sunrise').textContent = sunrise.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Sunset
    const sunset = new Date(current.sys.sunset * 1000);
    document.getElementById('city-page-sunset').textContent = sunset.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function updateLocationDisplay(current) {
    const locationElement = document.getElementById('currentLocation');
    if (locationElement) {
        const country = current.sys.country || '';
        const locationText = `${current.name}${country ? ', ' + country : ''}`;
        locationElement.textContent = locationText;
    }
}

// Navigation Logic
document.getElementById('nav-weather').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('weather');
});

document.getElementById('nav-cities').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('cities');
});

function switchView(viewName) {
    const weatherView = document.getElementById('weather-view');
    const citiesView = document.getElementById('cities-view');
    const navWeather = document.getElementById('nav-weather');
    const navCities = document.getElementById('nav-cities');

    if (viewName === 'weather') {
        weatherView.classList.remove('hidden');
        citiesView.classList.add('hidden');
        navWeather.classList.add('active');
        navCities.classList.remove('active');
    } else {
        weatherView.classList.add('hidden');
        citiesView.classList.remove('hidden');
        navWeather.classList.remove('active');
        navCities.classList.add('active');
    }
}

let hourlyChartInstance = null;

function updateHourlyForecast(forecastList) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');

    // 1. Filter for next 24 hours (or just take first 8-9 items)
    // We want a nice curve, so next 24h (8 items * 3h = 24h) is good.
    const hourlyData = forecastList.slice(0, 9);

    // 2. Prepare Data
    const labels = hourlyData.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    });
    const temps = hourlyData.map(item => Math.round(item.main.temp));

    // 3. Destroy old chart if exists
    if (hourlyChartInstance) {
        hourlyChartInstance.destroy();
    }

    // 4. Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.5)'); // Yellow-400
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0.0)');

    // 5. Render Chart
    Chart.register(ChartDataLabels);
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    hourlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                data: temps,
                borderColor: '#fbbf24', // Amber-400
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4, // Smooth curve
                fill: true,
                pointBackgroundColor: '#fbbf24',
                pointBorderColor: '#1e293b',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                datalabels: {
                    align: 'top',
                    anchor: 'end',
                    color: '#94a3b8', // Gray text
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: function (value) {
                        return value + '°';
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: true
                },
                tooltip: { enabled: false } // Disable tooltip since we have labels
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    display: false, // Hide Y axis
                    min: Math.min(...temps) - 5, // Add padding for labels
                    max: Math.max(...temps) + 8
                }
            },
            layout: {
                padding: { top: 20, bottom: 10, left: 10, right: 10 }
            }
        }
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