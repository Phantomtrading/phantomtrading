import { fetchAllTrades, fetchTradeById, fetchUserTrades, updateTrade as updateTradeApi, type TradeQueryParams } from '../api/adminApi';
// import type { AdminTrade } from '../api/adminApi';

export type { TradeQueryParams };

export const getAllTrades = async (params?: TradeQueryParams) => {
  return fetchAllTrades(params);
};

export const getTradeById = async (tradeId: string) => {
  return fetchTradeById(tradeId);
};

export const getUserTrades = async (userId: number) => {
  return fetchUserTrades(userId);
};

export const updateTrade = async (tradeId: string, data: { tradeStatus?: string; winLoseStatus?: 'WIN' | 'LOSE' }) => {
  return updateTradeApi(tradeId, data);
}; 
