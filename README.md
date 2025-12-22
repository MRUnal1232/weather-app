# SkyCast Weather Dashboard ☁️

A modern, beautiful weather dashboard application that provides real-time weather information and forecasts for any location worldwide.

![Weather Dashboard](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **Real-time Weather Data**: Get current weather conditions for any city
- **Automatic Location Detection**: Automatically detects your current location
- **Today's Forecast**: Hourly weather forecast for the current day
- **7-Day Forecast**: Extended weather forecast for the entire week
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Weather Icons**: Visual weather representation with emoji icons
- **Search Functionality**: Search for any city worldwide
- **Temperature Display**: Shows temperature in Celsius with high/low ranges

## 🚀 Demo

Visit the live demo: [SkyCast Dashboard](#) *(Add your GitHub Pages link here)*

## 📸 Screenshots

### Main Dashboard
*Add screenshot here*

### Today's Forecast
*Add screenshot here*

### 7-Day Forecast
*Add screenshot here*

## 🛠️ Technologies Used

- **HTML5**: Structure and content
- **CSS3**: Styling with modern features (flexbox, animations, glassmorphism)
- **JavaScript (ES6+)**: Dynamic functionality and API integration
- **OpenWeatherMap API**: Weather data provider
- **Lucide Icons**: Icon library

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls
- OpenWeatherMap API key (free tier available)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Weather_App.git
   cd Weather_App
   ```

2. **Get your API key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key

3. **Configure the API key**
   - Open `script.js`
   - Replace the API key on line 2:
     ```javascript
     const apiKey = "YOUR_API_KEY_HERE";
     ```

4. **Run the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

## 💻 Usage

1. **Automatic Location**: The app will automatically detect your location on load
2. **Search for Cities**: Use the search bar to find weather for any city
3. **View Forecasts**: 
   - Scroll through today's hourly forecast
   - Check the 7-day forecast on the right panel
4. **Hover Effects**: Hover over forecast cards for interactive effects

## 📁 Project Structure

```
Weather_App/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # JavaScript logic
├── README.md           # Project documentation
└── .gitignore         # Git ignore file
```

## 🎨 Features Breakdown

### Current Weather Display
- City name and country
- Current temperature
- Weather description
- Current date

### Today's Forecast
- Hourly forecasts for the current day
- Time display (12-hour format)
- Weather icons
- Temperature for each hour
- Weather description

### 7-Day Forecast
- Daily weather for the next 7 days
- Day names (Mon, Tue, Wed, etc.)
- Weather icons and descriptions
- High/Low temperature ranges

## 🔑 API Information

This project uses the [OpenWeatherMap API](https://openweathermap.org/api):
- **Current Weather Data**: Real-time weather conditions
- **5-Day Forecast**: Weather predictions with 3-hour intervals
- **Free Tier**: 60 calls/minute, 1,000,000 calls/month

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Lucide](https://lucide.dev/)
- Design inspiration from modern weather applications

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

Made with ❤️ by [Your Name]
