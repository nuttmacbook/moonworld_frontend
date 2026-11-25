/*
 * YOUR CODE (on-chain). Turns what the token contract returns into a plain object for the page.
 * Every field has a safe empty value, so a missing answer never breaks the page.
 */

const big = (value) => {
    try { return BigInt(value ?? 0); } catch { return 0n; }
};

/** name(), symbol(), decimals(), totalSupply() of an ERC20 → what the home page uses */
const toTokenView = (v) => ({
    name: String(v?.name ?? ""),
    symbol: String(v?.symbol ?? ""),
    decimals: Number(v?.decimals ?? 0),
    totalSupply: big(v?.totalSupply),
});

export { toTokenView };
