import { api } from '../../features/auth/services/axiosClient';

export interface MarketData {
  id: number;
  name: string;
  symbol: string;
  logoUrl: string;
  price: number;
  change24h: number;
  source: string;
}

export interface MarketDataResponse {
  status: string;
  code: string;
  message: string;
  data: MarketData[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const fetchMarketData = async (params?: {
  page?: number;
  limit?: number;
}): Promise<MarketDataResponse> => {
  try {
    const response = await api.get('/market-data', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 15
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

export const getMarketDataById = async (id: number): Promise<MarketData> => {
  try {
    const response = await api.get(`/market-data/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching market data by ID:', error);
    throw error;
  }
};
