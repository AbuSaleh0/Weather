// Weather App JavaScript
// Demo API Key - Replace with environment variable in production
const API_KEY = 'c0e620eb2ab14ae7b6f171846251509';
const BASE_URL = 'https://api.weatherapi.com/v1';

class WeatherApp {
    constructor() {
        this.isCelsius = true;
        this.currentWeatherData = null;
        this.searchTimeout = null;
        this.selectedSuggestionIndex = -1;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.loadCachedWeather();
        this.checkUrlParams();
    }

    initializeElements() {
        // Main elements
        this.app = document.getElementById('app');
        this.searchInput = document.getElementById('searchInput');
        this.locationBtn = document.getElementById('locationBtn');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.weatherContent = document.getElementById('weatherContent');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Controls
        this.tempToggle = document.getElementById('tempToggle');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.toggleChart = document.getElementById('toggleChart');
        
        // Weather display elements
        this.locationName = document.getElementById('locationName');
        this.currentTime = document.getElementById('currentTime');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temperature = document.getElementById('temperature');
        this.condition = document.getElementById('condition');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.wind = document.getElementById('wind');
        this.pressure = document.getElementById('pressure');
        this.visibility = document.getElementById('visibility');
        this.uvIndex = document.getElementById('uvIndex');
        this.sunrise = document.getElementById('sunrise');
        this.sunset = document.getElementById('sunset');
        this.forecastContainer = document.getElementById('forecastContainer');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.hourlyChart = document.getElementById('hourlyChart');
        this.chartContainer = document.getElementById('chartContainer');
        
        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.themeSelect = document.getElementById('themeSelect');
        this.chartToggle = document.getElementById('chartToggle');
    }

    bindEvents() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        
        // Controls
        this.tempToggle.addEventListener('click', () => this.toggleTemperatureUnit());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.shareBtn.addEventListener('click', () => this.shareWeather());
        this.toggleChart.addEventListener('click', () => this.toggleHourlyChart());
        this.retryBtn.addEventListener('click', () => this.retryLastSearch());
        
        // Modal
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettingsModal());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });
        
        // Settings
        this.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        this.chartToggle.addEventListener('change', (e) => this.toggleChartVisibility(e.target.checked));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSuggestions();
                this.closeSettingsModal();
            }
        });
    }

    // Search functionality
    handleSearchInput(e) {
        const query = e.target.value.trim();
        
        clearTimeout(this.searchTimeout);
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        this.searchTimeout = setTimeout(() => {
            this.searchCities(query);
        }, 300);
    }

    handleSearchKeydown(e) {
        const suggestions = this.searchSuggestions.querySelectorAll('.suggestion-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, suggestions.length - 1);
                this.updateSuggestionSelection(suggestions);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                this.updateSuggestionSelection(suggestions);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedSuggestionIndex >= 0 && suggestions[this.selectedSuggestionIndex]) {
                    const city = suggestions[this.selectedSuggestionIndex].textContent;
                    this.selectCity(city);
                } else if (e.target.value.trim()) {
                    this.selectCity(e.target.value.trim());
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    updateSuggestionSelection(suggestions) {
        suggestions.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSuggestionIndex);
        });
    }

    async searchCities(query) {
        try {
            const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            
            const cities = await response.json();
            this.displaySuggestions(cities.slice(0, 5));
        } catch (error) {
            console.error('City search error:', error);
        }
    }

    displaySuggestions(cities) {
        if (cities.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        this.searchSuggestions.innerHTML = cities.map(city => 
            `<div class="suggestion-item" role="option">${city.name}, ${city.country}</div>`
        ).join('');
        
        this.searchSuggestions.classList.add('show');
        this.selectedSuggestionIndex = -1;
        
        // Add click handlers
        this.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => this.selectCity(item.textContent));
        });
    }

    hideSuggestions() {
        this.searchSuggestions.classList.remove('show');
        this.selectedSuggestionIndex = -1;
    }

    selectCity(city) {
        this.searchInput.value = city;
        this.hideSuggestions();
        this.getWeatherData(city);
    }

    // Geolocation
    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }
        
        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.getWeatherData(`${latitude},${longitude}`);
            },
            (error) => {
                let message = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out.';
                        break;
                }
                this.showError(message);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }

    // Weather API calls
    async getWeatherData(location) {
        this.showLoading();
        this.lastSearchLocation = location;
        
        try {
            const response = await fetch(
                `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`
            );
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            this.currentWeatherData = data;
            this.displayWeatherData(data);
            this.cacheWeatherData(data);
            this.hideLoading();
            
        } catch (error) {
            console.error('Weather API error:', error);
            let message = 'Failed to fetch weather data';
            
            if (error.message.includes('No matching location')) {
                message = 'City not found. Please check the spelling and try again.';
            } else if (error.message.includes('API key')) {
                message = 'API key error. Please check your configuration.';
            } else if (error.message.includes('rate limit')) {
                message = 'Too many requests. Please try again later.';
            } else if (!navigator.onLine) {
                message = 'No internet connection. Showing cached data if available.';
                this.loadCachedWeather();
                return;
            }
            
            this.showError(message);
        }
    }

    // Display weather data
    displayWeatherData(data) {
        const { location, current, forecast } = data;
        
        // Update location and time
        this.locationName.textContent = `${location.name}, ${location.country}`;
        this.currentTime.textContent = new Date(location.localtime).toLocaleString();
        
        // Update current weather
        this.weatherIcon.src = `https:${current.condition.icon}`;
        this.weatherIcon.alt = current.condition.text;
        this.condition.textContent = current.condition.text;
        
        // Update weather details
        this.humidity.textContent = `${current.humidity}%`;
        this.wind.textContent = `${current.wind_kph} km/h ${current.wind_dir}`;
        this.pressure.textContent = `${current.pressure_mb} mb`;
        this.visibility.textContent = `${current.vis_km} km`;
        this.uvIndex.textContent = current.uv;
        
        // Update sun times
        const today = forecast.forecastday[0];
        this.sunrise.textContent = today.astro.sunrise;
        this.sunset.textContent = today.astro.sunset;
        
        // Update temperatures
        this.updateTemperatureDisplay();
        
        // Update forecast
        this.displayForecast(forecast.forecastday);
        
        // Update hourly chart
        this.drawHourlyChart(forecast.forecastday[0].hour);
        
        // Update theme based on weather
        this.updateWeatherTheme(current, today.astro);
        
        // Update last updated time
        this.lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        
        // Show weather content
        this.showWeatherContent();
    }

    updateTemperatureDisplay() {
        if (!this.currentWeatherData) return;
        
        const { current } = this.currentWeatherData;
        
        if (this.isCelsius) {
            this.temperature.textContent = `${Math.round(current.temp_c)}°`;
            this.feelsLike.textContent = `${Math.round(current.feelslike_c)}°`;
        } else {
            this.temperature.textContent = `${Math.round(current.temp_f)}°`;
            this.feelsLike.textContent = `${Math.round(current.feelslike_f)}°`;
        }
    }

    displayForecast(forecastDays) {
        this.forecastContainer.innerHTML = forecastDays.map(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const highTemp = this.isCelsius ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f);
            const lowTemp = this.isCelsius ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f);
            
            return `
                <div class="forecast-item">
                    <div class="forecast-date">${dayName}<br><small>${monthDay}</small></div>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="forecast-icon">
                    <div class="forecast-temps">
                        <span class="high">${highTemp}°</span>
                        <span class="low">${lowTemp}°</span>
                    </div>
                    <div class="forecast-condition">${day.day.condition.text}</div>
                </div>
            `;
        }).join('');
    }

    drawHourlyChart(hourlyData) {
        const canvas = this.hourlyChart;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Get next 24 hours starting from current hour
        const currentHour = new Date().getHours();
        const next24Hours = hourlyData.slice(currentHour, currentHour + 24);
        
        if (next24Hours.length === 0) return;
        
        // Calculate dimensions
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Get temperature range
        const temps = next24Hours.map(hour => this.isCelsius ? hour.temp_c : hour.temp_f);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const tempRange = maxTemp - minTemp || 1;
        
        // Draw grid lines
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i * chartHeight / 4);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw temperature line
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        next24Hours.forEach((hour, index) => {
            const x = padding + (index * chartWidth / (next24Hours.length - 1));
            const temp = this.isCelsius ? hour.temp_c : hour.temp_f;
            const y = padding + chartHeight - ((temp - minTemp) / tempRange * chartHeight);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points and labels
        ctx.fillStyle = '#2563eb';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        
        next24Hours.forEach((hour, index) => {
            if (index % 3 === 0) { // Show every 3rd hour to avoid crowding
                const x = padding + (index * chartWidth / (next24Hours.length - 1));
                const temp = this.isCelsius ? hour.temp_c : hour.temp_f;
                const y = padding + chartHeight - ((temp - minTemp) / tempRange * chartHeight);
                
                // Draw point
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw temperature label
                ctx.fillStyle = '#1e293b';
                ctx.fillText(`${Math.round(temp)}°`, x, y - 10);
                
                // Draw time label
                const time = new Date(hour.time).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    hour12: true 
                });
                ctx.fillText(time, x, height - 10);
                
                ctx.fillStyle = '#2563eb';
            }
        });
    }

    updateWeatherTheme(current, astro) {
        // Remove existing weather classes
        this.app.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'night');
        
        const currentTime = new Date();
        const sunrise = new Date(`${currentTime.toDateString()} ${astro.sunrise}`);
        const sunset = new Date(`${currentTime.toDateString()} ${astro.sunset}`);
        const isNight = currentTime < sunrise || currentTime > sunset;
        
        if (isNight) {
            this.app.classList.add('night');
        } else {
            const condition = current.condition.text.toLowerCase();
            
            if (condition.includes('sunny') || condition.includes('clear')) {
                this.app.classList.add('sunny');
            } else if (condition.includes('rain') || condition.includes('drizzle')) {
                this.app.classList.add('rainy');
            } else if (condition.includes('snow') || condition.includes('blizzard')) {
                this.app.classList.add('snowy');
            } else {
                this.app.classList.add('cloudy');
            }
        }
    }

    // Temperature unit toggle
    toggleTemperatureUnit() {
        this.isCelsius = !this.isCelsius;
        this.tempToggle.textContent = this.isCelsius ? '°C' : '°F';
        this.tempToggle.setAttribute('aria-label', `Switch to ${this.isCelsius ? 'Fahrenheit' : 'Celsius'}`);
        
        localStorage.setItem('temperatureUnit', this.isCelsius ? 'celsius' : 'fahrenheit');
        
        if (this.currentWeatherData) {
            this.updateTemperatureDisplay();
            this.displayForecast(this.currentWeatherData.forecast.forecastday);
            this.drawHourlyChart(this.currentWeatherData.forecast.forecastday[0].hour);
        }
    }

    // Settings
    openSettings() {
        this.settingsModal.classList.add('show');
        this.settingsModal.setAttribute('aria-hidden', 'false');
        this.closeSettingsBtn.focus();
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
        this.settingsModal.setAttribute('aria-hidden', 'true');
        this.settingsBtn.focus();
    }

    changeTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleChartVisibility(show) {
        this.chartContainer.style.display = show ? 'block' : 'none';
        localStorage.setItem('showChart', show);
    }

    toggleHourlyChart() {
        const isExpanded = this.toggleChart.getAttribute('aria-expanded') === 'true';
        this.toggleChart.setAttribute('aria-expanded', !isExpanded);
        this.chartContainer.style.display = isExpanded ? 'none' : 'block';
    }

    // Share functionality
    async shareWeather() {
        if (!this.currentWeatherData) return;
        
        const location = this.currentWeatherData.location;
        const shareUrl = `${window.location.origin}${window.location.pathname}?city=${encodeURIComponent(location.name)}`;
        const shareText = `Current weather in ${location.name}: ${this.currentWeatherData.current.condition.text}, ${Math.round(this.isCelsius ? this.currentWeatherData.current.temp_c : this.currentWeatherData.current.temp_f)}°${this.isCelsius ? 'C' : 'F'}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Weather App',
                    text: shareText,
                    url: shareUrl
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                this.showToast('Link copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1001;
            animation: slideUp 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // State management
    showLoading() {
        this.loading.classList.add('show');
        this.loading.setAttribute('aria-hidden', 'false');
        this.error.classList.remove('show');
        this.weatherContent.classList.remove('show');
    }

    hideLoading() {
        this.loading.classList.remove('show');
        this.loading.setAttribute('aria-hidden', 'true');
    }

    showError(message) {
        this.hideLoading();
        this.error.classList.add('show');
        this.error.setAttribute('aria-hidden', 'false');
        document.getElementById('errorMessage').textContent = message;
        this.weatherContent.classList.remove('show');
    }

    showWeatherContent() {
        this.hideLoading();
        this.error.classList.remove('show');
        this.weatherContent.classList.add('show');
        this.weatherContent.setAttribute('aria-hidden', 'false');
    }

    retryLastSearch() {
        if (this.lastSearchLocation) {
            this.getWeatherData(this.lastSearchLocation);
        }
    }

    // Local storage and caching
    loadSettings() {
        // Load temperature unit
        const savedUnit = localStorage.getItem('temperatureUnit');
        if (savedUnit === 'fahrenheit') {
            this.isCelsius = false;
            this.tempToggle.textContent = '°F';
        }
        
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'auto';
        this.themeSelect.value = savedTheme;
        this.changeTheme(savedTheme);
        
        // Load chart visibility
        const showChart = localStorage.getItem('showChart') !== 'false';
        this.chartToggle.checked = showChart;
        this.toggleChartVisibility(showChart);
    }

    cacheWeatherData(data) {
        const cacheData = {
            data,
            timestamp: Date.now(),
            location: this.lastSearchLocation
        };
        localStorage.setItem('cachedWeather', JSON.stringify(cacheData));
    }

    loadCachedWeather() {
        try {
            const cached = localStorage.getItem('cachedWeather');
            if (cached) {
                const { data, timestamp, location } = JSON.parse(cached);
                const age = Date.now() - timestamp;
                
                // Show cached data if less than 1 hour old
                if (age < 3600000) {
                    this.currentWeatherData = data;
                    this.lastSearchLocation = location;
                    this.displayWeatherData(data);
                    this.lastUpdated.textContent = `Last updated: ${new Date(timestamp).toLocaleTimeString()} (cached)`;
                }
            }
        } catch (error) {
            console.error('Failed to load cached weather:', error);
        }
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const city = urlParams.get('city');
        if (city) {
            this.searchInput.value = city;
            this.getWeatherData(city);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);