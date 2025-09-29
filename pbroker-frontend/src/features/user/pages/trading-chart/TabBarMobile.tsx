import React from 'react';
import { TrendingUp, BarChart2, DollarSign } from 'lucide-react';

interface TabBarMobileProps {
  mobileTab: string;
  setMobileTab: (tab: string) => void;
}

const TabBarMobile: React.FC<TabBarMobileProps> = ({ mobileTab, setMobileTab }) => (
  <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800 flex md:hidden">
    <button
      className={`flex-1 flex flex-col items-center py-2 ${mobileTab === 'market' ? 'text-blue-500' : 'text-gray-400'}`}
      onClick={() => setMobileTab('market')}
    >
      <TrendingUp className="h-5 w-5 mb-1" />
      <span className="text-xs">Market</span>
    </button>
    <button
      className={`flex-1 flex flex-col items-center py-2 ${mobileTab === 'chart' ? 'text-blue-500' : 'text-gray-400'}`}
      onClick={() => setMobileTab('chart')}
    >
      <BarChart2 className="h-5 w-5 mb-1" />
      <span className="text-xs">Chart</span>
    </button>
    <button
      className={`flex-1 flex flex-col items-center py-2 ${mobileTab === 'trade' ? 'text-blue-500' : 'text-gray-400'}`}
      onClick={() => setMobileTab('trade')}
    >
      <DollarSign className="h-5 w-5 mb-1" />
      <span className="text-xs">Trade</span>
    </button>
  </div>
);

export default TabBarMobile; 