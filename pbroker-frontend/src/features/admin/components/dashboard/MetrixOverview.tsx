import React from 'react';
import { MetricCard } from './MetricCard';
import { DollarSign, Users, Package, AlertCircle } from 'lucide-react';

export const MetricsOverview: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <MetricCard
      label="Total Revenue"
      value="$45,231.89"
      description="+20.1% from last month"
      icon={DollarSign}
    />
    <MetricCard
      label="Active Customers"
      value="+2,350"
      description="+180.1% from last month"
      icon={Users}
    />
    <MetricCard
      label="Inventory Items"
      value="12,234"
      description="19% low stock"
      icon={Package}
    />
    <MetricCard
      label="Pending Orders"
      value="573"
      description="12 require attention"
      icon={AlertCircle}
    />
  </div>
);
