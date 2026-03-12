import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../App";
import { verifyVoteOnChain, getResults, getCandidateName } from "../utils/contract";
import { truncateHash } from "../utils/zkp";

export default function VerifyVote() {
  const navigate = useNavigate();
  const { commitmentHash } = useAppContext();

  const [inputHash, setInputHash] = useState(commitmentHash || "");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Fetch live results
  useEffect(() => {
    async function fetchResults() {
      setLoadingResults(true);
      try {
        const r = await getResults();
        setResults(r);
      } catch {
        // Use empty results
      }
      setLoadingResults(false);
    }
    fetchResults();
  }, []);

  async function handleVerify() {
    if (!inputHash.trim()) return;

    setVerifying(true);
    setError("");
    setResult(null);
    setCandidateName("");

    try {
      const voteData = await verifyVoteOnChain(inputHash.trim());

      if (!voteData.exists) {
        setError("No vote found for this commitment hash.");
        setVerifying(false);
        return;
      }

      setResult(voteData);

      // Get candidate name
      if (voteData.candidateId > 0) {
        try {
          const name = await getCandidateName(voteData.candidateId);
          setCandidateName(name);
        } catch {
          setCandidateName(`Candidate ${voteData.candidateId}`);
        }
      } else {
        setCandidateName("Protected Vote (Coercion Override Available)");
      }
    } catch (err) {
      setError("Verification failed: " + (err.reason || err.message));
    }

    setVerifying(false);
  }

  const maxVotes = Math.max(1, ...results.map((r) => r.votes));

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
          <span className="text-gray-500 font-mono text-sm">Verification Portal</span>
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-2">
              Vote Verification
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              Verify your vote on the blockchain
            </p>
          </div>

          {/* Verification input */}
          <div className="bg-deep-purple border border-neon-cyan/20 rounded-xl p-6 mb-8">
            <label className="block text-sm font-mono text-gray-400 mb-2">
              Commitment Hash
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="0x..."
                className="flex-1 bg-surface border border-neon-cyan/20 focus:border-neon-cyan text-neon-cyan font-mono px-4 py-3 rounded-lg outline-none transition text-sm"
              />
              <button
                onClick={handleVerify}
                disabled={verifying || !inputHash.trim()}
                className="px-6 py-3 bg-neon-cyan text-cyber-dark font-orbitron font-bold rounded-lg glow-button hover:scale-105 transition-transform disabled:opacity-50"
              >
                {verifying ? (
                  <div className="w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Verification result */}
          {result && (
            <div className="bg-deep-purple border border-green-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-orbitron text-green-400 text-sm">
                    Vote Integrity Verified
                  </h3>
                  <p className="text-gray-500 font-mono text-xs">
                    Record found on blockchain
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-mono text-xs">Candidate</span>
                  <span className="text-white font-mono text-sm text-right">
                    {candidateName}
                  </span>
                </div>
                <div className="border-t border-gray-700/50" />

                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-mono text-xs">Vote Hash</span>
                  <code className="text-neon-cyan font-mono text-xs text-right break-all max-w-[60%]">
                    {truncateHash(result.voteHash, 14, 10)}
                  </code>
                </div>
                <div className="border-t border-gray-700/50" />

                <div className="flex justify-between">
                  <span className="text-gray-500 font-mono text-xs">Block Number</span>
                  <span className="text-white font-mono text-sm">
                    #{result.blockNumber}
                  </span>
                </div>
                <div className="border-t border-gray-700/50" />

                <div className="flex justify-between">
                  <span className="text-gray-500 font-mono text-xs">Timestamp</span>
                  <span className="text-white font-mono text-sm">
                    {result.timestamp > 0
                      ? new Date(result.timestamp * 1000).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live results */}
          <div className="bg-deep-purple border border-neon-cyan/10 rounded-xl p-6">
            <h3 className="font-orbitron text-white text-sm mb-6">
              Live Election Results
            </h3>

            {loadingResults ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-gray-500 font-mono text-xs text-center py-4">
                No results available
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((r) => (
                  <div key={r.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300 font-mono text-sm">
                        {r.name}
                      </span>
                      <span className="text-neon-cyan font-mono text-sm">
                        {r.votes} votes
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-cyan to-purple-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${maxVotes > 0 ? (r.votes / maxVotes) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/")}
              className="text-neon-cyan font-mono text-sm hover:underline"
            >
              &larr; Return Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
