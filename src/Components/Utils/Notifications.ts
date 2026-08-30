export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  const permission = await window.Notification.requestPermission();
  return permission === 'granted';
};

export const sendWeatherNotification = (title: string, body: string): void => {
  if ('Notification' in window && window.Notification.permission === 'granted') {
    new window.Notification(title, { body });
  }
};