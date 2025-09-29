// TradingChartPage.tsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { hideTawkWidget, showTawkWidget } from '../../../tawk/domain/usecases/initTawk';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import TradingViewWidget from '../../components/TradingViewWidget';
import MobileChartWidget from '../../components/MobileChartWidget';
import MarketOverview from './MarketOverview';
import MarketOverviewMobile from './MarketOverviewMobile';
import TradeForm from './TradeForm';
import TradeFormMobile from './TradeFormMobile';
import TabBarMobile from './TabBarMobile';

import { History } from 'lucide-react';

import {
  getTradingPairs,
  createTradeRequest,
  getTradeById
} from '../../services/tradingService';
import { fetchMarketData } from '../../api/userApi';
import type { TradeRequest, MarketData } from '../../api/userApi';

const TradingChartPage: React.FC = () => {
  /* ──────────────────────────────
     1.  Local state & helpers
  ────────────────────────────── */
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradingAmountQuote, setTradingAmountQuote] = useState('');
  const [tradeExpirationTimeSeconds, setTradeExpirationTimeSeconds] =
    useState('60');
  const [mobileTab, setMobileTab] =
    useState<'chart' | 'market' | 'trade'>('chart');
  const [timer, setTimer] = useState<number | null>(null);
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [tradeResult, setTradeResult] = useState<'win' | 'lose' | null>(null);
  const [lastTradeId, setLastTradeId] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState(false);
  const [lastTrade, setLastTrade] = useState<any>(null);

  // Hide Tawk widget on mount, show on unmount
  useEffect(() => {
    hideTawkWidget();
    return () => {
      if (window.tawkShouldBeVisible) {
        showTawkWidget();
      }
    };
  }, []);

  /* ──────────────────────────────
     2.  Data-fetching hooks
  ────────────────────────────── */
  const {
    data: tradingPairs = [],
    isLoading: isLoadingPairs,
    error: tradingPairsError
  } = useQuery({
    queryKey: ['tradingPairs'],
    queryFn: getTradingPairs
  });

  // Add effect to update tradingAmountQuote when expiration changes
  React.useEffect(() => {
    const selectedPair = tradingPairs.find(pair => pair.pairName === selectedSymbol);
    const tradeOptions = selectedPair?.tradeOptions || [];
    const selectedTradeOption = tradeOptions.find(opt => opt.durationSeconds.toString() === tradeExpirationTimeSeconds);
    if (selectedTradeOption) {
      setTradingAmountQuote(String(selectedTradeOption.minAmountQuote));
    }
  }, [tradeExpirationTimeSeconds, selectedSymbol, tradingPairs]);

  const { data: marketData } = useQuery({
    queryKey: ['marketData'],
    queryFn: () => fetchMarketData({ page: 1, limit: 50 }),
    refetchInterval: 10_000
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerStatus === 'running' && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timer === 0 && timerStatus === 'running') {
      setTimerStatus('done');
      // Simulate win/lose (replace with real result logic if available)
      setTradeResult(Math.random() > 0.5 ? 'win' : 'lose');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, timerStatus]);

  /* ──────────────────────────────
     3.  Mutation hook
  ────────────────────────────── */
  const createTradeMutation = useMutation({
    mutationFn: createTradeRequest,
    onSuccess: (trade) => {
      queryClient.invalidateQueries({ queryKey: ['userTrades'] });
      toast.success('Trade request created successfully');
      setTradingAmountQuote('');

      if (
        trade &&
        trade.id &&
        trade.createdAt &&
        trade.tradeExpirationTimeSeconds
      ) {
        localStorage.setItem(
          'lastTradeInfo',
          JSON.stringify({
            tradeId: trade.id,
            createdAt: trade.createdAt,
            tradeExpirationTimeSeconds: trade.tradeExpirationTimeSeconds
          })
        );
        setLastTradeId(trade.id);
        setLastTrade(trade);
      }
      // Start timer after successful trade
      if (selectedTradeOption) {
        setTimer(Number(selectedTradeOption.durationSeconds));
        setTimerStatus('running');
      }
      setTradeResult(null);
      setPendingResult(false);
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to create trade request';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (error.response?.status === 500) {
        errorMessage = 'Server error – please check the console for details';
      }
      toast.error(errorMessage);
    }
  });

  // Timer effect: fetch real win/lose after timer ends
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerStatus === 'running' && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timer === 0 && timerStatus === 'running') {
      setTimerStatus('done');
      setPendingResult(true);
      // Fetch the real trade result
      if (lastTradeId) {
        // Poll until resolved
        const poll = async () => {
          try {
            const trade = await getTradeById(lastTradeId);
            const status = trade.winLoseStatus.toLowerCase();
            setLastTrade(trade);
            if (status === 'win' || status === 'lose') {
              setTradeResult(status);
              setPendingResult(false);
            } else {
              setTimeout(poll, 2000); // Poll every 2s until resolved
            }
          } catch {
            setTimeout(poll, 2000);
          }
        };
        poll();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, timerStatus, lastTradeId]);

  /* ──────────────────────────────
     4.  Early-return UI guards
  ────────────────────────────── */
  if (isLoadingPairs) {
    return (
      <div className="p-8 text-center text-gray-400">
        Loading trading pairs…
      </div>
    );
  }

  if (tradingPairsError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load trading pairs. Please try again later.
      </div>
    );
  }

  if (tradingPairs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        No trading pairs available. Please contact support.
      </div>
    );
  }

  /* ──────────────────────────────
     5.  Derived values
  ────────────────────────────── */
  const selectedPair = tradingPairs.find(
    (pair) => pair.pairName === selectedSymbol
  );

  if (!selectedPair) {
    return (
      <div className="p-8 text-center text-gray-400">
        No matching trading pair found for <b>{selectedSymbol}</b>.
        <br />
        Please select another pair.
      </div>
    );
  }

  const tradeOptions = selectedPair.tradeOptions || [];
  const selectedTradeOption = tradeOptions.find(
    (opt) => opt.durationSeconds.toString() === tradeExpirationTimeSeconds
  );

  const baseSymbol =
    selectedPair.baseCurrency ||
    selectedSymbol.replace(/USDT$/, '').replace(/USD$/, '');

  const selectedCoinData = marketData?.data.find((coin: MarketData) => {
    if (coin.symbol === baseSymbol) return true;
    if (coin.symbol.toLowerCase() === baseSymbol.toLowerCase()) return true;
    const cleanSymbol = coin.symbol.replace(/USDT$/, '').replace(/USD$/, '');
    return cleanSymbol === baseSymbol;
  });

  /* ──────────────────────────────
     6.  Event handlers
  ────────────────────────────── */
  const handleTrade = async () => {
    if (!selectedCoinData?.price) {
      toast.error('Unable to get current market price');
      return;
    }
    if (!selectedTradeOption) {
      toast.error('Please select a valid trade option');
      return;
    }
    const amount = Number(tradingAmountQuote);
    const minAmount = Number(selectedTradeOption.minAmountQuote);
    const maxAmount = Number(selectedTradeOption.maxAmountQuote);
    if (isNaN(amount) || amount < minAmount) {
      toast.error(`Amount must be at least ${minAmount} ${selectedPair.quoteCurrency}`);
      setTradingAmountQuote(String(minAmount));
      return;
    }
    if (amount > maxAmount) {
      toast.error(`Amount must be between ${minAmount} and ${maxAmount} ${selectedPair.quoteCurrency}`);
      setTradingAmountQuote(String(minAmount));
      return;
    }
    // Remove timer start from here
    setTradeResult(null);

    const tradeData: TradeRequest = {
      tradingPairId: selectedPair.id,
      tradeOptionId: selectedTradeOption.id,
      tradeType,
      tradingAmountQuote: amount,
      executionPrice: selectedCoinData.price
    };

    createTradeMutation.mutate(tradeData);
  };

  /* ──────────────────────────────
     7.  Render
  ────────────────────────────── */
  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-gray-800 border-b border-gray-700">
        <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
          <SelectTrigger className="w-28 md:w-[180px] bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select trading pair" />
          </SelectTrigger>
          <SelectContent>
            {tradingPairs.map((pair) => (
              <SelectItem key={pair.pairName} value={pair.pairName}>
                {pair.pairName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => navigate('/user/trade-history')}
          className="flex items-center space-x-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          <History className="h-4 w-4" />
          <span>Trade History</span>
        </Button>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <MarketOverview
          marketData={(marketData?.data || []).map((coin: any) => ({
            ...coin,
            id: String(coin.id)
          }))}
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
        />

        <div className="flex-1 overflow-hidden">
          <TradingViewWidget symbol={selectedSymbol} theme="dark" />
        </div>

        <TradeForm
          tradeType={tradeType}
          setTradeType={setTradeType}
          tradingAmountQuote={tradingAmountQuote}
          setTradingAmountQuote={setTradingAmountQuote}
          selectedPair={selectedPair}
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
          tradingPairs={tradingPairs}
          selectedTradeOption={selectedTradeOption}
          selectedCoinData={selectedCoinData}
          tradeExpirationTimeSeconds={tradeExpirationTimeSeconds}
          setTradeExpirationTimeSeconds={setTradeExpirationTimeSeconds}
          tradeOptions={tradeOptions}
          handleTrade={handleTrade}
          createTradeMutation={createTradeMutation}
          timer={timer}
          timerStatus={timerStatus}
          tradeResult={tradeResult}
          pendingResult={pendingResult}
          lastTrade={lastTrade}
        />
      </div>

      {/* Mobile layout */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden relative w-full">
        <div className="flex-1 overflow-y-auto w-full">
          {mobileTab === 'market' && (
            <MarketOverviewMobile
              marketData={(marketData?.data || []).map((coin: any) => ({
                ...coin,
                id: String(coin.id)
              }))}
              selectedSymbol={selectedSymbol}
              setSelectedSymbol={setSelectedSymbol}
            />
          )}

          {mobileTab === 'chart' && (
            <div className="h-full w-full">
              <MobileChartWidget symbol={selectedSymbol} theme="dark" />
            </div>
          )}

          {mobileTab === 'trade' && (
            <TradeFormMobile
              tradeType={tradeType}
              setTradeType={setTradeType}
              tradingAmountQuote={tradingAmountQuote}
              setTradingAmountQuote={setTradingAmountQuote}
              selectedPair={selectedPair}
              selectedSymbol={selectedSymbol}
              setSelectedSymbol={setSelectedSymbol}
              tradingPairs={tradingPairs}
              selectedTradeOption={selectedTradeOption}
              selectedCoinData={selectedCoinData}
              tradeExpirationTimeSeconds={tradeExpirationTimeSeconds}
              setTradeExpirationTimeSeconds={setTradeExpirationTimeSeconds}
              tradeOptions={tradeOptions}
              handleTrade={handleTrade}
              createTradeMutation={createTradeMutation}
              timer={timer}
              timerStatus={timerStatus}
              tradeResult={tradeResult}
              pendingResult={pendingResult}
              lastTrade={lastTrade}
            />
          )}
        </div>

        <TabBarMobile
          mobileTab={mobileTab}
          setMobileTab={(tab) => setMobileTab(tab as 'chart' | 'market' | 'trade')}
        />
      </div>
    </div>
  );
};

export default TradingChartPage;
 