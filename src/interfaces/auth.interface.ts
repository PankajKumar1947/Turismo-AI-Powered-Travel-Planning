export interface AuthUser {
  id: string;
  name: string;
  email: string;
  preferences: {
    categories: string[];
    budgetRange?: string;
  };
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface MeResponse {
  success: boolean;
  data: AuthUser;
}
