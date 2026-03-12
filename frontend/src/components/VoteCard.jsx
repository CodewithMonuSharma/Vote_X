export default function VoteCard({ candidate, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(candidate.id)}
      className={`relative w-full p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
        isSelected
          ? "border-neon-cyan bg-surface shadow-[0_0_20px_rgba(0,210,255,0.3)]"
          : "border-gray-700/50 bg-deep-purple hover:border-neon-cyan/50 hover:shadow-[0_0_10px_rgba(0,210,255,0.1)]"
      }`}
    >
      {/* Selection indicator */}
      <div
        className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected
            ? "border-neon-cyan bg-neon-cyan"
            : "border-gray-600 group-hover:border-neon-cyan/50"
        }`}
      >
        {isSelected && (
          <svg className="w-3.5 h-3.5 text-cyber-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Candidate info */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-orbitron text-lg font-bold transition-all ${
            isSelected
              ? "bg-neon-cyan text-cyber-dark"
              : "bg-surface text-neon-cyan border border-neon-cyan/30"
          }`}
        >
          {candidate.id}
        </div>
        <div>
          <h3
            className={`font-orbitron text-base transition-all ${
              isSelected ? "text-neon-cyan glow-cyan" : "text-white group-hover:text-neon-cyan"
            }`}
          >
            {candidate.name}
          </h3>
          <p className="text-gray-500 font-mono text-xs mt-1">
            ID: {String(candidate.id).padStart(3, "0")}
          </p>
        </div>
      </div>
    </button>
  );
}
