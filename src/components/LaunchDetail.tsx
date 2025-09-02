// import React from 'react';
// import { LaunchData } from '../types';
// import { X, ExternalLink, Copy, Users, Clock, TrendingUp } from 'lucide-react';
// import TradingInterface from './TradingInterface';
// import BondingCurveChart from './BondingCurveChart';
// import LaunchLabService from '../services/launchLabService';

// interface LaunchDetailProps {
//   launch: LaunchData;
//   onClose: () => void;
//   launchLabService: LaunchLabService;
// }

// const LaunchDetail: React.FC<LaunchDetailProps> = ({ launch, onClose, launchLabService }) => {
//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     // Add toast notification here
//   };

//   const formatNumber = (num: number) => {
//     if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
//     if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
//     return num.toFixed(2);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white border-4 border-black w-full max-w-6xl max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b-2 border-black p-6 flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <img 
//               src={launch.token.logoURI || 'https://images.pexels.com/photos/8369750/pexels-photo-8369750.jpeg?auto=compress&cs=tinysrgb&w=80'} 
//               alt={launch.token.symbol}
//               className="w-16 h-16 object-cover border-2 border-black"
//             />
//             <div>
//               <h2 className="text-3xl font-bold text-black uppercase tracking-wider">{launch.token.name}</h2>
//               <div className="flex items-center space-x-4 mt-2">
//                 <span className="text-black font-bold uppercase tracking-wider">${launch.token.symbol}</span>
//                 <button
//                   onClick={() => copyToClipboard(launch.token.mint.toBase58())}
//                   className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
//                 >
//                   <span className="text-sm font-mono font-bold">
//                     {launch.token.mint.toBase58().slice(0, 8)}...{launch.token.mint.toBase58().slice(-8)}
//                   </span>
//                   <Copy className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <button
//             onClick={onClose}
//             className="p-3 bg-gray-100 hover:bg-black hover:text-white transition-colors border-2 border-black"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             <div className="space-y-6">
//               <div className="bg-white border-2 border-black p-6">
//                 <h3 className="text-xl font-bold text-black mb-4 uppercase tracking-wider">Token Stats</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-gray-600 text-sm mb-1 uppercase tracking-wide font-medium">Market Cap</p>
//                     <p className="text-2xl font-bold text-black">${formatNumber(launch.marketCap)}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 text-sm mb-1 uppercase tracking-wide font-medium">24h Volume</p>
//                     <p className="text-2xl font-bold text-black">${formatNumber(launch.volume24h)}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 text-sm mb-1 uppercase tracking-wide font-medium">24h Change</p>
//                     <div className="flex items-center space-x-1">
//                       <TrendingUp className="w-4 h-4 text-black" />
//                       <span className="text-xl font-bold text-black">
//                         {launch.priceChange24h >= 0 ? '+' : ''}{launch.priceChange24h.toFixed(1)}%
//                       </span>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="text-gray-600 text-sm mb-1 uppercase tracking-wide font-medium">Total Supply</p>
//                     <p className="text-xl font-bold text-black">
//                       {formatNumber(launch.token.totalSupply.toNumber() / Math.pow(10, launch.token.decimals))}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <TradingInterface launch={launch} raydiumService={raydiumService} />
//               <TradingInterface launch={launch} launchLabService={launchLabService} />
//             </div>

//             <div className="space-y-6">
//               <BondingCurveChart bondingCurve={launch.bondingCurve} />
              
//               <div className="bg-white border-2 border-black p-6">
//                 <h3 className="text-xl font-bold text-black mb-4 uppercase tracking-wider">Launch Information</h3>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600 font-medium uppercase tracking-wide">Creator</span>
//                     <div className="flex items-center space-x-2">
//                       <span className="text-black font-mono text-sm font-bold">
//                         {launch.creator.toBase58().slice(0, 8)}...{launch.creator.toBase58().slice(-8)}
//                       </span>
//                       <button
//                         onClick={() => copyToClipboard(launch.creator.toBase58())}
//                         className="text-gray-600 hover:text-black transition-colors"
//                       >
//                         <Copy className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600 font-medium uppercase tracking-wide">Created</span>
//                     <div className="flex items-center space-x-2">
//                       <Clock className="w-4 h-4 text-gray-600" />
//                       <span className="text-black font-bold">{launch.createdAt.toLocaleDateString()}</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600 font-medium uppercase tracking-wide">Decimals</span>
//                     <span className="text-black font-bold">{launch.token.decimals}</span>
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600 font-medium uppercase tracking-wide">Status</span>
//                     <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider border-2 border-black ${
//                       launch.bondingCurve.complete 
//                         ? 'bg-black text-white' 
//                         : 'bg-white text-black'
//                     }`}>
//                       {launch.bondingCurve.complete ? 'Graduated' : 'In Progress'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LaunchDetail;

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, TrendingUp, Users, Zap, AlertCircle, ArrowUpRight, ArrowDownLeft, BarChart3 } from 'lucide-react';
import { LaunchData } from '../types';
import WorkingTokenService from '../services/launchLabService';
import BN from 'bn.js';
import Decimal from 'decimal.js';

interface LaunchDetailProps {
  launch: LaunchData;
  onClose: () => void;
  tokenService: WorkingTokenService;
}

const LaunchDetail: React.FC<LaunchDetailProps> = ({ launch, onClose, tokenService }) => {
  const wallet = useWallet();
  const [tradeAmount, setTradeAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bondingCurveData, setBondingCurveData] = useState(launch);

  // Safe getCurrentPrice method
  const safeGetCurrentPrice = (bondingCurve: any): number => {
    try {
      const virtualSolReservesDecimal = new Decimal(bondingCurve.virtualSolReserves.toString()).div(1e9);
      const virtualTokenReservesDecimal = new Decimal(bondingCurve.virtualTokenReserves.toString()).div(1e6);
      
      if (virtualTokenReservesDecimal.isZero()) return 0.000001; // Default price
      
      const price = virtualSolReservesDecimal.div(virtualTokenReservesDecimal);
      return parseFloat(price.toFixed(10));
    } catch (error) {
      console.error('Error calculating current price:', error);
      return 0.000001; // Fallback price
    }
  };

  // Safe progress calculation
  const safeCalculateProgress = () => {
    try {
      const realSol = bondingCurveData.bondingCurve.realSolReserves;
      const virtualSol = bondingCurveData.bondingCurve.virtualSolReserves;
      
      if (virtualSol.isZero()) return 0;
      
      const realSolDecimal = new Decimal(realSol.toString());
      const virtualSolDecimal = new Decimal(virtualSol.toString());
      const progressDecimal = realSolDecimal.div(virtualSolDecimal).mul(100);
      
      return Math.min(parseFloat(progressDecimal.toFixed(2)), 100);
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  // Safe SOL amount calculation
  const safeSolAmount = (bn: BN): string => {
    try {
      const decimal = new Decimal(bn.toString()).div(1e9);
      return decimal.toFixed(4);
    } catch (error) {
      console.error('Error converting SOL amount:', error);
      return '0.0000';
    }
  };

  // Safe token amount calculation
  const safeTokenAmount = (bn: BN): string => {
    try {
      const decimal = new Decimal(bn.toString()).div(1e6);
      return decimal.toNumber().toLocaleString();
    } catch (error) {
      console.error('Error converting token amount:', error);
      return '0';
    }
  };

  // Get real-time bonding curve data
  useEffect(() => {
    const updateData = () => {
      const currentData = tokenService.getBondingCurveData(launch.token.mint);
      if (currentData) {
        // Convert to LaunchData format with safe calculations
        try {
          const marketCapDecimal = new Decimal(currentData.totalSupply.toString())
            .div(1e6)
            .mul(currentData.currentPrice.toString());
          
          const volume24hDecimal = new Decimal(currentData.solCollected.toString())
            .div(1e9)
            .mul(0.1);

          const updatedLaunch: LaunchData = {
            ...launch,
            marketCap: parseFloat(marketCapDecimal.toFixed(2)),
            volume24h: parseFloat(volume24hDecimal.toFixed(2)),
            bondingCurve: {
              ...launch.bondingCurve,
              virtualTokenReserves: currentData.totalSupply.sub(currentData.tokensSold),
              virtualSolReserves: new BN(currentData.currentPrice.mul(currentData.totalSupply.toString()).mul(1e9).toFixed(0)),
              realTokenReserves: currentData.totalSupply.sub(currentData.tokensSold),
              realSolReserves: currentData.solCollected,
              complete: currentData.isComplete,
            }
          };
          setBondingCurveData(updatedLaunch);
        } catch (error) {
          console.error('Error updating bonding curve data:', error);
        }
      }
    };

    updateData();
    const interval = setInterval(updateData, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [launch, tokenService]);

  const calculateTrade = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return null;

    try {
      if (isBuying) {
        const solAmount = new BN(parseFloat(tradeAmount) * 1e9); // SOL to lamports
        const result = tokenService.calculateBuyTokens(launch.token.mint, solAmount);
        return {
          input: parseFloat(tradeAmount),
          output: parseFloat(new Decimal(result.tokens.toString()).div(1e6).toFixed(6)), // Safe conversion
          inputToken: "SOL",
          outputToken: launch.token.symbol,
          priceImpact: result.priceImpact,
          newPrice: result.newPrice.toFixed(8)
        };
      } else {
        const tokenAmount = new BN(parseFloat(tradeAmount) * 1e6); // Tokens with decimals
        const result = tokenService.calculateSellTokens(launch.token.mint, tokenAmount);
        return {
          input: parseFloat(tradeAmount),
          output: parseFloat(new Decimal(result.sol.toString()).div(1e9).toFixed(6)), // Safe conversion
          inputToken: launch.token.symbol,
          outputToken: "SOL",
          priceImpact: result.priceImpact,
          newPrice: result.newPrice.toFixed(8)
        };
      }
    } catch (err) {
      console.error('Trade calculation error:', err);
      return null;
    }
  };

  const handleTrade = async () => {
    if (!wallet.connected || !tradeAmount) {
      setError('Please connect wallet and enter amount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signature = isBuying 
        ? await tokenService.buyTokens({
            mint: launch.token.mint,
            amount: parseFloat(tradeAmount),
            isBuy: true,
            slippage: 1
          }, wallet)
        : await tokenService.sellTokens({
            mint: launch.token.mint,
            amount: parseFloat(tradeAmount),
            isBuy: false,
            slippage: 1
          }, wallet);

      const tradeInfo = calculateTrade();
      setSuccess(
        `Trade executed successfully! 
${isBuying ? 'Bought' : 'Sold'} ${tradeInfo?.output.toFixed(6)} ${tradeInfo?.outputToken} 
New price: ${tradeInfo?.newPrice} SOL per token`
      );
      setTradeAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const tradeEstimate = calculateTrade();
  const currentPrice = safeGetCurrentPrice(bondingCurveData.bondingCurve);
  const progress = safeCalculateProgress();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border-2 border-black rounded-none w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b-2 border-black p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {bondingCurveData.token.logoURI && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 border-2 border-black flex items-center justify-center">
                <img 
                  src={bondingCurveData.token.logoURI} 
                  alt={bondingCurveData.token.name}
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-black uppercase tracking-wider">
                {bondingCurveData.token.name}
              </h2>
              <p className="text-sm sm:text-lg text-gray-600 uppercase tracking-wide">
                ${bondingCurveData.token.symbol}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-black hover:text-white transition-colors border-2 border-black"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
          {/* Left Column - Token Info */}
          <div className="space-y-6">
            {/* Token Stats */}
            <div className="bg-gray-100 border-2 border-black p-4 sm:p-6">
              <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Token Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm uppercase tracking-wide">Current Price</p>
                  <p className="font-bold text-lg text-black">{currentPrice.toFixed(8)} SOL</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm uppercase tracking-wide">Market Cap</p>
                  <p className="font-bold text-lg text-black">${bondingCurveData.marketCap.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm uppercase tracking-wide">24h Volume</p>
                  <p className="font-bold text-lg text-black">${bondingCurveData.volume24h.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm uppercase tracking-wide">24h Change</p>
                  <p className={`font-bold text-lg ${bondingCurveData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {bondingCurveData.priceChange24h >= 0 ? '+' : ''}{bondingCurveData.priceChange24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Bonding Curve Progress */}
            <div className="bg-gray-100 border-2 border-black p-4 sm:p-6">
              <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Bonding Curve Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress to Completion</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 border-2 border-black h-4">
                    <div 
                      className="bg-black h-full transition-all duration-300"
                      style={{ width: `${Math.max(1, progress)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 uppercase tracking-wide">SOL Collected</p>
                    <p className="font-bold text-black">
                      {safeSolAmount(bondingCurveData.bondingCurve.realSolReserves)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 uppercase tracking-wide">Tokens Sold</p>
                    <p className="font-bold text-black">
                      {safeTokenAmount(bondingCurveData.bondingCurve.tokenTotalSupply.sub(bondingCurveData.bondingCurve.realTokenReserves))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Description */}
            {bondingCurveData.token.name && (
              <div className="bg-gray-100 border-2 border-black p-4 sm:p-6">
                <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4">About</h3>
                <p className="text-black text-sm leading-relaxed">
                  {bondingCurveData.token.name} (${bondingCurveData.token.symbol}) is a token launched on the ToastCoin bonding curve platform. 
                  Trade with instant liquidity powered by automated market making.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Trading Interface */}
          <div className="space-y-6">
            {/* Trade Type Selector */}
            <div className="bg-gray-100 border-2 border-black p-4 sm:p-6">
              <div className="flex border-2 border-black mb-6">
                <button
                  onClick={() => {
                    setIsBuying(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 py-3 px-4 font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 ${
                    isBuying
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Buy</span>
                </button>
                <button
                  onClick={() => {
                    setIsBuying(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 py-3 px-4 font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 border-l-2 border-black ${
                    !isBuying
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Sell</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-black text-sm font-bold mb-2 uppercase tracking-wider">
                    {isBuying ? 'SOL Amount' : `${bondingCurveData.token.symbol} Amount`}
                  </label>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder={isBuying ? "0.1" : "1000"}
                    min="0"
                    step={isBuying ? "0.001" : "1"}
                    className="w-full border-2 border-black px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:bg-black focus:text-white transition-colors"
                  />
                </div>

                {/* Trade Estimate */}
                {tradeEstimate && (
                  <div className="bg-white border-2 border-black p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">You pay:</span>
                        <span className="font-bold">{tradeEstimate.input.toFixed(6)} {tradeEstimate.inputToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">You receive:</span>
                        <span className="font-bold">{tradeEstimate.output.toFixed(6)} {tradeEstimate.outputToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price impact:</span>
                        <span className={`font-bold ${tradeEstimate.priceImpact > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {tradeEstimate.priceImpact.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New price:</span>
                        <span className="font-bold">{tradeEstimate.newPrice} SOL</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {(isBuying ? ['0.1', '0.5', '1', '5'] : ['100', '500', '1000', '5000']).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTradeAmount(amount)}
                      className="py-2 px-3 border-2 border-black text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                {/* Trade Button */}
                {wallet.connected ? (
                  <button
                    onClick={handleTrade}
                    disabled={loading || !tradeAmount || parseFloat(tradeAmount) <= 0}
                    className={`w-full py-4 px-6 font-bold text-lg uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-black ${
                      loading || !tradeAmount || parseFloat(tradeAmount) <= 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isBuying
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {isBuying ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        <span>{isBuying ? 'Buy' : 'Sell'} {bondingCurveData.token.symbol}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-black font-medium uppercase tracking-wider">
                      Connect wallet to trade
                    </p>
                  </div>
                )}

                {/* Messages */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-bold text-sm uppercase tracking-wider mb-1">Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-2 border-green-500 p-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-800 font-bold text-sm uppercase tracking-wider mb-1">Success!</p>
                        <pre className="text-green-700 text-sm whitespace-pre-wrap">{success}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-100 border-2 border-black p-4 sm:p-6">
              <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Trading Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-bold text-black font-mono text-xs">
                    {bondingCurveData.token.mint.toString().slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-bold text-black">
                    {bondingCurveData.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-bold ${bondingCurveData.bondingCurve.complete ? 'text-green-600' : 'text-blue-600'}`}>
                    {bondingCurveData.bondingCurve.complete ? 'Complete' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-bold text-black">ToastCoin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchDetail;