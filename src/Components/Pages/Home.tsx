  return (
    <div className={`home-container ${theme}`}>
      <header className="home-header">
        <h1>Weather App</h1>
        <div className="header-controls">
          <button onClick={handleUnitToggle} className="btn-toggle">
            Scale: °{unit}
          </button>
          <button onClick={handleThemeToggle} className="btn-toggle">
            Mode: {theme === 'light' ? ' Dark' : ' Light'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSearchClick} className="search-form">
        <input 
          type="text" 
          placeholder="Search location..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Find</button>
      </form>

      {loading && <div className="loader">Analyzing atmosphere structures...</div>}
      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-card">
              <strong>{alert.type}:</strong> {alert.message}
            </div>
          ))}
        </div>
      )}

      {weather && !loading && (
        <main className="weather-display">
          <div className="current-weather-card">
            <h2>
              {weather.city}
              <button onClick={handleBookmarkToggle} className="btn-bookmark">
                {savedCities.includes(weather.city) ? ' Bookmarked' : ' Bookmark'}
              </button>
            </h2>
            <div className="current-main">
              <img 
                src={`https://openweathermap.org{weather.iconCode}@2x.png`} 
                alt={weather.condition} 
              />
              <span className="current-temp">{convertTemp(weather.temperature)}°{unit}</span>
            </div>
            <p className="condition-text">{weather.condition}</p>
            <div className="metrics-grid">
              <div>Humidity: {weather.humidity}%</div>
              <div>Wind: {weather.windSpeed} km/h</div>
            </div>
          </div>

          <div className="forecast-controls">
            <button 
              onClick={() => setViewType('hourly')} 
              className={`btn-tab ${viewType === 'hourly' ? 'active' : ''}`}
            >
              Hourly Timeline
            </button>
            <button 
              onClick={() => setViewType('daily')} 
              className={`btn-tab ${viewType === 'daily' ? 'active' : ''}`}
            >
              4-Day Forecast
            </button>
          </div>

          <div className="forecast-cards-container">
            {viewType === 'hourly' ? (
              weather.hourly.map((hour, idx) => (
                <div key={idx} className="forecast-mini-card">
                  <div>{hour.time}</div>
                  <img src={`https://openweathermap.org{hour.icon}.png`} alt="icon" />
                  <div>{convertTemp(hour.temp)}°{unit}</div>
                </div>
              ))
            ) : (
              weather.daily.map((day, idx) => (
                <div key={idx} className="forecast-mini-card">
                  <div className="day-name">{day.day}</div>
                  <img src={`https://openweathermap.org{day.icon}.png`} alt={day.condition} />
                  <div>{convertTemp(day.temp)}°{unit}</div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {savedCities.length > 0 && (
        <section className="saved-locations-tray">
          <h3>Tracked Pinpoints</h3>
          <div className="quick-links">
            {savedCities.map((city, idx) => (
              <button key={idx} onClick={() => fetchWeatherApi(city)} className="btn-city-link">
                {city}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

