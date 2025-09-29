import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from '../../auth/store/store';
import { getUserTrades } from '../services/tradingService';
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign, TrendingUp, AlertCircle, ArrowLeft, Trophy, ThumbsDown } from 'lucide-react';
import type { TradeResponse } from '../api/userApi';
import { useNavigate } from 'react-router-dom';

const TradeHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [hiddenStatusTradeId, setHiddenStatusTradeId] = useState<string | null>(null);
  const [_, setForceRerender] = useState(0);

  const { data: trades, isLoading } = useQuery({
    queryKey: ['userTrades', user?.id],
    queryFn: () => getUserTrades(user?.id ?? 0),
    enabled: !!user?.id
  });

  useEffect(() => {
    const lastTradeInfo = localStorage.getItem('lastTradeInfo');
    if (lastTradeInfo) {
      try {
        const { tradeId, createdAt, tradeExpirationTimeSeconds } = JSON.parse(lastTradeInfo);
        const created = new Date(createdAt).getTime();
        const expires = created + tradeExpirationTimeSeconds * 1000;
        const now = Date.now();
        if (now < expires) {
          setHiddenStatusTradeId(tradeId);
          const timeout = setTimeout(() => {
            setHiddenStatusTradeId(null);
            localStorage.removeItem('lastTradeInfo');
            setForceRerender(x => x + 1);
          }, expires - now + 100);
          return () => clearTimeout(timeout);
        } else {
          localStorage.removeItem('lastTradeInfo');
        }
      } catch {
        localStorage.removeItem('lastTradeInfo');
      }
    } else {
      setHiddenStatusTradeId(null);
    }
  }, [trades]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
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

  const getWinLoseDisplay = (winLoseStatus: string | undefined) => {
    if (!winLoseStatus || winLoseStatus === 'NA') return null;
    if (winLoseStatus.toLowerCase().includes('win')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 ml-2">
          <Trophy className="h-4 w-4 mr-1" />
          {winLoseStatus}
        </span>
      );
    }
    if (winLoseStatus.toLowerCase().includes('lose')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 ml-2">
          <ThumbsDown className="h-4 w-4 mr-1" />
          {winLoseStatus}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/user/trade-chart')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chart</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Trades</CardTitle>
          <CardDescription>View and manage your trading activities</CardDescription>
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
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{trade.tradingPair}</h3>
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
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(trade.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hiddenStatusTradeId === trade.id ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-1 text-yellow-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Pending...
                        </span>
                      ) :
                        (!(trade.tradeStatus === 'RESOLVED' && (trade.winLoseStatus === 'WIN' || trade.winLoseStatus === 'LOSE')) && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.tradeStatus)}`}>{trade.tradeStatus}</span>
                        ))}
                      {hiddenStatusTradeId === trade.id ? null : getWinLoseDisplay(trade.winLoseStatus)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                        <span className={`font-medium ${
                          trade.expectedProfitQuote >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.expectedProfitQuote}
                        </span>
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
                      <p className="text-sm text-yellow-700">
                        This trade will expire in {trade.tradeExpirationTimeSeconds} seconds
                      </p>
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

export default TradeHistoryPage; 