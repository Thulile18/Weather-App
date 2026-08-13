import React from 'react';
import type { WeatherAlert as WeatherAlertType } from '../Components/Types/Weather.types';
import Card from '../Components/Card'; 

interface WeatherAlertProps {
  alert: WeatherAlertType;
  onDismiss?: () => void;
}

const WeatherAlert: React.FC<WeatherAlertProps> = ({ alert, onDismiss }) => {
  const severityStyleClasses = {
    warning: 'alert-severity-warning',
    watch: 'alert-severity-watch',
    advisory: 'alert-severity-advisory'
  };

  const severityLabels = {
    warning: '⚠️ ALERT',
    watch: '👀 WATCH',
    advisory: 'ℹ️ ADVISORY'
  };

  return (
    <Card className={`weather-alert-base-card ${severityStyleClasses[alert.severity]}`}>
      <div className="alert-content-container">
        <div className="alert-message-layout">
          <span className="alert-status-badge">
            {severityLabels[alert.severity]}
          </span>
          <div className="alert-text-block">
            <h4 className="alert-type-title">{alert.type}</h4>
            <p className="alert-description-text">{alert.message}</p>
            <p className="alert-timestamp-footer">{alert.time}</p>
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="alert-dismiss-action-btn"
            title="Dismiss alert"
          >
            ✕
          </button>
        )}
      </div>
    </Card>
  );
};

export default WeatherAlert;