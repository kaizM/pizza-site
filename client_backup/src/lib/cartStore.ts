import { CartItem } from "@shared/schema";

const CART_KEY = "huntbrothers_pizza_cart";

class CartStore {
  private items: CartItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      this.items = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  addItem(item: CartItem) {
    this.items = [...this.items, item];
    this.saveToStorage();
    this.notifyListeners();
  }

  removeItem(id: string) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    
    this.items = this.items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    this.saveToStorage();
    this.notifyListeners();
  }

  clearCart() {
    this.items = [];
    localStorage.removeItem(CART_KEY);
    this.notifyListeners();
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal(): number {
    const firstPizzaPrice = 11.99;
    const additionalPizzaPrice = 10.99;
    
    let subtotal = 0;
    let totalPizzaCount = 0;
    
    this.items.forEach(item => {
      totalPizzaCount += item.quantity;
      const toppingsPerPizza = item.price - firstPizzaPrice;
      subtotal += toppingsPerPizza * item.quantity;
    });
    
    if (totalPizzaCount === 1) {
      subtotal += firstPizzaPrice;
    } else if (totalPizzaCount > 1) {
      subtotal += firstPizzaPrice + (additionalPizzaPrice * (totalPizzaCount - 1));
    }
    
    return subtotal;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const cartStore = new CartStore();