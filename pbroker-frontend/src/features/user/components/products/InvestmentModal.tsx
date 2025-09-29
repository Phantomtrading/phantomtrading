import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';
import type { Product } from '../../api/productsApi';
import { useCreateHostingOrder } from '../../services/productsService';

interface InvestmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDuration = (days: number) => {
  if (days === 1) return `${days} day`;
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
};

const InvestmentModal: React.FC<InvestmentModalProps> = ({ product, isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const createOrderMutation = useCreateHostingOrder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !amount) return;

    const numAmount = parseFloat(amount);
    if (numAmount < product.minInvestment || numAmount > product.maxInvestment) {
      return;
    }

    createOrderMutation.mutate(
      {
        productId: product.id,
        amount: numAmount
      },
      {
        onSuccess: () => {
          setAmount('');
          onClose();
        }
      }
    );
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(value);
    }
  };

  const getExpectedReturn = () => {
    if (!product || !amount) return 0;
    const numAmount = parseFloat(amount);
    // Calculate total return for the entire duration
    return (numAmount * product.dailyRoiRate * product.durationDays) / 100;
  };

  const isAmountValid = () => {
    if (!product || !amount) return false;
    const numAmount = parseFloat(amount);
    return numAmount >= product.minInvestment && numAmount <= product.maxInvestment;
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Invest in {product.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a hosting order for {product.name}. Please review the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Product</span>
                  <span className="font-medium text-white">{product.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Daily Rate</span>
                  <span className="font-medium text-green-500">{product.dailyRoiRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Duration</span>
                  <span className="font-medium text-white">{formatDuration(product.durationDays)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Investment Range</span>
                  <span className="font-medium text-white">
                    ${product.minInvestment.toLocaleString()} - ${product.maxInvestment.toLocaleString()} USDT
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-white">Investment Amount (USDT)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={`Min: ${product.minInvestment}, Max: ${product.maxInvestment} USDT`}
                min={product.minInvestment}
                max={product.maxInvestment}
                step="0.01"
                className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              {amount && !isAmountValid() && (
                <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Amount must be between {product.minInvestment.toLocaleString()} and {product.maxInvestment.toLocaleString()} USDT
                  </span>
                </div>
              )}
            </div>

            {amount && isAmountValid() && (
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Investment Amount</span>
                      <span className="font-medium text-white">{parseFloat(amount).toLocaleString()} USDT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total Interest ({product.durationDays} days)</span>
                      <span className="font-medium text-green-500">{getExpectedReturn().toFixed(2)} USDT</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-600 pt-2">
                      <span className="text-sm font-medium text-white">Total Return</span>
                      <span className="font-bold text-green-500">
                        {(parseFloat(amount) + getExpectedReturn()).toFixed(2)} USDT
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              disabled={createOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!isAmountValid() || createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentModal;
