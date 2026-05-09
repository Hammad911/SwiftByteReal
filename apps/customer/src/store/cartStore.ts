import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  extraCost: number;
}

interface CartItem {
  id: string; // unique cart item id
  menuItemId: string;
  name: string;
  photo?: string;
  price: number;
  quantity: number;
  customisations: SelectedModifier[];
  specialInstructions?: string;
  itemTotal: number;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "id" | "itemTotal"> & { restaurantId?: string; restaurantName?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

/** Selectors — use these instead of getters (persist rehydration strips getters). */
export function selectCartSubtotal(s: Pick<CartState, "items">): number {
  return parseFloat(s.items.reduce((sum, i) => sum + i.itemTotal, 0).toFixed(2));
}

export function selectCartItemCount(s: Pick<CartState, "items">): number {
  return s.items.reduce((sum, i) => sum + i.quantity, 0);
}

function calcItemTotal(price: number, customisations: SelectedModifier[], quantity: number): number {
  const extras = customisations.reduce((sum, c) => sum + c.extraCost, 0);
  return parseFloat(((price + extras) * quantity).toFixed(2));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],
      isOpen: false,

      addItem: (newItem: Omit<CartItem, "id" | "itemTotal"> & { restaurantId?: string; restaurantName?: string }) => {
        const state = get();

        // Clear cart if from a different restaurant
        if (state.restaurantId && newItem.restaurantId && state.restaurantId !== newItem.restaurantId) {
          set({ items: [], restaurantId: newItem.restaurantId, restaurantName: newItem.restaurantName ?? null });
        } else if (!state.restaurantId && newItem.restaurantId) {
          set({ restaurantId: newItem.restaurantId, restaurantName: newItem.restaurantName ?? null });
        }

        const existingIdx = state.items.findIndex(
          (i) =>
            i.menuItemId === newItem.menuItemId &&
            JSON.stringify(i.customisations) === JSON.stringify(newItem.customisations)
        );

        if (existingIdx >= 0) {
          const items = [...state.items];
          const existing = items[existingIdx];
          const newQty = existing.quantity + newItem.quantity;
          items[existingIdx] = {
            ...existing,
            quantity: newQty,
            itemTotal: calcItemTotal(existing.price, existing.customisations, newQty),
          };
          set({ items, isOpen: true });
        } else {
          const id = `${newItem.menuItemId}-${Date.now()}`;
          const itemTotal = calcItemTotal(newItem.price, newItem.customisations, newItem.quantity);
          set({
            items: [...state.items, { ...newItem, id, itemTotal }],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        set({ items, ...(items.length === 0 ? { restaurantId: null, restaurantName: null } : {}) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, quantity, itemTotal: calcItemTotal(i.price, i.customisations, quantity) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: "swiftbyte-cart",
      partialize: (state) => ({
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        items: state.items,
      }),
    }
  )
);
