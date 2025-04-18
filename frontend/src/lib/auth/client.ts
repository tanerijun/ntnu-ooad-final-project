'use client';

import type { User } from '@/types/user';
import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/default-logger';

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  message?: string;
}

interface MeResponse {
  user: User;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      const data = await apiClient.post<AuthResponse>('/register', params);
      localStorage.setItem('access-token', data.token);
      return {};
    } catch (error) {
      logger.error('Registration error:', error);
      return { error: 'Registration failed' };
    }
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const data = await apiClient.post<AuthResponse>('/login', params);
      localStorage.setItem('access-token', data.token);
      return {};
    } catch (error) {
      logger.error('Authentication error:', error);
      return { error: 'Authentication failed' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('access-token');
    if (!token) {
      return { data: null };
    }

    try {
      const { user } = await apiClient.get<MeResponse>('/me');
      return { data: user };
    } catch (error) {
      logger.error('Error fetching user data:', error);
      return { error: 'Failed to fetch user data' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    const token = localStorage.getItem('access-token');

    if (!token) {
      return {};
    }

    try {
      await apiClient.delete('/logout');
      localStorage.removeItem('access-token');
      return {};
    } catch (error) {
      logger.error('Error during logout:', error);
      return { error: 'Logout failed' };
    }
  }

  async updateProfile(data: { name: string; email: string }): Promise<{ error?: string }> {
    try {
      await apiClient.put<{ user: User }>('/profile', data);
      return {};
    } catch (error) {
      logger.error('Profile update error:', error);
      return { error: 'Failed to update profile' };
    }
  }
}

export const authClient = new AuthClient();
