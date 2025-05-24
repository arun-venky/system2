import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user.model.js';

interface TokenPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Generate access token
export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = { id: user.id };
  const options: SignOptions = { 
    expiresIn: (process.env.JWT_EXPIRATION || '1h') as jwt.SignOptions['expiresIn']
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    options
  );
};

// Generate refresh token
export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = { id: user.id };
  const options: SignOptions = { 
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRATION || '7d') as jwt.SignOptions['expiresIn']
  };
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    options
  );
};

// Parse user data for response (exclude sensitive information)
export const parseUser = (user: IUser) => {
  const { id, username, email, role, createdAt, updatedAt } = user;
  return { id, username, email, role, createdAt, updatedAt };
};