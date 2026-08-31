🌦️ Weather Portal — Responsive Weather Application

 Real-time weather app built with React + TypeScript

[![React](https://img.shields.io/badge/React-19-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Vite](https://img.shields.io/badge/Vite-Build-purple)]()
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)]()

🔗 Live: `vercel.app` | 👩‍💻 Dev: `Thulile18`

 📌 Overview
Real-time weather app with forecasts, search, and alerts.

 ✨ Features
- Real-time weather: temperature, humidity, wind speed
- Forecast views: hourly and daily
- Toggle view:** easy switch between hourly/daily
- Location detection: browser GPS auto-fetch
- Rural optimization: generous GPS timeout for low-signal areas
- Global search: look up any city worldwide
- Saved locations: Favourites page
- Weather alerts: push notifications for extreme weather
- Theme toggle: light / dark mode
- Unit toggle: Celsius / Fahrenheit
- Offline support: caches last data locally
- Responsive: 320px to 1200px

  🛠️ Tech Stack
- Framework: React 19
- Language: TypeScript
- Routing: React Router v6
- Styling: Plain CSS + CSS variables
- Layout: Flexbox & Grid (no frameworks)
- Networking: Native fetch API
- Storage: LocalStorage
- Build: Vite
- API: OpenWeatherMap
- Deploy: Vercel

  Getting Started
```bash
git clone https://github.com/Thulile18/Weather-Portal.git
cd Weather-Portal
npm install
cp.env.example.env
npm run dev

Other scripts:

npm run build # Build production
npm run preview # Preview build
npm run lint # Lint code

🔑 Environment Variables
You need a free OpenWeatherMap API key.

VITE_OPENWEATHER_API_KEY=your_api_key_here

- `.env` is ignored by `.gitignore`
- For production, set key in Vercel > Project Settings > Environment Variables

📁 Project Structure

src/
├── App.tsx # Root routing + theme
├── main.tsx # Entry point
├── App.css / index.css # Global themes
├── components/ # Button, Card, Input
├── hooks/ # useWeather, useLocation
├── layout/ # Header, Sidebar drawer
├── pages/ # Home, Favourites
├── services/ # weather API + localStorage
├── types/ # TS interfaces
├── utils/ # constants, formatters
└── weather/ # WeatherDisplay, HourlyForecast, DailyForecast, WeatherAlert

👩‍💻 Developer
Built by *Thulile18*
Repo: `github.com/Thulile18/Weather-Portal`


