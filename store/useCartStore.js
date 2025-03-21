import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) =>
        set((state) => {
          // Create a unique ID based on product ID and size (if available)
          const itemId = product.id;
          
          // Check if this exact item (same ID which now includes size info) exists
          const exists = state.cart.find((item) => item.id === itemId);
          
          if (exists) {
            // If it exists, update the quantity
            return {
              cart: state.cart.map((item) =>
                item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            }
          }
          
          // If it doesn't exist, add it as a new item
          return { cart: [...state.cart, { ...product, quantity: 1 }] }
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + Number.parseFloat(item.price) * item.quantity, 0)
      },
      getCartCount: () => {
        const { cart } = get()
        return cart.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "orvello-cart",
      getStorage: () => (typeof window !== "undefined" ? window.localStorage : null),
    },
  ),
)

