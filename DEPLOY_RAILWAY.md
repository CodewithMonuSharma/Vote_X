# Deploying Vote_X to Railway

Yes, it is absolutely possible to deploy this project on [Railway](https://railway.app/). 

I have added a `railway.json` configuration file to the root of the project. This means Railway will **automatically understand how to build and start your frontend** without you having to configure any custom paths or commands!

## Step-by-Step Deployment Guide

### Step 1: Push your code to GitHub
Railway connects seamlessly to GitHub.
1. Initialize a git repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on GitHub and push your code there.

### Step 2: Set up Railway
1. Go to [Railway.app](https://railway.app/) and log in with your GitHub account.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `Vote_X` repository.

### Step 3: Wait for Initial Build
Railway will automatically detect the `railway.json` file I created. It will navigate to your `frontend` directory, install all Node dependencies, run Vite's `build` command, and then serve it using `npx serve`.

### Step 4: Environment Variables (Important for Production)
Just like in Vercel, your app needs to know how to connect to the blockchain, because your local Hardhat node won't work on the public internet for other users.

1. Go to your new project in Railway and click on the **Variables** tab.
2. Add the following variables:
   - **VITE_RPC_URL:** *(A public RPC URL from Alchemy or Infura, e.g., `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`)*
   - **VITE_CONTRACT_ADDRESS:** *(The address of your contract after you deploy it to a testnet)*

### Step 5: Generate a Public URL
1. Go to the **Settings** tab.
2. Scroll down to **Networking**.
3. Click **Generate Domain**. Railway will provide you with a live `up.railway.app` link.

Once the build finishes and the environment variables are set, your Web3 voting app will be live on the internet!
