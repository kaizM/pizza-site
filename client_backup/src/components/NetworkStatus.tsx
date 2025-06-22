import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Signal } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setConnectionQuality('offline');
      }
    };

    const testConnection = async () => {
      if (!navigator.onLine) return;

      try {
        const start = Date.now();
        const response = await fetch('/api/health', { 
          method: 'GET',
          cache: 'no-cache'
        });
        const duration = Date.now() - start;

        if (response.ok) {
          setConnectionQuality(duration < 1000 ? 'good' : 'poor');
        } else {
          setConnectionQuality('poor');
        }
      } catch {
        setConnectionQuality('poor');
      }
    };

    // Initial test
    testConnection();

    // Set up event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'good': return 'bg-green-500';
      case 'poor': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    return connectionQuality === 'good' ? <Wifi className="h-3 w-3" /> : <Signal className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    return connectionQuality === 'good' ? 'Connected' : 'Slow Connection';
  };

  return (
    <Badge variant="outline" className={`${getStatusColor()} text-white border-0`}>
      {getStatusIcon()}
      <span className="ml-1 text-xs">{getStatusText()}</span>
    </Badge>
  );
}