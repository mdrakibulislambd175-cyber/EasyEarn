export enum UserStatus {
  PENDING_ACTIVATION = 'PENDING_ACTIVATION', // User registered but not paid
  PENDING_APPROVAL = 'PENDING_APPROVAL',     // User paid, waiting for admin
  ACTIVE = 'ACTIVE',                         // User approved
  BANNED = 'BANNED'                          // User banned
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string; // In a real app, never store plain text
  role: UserRole;
  status: UserStatus;
  balance: number;
  totalWithdrawn: number;
  activationPayment?: {
    method: string;
    trxId: string;
    date: string;
  };
}

export enum SellPlatform {
  GMAIL = 'GMAIL',
  TELEGRAM = 'TELEGRAM',
  WHATSAPP = 'WHATSAPP',
  FACEBOOK = 'FACEBOOK'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface SellRequest {
  id: string;
  userId: string;
  userEmail: string; // for display convenience
  platform: SellPlatform;
  credentials: string; // "email|pass" or similar
  status: RequestStatus;
  amount: number; // The value of the account
  date: string;
}

export const ADMIN_EMAIL = 'admin@easyearn.com';
export const ADMIN_PASS = 'admin123';
export const PAYMENT_NUMBER = '+8801860333750';

// Price List for Selling Accounts
export const PRICE_LIST: Record<SellPlatform, number> = {
  [SellPlatform.GMAIL]: 15,
  [SellPlatform.TELEGRAM]: 25,
  [SellPlatform.WHATSAPP]: 20,
  [SellPlatform.FACEBOOK]: 10,
};