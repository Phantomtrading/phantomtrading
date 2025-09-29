import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Settings2, BarChart2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-8">
      {/* Page title */}
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Settings</h1>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Cryptocurrencies card */}
        <Card
          onClick={() => navigate('/admin/cryptocurrency-configuration')}
          className="
            group cursor-pointer bg-white rounded-lg shadow 
            hover:shadow-md transition p-5 flex items-start space-x-4
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        >
          <div
            className="
              bg-gradient-to-br from-blue-500 to-blue-600
              p-4 rounded-full shadow-lg
              flex items-center justify-center
              transition-transform transform
              group-hover:scale-110
            "
          >
            <Settings2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg text-gray-800 font-medium">
              Cryptocurrencies
            </CardTitle>
            <CardContent className="text-sm text-gray-600 mt-1">
              Manage supported cryptocurrencies
            </CardContent>
          </div>
        </Card>

        {/* Trading Pairs card */}
        <Card
          onClick={() => navigate('/admin/trading-pair-configuration')}
          className="
            group cursor-pointer bg-white rounded-lg shadow 
            hover:shadow-md transition p-5 flex items-start space-x-4
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        >
          <div
            className="
              bg-gradient-to-br from-green-500 to-green-600
              p-4 rounded-full shadow-lg
              flex items-center justify-center
              transition-transform transform
              group-hover:scale-110
            "
          >
            <BarChart2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg text-gray-800 font-medium">
              Trading Pairs
            </CardTitle>
            <CardContent className="text-sm text-gray-600 mt-1">
              Configure trading pairs
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
