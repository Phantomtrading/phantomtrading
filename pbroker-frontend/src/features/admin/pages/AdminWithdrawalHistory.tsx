import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search,   XCircle, Clock, CheckCheck, Eye, Copy } from 'lucide-react';
import { useWithdrawals, useUpdateWithdrawalStatus } from '../services/adminHistoryService';

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

const getStatusBadge = (status: string) => {
  const statusConfig: { [key: string]: { color: string; label: string; icon: any } } = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
    APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCheck },
    REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
    COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: CheckCheck },
  };
  
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: Clock };
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

const AdminWithdrawalHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  const { data: withdrawals, isLoading, error } = useWithdrawals();
  const updateWithdrawalStatusMutation = useUpdateWithdrawalStatus();

  const filteredWithdrawals = (withdrawals || []).filter((withdrawal) => {
    const matchesSearch = 
      withdrawal.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = () => {
    if (!selectedWithdrawal || !newStatus) return;
    
    updateWithdrawalStatusMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      status: newStatus,
      adminNotes: adminNotes.trim() || undefined,
      transactionHash: transactionHash.trim() || undefined
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedWithdrawal(null);
        setNewStatus('');
        setAdminNotes('');
        setTransactionHash('');
      }
    });
  };

  const openStatusModal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setAdminNotes(withdrawal.adminNotes || '');
    setTransactionHash(withdrawal.transactionHash || '');
    setIsModalOpen(true);
  };

  const openDetailModal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading withdrawals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading withdrawals</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user name, email, or withdrawal ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Fee</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Address</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr 
                    key={withdrawal.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetailModal(withdrawal)}
                  >
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {withdrawal.user?.firstName} {withdrawal.user?.lastName}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">{withdrawal.user?.email}</div>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="font-medium text-gray-900">
                        ${formatCurrency(withdrawal.amount)}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="text-xs md:text-sm text-gray-900">
                        ${formatCurrency(withdrawal.fee)}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="text-xs md:text-sm text-gray-900 font-mono">
                        {withdrawal.withdrawalAddress?.slice(0, 8)}...{withdrawal.withdrawalAddress?.slice(-8)}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="text-xs md:text-sm text-gray-900">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500">
                        {new Date(withdrawal.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openStatusModal(withdrawal);
                        }}
                        disabled={updateWithdrawalStatusMutation.isPending}
                      >
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWithdrawals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No withdrawals found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] my-8">
          <DialogHeader>
            <DialogTitle>Update Withdrawal Status</DialogTitle>
            <DialogDescription>
              Update the status for withdrawal from {selectedWithdrawal?.user?.firstName} {selectedWithdrawal?.user?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === 'APPROVED' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="transactionHash" className="text-right">
                  Transaction Hash
                </label>
                <Input
                  id="transactionHash"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="Enter transaction hash..."
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right">
                Admin Notes
              </label>
              <textarea
                id="notes"
                value={adminNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                placeholder="Optional admin notes..."
                className="col-span-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleStatusUpdate}
              disabled={!newStatus || updateWithdrawalStatusMutation.isPending}
            >
              {updateWithdrawalStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px] my-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Withdrawal Details
            </DialogTitle>
            <DialogDescription>
              Complete information for withdrawal #{selectedWithdrawal?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <div className="font-medium">{selectedWithdrawal?.user?.firstName} {selectedWithdrawal?.user?.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <div className="font-medium">{selectedWithdrawal?.user?.email}</div>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <div className="font-medium">{selectedWithdrawal?.user?.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Current Balance:</span>
                  <div className="font-medium">${formatCurrency(selectedWithdrawal?.user?.balance)}</div>
                </div>
              </div>
            </div>

            {/* Withdrawal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Withdrawal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-gray-500">Withdrawal ID:</span>
                  <div className="font-medium">{selectedWithdrawal?.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <div className="font-medium text-lg">${formatCurrency(selectedWithdrawal?.amount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Fee:</span>
                  <div className="font-medium">${formatCurrency(selectedWithdrawal?.fee)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal?.status)}</div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Withdrawal Address</h3>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Address:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedWithdrawal?.withdrawalAddress)}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="font-mono text-xs bg-gray-100 p-3 rounded break-all">
                  {selectedWithdrawal?.withdrawalAddress}
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            {selectedWithdrawal?.transactionHash && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Transaction Hash:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedWithdrawal.transactionHash)}
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="font-mono text-xs bg-gray-100 p-3 rounded break-all">
                    {selectedWithdrawal.transactionHash}
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Timestamps</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">{selectedWithdrawal?.createdAt ? formatDate(selectedWithdrawal.createdAt) : 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <div className="font-medium">{selectedWithdrawal?.updatedAt ? formatDate(selectedWithdrawal.updatedAt) : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedWithdrawal?.adminNotes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <div className="text-xs md:text-sm bg-white p-3 rounded border">
                  {selectedWithdrawal.adminNotes}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsDetailModalOpen(false);
                openStatusModal(selectedWithdrawal);
              }}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawalHistory; 