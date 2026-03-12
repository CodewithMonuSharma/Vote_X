import React, { createContext, useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Liveness from "./pages/Liveness";
import VotePage from "./pages/VotePage";
import Confirmation from "./pages/Confirmation";
import VerifyVote from "./pages/VerifyVote";

const AppContext = createContext(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

export default function App() {
  const [commitmentHash, setCommitmentHash] = useState("");
  const [voterSecret, setVoterSecret] = useState("");
  const [livenessCleared, setLivenessCleared] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [blockNumber, setBlockNumber] = useState(null);

  const contextValue = {
    commitmentHash,
    setCommitmentHash,
    voterSecret,
    setVoterSecret,
    livenessCleared,
    setLivenessCleared,
    txHash,
    setTxHash,
    ipfsCid,
    setIpfsCid,
    walletAddress,
    setWalletAddress,
    blockNumber,
    setBlockNumber,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-cyber-dark">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/liveness" element={<Liveness />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/verify" element={<VerifyVote />} />
        </Routes>
      </div>
    </AppContext.Provider>
  );
}
