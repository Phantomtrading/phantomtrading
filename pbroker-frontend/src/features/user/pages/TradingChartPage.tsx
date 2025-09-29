// import React, { useState } from 'react';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { getTradingPairs, createTradeRequest } from '../services/tradingService';
// import TradingViewWidget from '../components/TradingViewWidget';
// import MobileChartWidget from '../components/MobileChartWidget';
// // import MobileCandlestickChart from '../components/MobileCandlestickChart';
// import { History, Clock, DollarSign, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import type { TradeRequest } from '../api/userApi';
// import { fetchMarketData } from '../api/userApi';
// import type { MarketData } from '../api/userApi';
// import { toast } from 'sonner';
// // import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// const TradingChartPage: React.FC = () => {
//   // All hooks at the top
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
//   const [tradeType, setTradeType] = useState('BUY');
//   const [tradingAmountQuote, setTradingAmountQuote] = useState('');
//   const [tradeExpirationTimeSeconds, setTradeExpirationTimeSeconds] = useState('60');
//   const [mobileTab, setMobileTab] = useState<'chart' | 'market' | 'trade'>('chart');

//   const { data: tradingPairs, isLoading: isLoadingPairs, error: tradingPairsError } = useQuery({
//     queryKey: ['tradingPairs'],
//     queryFn: getTradingPairs
//   });


//   const { data: marketData } = useQuery({
//     queryKey: ['marketData'],
//     queryFn: fetchMarketData,
//     refetchInterval: 10000
//   });
//   // Defensive: log loaded pairs
//   console.log('Loaded tradingPairs:', tradingPairs);

//   // Only do conditional returns after all hooks
//   if (isLoadingPairs) {
//     return <div className="p-8 text-center text-gray-400">Loading trading pairs...</div>;
//   }
//   if (tradingPairsError) {
//     return <div className="p-8 text-center text-red-500">Failed to load trading pairs. Please try again later.</div>;
//   }
//   if (!tradingPairs || tradingPairs.length === 0) {
//     return <div className="p-8 text-center text-gray-400">No trading pairs available. Please contact support.</div>;
//   }

//   const selectedPair = tradingPairs.find(pair => pair.pairName === selectedSymbol);

//   if (!selectedPair) {
//     return <div className="p-8 text-center text-gray-400">
//       No matching trading pair found for <b>{selectedSymbol}</b>.<br/>
//       Please select another pair.
//     </div>;
//   }

//   // const { data: marketData } = useQuery({
//   //   queryKey: ['marketData'],
//   //   queryFn: fetchMarketData,
//   //   refetchInterval: 10000
//   // });

//   // Find the selected trading pair and its trade options
//   const tradeOptions = selectedPair?.tradeOptions || [];
//   const selectedTradeOption = tradeOptions.find(opt => opt.durationSeconds.toString() === tradeExpirationTimeSeconds);

//   // Extract base symbol from pair name (e.g., "BTCUSDT" -> "BTC")
//   const baseSymbol = selectedPair?.baseCurrency || selectedSymbol.replace(/USDT$/, '').replace(/USD$/, '');
  
//   // Try multiple matching strategies
//   const selectedCoinData = marketData?.data.find((coin: MarketData) => {
//     // Try exact match first
//     if (coin.symbol === baseSymbol) return true;
    
//     // Try case-insensitive match
//     if (coin.symbol.toLowerCase() === baseSymbol.toLowerCase()) return true;
    
//     // Try matching by removing common suffixes
//     const cleanSymbol = coin.symbol.replace(/USDT$/, '').replace(/USD$/, '');
//     if (cleanSymbol === baseSymbol) return true;
    
//     return false;
//   });

//   // Debug logging
//   console.log('Debug Info:', {
//     selectedSymbol,
//     selectedPair,
//     baseSymbol,
//     marketDataSymbols: marketData?.data.map((coin: MarketData) => coin.symbol),
//     selectedCoinData,
//     allMarketData: marketData?.data
//   });

//   const handleTrade = async () => {
//     if (!selectedCoinData?.price) {
//       toast.error('Unable to get current market price');
//       return;
//     }
//     if (!selectedPair) {
//       toast.error('Please select a valid trading pair');
//       return;
//     }
//     if (!selectedTradeOption) {
//       toast.error('Please select a valid trade option');
//       return;
//     }
//     const amount = Number(tradingAmountQuote);
//     if (isNaN(amount) || amount <= 0) {
//       toast.error('Please enter a valid amount');
//       return;
//     }
//     // Check if amount is within allowed range
//     const minAmount = Number(selectedTradeOption.minAmountQuote);
//     const maxAmount = Number(selectedTradeOption.maxAmountQuote);
//     if (amount < minAmount || amount > maxAmount) {
//       toast.error(`Amount must be between ${minAmount} and ${maxAmount} ${selectedPair.quoteCurrency}`);
//       return;
//     }
//     const tradeData: TradeRequest = {
//       tradingPairId: selectedPair.id,
//       tradeOptionId: selectedTradeOption.id,
//       tradeType: tradeType as 'BUY' | 'SELL',
//       tradingAmountQuote: amount,
//       executionPrice: selectedCoinData.price
//     };
//     createTradeMutation.mutate(tradeData);
//   };

//   const createTradeMutation = useMutation({
//     mutationFn: createTradeRequest,
//     onSuccess: (trade) => {
//       queryClient.invalidateQueries({ queryKey: ['userTrades'] });
//       toast.success('Trade request created successfully');
//       setTradingAmountQuote('');
//       if (trade && trade.id && trade.createdAt && trade.tradeExpirationTimeSeconds) {
//         localStorage.setItem('lastTradeInfo', JSON.stringify({
//           tradeId: trade.id,
//           createdAt: trade.createdAt,
//           tradeExpirationTimeSeconds: trade.tradeExpirationTimeSeconds
//         }));
//       }
//     },
//     onError: (error: any) => {
//       console.error('Trade Request Error:', error);
      
//       let errorMessage = 'Failed to create trade request';
      
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       // Log detailed error information
//       console.error('Error response:', error.response?.data);
//       console.error('Error status:', error.response?.status);
//       console.error('Full error object:', error);
      
//       // Show specific error for 500
//       if (error.response?.status === 500) {
//         errorMessage = 'Server error - please check the console for details';
//       }
      
//       toast.error(errorMessage);
//     }
//   });

//   return (
//     <div className="h-screen w-full flex flex-col bg-gray-900">
//       <div className="p-4 flex justify-between items-center bg-gray-800 border-b border-gray-700">
//         <div className="flex items-center space-x-4">
//           <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
//             <SelectTrigger className="w-28 md:w-[180px] bg-gray-700 border-gray-600 text-white">
//               <SelectValue placeholder="Select trading pair" />
//             </SelectTrigger>
//             <SelectContent>
//               {tradingPairs?.map((pair) => (
//                 <SelectItem key={pair.pairName} value={pair.pairName}>
//                   {pair.pairName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <Button
//           variant="outline"
//           onClick={() => navigate('/user/trade-history')}
//           className="flex items-center space-x-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
//         >
//           <History className="h-4 w-4" />
//           <span>Trade History</span>
//         </Button>
//       </div>
//       {/* Desktop Layout */}
//       <div className="hidden md:flex flex-1 overflow-hidden">
//         <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
//           <h3 className="text-white font-semibold mb-4">Market Overview</h3>
//           <div className="space-y-3">
//             {marketData?.data.map((coin) => (
//               <div 
//                 key={coin.id} 
//                 className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
//                 onClick={() => setSelectedSymbol(`${coin.symbol}USDT`)}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     {coin.logoUrl && (
//                       <img src={coin.logoUrl} alt={coin.name} className="w-6 h-6 rounded-full" />
//                     )}
//                     <span className="text-white font-medium">{coin.symbol}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-white">${coin.price.toLocaleString()}</div>
//                     <div className={`flex items-center text-sm ${
//                       coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'
//                     }`}>
//                       {coin.change24h >= 0 ? (
//                         <TrendingUp className="w-4 h-4 mr-1" />
//                       ) : (
//                         <TrendingDown className="w-4 h-4 mr-1" />
//                       )}
//                       {Math.abs(coin.change24h).toFixed(2)}%
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="flex-1 overflow-hidden">
//           <TradingViewWidget 
//             symbol={selectedSymbol} 
//             theme="dark"
//           />
//         </div>
//         <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 flex flex-col space-y-4">
//           <div className="space-y-4">
//             <div>
//               <Label className="text-white mb-2 block">Trade Type</Label>
//               <RadioGroup 
//                 value={tradeType} 
//                 onValueChange={setTradeType}
//                 className="flex space-x-4"
//               >
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="BUY" id="buy" className="text-green-500" />
//                   <Label htmlFor="buy" className="text-green-500">Buy</Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="SELL" id="sell" className="text-red-500" />
//                   <Label htmlFor="sell" className="text-red-500">Sell</Label>
//                 </div>
//               </RadioGroup>
//             </div>

//             <div className="space-y-2">
//               <Label className="text-white">
//                 Amount ({selectedPair?.quoteCurrency || 'Quote Currency'})
//               </Label>
//               <div className="flex space-x-2">
//                 <div className="relative flex-1">
//                   <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     type="number"
//                     value={tradingAmountQuote}
//                     onChange={(e) => setTradingAmountQuote(e.target.value)}
//                     min={selectedTradeOption?.minAmountQuote || 0}
//                     max={selectedTradeOption?.maxAmountQuote || 0}
//                     step="0.01"
//                     className="bg-gray-700 border-gray-600 text-white pl-10"
//                     placeholder={`Enter amount in ${selectedPair?.quoteCurrency || 'quote currency'}`}
//                   />
//                 </div>
//                 <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
//                   <SelectTrigger className="w-[120px] bg-gray-700 border-gray-600 text-white">
//                     <SelectValue placeholder="Pair" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {tradingPairs?.map((pair) => (
//                       <SelectItem key={pair.pairName} value={pair.pairName}>
//                         {pair.pairName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               {selectedTradeOption && (
//                 <p className="text-xs text-gray-400 mt-1">
//                   Min: {selectedTradeOption.minAmountQuote} {selectedPair?.quoteCurrency} | 
//                   Max: {selectedTradeOption.maxAmountQuote} {selectedPair?.quoteCurrency}
//                 </p>
//               )}
//               {/* Calculated Amount Display */}
//               {tradingAmountQuote && selectedCoinData?.price && (
//                 <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
//                   <p className="text-white">
//                     You will get: <span className="font-semibold text-blue-400">
//                       {(Number(tradingAmountQuote) / selectedCoinData.price).toFixed(6)} {selectedPair?.baseCurrency}
//                     </span>
//                   </p>
//                   <p className="text-gray-300 text-xs mt-1">
//                     Rate: 1 {selectedPair?.baseCurrency} = {selectedCoinData.price} {selectedPair?.quoteCurrency}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label className="text-white">
//                 Price (1 {selectedPair?.baseCurrency || 'Base'} = {selectedCoinData?.price || 0} {selectedPair?.quoteCurrency || 'Quote'})
//               </Label>
//               <div className="relative">
//                 <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   type="number"
//                   value={selectedCoinData?.price || 0}
//                   disabled
//                   className="bg-gray-700 border-gray-600 text-white pl-10 cursor-not-allowed opacity-70"
//                   placeholder="Current market price"
//                 />
//               </div>
//               {selectedCoinData ? (
//                 <p className="text-xs text-gray-400 mt-1">
//                   24h Change: {selectedCoinData.change24h.toFixed(2)}%
//                 </p>
//               ) : (
//                 <p className="text-xs text-red-400 mt-1">
//                   No market data found for {baseSymbol}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label className="text-white">Expiration Time</Label>
//               <div className="relative">
//                 <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Select
//                   value={tradeExpirationTimeSeconds}
//                   onValueChange={setTradeExpirationTimeSeconds}
//                 >
//                   <SelectTrigger className="bg-gray-700 border-gray-600 text-white pl-10">
//                     <SelectValue placeholder="Select expiration time" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {tradeOptions.map((option) => (
//                       <SelectItem key={option.id} value={option.durationSeconds.toString()}>
//                         {option.durationSeconds} seconds ({option.profitPercentage}% profit)
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <Button 
//               onClick={handleTrade}
//               disabled={createTradeMutation.isPending || !selectedPair || !selectedCoinData?.price}
//               className={`w-full ${
//                 tradeType === 'BUY' 
//                   ? 'bg-green-600 hover:bg-green-700' 
//                   : 'bg-red-600 hover:bg-red-700'
//               } text-white`}
//             >
//               {createTradeMutation.isPending ? 'Processing...' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ${selectedSymbol}`}
//             </Button>
//           </div>
//         </div>
//       </div>
//       {/* Mobile Layout */}
//       <div className="flex-1 flex flex-col md:hidden overflow-hidden relative w-full">
//         <div className="flex-1 overflow-y-auto w-full">
//           {mobileTab === 'market' && (
//             <div className="p-3 w-full">
//               <h3 className="text-white font-semibold mb-4">Market Overview</h3>
//               <div className="space-y-3">
//                 {marketData?.data.map((coin) => (
//                   <div 
//                     key={coin.id} 
//                     className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
//                     onClick={() => setSelectedSymbol(`${coin.symbol}USDT`)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         {coin.logoUrl && (
//                           <img src={coin.logoUrl} alt={coin.name} className="w-6 h-6 rounded-full" />
//                         )}
//                         <span className="text-white font-medium">{coin.symbol}</span>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-white">${coin.price.toLocaleString()}</div>
//                         <div className={`flex items-center text-sm ${
//                           coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'
//                         }`}>
//                           {coin.change24h >= 0 ? (
//                             <TrendingUp className="w-4 h-4 mr-1" />
//                           ) : (
//                             <TrendingDown className="w-4 h-4 mr-1" />
//                           )}
//                           {Math.abs(coin.change24h).toFixed(2)}%
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {mobileTab === 'chart' && (
//             <div className="h-full w-full">
//               <MobileChartWidget symbol={selectedSymbol} theme="dark" />
//             </div>
//           )}

//           {mobileTab === 'trade' && (
//             <div className="p-3 w-full">
//               <div className="space-y-4">
//                 <div>
//                   <Label className="text-white mb-2 block">Trade Type</Label>
//                   <RadioGroup 
//                     value={tradeType} 
//                     onValueChange={setTradeType}
//                     className="flex space-x-4"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="BUY" id="buy" className="text-green-500" />
//                       <Label htmlFor="buy" className="text-green-500">Buy</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="SELL" id="sell" className="text-red-500" />
//                       <Label htmlFor="sell" className="text-red-500">Sell</Label>
//                     </div>
//                   </RadioGroup>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-white">
//                     Amount ({selectedPair?.quoteCurrency || 'Quote Currency'})
//                   </Label>
//                   <div className="flex space-x-2">
//                     <div className="relative flex-1">
//                       <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                       <Input
//                         type="number"
//                         value={tradingAmountQuote}
//                         onChange={(e) => setTradingAmountQuote(e.target.value)}
//                         min={selectedTradeOption?.minAmountQuote || 0}
//                         max={selectedTradeOption?.maxAmountQuote || 0}
//                         step="0.01"
//                         className="bg-gray-700 border-gray-600 text-white pl-10"
//                         placeholder={`Enter amount in ${selectedPair?.quoteCurrency || 'quote currency'}`}
//                       />
//                     </div>
//                     <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
//                       <SelectTrigger className="w-20 md:w-[100px] bg-gray-700 border-gray-600 text-white">
//                         <SelectValue placeholder="Pair" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {tradingPairs?.map((pair) => (
//                           <SelectItem key={pair.pairName} value={pair.pairName}>
//                             {pair.pairName}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   {selectedTradeOption && (
//                     <p className="text-xs text-gray-400 mt-1">
//                       Min: {selectedTradeOption.minAmountQuote} {selectedPair?.quoteCurrency} | 
//                       Max: {selectedTradeOption.maxAmountQuote} {selectedPair?.quoteCurrency}
//                     </p>
//                   )}
//                   {/* Calculated Amount Display */}
//                   {tradingAmountQuote && selectedCoinData?.price && (
//                     <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
//                       <p className="text-white">
//                         You will get: <span className="font-semibold text-blue-400">
//                           {(Number(tradingAmountQuote) / selectedCoinData.price).toFixed(6)} {selectedPair?.baseCurrency}
//                         </span>
//                       </p>
//                       <p className="text-gray-300 text-xs mt-1">
//                         Rate: 1 {selectedPair?.baseCurrency} = {selectedCoinData.price} {selectedPair?.quoteCurrency}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-white">
//                     Price (1 {selectedPair?.baseCurrency || 'Base'} = {selectedCoinData?.price || 0} {selectedPair?.quoteCurrency || 'Quote'})
//                   </Label>
//                   <div className="relative">
//                     <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       type="number"
//                       value={selectedCoinData?.price || 0}
//                       disabled
//                       className="bg-gray-700 border-gray-600 text-white pl-10 cursor-not-allowed opacity-70"
//                       placeholder="Current market price"
//                     />
//                   </div>
//                   {selectedCoinData ? (
//                     <p className="text-xs text-gray-400 mt-1">
//                       24h Change: {selectedCoinData.change24h.toFixed(2)}%
//                     </p>
//                   ) : (
//                     <p className="text-xs text-red-400 mt-1">
//                       No market data found for {baseSymbol}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-white">Expiration Time</Label>
//                   <div className="relative">
//                     <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Select
//                       value={tradeExpirationTimeSeconds}
//                       onValueChange={setTradeExpirationTimeSeconds}
//                     >
//                       <SelectTrigger className="bg-gray-700 border-gray-600 text-white pl-10">
//                         <SelectValue placeholder="Select expiration time" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {tradeOptions.map((option) => (
//                           <SelectItem key={option.id} value={option.durationSeconds.toString()}>
//                             {option.durationSeconds} seconds ({option.profitPercentage}% profit)
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <Button 
//                   onClick={handleTrade}
//                   disabled={createTradeMutation.isPending || !selectedPair || !selectedCoinData?.price}
//                   className={`w-full ${
//                     tradeType === 'BUY' 
//                       ? 'bg-green-600 hover:bg-green-700' 
//                       : 'bg-red-600 hover:bg-red-700'
//                   } text-white`}
//                 >
//                   {createTradeMutation.isPending ? 'Processing...' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ${selectedSymbol}`}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//         {/* Tab Bar */}
//         <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800 flex md:hidden">
//           <button
//             className={`flex-1 flex flex-col items-center py-2 ${mobileTab === 'market' ? 'text-blue-500' : 'text-gray-400'}`}
//             onClick={() => setMobileTab('market')}
//           >
//             <TrendingUp className="h-5 w-5 mb-1" />
//             <span className="text-xs">Market</span>
//           </button>
//           <button
//             className={`flex-1 flex flex-col items-center py-2 ${mobileTab === 'chart' ? 'text-blue-500' : 'text-gray-400'}`}
//             onClick={() => setMobileTab('chart')}
//           >
//             <BarChart2 className="h-5 w-5 mb-1" />
//             <span className="text-xs">Chart</span>
//           </button>
//           <button
//             className={`flex-1 flex flex-col items-center py-2 ${mobileTab === 'trade' ? 'text-blue-500' : 'text-gray-400'}`}
//             onClick={() => setMobileTab('trade')}
//           >
//             <DollarSign className="h-5 w-5 mb-1" />
//             <span className="text-xs">Trade</span>
//         </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TradingChartPage;