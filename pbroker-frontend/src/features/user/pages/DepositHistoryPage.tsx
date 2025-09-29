import React, { useState } from 'react';
import { useAuthStore } from '../../auth/store/store';
import { fetchDepositHistory, type DepositHistory } from '../api/userApi';
import { formatDate } from '../../../utils/formatDate';
import { Filter, ChevronDown, X } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

interface DepositHistoryResponse {
  data: DepositHistory[];
  meta: {
    pagination: {
      total: number;
      totalPages: number;
    };
  };
}

const DepositHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositHistory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: response, isLoading } = useQuery<DepositHistoryResponse>({
    queryKey: ['deposits', user?.id, statusFilter, currentPage],
    queryFn: async () => {
      const result = await fetchDepositHistory(user?.id!);
      return {
        data: result,
        meta: {
          pagination: {
            total: result.length,
            totalPages: Math.ceil(result.length / itemsPerPage)
          }
        }
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const deposits = response?.data || [];
  const totalPages = response?.meta.pagination.totalPages || 1;
  const totalItems = response?.meta.pagination.total || 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-red-500">Failed to load deposit history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 pl-8 pr-8 rounded-lg border border-gray-200 bg-white text-[rgba(0,0,0,0.87)] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 appearance-none cursor-pointer transition-all duration-200 text-xs"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Crypto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Proof</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tx Hash</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deposits.map((deposit: DepositHistory) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">{deposit.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">{deposit.cryptoSymbol}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">{formatCurrency(deposit.amount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    <Link
                      to={`/user/proofs/${deposit.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">{deposit.transactionHash || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">{formatDate(deposit.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                      deposit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedDeposit(deposit)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} deposits
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 text-[rgba(0,0,0,0.87)] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 text-[rgba(0,0,0,0.87)] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Deposit Details</h2>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Deposit ID</p>
                <p className="text-sm font-medium text-gray-900">{selectedDeposit.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Crypto</p>
                <p className="text-sm font-medium text-gray-900">{selectedDeposit.cryptoName} ({selectedDeposit.cryptoSymbol})</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedDeposit.amount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositHistoryPage; 