import { ethers } from "ethers";

// Update this after running: npx hardhat run scripts/deploy.js --network localhost
const DEPLOYED_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function electionActive() view returns (bool)",
  "function castVote(bytes32 commitmentHash, uint256 candidateId)",
  "function getResults() view returns (uint256[] ids, string[] names, uint256[] voteCounts)",
  "function verifyVote(bytes32 commitmentHash) view returns (bool exists, uint256 candidateId, bytes32 voteHash, uint256 timestamp, uint256 blockNumber)",
  "function getCandidate(uint256 id) view returns (string)",
  "function getCandidateCount() view returns (uint256)",
  "function candidateIds(uint256) view returns (uint256)",
  "function candidateNames(uint256) view returns (string)",
  "function votes(bytes32) view returns (uint256)",
  "function hasVoted(bytes32) view returns (bool)",
  "function lastVoteHash(bytes32) view returns (bytes32)",
  "event VoteCast(bytes32 indexed commitmentHash, uint256 candidateId, bytes32 voteHash, uint256 timestamp)",
  "event ElectionStarted(uint256 timestamp, uint256 candidateCount)",
];

export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Demo fallback: connect to public RPC (Vercel) or local Hardhat node
  const rpcUrl = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getContract(signerOrProvider) {
  return new ethers.Contract(DEPLOYED_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function connectWallet() {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  }
  // Demo fallback: use first Hardhat test account (Note: Won't work on Vercel without MetaMask)
  const rpcUrl = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  try {
    const signer = await provider.getSigner(0);
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (err) {
    throw new Error("No Ethereum wallet found. Please install MetaMask.");
  }
}

export async function castVoteOnChain(commitmentHash, candidateId) {
  const { signer } = await connectWallet();
  const contract = getContract(signer);
  const tx = await contract.castVote(commitmentHash, candidateId);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    receipt,
  };
}

export async function getResults() {
  const provider = getProvider();
  const contract = getContract(provider);
  const [ids, names, voteCounts] = await contract.getResults();
  return ids.map((id, i) => ({
    id: Number(id),
    name: names[i],
    votes: Number(voteCounts[i]),
  }));
}

export async function verifyVoteOnChain(commitmentHash) {
  const provider = getProvider();
  const contract = getContract(provider);
  const result = await contract.verifyVote(commitmentHash);
  return {
    exists: result.exists,
    candidateId: Number(result.candidateId),
    voteHash: result.voteHash,
    timestamp: Number(result.timestamp),
    blockNumber: Number(result.blockNumber),
  };
}

export async function getCandidateName(candidateId) {
  const provider = getProvider();
  const contract = getContract(provider);
  return await contract.getCandidate(candidateId);
}

export function getContractAddress() {
  return DEPLOYED_ADDRESS;
}
