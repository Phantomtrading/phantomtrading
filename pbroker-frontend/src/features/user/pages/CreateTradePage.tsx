import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { createTradeRequest, getTradingPairs } from '../services/tradingService';
// import type { TradeRequest } from '../api/userApi';
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign } from 'lucide-react';

const CreateTradePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tradeForm, setTradeForm] = useState({
    tradingPairId: 0,
    tradeOptionId: 0,
    tradeType: 'BUY',
    tradingAmountQuote: 0,
    executionPrice: 0
  });

  const { data: tradingPairs, isLoading: isLoadingPairs } = useQuery({
    queryKey: ['tradingPairs'],
    queryFn: getTradingPairs
  });

  const createTradeMutation = useMutation({
    mutationFn: createTradeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTrades'] });
      toast.success('Trade request created successfully');
      navigate('/user/trade-transactions');
    },
    onError: () => {
      toast.error('Failed to create trade request');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPair) {
      toast.error('Please select a trading pair');
      return;
    }
    if (!selectedTradeOption) {
      toast.error('Please select a trade option');
      return;
    }
    const amount = tradeForm.tradingAmountQuote;
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount < selectedTradeOption.minAmountQuote || amount > selectedTradeOption.maxAmountQuote) {
      toast.error(`Amount must be between ${selectedTradeOption.minAmountQuote} and ${selectedTradeOption.maxAmountQuote} ${selectedPair.quoteCurrency}`);
      return;
    }
    createTradeMutation.mutate({
      tradingPairId: selectedPair.id,
      tradeOptionId: selectedTradeOption.id,
      tradeType: tradeForm.tradeType as 'BUY' | 'SELL',
      tradingAmountQuote: amount,
      executionPrice: tradeForm.executionPrice
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTradeForm(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTradeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectedPair = tradingPairs?.find(pair => pair.id === tradeForm.tradingPairId);
  const tradeOptions = selectedPair?.tradeOptions || [];
  const selectedTradeOption = tradeOptions.find(opt => opt.id === tradeForm.tradeOptionId);

return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Trade</CardTitle>
            <CardDescription>Set your trade parameters below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trading Pair</label>
                <Select
                  value={tradeForm.tradingPairId ? tradeForm.tradingPairId.toString() : ''}
                  onValueChange={value => {
                    const pairId = Number(value);
                    setTradeForm(prev => ({ ...prev, tradingPairId: pairId, tradeOptionId: 0 }));
                  }}
                  disabled={isLoadingPairs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trading pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradingPairs?.map((pair) => (
                      <SelectItem key={pair.id} value={pair.id.toString()}>
                        {pair.pairName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTradeOption && (
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {selectedTradeOption.minAmountQuote} {selectedPair?.quoteCurrency} | 
                    Max: {selectedTradeOption.maxAmountQuote} {selectedPair?.quoteCurrency}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trade Type</label>
                <Select
                  value={tradeForm.tradeType}
                  onValueChange={(value) => handleSelectChange('tradeType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">
                      <div className="flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-2 text-green-600" />
                        Buy
                      </div>
                    </SelectItem>
                    <SelectItem value="SELL">
                      <div className="flex items-center">
                        <ArrowDownRight className="h-4 w-4 mr-2 text-red-600" />
                        Sell
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount ({selectedPair?.quoteCurrency || 'USDT'})</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    name="tradingAmountQuote"
                    value={tradeForm.tradingAmountQuote}
                    onChange={handleInputChange}
                    min={selectedTradeOption?.minAmountQuote || 0}
                    max={selectedTradeOption?.maxAmountQuote || 0}
                    step="0.01"
                    className="pl-10"
                    required
                    placeholder={`Enter amount in ${selectedPair?.quoteCurrency || 'USDT'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Execution Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    name="executionPrice"
                    value={tradeForm.executionPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="pl-10"
                    required
                    placeholder="Enter execution price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiration Time (seconds)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={tradeForm.tradeOptionId ? tradeForm.tradeOptionId.toString() : ''}
                    onValueChange={value => {
                      setTradeForm(prev => ({ ...prev, tradeOptionId: Number(value) }));
                    }}
                    disabled={!selectedPair}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiration time" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradeOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id.toString()}>
                          {option.durationSeconds} seconds ({option.profitPercentage}% profit)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTradeMutation.isPending || !selectedPair || !selectedTradeOption}
                >
                  {createTradeMutation.isPending ? 'Creating...' : 'Create Trade'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTradePage; 