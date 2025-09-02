// import React, { createContext, useContext, ReactNode } from 'react';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import {
//   PhantomWalletAdapter,
//   SolflareWalletAdapter,
// } from '@solana/wallet-adapter-wallets';
// import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';

// // Import wallet adapter CSS
// import '@solana/wallet-adapter-react-ui/styles.css';

// interface WalletContextProviderProps {
//   children: ReactNode;
// }

// const WalletContext = createContext({});

// export const useWallet = () => useContext(WalletContext);

// export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
//   const endpoint = 'https://prettiest-neat-diagram.solana-mainnet.quiknode.pro/89717baa754342dd72e0e6c825054b4e74d18374/';

//   const wallets = [
//     new PhantomWalletAdapter(),
//     new SolflareWalletAdapter(),
//     new BackpackWalletAdapter(),
//   ];

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect>
//         <WalletModalProvider>
//           <WalletContext.Provider value={{}}>
//             {children}
//           </WalletContext.Provider>
//         </WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// };

import React, { createContext, useContext, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { useConfig } from '../hooks/useConfig'; // Import your config

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

const WalletContext = createContext({});

export const useWallet = () => useContext(WalletContext);

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  // Use your config instead of hardcoded endpoint
  const { rpcUrl } = useConfig();
  
  // For immediate testing, force devnet:
  const endpoint = 'https://api.devnet.solana.com'; // Use this for testing
  // const endpoint = rpcUrl; // Use this once config is working properly
  
  console.log('🔗 WalletContext using endpoint:', endpoint);

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={{}}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};