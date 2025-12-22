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

## 📁 Project Structure

```
Weather_App/
├── frontend/           # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/            # Backend (Node.js Server)
│   ├── server.js
│   ├── package.json
│   └── .env
├── README.md           # Documentation
├── GITHUB_UPLOAD_GUIDE.md
└── LICENSE
```

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Weather_App.git
   cd Weather_App
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure API Key**
   - Inside `backend/`, create a `.env` file:
     ```env
     OPENWEATHER_API_KEY=YOUR_API_KEY_HERE
     PORT=3000
     ```

4. **Run the Application**

   **Step 1: Start Backend**
   ```bash
   # In the backend directory
   npm start
   ```

   **Step 2: Start Frontend**
   - Open a new terminal.
   - Go to frontend directory: `cd ../frontend` (or `cd frontend` from root).
   - Open `index.html` in browser OR run a local server:
     ```bash
     python -m http.server 8000
     ```
   - Visit `http://localhost:8000`

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

Made with ❤️ by Mrunal Thamake
