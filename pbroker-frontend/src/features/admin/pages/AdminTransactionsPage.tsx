import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye,
  RefreshCw,
  DollarSign,
  TrendingUp,
  ArrowDownLeft,
  CreditCard
} from 'lucide-react';
import { useAdminTransactions } from '../services/adminProductsService';
import TransactionDetailsModal from '../components/transactions/TransactionDetailsModal';
import type { AdminTransaction } from '../api/adminProductsApi';

const AdminTransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);

  const { data: transactionsData, isLoading, refetch } = useAdminTransactions({
    page,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter
  });

  const transactions = transactionsData?.data || [];

  // Apply client-side filtering for search
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.userName?.toLowerCase().includes(searchLower) ||
      transaction.userEmail?.toLowerCase().includes(searchLower) ||
      transaction.productName?.toLowerCase().includes(searchLower) ||
      transaction.id?.toLowerCase().includes(searchLower) ||
      transaction.orderId?.toLowerCase().includes(searchLower)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INTEREST':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'PRINCIPAL_RETURN':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewTransaction = (transaction: AdminTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calculate totals with safe checks using filtered transactions
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);
  const interestAmount = filteredTransactions.filter(t => t?.type === 'INTEREST').reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);
  const principalAmount = filteredTransactions.filter(t => t?.type === 'PRINCIPAL_RETURN').reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arbitrage Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all arbitrage-related transactions and user activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interest Paid</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  ${interestAmount.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Principal Returns</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  ${principalAmount.toLocaleString()}
                </p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {filteredTransactions.length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters & Search</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user, product, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INTEREST">Interest</SelectItem>
                <SelectItem value="PRINCIPAL_RETURN">Principal Return</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Page:</span>
              <Select value={page.toString()} onValueChange={(value) => setPage(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.ceil((transactionsData?.meta?.pagination?.totalPages || 1)) }, (_, i) => (
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

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions found</p>
              <p className="text-sm">Transactions will appear here once users start investing</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type || 'UNKNOWN')}
                        <span className="font-mono text-sm">{transaction.id || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.userName || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{transaction.userEmail || 'No email'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.productName || 'Unknown Product'}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(transaction.type || 'UNKNOWN')}>
                        {transaction.type || 'UNKNOWN'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(transaction.amount || 0).toLocaleString()} {transaction.currency || 'USD'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status || 'UNKNOWN')}>
                        {transaction.status || 'UNKNOWN'}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.createdAt ? formatDate(transaction.createdAt) : 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {transactionsData?.meta?.pagination && (
        <div className="text-center text-sm text-gray-500">
          Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, transactionsData.meta.pagination.total)} of {transactionsData.meta.pagination.total} transactions
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default AdminTransactionsPage;
