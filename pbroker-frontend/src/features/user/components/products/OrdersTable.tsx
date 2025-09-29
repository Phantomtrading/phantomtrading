import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, Package, RefreshCw } from 'lucide-react';
import type { HostingOrder } from '../../api/productsApi';

interface OrdersTableProps {
  orders: HostingOrder[];
  onViewDetails: (order: HostingOrder) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const getStatusIcon = (status: string | undefined) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'ACTIVE':
      return <AlertCircle className="h-4 w-4 text-blue-600" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-blue-900 text-blue-400 border border-blue-700';
    case 'COMPLETED':
      return 'bg-green-900 text-green-400 border border-green-700';
    case 'CANCELLED':
      return 'bg-red-900 text-red-400 border border-red-700';
    default:
      return 'bg-gray-700 text-gray-400 border border-gray-600';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};



const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onViewDetails, isLoading = false, onRefresh }) => {
  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Hosting Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Hosting Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No hosting orders found</p>
            <p className="text-sm">Start investing in our products to see your orders here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Hosting Orders</CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center space-x-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
                                <TableHead className="text-gray-400">Product</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Daily Rate</TableHead>
                  <TableHead className="text-gray-400">Earned Interest</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Duration</TableHead>
                  <TableHead className="text-gray-400">Created</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-gray-700 hover:bg-gray-700">
                <TableCell className="font-medium text-white">
                  {order.productName ?? (order as any)?.product?.name ?? order.productId ?? '—'}
                </TableCell>
                <TableCell className="text-white">{Number(order.amount ?? 0).toLocaleString()} {order.currency ?? ''}</TableCell>
                <TableCell className="text-green-500 font-medium">
                  {order.dailyRoiRate ?? '—'}%
                </TableCell>
                <TableCell className="text-green-500 font-medium">
                  {Number(order.earnedInterest ?? 0).toFixed(2)} {order.currency ?? ''}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status as any)}
                    <Badge className={getStatusColor((order.status as any) || '')}>
                      {order.status ?? '—'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-white">
                  {order.durationDays ?? '—'} {order.durationDays === 1 ? 'day' : 'days'}
                </TableCell>
                <TableCell className="text-white">{order.createdAt ? formatDate(order.createdAt) : '—'}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(order)}
                    className="flex items-center space-x-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
