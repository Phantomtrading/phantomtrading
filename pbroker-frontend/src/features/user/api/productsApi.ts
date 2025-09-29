import { api } from '../../auth/services/axiosClient';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  durationDays: number;
  isActive: boolean;
  dailyRoiRate: number;
  minInvestment: number;
  maxInvestment: number;
  createdAt: string;
  updatedAt: string;
}

export interface HostingOrder {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  currency: string;
  amount: number;
  dailyRoiRate: number;
  durationDays: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  earnedInterest: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHostingOrderRequest {
  productId: string;
  amount: number | string; // Backend accepts number or string, converts to Decimal
}

export interface ArbitrageTransaction {
  id: string;
  orderId: string;
  userId: string;
  currency: string;
  amount: number;
  type: 'INTEREST' | 'PRINCIPAL_RETURN';
  transactionDate: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface HostingOrderDetails extends HostingOrder {
  product: Product;
  transactions: ArbitrageTransaction[];
  totalInvested: number;
  totalReturned: number;
  currentValue: number;
}

export interface PaginatedProductsResponse {
  status: string;
  code: string;
  message: string;
  data: Product[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginatedOrdersResponse {
  status: string;
  code: string;
  message: string;
  data: HostingOrder[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Types
export interface ProductFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  status: string;
  code: string;
  message: string;
  data: T;
  meta?: {
    pagination: {
      total: number;
      totalPages: number;
      page?: number;
      limit?: number;
    };
  };
}

// API Functions
export const fetchProducts = async (params?: ProductFilters): Promise<ApiResponse<Product[]>> => {
  try {
  const response = await api.get('arbitrage/products', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...(params?.isActive !== undefined && { isActive: params.isActive })
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createHostingOrder = async (orderData: CreateHostingOrderRequest): Promise<HostingOrder> => {
  try {
  const response = await api.post('arbitrage/orders', orderData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating hosting order:', error);
    throw error;
  }
};

export interface ArbitrageOrderQueryParams {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  page?: number;
  limit?: number;
  userId?: number;
}

export const fetchHostingOrders = async (params?: ArbitrageOrderQueryParams): Promise<PaginatedOrdersResponse> => {
  try {
  const response = await api.get('arbitrage/orders/user', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        ...(params?.status && { status: params.status }),
        ...(params?.userId && { userId: params.userId })
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching hosting orders:', error);
    throw error;
  }
};

export const fetchHostingOrderById = async (orderId: string): Promise<HostingOrderDetails> => {
  try {
  const response = await api.get(`arbitrage/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hosting order details:', error);
    throw error;
  }
};

export const cancelHostingOrder = async (orderId: string): Promise<void> => {
  try {
  await api.patch(`arbitrage/orders/${orderId}/cancel`);
  } catch (error) {
    console.error('Error cancelling hosting order:', error);
    throw error;
  }
};

export const getUserTotalEarned = async (): Promise<{ totalEarned: number }> => {
  try {
  const response = await api.get('arbitrage/transactions/earned/total');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user total earned:', error);
    throw error;
  }
};

export const getUserArbitrageTransactions = async (): Promise<ArbitrageTransaction[]> => {
  try {
  const response = await api.get('arbitrage/transactions');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user arbitrage transactions:', error);
    throw error;
  }
};

export const getArbitrageTransactionById = async (transactionId: string): Promise<ArbitrageTransaction> => {
  try {
  const response = await api.get(`arbitrage/transactions/${transactionId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching arbitrage transaction by ID:', error);
    throw error;
  }
};
