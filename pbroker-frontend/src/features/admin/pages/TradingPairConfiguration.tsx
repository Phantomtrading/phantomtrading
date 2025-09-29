import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, BarChart2, Settings2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTradingPairs, createNewTradingPair, updateExistingTradingPair, removeTradingPair, tradingPairKeys } from '../services/adminTradingPairService';
import { fetchCryptoOptions } from '../api/adminApi';
import type { TradingPair, CreateTradingPairRequest } from '../api/adminApi';
import { toast } from 'sonner';

type TradingPairFormState = {
  pairName: string;
  baseCurrency: string;
  quoteCurrency: string;
  defaultTransactionFeePercentage: string;
  tradeOptions: { durationSeconds: string; profitPercentage: string; minAmountQuote: string; maxAmountQuote: string }[];
  isActive: boolean;
};

const TradingPairConfiguration: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPair, setEditingPair] = useState<TradingPair | null>(null);
  const [formData, setFormData] = useState<TradingPairFormState>({
    pairName: '',
    baseCurrency: '',
    quoteCurrency: '',
    defaultTransactionFeePercentage: '',
    tradeOptions: [{ durationSeconds: '60', profitPercentage: '0.15', minAmountQuote: '0', maxAmountQuote: '0' }],
    isActive: true
  });

  const { data: tradingPairsData, isLoading } = useQuery({
    queryKey: tradingPairKeys.lists(),
    queryFn: getAllTradingPairs
  });

  const { data: cryptoOptions } = useQuery({
    queryKey: ['cryptoOptions'],
    queryFn: fetchCryptoOptions
  });

  const createMutation = useMutation({
    mutationFn: createNewTradingPair,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradingPairKeys.lists() });
      setIsDialogOpen(false);
      toast.success('Trading pair created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating trading pair:', error);
      let errorMessage = 'Failed to create trading pair';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Log detailed error information
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', error);
      
      // Show specific error for 500
      if (error.response?.status === 500) {
        errorMessage = 'Server error - please check the console for details';
      }
      
      toast.error(errorMessage);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTradingPairRequest }) => 
      updateExistingTradingPair(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradingPairKeys.lists() });
      setIsDialogOpen(false);
      toast.success('Trading pair updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating trading pair:', error);
      let errorMessage = 'Failed to update trading pair';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Log detailed error information
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      toast.error(errorMessage);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: removeTradingPair,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradingPairKeys.lists() });
      toast.success('Trading pair deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting trading pair:', error);
      toast.error(error.message || 'Failed to delete trading pair');
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.baseCurrency || !formData.quoteCurrency) {
      toast.error('Please select both base and quote currencies');
      return;
    }
    
    if (!formData.defaultTransactionFeePercentage) {
      toast.error('Please enter transaction fee percentage');
      return;
    }
    
    const feePercentage = parseFloat(formData.defaultTransactionFeePercentage);
    if (feePercentage < 0 || feePercentage > 100) {
      toast.error('Transaction fee percentage must be between 0 and 100');
      return;
    }
    
    if (formData.tradeOptions.length === 0) {
      toast.error('Please add at least one trade option');
      return;
    }
    
    // Validate trade options
    for (let i = 0; i < formData.tradeOptions.length; i++) {
      const option = formData.tradeOptions[i];
      const duration = parseInt(option.durationSeconds);
      const profit = parseFloat(option.profitPercentage);
      const minAmount = parseFloat(option.minAmountQuote);
      const maxAmount = parseFloat(option.maxAmountQuote);
      
      if (duration <= 0) {
        toast.error(`Duration for option ${i + 1} must be greater than 0`);
        return;
      }
      
      if (profit < 0) {
        toast.error(`Profit percentage for option ${i + 1} must be non-negative`);
        return;
      }

      if (minAmount < 0) {
        toast.error(`Min amount for option ${i + 1} must be non-negative`);
        return;
      }

      if (maxAmount < 0) {
        toast.error(`Max amount for option ${i + 1} must be non-negative`);
        return;
      }

      if (minAmount > maxAmount) {
        toast.error(`Min amount for option ${i + 1} must be less than or equal to max amount`);
        return;
      }
    }
    
    // Ensure pair name is properly set
    const pairName = `${formData.baseCurrency}${formData.quoteCurrency}`;
    
    // Convert string values to proper types for backend
    const submitData: CreateTradingPairRequest = {
      pairName,
      baseCurrency: formData.baseCurrency,
      quoteCurrency: formData.quoteCurrency,
      defaultTransactionFeePercentage: parseFloat(formData.defaultTransactionFeePercentage) || 0,
      tradeOptions: formData.tradeOptions.map(opt => {
        const { durationSeconds, profitPercentage, minAmountQuote, maxAmountQuote,  } = opt as any;
        return {
          durationSeconds: parseInt(durationSeconds) || 0,
          profitPercentage: parseFloat(profitPercentage) || 0,
          minAmountQuote: parseFloat(minAmountQuote) || 0,
          maxAmountQuote: parseFloat(maxAmountQuote) || 0
        };
      }),
      isActive: formData.isActive
    };
    
    // Log the data being sent for debugging
    console.log('Submitting trading pair data:', submitData);
    
    if (editingPair) {
      updateMutation.mutate({ id: editingPair.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this trading pair?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (pair: TradingPair) => {
    setEditingPair(pair);
    setFormData({
      pairName: pair.pairName,
      baseCurrency: pair.baseCurrency,
      quoteCurrency: pair.quoteCurrency,
      defaultTransactionFeePercentage: String(pair.defaultTransactionFeePercentage ?? ''),
      tradeOptions: Array.isArray(pair.tradeOptions)
        ? pair.tradeOptions.map(opt => ({
            durationSeconds: String(opt.durationSeconds ?? ''),
            profitPercentage: String(opt.profitPercentage ?? ''),
            minAmountQuote: String(opt.minAmountQuote ?? ''),
            maxAmountQuote: String(opt.maxAmountQuote ?? '')
          }))
        : [{ durationSeconds: '60', profitPercentage: '0.15', minAmountQuote: '0', maxAmountQuote: '0' }],
      isActive: pair.isActive
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPair(null);
    setFormData({
      pairName: '',
      baseCurrency: '',
      quoteCurrency: '',
      defaultTransactionFeePercentage: '',
      tradeOptions: [{ durationSeconds: '60', profitPercentage: '0.15', minAmountQuote: '0', maxAmountQuote: '0' }],
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleCryptoSelect = (value: string, type: 'base' | 'quote') => {
    const selectedCrypto = cryptoOptions?.find(crypto => crypto.id === value);
    if (selectedCrypto) {
      if (type === 'base') {
        setFormData(prev => ({
          ...prev,
          baseCurrency: selectedCrypto.symbol,
          pairName: prev.quoteCurrency ? `${selectedCrypto.symbol}${prev.quoteCurrency}` : ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          quoteCurrency: selectedCrypto.symbol,
          pairName: prev.baseCurrency ? `${prev.baseCurrency}${selectedCrypto.symbol}` : ''
        }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const tradingPairs = tradingPairsData?.data || [];
  const activePairs = tradingPairs.filter(pair => pair.isActive).length;
  const totalPairs = tradingPairs.length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading Pair Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">Manage trading pairs and their settings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Trading Pair
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingPair ? 'Edit Trading Pair' : 'Add New Trading Pair'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pair Name</Label>
                    <Input
                      value={formData.pairName}
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Base Currency</Label>
                    <Select
                      value={cryptoOptions?.find(c => c.symbol === formData.baseCurrency)?.id}
                      onValueChange={(value) => handleCryptoSelect(value, 'base')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select base currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoOptions?.map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            {crypto.name} ({crypto.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quote Currency</Label>
                    <Select
                      value={cryptoOptions?.find(c => c.symbol === formData.quoteCurrency)?.id}
                      onValueChange={(value) => handleCryptoSelect(value, 'quote')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select quote currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoOptions?.map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            {crypto.name} ({crypto.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Transaction Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.defaultTransactionFeePercentage}
                      onChange={e => setFormData({ ...formData, defaultTransactionFeePercentage: e.target.value })}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Trade Options</Label>
                    <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          tradeOptions: [
                            ...formData.tradeOptions,
                            { durationSeconds: '60', profitPercentage: '0.15', minAmountQuote: '0', maxAmountQuote: '0' }
                          ]
                        });
                      }}
                    >
                      Add Option
                    </Button>
                      {formData.tradeOptions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = formData.tradeOptions.slice(0, -1);
                            setFormData({ ...formData, tradeOptions: newOptions });
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Last
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {formData.tradeOptions.map((option, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">Duration (seconds)</Label>
                          <Input
                            type="number"
                            value={option.durationSeconds}
                            onChange={e => {
                              const newOptions = [...formData.tradeOptions];
                              newOptions[index] = {
                                ...option,
                                durationSeconds: e.target.value
                              };
                              setFormData({ ...formData, tradeOptions: newOptions });
                            }}
                            min="1"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Profit Percentage (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.profitPercentage}
                            onChange={e => {
                              const newOptions = [...formData.tradeOptions];
                              newOptions[index] = {
                                ...option,
                                profitPercentage: e.target.value
                              };
                              setFormData({ ...formData, tradeOptions: newOptions });
                            }}
                            min="0"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Min Amount</Label>
                          <Input
                            type="number"
                            value={option.minAmountQuote}
                            onChange={e => {
                              const newOptions = [...formData.tradeOptions];
                              newOptions[index] = {
                                ...option,
                                minAmountQuote: e.target.value
                              };
                              setFormData({ ...formData, tradeOptions: newOptions });
                            }}
                            min="0"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Max Amount</Label>
                          <Input
                            type="number"
                            value={option.maxAmountQuote}
                            onChange={e => {
                              const newOptions = [...formData.tradeOptions];
                              newOptions[index] = {
                                ...option,
                                maxAmountQuote: e.target.value
                              };
                              setFormData({ ...formData, tradeOptions: newOptions });
                            }}
                            min="0"
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label className="text-sm font-medium">Active</Label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingPair ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trading Pairs</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalPairs}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <BarChart2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pairs</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{activePairs}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Settings2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Pairs</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalPairs - activePairs}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Trading Pairs List</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Manage your trading pairs and their settings</p>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[900px] text-xs md:text-sm">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">Pair Name</TableHead>
                <TableHead className="font-medium">Base Currency</TableHead>
                <TableHead className="font-medium">Quote Currency</TableHead>
                <TableHead className="font-medium">Fee (%)</TableHead>
                <TableHead className="font-medium">Trade Options</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tradingPairs.map((pair) => (
                <TableRow key={pair.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{pair.pairName}</TableCell>
                  <TableCell>{pair.baseCurrency}</TableCell>
                  <TableCell>{pair.quoteCurrency}</TableCell>
                  <TableCell>{pair.defaultTransactionFeePercentage}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {Array.isArray(pair.tradeOptions) && pair.tradeOptions.map((option, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {option.durationSeconds}s: {option.profitPercentage}%<br/>
                          Min: {option.minAmountQuote}, Max: {option.maxAmountQuote}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pair.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pair.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(pair)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(pair.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TradingPairConfiguration; 