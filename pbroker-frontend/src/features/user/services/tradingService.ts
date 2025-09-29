import { api } from '../../auth/services/axiosClient';
import { fetchTradingPairs } from '../../admin/api/adminApi';
import type { TradeRequest, TradeResponse } from '../api/userApi';
import type { TradingPair,  } from '../../admin/api/adminApi';

export const createTradeRequest = async (tradeData: TradeRequest): Promise<TradeResponse> => {
  // Only send the required fields for trade creation
  const {
    tradingPairId,
    tradeOptionId,
    tradeType,
    tradingAmountQuote,
    executionPrice
  } = tradeData;
  const response = await api.post('/trades', {
    tradingPairId,
    tradeOptionId,
    tradeType,
    tradingAmountQuote,
    executionPrice
  });
  return response.data.data;
};

export const getUserTrades = async (userId: number): Promise<TradeResponse[]> => {
  const response = await api.get(`/trades/user/${userId}`);
  return response.data.data;
};

export const getTradeById = async (tradeId: string): Promise<TradeResponse> => {
  const response = await api.get(`/trades/${tradeId}`);
  return response.data.data;
};

export const updateTradeRequest = async (tradeId: string, tradeData: Partial<TradeRequest>): Promise<TradeResponse> => {
  const response = await api.patch(`/trades/${tradeId}`, tradeData);
  return response.data.data;
};

export const getTradingPairs = async (): Promise<TradingPair[]> => {
  const response = await fetchTradingPairs();
  return response.data; // backend returns paginated response with data array
}; 