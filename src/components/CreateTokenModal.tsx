import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, Upload, Zap, AlertCircle } from 'lucide-react';
import WorkingTokenService, { CreateTokenParams } from '../services/launchLabService';

interface CreateTokenModalProps {
  onClose: () => void;
  tokenService: WorkingTokenService;
  onTokenCreated?: () => void; // Callback to refresh the UI
}

const CreateTokenModal: React.FC<CreateTokenModalProps> = ({ 
  onClose, 
  tokenService,
  onTokenCreated 
}) => {
  const wallet = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    totalSupply: '1000000000',
    logoFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) { // 2MB limit
      setFormData(prev => ({ ...prev, logoFile: file }));
      setError(null);
    } else if (file) {
      setError('Image must be smaller than 2MB');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Form submitted, starting token creation...');
    
    if (!wallet.connected || !wallet.publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    console.log('📊 Form data:', formData);
    console.log('💼 Wallet connected:', wallet.connected);
    console.log('🔑 Wallet public key:', wallet.publicKey?.toBase58());
    
    try {
      const createParams: CreateTokenParams = {
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        description: formData.description,
        totalSupply: parseInt(formData.totalSupply),
        decimals: 6, // Standard 6 decimals
        logoFile: formData.logoFile || undefined,
      };

      console.log('🚀 Creating token with working service...');
      const mintAddress = await tokenService.createToken(createParams, wallet);
      console.log('✅ Token created successfully, mint address:', mintAddress);
      
      setSuccess(`🎉 Token created successfully!

Token Details:
• Name: ${formData.name}
• Symbol: $${formData.symbol.toUpperCase()}
• Mint: ${mintAddress}

✨ Bonding curve activated! Your token is now ready for trading.

Check the dashboard to see your token with live trading capabilities!`);
      
      // Call the callback to refresh UI
      if (onTokenCreated) {
        onTokenCreated();
      }
      
      // Close modal after 5 seconds to give user time to read
      setTimeout(() => {
        onClose();
      }, 5000);
      
    } catch (error) {
      console.error('Token creation failed:', error);
      console.error('❌ Detailed error information:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
      
      let errorMessage = error instanceof Error ? error.message : 'Token creation failed';
      
      // Provide helpful error messages
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = `❌ Insufficient SOL for transaction fees.

You need approximately 0.002 SOL for:
• Mint account creation
• Token account setup  
• Initial token minting

💡 Get free devnet SOL from: https://faucet.solana.com
(Make sure you're on devnet/testnet for testing)`;
      } else if (errorMessage.includes('Transaction simulation failed')) {
        errorMessage = `❌ Transaction would fail. Please check:

• Wallet has sufficient SOL balance
• Network connection is stable
• Try refreshing and reconnecting wallet`;
      }
      
      setError(errorMessage);
    } finally {
      console.log('🏁 Token creation process finished');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border-2 border-black rounded-none w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="border-b-2 border-black p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-3xl font-bold text-black">CREATE TOKEN</h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-black hover:text-white transition-colors border-2 border-black"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-black text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider">
                Token Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="My Awesome Token"
                required
                maxLength={32}
                className="w-full border-2 border-black px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-black placeholder-gray-500 focus:outline-none focus:bg-black focus:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-black text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider">
                Symbol *
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="MAT"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                className="w-full border-2 border-black px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-black placeholder-gray-500 focus:outline-none focus:bg-black focus:text-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-black text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your token and its purpose..."
              rows={4}
              maxLength={200}
              className="w-full border-2 border-black px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-black placeholder-gray-500 focus:outline-none focus:bg-black focus:text-white transition-colors resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.description.length}/200
            </div>
          </div>

          <div>
            <label className="block text-black text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider">
              Token Logo
            </label>
            <div className="border-2 border-black border-dashed p-4 sm:p-8 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-black mx-auto mb-2 sm:mb-4" />
                <p className="text-sm sm:text-base text-black font-medium">
                  {formData.logoFile ? ` ${formData.logoFile.name}` : 'Click to upload logo'}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
                  PNG, JPG, GIF up to 2MB (Optional)
                </p>
              </label>
            </div>
          </div>

          <div className="bg-gray-100 border-2 border-black p-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-black mt-0.5" />
              <div>
                <p className="text-black font-bold text-xs sm:text-sm uppercase tracking-wider mb-2">Token Economics</p>
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600">Total Supply:</span>
                    <span className="font-bold ml-2">{parseInt(formData.totalSupply).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Decimals:</span>
                    <span className="font-bold ml-2">6</span>
                  </div>
                  <div>
                    <span className="text-gray-600">For Sale:</span>
                    <span className="font-bold ml-2">80%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Starting Price:</span>
                    <span className="font-bold ml-2">0.000001 SOL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-bold text-sm uppercase tracking-wider mb-1">Error</p>
                  <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
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

          {/* <div className="bg-blue-50 border-2 border-blue-500 p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-blue-800 font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">How It Works</p>
                <ul className="text-blue-700 text-xs sm:text-sm space-y-1">
                  <li>• Creates real SPL token on Solana devnet</li>
                  <li>• Automatically sets up bonding curve for trading</li>
                  <li>• All tokens are minted to your wallet</li>
                  <li>• Uses FREE devnet SOL (get from faucet.solana.com)</li>
                  <li>• Token appears immediately in dashboard for trading</li>
                </ul>
              </div>
            </div>
          </div> */}

          {wallet.connected ? (
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.symbol}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 font-bold text-sm sm:text-lg uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-black ${
                loading || !formData.name || !formData.symbol
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-white hover:text-black'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating Token & Bonding Curve...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Create Token (~0.002 SOL)</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-center py-3 sm:py-4">
              <p className="text-sm sm:text-base text-black font-medium mb-4 uppercase tracking-wider">
                Connect wallet to create token
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTokenModal;