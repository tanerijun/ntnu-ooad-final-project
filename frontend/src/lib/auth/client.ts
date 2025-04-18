'use client';

import type { User } from '@/types/user';
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
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Registration failed' };
      }

      localStorage.setItem('access-token', data.token);
      return {};
    } catch (error) {
      logger.error('Registration error:', error);
      return { error: 'Registration failed' };
    }
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Invalid credentials' };
      }

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
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access-token');
          return { data: null };
        }
        logger.error('Failed to fetch user data:', response.status);
        return { error: 'Failed to fetch user data' };
      }

      const { user } = await response.json();
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
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { error: 'Logout failed' };
      }

      localStorage.removeItem('access-token');
      return {};
    } catch (error) {
      logger.error('Error during logout:', error);
      return { error: 'Logout failed' };
    }
  }
}

export const authClient = new AuthClient();
