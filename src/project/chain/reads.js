/*
 * YOUR CODE (on-chain). Reading the MWLD token: one function for the one page.
 * The token is an existing BEP-20 (not ours), so it has no combined view: its four small getters
 * are sent together (1 round, 4 eth_call) and cached, so moving around the page costs nothing more.
 * On the local test chain (dev/ npm run dev) the test token from dev/settings/test-tokens.json stands in for it.
 */

import { box, readRpc, NETWORK, IS_LOCAL } from "../../engine/chain/connect";
import { cachedRead } from "../../engine/chain/cache";
import { metered } from "../../engine/chain/rpcMeter";
import { project } from "../settings";
import { toTokenView } from "./viewParse";

// Standard ERC20 getters (system ABI, not a setting)
const TOKEN_READ_ABI = [
    { inputs: [], name: "name", outputs: [ { internalType: "string", name: "", type: "string" } ], stateMutability: "view", type: "function" },
    { inputs: [], name: "symbol", outputs: [ { internalType: "string", name: "", type: "string" } ], stateMutability: "view", type: "function" },
    { inputs: [], name: "decimals", outputs: [ { internalType: "uint8", name: "", type: "uint8" } ], stateMutability: "view", type: "function" },
    { inputs: [], name: "totalSupply", outputs: [ { internalType: "uint256", name: "", type: "uint256" } ], stateMutability: "view", type: "function" },
];

/** The first test token of the local chain, or the real token address from settings */
const tokenAddress = () => {
    if (!IS_LOCAL) return project.tokenAddress;
    try {
        const tokens = JSON.parse(import.meta.env.VITE_LOCAL_TEST_TOKENS ?? "{}");
        return Object.values(tokens)?.[0]?.address ?? "";
    } catch {
        return "";
    }
};

const token = () => metered(box.createWeb3Contract({ address: tokenAddress(), abi: TOKEN_READ_ABI }, readRpc()), "Token");

/** The token's name, symbol, decimals and supply; `fresh: true` skips the cache */
const readTokenView = async ({ fresh = false } = {}) => {
    const address = tokenAddress();
    if (!address) throw new Error("No token address for this network.");
    const raw = await cachedRead(`token:${address.toLowerCase()}`, async () => {
        const methods = token().methods;
        const [ name, symbol, decimals, totalSupply ] = await Promise.all([
            methods.name().call(),
            methods.symbol().call(),
            methods.decimals().call(),
            methods.totalSupply().call(),
        ]);
        return { name, symbol, decimals, totalSupply };
    }, { fresh, ttl: 60_000 });
    return toTokenView(raw);
};

/**
 * Everything the home page needs.
 *
 * @param {object} wallet  connected wallet or null (the landing page does not use it)
 * @returns {Promise<object>}
 */
export async function getHomeData(wallet) {
    const tokenView = await readTokenView();
    return { wallet, token: { ...tokenView, address: tokenAddress() } };
}

/** The token's page on the network's explorer, or null on the local chain */
export const explorerTokenUrl = () => {
    const explorer = NETWORK?.blockExplorers?.default?.url;
    const address = tokenAddress();
    return explorer && address && !IS_LOCAL ? `${explorer}/token/${address}` : null;
};
