import { useNavigate } from "react-router-dom";
import { useAppContext } from "../App";
import LivenessCheck from "../components/LivenessCheck";

export default function Liveness() {
  const navigate = useNavigate();
  const { setLivenessCleared } = useAppContext();

  function handlePass() {
    setLivenessCleared(true);
    navigate("/vote");
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
          <span className="text-gray-500 font-mono text-sm">Liveness Verification</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="font-orbitron text-2xl text-white mb-2">
              AI Liveness Verification
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              Complete the challenges to verify you are a real person
            </p>
          </div>

          <LivenessCheck onPass={handlePass} />
        </div>
      </main>
    </div>
  );
}
