import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hideTawkWidget, showTawkWidget } from '../../tawk/domain/usecases/initTawk';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { getAllTrades, updateTrade, type TradeQueryParams } from '../services/tradingService';
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign, Search } from 'lucide-react';
import type { AdminTrade } from '../api/adminApi';
// import type { TradeStatus } from '../../user/api/userApi';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';

const TradesPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Hide Tawk widget on this page
    hideTawkWidget();
    
    return () => {
      // Show Tawk widget when leaving this page (if it should be visible)
      if (window.tawkShouldBeVisible) {
        showTawkWidget();
      }
    };
  }, []);
  const [filters, setFilters] = useState<TradeQueryParams>({
    page: 1,
    limit: 10,
    status: 'all',
    search: ''
  });
  const [updatingTradeId, setUpdatingTradeId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; tradeId: string | null; action: 'WIN' | 'LOSE' | 'CANCEL' | null }>({ open: false, tradeId: null, action: null });

  const { data: tradesData, isLoading } = useQuery({
    queryKey: ['adminTrades', filters],
    queryFn: () => getAllTrades(filters)
  });

  const updateTradeMutation = useMutation({
    mutationFn: ({ tradeId, data }: { tradeId: string; data: { tradeStatus?: string; winLoseStatus?: 'WIN' | 'LOSE' } }) =>
      updateTrade(tradeId, data),
    onMutate: ({ tradeId }) => {
      setUpdatingTradeId(tradeId);
    },
    onSuccess: (updatedTrade, { tradeId }) => {
      queryClient.setQueryData(['adminTrades', filters], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((trade: AdminTrade) =>
            trade.id === tradeId ? { ...trade, ...updatedTrade } : trade
          )
        };
      });
      toast.success('Trade updated successfully');
    },
    onError: () => {
      toast.error('Failed to update trade');
    },
    onSettled: () => {
      setUpdatingTradeId(null);
    }
  });

  const handleConfirm = async () => {
    if (!confirmDialog.tradeId || !confirmDialog.action) return;
    if (confirmDialog.action === 'WIN' || confirmDialog.action === 'LOSE') {
      updateTradeMutation.mutate({ tradeId: confirmDialog.tradeId, data: { tradeStatus: 'RESOLVED', winLoseStatus: confirmDialog.action } });
    } else if (confirmDialog.action === 'CANCEL') {
      updateTradeMutation.mutate({ tradeId: confirmDialog.tradeId, data: { tradeStatus: 'CANCELLED' } });
    }
    setConfirmDialog({ open: false, tradeId: null, action: null });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <main className="flex w-full flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search trades..."
                value={filters.search}
                onChange={handleSearch}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Trades</CardTitle>
            <CardDescription>Manage and monitor all trading activities</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-2 md:p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : tradesData?.data.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No trades found</p>
              </div>
            ) : (
              <div className="space-y-4 min-w-[320px]">
                {tradesData?.data.map((trade: AdminTrade) => (
                  <div
                    key={trade.id}
                    className={`p-2 md:p-4 border rounded-lg transition-colors relative ${
                      updatingTradeId === trade.id ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'
                    }`}
                  >
                    {updatingTradeId === trade.id && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      </>
                    )}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-2 md:space-y-0 md:space-x-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-sm md:text-base">{trade.tradingPair}</h3>
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
                        <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(trade.createdAt)}</span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          User: {trade.user.firstName} {trade.user.lastName} ({trade.user.email})
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.tradeStatus)}`}>{trade.tradeStatus}</span>
                        {trade.tradeStatus === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              className="h-8 px-3 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition"
                              onClick={() => setConfirmDialog({ open: true, tradeId: trade.id, action: 'WIN' })}
                              disabled={updatingTradeId === trade.id}
                            >
                              Resolve as Win
                            </button>
                            <button
                              className="h-8 px-3 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition"
                              onClick={() => setConfirmDialog({ open: true, tradeId: trade.id, action: 'LOSE' })}
                              disabled={updatingTradeId === trade.id}
                            >
                              Resolve as Lose
                            </button>
                            <button
                              className="h-8 px-3 rounded bg-gray-400 text-white text-xs font-medium hover:bg-gray-500 transition"
                              onClick={() => setConfirmDialog({ open: true, tradeId: trade.id, action: 'CANCEL' })}
                              disabled={updatingTradeId === trade.id}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={confirmDialog.open} onOpenChange={open => setConfirmDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Trade Action</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm">
            {confirmDialog.action === 'WIN' && 'Are you sure you want to resolve this trade as WIN?'}
            {confirmDialog.action === 'LOSE' && 'Are you sure you want to resolve this trade as LOSE?'}
            {confirmDialog.action === 'CANCEL' && 'Are you sure you want to cancel this trade?'}
          </div>
          <DialogFooter>
            <button
              type="button"
              className="h-9 px-4 rounded-lg bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 transition"
              onClick={() => setConfirmDialog({ open: false, tradeId: null, action: null })}
              disabled={updatingTradeId !== null}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-9 px-4 rounded-lg bg-[rgba(0,0,0,0.87)] text-white text-xs font-medium hover:bg-black transition"
              onClick={handleConfirm}
              disabled={updatingTradeId !== null}
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default TradesPage; 