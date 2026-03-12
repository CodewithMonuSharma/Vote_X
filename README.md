# Shield-Vote: Secure Blockchain-Based E-Voting with Edge AI

Shield-Vote is a futuristic, secure, and decentralized e-voting platform designed to combat physical coercion and voter impersonation. It integrates **Ethereum Smart Contracts** for transparent vote recording and **Edge AI (Computer Vision)** for real-time security monitoring.

## 🌟 Key Features

### 1. 🛡️ Coercion-Resistant Voting
The system uses background AI monitoring to detect if a voter is under physical pressure.
- **Multi-Person Detection**: Alerts the user if more than one person is detected near the camera.
- **Suspicion Scoring**: Monitors rapid blinking, gaze redirection, and shoulder tension to detect "voting under stress."
- **Protective Overrides**: In high-risk scenarios, the system can cast a "dummy" vote that overwrites previous records, allowing the user to mask their intent until they are in a safe environment.

### 2. 👁️ AI Liveness Verification
Before accessing the ballot, users must pass a liveness check to ensure they are a real person and not a photo/video bypass.
- Uses **Google MediaPipe** for high-fidelity facial landmark tracking.
- Interactive challenges: Blink, Smile, and Head Turns.

### 3. 🔐 Two-Factor Voter Authentication
A secure hybrid system to bridge real-world identity with digital voting.
- **Officer Verification**: A Voting Officer verifies physical ID and triggers an **OTP** to the voter's phone.
- **Auto-Password Generation**: Upon successful OTP entry, the system generates a secure, hashed password for the voter.
- **JWT Protection**: Secured sessions ensure that only verified citizens can access the voting terminal.

### 4. ⛓️ Blockchain Transparency
All votes are recorded on an Ethereum-compatible blockchain.
- **Immutable Audit Log**: Every vote is timestamped and hashed.
- **Vote Overwriting**: Supports the "last vote counts" principle to mitigate coercion.

---

## 🛠️ Tech Stack

- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion
- **AI/ML**: Google MediaPipe (Face Landmarker, Pose Landmarker)
- **Backend**: Node.js, Express, MongoDB (Voter DB & OTP TTL)
- **Security**: Bcrypt (Hashing), JWT (Authentication)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or Atlas)
- [MetaMask](https://metamask.io/) browser extension

### Installation

1. **Clone and Install Root Deps**
   ```bash
   git clone https://github.com/CodewithMonuSharma/Vote_X.git
   cd Vote_X
   npm install
   ```

2. **Frontend & Backend Setup**
   ```bash
   # Install Frontend
   cd frontend && npm install
   
   # Install Backend
   cd ../backend && npm install
   ```

### Running Locally

#### Step 1: Start the Local Blockchain
In the root directory:
```bash
npx hardhat node
```

#### Step 2: Deploy Smart Contract
In a new terminal (root):
```bash
npm run deploy
```
*Update `frontend/src/utils/contract.js` with the `DEPLOYED_ADDRESS`.*

#### Step 3: Start the Backend Server
In a new terminal:
```bash
cd backend
node server.js
```

#### Step 4: Run the Web App
In a new terminal:
```bash
cd frontend
npm run dev
```

---

## 📂 Project Structure

```text
├── backend/            # Express API & OTP System
│   ├── models/         # MongoDB Schemas (Voter, OTP, etc.)
│   └── server.js       # Main API Entry Point
├── contracts/          # Solidity Smart Contracts
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── pages/      # Views (AdminAuth, Auth, VotePage, etc.)
│   │   ├── components/ # Shared UI (LivenessCheck, CoercionMonitor)
│   │   └── utils/      # API helpers and Web3 config
├── scripts/            # Blockchain Deployment Scripts
├── .env                # (Untracked) Environment Variables
└── hardhat.config.js   # Hardhat Config
```

---

## 👨‍💼 Role-Based Workflow

### 📋 Voting Officer (Admin)
- Accesses `/admin` to register a new voter.
- Sends **OTP** to the voter's mobile.
- Verifies the OTP and provides the voter with their **Voter ID** and **Generated Password**.

### 🗳️ Citizen (Voter)
- Logs in at `/auth` using credentials provided by the officer.
- Completes **AI Liveness Verification**.
- Selects candidate and confirms vote on the **Blockchain**.
- Receives a cryptographic receipt for verification.

---

## 📄 License
This project is licensed under the MIT License.
