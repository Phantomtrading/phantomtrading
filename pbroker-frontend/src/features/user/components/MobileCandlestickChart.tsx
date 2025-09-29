import React, { useEffect, useRef, useState } from 'react';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MobileCandlestickChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
  data?: CandleData[];
}

const MobileCandlestickChart: React.FC<MobileCandlestickChartProps> = ({ 
  symbol = 'BTC/USDT', 
  theme = 'dark',
  data = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [price, setPrice] = useState<number>(0);
  const [change, setChange] = useState<number>(0);

  // Use provided data or empty array if no data available
  const chartData = data.length > 0 ? data : [];  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 20;

    // Calculate price range
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Calculate time range
    const times = chartData.map(d => d.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime;

    // Draw candlesticks
    chartData.forEach((candle) => {
      const x = padding + (candle.time - minTime) / timeRange * (width - 2 * padding);
      const candleWidth = 8;
      
      // Calculate y positions
      const openY = height - padding - (candle.open - minPrice) / priceRange * (height - 2 * padding);
      const closeY = height - padding - (candle.close - minPrice) / priceRange * (height - 2 * padding);
      const highY = height - padding - (candle.high - minPrice) / priceRange * (height - 2 * padding);
      const lowY = height - padding - (candle.low - minPrice) / priceRange * (height - 2 * padding);

      // Determine color
      const isGreen = candle.close >= candle.open;
      ctx.strokeStyle = isGreen ? '#00ff00' : '#ff0000';
      ctx.fillStyle = isGreen ? '#00ff00' : '#ff0000';

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
    });

    // Update current price
    if (chartData.length > 0) {
      const latest = chartData[chartData.length - 1];
      setPrice(latest.close);
      setChange(((latest.close - chartData[0].open) / chartData[0].open) * 100);
    }

  }, [chartData, theme]);

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 p-3 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold">{symbol}</h3>
            <div className="text-sm text-gray-400">Price Chart</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">${price.toLocaleString()}</div>
            <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ 
            background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            touchAction: 'none'
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 bg-gray-800 p-2 border-t border-gray-700">
        <div className="flex justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Bullish</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Bearish</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCandlestickChart; 