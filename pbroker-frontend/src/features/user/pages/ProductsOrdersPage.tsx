import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, RefreshCw, TrendingUp, Target, Package, Award } from 'lucide-react';
import OrdersTable from '../components/products/OrdersTable';
import OrderDetailsModal from '../components/products/OrderDetailsModal';
import { useHostingOrders } from '../services/productsService';
import type { HostingOrder } from '../api/productsApi';

const ProductsOrdersPage: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<HostingOrder | null>(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: ordersData, isLoading, refetch } = useHostingOrders(page, 10);
  const orders = ordersData?.data || [];

  const handleViewOrderDetails = (order: HostingOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (order.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Hosting Orders</h1>
          <p className="text-gray-400">Track and manage your investment orders</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters & Search</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by product name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Page:</span>
                <Select value={page.toString()} onValueChange={(value) => setPage(parseInt(value))}>
                  <SelectTrigger className="w-20 bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {Array.from({ length: Math.ceil((ordersData?.meta?.pagination?.totalPages || 1) / 10) }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Statistics Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Avg Daily ROI */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Daily ROI</p>
                    <p className="text-2xl font-bold text-green-400">
                      {orders.length > 0 
                        ? (orders.reduce((sum, order) => sum + Number(order.dailyRoiRate || 0), 0) / orders.length).toFixed(2) + '%'
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Duration */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Duration</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {orders.length > 0 
                        ? Math.round(orders.reduce((sum, order) => sum + (order.durationDays || 0), 0) / orders.length) + ' days'
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Investment */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Investment</p>
                    <p className="text-2xl font-bold text-purple-400">
                      ${orders.length > 0 
                        ? orders.reduce((sum, order) => sum + Number(order.amount || 0), 0).toLocaleString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Orders</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {orders.filter(order => order?.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Award className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          onViewDetails={handleViewOrderDetails}
          isLoading={isLoading}
        />

        {/* Pagination Info */}
        {ordersData?.meta?.pagination && (
          <div className="mt-6 text-center text-sm text-gray-400">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, ordersData.meta.pagination.total)} of {ordersData.meta.pagination.total} orders
          </div>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal
          orderId={selectedOrder?.id || null}
          isOpen={isOrderDetailsModalOpen}
          onClose={() => {
            setIsOrderDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      </div>
    </div>
  );
};

export default ProductsOrdersPage;
