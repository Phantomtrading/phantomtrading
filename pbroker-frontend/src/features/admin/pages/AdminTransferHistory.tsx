import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search,  ArrowRight, Eye, User,  DollarSign,  } from 'lucide-react';
import { useTransfers } from '../services/adminHistoryService';

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

// const getStatusBadge = (status: string) => {
//   const statusConfig: { [key: string]: { color: string; label: string } } = {
//     PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
//     COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
//     FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
//   };
  
//   const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
//       {config.label}
//     </span>
//   );
// };

const AdminTransferHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: transfers, isLoading, error } = useTransfers();

  const filteredTransfers = (transfers || []).filter((transfer) => {
    const matchesSearch = 
      transfer.sender?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.sender?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.sender?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.recipient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.recipient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.recipient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const openDetailModal = (transfer: any) => {
    setSelectedTransfer(transfer);
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
        <div className="text-lg">Loading transfers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading transfers</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by sender, recipient, or transfer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">Sender</th>
                  {/* <th className="text-left py-3 px-4 font-medium text-gray-900">Sender</th> */}
                  <th className="text-left py-3 px-4 font-medium text-gray-900"></th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((transfer) => (
                  <tr 
                    key={transfer.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetailModal(transfer)}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transfer.sender?.firstName} {transfer.sender?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{transfer.sender?.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {/* <ArrowRight className="h-4 w-4 text-gray-400" /> */}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transfer.recipient?.firstName} {transfer.recipient?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{transfer.recipient?.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        ${formatCurrency(transfer.amount)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transfer.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(transfer);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransfers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transfers found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[700px] my-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Transfer Details
            </DialogTitle>
            <DialogDescription>
              Complete information for transfer #{selectedTransfer?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Transfer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Transfer Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Transfer ID:</span>
                  <div className="font-medium">{selectedTransfer?.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <div className="font-medium text-lg">${formatCurrency(selectedTransfer?.amount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <div className="font-medium">{selectedTransfer?.createdAt ? formatDate(selectedTransfer.createdAt) : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Sender Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Sender Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <div className="font-medium">{selectedTransfer?.sender?.firstName} {selectedTransfer?.sender?.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <div className="font-medium">{selectedTransfer?.sender?.email}</div>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <div className="font-medium">{selectedTransfer?.sender?.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Current Balance:</span>
                  <div className="font-medium">${formatCurrency(selectedTransfer?.sender?.balance)}</div>
                </div>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Recipient Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <div className="font-medium">{selectedTransfer?.recipient?.firstName} {selectedTransfer?.recipient?.lastName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <div className="font-medium">{selectedTransfer?.recipient?.email}</div>
                </div>
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <div className="font-medium">{selectedTransfer?.recipient?.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Current Balance:</span>
                  <div className="font-medium">${formatCurrency(selectedTransfer?.recipient?.balance)}</div>
                </div>
              </div>
            </div>

            {/* Transfer Flow Visualization */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Transfer Flow
              </h3>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center flex-1">
                  <div className="font-medium text-gray-900">{selectedTransfer?.sender?.firstName} {selectedTransfer?.sender?.lastName}</div>
                  <div className="text-gray-500 text-xs">{selectedTransfer?.sender?.email}</div>
                  <div className="text-red-600 font-medium mt-1">-${formatCurrency(selectedTransfer?.amount)}</div>
                </div>
                <div className="mx-4">
                  <ArrowRight className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-center flex-1">
                  <div className="font-medium text-gray-900">{selectedTransfer?.recipient?.firstName} {selectedTransfer?.recipient?.lastName}</div>
                  <div className="text-gray-500 text-xs">{selectedTransfer?.recipient?.email}</div>
                  <div className="text-green-600 font-medium mt-1">+${formatCurrency(selectedTransfer?.amount)}</div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransferHistory; 