import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  return jwt.sign(payload, secret, { 
    expiresIn: '7d' 
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.verify(token, secret) as TokenPayload;
};

