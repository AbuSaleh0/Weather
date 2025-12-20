# Weather App 🌤️

A clean, responsive weather application using OpenWeatherMap API.

## Features
- Current weather and 3-day forecast
- Location search with autocomplete
- Geolocation support
- Temperature unit toggle (°C/°F)
- 24-hour temperature chart
- Dark/Light theme

## Quick Start

### Local Development
1. Copy config file:
   ```bash
   cp config.example.js config.js
   ```

2. Add your OpenWeatherMap API key in `config.js`:
   ```javascript
   window.WEATHER_CONFIG = {
       API_KEY: 'your_api_key_here'
   };
   ```

3. Run local server:
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```

4. Open http://localhost:8000

### Netlify Deployment
1. Push to GitHub
2. In Netlify: Site Settings → Environment Variables
3. Add: `WEATHER_API_KEY` = `your_openweathermap_api_key`
4. Deploy

## Get API Key
Free API key: https://openweathermap.org/api

## Tech Stack
- Vanilla JavaScript
- OpenWeatherMap API
- CSS3 with custom properties
- Canvas API for charts

## License
MIT
