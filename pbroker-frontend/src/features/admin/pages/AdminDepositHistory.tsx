import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search,  CheckCircle, XCircle, Clock, Eye, ExternalLink } from 'lucide-react';
import { useDeposits, useUpdateDepositStatus } from '../services/adminHistoryService';

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
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'PENDING', icon: Clock },
    approved: { color: 'bg-green-100 text-green-800', label: 'APPROVED', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', label: 'REJECTED', icon: XCircle },
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

const AdminDepositHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: deposits, isLoading, error } = useDeposits();
  const updateDepositStatusMutation = useUpdateDepositStatus();

  const filteredDeposits = (deposits || []).filter((deposit) => {
    const matchesSearch = 
      deposit.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = () => {
    if (!selectedDeposit || !newStatus) return;
    
    updateDepositStatusMutation.mutate({
      depositId: selectedDeposit.id,
      status: newStatus,
      adminNotes: adminNotes.trim() || undefined
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedDeposit(null);
        setNewStatus('');
        setAdminNotes('');
      }
    });
  };

  const openStatusModal = (deposit: any) => {
    setSelectedDeposit(deposit);
    setNewStatus(deposit.status);
    setAdminNotes(deposit.adminNotes || '');
    setIsModalOpen(true);
  };

  const openDetailModal = (deposit: any) => {
    setSelectedDeposit(deposit);
    setIsDetailModalOpen(true);
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
        <div className="text-lg">Loading deposits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading deposits</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user name, email, or deposit ID..."
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
            <table className="w-full min-w-[600px] text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Cryptocurrency</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map((deposit) => (
                  <tr 
                    key={deposit.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetailModal(deposit)}
                  >
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {deposit.user?.firstName} {deposit.user?.lastName}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">{deposit.user?.email}</div>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="font-medium text-gray-900">
                        ${formatCurrency(deposit.amount)}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="text-xs md:text-sm text-gray-900">
                        {deposit.cryptocurrency?.symbol}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      {getStatusBadge(deposit.status)}
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="text-xs md:text-sm text-gray-900">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500">
                        {new Date(deposit.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openStatusModal(deposit);
                        }}
                        disabled={updateDepositStatusMutation.isPending}
                      >
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDeposits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No deposits found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] my-8">
          <DialogHeader>
            <DialogTitle>Update Deposit Status</DialogTitle>
            <DialogDescription>
              Update the status for deposit from {selectedDeposit?.user?.firstName} {selectedDeposit?.user?.lastName}
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

                  {/* <SelectItem value="PENDING">Pending</SelectItem> */}
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              disabled={!newStatus || updateDepositStatusMutation.isPending}
            >
              {updateDepositStatusMutation.isPending ? 'Updating...' : 'Update Status'}
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
              Deposit Details
            </DialogTitle>
            <DialogDescription>
              Complete information for deposit #{selectedDeposit?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <div className="font-medium">{selectedDeposit?.user?.firstName} {selectedDeposit?.user?.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <div className="font-medium">{selectedDeposit?.user?.email}</div>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <div className="font-medium">{selectedDeposit?.user?.id}</div>
                </div>
              </div>
            </div>

            {/* Deposit Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Deposit Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-gray-500">Deposit ID:</span>
                  <div className="font-medium">{selectedDeposit?.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <div className="font-medium text-lg">${formatCurrency(selectedDeposit?.amount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Cryptocurrency:</span>
                  <div className="font-medium">{selectedDeposit?.cryptocurrency?.name} ({selectedDeposit?.cryptocurrency?.symbol})</div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedDeposit?.status)}</div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
              <div className="space-y-3 text-xs md:text-sm">
                {selectedDeposit?.transactionHash && (
                  <div>
                    <span className="text-gray-500">Transaction Hash:</span>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                      {selectedDeposit.transactionHash}
                    </div>
                  </div>
                )}
                {selectedDeposit?.proofOfDepositUrl && (
                  <div>
                    <span className="text-gray-500">Proof of Deposit:</span>
                    <div className="mt-1">
                      <a 
                        href={selectedDeposit.proofOfDepositUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Proof
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Timestamps</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">{selectedDeposit?.createdAt ? formatDate(selectedDeposit.createdAt) : 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <div className="font-medium">{selectedDeposit?.updatedAt ? formatDate(selectedDeposit.updatedAt) : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedDeposit?.adminNotes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <div className="text-xs md:text-sm bg-white p-3 rounded border">
                  {selectedDeposit.adminNotes}
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
                openStatusModal(selectedDeposit);
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

export default AdminDepositHistory; 