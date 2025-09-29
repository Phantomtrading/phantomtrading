import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeposits, getWithdrawals, getTransfers, updateDepositStatus, updateWithdrawalStatus } from '../api/adminApi';
import { toast } from 'sonner';

export const useDeposits = () => {
  return useQuery({
    queryKey: ['admin-deposits'],
    queryFn: getDeposits,
  });
};

export const useWithdrawals = () => {
  return useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: getWithdrawals,
  });
};

export const useTransfers = () => {
  return useQuery({
    queryKey: ['admin-transfers'],
    queryFn: getTransfers,
  });
};

export const useUpdateDepositStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ depositId, status, adminNotes }: { depositId: string; status: string; adminNotes?: string }) =>
      updateDepositStatus(depositId, status, adminNotes),
    onSuccess: (updatedDeposit, { depositId }) => {
      queryClient.setQueryData(['admin-deposits'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((deposit: any) =>
          deposit.id === depositId ? { ...deposit, ...updatedDeposit } : deposit
        );
      });
      toast.success('Deposit status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update deposit status');
    },
  });
};

export const useUpdateWithdrawalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, status, adminNotes, transactionHash }: { 
      withdrawalId: string; 
      status: string; 
      adminNotes?: string; 
      transactionHash?: string; 
    }) =>
      updateWithdrawalStatus(withdrawalId, status, adminNotes, transactionHash),
    onSuccess: (updatedWithdrawal, { withdrawalId }) => {
      queryClient.setQueryData(['admin-withdrawals'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((withdrawal: any) =>
          withdrawal.id === withdrawalId ? { ...withdrawal, ...updatedWithdrawal } : withdrawal
        );
      });
      toast.success('Withdrawal status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update withdrawal status');
    },
  });
}; 