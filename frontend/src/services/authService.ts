import { jwtDecode } from 'jwt-decode';
import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, DecodedToken } from '../types/auth';

class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.isTokenValid();
  }
}

export const authService = new AuthService();
export default authService;
