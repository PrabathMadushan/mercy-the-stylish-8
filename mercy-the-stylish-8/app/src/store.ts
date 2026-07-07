import type { CartItem, Product, User, ChatMessage } from "./types";
import { loadSession } from "./api";

class Store {
  cart: CartItem[] = [];
  user: User | null = null;
  aiChatHistory: ChatMessage[] = [];

  async init() {
    this.user = await loadSession();
  }

  addToCart(product: Product, quantity = 1) {
    const existing = this.cart.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter((i) => i.product.id !== productId);
  }

  clearCart() {
    this.cart = [];
  }

  cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  cartCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}

export const store = new Store();
