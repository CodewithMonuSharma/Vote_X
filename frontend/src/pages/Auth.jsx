import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../App";
import { generateCommitment, truncateHash } from "../utils/zkp";

export default function Auth() {
  const navigate = useNavigate();
  const { setCommitmentHash } = useAppContext();

  const [voterId, setVoterId] = useState("");
  const [secret, setSecret] = useState("");
  const [hash, setHash] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1); // 1 = input, 2 = show hash

  async function handleGenerate(e) {
    e.preventDefault();
    if (!voterId.trim() || !secret.trim()) return;

    setGenerating(true);
    try {
      const commitment = await generateCommitment(voterId.trim(), secret.trim());
      setHash(commitment);
      setCommitmentHash(commitment);
      setStep(2);
    } catch (err) {
      console.error("Commitment generation failed:", err);
    }
    setGenerating(false);
  }

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
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
          <span className="text-gray-500 font-mono text-sm">Identity Verification</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <h2 className="font-orbitron text-2xl text-white mb-2">
                  Voter Authentication
                </h2>
                <p className="text-gray-400 font-mono text-sm">
                  Generate your anonymous commitment hash
                </p>
              </div>

              {/* Visual diagram */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="bg-surface border border-neon-cyan/20 rounded-lg px-3 py-2 text-xs font-mono text-gray-400">
                  Voter ID + Secret
                </div>
                <svg className="w-6 h-6 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="bg-surface border border-neon-cyan/20 rounded-lg px-3 py-2 text-xs font-mono text-neon-cyan">
                  SHA-256
                </div>
                <svg className="w-6 h-6 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="bg-surface border border-neon-cyan/20 rounded-lg px-3 py-2 text-xs font-mono text-neon-cyan">
                  Commitment
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    Voter ID
                  </label>
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    placeholder="Enter your voter ID"
                    className="w-full bg-surface border border-neon-cyan/20 focus:border-neon-cyan text-white font-mono px-4 py-3 rounded-lg outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    Secret Passphrase
                  </label>
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter your secret passphrase"
                    className="w-full bg-surface border border-neon-cyan/20 focus:border-neon-cyan text-white font-mono px-4 py-3 rounded-lg outline-none transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={generating || !voterId.trim() || !secret.trim()}
                  className="w-full bg-neon-cyan text-cyber-dark font-orbitron font-bold py-3 rounded-lg glow-button hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    "Generate Commitment Hash"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-green-400 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-orbitron text-2xl text-white mb-2">
                  Identity Committed
                </h2>
                <p className="text-gray-400 font-mono text-sm">
                  Your anonymous commitment hash has been generated
                </p>
              </div>

              {/* Hash display */}
              <div className="bg-surface border border-neon-cyan/30 rounded-xl p-6 mb-6">
                <p className="text-xs font-mono text-gray-500 mb-2">Commitment Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-neon-cyan font-mono text-sm break-all flex-1">
                    {truncateHash(hash, 18, 12)}
                  </code>
                  <button
                    onClick={copyHash}
                    className="shrink-0 px-3 py-1 bg-deep-purple border border-neon-cyan/20 rounded text-xs font-mono text-neon-cyan hover:bg-neon-cyan/10 transition"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-deep-purple border border-yellow-500/20 rounded-lg p-4 mb-8">
                <p className="text-yellow-400/80 font-mono text-xs leading-relaxed">
                  Your identity is never sent to the blockchain. Only this
                  commitment hash is used to record your vote anonymously.
                </p>
              </div>

              <button
                onClick={() => navigate("/liveness")}
                className="w-full bg-neon-cyan text-cyber-dark font-orbitron font-bold py-3 rounded-lg glow-button hover:scale-[1.02] transition-transform"
              >
                Proceed to Liveness Check
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
