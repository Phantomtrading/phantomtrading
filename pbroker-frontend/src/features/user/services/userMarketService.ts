import { fetchMarketData, type MarketDataResponse } from '../api/userApi';

export const getMarketData = async (): Promise<MarketDataResponse> => {
  try {
    return await fetchMarketData();
  } catch (error) {
    throw error;
  }
}; 