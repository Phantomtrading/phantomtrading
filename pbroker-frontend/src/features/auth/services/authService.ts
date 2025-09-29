import { api } from './axiosClient';
import type { User } from '../types';

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

interface VerifyEmailResponse {
  status: string;
  code: string;
  message: string;
}

export class AuthService {
  signup(firstName: string, lastName: string, email: string, phoneNumber: string, password: string): Promise<SignupResponse> {
    console.log('Signup Request:', { firstName, lastName, email, phoneNumber });
    return api.post('/auth/signup', { firstName, lastName, email, phoneNumber, password })
      .then(res => {
        console.log('Signup Response:', res.data);
        return res.data.data;
      })
      .catch(error => {
        console.error('Signup Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }

  login(email: string, password: string): Promise<User> {
    console.log('Login Request:', { email });
    return api.post('/auth/signin', { email, password })
      .then(res => {
        console.log('Login Response:', res.data);
        return {
          ...res.data.data.user,
          accessToken: res.data.data.accessToken,
          refreshToken: res.data.data.refreshToken
        };
      })
      .catch(error => {
        console.error('Login Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }

  verifyEmail(email: string, code: string): Promise<VerifyEmailResponse> {
    console.log('Verify Email Request:', { email, code });
    return api.post('/auth/verify-email', { email, code })
      .then(res => {
        console.log('Verify Email Response:', res.data);
        return res.data;
      })
      .catch(error => {
        console.error('Verify Email Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }

  resendEmailVerification(email: string): Promise<VerifyEmailResponse> {
    console.log('Resend Email Verification Request:', { email });
    return api.post('/auth/resend-email-verification', { email })
      .then(res => {
        console.log('Resend Email Verification Response:', res.data);
        return res.data;
      })
      .catch(error => {
        console.error('Resend Email Verification Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }

  forgotPassword(email: string): Promise<VerifyEmailResponse> {
    console.log('Forgot Password Request:', { email });
    return api.post('/auth/forgot-password', { email })
      .then(res => {
        console.log('Forgot Password Response:', res.data);
        return res.data;
      })
      .catch(error => {
        console.error('Forgot Password Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }

  resetPassword(token: string, password: string): Promise<VerifyEmailResponse> {
    console.log('Reset Password Request:', { token });
    return api.patch('/auth/reset-password', { token, password })
      .then(res => {
        console.log('Reset Password Response:', res.data);
        return res.data;
      })
      .catch(error => {
        console.error('Reset Password Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }

  logout(): void {
    // Clear any stored tokens or user data
    localStorage.removeItem('auth-storage');
    console.log('User logged out');
  }
}
