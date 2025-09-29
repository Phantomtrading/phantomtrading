// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Users, TrendingUp, Activity, AlertCircle, ArrowUpRight, CheckCircle, Banknote, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardMetrics, fetchTradeStats, fetchTradeTimeSeries, fetchAllWithdrawals, fetchAllTransfers } from '../api/adminApi';
import {
  AreaChart,
  Area,
  // LineChart,
  // Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#16A34A', '#DC2626', '#FBBF24', '#3B82F6'];

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

const AdminDashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: tradeStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['tradeStats'],
    queryFn: fetchTradeStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading, error: timeSeriesError } = useQuery({
    queryKey: ['tradeTimeSeries', 'week'],
    queryFn: () => fetchTradeTimeSeries('week'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: fetchAllWithdrawals,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: transfersData, isLoading: transfersLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => fetchAllTransfers({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = metricsLoading || statsLoading || timeSeriesLoading || withdrawalsLoading || transfersLoading;
  const hasError = metricsError || statsError || timeSeriesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-50"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const winRateData = [
    { name: 'Win', value: tradeStats?.winTrades || 0 },
    { name: 'Lose', value: tradeStats?.loseTrades || 0 },
    { name: 'Neutral', value: tradeStats?.neutralTrades || 0 }
  ].filter(item => item.value > 0);

  const withdrawals = withdrawalsData?.data || [];
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
  const totalWithdrawalAmount = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
  const totalWithdrawalFees = withdrawals.reduce((sum, w) => sum + parseFloat(w.fee), 0);

  const transfers = transfersData?.data || [];
  const totalTransferAmount = transfers.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <main className="flex w-full flex-col bg-slate-50/50">
      <div className="flex-1 space-y-6 p-2 sm:p-4 md:p-8 pt-4 sm:pt-6">
        <div className="mb-4 sm:mb-6">
          {/* <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">Admin Dashboard</h1> */}
          {/* <p className="text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">Overview of platform performance and user activity</p> */}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ${formatCurrency(metrics?.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">From transaction fees</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {metrics?.totalUsers?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {metrics?.totalTrades?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">All time trades</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {metrics?.activeTrades?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Currently pending</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Trade Volume</CardTitle>
            </CardHeader>
            <CardContent className="pl-0 sm:pl-2">
              <div className="w-full min-w-0">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={timeSeriesData?.trades || []} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${(value as number / 1000).toFixed(0)}k`} fontSize={10} />
                    <Tooltip formatter={(value: any) => [`$${formatCurrency(value)}`, 'Volume']} />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Trade Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full min-w-0">
                {winRateData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={winRateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {winRateData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [Number(value).toLocaleString(), 'Trades']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-slate-500">
                    No trade data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm"><CheckCircle className="h-5 w-5 text-green-500"/> Trade Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Win Rate</span>
                  <span className="text-xs sm:text-sm font-medium text-green-600">
                    {metrics?.winRate?.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Average Trade Amount</span>
                  <span className="text-xs sm:text-sm font-medium">
                    ${formatCurrency(metrics?.averageTradeAmount).split('.')[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Total Volume</span>
                  <span className="text-xs sm:text-sm font-medium">
                    ${formatCurrency(tradeStats?.totalVolume).split('.')[0]}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm"><Banknote className="h-5 w-5 text-blue-500" /> Deposit Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Total Deposits</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {metrics?.totalDeposits?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Pending Deposits</span>
                  <span className="text-xs sm:text-sm font-medium text-yellow-600">
                    {metrics?.pendingDeposits?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Approved Rate</span>
                  <span className="text-xs sm:text-sm font-medium text-green-600">
                    {metrics?.totalDeposits && metrics.totalDeposits > 0 
                      ? (((metrics.totalDeposits - (metrics.pendingDeposits || 0)) / metrics.totalDeposits) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm"><ArrowRightLeft className="h-5 w-5 text-orange-500" /> Withdrawal Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Total Withdrawals</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {withdrawals.length.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Pending Withdrawals</span>
                  <span className="text-xs sm:text-sm font-medium text-yellow-600">
                    {pendingWithdrawals.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Total Amount</span>
                  <span className="text-xs sm:text-sm font-medium">
                    ${formatCurrency(totalWithdrawalAmount).split('.')[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Total Fees</span>
                  <span className="text-xs sm:text-sm font-medium text-green-600">
                    ${formatCurrency(totalWithdrawalFees)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm"><ArrowUpRight className="h-5 w-5 text-indigo-500"/> Transfer Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Total Transfers</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {transfers.length.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Transfer Volume</span>
                  <span className="text-xs sm:text-sm font-medium">
                    ${formatCurrency(totalTransferAmount).split('.')[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Average Transfer</span>
                  <span className="text-xs sm:text-sm font-medium">
                    ${formatCurrency(transfers.length > 0 ? totalTransferAmount / transfers.length : 0).split('.')[0]}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;