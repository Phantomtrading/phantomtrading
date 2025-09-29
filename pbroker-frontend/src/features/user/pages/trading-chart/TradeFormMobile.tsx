import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, DollarSign } from 'lucide-react';

interface TradeFormMobileProps {
  tradeType: 'BUY' | 'SELL';
  setTradeType: (type: 'BUY' | 'SELL') => void;
  tradingAmountQuote: string;
  setTradingAmountQuote: (amount: string) => void;
  selectedPair: any;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  tradingPairs: any[];
  selectedTradeOption: any;
  selectedCoinData: any;
  tradeExpirationTimeSeconds: string;
  setTradeExpirationTimeSeconds: (seconds: string) => void;
  tradeOptions: any[];
  handleTrade: () => void;
  createTradeMutation: any;
  timer: number | null;
  timerStatus: 'idle' | 'running' | 'done';
  tradeResult: 'win' | 'lose' | null;
  pendingResult: boolean;
}

const TradeFormMobile: React.FC<TradeFormMobileProps & { lastTrade?: any }> = (props) => {
  const minAmount = props.selectedTradeOption?.minAmountQuote || 0;
  const maxAmount = props.selectedTradeOption?.maxAmountQuote || 0;
  const amount = Number(props.tradingAmountQuote);
  const isAmountInvalid = isNaN(amount) || amount < minAmount || amount > maxAmount;

  return (
    <div className="p-3 w-full">
      <div className="space-y-4">
        <div>
          <Label className="text-white mb-2 block">Trade Type</Label>
          <RadioGroup
            value={props.tradeType}
            onValueChange={props.setTradeType}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BUY" id="buy-mobile" className="text-green-500" />
              <Label htmlFor="buy-mobile" className="text-green-500">Buy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SELL" id="sell-mobile" className="text-red-500" />
              <Label htmlFor="sell-mobile" className="text-red-500">Sell</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label className="text-white">
            Amount ({props.selectedPair?.quoteCurrency || 'Quote Currency'})
          </Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                value={props.tradingAmountQuote}
                onChange={(e) => props.setTradingAmountQuote(e.target.value)}
                min={minAmount}
                max={maxAmount}
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white pl-10"
                placeholder={`Enter amount in ${props.selectedPair?.quoteCurrency || 'quote currency'}`}
              />
            </div>
            <Select value={props.selectedSymbol} onValueChange={props.setSelectedSymbol}>
              <SelectTrigger className="w-20 md:w-[100px] bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Pair" />
              </SelectTrigger>
              <SelectContent>
                {props.tradingPairs?.map((pair: any) => (
                  <SelectItem key={pair.pairName} value={pair.pairName}>
                    {pair.pairName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAmountInvalid && (
            <p className="text-xs text-red-400 mt-1">
              Amount must be between {minAmount} and {maxAmount} {props.selectedPair?.quoteCurrency}
            </p>
          )}
          {props.selectedTradeOption && (
            <p className="text-xs text-gray-400 mt-1">
              Min: {props.selectedTradeOption.minAmountQuote} {props.selectedPair?.quoteCurrency} | 
              Max: {props.selectedTradeOption.maxAmountQuote} {props.selectedPair?.quoteCurrency}
            </p>
          )}
          {props.tradingAmountQuote && props.selectedCoinData?.price && (
            <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
              <p className="text-white">
                You will get: <span className="font-semibold text-blue-400">
                  {(Number(props.tradingAmountQuote) / props.selectedCoinData.price).toFixed(6)} {props.selectedPair?.baseCurrency}
                </span>
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Rate: 1 {props.selectedPair?.baseCurrency} = {props.selectedCoinData.price} {props.selectedPair?.quoteCurrency}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-white">
            Price (1 {props.selectedPair?.baseCurrency || 'Base'} = {props.selectedCoinData?.price || 0} {props.selectedPair?.quoteCurrency || 'Quote'})
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={props.selectedCoinData?.price || 0}
              disabled
              className="bg-gray-700 border-gray-600 text-white pl-10 cursor-not-allowed opacity-70"
              placeholder="Current market price"
            />
          </div>
          {props.selectedCoinData ? (
            <p className="text-xs text-gray-400 mt-1">
              24h Change: {props.selectedCoinData.change24h.toFixed(2)}%
            </p>
          ) : (
            <p className="text-xs text-red-400 mt-1">
              No market data found for {props.selectedPair?.baseCurrency}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-white">Expiration Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Select
              value={props.tradeExpirationTimeSeconds}
              onValueChange={props.setTradeExpirationTimeSeconds}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white pl-10">
                <SelectValue placeholder="Select expiration time" />
              </SelectTrigger>
              <SelectContent>
                {props.tradeOptions.map((option: any) => (
                  <SelectItem key={option.id} value={option.durationSeconds.toString()}>
                    {option.durationSeconds} seconds ({option.profitPercentage}% profit, min: {option.minAmountQuote})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={props.handleTrade}
          disabled={props.createTradeMutation.isPending || !props.selectedPair || !props.selectedCoinData?.price || isAmountInvalid}
          className={`w-full ${
            props.tradeType === 'BUY'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } text-white`}
        >
          {props.createTradeMutation.isPending ? 'Processing...' : `${props.tradeType === 'BUY' ? 'Buy' : 'Sell'} ${props.selectedSymbol}`}
        </Button>
        {/* Timer below the button */}
        <div className="w-full flex flex-col items-center justify-center py-2">
          {props.pendingResult && (
            <div className="text-lg text-yellow-400 font-semibold">Pending...</div>
          )}
          {props.timerStatus === 'running' && props.timer !== null && props.timer > 0 && (
            <div className="text-lg text-blue-400 font-semibold">
              Time left: {props.timer}s
            </div>
          )}
          {props.timerStatus === 'done' && props.tradeResult && !props.pendingResult && (
            <div className={`text-2xl font-bold ${props.tradeResult === 'win' ? 'text-green-500' : 'text-red-500'}`}>
              {props.tradeResult === 'win' ? 'Win' : 'Lose'}
            </div>
          )}
        </div>
        {/* Trade Receipt */}
        {props.timerStatus === 'done' && props.lastTrade && (
          <div className="w-full mt-4 flex flex-col items-center">
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 w-full max-w-xs border border-gray-600 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">Trade Receipt</span>
                {props.lastTrade.winLoseStatus === 'WIN' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-600 text-white shadow-md">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    WIN
                  </span>
                )}
                {props.lastTrade.winLoseStatus === 'LOSE' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white shadow-md">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    LOSE
                  </span>
                )}
                {props.lastTrade.winLoseStatus !== 'WIN' && props.lastTrade.winLoseStatus !== 'LOSE' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-500 text-white shadow-md">
                    Pending
                  </span>
                )}
              </div>
              <div className="divide-y divide-gray-700">
                <div className="py-1 flex justify-between"><span className="text-gray-400">Pair:</span> <span className="font-mono text-white">{props.lastTrade.tradingPair}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Type:</span> <span className="font-mono text-white">{props.lastTrade.tradeType}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Amount:</span> <span className="font-mono text-white">{props.lastTrade.tradingAmountQuote} {props.lastTrade.quoteCurrency}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Entry Price:</span> <span className="font-mono text-white">{props.lastTrade.executionPrice}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Expiration:</span> <span className="font-mono text-white">{props.lastTrade.tradeExpirationTimeSeconds} sec</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Amount (Base):</span> <span className="font-mono text-white">{props.lastTrade.tradingAmountBase} {props.lastTrade.baseCurrency}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Potential Profit:</span> <span className="font-mono text-white">{props.lastTrade.potentialProfitPercentage}%</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Expected Profit:</span> <span className="font-mono text-white">{props.lastTrade.expectedProfitQuote} {props.lastTrade.quoteCurrency}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Fee:</span> <span className="font-mono text-white">{props.lastTrade.transactionFeePercentage}% ({props.lastTrade.transactionFeeAmountQuote} {props.lastTrade.quoteCurrency})</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Status:</span> <span className="font-mono text-white">{props.lastTrade.tradeStatus}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Created:</span> <span className="font-mono text-white">{new Date(props.lastTrade.createdAt).toLocaleString()}</span></div>
                <div className="py-1 flex justify-between"><span className="text-gray-400">Updated:</span> <span className="font-mono text-white">{new Date(props.lastTrade.updatedAt).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeFormMobile; 