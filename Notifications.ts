export class NotificationService {
  
  
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support standard push notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static sendNotification(title: string, options?: { body?: string; icon?: string; tag?: string; requireInteraction?: boolean }): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        body: options?.body || '',
        icon: options?.icon || '/favicon.svg',
        tag: options?.tag || 'weather-alert',
        requireInteraction: options?.requireInteraction || false
      });

      setTimeout(() => notification.close(), 10000);

      notification.onclick = () => {
        notification.close();
        window.focus();
      };
    } catch (error) {
      console.error('Error creating desktop notice:', error);
    }
  }

  static sendWeatherAlert(location: string, condition: string, severity: 'warning' | 'watch' | 'advisory'): void {
    const severityConfig: Record<'warning' | 'watch' | 'advisory', { prefix: string; label: string }> = {
      warning: { 
        prefix: '[CRITICAL]', 
        label: 'Severe Alert'
      },
      watch: { 
        prefix: '[ATTENTION]', 
        label: 'Watch'
      },
      advisory: { 
        prefix: '[INFO]', 
        label: 'Advisory'
      }
    };

    const config = severityConfig[severity];
    const title = `${config.prefix} Weather ${config.label}`;
    const body = `${location}: ${condition}`;

    this.sendNotification(title, {
      body: body,
      icon: '/favicon.svg',
      tag: `weather-${location}-${Date.now()}`,
      requireInteraction: severity === 'warning'
    });
  }
}