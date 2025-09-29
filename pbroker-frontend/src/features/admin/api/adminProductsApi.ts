import { api } from '../../auth/services/axiosClient';

export interface AdminProduct {
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

export interface CreateProductRequest {
  code: string;
  name: string;
  description: string;
  durationDays: number;
  isActive?: boolean;
  dailyRoiRate: number | string; // Backend accepts number or string, converts to Decimal
  minInvestment: number | string; // Backend accepts number or string, converts to Decimal
  maxInvestment: number | string; // Backend accepts number or string, converts to Decimal
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface AdminTransaction {
  id: string;
  orderId: string;
  userId: string;
  currency: string;
  amount: number;
  type: 'INTEREST' | 'PRINCIPAL_RETURN';
  transactionDate: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  productName: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export interface PaginatedProductsResponse {
  status: string;
  code: string;
  message: string;
  data: AdminProduct[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginatedTransactionsResponse {
  status: string;
  code: string;
  message: string;
  data: AdminTransaction[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Admin Product API Functions
export const fetchAdminProducts = async (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}): Promise<PaginatedProductsResponse> => {
  try {
    const response = await api.get('/arbitrage/products', { 
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...(params?.isActive !== undefined && { isActive: params.isActive })
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin products:', error);
    throw error;
  }
};

export const createProduct = async (productData: CreateProductRequest): Promise<AdminProduct> => {
  try {
    const response = await api.post('/arbitrage/products', productData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: UpdateProductRequest): Promise<AdminProduct> => {
  try {
    const response = await api.patch(`/arbitrage/products/${id}`, productData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/arbitrage/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Transaction API Functions
export const fetchArbitrageTransactions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedTransactionsResponse> => {
  try {
    const response = await api.get('/arbitrage/transactions', { 
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...(params?.status && { status: params.status }),
        ...(params?.type && { type: params.type }),
        ...(params?.userId && { userId: params.userId }),
        ...(params?.startDate && { startDate: params.startDate }),
        ...(params?.endDate && { endDate: params.endDate })
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching arbitrage transactions:', error);
    throw error;
  }
};

export const fetchTransactionById = async (id: string): Promise<AdminTransaction> => {
  try {
    const response = await api.get(`/arbitrage/transactions/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};
