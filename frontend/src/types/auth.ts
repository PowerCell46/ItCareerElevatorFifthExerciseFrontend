export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  user?: User;
}

export interface DecodedToken {
  sub: string; // user id or username
  exp: number; // expiration timestamp
  iat?: number; // issued at timestamp
  [key: string]: any; // allow other claims
}
