import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';

import { useHostingOrderById } from '../../services/productsService';

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'active':
      return <AlertCircle className="h-5 w-5 text-blue-600" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-900 text-yellow-400 border border-yellow-700';
    case 'active':
      return 'bg-blue-900 text-blue-400 border border-blue-700';
    case 'completed':
      return 'bg-green-900 text-green-400 border border-green-700';
    case 'cancelled':
      return 'bg-red-900 text-red-400 border border-red-700';
    default:
      return 'bg-gray-700 text-gray-400 border border-gray-600';
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

const formatDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  
  if (diffSeconds < 60) return `${diffSeconds} seconds`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)} days`;
  return `${Math.floor(diffSeconds / 2592000)} months`;
};

const getTransactionTypeIcon = (type: string) => {
  switch (type) {
    case 'investment':
      return <DollarSign className="h-4 w-4 text-blue-600" />;
    case 'return':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'fee':
      return <DollarSign className="h-4 w-4 text-red-600" />;
    default:
      return <DollarSign className="h-4 w-4 text-gray-600" />;
  }
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, isOpen, onClose }) => {
  const { data: orderDetails, isLoading, error } = useHostingOrderById(orderId || '');

  if (!orderId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Order Details</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed information about your hosting order
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Failed to load order details</p>
            <p className="text-sm">Please try again later</p>
          </div>
        )}

        {orderDetails && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Order Summary</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(orderDetails.status)}
                    <Badge className={getStatusColor(orderDetails.status)}>
                      {orderDetails.status}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Product</p>
                    <p className="font-medium text-white">{orderDetails.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="font-medium text-white">{orderDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Investment Amount</p>
                    <p className="font-medium text-white">${orderDetails.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Daily Rate</p>
                    <p className="font-medium text-green-500">{orderDetails.dailyRoiRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="font-medium text-white">{formatDate(orderDetails.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">End Date</p>
                    <p className="font-medium text-white">{formatDate(orderDetails.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-medium text-white">{formatDuration(orderDetails.startDate, orderDetails.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="font-medium text-white">{formatDate(orderDetails.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-800 border border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-400">Total Invested</p>
                    <p className="text-xl font-bold text-blue-500">${orderDetails.totalInvested.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 border border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-400">Total Returned</p>
                    <p className="text-xl font-bold text-green-500">${orderDetails.totalReturned.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 border border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-400">Current Value</p>
                    <p className="text-xl font-bold text-purple-500">${orderDetails.currentValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {orderDetails.transactions.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <p>No transactions found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-600">
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">Amount</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-gray-600 hover:bg-gray-600">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTransactionTypeIcon(transaction.type)}
                              <span className="capitalize text-white">{transaction.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-white">
                            ${transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{formatDate(transaction.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
