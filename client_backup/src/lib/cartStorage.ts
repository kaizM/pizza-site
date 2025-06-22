import type { CartItem } from '@shared/schema';

const CART_STORAGE_KEY = 'pizza-cart';

export const cartStorage = {
  // Save cart to localStorage
  save: (items: CartItem[]): void => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  },

  // Load cart from localStorage
  load: (): CartItem[] => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    return [];
  },

  // Clear cart from localStorage
  clear: (): void => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  }
};