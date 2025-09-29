import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Coins, Settings as SettingsIcon } from 'lucide-react';
import { getAllTradingPairs, createNewTradingPair, updateExistingTradingPair, removeTradingPair } from '../services/adminTradingPairService';
import type { TradingPair, CreateTradingPairRequest } from '../api/adminApi';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPair, setEditingPair] = useState<TradingPair | null>(null);
  const [formData, setFormData] = useState<CreateTradingPairRequest>({
    pairName: '',
    baseCurrency: '',
    quoteCurrency: '',
    defaultTransactionFeePercentage: 0,
    tradeOptions: [],
    isActive: true
  });

  const navigate = useNavigate();

  const loadTradingPairs = async () => {
    try {
      const response = await getAllTradingPairs();
      setTradingPairs(response.data);
    } catch (error) {
      console.error('Error loading trading pairs:', error);
    }
  };

  useEffect(() => {
    loadTradingPairs();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingPair) {
        await updateExistingTradingPair(editingPair.id, formData);
      } else {
        await createNewTradingPair(formData);
      }
      setIsDialogOpen(false);
      loadTradingPairs();
    } catch (error) {
      console.error('Error saving trading pair:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this trading pair?')) {
      try {
        await removeTradingPair(id);
        loadTradingPairs();
      } catch (error) {
        console.error('Error deleting trading pair:', error);
      }
    }
  };

  const handleEdit = (pair: TradingPair) => {
    setEditingPair(pair);
    setFormData({
      pairName: pair.pairName,
      baseCurrency: pair.baseCurrency,
      quoteCurrency: pair.quoteCurrency,
      defaultTransactionFeePercentage: Number(pair.defaultTransactionFeePercentage),
      tradeOptions: pair.tradeOptions || [],
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
      defaultTransactionFeePercentage: 0,
      tradeOptions: [],
      isActive: true
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
        <div
          className="group bg-white rounded-lg shadow border border-gray-200 flex items-center px-8 py-6 cursor-pointer hover:shadow-lg transition relative overflow-hidden"
          onClick={() => navigate('/admin/cryptocurrencies')}
        >
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-blue-100 group-hover:bg-blue-200 transition shadow-sm">
              <Coins className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="h-16 w-px bg-gray-200 mx-8 hidden md:block" />
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 mb-1">Cryptocurrencies</div>
            <div className="text-gray-500 text-base">Manage supported cryptocurrencies</div>
          </div>
        </div>
        <div
          className="group bg-white rounded-lg shadow border border-gray-200 flex items-center px-8 py-6 cursor-pointer hover:shadow-lg transition relative overflow-hidden"
          onClick={() => navigate('/admin/trading-pairs')}
        >
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-green-100 group-hover:bg-green-200 transition shadow-sm">
              <SettingsIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="h-16 w-px bg-gray-200 mx-8 hidden md:block" />
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 mb-1">Trading Pairs</div>
            <div className="text-gray-500 text-base">Configure trading pairs</div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trading Pair
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPair ? 'Edit Trading Pair' : 'Add New Trading Pair'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pair Name</Label>
                  <Input
                    value={formData.pairName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pairName: e.target.value })}
                    placeholder="e.g., BTC/USDT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Currency</Label>
                  <Input
                    value={formData.baseCurrency}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, baseCurrency: e.target.value })}
                    placeholder="e.g., BTC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quote Currency</Label>
                  <Input
                    value={formData.quoteCurrency}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, quoteCurrency: e.target.value })}
                    placeholder="e.g., USDT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transaction Fee (%)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.defaultTransactionFeePercentage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, defaultTransactionFeePercentage: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPair ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair Name</TableHead>
              <TableHead>Base Currency</TableHead>
              <TableHead>Quote Currency</TableHead>
              <TableHead>Fee (%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tradingPairs.map((pair) => (
              <TableRow key={pair.id}>
                <TableCell>{pair.pairName}</TableCell>
                <TableCell>{pair.baseCurrency}</TableCell>
                <TableCell>{pair.quoteCurrency}</TableCell>
                <TableCell>{pair.defaultTransactionFeePercentage}</TableCell>
                <TableCell>
                  <Switch checked={pair.isActive} disabled />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(pair)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pair.id)}
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
  );
}; 