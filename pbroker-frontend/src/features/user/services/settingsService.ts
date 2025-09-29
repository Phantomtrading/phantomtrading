import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type UpdateUserProfileRequest, type ChangePasswordRequest } from '../api/userApi';
import { changePassword } from '../api/userApi';
import { useAuthStore } from '../../auth/store/store';
import { toast } from 'sonner';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => userApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.status === 'success' && response.data && user) {
        const updatedUser = {
          ...user,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          balance: parseFloat(response.data.balance),
        };
        setUser(updatedUser);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast.success(response.message || 'Profile updated successfully');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}; 