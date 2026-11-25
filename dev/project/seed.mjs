/*
 * YOUR CODE (on-chain, local only). Sample data for the local test chain: `count` holders of the test MWLD token,
 * so the page has a total supply to show. Nothing is deployed here: the engine deploys the test token.
 *
 * deployed (from dev/engine/local-chain.mjs):
 *   deployed.tokens.MWLD   test token from dev/settings/test-tokens.json ({ contract, address, decimals })
 */

import { ethers } from "ethers";

// Sample holders get 1,000 to 10,000 tokens each (sample data, not a setting of the real token)
const sampleAmount = (i) => String(1000 * (1 + (i % 10)));

const firstToken = (deployed) => Object.values(deployed?.tokens ?? {})[0];

/** Called by npm run dev: mints the test token to `count` new addresses */
async function seed({ deployed, count, onProgress = () => {} }) {
    const token = firstToken(deployed);
    if (!token) return;
    for (let i = 1; i <= count; i++) {
        const holder = ethers.Wallet.createRandom().address;
        await (await token.contract.mint(holder, ethers.parseUnits(sampleAmount(i), token.decimals))).wait();
        onProgress(i);
    }
}

/** Extra lines printed when npm run dev is ready */
async function summary(deployed) {
    const token = firstToken(deployed);
    if (!token) return [];
    const supply = await token.contract.totalSupply();
    return [ `  Test token supply ${ethers.formatUnits(supply, token.decimals)} (local only)` ];
}

export { seed, summary, sampleAmount, firstToken };
