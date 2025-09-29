import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getWalletBalances,
  selfTransfer,
  type SelfTransferRequest,
} from '../api/walletApi';

// Use real API calls - no mock data
export const useWalletBalances = () => {
  return useQuery({
    queryKey: ['walletBalances'],
    queryFn: getWalletBalances,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSelfTransfer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (transferData: SelfTransferRequest) => {
      console.log('🔄 Starting wallet transfer mutation:', transferData);
      return selfTransfer(transferData);
    },
    onSuccess: (data) => {
      console.log('✅ Wallet transfer mutation success:', data);
      // Invalidate and refetch wallet balances
      queryClient.invalidateQueries({ queryKey: ['walletBalances'] });
      toast.success('Transfer completed successfully!');
    },
    onError: (error: any) => {
      console.error('❌ Wallet transfer mutation error:', {
        error,
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      toast.error(error.message || 'Transfer failed');
    },
  });
};