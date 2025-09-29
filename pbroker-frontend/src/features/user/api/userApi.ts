import axios from 'axios';
import { api } from '../../auth/services/axiosClient';

export interface DepositRequest {
  cryptoId: string;
  amount: number;
  proofOfDeposit: File;
}

export interface WithdrawRequest {
  withdrawalAddress: string;
  amount: number;
}

export interface TransferRequest {
  amount: number;
  recipientIdentifier: string;
}

export interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  address: string;
  expectedMonthlyProfit: number;
}

export interface DepositHistory {
  id: string;
  createdAt: string;
  amount: number;
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  status: string;
  transactionHash?: string;
  proofOfDeposit?: string;
  tradeId: string;
  tradePair: string;
  tradeType: "buy" | "sell";
  currentPrice: number;
  tradeExpirationTime: string;
  tradeAmount: number;
  tradingAmount: number;
  estimatedIncome: number;
}

export interface WithdrawalHistory {
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

export interface CreateDepositRequest {
  userId: number;
  cryptocurrencyId: number;
  amount: number;
  proofOfDepositUrl: string;
  transactionHash?: string;
}

export interface TransferHistory {
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

export interface MarketData {
  id: number;
  name: string;
  symbol: string;
  logoUrl: string;
  price: number;
  change24h: number;
  source:string;
  coingeckoId:string;
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

export type TradeType = 'BUY' | 'SELL';
export type TradeStatus = 'PENDING' | 'RESOLVED' | 'CANCELLED' ;
export type WinLoseStatus = 'NA' | 'WIN' | 'LOSE';

export interface TradeRequest {
  tradingPairId: number;
  tradeOptionId: number;
  tradeType: TradeType;
  tradingAmountQuote: number;
  executionPrice: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
}

export interface TradeResponse {
  id: string;
  userId: number;
  tradingPair: string;
  baseCurrency: string;
  quoteCurrency: string;
  tradeType: TradeType;
  tradingAmountQuote: number;
  tradingAmountBase: number;
  executionPrice: number;
  tradeExpirationTimeSeconds: number;
  potentialProfitPercentage: number;
  expectedProfitQuote: number;
  transactionFeePercentage: number;
  transactionFeeAmountQuote: number;
  tradeStatus: TradeStatus;
  winLoseStatus: WinLoseStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export const processDeposit = async (data: CreateDepositRequest) => {
  try {
    console.log("Deposit request payload:", data);
    const response = await api.post('/deposits', data);
    console.log("Deposit API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating deposit:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to process deposit');
    }
    throw error;
  }
};

export const processWithdrawal = async (data: WithdrawRequest) => {
  try {
    console.log("Withdrawal request payload:", data);
  const response = await api.post('withdrawals', data);
    console.log("Withdrawal API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to process withdrawal');
    }
    throw error;
  }
};

export const processTransfer = async (data: TransferRequest) => {
  try {
    const response = await api.post('/transfers', data);
    return response.data;
  } catch (error) {
    console.error('Error creating transfer:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to process transfer');
    }
    throw error;
  }
};

// Simulate fetching cryptocurrency options from the backend
export const fetchCryptoOptions = async (): Promise<CryptoOption[]> => {
  try {
    console.log("Fetching cryptocurrency options from backend...");
    const response = await api.get('/cryptocurrencies');
    console.log("Cryptocurrency options API response:", response.data);
    const backendCryptoOptions = response.data.data;
    const frontendCryptoOptions: CryptoOption[] = backendCryptoOptions.map((crypto: any) => ({
      id: crypto.id.toString(),
      name: crypto.name,
      symbol: crypto.symbol,
      address: crypto.depositAddress,
      expectedMonthlyProfit: 0,
    }));
    console.log("Cryptocurrency options fetched successfully:", frontendCryptoOptions);
    return frontendCryptoOptions;
  } catch (error) {
    console.error("Error fetching cryptocurrency options:", error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch cryptocurrency options');
    }
    throw error;
  }
};

// Simulate fetching deposit history
export const fetchDepositHistory = async (userId: string | number): Promise<DepositHistory[]> => {
  try {
    const response = await api.get(`/deposits/user/${userId}`);
    const backendDeposits = response.data.data || [];
    const mapped: DepositHistory[] = backendDeposits.map((dep: any) => ({
      id: dep.id,
      createdAt: dep.createdAt,
      amount: dep.amount,
      cryptoId: dep.cryptocurrencyId?.toString() ?? '',
      cryptoName: dep.cryptocurrency?.name ?? '',
      cryptoSymbol: dep.cryptocurrency?.symbol ?? '',
      status: dep.status,
      transactionHash: dep.transactionHash,
      proofOfDeposit: dep.proofOfDepositUrl,
      tradeId: '',
      tradePair: '',
      tradeType: 'buy',
      currentPrice: 0,
      tradeExpirationTime: '',
      tradeAmount: dep.amount,
      tradingAmount: dep.amount,
      estimatedIncome: 0,
    }));
    return mapped;
  } catch (error) {
    console.error('Error fetching deposit history:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch deposit history');
    }
    throw error;
  }
};

export const fetchWithdrawalHistory = async (userId: string | number): Promise<WithdrawalHistory[]> => {
  try {
  const response = await api.get(`withdrawals/user/${userId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch withdrawal history');
    }
    throw error;
  }
};

export const fetchDepositById = async (id: string): Promise<DepositHistory> => {
  try {
    const response = await api.get(`/deposits/${id}`);
    const backendDeposit = response.data.data || response.data;
    return backendDeposit as DepositHistory;
  } catch (error) {
    console.error('Error fetching deposit by id:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch deposit details');
    }
    throw error;
  }
};

export const fetchTransferHistory = async (
  userId: number,
  type: 'sent' | 'received' | 'all' = 'all',
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<TransferHistory>> => {
  try {
    const response = await api.get(`/transfers/user/${userId}`, {
      params: {
        type,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch transfer history');
    }
    throw error;
  }
};

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
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch market data');
    }
    throw error;
  }
};

export const fetchUserById = async (userId: number): Promise<any> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch user data');
    }
    throw error;
  }
};

export const createTrade = async (data: TradeRequest): Promise<TradeResponse> => {
  try {
    const response = await api.post('/trades', data);
    console.log(response);
    return response.data.data;
  } catch (error) {
    console.error('Error creating trade:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to create trade');
    }
    throw error;
  }
}; 

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  demoMode: string;
}

export interface UpdateUserProfileResponse {
  status: string;
  code: string;
  message: string;
  data: {
    id: number;
    email: string;
    emailVerified: boolean;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    balance: string;
    role: string;
  };
}

export const userApi = {
  updateProfile: async (data: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> => {
    const response = await api.patch('/users/change-password', data);
    return response.data;
  },
}; 

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const changePassword = async (data: ChangePasswordRequest) => {
  const response = await api.patch('/users/change-password', data);
  return response.data;
};

/**
 * Upload deposit with proof files (images)
 * @param data - { cryptocurrencyId, amount, transactionHash, proofs }
 * @returns API response
 */
export const uploadDepositWithProofs = async (data: {
  cryptocurrencyId: number;
  amount: number;
  transactionHash: string;
  proofs: File[];
}) => {
  const formData = new FormData();
  formData.append('cryptocurrencyId', String(data.cryptocurrencyId));
  formData.append('amount', String(data.amount));
  formData.append('transactionHash', data.transactionHash);
  data.proofs.forEach(file => {
    formData.append('proofs', file);
  });
  const response = await api.post('/deposits', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get all proof files for a deposit
 */
export const getDepositProofs = async (depositId: string | number): Promise<string[]> => {
  const response = await api.get(`/deposits/${depositId}/proofs`);
  return response.data.data; // adjust if your API returns a different structure
};

/**
 * Add new proof files to a deposit
 */
export const addDepositProofs = async (depositId: string | number, files: File[]): Promise<any> => {
  const formData = new FormData();
  files.forEach(file => formData.append('proofs', file));
  const response = await api.post(`/deposits/${depositId}/proofs`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Download a specific deposit proof file (returns a blob)
 */
export const downloadDepositProof = async (depositId: string | number, fileName: string): Promise<Blob> => {
  const response = await api.get(`/deposits/${depositId}/proofs/${fileName}`, { responseType: 'blob' });
  return response.data;
};

/**
 * Delete a specific deposit proof file
 */
export const deleteDepositProof = async (depositId: string | number, fileName: string): Promise<any> => {
  const response = await api.delete(`/deposits/${depositId}/proofs/${fileName}`);
  return response.data;
};

///all fixed