import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/store';
import { toast } from 'sonner';
import {
  fetchProducts,
  createHostingOrder,
  fetchHostingOrders,
  fetchHostingOrderById,
  type CreateHostingOrderRequest,
  type ProductFilters
} from '../api/productsApi';

// Use real API calls - no mock data
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useHostingOrders = (page: number = 1, limit: number = 10) => {
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['hostingOrders', user?.id, page, limit],
    queryFn: () => fetchHostingOrders({ page, limit, userId: user?.id }),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useHostingOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['hostingOrder', orderId],
    queryFn: () => fetchHostingOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateHostingOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: CreateHostingOrderRequest) => {
      return createHostingOrder(orderData);
    },
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['hostingOrders'] });
      toast.success('Investment order created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create investment order');
    },
  });
};

export const useActiveProducts = () => {
  return useQuery({
    queryKey: ['activeProducts'],
    queryFn: async () => {
      const response = await fetchProducts({ isActive: true });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
