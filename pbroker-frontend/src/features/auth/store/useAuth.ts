import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/authService';
import { useAuthStore } from './store';
import type { User } from '../types';

interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface SignupResponse {
  code: string;
  id: number;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface VerifyEmailInput {
  email: string;
  code: string;
}

interface VerifyEmailResponse {
  status: string;
  code: string;
  message: string;
}

const service = new AuthService();

export function useSignup() {
  const qc = useQueryClient();
  return useMutation<SignupResponse, Error, SignupInput>({
    mutationFn: async ({ firstName, lastName, email, phoneNumber, password }) => {
      // Only create the user in your backend
      const response = await service.signup(firstName, lastName, email, phoneNumber, password);
      return response;
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useVerifyEmail() {
  const qc = useQueryClient();
  return useMutation<VerifyEmailResponse, Error, VerifyEmailInput>({
    mutationFn: ({ email, code }) => service.verifyEmail(email, code),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useResendEmailVerification() {
  const qc = useQueryClient();
  return useMutation<VerifyEmailResponse, Error, { email: string }>({
    mutationFn: ({ email }) => service.resendEmailVerification(email),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useForgotPassword() {
  const qc = useQueryClient();
  return useMutation<VerifyEmailResponse, Error, { email: string }>({
    mutationFn: ({ email }) => service.forgotPassword(email),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation<VerifyEmailResponse, Error, { token: string; password: string }>({
    mutationFn: ({ token, password }) => service.resetPassword(token, password),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useLogin() {
  const setUser = useAuthStore(state => state.setUser);
  const qc = useQueryClient();

  return useMutation<User, Error, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      const user = await service.login(email, password);
      console.log('Login response from backend:', user);
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries();
    },
  });
}
