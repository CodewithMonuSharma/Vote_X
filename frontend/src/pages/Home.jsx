import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neon-cyan/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-orbitron text-neon-cyan text-xl tracking-wider">
            SHIELD-VOTE
          </h1>
          <span className="text-gray-600 font-mono text-xs">v1.0 MVP</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated shield icon */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 border-2 border-neon-cyan rounded-2xl rotate-45 shadow-neon">
            <div className="-rotate-45">
              <svg className="w-10 h-10 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>

          <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Secure. Private.{" "}
            <span className="text-neon-cyan glow-cyan">Verifiable.</span>
          </h2>

          <p className="text-gray-400 font-mono text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Blockchain-powered e-voting with Edge AI liveness verification and
            cryptographic identity protection.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-deep-purple border border-neon-cyan/10 rounded-xl p-6 hover:border-neon-cyan/30 transition">
              <div className="text-neon-cyan text-2xl mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="font-orbitron text-white text-sm mb-2">Edge AI Liveness</h3>
              <p className="text-gray-500 text-xs font-mono">
                Real-time facial verification runs locally in your browser. No data uploaded.
              </p>
            </div>

            <div className="bg-deep-purple border border-neon-cyan/10 rounded-xl p-6 hover:border-neon-cyan/30 transition">
              <div className="text-neon-cyan text-2xl mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="font-orbitron text-white text-sm mb-2">ZK Identity</h3>
              <p className="text-gray-500 text-xs font-mono">
                SHA-256 commitment hashing ensures your identity never touches the blockchain.
              </p>
            </div>

            <div className="bg-deep-purple border border-neon-cyan/10 rounded-xl p-6 hover:border-neon-cyan/30 transition">
              <div className="text-neon-cyan text-2xl mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="font-orbitron text-white text-sm mb-2">Immutable Ledger</h3>
              <p className="text-gray-500 text-xs font-mono">
                Every vote recorded on blockchain with end-to-end verifiable proof.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-3 bg-neon-cyan text-cyber-dark font-orbitron font-bold text-lg px-10 py-4 rounded-xl glow-button hover:scale-105 transition-transform"
          >
            Begin Voting
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <p className="text-gray-600 text-xs font-mono mt-6">
            For migrant workers, NRIs, and persons with disabilities — extending
            democratic access securely.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-gray-600 font-mono text-xs">
          <span>Shield-Vote Prototype</span>
          <span>Blockchain + Edge AI</span>
        </div>
      </footer>
    </div>
  );
}
