import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, User, Mail, Phone, DollarSign, Crown,  } from 'lucide-react';
import { useUsers, useUpdateUser } from '../services/adminUserService';
import { Pencil } from 'lucide-react';

const formatCurrency = (value: any) => {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return '0.00';
  }
  return numberValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getRoleBadge = (role: string) => {
  const roleConfig = {
    ADMIN: { color: 'bg-purple-100 text-purple-800', label: 'Admin', icon: Crown },
    USER: { color: 'bg-blue-100 text-blue-800', label: 'User', icon: User },
  };
  
  const config = roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-100 text-gray-800', label: role, icon: User };
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

const getDemoModeBadge = (demoMode: string) => {
  const demoConfig = {
    WIN: { color: 'bg-green-100 text-green-800', label: 'WIN' },
    LOSE: { color: 'bg-red-100 text-red-800', label: 'LOSE' },
    NA: { color: 'bg-gray-100 text-gray-800', label: 'NEUTRAL' },
  };
  
  const config = demoConfig[demoMode as keyof typeof demoConfig] || { color: 'bg-gray-100 text-gray-800', label: demoMode };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editBalanceUser, setEditBalanceUser] = useState<any | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState('');
  const [isEditBalanceDialogOpen, setIsEditBalanceDialogOpen] = useState(false);
  const [editBalanceError, setEditBalanceError] = useState('');

  const { data: usersResponse, isLoading, error } = useUsers();
  const updateUserMutation = useUpdateUser();

  const users = usersResponse?.data || [];
  const updatingUserId = updateUserMutation.isPending ? updateUserMutation.variables?.userId : null;

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleDemoModeChange = (userId: number, demoMode: 'WIN' | 'LOSE' | 'NA') => {
    updateUserMutation.mutate({ userId, data: { demoMode } });
  };

  const handleEditBalanceClick = (user: any) => {
    setEditBalanceUser(user);
    setEditBalanceValue(user.balance?.toString() || '');
    setEditBalanceError('');
    setIsEditBalanceDialogOpen(true);
  };

  const handleEditBalanceSave = () => {
    const value = Number(editBalanceValue);
    if (isNaN(value) || value < 0) {
      setEditBalanceError('Please enter a valid non-negative number.');
      return;
    }
    updateUserMutation.mutate({ userId: editBalanceUser.id, data: { balance: value } }, {
      onSuccess: () => {
        setIsEditBalanceDialogOpen(false);
        setEditBalanceUser(null);
        setEditBalanceValue('');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading users</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="text-xs md:text-sm text-gray-500 w-full sm:w-auto">
          <span>Home</span> {' '} / {' '}
          <span>Users</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Balance</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Role</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Demo Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs md:text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-xs md:text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {user.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="flex items-center text-xs md:text-sm font-medium text-gray-900">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        ${formatCurrency(user.balance)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1"
                          onClick={() => handleEditBalanceClick(user)}
                          aria-label="Edit Balance"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="space-y-2">
                        {getDemoModeBadge(user.demoMode || 'NA')}
                        <RadioGroup
                          value={user.demoMode || 'NA'}
                          onValueChange={(value) => handleDemoModeChange(user.id, value as 'WIN' | 'LOSE' | 'NA')}
                          className="flex flex-row space-x-2 md:space-x-4"
                          disabled={updatingUserId === user.id}
                        >
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <RadioGroupItem value="WIN" id={`win-${user.id}`} />
                            <Label htmlFor={`win-${user.id}`} className="text-xs md:text-sm text-green-600">Win</Label>
                          </div>
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <RadioGroupItem value="NEUTRAL" id={`neutral-${user.id}`} />
                            <Label htmlFor={`neutral-${user.id}`} className="text-xs md:text-sm">Neutral</Label>
                          </div>
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <RadioGroupItem value="LOSE" id={`lose-${user.id}`} />
                            <Label htmlFor={`lose-${user.id}`} className="text-xs md:text-sm text-red-600">Lose</Label>
                          </div>
                        </RadioGroup>
                        {updatingUserId === user.id && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditBalanceDialogOpen} onOpenChange={setIsEditBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Balance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-red-600 font-semibold">
              Warning: Editing a user's balance is a sensitive operation. Please ensure you have authorization and double-check the amount before saving.
            </div>
            <div>
              <Label htmlFor="edit-balance-input">New Balance</Label>
              <Input
                id="edit-balance-input"
                type="number"
                min="0"
                step="0.01"
                value={editBalanceValue}
                onChange={e => setEditBalanceValue(e.target.value)}
                disabled={updateUserMutation.isPending}
              />
              {editBalanceError && (
                <div className="text-xs text-red-500 mt-1">{editBalanceError}</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditBalanceDialogOpen(false)} disabled={updateUserMutation.isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditBalanceSave} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage; 