import { useCallback } from 'react';

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightImpact = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const mediumImpact = useCallback(() => {
    vibrate(20);
  }, [vibrate]);

  const heavyImpact = useCallback(() => {
    vibrate([30, 10, 30]);
  }, [vibrate]);

  const success = useCallback(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  const warning = useCallback(() => {
    vibrate([200, 50, 200, 50, 200]);
  }, [vibrate]);

  const error = useCallback(() => {
    vibrate([300, 100, 300]);
  }, [vibrate]);

  const newOrder = useCallback(() => {
    vibrate([200, 100, 200, 100, 200]);
  }, [vibrate]);

  return {
    vibrate,
    lightImpact,
    mediumImpact,
    heavyImpact,
    success,
    warning,
    error,
    newOrder
  };
}