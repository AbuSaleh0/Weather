# Weather Web App

A complete, accessible, responsive weather application built with vanilla HTML, CSS, and JavaScript. Get current weather conditions and 3-day forecasts for any city worldwide.

## 🌟 Features

### Core Functionality
- **City Search**: Instant search with debounced suggestions (300ms)
- **Geolocation**: "Use my location" button for automatic location detection
- **Current Weather**: Temperature, condition, feels-like, humidity, wind, pressure, visibility, UV index
- **3-Day Forecast**: Daily high/low temperatures with weather conditions
- **24-Hour Chart**: Interactive temperature chart using HTML5 Canvas
- **Weather Themes**: Dynamic background themes based on weather conditions
- **Offline Support**: Cached weather data for offline viewing

### User Experience
- **Temperature Toggle**: Switch between Celsius and Fahrenheit
- **Share Weather**: Generate shareable links with city parameters
- **Settings Panel**: Theme selection (auto/light/dark) and chart visibility
- **Responsive Design**: Mobile-first approach, works on all devices
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### Technical Features
- **Zero Dependencies**: Pure vanilla JavaScript, no frameworks
- **Performance Optimized**: Lazy loading, debounced search, efficient rendering
- **Error Handling**: Comprehensive error messages for all failure scenarios
- **Local Storage**: Persistent settings and weather data caching
- **Modern CSS**: CSS Grid, Flexbox, custom properties, animations

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in a web browser
3. **Search for a city** or use your current location
4. **Enjoy the weather!**

## 🔧 Installation & Setup

### For Development
```bash
# Clone the repository
git clone <repository-url>
cd weather-app

# Open in browser (no build process required)
open index.html
```

### For Production Deployment

#### Option 1: Netlify
1. Drag and drop the project folder to [Netlify](https://netlify.com)
2. Set environment variable `WEATHER_API_KEY` in Netlify dashboard
3. Update `script.js` to use environment variable (see Security section)

#### Option 2: GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. **Important**: Move API key to backend before public deployment

#### Option 3: AWS S3 + CloudFront
```bash
# Upload files to S3 bucket
aws s3 sync . s3://your-bucket-name --exclude "*.md" --exclude ".git/*"

# Configure CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## 🔐 Security Configuration

### ⚠️ Important: API Key Security

The demo uses a hardcoded API key for testing purposes. **Never deploy to production with a hardcoded API key.**

### Production Setup Options

#### Option 1: Environment Variables (Recommended)
```javascript
// Replace in script.js
const API_KEY = process.env.WEATHER_API_KEY || 'your-fallback-key';
```

#### Option 2: Backend Proxy (Most Secure)
Create a backend endpoint that proxies weather API requests:

```javascript
// Replace API calls in script.js
async function getWeatherData(location) {
    const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
    return response.json();
}
```

Example backend endpoint (Node.js/Express):
```javascript
app.get('/api/weather', async (req, res) => {
    const { location } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=no&alerts=no`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Weather data unavailable' });
    }
});
```

#### Option 3: Serverless Functions
Deploy serverless functions (Netlify Functions, Vercel API Routes, AWS Lambda) to handle API requests securely.

### Get Your API Key
1. Sign up at [WeatherAPI.com](https://www.weatherapi.com/)
2. Get your free API key (1 million calls/month)
3. Replace the demo key in your production deployment

## 🧪 Testing

### Run Unit Tests
Open `test.html` in browser or run tests in console:
```javascript
// In browser console
// Tests will run automatically when page loads
```

### Test Coverage
- ✅ Weather data parsing
- ✅ Temperature unit conversion
- ✅ API URL construction
- ✅ Error message handling
- ✅ Local storage operations
- ✅ Date formatting
- ✅ Weather theme determination

### Manual Testing Checklist
- [ ] Search functionality with suggestions
- [ ] Geolocation permission handling
- [ ] Temperature unit toggle
- [ ] Theme switching (light/dark/auto)
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Offline functionality
- [ ] Share button functionality
- [ ] Error handling for invalid cities

## 📊 Performance Targets

### Lighthouse Scores (Target)
- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Optimization Features
- Preconnect to weather API domain
- Efficient CSS with custom properties
- Debounced search to reduce API calls
- Canvas-based charts (no external libraries)
- Compressed images and optimized assets
- Minimal JavaScript bundle size

## 🎨 Customization

### Weather Themes
Modify CSS custom properties in `styles.css`:
```css
:root {
    --sunny-bg: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    --cloudy-bg: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
    --rainy-bg: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    --snowy-bg: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    --night-bg: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}
```

### Color Scheme
Update the color variables:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}
```

### Add New Features
The modular JavaScript structure makes it easy to extend:
```javascript
class WeatherApp {
    // Add new methods here
    addNewFeature() {
        // Implementation
    }
}
```

## 🌐 Browser Support

- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

### Required Features
- ES6+ JavaScript
- CSS Grid & Flexbox
- HTML5 Canvas
- Geolocation API
- Local Storage
- Fetch API

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences
- Focus management
- Color contrast compliance (WCAG AA)

## 🐛 Troubleshooting

### Common Issues

**API Key Error**
```
Error: API key error. Please check your configuration.
```
- Verify your API key is valid
- Check API key permissions
- Ensure proper environment variable setup

**Geolocation Denied**
```
Error: Location access denied. Please enable location services.
```
- Enable location services in browser
- Check HTTPS requirement for geolocation
- Provide fallback search functionality

**Network Errors**
```
Error: Failed to fetch weather data
```
- Check internet connection
- Verify API endpoint availability
- Review CORS configuration

**City Not Found**
```
Error: City not found. Please check the spelling and try again.
```
- Verify city name spelling
- Try alternative city names
- Use country codes for disambiguation

### Debug Mode
Enable debug logging:
```javascript
// Add to script.js
const DEBUG = true;
if (DEBUG) console.log('Debug info:', data);
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify API key configuration
4. Test with different cities/locations

## 🔄 Updates & Roadmap

### Completed Features
- ✅ Core weather functionality
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Offline support
- ✅ Unit tests

### Future Enhancements
- 🔄 Weather alerts and warnings
- 🔄 Extended 7-day forecast
- 🔄 Weather maps integration
- 🔄 Historical weather data
- 🔄 Multiple location favorites
- 🔄 Push notifications
- 🔄 PWA capabilities

---

**Built with ❤️ using vanilla web technologies**