import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from '../../auth/store/store';
import { getUserTrades } from '../services/tradingService';
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import type { TradeResponse } from '../api/userApi';
import { useNavigate } from 'react-router-dom';

const TradeTransactionPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: trades, isLoading } = useQuery({
    queryKey: ['userTrades', user?.id],
    queryFn: () => getUserTrades(user?.id ?? 0),
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-gray-500">Balance:</span>
            <span className="font-medium">${user?.balance.toLocaleString()}</span>
          </div>
          <Button
            onClick={() => navigate('/user/create-trade')}
            className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Trade</span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Your Trades</CardTitle>
          <CardDescription className="text-xs sm:text-sm">View and manage your trading activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : trades?.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trades found</h3>
              <p className="mt-1 text-sm text-gray-500">Start trading to see your transactions here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trades?.map((trade: TradeResponse) => (
                <div
                  key={trade.id}
                  className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-sm sm:text-base">{trade.tradingPair}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          trade.tradeType === 'BUY' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.tradeType === 'BUY' ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {trade.tradeType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(trade.createdAt)}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.tradeStatus)}`}>{trade.tradeStatus}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium">{trade.tradingAmountQuote} {trade.quoteCurrency}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium">{trade.executionPrice}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Profit:</span>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className={`font-medium ${trade.expectedProfitQuote >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trade.expectedProfitQuote}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Fee:</span>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium">{trade.transactionFeeAmountQuote}</span>
                      </div>
                    </div>
                  </div>
                  {trade.tradeStatus === 'PENDING' && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-yellow-700">This trade will expire in {trade.tradeExpirationTimeSeconds} seconds</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeTransactionPage; 