import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import { useWalletBalances, useSelfTransfer } from '../../services/walletService';
import type { SelfTransferRequest } from '../../api/walletApi';
import { toast } from 'sonner';

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletTransferModal: React.FC<WalletTransferModalProps> = ({ isOpen, onClose }) => {
  const [fromWallet, setFromWallet] = useState<'TRADING' | 'ARBITRAGE'>('TRADING');
  const [toWallet, setToWallet] = useState<'TRADING' | 'ARBITRAGE'>('ARBITRAGE');
  const [amount, setAmount] = useState('');

  const { data: balances, isLoading: isBalancesLoading, error: balancesError } = useWalletBalances();
  const transferMutation = useSelfTransfer();

  // Handle balances error
  useEffect(() => {
    if (balancesError) {
      console.error('Failed to load wallet balances:', balancesError);
      toast.error('Failed to load wallet balances. Please refresh the page.');
    }
  }, [balancesError]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFromWallet('TRADING');
      setToWallet('ARBITRAGE');
      setAmount('');
    }
  }, [isOpen]);

  // Handle successful transfer
  useEffect(() => {
    if (transferMutation.isSuccess) {
      toast.success('Transfer completed successfully!');
      setAmount('');
      onClose();
    }
  }, [transferMutation.isSuccess, onClose]);

  // Auto-switch destination wallet when source changes
  const handleFromWalletChange = (value: 'TRADING' | 'ARBITRAGE') => {
    setFromWallet(value);
    // Auto-switch to the other wallet to avoid same-wallet transfer
    setToWallet(value === 'TRADING' ? 'ARBITRAGE' : 'TRADING');
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(value);
    }
  };

  const getWalletBalance = (walletType: string) => {
    if (!balances) return '0.00';
    switch (walletType) {
      case 'TRADING': return balances.trading.balance;
      case 'ARBITRAGE': return balances.arbitrage.balance;
      default: return '0.00';
    }
  };

  const isAmountValid = () => {
    if (!amount || !balances) return false;
    const numAmount = parseFloat(amount);
    const fromBalance = parseFloat(getWalletBalance(fromWallet));
    return numAmount > 0 && numAmount <= fromBalance;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid()) return;

    const transferData: SelfTransferRequest = {
      from: fromWallet,
      to: toWallet,
      amount: amount
    };

    transferMutation.mutate(transferData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <Wallet className="h-5 w-5 text-blue-500" />
            <span>Transfer Between Wallets</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Transfer funds between your different wallet types
          </DialogDescription>
        </DialogHeader>

        {isBalancesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : balancesError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Balances</h3>
            <p className="text-gray-400 mb-4">We couldn't load your wallet balances. Please try again.</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Balances */}
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Wallet Balances</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Trading Wallet */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">📈</div>
                      <p className="text-sm font-medium text-white">Trading</p>
                    </div>
                    <p className="text-lg font-bold text-blue-400">${balances?.trading.balance || '0.00'}</p>
                  </div>

                  {/* Arbitrage Wallet */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">💰</div>
                      <p className="text-sm font-medium text-white">Arbitrage</p>
                    </div>
                    <p className="text-lg font-bold text-green-400">${balances?.arbitrage.balance || '0.00'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-3">
                <div>
                  <Label htmlFor="fromWallet" className="text-white">From</Label>
                  <Select value={fromWallet} onValueChange={handleFromWalletChange}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="TRADING" className="text-white hover:bg-gray-600">Trading Wallet</SelectItem>
                      <SelectItem value="ARBITRAGE" className="text-white hover:bg-gray-600">Arbitrage Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>

                <div>
                  <Label htmlFor="toWallet" className="text-white">To</Label>
                  <Select value={toWallet} onValueChange={(value: any) => setToWallet(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="TRADING" className="text-white hover:bg-gray-600">Trading Wallet</SelectItem>
                      <SelectItem value="ARBITRAGE" className="text-white hover:bg-gray-600">Arbitrage Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="text-white">Amount (USDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Enter amount to transfer"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {amount && !isAmountValid() && (
                  <p className="text-red-400 text-xs mt-1">
                    Insufficient balance. Available: ${getWalletBalance(fromWallet)}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isAmountValid() || transferMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletTransferModal;

