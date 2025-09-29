import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  getAllCryptocurrencies,
  createNewCryptocurrency,
  updateExistingCryptocurrency,
  removeCryptocurrency,
  type Cryptocurrency,
  type CreateCryptoRequest,
} from '../services/adminCryptoService';

const defaultForm: CreateCryptoRequest = {
  name: '',
  symbol: '',
  coingeckoId: '',
  tokenStandard: '',
  depositAddress: '',
};

const CryptocurrencyConfiguration: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrypto, setEditingCrypto] = useState<Cryptocurrency | null>(null);
  const [formData, setFormData] = useState<CreateCryptoRequest>(defaultForm);

  const { data: cryptos = [], isLoading } = useQuery({
    queryKey: ['cryptocurrencies'],
    queryFn: getAllCryptocurrencies,
  });

  const createMutation = useMutation({
    mutationFn: createNewCryptocurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptocurrencies'] });
      setIsDialogOpen(false);
      setFormData(defaultForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCryptoRequest }) => updateExistingCryptocurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptocurrencies'] });
      setIsDialogOpen(false);
      setFormData(defaultForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: removeCryptocurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptocurrencies'] });
    },
  });

  const handleEdit = (crypto: Cryptocurrency) => {
    setEditingCrypto(crypto);
    setFormData({
      name: crypto.name,
      symbol: crypto.symbol,
      coingeckoId: crypto.coingeckoId,
      tokenStandard: crypto.tokenStandard,
      depositAddress: crypto.depositAddress,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCrypto(null);
    setFormData(defaultForm);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this cryptocurrency?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCrypto) {
      updateMutation.mutate({ id: editingCrypto.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-2 md:p-4 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 via-green-500 to-blue-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg flex items-center justify-center gap-3">
        <Coins className="h-8 w-8 text-blue-500" />
        Manage Cryptocurrencies
      </h1> */}
      <Card className="w-full shadow-xl border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Cryptocurrencies</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Add Cryptocurrency
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {editingCrypto ? 'Edit Cryptocurrency' : 'Add Cryptocurrency'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Symbol</Label>
                    <Input
                      value={formData.symbol}
                      onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Coingecko ID</Label>
                    <Input
                      value={formData.coingeckoId}
                      onChange={e => setFormData({ ...formData, coingeckoId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Token Standard</Label>
                    <Input
                      value={formData.tokenStandard}
                      onChange={e => setFormData({ ...formData, tokenStandard: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Deposit Address</Label>
                    <Input
                      value={formData.depositAddress}
                      onChange={e => setFormData({ ...formData, depositAddress: e.target.value })}
                      required
                    />
                  </div>
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
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : editingCrypto
                      ? 'Update'
                      : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[700px] text-xs md:text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Coingecko ID</TableHead>
                    <TableHead>Token Standard</TableHead>
                    <TableHead>Deposit Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cryptos.map(crypto => (
                    <TableRow key={crypto.id} className="hover:bg-blue-50/40">
                      <TableCell className="font-medium">{crypto.name}</TableCell>
                      <TableCell>{crypto.symbol}</TableCell>
                      <TableCell>{crypto.coingeckoId}</TableCell>
                      <TableCell>{crypto.tokenStandard}</TableCell>
                      <TableCell className="truncate max-w-[180px]">{crypto.depositAddress}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(crypto)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(crypto.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptocurrencyConfiguration; 