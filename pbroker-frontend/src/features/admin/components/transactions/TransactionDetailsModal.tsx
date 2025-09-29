import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, CreditCard, User, Package } from 'lucide-react';
import type { AdminTransaction } from '../../api/adminProductsApi';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: AdminTransaction | null;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'INTEREST':
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    case 'PRINCIPAL_RETURN':
      return <DollarSign className="h-5 w-5 text-blue-600" />;
    default:
      return <CreditCard className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'INTEREST':
      return 'bg-green-100 text-green-800';
    case 'PRINCIPAL_RETURN':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getTypeIcon(transaction.type)}
            <span>Transaction Details</span>
          </DialogTitle>
          <DialogDescription>
            Detailed information about this arbitrage transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transaction Overview</span>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-sm">{transaction.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">{transaction.amount.toLocaleString()} {transaction.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(transaction.type)}
                    <span className="font-medium capitalize">{transaction.type}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono text-sm">{transaction.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{transaction.userName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{transaction.userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Product Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-gray-500">Product Name</p>
                <p className="font-medium">{transaction.productName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Transaction Created</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Transaction Date</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.transactionDate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Status</span>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {transaction.status === 'SUCCESS' && (
                    <p>✅ Transaction has been successfully processed and completed.</p>
                  )}
                  {transaction.status === 'PENDING' && (
                    <p>⏳ Transaction is currently being processed and awaiting completion.</p>
                  )}
                  {transaction.status === 'FAILED' && (
                    <p>❌ Transaction failed to process. Please review the details and contact support if needed.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Transaction Type Code</p>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded">{transaction.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status Code</p>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded">{transaction.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created Timestamp</p>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{transaction.createdAt}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transaction Date</p>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{transaction.transactionDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
