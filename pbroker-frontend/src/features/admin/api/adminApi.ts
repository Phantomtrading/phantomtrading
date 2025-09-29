import { api } from '../../auth/services/axiosClient';
import axios from 'axios';
import type { TradeResponse } from '../../user/api/userApi';

export interface AdminDeposit {
  id: string;
  userId: number;
  cryptocurrencyId: number;
  amount: string;
  proofOfDepositUrl: string;
  transactionHash: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  cryptocurrency: {
    id: number;
    name: string;
    symbol: string;
  };
}

export interface PaginatedResponse<T> {
  status: string;
  code: string;
  message: string;
  data: T[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface DepositQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UserDepositAmount {
  totalAmount: number;
}

export interface TradingPairTradeOption {
  id: number;
  durationSeconds: number;
  profitPercentage: number;
  minAmountQuote: number;
  maxAmountQuote: number;
}

export type TradeOptionCreate = Omit<TradingPairTradeOption, 'id'>;

export interface TradingPair {
  id: number;
  pairName: string;
  baseCurrency: string;
  quoteCurrency: string;
  defaultTransactionFeePercentage: string;
  tradeOptions: TradingPairTradeOption[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTradingPairRequest {
  pairName: string;
  baseCurrency: string;
  quoteCurrency: string;
  defaultTransactionFeePercentage: number;
  tradeOptions: TradeOptionCreate[];
  isActive: boolean;
}

export interface User {
  id: number;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  balance: string;
  role: 'ADMIN' | 'USER';
  demoMode?: 'WIN' | 'LOSE' | 'NA';
}

export interface UserCount {
  count: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  demoMode?: 'WIN' | 'LOSE' | 'NA';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TradeQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface WinLoseStatus {
  status: string;
}

export interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  address: string;
  expectedMonthlyProfit: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalTrades: number;
  activeTrades: number;
  totalDeposits: number;
  pendingDeposits: number;
  winRate: number;
  averageTradeAmount: number;
}

export interface TradeStats {
  totalTrades: number;
  winTrades: number;
  loseTrades: number;
  neutralTrades: number;
  totalVolume: number;
  averageTradeAmount: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface TradeTimeSeries {
  trades: TimeSeriesData[];
  volume: TimeSeriesData[];
  profit: TimeSeriesData[];
}

export interface AdminWithdrawal {
  id: string;
  userId: number;
  amount: string;
  fee: string;
  withdrawalAddress: string;
  transactionHash: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    balance: string;
    email: string;
  };
}

export interface Transfer {
  id: string;
  amount: string;
  createdAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    balance: string;
    email: string;
  };
  recipient: {
    id: number;
    firstName: string;
    lastName: string;
    balance: string;
    email: string;
  };
}

export interface TransferQueryParams {
  page?: number;
  limit?: number;
}

export interface AdminTrade {
  id: string;
  userId: number;
  tradingPair: string;
  baseCurrency: string;
  quoteCurrency: string;
  tradeType: 'BUY' | 'SELL';
  tradingAmountQuote: number;
  tradingAmountBase: number;
  executionPrice: number;
  tradeExpirationTimeSeconds: number;
  potentialProfitPercentage: number;
  expectedProfitQuote: number;
  transactionFeePercentage: number;
  transactionFeeAmountQuote: number;
  tradeStatus: string;
  winLoseStatus: 'WIN' | 'LOSE' | 'NA';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    balance: number;
  };
}

export interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  coingeckoId: string;
  tokenStandard: string;
  depositAddress: string;
}

export interface CreateCryptoRequest {
  name: string;
  symbol: string;
  coingeckoId: string;
  tokenStandard: string;
  depositAddress: string;
}

export const fetchAllDeposits = async (params?: DepositQueryParams): Promise<PaginatedResponse<AdminDeposit>> => {
  try {
    const response = await api.get('/deposits', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all deposits:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const updateDepositStatus = async (depositId: string, status: string, adminNotes?: string): Promise<AdminDeposit> => {
  try {
    console.log("sending data", status, "to", depositId);
    const response = await api.patch(`/deposits/${depositId}/status`, { status, adminNotes });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating deposit status:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchDepositsCount = async (): Promise<number> => {
  try {
    const response = await api.get('/deposits/count');
    return response.data.data.totalCount;
  } catch (error) {
    console.error('Error fetching deposits count:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchUserTotalDepositAmount = async (userId: number): Promise<UserDepositAmount> => {
  try {
    const response = await api.get(`/deposits/user/${userId}/total-amount`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user total deposit amount:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchTradingPairs = async (): Promise<PaginatedResponse<TradingPair>> => {
  try {
    const response = await api.get('/trading-pair-settings');
    console.log('Fetched trading pairs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const createTradingPair = async (data: CreateTradingPairRequest): Promise<TradingPair> => {
  try {
    const response = await api.post('/trading-pair-settings', data);
    console.log('Created trading pair:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating trading pair:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const updateTradingPair = async (id: number, data: Partial<CreateTradingPairRequest>): Promise<TradingPair> => {
  try {
    const response = await api.patch(`/trading-pair-settings/${id}`, data);
    console.log('Updated trading pair:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating trading pair:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const deleteTradingPair = async (id: number): Promise<void> => {
  try {
    const response = await api.delete(`/trading-pair-settings/${id}`);
    console.log('Deleted trading pair:', response.data);
  } catch (error) {
    console.error('Error deleting trading pair:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchAllUsers = async (): Promise<PaginatedResponse<User>> => {
  try {
    const response = await api.get('/users');
    console.log('Fetch all users response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchUserCount = async (): Promise<UserCount> => {
  try {
    const response = await api.get('/users/count');
    console.log('Fetch user count response:', response);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user count:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchUserById = async (id: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    console.log('Fetch user by ID response:', response);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const updateUserInfo = async (id: number, data: UpdateUserRequest & { role?: 'ADMIN' | 'USER' }): Promise<User> => {
  try {
    const response = await api.patch(`/users/${id}`, data);
    console.log('Update user info response:', response);
    return response.data.data;
  } catch (error) {
    console.error('Error updating user:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const promoteUserToAdmin = async (id: number): Promise<User> => {
  try {
    const response = await api.patch(`/users/${id}/make-admin`);
    console.log('Promote user to admin response:', response);
    return response.data.data;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const changeUserPassword = async (data: ChangePasswordRequest): Promise<User> => {
  try {
    const response = await api.patch('/users/change-password', data);
    console.log('Change user password response:', response);
    return response.data.data;
  } catch (error) {
    console.error('Error changing user password:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchAllTrades = async (params?: TradeQueryParams): Promise<PaginatedResponse<AdminTrade>> => {
  try {
    const response = await api.get('/trades', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all trades:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchTradeById = async (tradeId: string): Promise<TradeResponse> => {
  try {
    const response = await api.get(`/trades/${tradeId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching trade by ID:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchUserTrades = async (userId: number): Promise<TradeResponse[]> => {
  try {
    const response = await api.get(`/trades/user/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user trades:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const updateTrade = async (tradeId: string, data: { tradeStatus?: string; winLoseStatus?: 'WIN' | 'LOSE' }): Promise<AdminTrade> => {
  try {
    // Backend requires winLoseStatus when tradeStatus is RESOLVED
    const updateData: any = {};
    
    if (data.tradeStatus) {
      updateData.tradeStatus = data.tradeStatus;
    }
    
    // Only include winLoseStatus if tradeStatus is RESOLVED
    if (data.tradeStatus === 'RESOLVED' && data.winLoseStatus) {
      updateData.winLoseStatus = data.winLoseStatus;
    } else if (data.tradeStatus === 'CANCELLED') {
      // Don't include winLoseStatus for CANCELLED trades
      delete updateData.winLoseStatus;
    }
    
    const response = await api.patch(`/trades/${tradeId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating trade:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchCryptoOptions = async (): Promise<CryptoOption[]> => {
  try {
    const response = await api.get('/cryptocurrencies');
    const backendCryptoOptions = response.data.data;
    const frontendCryptoOptions: CryptoOption[] = backendCryptoOptions.map((crypto: any) => ({
      id: crypto.id.toString(),
      name: crypto.name,
      symbol: crypto.symbol,
      address: crypto.depositAddress,
      expectedMonthlyProfit: 0,
    }));
    return frontendCryptoOptions;
  } catch (error) {
    console.error("Error fetching cryptocurrency options:", error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch cryptocurrency options');
    }
    throw error;
  }
};

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    // Fetch users count
    const usersResponse = await api.get('/users/count');
    const userCount = usersResponse.data.data.count;

    // Fetch deposits count
    const depositsResponse = await api.get('/deposits/count');
    const totalDeposits = depositsResponse.data.data.totalCount;

    // Fetch all deposits to calculate pending deposits
    const depositsListResponse = await api.get('/deposits');
    const deposits = depositsListResponse.data.data;
    const pendingDeposits = deposits.filter((deposit: any) => deposit.status === 'pending').length;

    // Fetch trades to calculate trade metrics
    const tradesResponse = await api.get('/trades');
    const trades = tradesResponse.data.data;
    const totalTrades = trades.length;
    const activeTrades = trades.filter((trade: any) => trade.tradeStatus === 'PENDING').length;
    const winTrades = trades.filter((trade: any) => trade.winLoseStatus === 'WIN').length;
    const totalTradeVolume = trades.reduce((sum: number, trade: any) => sum + parseFloat(trade.tradingAmountQuote || '0'), 0);
    const averageTradeAmount = totalTrades > 0 ? totalTradeVolume / totalTrades : 0;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

    // Calculate revenue based on transaction fees from trades only
    const totalTransactionFees = trades.reduce((sum: number, trade: any) => sum + parseFloat(trade.transactionFeeAmountQuote || '0'), 0);
    const totalRevenue = totalTransactionFees;

    const metrics: DashboardMetrics = {
      totalRevenue,
      totalUsers: userCount,
      totalTrades,
      activeTrades,
      totalDeposits,
      pendingDeposits,
      winRate,
      averageTradeAmount,
    };

    return metrics;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

export const fetchTradeStats = async (): Promise<TradeStats> => {
  try {
    // Fetch all trades to calculate real stats
    const tradesResponse = await api.get('/trades');
    const trades = tradesResponse.data.data;
    
    const totalTrades = trades.length;
    const winTrades = trades.filter((trade: any) => trade.winLoseStatus === 'WIN').length;
    const loseTrades = trades.filter((trade: any) => trade.winLoseStatus === 'LOSE').length;
    const neutralTrades = trades.filter((trade: any) => trade.winLoseStatus === 'NA').length;
    const totalVolume = trades.reduce((sum: number, trade: any) => sum + parseFloat(trade.tradingAmountQuote || '0'), 0);
    const averageTradeAmount = totalTrades > 0 ? totalVolume / totalTrades : 0;

    const stats: TradeStats = {
      totalTrades,
      winTrades,
      loseTrades,
      neutralTrades,
      totalVolume,
      averageTradeAmount,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching trade stats:', error);
    throw error;
  }
};

export const fetchTradeTimeSeries = async (
  period: 'day' | 'week' | 'month' = 'week'
): Promise<TradeTimeSeries> => {
  try {
    // Fetch all trades to create real time series data
    const tradesResponse = await api.get('/trades', { params: { period } });
    const trades = tradesResponse.data.data;

    // Group trades by date
    const groupTradesByDate = (trades: any[]) => {
      const grouped: { [key: string]: any[] } = {};
      
      trades.forEach(trade => {
        const date = new Date(trade.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(trade);
      });
      
      return grouped;
    };

    const groupedTrades = groupTradesByDate(trades);
    
    // Convert grouped data to time series format
    const createTimeSeriesData = (groupedData: { [key: string]: any[] }, valueKey: string) => {
      return Object.entries(groupedData).map(([date, trades]) => ({
        date,
        value: trades.reduce((sum: number, trade: any) => sum + parseFloat(trade[valueKey] || '0'), 0)
      }));
    };

    // Create time series data for different metrics
    const tradesData = createTimeSeriesData(groupedTrades, 'tradingAmountQuote');
    const volumeData = createTimeSeriesData(groupedTrades, 'tradingAmountQuote');
    const profitData = createTimeSeriesData(groupedTrades, 'expectedProfitQuote');

    return {
      trades: tradesData,
      volume: volumeData,
      profit: profitData,
    };
  } catch (error) {
    console.error('Error fetching trade time series:', error);
    // Return empty arrays instead of mock data
    return {
      trades: [],
      volume: [],
      profit: [],
    };
  }
};

export const fetchAllWithdrawals = async (): Promise<PaginatedResponse<AdminWithdrawal>> => {
  try {
  const response = await api.get('withdrawals');
    return response.data;
  } catch (error) {
    console.error('Error fetching all withdrawals:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const updateWithdrawalStatus = async (withdrawalId: string, status: string, adminNotes?: string, transactionHash?: string): Promise<AdminWithdrawal> => {
  try {
    const payload: any = { status, adminNotes };
    if (transactionHash) {
      payload.transactionHash = transactionHash;
    }
  const response = await api.patch(`withdrawals/${withdrawalId}`, payload);
    return response.data.data;
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

export const fetchAllTransfers = async (params?: TransferQueryParams): Promise<PaginatedResponse<Transfer>> => {
  try {
    const response = await api.get('/transfers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all transfers:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

// New API functions for admin pages
export const getDeposits = async (): Promise<AdminDeposit[]> => {
  const response = await api.get('/deposits');
  return response.data.data;
};

export const getWithdrawals = async (): Promise<AdminWithdrawal[]> => {
  const response = await api.get('withdrawals');
  return response.data.data;
};

export const getTransfers = async (): Promise<Transfer[]> => {
  const response = await api.get('/transfers');
  return response.data.data;
};

// User management API functions
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data.data;
};

export const fetchAllCryptocurrencies = async (): Promise<Cryptocurrency[]> => {
  const response = await api.get('/cryptocurrencies');
  return response.data.data;
};

export const fetchCryptocurrencyById = async (id: number): Promise<Cryptocurrency> => {
  const response = await api.get(`/cryptocurrencies/${id}`);
  return response.data.data;
};

export const createCryptocurrency = async (payload: CreateCryptoRequest): Promise<Cryptocurrency> => {
  const response = await api.post('/cryptocurrencies', payload);
  return response.data.data;
};

export const updateCryptocurrency = async (id: number, payload: CreateCryptoRequest): Promise<Cryptocurrency> => {
  const response = await api.patch(`/cryptocurrencies/${id}`, payload);
  return response.data.data;
};

export const deleteCryptocurrency = async (id: number): Promise<void> => {
  await api.delete(`/cryptocurrencies/${id}`);
};
