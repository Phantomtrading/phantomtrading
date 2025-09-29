import React from 'react';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  price: number;
  change24h: number;
}

interface MarketOverviewMobileProps {
  marketData: Coin[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
}

const MarketOverviewMobile: React.FC<MarketOverviewMobileProps> = ({ marketData, selectedSymbol, setSelectedSymbol }) => (
  <div className="p-3 w-full">
    <h3 className="text-white font-semibold mb-4">Market Overview</h3>
    <div className="space-y-3">
      {marketData?.map((coin) => (
        <div
          key={coin.id}
          className={`bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors${selectedSymbol.startsWith(coin.symbol) ? ' ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedSymbol(`${coin.symbol}USDT`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {coin.logoUrl && (
                <img src={coin.logoUrl} alt={coin.name} className="w-6 h-6 rounded-full" />
              )}
              <span className="text-white font-medium">{coin.symbol}</span>
            </div>
            <div className="text-right">
              <div className="text-white">${coin.price.toLocaleString()}</div>
              <div className={`flex items-center text-sm ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}> 
                {coin.change24h >= 0 ? '+' : '-'}{Math.abs(coin.change24h).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MarketOverviewMobile; 