import {
  fetchTradingPairs,
  createTradingPair,
  updateTradingPair,
  deleteTradingPair,
  type CreateTradingPairRequest
} from '../api/adminApi';

export const tradingPairKeys = {
  all: ['trading-pairs'] as const,
  lists: () => [...tradingPairKeys.all, 'list'] as const,
  list: (filters: string) => [...tradingPairKeys.lists(), { filters }] as const,
  details: () => [...tradingPairKeys.all, 'detail'] as const,
  detail: (id: number) => [...tradingPairKeys.details(), id] as const,
};

export const getAllTradingPairs = async () => {
  try {
    return await fetchTradingPairs();
  } catch (error) {
    throw error;
  }
};

export const createNewTradingPair = async (data: CreateTradingPairRequest) => {
  try {
    return await createTradingPair(data);
  } catch (error) {
    throw error;
  }
};

export const updateExistingTradingPair = async (id: number, data: Partial<CreateTradingPairRequest>) => {
  try {
    return await updateTradingPair(id, data);
  } catch (error) {
    throw error;
  }
};

export const removeTradingPair = async (id: number) => {
  try {
    return await deleteTradingPair(id);
  } catch (error) {
    throw error;
  }
}; 