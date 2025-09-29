import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../../auth/store/store';
import {
  fetchDepositHistoryService,
  fetchWithdrawalHistoryService
} from '../services/transactionService';
import { fetchTransferHistory } from '../api/userApi';
import { formatDate } from '../../../utils/formatDate';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  Area,
  Bar,
  Legend
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Clock1,
  Calendar,
  Wallet
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserById } from '../services/userService';

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ label, value, icon, colorClass }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-900">${value.toFixed(2)}</p>
    </div>
  </div>
);

const ChartCard: React.FC<{
  title: string;
  data: any[];
  dataKey: string;
  lineColor: string;
}> = ({ title, data, dataKey, lineColor }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tickFormatter={d => formatDate(d, 'MM/dd')}
            padding={{ left: 10, right: 10 }}
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
            formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
            labelFormatter={label => `Date: ${formatDate(label)}`}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={lineColor}
            dot={{ r: 2, fill: lineColor }}
            strokeWidth={1.5}
            activeDot={{ r: 4, fill: lineColor }}
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={lineColor}
            fill={`url(#gradient-${dataKey})`}
            strokeWidth={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const TradingDetails: React.FC = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: userData, isLoading: userLoading } = useUserById(user?.id || 0);

  const { data: deposits = [], isLoading: depsLoading } = useQuery({
    queryKey: ['deposits', user?.id],
    queryFn: () => fetchDepositHistoryService(user?.id!),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: withdrawals = [], isLoading: wdsLoading } = useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: () => fetchWithdrawalHistoryService(user?.id!),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: transfers = [], isLoading: trsLoading } = useQuery({
    queryKey: ['transfers', user?.id],
    queryFn: () => fetchTransferHistory(user?.id!, 'all', 1, 100).then(r => r.data || []),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const loading = depsLoading || wdsLoading || trsLoading || userLoading;

  const startDate = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }, [timeRange]);

  const filterByDate = (arr: any[]) =>
    arr.filter(x => new Date(x.createdAt) >= startDate);

  const buildDaily = (arr: any[], type: 'deposit' | 'withdrawal' | 'transfer') => {
    const map: Record<string, number> = {};
    filterByDate(arr).forEach(item => {
      const date = item.createdAt.slice(0, 10);
      let amt = parseFloat(item.amount);
      if (type === 'withdrawal') amt = -amt;
      if (type === 'transfer') {
        const sign = item.sender?.id === user?.id ? -1 : 1;
        amt *= sign;
      }
      map[date] = (map[date] || 0) + amt;
    });
    return Object.entries(map)
      .map(([date, amount]) => ({ date, [type]: Math.abs(amount) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const depositsDaily = useMemo(() => buildDaily(deposits, 'deposit'), [deposits, startDate]);
  const withdrawalsDaily = useMemo(() => buildDaily(withdrawals, 'withdrawal'), [withdrawals, startDate]);
  const transfersDaily = useMemo(() => buildDaily(transfers, 'transfer'), [transfers, startDate]);

  const stats = useMemo(() => {
    const sum = (arr: any[]) => arr.reduce((s, x) => s + parseFloat(x.amount), 0);
    const deps = sum(filterByDate(deposits));
    const wds = sum(filterByDate(withdrawals));
    const trs = filterByDate(transfers).reduce((s, x) => {
      const amt = parseFloat(x.amount);
      return s + (x.sender?.id === user?.id ? -amt : amt);
    }, 0);
    return [
      { 
        label: 'Total Deposits', 
        value: deps, 
        icon: <ArrowUpRight className="w-6 h-6 text-green-600"/>, 
        color: 'bg-green-100'
      },
      { 
        label: 'Total Withdrawals', 
        value: wds, 
        icon: <ArrowDownLeft className="w-6 h-6 text-red-600"/>, 
        color: 'bg-red-100'
      },
      { 
        label: 'Total Transfers', 
        value: trs, 
        icon: <ArrowRightLeft className="w-6 h-6 text-blue-600"/>, 
        color: 'bg-blue-100'
      }
    ];
  }, [deposits, withdrawals, transfers, startDate]);

  const combinedDaily = useMemo(() => {
    const map: Record<string, { deposit: number; withdrawal: number; transfer: number }> = {};
    filterByDate(deposits).forEach(d => {
      const date = d.createdAt.slice(0,10);
      map[date] = map[date] || { deposit: 0, withdrawal: 0, transfer: 0 };
      map[date].deposit += parseFloat(d.amount);
    });
    filterByDate(withdrawals).forEach(w => {
      const date = w.createdAt.slice(0,10);
      map[date] = map[date] || { deposit: 0, withdrawal: 0, transfer: 0 };
      map[date].withdrawal += parseFloat(w.amount);
    });
    filterByDate(transfers).forEach(t => {
      const date = t.createdAt.slice(0,10);
      map[date] = map[date] || { deposit: 0, withdrawal: 0, transfer: 0 };
      const sign = t.sender?.id === user?.id ? -1 : 1;
      map[date].transfer += parseFloat(t.amount) * sign;
    });
    return Object.entries(map)
      .map(([date, vals]) => ({
        date,
        deposit: vals.deposit,
        withdrawal: Math.abs(vals.withdrawal),
        transfer: Math.abs(vals.transfer)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [deposits, withdrawals, transfers, startDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Clock1 className="animate-spin text-gray-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h4 className="text-md font-bold text-gray-900">Trading Overview</h4>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
            <SelectTrigger className="w-[150px] h-8 text-sm">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={parseFloat(userData?.balance || '0')}
          icon={<Wallet className="w-6 h-6 text-purple-600"/>}
          colorClass="bg-purple-100"
        />
        {stats.map(s => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            colorClass={s.color}
          />
        ))}
      </div>

      {/* Individual Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Deposits Over Time"
          data={depositsDaily}
          dataKey="deposit"
          lineColor="#10B981"
        />
        <ChartCard
          title="Withdrawals Over Time"
          data={withdrawalsDaily}
          dataKey="withdrawal"
          lineColor="#EF4444"
        />
        <ChartCard
          title="Transfers Over Time"
          data={transfersDaily}
          dataKey="transfer"
          lineColor="#3B82F6"
        />
      </div>

      {/* Full-Width Combined Mixed Chart */}
      <div className="w-full">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-900">Overall Activity</h2>
            <div className="text-xs text-gray-500">
              {formatDate(startDate.toISOString())} - {formatDate(new Date().toISOString())}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedDaily} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradDeposit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis
                  dataKey="date"
                  tickFormatter={d => formatDate(d, 'MM/dd')}
                  padding={{ left: 10, right: 10 }}
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
                  labelFormatter={label => `Date: ${formatDate(label)}`}
                />
                <Legend 
                  verticalAlign="top" 
                  height={30}
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="deposit"
                  stroke="#10B981"
                  fill="url(#gradDeposit)"
                  strokeWidth={1.5}
                  animationDuration={800}
                />
                <Bar
                  dataKey="withdrawal"
                  barSize={15}
                  fill="#EF4444"
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="transfer"
                  stroke="#3B82F6"
                  dot={false}
                  strokeWidth={1.5}
                  animationDuration={800}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDetails;
