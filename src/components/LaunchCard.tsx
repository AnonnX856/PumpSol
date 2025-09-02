import React from 'react';
import { LaunchData } from '../types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import BN from 'bn.js';

interface LaunchCardProps {
  launch: LaunchData;
  onClick: () => void;
}

const LaunchCard: React.FC<LaunchCardProps> = ({ launch, onClick }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours === 0) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Safe calculation of bonding curve progress
  const calculateProgress = () => {
    try {
      const realSol = launch.bondingCurve.realSolReserves;
      const virtualSol = launch.bondingCurve.virtualSolReserves;
      
      // Handle case where virtual reserves might be zero
      if (virtualSol.isZero()) return 0;
      
      // Use BN division for precision, then convert to percentage
      // Multiply by 10000 to get 2 decimal places, then divide by 100
      const progressBN = realSol.mul(new BN(10000)).div(virtualSol);
      const progress = Math.min(progressBN.toNumber() / 100, 100);
      
      return isNaN(progress) ? 0 : progress;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const progress = calculateProgress();

  return (
    <div 
      onClick={onClick}
      className="bg-white border-2 border-black p-4 sm:p-6 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl group"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={launch.token.logoURI || 'https://images.pexels.com/photos/8369750/pexels-photo-8369750.jpeg?auto=compress&cs=tinysrgb&w=60'} 
              alt={launch.token.symbol}
              className="w-10 h-10 sm:w-12 sm:h-12 object-cover border-2 border-black"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-black border-2 border-white"></div>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-white transition-colors uppercase tracking-wider">
              {launch.token.name}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-300 font-bold uppercase tracking-wide">${launch.token.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-300" />
            <span className="text-gray-600 group-hover:text-gray-300 text-xs sm:text-sm font-medium uppercase tracking-wide">{formatTimeAgo(launch.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="text-center">
          <p className="text-gray-600 group-hover:text-gray-300 text-xs sm:text-sm mb-1 uppercase tracking-wide font-medium">Market Cap</p>
          <p className="text-sm sm:text-base text-black group-hover:text-white font-bold">${formatNumber(launch.marketCap)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 group-hover:text-gray-300 text-xs sm:text-sm mb-1 uppercase tracking-wide font-medium">Volume 24h</p>
          <p className="text-sm sm:text-base text-black group-hover:text-white font-bold">${formatNumber(launch.volume24h)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 group-hover:text-gray-300 text-xs sm:text-sm mb-1 uppercase tracking-wide font-medium">24h Change</p>
          <div className="flex items-center justify-center space-x-1">
            {launch.priceChange24h >= 0 ? (
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-black group-hover:text-white" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-black group-hover:text-white" />
            )}
            <span className="text-sm sm:text-base font-bold text-black group-hover:text-white">
              {launch.priceChange24h >= 0 ? '+' : ''}{launch.priceChange24h.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 group-hover:bg-gray-700 h-2 mb-3">
        <div 
          className="bg-black group-hover:bg-white h-2 transition-all duration-500"
          style={{ 
            width: `${Math.max(1, Math.min(progress, 100))}%` 
          }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 group-hover:text-gray-300 font-medium uppercase tracking-wide">
        <span>Bonding Progress</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default LaunchCard;