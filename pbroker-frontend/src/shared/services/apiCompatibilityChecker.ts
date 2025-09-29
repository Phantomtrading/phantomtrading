/**
 * API Compatibility Checker
 * Validates that frontend API implementations match backend expectations
 */

import { api } from '../../features/auth/services/axiosClient';

interface APICompatibilityReport {
  endpoint: string;
  method: string;
  status: 'compatible' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
}

export class APICompatibilityChecker {
  private static readonly CRITICAL_ENDPOINTS = [
    // Authentication
    { path: '/api/auth/signup', method: 'POST' },
    { path: '/api/auth/signin', method: 'POST' },
    { path: '/api/auth/refresh-token', method: 'POST' },
    
    // User Management
    { path: '/api/users', method: 'GET' },
    { path: '/api/users/:id', method: 'GET' },
    { path: '/api/users/:id', method: 'PATCH' },
    
    // Trading
    { path: '/api/trades', method: 'POST' },
    { path: '/api/trades', method: 'GET' },
    { path: '/api/trades/:id', method: 'PATCH' },
    { path: '/api/trades/user/:userId', method: 'GET' },
    
    // Trading Pairs
    { path: '/api/trading-pair-settings', method: 'GET' },
    { path: '/api/trading-pair-settings', method: 'POST' },
    { path: '/api/trading-pair-settings/:id', method: 'PATCH' },
    { path: '/api/trading-pair-settings/:id', method: 'DELETE' },
    
    // Trade Options (Admin only)
    { path: '/api/trade-options', method: 'GET' },
    { path: '/api/trade-options', method: 'POST' },
    { path: '/api/trade-options/:id', method: 'PATCH' },
    { path: '/api/trade-options/:id', method: 'DELETE' },
    
    // Arbitrage Products
    { path: '/api/arbitrage/products', method: 'GET' },
    { path: '/api/arbitrage/products', method: 'POST' },
    { path: '/api/arbitrage/products/:id', method: 'PATCH' },
    { path: '/api/arbitrage/products/:id', method: 'DELETE' },
    
    // Arbitrage Orders
    { path: '/api/arbitrage/orders', method: 'POST' },
    { path: '/api/arbitrage/orders', method: 'GET' },
    { path: '/api/arbitrage/orders/user', method: 'GET' },
    { path: '/api/arbitrage/orders/:id/cancel', method: 'PATCH' },
    
    // Arbitrage Transactions
    { path: '/api/arbitrage/transactions', method: 'GET' },
    { path: '/api/arbitrage/transactions/:id', method: 'GET' },
    { path: '/api/arbitrage/transactions/earned/total', method: 'GET' },
    
    // Wallets
    { path: '/api/wallets/balances', method: 'GET' },
    { path: '/api/wallets/self-transfer', method: 'POST' },
    
    // Market Data
    { path: '/api/market-data', method: 'GET' },
    { path: '/api/market-data/:id', method: 'GET' },
    
    // Cryptocurrencies
    { path: '/api/cryptocurrencies', method: 'GET' },
    
    // Deposits & Withdrawals
    { path: '/api/deposits', method: 'POST' },
    { path: '/api/deposits', method: 'GET' },
    { path: '/api/deposits/:id/status', method: 'PATCH' },
    { path: '/api/withdrawals', method: 'POST' },
    { path: '/api/withdrawals', method: 'GET' },
  ];

  /**
   * Check if an endpoint is accessible and returns expected structure
   */
  private static async checkEndpoint(endpoint: { path: string; method: string; requiresAuth?: boolean; }): Promise<APICompatibilityReport> {
    const report: APICompatibilityReport = {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: 'compatible',
      issues: [],
      recommendations: []
    };

    try {
      // For GET endpoints that don't require parameters, try to fetch
      if (endpoint.method === 'GET' && !endpoint.path.includes(':')) {
        const response = await api.get(endpoint.path.replace('/api', ''));
        
        // Check response structure
        if (!response.data || typeof response.data !== 'object') {
          report.status = 'error';
          report.issues.push('Response does not have expected data structure');
        }

        if (!response.data.status || !response.data.code || !response.data.message) {
          report.status = 'warning';
          report.issues.push('Missing standard API response fields (status, code, message)');
          report.recommendations.push('Ensure response follows StandardAPIResponse structure');
        }
      }
    } catch (error: any) {
      // 401/403 errors are expected for auth-protected endpoints without proper tokens
      if (error.response?.status === 401 || error.response?.status === 403) {
        report.recommendations.push('Endpoint requires authentication - this is expected');
      } else if (error.response?.status === 404) {
        report.status = 'error';
        report.issues.push('Endpoint not found - may not be implemented');
      } else {
        report.status = 'warning';
        report.issues.push(`Request failed: ${error.message}`);
      }
    }

    return report;
  }

  /**
   * Run comprehensive compatibility check
   */
  static async runCompatibilityCheck(): Promise<APICompatibilityReport[]> {
    const reports: APICompatibilityReport[] = [];
    
    console.log('🔍 Running API Compatibility Check...');
    
    for (const endpoint of this.CRITICAL_ENDPOINTS) {
      const report = await this.checkEndpoint(endpoint);
      reports.push(report);
      
      // Log issues immediately
      if (report.issues.length > 0) {
        console.warn(`⚠️  ${report.method} ${report.endpoint}:`, report.issues);
      }
    }

    // Summary
    const errorCount = reports.filter(r => r.status === 'error').length;
    const warningCount = reports.filter(r => r.status === 'warning').length;
    const compatibleCount = reports.filter(r => r.status === 'compatible').length;

    console.log('\n📊 API Compatibility Summary:');
    console.log(`✅ Compatible: ${compatibleCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    return reports;
  }

  /**
   * Validate specific API responses match backend structure
   */
  static validateResponseStructure(response: any, expectedFields: string[]): string[] {
    const issues: string[] = [];
    
    if (!response || typeof response !== 'object') {
      issues.push('Response is not an object');
      return issues;
    }

    for (const field of expectedFields) {
      if (!(field in response)) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    return issues;
  }

  /**
   * Check if frontend types match backend enums
   */
  static validateEnumValues(frontendValues: string[], backendEnum: Record<string, string>, enumName: string): string[] {
    const issues: string[] = [];
    const backendValues = Object.values(backendEnum);

    for (const value of frontendValues) {
      if (!backendValues.includes(value)) {
        issues.push(`Invalid ${enumName} value: ${value}. Expected one of: ${backendValues.join(', ')}`);
      }
    }

    return issues;
  }
}
