# Deploying Vote_X to Vercel

To deploy this project to Vercel, you need to understand that **Vercel only hosts the frontend**. The blockchain backend (Hardhat) cannot be hosted on Vercel.

To make the app work for anyone on the internet, you must deploy the smart contracts to a **public testnet** (like Alchemy Sepolia, Polygon Amoy, etc.) instead of your local machine, and provide a public RPC URL to the Vercel frontend.

Here is the step-by-step guide to deploying:

## Step 1: Push your code to GitHub
Vercel works best by connecting to your GitHub repository.
1. Initialize a git repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on GitHub and push your code there.

## Step 2: Set up Vercel Deployment
1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **Add New** -> **Project**.
3. Import the `Vote_X` repository from GitHub.

## Step 3: Configure Vercel Build Settings
This is the most crucial step because your React app is inside the `frontend` folder:

1. **Framework Preset:** Vercel should automatically detect **Vite**.
2. **Root Directory:** Click "Edit" and change it from `./` to `frontend`.
3. **Build Command:** It should automatically be `npm run build` or `vite build`.
4. **Output Directory:** It should automatically be `dist`.

## Step 4: Environment Variables (Important for Production)
Since others cannot connect to your local `http://127.0.0.1:8545` when they visit the Vercel app, you need a public blockchain connection if they don't have MetaMask installed.

In the **Environment Variables** section on Vercel, add:
- **Name:** `VITE_RPC_URL`
- **Value:** *(A public RPC URL from Alchemy or Infura, e.g., `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`)*

> **Note:** For the app to be fully functional, you *must* deploy your Hardhat contracts to that specific testnet and update `const DEPLOYED_ADDRESS` in `frontend/src/utils/contract.js` before pushing to GitHub!

## Step 5: Deploy!
Click the **Deploy** button. Vercel will install the frontend dependencies, build the Vite app, and provide you with a live URL!
