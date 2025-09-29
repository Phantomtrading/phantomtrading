import { 
  fetchAllUsers, 
  fetchUserCount, 
  fetchUserById, 
  updateUserInfo, 
  promoteUserToAdmin, 
  changeUserPassword 
} from '../api/adminApi';
import type { UpdateUserRequest, ChangePasswordRequest } from '../api/adminApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  count: () => [...userKeys.all, 'count'] as const,
};

export const getAllUsers = async () => {
  return await fetchAllUsers();
};

export const getUserCount = async () => {
  return await fetchUserCount();
};

export const getUserById = async (id: number) => {
  return await fetchUserById(id);
};

export const updateUser = async (id: number, data: UpdateUserRequest) => {
  return await updateUserInfo(id, data);
};

export const promoteToAdmin = async (id: number) => {
  return await promoteUserToAdmin(id);
};

export const changePassword = async (data: ChangePasswordRequest) => {
  return await changeUserPassword(data);
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: getAllUsers,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) =>
      updateUserInfo(userId, data),
    onMutate: ({ userId }) => {
      return { userId };
    },
    onSuccess: (updatedUser, { userId }) => {
      queryClient.setQueryData(['admin-users'], (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((user: any) =>
            user.id === userId ? { ...user, ...updatedUser } : user
          )
        };
      });
      toast.success('User updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });
}; 