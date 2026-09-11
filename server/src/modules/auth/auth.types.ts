export interface AuthUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  createdAt: Date;
}

export interface AuthResponse {
  user: AuthUser;
}
