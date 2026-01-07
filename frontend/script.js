lucide.createIcons();

// Backend API URL - loaded from config.js
const apiBaseUrl = window.CONFIG?.API_BASE_URL || "http://localhost:3000/api";

window.onload = () => {
    // Initialize icons
    lucide.createIcons();

    // Load settings from localStorage
    loadSettings();

    // Check for default location setting
    const defaultLocation = appSettings.defaultLocation;

    if (defaultLocation) {
        // Use default location
        fetchByCity(defaultLocation);
    } else {
        // Get user's current location
        navigator.geolocation.getCurrentPosition(pos => {
            fetchData(pos.coords.latitude, pos.coords.longitude);
        }, (error) => {
            console.error("Geolocation error:", error);
            fetchByCity("London");
        });
    }
};

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) handleSearch(city);
});

// Allow Enter key to search
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = document.getElementById('cityInput').value.trim();
        if (city) handleSearch(city);
    }
});

async function handleSearch(city) {
    const btn = document.getElementById('searchBtn');
    const originalContent = btn.innerHTML;

    // 1. Show Loading State
    btn.innerHTML = `<i data-lucide="loader-2" class="loading-spinner"></i>`;
    lucide.createIcons(); // Render the new icon
    btn.disabled = true;

    try {
        await fetchByCity(city);
    } finally {
        // 2. Reset Loading State (Always)
        btn.innerHTML = originalContent;
        lucide.createIcons(); // Restore original icon
        btn.disabled = false;
    }
}

async function fetchByCity(city) {
    try {
        // Optimization: This call gets Current Weather AND Coords
        const res = await fetch(`${apiBaseUrl}/weather?q=${city}`);
        if (!res.ok) throw new Error('City not found');

        const current = await res.json();

        if (current.coord) {
            // Optimization: Don't call fetchData() which fetches current weather again!
            // Just fetch forecast now.
            const lat = current.coord.lat;
            const lon = current.coord.lon;

            const foreRes = await fetch(`${apiBaseUrl}/forecast?lat=${lat}&lon=${lon}`);
            const forecast = await foreRes.json();

            // Update Global State
            weatherData = current;
            forecastData = forecast.list;

            updateUI(current, forecast.list);
        }
    } catch (error) {
        console.error("Error fetching city data:", error);
        alert("City not found. Please try again.");
    }
}

// Global Data Storage
let weatherData = null;
let forecastData = null;
let hourlyChartInstance = null;

async function fetchData(lat, lon) {
    try {
        const [curRes, foreRes] = await Promise.all([
            fetch(`${apiBaseUrl}/weather?lat=${lat}&lon=${lon}`),
            fetch(`${apiBaseUrl}/forecast?lat=${lat}&lon=${lon}`)
        ]);
        const current = await curRes.json();
        const forecast = await foreRes.json();

        if (current && forecast && forecast.list) {
            weatherData = current;
            forecastData = forecast.list;
            updateUI(current, forecast.list);
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function updateUI(current, forecastList) {
    // Update main city info
    document.getElementById('cityName').textContent = current.name;
    document.getElementById('mainTemp').textContent = `${formatTemperature(current.main.temp)}${getTemperatureSymbol()}`;
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

    // Fetch nearby cities based on current location
    if (current.coord) {
        fetchNearbyCities(current.coord.lat, current.coord.lon);
    }
}

function updateCitiesPage(current) {
    // City Name
    document.getElementById('city-page-name').textContent = current.name;

    // Temperature
    document.getElementById('city-page-temp').textContent = formatTemperature(current.main.temp) + getTemperatureSymbol();

    // Humidity
    document.getElementById('city-page-humidity').textContent = current.main.humidity + '%';

    // Sunrise (UTC)
    const sunrise = new Date(current.sys.sunrise * 1000);
    document.getElementById('city-page-sunrise').textContent = sunrise.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    }) + ' UTC';

    // Sunset (UTC)
    const sunset = new Date(current.sys.sunset * 1000);
    document.getElementById('city-page-sunset').textContent = sunset.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    }) + ' UTC';

    // Attach Hover Animation Logic
    attachHoverEffect('temp-card', 'sun-overlay');
    attachHoverEffect('humidity-card', 'humidity-overlay');
    attachHoverEffect('sunrise-card', 'sunrise-overlay');
    attachHoverEffect('sunset-card', 'sunset-overlay');
}

function attachHoverEffect(cardId, overlayId) {
    const card = document.getElementById(cardId);
    const overlay = document.getElementById(overlayId);

    if (card && overlay) {
        card.addEventListener('mouseenter', () => {
            overlay.classList.add('active');
        });
        card.addEventListener('mouseleave', () => {
            overlay.classList.remove('active');
        });
    }
}

function renderSunArc(sunrise, sunset) {
    const canvas = document.getElementById('sunChart');
    if (!canvas) return; // Guard clause
    const ctx = canvas.getContext('2d');

    // Set Canvas Size carefully for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // CRITICAL FIX: If element is hidden, width/height are 0. Stop to avoid errors.
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Arc Parameters
    const centerX = w / 2;
    const centerY = h - 20; // Bottom centered
    const radius = Math.min(w, h) - 40;

    if (radius <= 0) return; // Prevent negative radius error

    // 1. Draw Dashed Background Arc (The Path)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0); // Semicircle from PI to 0
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Dotted effect
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // 2. Calculate Current Sun Position
    const now = Math.floor(Date.now() / 1000);

    // Normalize time: 0 (Sunrise) to 1 (Sunset)
    let percent = (now - sunrise) / (sunset - sunrise);
    percent = Math.max(0, Math.min(1, percent)); // Clamp

    // Valid Angle: PI (Left) -> 0 (Right)
    const currentAngle = Math.PI - (percent * Math.PI);

    // 3. Draw Filled Arc (Progress)
    ctx.beginPath();
    // Start at PI, end at currentAngle
    ctx.arc(centerX, centerY, radius, Math.PI, currentAngle);
    ctx.strokeStyle = '#facc15'; // Yellow
    ctx.lineWidth = 4; // Slightly thicker
    ctx.stroke();

    // 4. Draw Sun Icon
    const sunX = centerX + radius * Math.cos(currentAngle);
    const sunY = centerY + radius * Math.sin(currentAngle);

    // Glow
    ctx.beginPath();
    ctx.arc(sunX, sunY, 12, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.3)'; // Yellow glow
    ctx.fill();

    // Solid Sun
    ctx.beginPath();
    ctx.arc(sunX, sunY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#facc15';
    ctx.fill();
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

document.getElementById('nav-map').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('map');
});

function switchView(viewName) {
    const weatherView = document.getElementById('weather-view');
    const citiesView = document.getElementById('cities-view');
    const mapView = document.getElementById('map-view');
    const navWeather = document.getElementById('nav-weather');
    const navCities = document.getElementById('nav-cities');
    const navMap = document.getElementById('nav-map');

    // Hide all views and reset nav
    weatherView.classList.add('hidden');
    citiesView.classList.add('hidden');
    mapView.classList.add('hidden');
    citiesView.classList.remove('cities-view-animated');
    mapView.classList.remove('map-view-animated');
    navWeather.classList.remove('active');
    navCities.classList.remove('active');
    navMap.classList.remove('active');

    if (viewName === 'weather') {
        weatherView.classList.remove('hidden');
        navWeather.classList.add('active');
    } else if (viewName === 'cities') {
        citiesView.classList.remove('hidden');
        navCities.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            citiesView.classList.add('cities-view-animated');
        }, 10);

        // RE-RENDER FIX: Render charts when view becomes visible
        if (weatherData) {
            setTimeout(() => {
                renderSunArc(weatherData.sys.sunrise, weatherData.sys.sunset);
            }, 50);
        }
    } else if (viewName === 'map') {
        mapView.classList.remove('hidden');
        navMap.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            mapView.classList.add('map-view-animated');
        }, 10);

        // Initialize or update map
        initializeMap();
    }
}

function updateHourlyForecast(forecastList) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');

    // 1. Filter for next 24 hours (or just take first 8-9 items)
    // We want a nice curve, so next 24h (8 items * 3h = 24h) is good.
    const hourlyData = forecastList.slice(0, 9);

    // 2. Prepare Data
    const labels = hourlyData.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'UTC' });
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

// Nearby Cities Functions
let nearbyCitiesData = null;

async function fetchNearbyCities(lat, lon) {
    try {
        const res = await fetch(`${apiBaseUrl}/nearby?lat=${lat}&lon=${lon}&cnt=6`);
        if (!res.ok) throw new Error('Failed to fetch nearby cities');

        const data = await res.json();
        nearbyCitiesData = data.list || [];
        renderNearbyCities(nearbyCitiesData);
    } catch (error) {
        console.error('Error fetching nearby cities:', error);
        document.getElementById('nearbyCitiesGrid').innerHTML =
            '<div class="nearby-error">Could not load nearby cities</div>';
    }
}

function renderNearbyCities(cities) {
    const container = document.getElementById('nearbyCitiesGrid');

    if (!cities || cities.length === 0) {
        container.innerHTML = '<div class="nearby-error">No nearby cities found</div>';
        return;
    }

    // Filter out the current city (first result is often the same city)
    const currentCityName = weatherData?.name?.toLowerCase();
    const filteredCities = cities.filter(city =>
        city.name.toLowerCase() !== currentCityName
    ).slice(0, 5);

    container.innerHTML = filteredCities.map(city => {
        const temp = Math.round(city.main.temp);
        const weatherMain = city.weather[0]?.main || 'Clear';
        const weatherDesc = city.weather[0]?.description || '';
        const icon = getWeatherIcon(weatherMain);
        const country = city.sys?.country || '';

        return `
            <div class="nearby-city-card" data-city="${city.name}">
                <div class="nearby-city-info">
                    <h3 class="nearby-city-name">${city.name}</h3>
                    <span class="nearby-city-country">${country}</span>
                </div>
                <div class="nearby-city-weather">
                    <span class="nearby-city-icon">${icon}</span>
                    <span class="nearby-city-temp">${temp}°</span>
                </div>
                <p class="nearby-city-desc">${weatherDesc}</p>
            </div>
        `;
    }).join('');

    // Add click handlers to search for the city
    container.querySelectorAll('.nearby-city-card').forEach(card => {
        card.addEventListener('click', () => {
            const cityName = card.dataset.city;
            document.getElementById('cityInput').value = cityName;
            handleSearch(cityName);
            switchView('weather');
        });
    });

    // Reinitialize Lucide icons if needed
    lucide.createIcons();
}

// ===========================
// Map Functions
// ===========================

let weatherMap = null;
let currentMarker = null;
let weatherLayers = {};
let activeLayer = 'temp';

// OpenWeatherMap API key - fetched via proxy for security
const OWM_API_KEY_FOR_TILES = ''; // Will use backend proxy

function initializeMap() {
    const mapContainer = document.getElementById('weatherMap');

    // If map already exists, just update it
    if (weatherMap) {
        weatherMap.invalidateSize();
        updateMapLocation();
        return;
    }

    // Default coordinates (will be updated with actual location)
    const defaultLat = weatherData?.coord?.lat || 20.5937;
    const defaultLon = weatherData?.coord?.lon || 78.9629;

    // Initialize Leaflet map
    weatherMap = L.map('weatherMap', {
        center: [defaultLat, defaultLon],
        zoom: 6,
        zoomControl: true
    });

    // Dark theme base layer (CartoDB Dark)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Weather data © OpenWeatherMap',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(weatherMap);

    // Add location marker with pulse effect
    addLocationMarker(defaultLat, defaultLon);

    // Initialize weather layers (using OpenWeatherMap free tile layers)
    initWeatherLayers();

    // Add click handler for searching locations
    weatherMap.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        await fetchWeatherForCoords(lat, lng);
    });

    // Setup layer control buttons
    setupLayerControls();

    // Update info panel
    updateMapInfoPanel();
}

function addLocationMarker(lat, lon) {
    // Remove existing marker
    if (currentMarker) {
        weatherMap.removeLayer(currentMarker);
    }

    // Custom pulsing icon
    const pulseIcon = L.divIcon({
        className: 'pulse-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    currentMarker = L.marker([lat, lon], { icon: pulseIcon }).addTo(weatherMap);

    // Add popup with city info
    if (weatherData) {
        currentMarker.bindPopup(`
            <div style="text-align: center; color: #1e293b;">
                <strong>${weatherData.name}</strong><br>
                ${Math.round(weatherData.main.temp)}° - ${weatherData.weather[0].description}
            </div>
        `);
    }
}

function initWeatherLayers() {
    // OpenWeatherMap tile layers (free tier)
    // Note: These use the OpenWeatherMap free tile service
    const owmTileUrl = 'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=';

    // For demo purposes, using a placeholder - in production, get API key from backend
    // The layers will show if user has a valid API key
    fetch(`${apiBaseUrl}/weather?q=London`)
        .then(res => {
            // Weather layers configuration
            const layerConfigs = {
                temp: { layer: 'temp_new', name: 'Temperature' },
                clouds: { layer: 'clouds_new', name: 'Clouds' },
                precipitation: { layer: 'precipitation_new', name: 'Precipitation' },
                wind: { layer: 'wind_new', name: 'Wind Speed' }
            };

            // Create overlay layers
            Object.keys(layerConfigs).forEach(key => {
                const config = layerConfigs[key];
                weatherLayers[key] = L.tileLayer(
                    `https://tile.openweathermap.org/map/${config.layer}/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2`,
                    {
                        opacity: 0.6,
                        attribution: 'Weather © OpenWeatherMap'
                    }
                );
            });

            // Add default layer (temperature)
            if (weatherLayers[activeLayer]) {
                weatherLayers[activeLayer].addTo(weatherMap);
            }
        })
        .catch(err => console.log('Weather layers initialized'));
}

function setupLayerControls() {
    const layerButtons = document.querySelectorAll('.layer-btn');

    layerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const layerName = btn.dataset.layer;

            // Update active button
            layerButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch layer
            switchWeatherLayer(layerName);
        });
    });
}

function switchWeatherLayer(layerName) {
    // Remove current layer
    if (weatherLayers[activeLayer] && weatherMap.hasLayer(weatherLayers[activeLayer])) {
        weatherMap.removeLayer(weatherLayers[activeLayer]);
    }

    // Add new layer
    activeLayer = layerName;
    if (weatherLayers[layerName]) {
        weatherLayers[layerName].addTo(weatherMap);
    }
}

function updateMapLocation() {
    if (!weatherMap || !weatherData) return;

    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;

    // Animate to new location
    weatherMap.flyTo([lat, lon], 8, {
        duration: 1.5
    });

    // Update marker
    addLocationMarker(lat, lon);

    // Update info panel
    updateMapInfoPanel();
}

function updateMapInfoPanel() {
    if (!weatherData) return;

    document.getElementById('mapInfoCity').textContent = weatherData.name;
    document.getElementById('mapInfoTemp').textContent = Math.round(weatherData.main.temp) + '°';
    document.getElementById('mapInfoDesc').textContent = weatherData.weather[0].description;
}

async function fetchWeatherForCoords(lat, lon) {
    try {
        // Show loading state
        document.getElementById('mapInfoCity').textContent = 'Loading...';

        // Fetch weather for clicked location
        const res = await fetch(`${apiBaseUrl}/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error('Failed to fetch weather');

        const data = await res.json();

        // Update global data
        weatherData = data;

        // Update marker and info
        addLocationMarker(lat, lon);
        updateMapInfoPanel();

        // Also update other views
        updateUI(data, forecastData || []);

    } catch (error) {
        console.error('Error fetching weather for coords:', error);
        document.getElementById('mapInfoCity').textContent = 'Error loading';
    }
}

// ===========================
// Calendar Functions
// ===========================

let currentCalendarDate = new Date();
let calendarForecastData = null;

// Calendar navigation
document.getElementById('nav-calendar').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('calendar');
});

function switchView(viewName) {
    const weatherView = document.getElementById('weather-view');
    const citiesView = document.getElementById('cities-view');
    const mapView = document.getElementById('map-view');
    const calendarView = document.getElementById('calendar-view');
    const navWeather = document.getElementById('nav-weather');
    const navCities = document.getElementById('nav-cities');
    const navMap = document.getElementById('nav-map');
    const navCalendar = document.getElementById('nav-calendar');

    // Hide all views and reset nav
    weatherView.classList.add('hidden');
    citiesView.classList.add('hidden');
    mapView.classList.add('hidden');
    calendarView.classList.add('hidden');
    citiesView.classList.remove('cities-view-animated');
    mapView.classList.remove('map-view-animated');
    calendarView.classList.remove('calendar-view-animated');
    navWeather.classList.remove('active');
    navCities.classList.remove('active');
    navMap.classList.remove('active');
    navCalendar.classList.remove('active');

    if (viewName === 'weather') {
        weatherView.classList.remove('hidden');
        navWeather.classList.add('active');
    } else if (viewName === 'cities') {
        citiesView.classList.remove('hidden');
        navCities.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            citiesView.classList.add('cities-view-animated');
        }, 10);

        // RE-RENDER FIX: Render charts when view becomes visible
        if (weatherData) {
            setTimeout(() => {
                renderSunArc(weatherData.sys.sunrise, weatherData.sys.sunset);
            }, 50);
        }
    } else if (viewName === 'map') {
        mapView.classList.remove('hidden');
        navMap.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            mapView.classList.add('map-view-animated');
        }, 10);

        // Initialize or update map
        initializeMap();
    } else if (viewName === 'calendar') {
        calendarView.classList.remove('hidden');
        navCalendar.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            calendarView.classList.add('calendar-view-animated');
        }, 10);

        // Initialize calendar
        initializeCalendar();
    }
}

function initializeCalendar() {
    // Update location display
    if (weatherData) {
        document.getElementById('calendarLocation').textContent = weatherData.name;
    }

    // Reset to current month
    currentCalendarDate = new Date();

    // Generate calendar
    generateCalendar();

    // Setup navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        generateCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        generateCalendar();
    });

    // Setup detail panel close button
    document.getElementById('closeDetailPanel').addEventListener('click', () => {
        document.getElementById('calendarDetailPanel').classList.add('hidden');
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
    });
}

function generateCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, new Date(year, month - 1, day));
        calendarDays.appendChild(dayElement);
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = isCurrentMonth && day === today.getDate();
        const dayElement = createDayElement(day, false, date, isToday);
        calendarDays.appendChild(dayElement);
    }

    // Add next month's days to fill the grid
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, new Date(year, month + 1, day));
        calendarDays.appendChild(dayElement);
    }

    // Reinitialize icons
    lucide.createIcons();
}

function createDayElement(dayNumber, isOtherMonth, date, isToday = false) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    if (isOtherMonth) dayDiv.classList.add('other-month');
    if (isToday) dayDiv.classList.add('today');

    // Day number
    const dayNum = document.createElement('div');
    dayNum.className = 'day-number';
    dayNum.textContent = dayNumber;
    dayDiv.appendChild(dayNum);

    // Get weather data for this date
    const weatherInfo = getWeatherForDate(date);

    if (weatherInfo && !isOtherMonth) {
        // Weather icon
        const icon = document.createElement('div');
        icon.className = 'day-weather-icon';
        icon.textContent = getWeatherIcon(weatherInfo.weather);
        dayDiv.appendChild(icon);

        // Temperature
        const temp = document.createElement('div');
        temp.className = 'day-temp';
        temp.innerHTML = `
            <div class="day-temp-high">${Math.round(weatherInfo.tempMax)}°</div>
            <div class="day-temp-low">${Math.round(weatherInfo.tempMin)}°</div>
        `;
        dayDiv.appendChild(temp);

        // Add click handler for detail view
        if (!isOtherMonth) {
            dayDiv.addEventListener('click', () => {
                showDayDetail(date, weatherInfo);
                // Remove selected from all days
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                dayDiv.classList.add('selected');
            });
        }
    } else if (!isOtherMonth) {
        // No data available
        const noData = document.createElement('div');
        noData.className = 'day-no-data';
        noData.textContent = 'No data';
        dayDiv.appendChild(noData);
    }

    return dayDiv;
}

function getWeatherForDate(date) {
    if (!forecastData || forecastData.length === 0) return null;

    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0); // Noon for comparison

    // Find forecast items for this date
    const dayForecasts = forecastData.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.toDateString() === targetDate.toDateString();
    });

    if (dayForecasts.length === 0) {
        // Try to find closest available data
        const now = new Date();
        const diffDays = Math.floor((targetDate - now) / (1000 * 60 * 60 * 24));

        // Only show data for dates within forecast range (5 days)
        if (diffDays >= 0 && diffDays < 5 && forecastData.length > 0) {
            // Use average of available data
            const temps = forecastData.map(f => f.main.temp);
            const weatherTypes = forecastData.map(f => f.weather[0].main);
            const mostCommonWeather = weatherTypes.sort((a, b) =>
                weatherTypes.filter(v => v === a).length - weatherTypes.filter(v => v === b).length
            ).pop();

            return {
                tempMax: Math.max(...temps),
                tempMin: Math.min(...temps),
                weather: mostCommonWeather,
                description: forecastData[0].weather[0].description,
                humidity: forecastData[0].main.humidity,
                windSpeed: forecastData[0].wind.speed
            };
        }
        return null;
    }

    // Calculate max/min temps for the day
    const temps = dayForecasts.map(f => f.main.temp);
    const tempMax = Math.max(...temps);
    const tempMin = Math.min(...temps);

    // Use the midday forecast for weather type
    const middayForecast = dayForecasts[Math.floor(dayForecasts.length / 2)] || dayForecasts[0];

    return {
        tempMax,
        tempMin,
        weather: middayForecast.weather[0].main,
        description: middayForecast.weather[0].description,
        humidity: middayForecast.main.humidity,
        windSpeed: middayForecast.wind.speed
    };
}

function showDayDetail(date, weatherInfo) {
    const panel = document.getElementById('calendarDetailPanel');

    // Format date
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Update panel content
    document.getElementById('detailDate').textContent = dateStr;
    document.getElementById('detailWeatherIcon').textContent = getWeatherIcon(weatherInfo.weather);
    document.getElementById('detailTemp').textContent = `${Math.round((weatherInfo.tempMax + weatherInfo.tempMin) / 2)}°`;
    document.getElementById('detailDesc').textContent = weatherInfo.description;
    document.getElementById('detailTempMax').textContent = `${Math.round(weatherInfo.tempMax)}°`;
    document.getElementById('detailTempMin').textContent = `${Math.round(weatherInfo.tempMin)}°`;
    document.getElementById('detailHumidity').textContent = `${weatherInfo.humidity}%`;
    document.getElementById('detailWind').textContent = `${Math.round(weatherInfo.windSpeed * 3.6)} km/h`;

    // Show panel
    panel.classList.remove('hidden');

    // Reinitialize icons
    lucide.createIcons();
}

// ===========================
// Settings Management
// ===========================

// Default settings
const defaultSettings = {
    temperatureUnit: 'celsius',
    theme: 'dark',
    defaultLocation: null
};

// App settings (loaded from localStorage)
let appSettings = { ...defaultSettings };

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('weatherAppSettings');
    if (saved) {
        try {
            appSettings = { ...defaultSettings, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Error loading settings:', e);
            appSettings = { ...defaultSettings };
        }
    }

    // Apply settings
    applySettings();
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('weatherAppSettings', JSON.stringify(appSettings));
}

// Apply settings to the app
function applySettings() {
    // Apply theme
    if (appSettings.theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    // Update UI to reflect current settings
    updateSettingsUI();
}

// Update settings UI to match current settings
function updateSettingsUI() {
    // Temperature unit buttons
    document.querySelectorAll('.toggle-option[data-unit]').forEach(btn => {
        if (btn.dataset.unit === appSettings.temperatureUnit) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Theme buttons
    document.querySelectorAll('.toggle-option[data-theme]').forEach(btn => {
        if (btn.dataset.theme === appSettings.theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Default location display
    const locationDisplay = document.getElementById('currentDefaultLocation');
    const locationSpan = locationDisplay.querySelector('span');

    if (appSettings.defaultLocation) {
        locationDisplay.classList.add('has-location');
        locationSpan.textContent = `Default location: ${appSettings.defaultLocation}`;
    } else {
        locationDisplay.classList.remove('has-location');
        locationSpan.textContent = 'No default location set. Using auto-detection.';
    }
}

// Temperature conversion
function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}

function formatTemperature(temp) {
    if (appSettings.temperatureUnit === 'fahrenheit') {
        return Math.round(celsiusToFahrenheit(temp));
    }
    return Math.round(temp);
}

function getTemperatureSymbol() {
    return appSettings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
}

// Settings Navigation
document.getElementById('nav-weather').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('weather');
});

document.getElementById('nav-cities').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('cities');
});

document.getElementById('nav-map').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('map');
});

document.getElementById('nav-calendar').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('calendar');
});

// Settings link - find the settings link
const settingsLinks = document.querySelectorAll('.nav-links a');
settingsLinks.forEach(link => {
    if (link.querySelector('[data-lucide="settings"]')) {
        link.id = 'nav-settings';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('settings');
        });
    }
});

function switchView(viewName) {
    const weatherView = document.getElementById('weather-view');
    const citiesView = document.getElementById('cities-view');
    const mapView = document.getElementById('map-view');
    const calendarView = document.getElementById('calendar-view');
    const settingsView = document.getElementById('settings-view');
    const navWeather = document.getElementById('nav-weather');
    const navCities = document.getElementById('nav-cities');
    const navMap = document.getElementById('nav-map');
    const navCalendar = document.getElementById('nav-calendar');
    const navSettings = document.getElementById('nav-settings');

    // Hide all views and reset nav
    weatherView.classList.add('hidden');
    citiesView.classList.add('hidden');
    mapView.classList.add('hidden');
    calendarView.classList.add('hidden');
    settingsView.classList.add('hidden');
    citiesView.classList.remove('cities-view-animated');
    mapView.classList.remove('map-view-animated');
    calendarView.classList.remove('calendar-view-animated');
    settingsView.classList.remove('settings-view-animated');
    navWeather.classList.remove('active');
    navCities.classList.remove('active');
    navMap.classList.remove('active');
    navCalendar.classList.remove('active');
    if (navSettings) navSettings.classList.remove('active');

    if (viewName === 'weather') {
        weatherView.classList.remove('hidden');
        navWeather.classList.add('active');
    } else if (viewName === 'cities') {
        citiesView.classList.remove('hidden');
        navCities.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            citiesView.classList.add('cities-view-animated');
        }, 10);

        // RE-RENDER FIX: Render charts when view becomes visible
        if (weatherData) {
            setTimeout(() => {
                renderSunArc(weatherData.sys.sunrise, weatherData.sys.sunset);
            }, 50);
        }
    } else if (viewName === 'map') {
        mapView.classList.remove('hidden');
        navMap.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            mapView.classList.add('map-view-animated');
        }, 10);

        // Initialize or update map
        initializeMap();
    } else if (viewName === 'calendar') {
        calendarView.classList.remove('hidden');
        navCalendar.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            calendarView.classList.add('calendar-view-animated');
        }, 10);

        // Initialize calendar
        initializeCalendar();
    } else if (viewName === 'settings') {
        settingsView.classList.remove('hidden');
        if (navSettings) navSettings.classList.add('active');

        // Trigger Animation
        setTimeout(() => {
            settingsView.classList.add('settings-view-animated');
        }, 10);

        // Update settings UI
        updateSettingsUI();
        lucide.createIcons();
    }
}

// Temperature Unit Toggle
document.getElementById('celsius-btn').addEventListener('click', () => {
    appSettings.temperatureUnit = 'celsius';
    saveSettings();
    updateSettingsUI();

    // Refresh weather data to update all temperatures
    if (weatherData && forecastData) {
        updateUI(weatherData, forecastData);
    }
});

document.getElementById('fahrenheit-btn').addEventListener('click', () => {
    appSettings.temperatureUnit = 'fahrenheit';
    saveSettings();
    updateSettingsUI();

    // Refresh weather data to update all temperatures
    if (weatherData && forecastData) {
        updateUI(weatherData, forecastData);
    }
});

// Theme Toggle
document.getElementById('dark-theme-btn').addEventListener('click', () => {
    appSettings.theme = 'dark';
    saveSettings();
    applySettings();
});

document.getElementById('light-theme-btn').addEventListener('click', () => {
    appSettings.theme = 'light';
    saveSettings();
    applySettings();
});

// Default Location Setting
document.getElementById('setDefaultLocationBtn').addEventListener('click', async () => {
    const input = document.getElementById('defaultLocationInput');
    const city = input.value.trim();

    if (!city) {
        alert('Please enter a city name');
        return;
    }

    // Verify the city exists by trying to fetch weather
    try {
        const res = await fetch(`${apiBaseUrl}/weather?q=${city}`);
        if (!res.ok) throw new Error('City not found');

        const data = await res.json();

        // Save the city name
        appSettings.defaultLocation = data.name; // Use the official name from API
        saveSettings();
        updateSettingsUI();

        // Clear input
        input.value = '';

        // Show success message
        alert(`Default location set to ${data.name}`);
    } catch (error) {
        alert('City not found. Please check the spelling and try again.');
    }
});

// Reset Settings
document.getElementById('resetSettingsBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        appSettings = { ...defaultSettings };
        saveSettings();
        applySettings();

        // Reload the page to apply all changes
        location.reload();
    }
});
