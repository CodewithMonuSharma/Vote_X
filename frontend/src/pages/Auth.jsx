import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../App";

const API_BASE = "http://localhost:5000";

export default function Auth() {
  const navigate = useNavigate();
  const { setWalletAddress } = useAppContext(); // Simplified for now

  const [voterId, setVoterId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    if (!voterId.trim() || !password.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: voterId, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Store JWT token
      localStorage.setItem("voter_token", data.token);
      localStorage.setItem("voter_name", data.voter.name);
      
      // Proceed to voting flow
      navigate("/liveness");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark">
      {/* Header */}
      <header className="border-b border-neon-cyan/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="font-orbitron text-neon-cyan text-xl tracking-wider hover:opacity-80 transition"
          >
            SHIELD-VOTE
          </button>
          <span className="text-gray-500 font-mono text-sm">Citizen Portal</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="font-orbitron text-3xl text-white mb-2 tracking-widest">
              IDENTITY LOGIN
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              Use your verified Voter ID and generated password
            </p>
          </div>

          <div className="bg-surface border border-neon-cyan/20 rounded-2xl p-8 shadow-neon relative overflow-hidden">
            {/* Scanline effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-cyan/20 animate-scanline pointer-events-none" />

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-500 font-mono text-xs p-4 rounded-lg mb-6 text-center">
                ACCESS DENIED: {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-tighter">
                  Voter Identification (VID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    placeholder="VID-XXXXXXXX"
                    className="w-full bg-cyber-dark border border-neon-cyan/20 focus:border-neon-cyan text-white font-mono px-4 py-3 rounded-lg outline-none transition-all placeholder:text-gray-700"
                    required
                  />
                  <div className="absolute right-3 top-3.5 text-neon-cyan/20 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-tighter">
                  Secure Access Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-cyber-dark border border-neon-cyan/20 focus:border-neon-cyan text-white font-mono px-4 py-3 rounded-lg outline-none transition-all placeholder:text-gray-700"
                    required
                  />
                  <div className="absolute right-3 top-3.5 text-neon-cyan/20 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !voterId.trim() || !password.trim()}
                className="w-full bg-neon-cyan text-cyber-dark font-orbitron font-bold py-4 rounded-xl glow-button hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                    AUTHENTICATING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    INITIATE LOGIN
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 font-mono text-xs">
                Need verification? Contact your nearest 
                <button onClick={() => navigate("/admin")} className="text-neon-cyan/60 hover:text-neon-cyan ml-1 underline decoration-dotted">
                  Voting Officer
                </button>
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-8 opacity-20 filter grayscale">
            <div className="font-orbitron text-[10px] text-gray-400">ENCRYPTION: AES-256-GCM</div>
            <div className="font-orbitron text-[10px] text-gray-400">AUTH: JWT (ES256)</div>
            <div className="font-orbitron text-[10px] text-gray-400">NETWORK: SHIELD-P2P</div>
          </div>
        </div>
      </main>
    </div>
  );
}
