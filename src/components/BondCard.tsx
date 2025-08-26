import React, { useState, useEffect } from "react";
import { useLaunchpadPools } from "../hooks/usePools";
// import BondingCurveChart from "./BondingCurveChart";
// import BN from "bn.js";

const PoolCard: React.FC<{
  poolId: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}> = ({ poolId, isExpanded = false, onToggle }) => {
  const { getPoolById } = useLaunchpadPools();
  const [tradeAmount, setTradeAmount] = useState("1");
  const [isBuying, setIsBuying] = useState(true);

  const pool = getPoolById(poolId);

  const calculateTrade = (amount: number, isBuy: boolean) => {
    if (!pool) return null;

    try {
      if (isBuy) {
        const estimatedTokens = amount / (pool.tokenPrice || 0.0001);
        return {
          input: amount,
          output: estimatedTokens,
          inputToken: "SOL",
          outputToken: pool.tokenSymbol || "TOKEN",
          priceImpact: 0.1,
        };
      } else {
        const estimatedSOL = amount * (pool.tokenPrice || 0.0001);
        return {
          input: amount,
          output: estimatedSOL,
          inputToken: pool.tokenSymbol || "TOKEN",
          outputToken: "SOL",
          priceImpact: 0.1,
        };
      }
    } catch (error) {
      console.error("Trade calculation error:", error);
      return null;
    }
  };

  if (!pool) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Pool not found: {poolId}</p>
      </div>
    );
  }

  const tradeEstimate = calculateTrade(parseFloat(tradeAmount) || 0, isBuying);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "migrated":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-blue-500";
    if (progress >= 80) return "bg-orange-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      {/* 
               <BondingCurveChart bondingCurve={{
        virtualSolReserves: {
          toNumber: () => pool.currentFunding * 1e9
        },
        virtualTokenReserves: {
          toNumber: () => pool.totalSupply * 1e9
        },
        realSolReserves: {
          toNumber: () => pool.currentFunding * 1e9
        },
        // Add the missing properties
        realTokenReserves: new BN(pool.totalTokensSold), 
        tokenTotalSupply: new BN(pool.totalSupply),
        complete: pool.migrationStatus === 'migrated'
      }} /> */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {pool.tokenSymbol}
            </h3>
            <p className="text-sm text-gray-600">{pool.tokenName}</p>
            <p className="text-xs text-gray-500 font-mono">
              {pool.poolId.slice(0, 16)}...
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                pool.migrationStatus
              )}`}
            >
              {pool.migrationStatus.toUpperCase()}
            </span>
            <button
              onClick={onToggle}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Token Price
            </p>
            <p className="text-lg font-semibold text-gray-900">
              ${pool.tokenPrice.toFixed(8)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Market Cap
            </p>
            <p className="text-lg font-semibold text-gray-900">
              ${(pool.totalSupply * pool.tokenPrice).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Funding
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {pool.currentFunding.toFixed(1)} / {pool.fundingGoal} SOL
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Progress
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {pool.migrationProgress.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Migration Progress
            </span>
            <span className="text-sm text-gray-500">
              {pool.migrationProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                pool.migrationProgress
              )}`}
              style={{ width: `${Math.min(pool.migrationProgress, 100)}%` }}
            ></div>
          </div>
          {pool.migrationProgress >= 100 && (
            <p className="text-xs text-blue-600 mt-1">
              🎉 Pool has migrated to AMM!
            </p>
          )}
        </div>

        {/* Supply Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Tokens Sold:</span>
            <span className="font-medium ml-2">
              {pool.totalTokensSold.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Supply:</span>
            <span className="font-medium ml-2">
              {pool.totalSupply.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Trade Calculator */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              Trade Calculator
            </h4>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsBuying(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isBuying
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setIsBuying(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !isBuying
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Sell
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isBuying ? "SOL Amount to Spend" : "Token Amount to Sell"}
              </label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder={isBuying ? "1.0" : "1000"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Trade Estimate */}
            {tradeEstimate && parseFloat(tradeAmount) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    You will receive:
                  </span>
                  <span className="font-semibold text-blue-900">
                    {tradeEstimate.output.toFixed(6)}{" "}
                    {tradeEstimate.outputToken}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">Price Impact:</span>
                  <span className="text-xs text-orange-600">
                    ~{tradeEstimate.priceImpact}%
                  </span>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 mt-3">
              ⚠️ Estimates only. Actual prices may vary due to bonding curve
              mechanics and slippage.
            </p>
          </div>

          {/* Additional Pool Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Pool Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Token Mint:</span>
                  <span className="font-mono text-xs">
                    {pool.tokenMint.slice(0, 16)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quote Mint:</span>
                  <span className="font-mono text-xs">SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Price:</span>
                  <span className="font-medium">
                    ${pool.tokenPrice.toFixed(8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Funding Status</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Raised:</span>
                  <span className="font-medium">
                    {pool.currentFunding.toFixed(2)} SOL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Goal:</span>
                  <span className="font-medium">{pool.fundingGoal} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining:</span>
                  <span className="font-medium">
                    {(pool.fundingGoal - pool.currentFunding).toFixed(2)} SOL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LaunchpadDashboard: React.FC = () => {
  // const { pools, loading, error, refetch } = useLaunchpadPools();
  const { pools, error, refetch } = useLaunchpadPools();
  const [expandedPool, setExpandedPool] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"progress" | "price" | "funding">("progress");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "migrated">("all");

  // auto-refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [refetch]);

  const filteredPools = pools
    .filter((pool) => {
      if (filterStatus === "all") return true;
      return pool.migrationStatus === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.migrationProgress - a.migrationProgress;
        case "price":
          return b.tokenPrice - a.tokenPrice;
        case "funding":
          return b.currentFunding - a.currentFunding;
        default:
          return 0;
      }
    });

  const toggleExpanded = (poolId: string) => {
    setExpandedPool(expandedPool === poolId ? null : poolId);
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading LaunchLab pools...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">
            Error Loading Pools
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            {/* <button
              onClick={refetch}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="max-sm:hidden">Refresh</span>
            </button> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Pools</option>
                <option value="active">Active</option>
                <option value="migrated">Migrated</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="progress">Migration Progress</option>
                <option value="price">Token Price</option>
                <option value="funding">Current Funding</option>
              </select>
            </div>

            <div className="ml-auto flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">Total Pools:</span>
                <span className="font-medium ml-1">{pools.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Active:</span>
                <span className="font-medium ml-1">
                  {pools.filter((p) => p.migrationStatus === "active").length}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Migrated:</span>
                <span className="font-medium ml-1">
                  {pools.filter((p) => p.migrationStatus === "migrated").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {filteredPools.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pools found
            </h3>
            <p className="text-gray-500">
              No pools match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPools.map((pool) => (
              <PoolCard
                key={pool.poolId}
                poolId={pool.poolId}
                isExpanded={expandedPool === pool.poolId}
                onToggle={() => toggleExpanded(pool.poolId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaunchpadDashboard;
