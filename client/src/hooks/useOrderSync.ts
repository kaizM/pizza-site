import { useState, useEffect, useCallback } from 'react';
import { Order } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useOrderSync() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const { toast } = useToast();

  // Sound notification for new orders
  const playNewOrderSound = useCallback(() => {
    try {
      // Create audio context for cross-platform sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // High-pitched beep sequence
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (error) {
      console.log('Audio not available:', error);
    }
  }, []);

  // Fetch orders from server
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const fetchedOrders: Order[] = await response.json();
      
      // Check for new orders
      if (fetchedOrders.length > lastOrderCount && lastOrderCount > 0) {
        const newOrdersCount = fetchedOrders.length - lastOrderCount;
        playNewOrderSound();
        
        toast({
          title: `${newOrdersCount} New Order${newOrdersCount > 1 ? 's' : ''}!`,
          description: 'Check the order list for details',
          variant: 'default'
        });
      }
      
      setOrders(fetchedOrders);
      setLastOrderCount(fetchedOrders.length);
      
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to fetch orders. Retrying...',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [lastOrderCount, playNewOrderSound, toast]);

  // Set up real-time polling
  useEffect(() => {
    // Initial fetch
    fetchOrders();
    
    // Poll every 3 seconds for new orders
    const interval = setInterval(fetchOrders, 3000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Manual refresh
  const refreshOrders = useCallback(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    refreshOrders,
    playNewOrderSound
  };
}