# Project Roadmap & Features - Shield-Vote

This document tracks the implementation status of features and outlines the future vision for the Shield-Vote platform.

## ✅ Completed Features (Done)
- [x] **Smart Contract Core**: Basic voting, candidate registration, and tallying logic.
- [x] **Cyberpunk UI**: High-fidelity React frontend with neon aesthetics and glassmorphism.
- [x] **Secure Auth System**: OTP-based officer verification with auto-generated passwords and JWT.
- [x] **AI Liveness Check**: Face landmark tracking with interactive challenges (blink, turn, smile).
- [x] **Coercion Monitor**: Background detection of multiple faces, gaze redirection, and shoulder posture.
- [x] **Protective Voting**: Automatic "dummy vote" mechanism when coercion is detected.
- [x] **Local Persistence**: Handling voter secrets and commitment hashes in application state.
- [x] **Receipt Generation**: Providing users with transaction hashes and block numbers for verification.

## 🚧 In Progress / Pending (To-Do)
- [ ] **Real IPFS Integration**: Replace the current mock IPFS service with a real connection (Pinata/Infura/Web3.Storage).
- [ ] **Admin Dashboard**: A secure interface for Election Officers to add candidates and "Start/Stop" elections.
- [ ] **Voter Identity (OCR)**: Integration of ID scanning to verify the voter's age and residency.
- [ ] **Multi-Wallet Support**: Deeper integration with RainbowKit or Web3Modal for diverse wallet support.
- [ ] **Gas Optimization**: Refactoring the `castVote` function to minimize storage costs on Ethereum Mainnet.

## 🎯 High Priority (Next Steps)
- [ ] **Email/SMS Notifications**: Sending a confirmation "Voted" alert to the user's registered contact.
- [ ] **Zero-Knowledge Proofs (ZKP)**: Implementing Circom/SnarkJS to prove "I am a valid voter" without revealing *which* voter I am.
- [ ] **Election Results Visualization**: Real-time charts (D3.js/Chart.js) for the results page.

## 🚀 Great to Have (Future Ideas)
- [ ] **Mobile App**: Native iOS/Android apps using React Native for better camera performance.
- [ ] **DAO Integration**: Allowing token holders to propose new candidates for the next election cycle.
- [ ] **Biometric Hardware Sync**: Support for Fingerprint/FaceID API where available.
- [ ] **Layer 2 Deployment**: Porting to Arbitrum or Polygon to ensure sub-cent voting fees.
- [ ] **Global Audit Portal**: A public website where anyone can verify the cryptographic integrity of the entire election.
