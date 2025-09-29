import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Product, HostingOrder } from '../api/productsApi';

interface ProductsState {
  selectedProduct: Product | null;
  selectedOrder: HostingOrder | null;
  filters: {
    minInvestment: number;
    maxInvestment: number;
  };
  setSelectedProduct: (product: Product | null) => void;
  setSelectedOrder: (order: HostingOrder | null) => void;
  setFilters: (filters: Partial<ProductsState['filters']>) => void;
  resetFilters: () => void;
}

const initialState = {
  selectedProduct: null,
  selectedOrder: null,
  filters: {
    minInvestment: 0,
    maxInvestment: 100000
  }
};

export const useProductsStore = create<ProductsState>()(
  devtools(
    (set) => ({
      ...initialState,

      setSelectedProduct: (product) =>
        set({ selectedProduct: product }, false, 'setSelectedProduct'),

      setSelectedOrder: (order) =>
        set({ selectedOrder: order }, false, 'setSelectedOrder'),

      setFilters: (newFilters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters }
          }),
          false,
          'setFilters'
        ),

      resetFilters: () =>
        set(
          { filters: initialState.filters },
          false,
          'resetFilters'
        )
    }),
    {
      name: 'products-store'
    }
  )
);
