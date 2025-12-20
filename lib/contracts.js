// app/lib/contracts.js
// Central place to configure contract addresses without using Next env vars.

// ✅ Replace these with your deployed addresses
export const CONTRACTS = {
  // Chain ID where your contracts are deployed.
  // Examples:
  // Sepolia: 11155111
  // Arbitrum Sepolia: 421614
  // Optimism Sepolia: 11155420
  chainId: 11155111,

  // Deployed contracts
  assetPool: "0x7A58A13594872953765928c1f0b79d3494412525",
  governor: "0x7f9c8145f0bc27f9f0e4a3c9b36780a816a80bf1",

  // Optional: block number where the governor was deployed (helps log queries).
  // If you don’t know it yet, keep 0n.
  governorDeployBlock: 0n,
};
