import { useState } from "react";
import { connectWallet } from "../utils/contract";
import { useAppContext } from "../App";

export default function WalletConnect() {
  const { walletAddress, setWalletAddress } = useAppContext();
  const [connecting, setConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");

  async function handleConnect() {
    setConnecting(true);
    setError("");
    try {
      const { address, provider } = await connectWallet();
      setWalletAddress(address);

      // Get chain ID
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (err) {
      setError(err.message || "Connection failed");
    }
    setConnecting(false);
  }

  const isWrongNetwork = chainId && chainId !== 31337;
  const truncatedAddress = walletAddress
    ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
    : "";

  return (
    <div className="flex items-center gap-3">
      {walletAddress ? (
        <div className="flex items-center gap-2">
          {isWrongNetwork && (
            <span className="text-yellow-400 text-xs font-mono bg-yellow-900/20 border border-yellow-500/30 px-2 py-1 rounded">
              Wrong Network
            </span>
          )}
          <div className="flex items-center gap-2 bg-surface/80 border border-neon-cyan/20 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-mono text-sm text-neon-cyan">{truncatedAddress}</span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-2 bg-surface border border-neon-cyan/30 text-neon-cyan font-mono text-sm px-4 py-2 rounded-lg hover:bg-neon-cyan/10 transition disabled:opacity-50"
        >
          {connecting ? (
            <>
              <div className="w-3 h-3 border border-neon-cyan border-t-transparent rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect Wallet
            </>
          )}
        </button>
      )}
      {error && <span className="text-red-400 text-xs font-mono">{error}</span>}
    </div>
  );
}
