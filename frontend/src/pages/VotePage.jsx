import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../App";
import { castVoteOnChain, getResults } from "../utils/contract";
import { mockPinToIPFS } from "../utils/ipfs";
import VoteCard from "../components/VoteCard";
import WalletConnect from "../components/WalletConnect";
import CoercionMonitor from "../components/CoercionMonitor";

export default function VotePage() {
  const navigate = useNavigate();
  const {
    commitmentHash,
    livenessCleared,
    setTxHash,
    setIpfsCid,
    setBlockNumber,
  } = useAppContext();

  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [casting, setCasting] = useState(false);
  const [error, setError] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // Guard: redirect if not verified
  useEffect(() => {
    if (!livenessCleared) {
      navigate("/liveness");
    }
  }, [livenessCleared, navigate]);

  // Fetch candidates
  useEffect(() => {
    async function load() {
      try {
        const results = await getResults();
        if (results.length === 0) {
          // Fallback demo candidates if contract not deployed
          setCandidates([
            { id: 1, name: "Candidate Alpha", votes: 0 },
            { id: 2, name: "Candidate Beta", votes: 0 },
            { id: 3, name: "Candidate Gamma", votes: 0 },
            { id: 4, name: "Candidate Delta", votes: 0 },
          ]);
        } else {
          setCandidates(results);
        }
      } catch (err) {
        console.warn("Failed to fetch from contract, using demo data:", err.message);
        setCandidates([
          { id: 1, name: "Candidate Alpha", votes: 0 },
          { id: 2, name: "Candidate Beta", votes: 0 },
          { id: 3, name: "Candidate Gamma", votes: 0 },
          { id: 4, name: "Candidate Delta", votes: 0 },
        ]);
      }
      setLoadingCandidates(false);
    }
    load();
  }, []);

  async function handleCastVote() {
    if (!selectedId || !commitmentHash) return;

    setCasting(true);
    setError("");

    try {
      // Cast vote on blockchain
      const { txHash, blockNumber } = await castVoteOnChain(
        commitmentHash,
        selectedId
      );

      // Pin audit log to mock IPFS
      const ipfsResult = await mockPinToIPFS({
        commitmentHash,
        candidateId: selectedId,
        txHash,
        timestamp: new Date().toISOString(),
      });

      setTxHash(txHash);
      setBlockNumber(blockNumber);
      setIpfsCid(ipfsResult.cid);
      navigate("/confirmation");
    } catch (err) {
      console.error("Vote casting failed:", err);
      if (err.code === "ACTION_REJECTED") {
        setError("Transaction rejected by user.");
      } else {
        setError("Failed to cast vote: " + (err.reason || err.message));
      }
      setCasting(false);
    }
  }

  function handleCoercionDetected() {
    // Coercion monitor handles dummy vote internally
    // Allow user to continue and override
  }

  if (!livenessCleared) return null;

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
          <WalletConnect />
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-orbitron text-2xl text-white mb-2">
              Cast Your Vote
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              Select a candidate and confirm your vote on the blockchain
            </p>
          </div>

          {/* Commitment hash display */}
          <div className="bg-surface/50 border border-neon-cyan/10 rounded-lg px-4 py-3 mb-8 flex items-center justify-between">
            <span className="text-gray-500 font-mono text-xs">Your commitment:</span>
            <code className="text-neon-cyan font-mono text-xs">
              {commitmentHash ? commitmentHash.slice(0, 14) + "..." + commitmentHash.slice(-8) : "Not set"}
            </code>
          </div>

          {/* Candidates */}
          {loadingCandidates ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {candidates.map((c) => (
                <VoteCard
                  key={c.id}
                  candidate={c}
                  isSelected={selectedId === c.id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Cast vote button */}
          <button
            onClick={handleCastVote}
            disabled={!selectedId || casting}
            className="w-full bg-neon-cyan text-cyber-dark font-orbitron font-bold py-4 rounded-xl glow-button hover:scale-[1.01] transition-transform disabled:opacity-40 disabled:cursor-not-allowed text-lg"
          >
            {casting ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                Casting Vote...
              </span>
            ) : (
              "Cast Vote"
            )}
          </button>

          {!selectedId && !casting && (
            <p className="text-gray-600 font-mono text-xs text-center mt-3">
              Select a candidate to enable voting
            </p>
          )}
        </div>
      </main>

      {/* Coercion Monitor — runs in background */}
      <CoercionMonitor
        commitmentHash={commitmentHash}
        onCoercionDetected={handleCoercionDetected}
      />
    </div>
  );
}
