import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, ArrowRight, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransferModal from '../components/TransferModal';
import { useQuery } from '@tanstack/react-query';
import { getMarketData } from '../services/userMarketService';
import { useAuthStore } from '../../auth/store/store';

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { 
    data: marketData, 
    isLoading: isMarketDataLoading,
    isRefetching: isMarketDataRefetching 
  } = useQuery({
    queryKey: ['marketData'],
    queryFn: getMarketData,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    staleTime: 30000,
    gcTime: 30 * 60 * 1000,
  });

  const filteredMarketData = marketData?.data.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mainActions = [
    {
      title: "Deposit",
      description: "Add funds to your account",
      icon: <Plus className="h-5 w-5" />,
      onClick: () => setIsDepositModalOpen(true),
      colorClass: "bg-green-500 hover:bg-green-600",
      stats: {
        label: "Daily Limit",
        value: "$10,000"
      }
    },
    {
      title: "Withdraw",
      description: "Withdraw funds from your account",
      icon: <Minus className="h-5 w-5" />,
      onClick: () => setIsWithdrawModalOpen(true),
      colorClass: "bg-red-500 hover:bg-red-600",
      stats: {
        label: "Available",
        value: "0"
      }
    },
    {
      title: "Transfer",
      description: "Transfer funds between accounts",
      icon: <ArrowRight className="h-5 w-5" />,
      onClick: () => setIsTransferModalModalOpen(true),
      colorClass: "bg-blue-500 hover:bg-blue-600",
      stats: {
        label: "Fee",
        value: "0.1%"
      }
    }
  ];

  if (isMarketDataLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="ml-3 text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Action Buttons */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {mainActions.map((action, index) => (
            <button 
              key={index} 
              onClick={action.onClick}
              className={`group relative overflow-hidden rounded-md active:scale-[0.98] transition-all duration-200 text-white font-medium text-lg h-14 flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800`}
            >
              <span className="relative z-10 flex items-center gap-3">
                {action.icon}
                {action.title}
              </span>
              {/* Simple Hover Overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Market Data Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Market Overview</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              {isMarketDataRefetching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
              <span className="text-sm text-gray-500">Updated every 30 seconds</span>
            </div>
          </div>
        </div>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-0">
            {isMarketDataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-gray-600">Loading market data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMarketData?.map((coin, index) => (
                      <tr key={coin.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={coin.logoUrl} alt={coin.name} className="w-8 h-8 rounded-full" />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{coin.name}</div>
                              <div className="text-sm text-gray-500">{coin.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className="font-medium text-gray-900">
                            ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            coin.change24h >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {coin.change24h >= 0 ? (
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-0.5" />
                            )}
                            {Math.abs(coin.change24h).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalModalOpen(false)}
        userEmail={user?.email ?? ''}
      />
    </div>
  );
};

export default UserDashboard;
