import { create } from 'zustand';
import { Product, Language } from './data/products';

interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: number, size: string) => void;
  clearCart: () => void;
  total: () => number;
  cartIconPosition: { x: number; y: number } | null;
  setCartIconPosition: (pos: { x: number; y: number }) => void;
}

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  cartIconPosition: null,
  setCartIconPosition: (pos) => set({ cartIconPosition: pos }),
  addToCart: (product, size) => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.id === product.id && item.selectedSize === size
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id && item.selectedSize === size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { ...product, selectedSize: size, quantity: 1 }],
      };
    });
  },
  removeFromCart: (productId, size) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.id === productId && item.selectedSize === size)
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  total: () => {
    const { items } = get();
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },
}));

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'ar',
  setLanguage: (lang) => set({ language: lang }),
  toggleLanguage: () => set((state) => {
    const langs: Language[] = ['ar', 'en', 'fr'];
    const nextIndex = (langs.indexOf(state.language) + 1) % langs.length;
    return { language: langs[nextIndex] };
  }),
}));
