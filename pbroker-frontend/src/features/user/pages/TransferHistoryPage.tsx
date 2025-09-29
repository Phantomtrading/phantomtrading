import React, { useState } from 'react';
import { useAuthStore } from '../../auth/store/store';
import { fetchTransferHistory } from '../api/userApi';
import { formatDate } from '../../../utils/formatDate';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

const TransferHistoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: response, isLoading } = useQuery({
    queryKey: ['transfers', user?.id, filter, currentPage],
    queryFn: () => fetchTransferHistory(user?.id!, filter, currentPage, itemsPerPage),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const transfers = response?.data || [];
  const totalPages = response?.meta.pagination.totalPages || 1;
  const totalItems = response?.meta.pagination.total || 0;

  const handleFilterChange = (newFilter: 'all' | 'sent' | 'received') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

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
        <p className="text-sm text-red-500">Failed to load transfer history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 text-xs rounded-lg ${
              filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('sent')}
            className={`px-3 py-1.5 text-xs rounded-lg ${
              filter === 'sent' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => handleFilterChange('received')}
            className={`px-3 py-1.5 text-xs rounded-lg ${
              filter === 'received' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Received
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((transfer) => {
                const isSent = transfer.sender.id === user?.id;
                const isReceived = transfer.recipient.id === user?.id;
                const otherParty = isSent ? transfer.recipient : transfer.sender;
                
                return (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isSent ? (
                          <ArrowUpRight className="h-3 w-3 text-red-500" />
                        ) : isReceived ? (
                          <ArrowDownLeft className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowRightLeft className="h-3 w-3 text-gray-500" />
                        )}
                        <span className="text-xs font-medium text-[rgba(0,0,0,0.87)]">
                          {isSent ? 'Sent' : isReceived ? 'Received' : 'Transfer'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-medium ${isSent ? 'text-red-500' : 'text-green-500'}`}>
                        {isSent ? '-' : '+'}${parseFloat(transfer.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-gray-500">{formatDate(transfer.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {isSent ? 'To: ' : 'From: '}
                        <span className="font-medium text-[rgba(0,0,0,0.87)]">
                          {otherParty.firstName} {otherParty.lastName}
                        </span>
                        <br />
                        <span className="text-[10px]">{otherParty.email}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} transfers
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
    </div>
  );
};

export default TransferHistoryPage; 