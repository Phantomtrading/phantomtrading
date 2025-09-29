import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ 
  symbol = 'BTC/USDT', 
  theme = 'dark'
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined' && container.current) {
        // Convert symbol format from BTC/USDT to BINANCE:BTCUSDT
        const formattedSymbol = `BINANCE:${symbol.replace('/', '')}`;
        
        new window.TradingView.widget({
          container_id: container.current.id,
          symbol: formattedSymbol,
          interval: '1',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          height: '100%',
          hideideas: true,
          save_image: false,
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies',
            'MACD@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [symbol, theme]);

  return (
    <div 
      id={`tradingview_${symbol.replace('/', '')}`} 
      ref={container} 
      className="w-full h-full"
    />
  );
};

export default TradingViewWidget;