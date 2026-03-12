# Vote_X (Shield-Vote)

A Secure Blockchain-Based E-Voting System with Edge AI.

## Architecture
- **Backend/Blockchain:** Hardhat, Solidity (Ethereum Smart Contracts)
- **Frontend:** Vite, React, ethers.js, TailwindCSS

## Prerequisites
- Node.js

## Quick Start Guide

This project consists of a blockchain backend (in the root directory) and a React frontend (in the `frontend` directory). You'll need to run both to use the full application.

### 1. Install Dependencies

Open a terminal and run these commands to install all required packages:

```bash
# 1. Install blockchain dependencies in the root directory
npm install

# 2. Install frontend dependencies in the frontend directory
cd frontend
npm install
cd ..
```

### 2. Running Local Blockchain (Backend)

Open a **new terminal window** in the root directory (`Vote_X`). This will run your local Ethereum network:

```bash
npx hardhat node
```
*Leave this terminal window open. It will print out test accounts and transaction logs.*

### 3. Deploy Smart Contracts

Open another **new terminal window** in the root directory (`Vote_X`). Run this command to deploy your contracts to the local node you just started:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

> **IMPORTANT:** Look at the output of this command. It will print a contract address (e.g., `0x5FbDB...`). Copy this line and update the `DEPLOYED_ADDRESS` variable in `frontend/src/utils/contract.js`.

### 4. Start the Frontend Application

In the same terminal where you deployed the contracts (or a new one), navigate to the frontend directory and start the Vite development server:

```bash
cd frontend
npm run dev
```

### 5. Access the App

Open your web browser and go to the link provided by Vite, usually:
[http://localhost:5173](http://localhost:5173)

---

## Common Issues & Troubleshooting

- **`Missing script: "dev"` in root folder:** You get this error because `npm run dev` is a Vite command and only works inside the `frontend/` directory. Be sure to run `cd frontend` first.
- **Transactions failing:** Ensure the Hardhat node (`npx hardhat node`) is running in the background.
- **Contract not found:** Ensure you have updated the address in `frontend/src/utils/contract.js` after deploying.
