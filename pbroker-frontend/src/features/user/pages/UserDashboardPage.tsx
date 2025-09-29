import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet, History, Settings, HelpCircle, BarChart2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserDashboardData } from '../services/userDashboardService';
import { useAuthStore } from '../../auth/store/store';

const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['userDashboard', user?.id],
    queryFn: () => getUserDashboardData(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const mainActions = [
    {
      title: "Deposit",
      description: "Add funds to your account",
      icon: <ArrowDownLeft className="h-4 w-4" />,
      onClick: () => navigate('/user/deposit'),
      color: "bg-green-500/10 text-green-500",
      stats: {
        label: "Daily Limit",
        value: "$10,000"
      }
    },
    {
      title: "Withdraw",
      description: "Withdraw funds from your account",
      icon: <ArrowUpRight className="h-4 w-4" />,
      onClick: () => navigate('/user/withdraw'),
      color: "bg-red-500/10 text-red-500",
      stats: {
        label: "Available",
        value: userData?.data.balance.toLocaleString() ?? "0"
      }
    },
    {
      title: "Transfer",
      description: "Transfer funds between accounts",
      icon: <ArrowLeftRight className="h-4 w-4" />,
      onClick: () => navigate('/user/transfer'),
      color: "bg-blue-500/10 text-blue-500",
      stats: {
        label: "Fee",
        value: "0.1%"
      }
    }
  ];

  const sidebarMenu = [
    {
      title: "Trading Details",
      icon: <BarChart2 className="h-4 w-4" />,
      path: "/user/trading"
    },
    {
      title: "Deposit History",
      icon: <History className="h-4 w-4" />,
      path: "/user/deposit-history"
    },
    {
      title: "Withdrawal Info",
      icon: <Wallet className="h-4 w-4" />,
      path: "/user/withdrawal-info"
    },
    {
      title: "Support",
      icon: <HelpCircle className="h-4 w-4" />,
      path: "/user/support"
    },
    {
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
      path: "/user/settings"
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <p className="ml-3 text-sm text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mainActions.map((action, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={action.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">{action.title}</CardTitle>
              <div className={`p-1.5 rounded-full ${action.color}`}>
                {action.icon}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {action.description}
              </CardDescription>
              {action.stats && (
                <div className="mt-2 text-xs text-gray-500">
                  <span>{action.stats.label}: </span>
                  <span className="font-medium text-gray-900">{action.stats.value}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {sidebarMenu.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-8 text-sm"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Balance</p>
                  <p className="text-lg font-bold text-gray-900">${userData?.data.balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-xs text-gray-900">{userData?.data.lastDeposit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage; 