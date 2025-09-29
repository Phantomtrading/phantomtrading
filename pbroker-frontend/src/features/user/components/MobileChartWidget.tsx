import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface MobileChartWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

const MobileChartWidget: React.FC<MobileChartWidgetProps> = ({ 
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
          width: '100%',
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
          // Mobile-specific optimizations
          hide_top_toolbar: false,
          hide_side_toolbar: true,
          hide_legend: false,
          overrides: {
            'mainSeriesProperties.candleStyle.wickUpColor': '#00ff00',
            'mainSeriesProperties.candleStyle.wickDownColor': '#ff0000',
            'mainSeriesProperties.candleStyle.upColor': '#00ff00',
            'mainSeriesProperties.candleStyle.downColor': '#ff0000',
            'mainSeriesProperties.candleStyle.borderUpColor': '#00ff00',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ff0000',
            'mainSeriesProperties.candleStyle.wickThickness': 1,
            'mainSeriesProperties.candleStyle.borderThickness': 1,
            'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
          },
          studies_overrides: {
            'volume.volume.color.0': '#ff0000',
            'volume.volume.color.1': '#00ff00',
          },
          loading_screen: { 
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            foregroundColor: theme === 'dark' ? '#ffffff' : '#000000'
          },
          // Mobile responsive settings
          autosize: true,
          responsive: true,
          // Disable some features for mobile performance
          hide_left_toolbar: true,
          hide_right_scale: false,
          hide_time_scale: false,
          // Chart type and settings optimized for mobile
          chart_type: 'candlestick',
          time_frames: [
            { text: "1m", resolution: "1" },
            { text: "5m", resolution: "5" },
            { text: "15m", resolution: "15" },
            { text: "1h", resolution: "60" },
            { text: "4h", resolution: "240" },
            { text: "1d", resolution: "1D" }
          ]
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, theme]);

  return (
    <div 
      id={`mobile_tradingview_${symbol.replace('/', '')}`} 
      ref={container} 
      className="w-full h-full"
      style={{ 
        background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        touchAction: 'manipulation'
      }}
    />
  );
};

export default MobileChartWidget; 