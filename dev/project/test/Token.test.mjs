/*
 * YOUR CODE (on-chain tests). The landing page reads name(), symbol(), decimals() and totalSupply()
 * from the token; these tests check that the local stand-in answers them the way the page expects.
 */

import { ethers } from "ethers";
import { seed, sampleAmount, firstToken } from "../seed.mjs";

export default async function (t) {
    const { deployed, check } = t;
    const token = firstToken(deployed);
    check("a test token is deployed", Boolean(token?.address));
    if (!token) return;

    const contract = token.contract;
    check("name() answers", (await contract.name()).length > 0);
    check("symbol() answers", (await contract.symbol()).length > 0);
    check("decimals() = test-tokens.json", Number(await contract.decimals()) === token.decimals, `${token.decimals}`);

    const before = await contract.totalSupply();
    const count = 5;
    await seed({ deployed, count });
    const expected = Array.from({ length: count }, (_, i) => ethers.parseUnits(sampleAmount(i + 1), token.decimals)).reduce((a, b) => a + b, 0n);
    const after = await contract.totalSupply();
    check("totalSupply() grows by what was minted", after - before === expected, ethers.formatUnits(after - before, token.decimals));
}
