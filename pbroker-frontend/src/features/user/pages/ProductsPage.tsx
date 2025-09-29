import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, TrendingUp, Shield, Filter, Target, Award } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import InvestmentModal from '../components/products/InvestmentModal';
import OrdersTable from '../components/products/OrdersTable';
import OrderDetailsModal from '../components/products/OrderDetailsModal';
import WalletBalanceCard from '../components/wallet/WalletBalanceCard';
import WalletTransferModal from '../components/wallet/WalletTransferModal';
import { useProducts, useHostingOrders } from '../services/productsService';
import { useProductsStore } from '../store/productsStore';
import type { Product, HostingOrder } from '../api/productsApi';

const ProductsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<HostingOrder | null>(null);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [isWalletTransferModalOpen, setIsWalletTransferModalOpen] = useState(false);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { data: ordersData, isLoading: isLoadingOrders } = useHostingOrders();
  const { filters, setFilters } = useProductsStore();

  const products = productsData?.data || [];
  const orders = ordersData?.data || [];

  const handleInvest = (product: Product) => {
    setSelectedProduct(product);
    setIsInvestmentModalOpen(true);
  };

  const handleViewOrderDetails = (order: HostingOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    if (product.minInvestment < filters.minInvestment) return false;
    if (product.maxInvestment > filters.maxInvestment) return false;
    return true;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Products & Investments</h1>
          <p className="text-gray-400">Discover our comprehensive suite of trading and investment products</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="mb-6">
          <WalletBalanceCard onTransferClick={() => setIsWalletTransferModalOpen(true)} />
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="products" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">Available Products</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Min Investment</label>
                    <input
                      type="number"
                      value={filters.minInvestment}
                      onChange={(e) => setFilters({ minInvestment: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Max Investment</label>
                    <input
                      type="number"
                      value={filters.maxInvestment}
                      onChange={(e) => setFilters({ maxInvestment: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onInvest={handleInvest}
                  />
                ))}
              </div>
            )}

            {/* Why Choose Section */}
            <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Why Choose Our Products?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Secure & Reliable</h3>
                  <p className="text-gray-400 text-sm">Bank-grade security with 24/7 monitoring and insurance protection</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">High Performance</h3>
                  <p className="text-gray-400 text-sm">Advanced technology ensuring fast execution and minimal slippage</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">User-Friendly</h3>
                  <p className="text-gray-400 text-sm">Intuitive interface designed for both beginners and experienced traders</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {/* Order Statistics Cards - Only shown when orders tab is selected */}
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
                            ? (orders.reduce((sum, order) => sum + Number(order.dailyRoiRate), 0) / orders.length).toFixed(2) + '%'
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
                            ? Math.round(orders.reduce((sum, order) => sum + order.durationDays, 0) / orders.length) + ' days'
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
                            ? orders.reduce((sum, order) => sum + Number(order.amount), 0).toLocaleString()
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
                          {orders.filter(order => order.status === 'ACTIVE').length}
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

            <OrdersTable
              orders={orders}
              onViewDetails={handleViewOrderDetails}
              isLoading={isLoadingOrders}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <InvestmentModal
          product={selectedProduct}
          isOpen={isInvestmentModalOpen}
          onClose={() => {
            setIsInvestmentModalOpen(false);
            setSelectedProduct(null);
          }}
        />

        <OrderDetailsModal
          orderId={selectedOrder?.id || null}
          isOpen={isOrderDetailsModalOpen}
          onClose={() => {
            setIsOrderDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
        />

        <WalletTransferModal
          isOpen={isWalletTransferModalOpen}
          onClose={() => setIsWalletTransferModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
