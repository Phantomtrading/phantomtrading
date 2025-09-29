/**
 * API Status Validation and Response Helpers
 * Ensures frontend API calls match backend structure exactly
 */

// Standard API Response Structure from Backend
export interface StandardAPIResponse<T = any> {
  status: 'success' | 'error';
  code: string;
  message: string;
  data?: T;
  meta?: {
    [key: string]: any;
    pagination?: PaginationMeta;
  };
  error?: {
    details?: any;
    stack?: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Enum mappings from Backend
export const WalletTypes = {
  TRADING: 'TRADING',
  ARBITRAGE: 'ARBITRAGE'
} as const;

export const TradeStatus = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED'
} as const;

export const WinLoseStatus = {
  NA: 'NA',
  WIN: 'WIN',
  LOSE: 'LOSE'
} as const;

export const ArbitrageOrderStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export const ArbitrageTransactionType = {
  INTEREST: 'INTEREST',
  PRINCIPAL_RETURN: 'PRINCIPAL_RETURN'
} as const;

export const ArbitrageTransactionStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
} as const;

export const TransactionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN'
} as const;

export const TradeType = {
  BUY: 'BUY',
  SELL: 'SELL'
} as const;

export const DemoMode = {
  NEUTRAL: 'NEUTRAL',
  WIN: 'WIN',
  LOSE: 'LOSE'
} as const;

// Type helpers for better type safety
export type WalletType = keyof typeof WalletTypes;
export type TradeStatusType = keyof typeof TradeStatus;
export type WinLoseStatusType = keyof typeof WinLoseStatus;
export type ArbitrageOrderStatusType = keyof typeof ArbitrageOrderStatus;
export type ArbitrageTransactionTypeType = keyof typeof ArbitrageTransactionType;
export type ArbitrageTransactionStatusType = keyof typeof ArbitrageTransactionStatus;
export type TransactionStatusType = keyof typeof TransactionStatus;
export type UserRoleType = keyof typeof UserRole;
export type TradeTypeType = keyof typeof TradeType;
export type DemoModeType = keyof typeof DemoMode;

/**
 * Helper to validate API response structure
 */
export function validateAPIResponse<T>(response: any): StandardAPIResponse<T> {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response structure');
  }

  if (!('status' in response) || !('code' in response) || !('message' in response)) {
    throw new Error('Missing required response fields');
  }

  return response as StandardAPIResponse<T>;
}

/**
 * Helper to extract data from API response safely
 */
export function extractDataFromResponse<T>(response: any): T {
  const validatedResponse = validateAPIResponse<T>(response);
  return validatedResponse.data as T;
}

/**
 * Helper to extract paginated data from API response
 */
export function extractPaginatedDataFromResponse<T>(response: any): {
  data: T[];
  pagination: PaginationMeta;
} {
  const validatedResponse = validateAPIResponse<T[]>(response);
  
  if (!validatedResponse.meta?.pagination) {
    throw new Error('Missing pagination metadata in response');
  }

  return {
    data: validatedResponse.data || [],
    pagination: validatedResponse.meta.pagination
  };
}
