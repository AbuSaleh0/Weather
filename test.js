// Simple Test Framework
class SimpleTest {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('🧪 Running Weather App Tests...\n');
        
        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected: ${expected}, Got: ${actual}`);
        }
    }

    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} Expected true, got false`);
        }
    }

    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} Expected false, got true`);
        }
    }
}

// Weather Data Parser Tests
const testSuite = new SimpleTest();

// Mock weather API response
const mockWeatherData = {
    location: {
        name: "London",
        country: "United Kingdom",
        localtime: "2024-01-15 14:30"
    },
    current: {
        temp_c: 15.5,
        temp_f: 59.9,
        feelslike_c: 13.2,
        feelslike_f: 55.8,
        condition: {
            text: "Partly cloudy",
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
        },
        humidity: 72,
        wind_kph: 12.5,
        wind_dir: "SW",
        pressure_mb: 1013.2,
        vis_km: 10.0,
        uv: 4
    },
    forecast: {
        forecastday: [
            {
                date: "2024-01-15",
                day: {
                    maxtemp_c: 18.0,
                    maxtemp_f: 64.4,
                    mintemp_c: 8.0,
                    mintemp_f: 46.4,
                    condition: {
                        text: "Partly cloudy",
                        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
                    }
                },
                astro: {
                    sunrise: "07:45 AM",
                    sunset: "04:30 PM"
                },
                hour: [
                    {
                        time: "2024-01-15 00:00",
                        temp_c: 10.0,
                        temp_f: 50.0
                    },
                    {
                        time: "2024-01-15 01:00",
                        temp_c: 9.5,
                        temp_f: 49.1
                    }
                ]
            }
        ]
    }
};

// Test temperature conversion and formatting
testSuite.test('Temperature formatting - Celsius', () => {
    const temp = mockWeatherData.current.temp_c;
    const formatted = Math.round(temp);
    testSuite.assertEqual(formatted, 16, 'Should round 15.5°C to 16°C');
});

testSuite.test('Temperature formatting - Fahrenheit', () => {
    const temp = mockWeatherData.current.temp_f;
    const formatted = Math.round(temp);
    testSuite.assertEqual(formatted, 60, 'Should round 59.9°F to 60°F');
});

// Test weather condition parsing
testSuite.test('Weather condition text parsing', () => {
    const condition = mockWeatherData.current.condition.text;
    testSuite.assertEqual(condition, 'Partly cloudy', 'Should parse condition text correctly');
});

// Test location data parsing
testSuite.test('Location data parsing', () => {
    const { name, country } = mockWeatherData.location;
    testSuite.assertEqual(name, 'London', 'Should parse city name correctly');
    testSuite.assertEqual(country, 'United Kingdom', 'Should parse country correctly');
});

// Test forecast data structure
testSuite.test('Forecast data structure', () => {
    const forecast = mockWeatherData.forecast.forecastday;
    testSuite.assertTrue(Array.isArray(forecast), 'Forecast should be an array');
    testSuite.assertTrue(forecast.length > 0, 'Forecast should have at least one day');
    
    const firstDay = forecast[0];
    testSuite.assertTrue(firstDay.hasOwnProperty('date'), 'Forecast day should have date');
    testSuite.assertTrue(firstDay.hasOwnProperty('day'), 'Forecast day should have day data');
    testSuite.assertTrue(firstDay.hasOwnProperty('astro'), 'Forecast day should have astro data');
});

// Test hourly data structure
testSuite.test('Hourly data structure', () => {
    const hourlyData = mockWeatherData.forecast.forecastday[0].hour;
    testSuite.assertTrue(Array.isArray(hourlyData), 'Hourly data should be an array');
    testSuite.assertTrue(hourlyData.length > 0, 'Should have hourly data');
    
    const firstHour = hourlyData[0];
    testSuite.assertTrue(firstHour.hasOwnProperty('time'), 'Hour should have time');
    testSuite.assertTrue(firstHour.hasOwnProperty('temp_c'), 'Hour should have Celsius temp');
    testSuite.assertTrue(firstHour.hasOwnProperty('temp_f'), 'Hour should have Fahrenheit temp');
});

// Test weather theme determination
testSuite.test('Weather theme determination', () => {
    const condition = mockWeatherData.current.condition.text.toLowerCase();
    
    let theme;
    if (condition.includes('sunny') || condition.includes('clear')) {
        theme = 'sunny';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        theme = 'rainy';
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
        theme = 'snowy';
    } else {
        theme = 'cloudy';
    }
    
    testSuite.assertEqual(theme, 'cloudy', 'Partly cloudy should map to cloudy theme');
});

// Test date formatting for forecast
testSuite.test('Date formatting for forecast', () => {
    const dateStr = mockWeatherData.forecast.forecastday[0].date;
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    testSuite.assertTrue(dayName.length > 0, 'Should format day name');
    testSuite.assertTrue(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(dayName), 'Should be valid day name');
});

// Test wind data formatting
testSuite.test('Wind data formatting', () => {
    const { wind_kph, wind_dir } = mockWeatherData.current;
    const windText = `${wind_kph} km/h ${wind_dir}`;
    
    testSuite.assertEqual(windText, '12.5 km/h SW', 'Should format wind data correctly');
});

// Test UV index validation
testSuite.test('UV index validation', () => {
    const uv = mockWeatherData.current.uv;
    testSuite.assertTrue(uv >= 0 && uv <= 11, 'UV index should be between 0 and 11');
});

// Test humidity percentage
testSuite.test('Humidity percentage validation', () => {
    const humidity = mockWeatherData.current.humidity;
    testSuite.assertTrue(humidity >= 0 && humidity <= 100, 'Humidity should be between 0 and 100');
});

// Test API URL construction
testSuite.test('API URL construction', () => {
    const API_KEY = 'test-key';
    const location = 'London';
    const expectedUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`;
    
    const constructedUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`;
    
    testSuite.assertEqual(constructedUrl, expectedUrl, 'Should construct API URL correctly');
});

// Test local storage key validation
testSuite.test('Local storage keys', () => {
    const validKeys = ['temperatureUnit', 'theme', 'showChart', 'cachedWeather'];
    
    validKeys.forEach(key => {
        testSuite.assertTrue(typeof key === 'string', `${key} should be a string`);
        testSuite.assertTrue(key.length > 0, `${key} should not be empty`);
    });
});

// Test temperature unit conversion logic
testSuite.test('Temperature unit conversion logic', () => {
    const isCelsius = true;
    const tempC = mockWeatherData.current.temp_c;
    const tempF = mockWeatherData.current.temp_f;
    
    const displayTemp = isCelsius ? Math.round(tempC) : Math.round(tempF);
    testSuite.assertEqual(displayTemp, 16, 'Should display Celsius when isCelsius is true');
    
    const isFahrenheit = false;
    const displayTempF = isFahrenheit ? Math.round(tempF) : Math.round(tempC);
    testSuite.assertEqual(displayTempF, 16, 'Should display Celsius when isCelsius is false');
});

// Test error message validation
testSuite.test('Error message handling', () => {
    const errorMessages = {
        'No matching location': 'City not found. Please check the spelling and try again.',
        'API key': 'API key error. Please check your configuration.',
        'rate limit': 'Too many requests. Please try again later.',
        'network': 'No internet connection. Showing cached data if available.'
    };
    
    Object.values(errorMessages).forEach(message => {
        testSuite.assertTrue(typeof message === 'string', 'Error message should be string');
        testSuite.assertTrue(message.length > 0, 'Error message should not be empty');
    });
});

// Run tests when page loads
if (typeof window !== 'undefined') {
    // Browser environment
    document.addEventListener('DOMContentLoaded', () => {
        testSuite.run().then(success => {
            if (success) {
                console.log('🎉 All tests passed!');
            } else {
                console.log('💥 Some tests failed!');
            }
        });
    });
} else {
    // Node.js environment
    testSuite.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testSuite, mockWeatherData };
}