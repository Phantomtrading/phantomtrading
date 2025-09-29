import { 
  createTradeOption, 
  getTradeOptionsByPairId, 
  getTradeOptionById, 
  updateTradeOption, 
  deleteTradeOption,
  type CreateTradeOptionRequest,
  type UpdateTradeOptionRequest,
  type TradeOption
} from '../api/tradeOptionsApi';

export const tradeOptionsService = {
  // Create a new trade option
  create: async (data: CreateTradeOptionRequest): Promise<TradeOption> => {
    // Validate that maxAmount >= minAmount
    if (data.maxAmountQuote < data.minAmountQuote) {
      throw new Error('Maximum amount must be greater than or equal to minimum amount');
    }
    
    return createTradeOption(data);
  },

  // Get all trade options for a trading pair
  getByPairId: async (tradingPairId: number): Promise<TradeOption[]> => {
    return getTradeOptionsByPairId(tradingPairId);
  },

  // Get a specific trade option
  getById: async (id: number): Promise<TradeOption> => {
    return getTradeOptionById(id);
  },

  // Update a trade option
  update: async (id: number, data: UpdateTradeOptionRequest): Promise<TradeOption> => {
    // Validate that maxAmount >= minAmount if both are provided
    if (data.maxAmountQuote !== undefined && data.minAmountQuote !== undefined) {
      if (data.maxAmountQuote < data.minAmountQuote) {
        throw new Error('Maximum amount must be greater than or equal to minimum amount');
      }
    }
    
    return updateTradeOption(id, data);
  },

  // Delete a trade option
  delete: async (id: number): Promise<void> => {
    return deleteTradeOption(id);
  }
};
