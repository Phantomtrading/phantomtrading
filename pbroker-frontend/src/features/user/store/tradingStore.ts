import { create } from 'zustand';
import { getTradingPairs } from '../services/tradingService';
import type { TradingPair } from '../../admin/api/adminApi';

interface TradingStoreState {
  tradingPairs: TradingPair[];
  loading: boolean;
  error: string | null;
  selectedSymbol: string;
  tradeType: 'BUY' | 'SELL';
  tradingAmountQuote: string;
  tradeExpirationTimeSeconds: string;
  mobileTab: 'chart' | 'market' | 'trade';
  fetchTradingPairs: () => Promise<void>;
  setSelectedSymbol: (symbol: string) => void;
  setTradeType: (type: 'BUY' | 'SELL') => void;
  setTradingAmountQuote: (amount: string) => void;
  setTradeExpirationTimeSeconds: (seconds: string) => void;
  setMobileTab: (tab: 'chart' | 'market' | 'trade') => void;
}

export const useTradingStore = create<TradingStoreState>((set) => ({
  tradingPairs: [],
  loading: false,
  error: null,
  selectedSymbol: 'BTCUSDT',
  tradeType: 'BUY',
  tradingAmountQuote: '',
  tradeExpirationTimeSeconds: '60',
  mobileTab: 'chart',
  fetchTradingPairs: async () => {
    set({ loading: true, error: null });
    try {
      const pairs = await getTradingPairs();
      set({ tradingPairs: pairs, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load trading pairs', loading: false });
    }
  },
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setTradeType: (type) => set({ tradeType: type }),
  setTradingAmountQuote: (amount) => set({ tradingAmountQuote: amount }),
  setTradeExpirationTimeSeconds: (seconds) => set({ tradeExpirationTimeSeconds: seconds }),
  setMobileTab: (tab) => set({ mobileTab: tab }),
})); 