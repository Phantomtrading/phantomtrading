import React, { useState } from 'react';
import { getAllDeposits, updateDeposit, getUserTotalDepositAmount, getDepositsCount } from '../services/adminTransactionService';
import { formatDate } from '../../../utils/formatDate';
import { toast } from "sonner";
import { ArrowDownLeft, Search, Filter, ChevronDown, Check, X, ExternalLink, DollarSign, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminDepositsDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Query for deposits list
  const { data: depositsData, isLoading: isDepositsLoading } = useQuery({
    queryKey: ['deposits', currentPage, statusFilter, searchTerm],
    queryFn: () => getAllDeposits({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined
    })
  });

  // Query for total deposits count
  const { data: depositsCount } = useQuery({
    queryKey: ['depositsCount'],
    queryFn: getDepositsCount
  });

  // Query for total approved amount
  const { data: totalApprovedAmount } = useQuery({
    queryKey: ['totalApprovedAmount'],
    queryFn: () => getUserTotalDepositAmount(1) // Assuming 1 is the admin user ID
  });

  // Mutation for updating deposit status
  const updateStatusMutation = useMutation({
    mutationFn: ({ depositId, status }: { depositId: string; status: string }) => 
      updateDeposit(depositId, status),
    onSuccess: () => {
      toast.success('Deposit status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
    },
    onError: (error) => {
      console.error('Error updating deposit status:', error);
      toast.error('Failed to update deposit status');
    }
  });

  const handleStatusUpdate = (depositId: string, newStatus: string) => {
    updateStatusMutation.mutate({ depositId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isDepositsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-xl">
            <ArrowDownLeft className="h-6 w-6 text-[rgba(0,0,0,0.87)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[rgba(0,0,0,0.87)]">Deposits</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow border p-6 flex flex-col items-center justify-center">
          <div className="p-2 bg-blue-100 rounded-xl mb-2">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-[rgba(0,0,0,0.87)]">
            {depositsCount !== undefined ? depositsCount.toLocaleString() : '...'}
          </div>
          <div className="text-sm text-gray-500 mt-2">Total Deposits</div>
        </div>

        <div className="bg-white rounded-xl shadow border p-6 flex flex-col items-center justify-center">
          <div className="p-2 bg-green-100 rounded-xl mb-2">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-[rgba(0,0,0,0.87)]">
            {totalApprovedAmount?.totalAmount !== undefined 
              ? `$${totalApprovedAmount.totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}` 
              : '...'}
          </div>
          <div className="text-sm text-gray-500 mt-2">Total Approved Amount</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user email or transaction hash"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-[rgba(0,0,0,0.87)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all duration-200"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-[rgba(0,0,0,0.87)] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 appearance-none cursor-pointer transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {!depositsData?.data.length ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No deposits found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {depositsData.data.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {deposit.user.firstName} {deposit.user.lastName}
                          <br />
                          <span className="text-xs text-gray-500">{deposit.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">
                          +${parseFloat(deposit.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {deposit.cryptocurrency.name}
                          <br />
                          <span className="text-xs text-gray-500">{deposit.cryptocurrency.symbol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{formatDate(deposit.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={deposit.proofOfDepositUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          View Proof
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deposit.transactionHash ? (
                          <a
                            href={`https://etherscan.io/tx/${deposit.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {deposit.transactionHash.slice(0, 8)}...
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deposit.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusUpdate(deposit.id, 'APPROVED')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(deposit.id, 'REJECTED')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                              disabled={updateStatusMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, depositsData.data.length)} of {depositsData.data.length} deposits
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-[rgba(0,0,0,0.87)] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={depositsData.data.length < itemsPerPage}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-[rgba(0,0,0,0.87)] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDepositsDashboard; 