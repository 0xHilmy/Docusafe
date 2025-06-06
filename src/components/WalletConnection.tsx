import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { solanaContractService } from '../services/solanaContractService';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletConnection() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) return;

    try {
      setIsLoading(true);
      setError(null);
      const balance = await solanaContractService.getWalletBalance(publicKey);
      setBalance(balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
      // If there's a serious error, try disconnecting and reconnecting
      if (err instanceof Error && err.message.includes('could not find account')) {
        disconnect();
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, disconnect]);

  useEffect(() => {
    console.log('Wallet state:', { connected, connecting, publicKey: publicKey?.toString() });
    fetchBalance();
  }, [publicKey, connected, connecting, fetchBalance]);

  return (
    <div className="flex items-center space-x-4">
      {connected && publicKey ? (
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-md border border-gray-700">
            <Wallet className="h-4 w-4 text-green-400" />
            <span className="text-gray-300">
              {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-md border border-gray-700">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            ) : error ? (
              <span className="text-red-400 text-xs">{error}</span>
            ) : (
              <span className="text-gray-300">{balance.toFixed(4)} SOL</span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-yellow-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Connect wallet to store documents</span>
        </div>
      )}
      
      <WalletMultiButton 
        className={`
          !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800
          !rounded-md !text-sm !font-medium !px-6 !py-2.5 !h-auto
          !border !border-blue-500/30 !shadow-lg !shadow-blue-900/20
          transition-all duration-200 ease-out
          ${connecting ? '!opacity-80 !cursor-wait' : ''}
          flex items-center space-x-2
        `}
      />
    </div>
  );
}
