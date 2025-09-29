import { api } from '../../auth/services/axiosClient';

export interface AdminArbitrageOrder {
  id: string;
  userId: number;
  productId: string;
  amount: string;
  dailyRoiRate: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  earnedInterest: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AdminArbitrageOrderQueryParams {
  status?: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  userId?: number;
  from?: string; // Date string
  to?: string; // Date string  
  page?: number;
  limit?: number;
}

export interface PaginatedArbitrageOrdersResponse {
  status: string;
  code: string;
  message: string;
  data: AdminArbitrageOrder[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Fetch all arbitrage orders (Admin only)
export const fetchAllArbitrageOrders = async (params?: AdminArbitrageOrderQueryParams): Promise<PaginatedArbitrageOrdersResponse> => {
  try {
    const response = await api.get('/arbitrage/orders', { 
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...(params?.status && { status: params.status }),
        ...(params?.userId && { userId: params.userId }),
        ...(params?.from && { from: params.from }),
        ...(params?.to && { to: params.to })
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin arbitrage orders:', error);
    throw error;
  }
};

// Fetch arbitrage order by ID (Admin)
export const fetchArbitrageOrderById = async (orderId: string): Promise<AdminArbitrageOrder> => {
  try {
    const response = await api.get(`/arbitrage/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching arbitrage order by ID:', error);
    throw error;
  }
};
