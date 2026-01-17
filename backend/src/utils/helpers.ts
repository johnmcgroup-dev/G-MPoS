import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: any, expiresIn?: string): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: expiresIn || process.env.JWT_EXPIRATION || '24h'
  });
};

export const calculateVAT = (amount: number, vatPercentage: number = 7.5): number => {
  return Number((amount * vatPercentage / 100).toFixed(2));
};

export const calculateTotalWithVAT = (amount: number, vatPercentage: number = 7.5): { vatAmount: number; totalAmount: number } => {
  const vatAmount = calculateVAT(amount, vatPercentage);
  return {
    vatAmount,
    totalAmount: Number((amount + vatAmount).toFixed(2))
  };
};

export const generateInvoiceNumber = (prefix: string = 'INV'): string => {
  return `${prefix}-${Date.now()}`;
};

export const generateBarcode = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
