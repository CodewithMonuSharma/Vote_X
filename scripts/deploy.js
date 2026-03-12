const hre = require("hardhat");

async function main() {
  const ShieldVote = await hre.ethers.getContractFactory("ShieldVote");
  const shieldVote = await ShieldVote.deploy();
  await shieldVote.waitForDeployment();

  const address = await shieldVote.getAddress();
  console.log("ShieldVote deployed to:", address);

  // Start election with 4 demo candidates
  const candidateIds = [1, 2, 3, 4];
  const candidateNames = [
    "Candidate Alpha",
    "Candidate Beta",
    "Candidate Gamma",
    "Candidate Delta",
  ];

  const tx = await shieldVote.startElection(candidateIds, candidateNames);
  await tx.wait();
  console.log("Election started with", candidateIds.length, "candidates");

  console.log("\n--- Candidates ---");
  for (let i = 0; i < candidateIds.length; i++) {
    console.log(`  ${candidateIds[i]}: ${candidateNames[i]}`);
  }

  console.log("\n===========================================");
  console.log("UPDATE frontend/src/utils/contract.js with:");
  console.log(`DEPLOYED_ADDRESS = "${address}"`);
  console.log("===========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
