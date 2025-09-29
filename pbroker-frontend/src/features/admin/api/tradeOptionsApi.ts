import { api } from '../../auth/services/axiosClient';

export interface TradeOption {
  id: number;
  tradingPairId: number;
  durationSeconds: number;
  profitPercentage: number;
  minAmountQuote: number;
  maxAmountQuote: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTradeOptionRequest {
  tradingPairId: number;
  durationSeconds: number;
  profitPercentage: number;
  minAmountQuote: number;
  maxAmountQuote: number;
}

export interface UpdateTradeOptionRequest extends Partial<CreateTradeOptionRequest> {}

// Create a new trade option
export const createTradeOption = async (data: CreateTradeOptionRequest): Promise<TradeOption> => {
  try {
    const response = await api.post('/trade-options', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating trade option:', error);
    throw error;
  }
};

// Get trade options by trading pair ID
export const getTradeOptionsByPairId = async (tradingPairId: number): Promise<TradeOption[]> => {
  try {
    const response = await api.get('/trade-options', {
      params: { tradingPairId }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching trade options:', error);
    throw error;
  }
};

// Get a specific trade option by ID
export const getTradeOptionById = async (id: number): Promise<TradeOption> => {
  try {
    const response = await api.get(`/trade-options/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching trade option:', error);
    throw error;
  }
};

// Update a trade option
export const updateTradeOption = async (id: number, data: UpdateTradeOptionRequest): Promise<TradeOption> => {
  try {
    const response = await api.patch(`/trade-options/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating trade option:', error);
    throw error;
  }
};

// Delete a trade option
export const deleteTradeOption = async (id: number): Promise<void> => {
  try {
    await api.delete(`/trade-options/${id}`);
  } catch (error) {
    console.error('Error deleting trade option:', error);
    throw error;
  }
};
