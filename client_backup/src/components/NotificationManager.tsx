import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useHaptics } from '@/hooks/useHaptics';

interface NotificationManagerProps {
  orders: any[];
}

export default function NotificationManager({ orders }: NotificationManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { newOrder, success } = useHaptics();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up push notification subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (!subscription) {
            // Subscribe to push notifications
            const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // This would be set in production
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: vapidPublicKey
            }).catch(console.error);
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    const newOrders = orders.filter(order => order.status === 'confirmed');
    const previousOrderIds = JSON.parse(localStorage.getItem('previousOrderIds') || '[]');
    
    newOrders.forEach(order => {
      if (!previousOrderIds.includes(order.id)) {
        // Show notification for new order
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Order Received!', {
            body: `Order #${order.id} from ${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            tag: `order-${order.id}`,
            requireInteraction: true,

          });
        }

        // Show toast notification
        toast({
          title: "New Order!",
          description: `Order #${order.id} - ${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
        });

        // Haptic feedback for new order
        newOrder();
      }
    });

    // Update stored order IDs
    const currentOrderIds = orders.map(order => order.id);
    localStorage.setItem('previousOrderIds', JSON.stringify(currentOrderIds));
  }, [orders, toast]);

  return null;
}