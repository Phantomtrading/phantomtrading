import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../api/userApi';

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}; 