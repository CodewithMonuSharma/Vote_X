import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [voterData, setVoterData] = useState({ name: "", voter_id: "", phone: "" });
  const [step, setStep] = useState(1); // 1: Create, 2: OTP, 3: Result
  const [otp, setOtp] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateVoter(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/create-voter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voterData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Successfully created, now send OTP
      const otpRes = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: voterData.phone }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.error);

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: voterData.phone, otp_code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedPassword(data.generated_password);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark">
      <header className="border-b border-neon-cyan/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="font-orbitron text-neon-cyan text-xl tracking-wider">
            SHIELD-VOTE ADMIN
          </button>
          <span className="text-gray-500 font-mono text-sm">Voter Verification Center</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-surface border border-neon-cyan/20 rounded-xl p-8 shadow-neon">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded mb-6 font-mono text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCreateVoter} className="space-y-6">
              <h2 className="font-orbitron text-xl text-white text-center mb-6">Begin Voter Verification</h2>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-2">VOTER FULL NAME</label>
                <input
                  type="text"
                  required
                  className="w-full bg-cyber-dark border border-neon-cyan/20 rounded px-4 py-3 text-white font-mono"
                  value={voterData.name}
                  onChange={(e) => setVoterData({ ...voterData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-2">VOTER ID NUMBER</label>
                <input
                  type="text"
                  required
                  className="w-full bg-cyber-dark border border-neon-cyan/20 rounded px-4 py-3 text-white font-mono"
                  value={voterData.voter_id}
                  onChange={(e) => setVoterData({ ...voterData, voter_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-2">PHONE NUMBER</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-cyber-dark border border-neon-cyan/20 rounded px-4 py-3 text-white font-mono"
                  value={voterData.phone}
                  onChange={(e) => setVoterData({ ...voterData, phone: e.target.value })}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-neon-cyan text-cyber-dark font-orbitron font-bold py-3 rounded glow-button transition"
              >
                {loading ? "PROCESSING..." : "REGISTER & SEND OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
              <h2 className="font-orbitron text-xl text-white mb-2">Verify OTP</h2>
              <p className="text-gray-400 font-mono text-sm mb-6">An OTP has been sent to {voterData.phone}</p>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="000000"
                className="w-full bg-cyber-dark border border-neon-cyan/40 rounded px-4 py-4 text-white font-mono text-center text-3xl tracking-widest outline-none focus:border-neon-cyan"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                disabled={loading}
                className="w-full bg-neon-cyan text-cyber-dark font-orbitron font-bold py-3 rounded glow-button transition"
              >
                {loading ? "VERIFYING..." : "CONFIRM OTP"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-900/30 border-2 border-green-500 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-3xl">✓</span>
                </div>
              </div>
              <h2 className="font-orbitron text-xl text-white">Voter Verified!</h2>
              <div className="bg-cyber-dark border border-green-500/30 p-6 rounded-lg font-mono">
                <p className="text-gray-500 text-xs mb-4 text-left">GIVE THESE CREDENTIALS TO THE VOTER:</p>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voter ID:</span>
                    <span className="text-white">{voterData.voter_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Password:</span>
                    <span className="text-neon-cyan font-bold break-all">{generatedPassword}</span>
                  </div>
                </div>
              </div>
              <p className="text-yellow-500/70 font-mono text-xs italic">
                Password is only shown once. Ensure the voter has recorded it correctly.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full bg-surface border border-neon-cyan/20 text-neon-cyan font-mono py-3 rounded hover:bg-neon-cyan/10 transition"
              >
                VERIFY ANOTHER VOTER
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
