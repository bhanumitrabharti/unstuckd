import { Request } from "express";

export interface JWTPayload {
  userId: string;
  email?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string;
    type: string;
  };
}

export interface OtpEntry {
  otp: string;
  expiresAt: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
