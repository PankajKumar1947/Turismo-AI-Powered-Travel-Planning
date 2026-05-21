export interface AuthUser {
  id: string;
  name: string;
  email: string;
  preferences: {
    categories: string[];
    budgetRange?: string;
  };
  isVerified?: boolean;
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

export interface RegisterResponse {
  success: boolean;
  data: {
    email: string;
    isVerified: boolean;
  };
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  data: {
    success: boolean;
    message: string;
  };
  message: string;
}

export interface ResendOtpResponse {
  success: boolean;
  data: {
    success: boolean;
    message: string;
  };
  message: string;
}
