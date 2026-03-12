import { useNavigate } from "react-router-dom";
import { useAppContext } from "../App";
import { truncateHash } from "../utils/zkp";

export default function Confirmation() {
  const navigate = useNavigate();
  const { txHash, ipfsCid, blockNumber, commitmentHash } = useAppContext();

  if (!txHash) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 font-mono mb-4">No transaction found.</p>
          <button
            onClick={() => navigate("/")}
            className="text-neon-cyan font-mono hover:underline"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neon-cyan/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="font-orbitron text-neon-cyan text-xl tracking-wider hover:opacity-80 transition"
          >
            SHIELD-VOTE
          </button>
          <span className="text-gray-500 font-mono text-sm">Vote Confirmed</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Success indicator */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-green-400 rounded-full mb-4 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-orbitron text-2xl text-white mb-2">
              Vote Recorded
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              Your vote has been permanently recorded on the blockchain
            </p>
          </div>

          {/* Transaction details */}
          <div className="space-y-4">
            {/* TX Hash */}
            <div className="bg-deep-purple border border-neon-cyan/20 rounded-xl p-5">
              <p className="text-xs font-mono text-gray-500 mb-2">Transaction Hash</p>
              <code className="text-neon-cyan font-mono text-sm break-all">{txHash}</code>
              <div className="mt-3">
                <a
                  href={`http://localhost:8545/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-gray-500 hover:text-neon-cyan transition"
                >
                  View on Explorer &rarr;
                </a>
              </div>
            </div>

            {/* IPFS CID */}
            <div className="bg-deep-purple border border-neon-cyan/20 rounded-xl p-5">
              <p className="text-xs font-mono text-gray-500 mb-2">IPFS Audit Record</p>
              <code className="text-neon-cyan font-mono text-sm break-all">{ipfsCid}</code>
              <div className="mt-3">
                <a
                  href={`https://ipfs.io/ipfs/${ipfsCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-gray-500 hover:text-neon-cyan transition"
                >
                  View on IPFS &rarr;
                </a>
              </div>
            </div>

            {/* Block confirmation */}
            <div className="bg-deep-purple border border-green-500/20 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <p className="text-green-400 font-orbitron text-sm">
                    Confirmed in Block #{blockNumber || "—"}
                  </p>
                  <p className="text-gray-500 font-mono text-xs mt-1">
                    Commitment: {truncateHash(commitmentHash, 10, 6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/verify")}
              className="flex-1 bg-neon-cyan text-cyber-dark font-orbitron font-bold py-3 rounded-xl glow-button hover:scale-[1.02] transition-transform"
            >
              Verify My Vote
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-surface border border-neon-cyan/20 text-neon-cyan font-orbitron font-bold py-3 rounded-xl hover:bg-neon-cyan/10 transition"
            >
              Return Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
