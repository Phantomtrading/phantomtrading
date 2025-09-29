import React, { useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { hideTawkWidget, showTawkWidget } from '../../tawk/domain/usecases/initTawk';

const TradePage: React.FC = () => {
  useEffect(() => {
    // Hide Tawk widget on this page
    hideTawkWidget();
    
    return () => {
      // Show Tawk widget when leaving this page (if it should be visible)
      if (window.tawkShouldBeVisible) {
        showTawkWidget();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Trade</h1>
        <p className="text-sm text-gray-500">Manage your transactions and trading activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deposit Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Deposit</CardTitle>
              <div className="p-1.5 bg-green-100 rounded-full">
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <CardDescription className="text-sm">Add funds to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mb-3">
              Deposit funds using various payment methods including bank transfer and cryptocurrency.
            </p>
            <Button className="w-full h-8 text-sm">Start Deposit</Button>
          </CardContent>
        </Card>

        {/* Withdraw Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Withdraw</CardTitle>
              <div className="p-1.5 bg-blue-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <CardDescription className="text-sm">Withdraw your funds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mb-3">
              Withdraw your funds to your preferred payment method or cryptocurrency wallet.
            </p>
            <Button className="w-full h-8 text-sm">Start Withdrawal</Button>
          </CardContent>
        </Card>

        {/* Transfer Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Transfer</CardTitle>
              <div className="p-1.5 bg-purple-100 rounded-full">
                <ArrowLeftRight className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <CardDescription className="text-sm">Transfer between accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mb-3">
              Transfer funds between your different trading accounts or to other users.
            </p>
            <Button className="w-full h-8 text-sm">Start Transfer</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest trading activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No recent transactions
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradePage; 