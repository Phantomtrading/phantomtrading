import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp } from 'lucide-react';
import { useWalletBalances } from '../../services/walletService';

interface WalletBalanceCardProps {
  onTransferClick: () => void;
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({ onTransferClick }) => {
  const { data: balances, isLoading } = useWalletBalances();

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Wallet Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = balances 
    ? parseFloat(balances.trading.total) + parseFloat(balances.arbitrage.total)
    : 0;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Wallet Balances</CardTitle>
          <Button
            onClick={onTransferClick}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Transfer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Balance */}
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">Total Balance</p>
            <p className="text-2xl font-bold text-white">${totalBalance.toLocaleString()}</p>
          </div>

          {/* Individual Wallets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trading Wallet */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-400">Trading</span>
              </div>
              <p className="text-lg font-semibold text-blue-500">
                ${parseFloat(balances?.trading.total || '0').toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">For trading activities</p>
            </div>

            {/* Arbitrage Wallet */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-400">Arbitrage</span>
              </div>
              <p className="text-lg font-semibold text-green-500">
                ${parseFloat(balances?.arbitrage.total || '0').toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">For arbitrage products</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              onClick={() => onTransferClick()}
            >
              Transfer Funds
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalanceCard;
