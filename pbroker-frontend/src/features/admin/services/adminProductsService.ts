import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchArbitrageTransactions,
  fetchTransactionById,
  type CreateProductRequest,
  type UpdateProductRequest,
} from '../api/adminProductsApi';

// Use real API calls - no mock data
export const useAdminProducts = (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['adminProducts', params],
    queryFn: () => fetchAdminProducts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData: CreateProductRequest) => {
      return createProduct(productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product created successfully!');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to create product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  });
};

// Product update hook
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => {
      return updateProduct(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to delete product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  });
};

export const useAdminTransactions = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['adminTransactions', params],
    queryFn: () => fetchArbitrageTransactions(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminTransactionById = (id: string) => {
  return useQuery({
    queryKey: ['adminTransaction', id],
    queryFn: () => fetchTransactionById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
