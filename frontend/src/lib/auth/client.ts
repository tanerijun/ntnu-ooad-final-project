'use client';

import type { User } from '@/types/user';
import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/default-logger';

export interface SignUpParams {
  firstName: string;
  lastName: string;
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
  private baseUrl: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('Error initializing AuthClient:NEXT_PUBLIC_API_URL is not defined');
    }
    this.baseUrl = baseUrl;
  }

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
}

export const authClient = new AuthClient();
