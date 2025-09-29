import { api } from '../../auth/services/axiosClient';

export interface WalletBalance {
  trading: {
    balance: string;
    locked: string;
    total: string;
  };
  arbitrage: {
    balance: string;
    locked: string;
    total: string;
  };
  totalOverall: string;
}

export interface SelfTransferRequest {
  from: 'TRADING' | 'ARBITRAGE';
  to: 'TRADING' | 'ARBITRAGE';
  amount: string;
}

export interface SelfTransferResponse {
  status: string;
  message: string;
  data: {
    fromBalance: string;
    toBalance: string;
    transferredAmount: string;
  };
}

// API Functions
export const getWalletBalances = async (): Promise<WalletBalance> => {
  try {
  const response = await api.get('wallets/balances');
    const data = response.data.data;

    // Convert Decimal values to strings
    return {
      trading: {
        balance: data.trading.balance?.toString() || '0.00',
        locked: data.trading.locked?.toString() || '0.00',
        total: data.trading.total?.toString() || '0.00',
      },
      arbitrage: {
        balance: data.arbitrage.balance?.toString() || '0.00',
        locked: data.arbitrage.locked?.toString() || '0.00',
        total: data.arbitrage.total?.toString() || '0.00',
      },
      totalOverall: data.totalOverall?.toString() || '0.00',
    };
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    throw error;
  }
};

export const selfTransfer = async (transferData: SelfTransferRequest): Promise<SelfTransferResponse> => {
  try {
    console.log('💸 Wallet Transfer Request:', {
  endpoint: 'wallets/self-transfer',
      data: transferData,
      timestamp: new Date().toISOString()
    });
  const response = await api.post('wallets/self-transfer', transferData);
    console.log('💰 Wallet Transfer Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Wallet Transfer Error:', {
      error: error,
      requestData: transferData,
  endpoint: 'wallets/self-transfer'
    });
    throw error;
  }
};
