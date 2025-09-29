import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, DollarSign } from 'lucide-react';

const TradeForm: React.FC<any> = ({
  tradeType,
  setTradeType,
  tradingAmountQuote,
  setTradingAmountQuote,
  selectedPair,
  selectedSymbol,
  setSelectedSymbol,
  tradingPairs,
  selectedTradeOption,
  selectedCoinData,
  tradeExpirationTimeSeconds,
  setTradeExpirationTimeSeconds,
  tradeOptions,
  handleTrade,
  createTradeMutation,
  timer,
  timerStatus,
  tradeResult,
  pendingResult,
  lastTrade
}) => {
  const minAmount = selectedTradeOption?.minAmountQuote || 0;
  const maxAmount = selectedTradeOption?.maxAmountQuote || 0;
  const amount = Number(tradingAmountQuote);
  const isAmountInvalid = isNaN(amount) || amount < minAmount || amount > maxAmount;

  return (
  <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 flex flex-col space-y-4">
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2 block">Trade Type</Label>
        <RadioGroup 
          value={tradeType} 
          onValueChange={setTradeType}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="BUY" id="buy" className="text-green-500" />
            <Label htmlFor="buy" className="text-green-500">Buy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SELL" id="sell" className="text-red-500" />
            <Label htmlFor="sell" className="text-red-500">Sell</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label className="text-white">
          Amount ({selectedPair?.quoteCurrency || 'Quote Currency'})
        </Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={tradingAmountQuote}
              onChange={(e) => setTradingAmountQuote(e.target.value)}
              min={minAmount}
              max={maxAmount}
              step="0.01"
              className="bg-gray-700 border-gray-600 text-white pl-10"
              placeholder={`Enter amount in ${selectedPair?.quoteCurrency || 'quote currency'}`}
            />
          </div>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-[120px] bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Pair" />
            </SelectTrigger>
            <SelectContent>
              {tradingPairs?.map((pair: any) => (
                <SelectItem key={pair.pairName} value={pair.pairName}>
                  {pair.pairName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isAmountInvalid && (
          <p className="text-xs text-red-400 mt-1">
            Amount must be between {minAmount} and {maxAmount} {selectedPair?.quoteCurrency}
          </p>
        )}
        {selectedTradeOption && (
          <p className="text-xs text-gray-400 mt-1">
            Min: {selectedTradeOption.minAmountQuote} {selectedPair?.quoteCurrency} | 
            Max: {selectedTradeOption.maxAmountQuote} {selectedPair?.quoteCurrency}
          </p>
        )}
        {tradingAmountQuote && selectedCoinData?.price && (
          <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
            <p className="text-white">
              You will get: <span className="font-semibold text-blue-400">
                {(Number(tradingAmountQuote) / selectedCoinData.price).toFixed(6)} {selectedPair?.baseCurrency}
              </span>
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Rate: 1 {selectedPair?.baseCurrency} = {selectedCoinData.price} {selectedPair?.quoteCurrency}
            </p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-white">
          Price (1 {selectedPair?.baseCurrency || 'Base'} = {selectedCoinData?.price || 0} {selectedPair?.quoteCurrency || 'Quote'})
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            value={selectedCoinData?.price || 0}
            disabled
            className="bg-gray-700 border-gray-600 text-white pl-10 cursor-not-allowed opacity-70"
            placeholder="Current market price"
          />
        </div>
        {selectedCoinData ? (
          <p className="text-xs text-gray-400 mt-1">
            24h Change: {selectedCoinData.change24h.toFixed(2)}%
          </p>
        ) : (
          <p className="text-xs text-red-400 mt-1">
            No market data found for {selectedPair?.baseCurrency}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-white">Expiration Time</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Select
            value={tradeExpirationTimeSeconds}
            onValueChange={setTradeExpirationTimeSeconds}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white pl-10">
              <SelectValue placeholder="Select expiration time" />
            </SelectTrigger>
            <SelectContent>
              {tradeOptions.map((option: any) => (
                <SelectItem key={option.id} value={option.durationSeconds.toString()}>
                  {option.durationSeconds} seconds ({option.profitPercentage}% profit, min: {option.minAmountQuote})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button 
        onClick={handleTrade}
        disabled={createTradeMutation.isPending || !selectedPair || !selectedCoinData?.price || isAmountInvalid}
        className={`w-full ${
          tradeType === 'BUY' 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-red-600 hover:bg-red-700'
        } text-white`}
      >
        {createTradeMutation.isPending ? 'Processing...' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ${selectedSymbol}`}
      </Button>
      {/* Timer below the button */}
      <div className="w-full flex flex-col items-center justify-center py-2">
        {pendingResult && (
          <div className="text-lg text-yellow-400 font-semibold">Pending...</div>
        )}
        {timerStatus === 'running' && timer !== null && timer > 0 && (
          <div className="text-lg text-blue-400 font-semibold">
            Time left: {timer}s
          </div>
        )}
        {timerStatus === 'done' && tradeResult && !pendingResult && (
          <div className={`text-2xl font-bold ${tradeResult === 'win' ? 'text-green-500' : 'text-red-500'}`}>
            {tradeResult === 'win' ? 'Win' : 'Lose'}
          </div>
        )}
      </div>
      {/* Trade Receipt */}
      {timerStatus === 'done' && lastTrade && (
        <div className="w-full mt-4 flex flex-col items-center">
          <div className="bg-gray-800 rounded-xl shadow-lg p-4 w-full max-w-xs border border-gray-600 max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">Trade Receipt</span>
              {lastTrade.winLoseStatus === 'WIN' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-600 text-white shadow-md">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  WIN
                </span>
              )}
              {lastTrade.winLoseStatus === 'LOSE' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white shadow-md">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  LOSE
                </span>
              )}
              {lastTrade.winLoseStatus !== 'WIN' && lastTrade.winLoseStatus !== 'LOSE' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-500 text-white shadow-md">
                  Pending
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-700">
              <div className="py-1 flex justify-between"><span className="text-gray-400">Pair:</span> <span className="font-mono text-white">{lastTrade.tradingPair}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Type:</span> <span className="font-mono text-white">{lastTrade.tradeType}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Amount:</span> <span className="font-mono text-white">{lastTrade.tradingAmountQuote} {lastTrade.quoteCurrency}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Entry Price:</span> <span className="font-mono text-white">{lastTrade.executionPrice}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Expiration:</span> <span className="font-mono text-white">{lastTrade.tradeExpirationTimeSeconds} sec</span></div>
              {/* <div className="py-1 flex justify-between"><span className="text-gray-400">Trade ID:</span> <span className="font-mono text-white">{lastTrade.id}</span></div> */}
              {/* <div className="py-1 flex justify-between"><span className="text-gray-400">Base/Quote:</span> <span className="font-mono text-white">{lastTrade.baseCurrency}/{lastTrade.quoteCurrency}</span></div> */}
              <div className="py-1 flex justify-between"><span className="text-gray-400">Amount (Base):</span> <span className="font-mono text-white">{lastTrade.tradingAmountBase} {lastTrade.baseCurrency}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Potential Profit:</span> <span className="font-mono text-white">{lastTrade.potentialProfitPercentage}%</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Expected Profit:</span> <span className="font-mono text-white">{lastTrade.expectedProfitQuote} {lastTrade.quoteCurrency}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Fee:</span> <span className="font-mono text-white">{lastTrade.transactionFeePercentage}% ({lastTrade.transactionFeeAmountQuote} {lastTrade.quoteCurrency})</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Status:</span> <span className="font-mono text-white">{lastTrade.tradeStatus}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Created:</span> <span className="font-mono text-white">{new Date(lastTrade.createdAt).toLocaleString()}</span></div>
              <div className="py-1 flex justify-between"><span className="text-gray-400">Updated:</span> <span className="font-mono text-white">{new Date(lastTrade.updatedAt).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default TradeForm; 