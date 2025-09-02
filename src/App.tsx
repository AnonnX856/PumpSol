import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import WalletButton from './components/WalletButton';
import LaunchCard from './components/LaunchCard';
import LaunchDetail from './components/LaunchDetail';
import CreateTokenModal from './components/CreateTokenModal';
import WorkingTokenService from './services/launchLabService';
import { LaunchData } from './types';
import { Rocket, Search, Filter, Zap, TrendingUp, Users, Plus } from 'lucide-react';
// import LaunchpadDashboard from './components/BondCard';

function App() {
  const { connection } = useConnection();
  const [launches, setLaunches] = useState<LaunchData[]>([]);
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'volume' | 'marketCap'>('newest');
  const [tokenService, setTokenService] = useState<WorkingTokenService | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      console.log('🔌 Initializing WorkingTokenService...');
      
      try {
        const service = new WorkingTokenService(connection);
        setTokenService(service);
        
        // Load existing launches
        const launchData = await service.getLaunches();
        setLaunches(launchData);
        console.log('✅ Service initialized successfully, loaded', launchData.length, 'tokens');
      } catch (error) {
        console.error('Failed to load launches:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeService();
  }, [connection]);

  // Function to refresh launches after token creation
  const handleTokenCreated = async () => {
    if (tokenService) {
      const launchData = await tokenService.getLaunches();
      setLaunches(launchData);
      console.log('🔄 Refreshed launches after token creation');
    }
  };

  const filteredAndSortedLaunches = launches
    .filter(launch => 
      launch.token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      launch.token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'marketCap':
          return b.marketCap - a.marketCap;
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const totalMarketCap = launches.reduce((sum, launch) => sum + launch.marketCap, 0);
  const totalVolume = launches.reduce((sum, launch) => sum + launch.volume24h, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b-2 border-black bg-white max-sm:pb-12 max-sm:pt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-sm:flex-col max-sm:gap-3 flex items-center sm:justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-0.5 bg-black border-2 border-black">
                  <img 
                    src="https://i.imgur.com/CDiDigA.png" 
                    alt="ToastCoin Logo" 
                    className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-black uppercase tracking-wider">ToastCoin</h1>
                  <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide hidden sm:block">Toast Bonding Curves</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex justify-center items-center space-x-1 sm:space-x-2 bg-black text-white px-4 py-2 sm:px-5 sm:py-3 h-12 sm:h-12 font-bold text-sm sm:text-sm uppercase tracking-wider hover:bg-white hover:text-black border-2 border-black transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group min-w-[100px] sm:min-w-[120px]"
                >
                  <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  <Plus className="w-4 h-4 max-sm:size-6 sm:w-5 sm:h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10 hidden sm:inline">Create</span>
                </button>
                
                <WalletButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-5xl font-bold text-black mb-2 sm:mb-4 uppercase tracking-wider">
            Discover <span className="underline decoration-2 sm:decoration-4">Next-Gen</span> Tokens
          </h2>
          <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8 uppercase tracking-wide px-4">
            Create tokens with instant bonding curves - Now with working devnet integration!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 max-w-4xl mx-auto">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-2 border-black pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base text-black placeholder-gray-400 focus:outline-none focus:bg-black focus:text-white transition-colors uppercase tracking-wide"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border-2 border-black px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base text-black focus:outline-none focus:bg-black focus:text-white transition-colors uppercase tracking-wide font-bold"
              >
                <option value="newest">Newest</option>
                <option value="volume">Volume</option>
                <option value="marketCap">Market Cap</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        {launches.length > 0 && (
          <div className="bg-gray-100 border-2 border-black p-4 sm:p-6 mb-8 sm:mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-black">{launches.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Total Tokens</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-black">${totalMarketCap.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Market Cap</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-black">${totalVolume.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">24h Volume</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  {launches.filter(l => l.marketCap > 1000).length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Active</p>
              </div>
            </div>
          </div>
        )}

        {/* <LaunchpadDashboard tokenService={tokenService} /> */}

        {/* Launches Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 sm:border-4 border-black border-t-transparent"></div>
          </div>
        ) : filteredAndSortedLaunches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedLaunches.map((launch) => (
              <LaunchCard
                key={launch.id}
                launch={launch}
                onClick={() => setSelectedLaunch(launch)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 border-2 border-black flex items-center justify-center">
              {launches.length === 0 ? (
                <Plus className="w-6 h-6 sm:w-10 sm:h-10 text-gray-400" />
              ) : (
                <Search className="w-6 h-6 sm:w-10 sm:h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-black mb-2 uppercase tracking-wider">
              {launches.length === 0 ? 'No tokens created yet' : 'No launches found'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 uppercase tracking-wide px-4 mb-6">
              {launches.length === 0 
                ? 'Be the first to create a token with bonding curves!' 
                : 'Try adjusting your search terms or filters'}
            </p>
            {launches.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-black text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-black border-2 border-black transition-colors"
              >
                Create First Token
              </button>
            )}
          </div>
        )}
      </div>

      {/* Launch Detail Modal */}
      {selectedLaunch && tokenService && (
        <LaunchDetail
          launch={selectedLaunch}
          onClose={() => setSelectedLaunch(null)}
          tokenService={tokenService}
        />
      )}

      {/* Create Token Modal */}
      {showCreateModal && tokenService && (
        <CreateTokenModal
          onClose={() => setShowCreateModal(false)}
          tokenService={tokenService}
          onTokenCreated={handleTokenCreated}
        />
      )}

      {/* Footer */}
        <footer className="border-t-2 border-black bg-gray-50 mt-12 sm:mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
                <span className="text-xs sm:text-base text-black font-bold uppercase tracking-wider">Powered by Raydium LaunchLab</span>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-base text-gray-600 uppercase tracking-wide font-medium">
                <span>Built on Solana</span>
                <span>•</span>
                <span>Decentralized Trading</span>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}

export default App;