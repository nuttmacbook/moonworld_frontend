/*
 * YOUR CODE (on-chain). The only door between the UI and the blockchain.
 * The UI (src/project/ui) imports from this file and nothing else on-chain.
 */

// Reads (one per page)
export { getHomeData, explorerTokenUrl } from "./reads";

// Transactions: none. This landing page only reads; buying and claiming happen on other sites.
