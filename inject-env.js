// This script injects environment variables into the HTML at build time
// Run this during Netlify build: node inject-env.js

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.WEATHER_API_KEY || '';

if (!API_KEY) {
    console.error('Warning: WEATHER_API_KEY environment variable is not set!');
}

const envScript = `
<script>
  // Inject API key from build-time environment variable
  window.WEATHER_API_KEY = '${API_KEY}';
</script>
`;

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Inject the script before the closing </head> tag
if (!html.includes('window.WEATHER_API_KEY')) {
    html = html.replace('</head>', `${envScript}</head>`);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Environment variables injected successfully!');
} else {
    console.log('Environment variables already injected.');
}
