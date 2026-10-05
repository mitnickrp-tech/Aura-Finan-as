export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  avatarUrl?: string;
  pin?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
