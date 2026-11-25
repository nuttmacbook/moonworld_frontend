/*
 * YOUR CODE (off-chain). The landing page. Each section is a small function that returns HTML.
 * `data` comes from getHomeData() in src/project/chain: the token's name, symbol, decimals and supply
 * are read on chain; links, tokenomics and liquidity facts come from settings/.env (src/project/settings.js).
 * Motion (tilt, count-up, parallax) is CSS + componants/effects.js, so this file only draws.
 */

import { escapeHtml as escape } from "../../../engine/ui/helpers";
import { project } from "../../settings";
import { t, lang } from "../../lang";
import { icons } from "../componants/icons";
import { planet } from "../componants/planet";
import { poly, hex, grid } from "../componants/decor";
import { miniStars } from "../componants/ambient";
import { explorerTokenUrl } from "../../chain";

/* ------------------------------------ small helpers */

const fmt = (value, decimals = 0) => Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const decimalsOf = (value) => (Number.isInteger(Number(value)) ? 0 : 1);

/** A number that counts up when it scrolls into view (final value is in the HTML for no-JS / screen readers) */
const counter = (value, { prefix = "", suffix = "" } = {}) => {
    const d = decimalsOf(value);
    return /*html*/`<span data-count="${value}" data-decimals="${d}" data-prefix="${prefix}" data-suffix="${suffix}" class="tabular-nums">${prefix}${fmt(value, d)}${suffix}</span>`;
};

/** A date setting (YYYY-MM-DD) shown in UTC, in the current language */
const utcDate = (text) => {
    const date = new Date(`${text}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return text;
    return `${date.toLocaleDateString(lang().locale, { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" })} UTC`;
};

const eyebrow = (text) => /*html*/`<p ${rv(0)} class="eyebrow">${icons.sparkle()}${text}</p>`;

/** Supply as a whole-token number (the token's decimals come from the contract) */
const wholeSupply = (token) => {
    const decimals = BigInt(Math.max(0, Number(token?.decimals ?? 0)));
    return Number((token?.totalSupply ?? 0n) / 10n ** decimals);
};

/** Cumulative unlock: TGE, then monthly, as 7 bars from TGE to fully unlocked */
const vestingBars = () => {
    const tge = project.tgeUnlockPercent;
    const monthly = project.monthlyUnlockPercent;
    const months = monthly > 0 ? Math.ceil((100 - tge) / monthly) : 0;
    const marks = [ 0, 1, 2, 3, 4, 5, 6 ].map((i) => Math.round((months * i) / 6));
    return { months, bars: marks.map((m, i) => ({ label: i === 0 ? "TGE" : `M${m}`, pct: Math.min(100, tge + monthly * m), isFirst: i === 0 })) };
};

/** Scroll reveal: a stable id per render order + a stagger delay (componants/effects.js adds .in once seen) */
let revealCount = 0;
const rv = (delay = 0) => `data-reveal="r${++revealCount}" style="--d:${delay}ms"`;

/* ------------------------------------ sections */

const hero = (token, supply) => /*html*/`
    <section id="top" class="relative z-[2]">
        <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-8 px-4 pb-36 pt-12 sm:px-6 sm:pt-16">
            <div class="hero-copy flex min-w-0 flex-[999_1_520px] flex-col gap-6">
                <p ${rv(0)} class="glass-green inline-flex items-center gap-2.5 self-start rounded-full px-4 py-2 text-sm text-[#c9f7dc]">
                    <span class="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#4ade80]"></span>
                    ${t("{symbol} is live on {dex} · Claim is open", { symbol: token ? escape(token.symbol) : "MWLD", dex: escape(project.dexName) })}
                </p>
                <h1 ${rv(120)} class="font-display text-4xl font-black uppercase leading-[1.08] [text-shadow:0_0_40px_rgb(124_58_237/0.6)] sm:text-6xl">
                    ${t("The token that fuels a")} <span class="gold-text">${t("GameFi universe")}</span>
                </h1>
                <p ${rv(240)} class="max-w-xl text-lg text-[#c4c0ee] sm:text-xl">${t("Moon World is an NFT gaming world with its own native token — gas for every transaction, the bridge between BNB Chain and the Moon World Private Chain, and the currency of a built-in DeFi economy.")}</p>
                <div ${rv(360)} class="flex flex-wrap gap-3.5">
                    <a href="${project.swapUrl}" target="_blank" rel="noopener" class="btn-gold">${t("Buy {symbol}", { symbol: token ? escape(token.symbol) : "" })}${icons.arrow()}</a>
                    <a href="${project.claimUrl}" class="btn-ghost">${t("Claim tokens")}</a>
                </div>
            </div>

            <!-- 3D scene: planet, ring, mascot, coin, chips at different depths -->
            <div class="flex min-w-0 flex-[1_1_420px] justify-center [perspective:1100px]">
                <div class="scroll-push relative aspect-square w-[540px] max-w-full"><div class="tilt-hero relative size-full">
                    <div class="absolute left-[12%] top-[10%] size-[76%] [transform:translateZ(-120px)]">${planet("gas", { spin: 60 })}</div>
                    <div class="absolute -left-[2%] top-[38%] h-[26%] w-[104%] [transform:translateZ(-40px)_rotateX(74deg)_rotateZ(-14deg)]">
                        <div class="orbit-ring spin-slow"><span class="orbit-dot"></span></div>
                    </div>
                    <img src="/mascot.webp" alt="${t("Moon World knight mascot")}" class="float mascot-shadow absolute left-[10%] top-[6%] size-[80%] object-contain" width="800" height="800" />
                    <div class="absolute -right-[2%] bottom-[6%] size-[24%] [transform:translateZ(90px)]"><div class="coin-halo"></div><img src="/coin.webp" alt="" class="float relative size-full [animation-delay:-2s]" width="400" height="400" /></div>
                    <div class="chip absolute left-0 sm:-left-[4%] top-[14%] [transform:translateZ(70px)]"><span>${t("Ticker")}</span><b class="text-gold-300">${token ? `$${escape(token.symbol)}` : "…"}</b></div>
                    <div class="chip absolute left-[2%] bottom-[10%] [transform:translateZ(110px)]"><span>${t("Supply")}</span><b>${token ? counter(supply) : "…"}</b></div>
                </div></div>
            </div>
        </div>
        <div class="grid-floor" aria-hidden="true"><div></div></div>
    </section>
`;

const strip = (token) => {
    const items = [
        t("Built on BNB Chain"), t("Live on {dex}", { dex: escape(project.dexName) }), t("Ownership renounced"),
        t("LP locked"), t("0% tax"),
    ];
    return /*html*/`
        <div class="relative z-[2] border-y border-gold-300/35 bg-[#06051a]/90 shadow-[0_0_40px_rgb(255_196_64/0.12)]">
            <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-4 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-100 sm:justify-between sm:px-6 sm:text-xs">
                ${items.map((x) => `<span>${x}</span>`).join(`<span class="text-[#8f7dff]">${icons.sparkle("size-3")}</span>`)}
            </div>
        </div>
    `;
};

const ecoCard = ({ visual, tone, step, title, text }, i = 0) => /*html*/`
    <div class="lift" ${rv(i * 140)}><div class="lift-in glass glow flex flex-col overflow-hidden rounded-3xl" style="background-image: linear-gradient(180deg, ${tone}, rgb(5 5 16 / .96))">
        <div class="relative isolate flex h-56 items-center justify-center overflow-hidden">${visual}</div>
        <div class="flex flex-col gap-2 px-7 pb-8 pt-2">
            <p class="font-display text-xs font-bold tracking-[0.18em] text-gold-300">${step}</p>
            <h3 class="font-display text-xl font-bold uppercase">${title}</h3>
            <p class="text-[15px] text-[#c4c0ee]">${text}</p>
        </div>
    </div></div>
`;

const ecosystem = () => /*html*/`
    <section id="ecosystem" data-depth class="relative z-[2] mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-14 pt-24 sm:px-6">
        <div class="flex flex-wrap items-end justify-between gap-6">
            <div class="flex flex-[1_1_480px] flex-col gap-3">
                ${eyebrow(t("The ecosystem"))}
                <h2 ${rv(80)} class="section-title">${t("Play. Battle.")}<br />${t("Prosper.")}</h2>
            </div>
            <p class="flex-[1_1_400px] text-[17px] text-[#c4c0ee]">${t("Not just another NFT game. Moon World combines gameplay, its own blockchain infrastructure and DeFi into one economy — where every action carries real value.")}</p>
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            ${ecoCard({
                tone: "rgb(22 18 64 / .95)",
                visual: /*html*/`${miniStars(5)}<div class="absolute -right-9 -top-9 size-32 opacity-90">${planet("pink", { hasRing: true, spin: 45 })}</div>
                    <img src="/mascot.webp" alt="" class="float relative size-52 object-contain drop-shadow-[0_20px_24px_rgb(0_0_0/0.55)]" width="800" height="800" loading="lazy" />`,
                step: "01 · PLAY", title: t("NFT gameplay"), text: t("Collect heroes, battle and earn blockchain rewards in a game where what you own is really yours."),
            })}
            ${ecoCard({
                tone: "rgb(12 24 64 / .95)",
                visual: /*html*/`${hex("hexEco", { color: "rgb(125 211 252 / .35)", mask: "radial-gradient(circle at 50% 50%, #000 20%, transparent 75%)" })}
                    <div class="size-36">${planet("ocean", { spin: 36 })}</div>
                    <div class="orbit-dashed spin-slow absolute size-56"><span class="orbit-dot-sm"></span></div>`,
                step: "02 · BUILD", title: t("Its own chain"), text: t("The Moon World Private Chain, connected to BNB Chain for a true cross-chain experience."),
            }, 1)}
            ${ecoCard({
                tone: "rgb(48 16 54 / .95)",
                visual: /*html*/`${poly("inset-0 size-full", { tone: "gold", fade: "to bottom" })}${poly("inset-0 size-full", { tone: "gold", flip: true, fade: "to top" })}
                    <img src="/coin.webp" alt="" class="float coin-glow size-40 [animation-delay:-3s]" width="400" height="400" loading="lazy" />`,
                step: "03 · PROSPER", title: t("DeFi in the game"), text: t("A built-in swap plus farming and yield tools — trade and earn without leaving Moon World."),
            }, 2)}
        </div>
    </section>
`;

const tick = (text) => /*html*/`
    <li class="flex items-center gap-3"><span class="grid size-7 shrink-0 place-items-center rounded-lg border border-emerald-300/50 bg-emerald-300/15 text-emerald-300">${icons.check()}</span><span>${text}</span></li>
`;

const utility = (token) => {
    const symbol = token ? escape(token.symbol) : "MWLD";
    return /*html*/`
        <section id="utility" data-depth class="relative z-[2] mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <div ${rv(0)} class="glass-gold glow relative isolate flex flex-wrap items-center gap-12 overflow-hidden rounded-[2rem] p-7 sm:p-12">
                ${grid({ at: "0% 100%", size: 36, reach: 60 })}
                ${poly("right-0 top-0 h-full w-2/3")}
                <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-4">
                    ${eyebrow(t("Token utility"))}
                    <h2 class="font-display text-3xl font-black uppercase leading-tight sm:text-4xl">${t("More than an in-game currency")}</h2>
                    <p class="text-[#c4c0ee]">${t("{symbol} powers the entire ecosystem. It pays gas fees alongside BNB, moves value between chains and drives every swap, farm and reward.", { symbol })}</p>
                    <ul class="mt-1 flex flex-col gap-3">
                        ${tick(t("Gas fees on the Moon World Private Chain, alongside BNB"))}
                        ${tick(t("In-game currency for play, battles and rewards"))}
                        ${tick(t("Swap, farming and yield inside the ecosystem"))}
                    </ul>
                </div>
                <div class="flex min-w-0 flex-[1_1_380px] flex-col items-center gap-6 [perspective:900px]">
                    <div class="tilt-coin relative size-52">
                        <div class="orbit-dashed spin-slow absolute -inset-5"></div>
                        <img src="/coin.webp" alt="${t("{symbol} token coin", { symbol })}" class="float coin-glow size-full" width="400" height="400" loading="lazy" />
                    </div>
                    <div class="flex w-full flex-wrap items-center justify-center gap-3.5">
                        <div class="chain-box border-gold-300/70"><p>${t("Public")}</p><b>BNB Chain</b><span>${t("Gas: BNB + {symbol}", { symbol })}</span></div>
                        <div class="flex flex-col items-center text-xs text-[#a9a4d8]"><span class="text-[#a99cff]">${icons.bridge()}</span>${t("bridge")}</div>
                        <div class="chain-box border-[#d6d0ff]/60"><p>${t("Native")}</p><b>Moon World Chain</b><span>${t("Gas: {symbol}", { symbol })}</span></div>
                    </div>
                </div>
            </div>
        </section>
    `;
};

const statCard = ({ label, value, note, tone = "" }, i = 0) => /*html*/`
    <div class="lift" ${rv(i * 110)}><div class="lift-in glass glow relative isolate overflow-hidden rounded-3xl p-6">
        ${grid({ size: 22 })}
        <p class="label">${label}</p>
        <p class="mt-1.5 truncate font-display text-[26px] font-black sm:text-3xl ${tone}">${value}</p>
        <p class="text-[13px] text-emerald-300">${note}</p>
    </div></div>
`;

const tokenomics = (token, supply) => {
    const symbol = token ? escape(token.symbol) : "";
    const presalePct = supply > 0 ? Math.min(100, (project.presaleAmount / supply) * 100) : 0;
    const pctShown = Math.round(presalePct * 10) / 10;
    const rest = Math.max(0, supply - project.presaleAmount);
    const { months, bars } = vestingBars();

    return /*html*/`
        <section id="tokenomics" data-depth class="relative z-[2] mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6">
            <div class="flex max-w-3xl flex-col gap-3">
                ${eyebrow(t("Tokenomics"))}
                <h2 ${rv(80)} class="section-title">${token ? t("{supply} {symbol}. Built for healthy circulation.", { supply: fmt(supply), symbol }) : t("Built for healthy circulation.")}</h2>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                ${statCard({ label: t("Total supply"), value: token ? counter(supply) : "…", note: symbol || "&nbsp;" })}
                ${statCard({ label: t("Presale allocation"), value: counter(project.presaleAmount), note: t("{pct}% of supply · sold out", { pct: fmt(pctShown, decimalsOf(pctShown)) }) }, 1)}
                ${statCard({ label: t("TGE unlock"), value: counter(project.tgeUnlockPercent, { suffix: "%" }), note: t("then {pct}% per month", { pct: project.monthlyUnlockPercent }), tone: "text-gold-300" }, 2)}
                ${statCard({ label: t("Raise to reward pool"), value: counter(project.rewardPoolPercent, { suffix: "%" }), note: t("Fuels player rewards") }, 3)}
            </div>
            <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <!-- Distribution -->
                <div ${rv(0)} class="glass glow relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl p-6 sm:p-8">
                    ${hex("hexDist")}
                    <h3 class="font-display text-lg font-bold tracking-wide">${t("Distribution")}</h3>
                    <div class="flex flex-wrap items-center gap-7">
                        <div class="donut" data-grow="${presalePct}" style="--p:${presalePct}">
                            <div class="donut-hole"><span class="font-display text-3xl font-black text-gold-100 [text-shadow:0_0_16px_rgb(255_196_64/0.6)]">${counter(pctShown, { suffix: "%" })}</span><span class="label">${t("Presale")}</span></div>
                        </div>
                        <div class="flex min-w-0 flex-[1_1_200px] flex-col gap-3 text-[15px]">
                            <div class="legend border-gold-300/35 bg-gold-300/10"><span class="flex items-center gap-2.5"><i class="swatch-gold"></i>${t("Presale")}</span><b>${counter(project.presaleAmount)}</b></div>
                            <div class="legend border-[#a99cff]/30 bg-[#7c6cff]/10 text-[#c4c0ee]"><span class="flex items-center gap-2.5"><i class="swatch-violet"></i>[${t("Remaining allocations — add breakdown")}]</span><b class="text-[#eeeaff]">${token ? counter(rest) : "…"} · ${fmt(100 - pctShown, decimalsOf(100 - pctShown))}%</b></div>
                        </div>
                    </div>
                    <div class="tube" role="img" aria-label="${t("{pct}% presale, the rest other allocations", { pct: fmt(pctShown, decimalsOf(pctShown)) })}">
                        <div class="tube-gold" data-grow="${presalePct}" style="--p:${presalePct}"><span class="shine"></span></div>
                        <div class="tube-violet" data-grow="${100 - presalePct}" style="--p:${100 - presalePct}"><span class="shine [animation-delay:1.2s]"></span></div>
                    </div>
                </div>
                <!-- Vesting -->
                <div ${rv(140)} class="glass glow relative isolate flex flex-col gap-3.5 overflow-hidden rounded-3xl p-6 sm:p-8">
                    ${poly("right-0 top-0 h-3/4 w-3/5", { fade: "to bottom left" })}
                    <h3 class="font-display text-lg font-bold tracking-wide">${t("Vesting")}</h3>
                    <div class="bars" role="img" aria-label="${t("Cumulative unlock: {tge}% at TGE rising to 100% by month {months}", { tge: project.tgeUnlockPercent, months })}">
                        ${bars.map((b, i) => /*html*/`
                            <div class="bar ${b.isFirst ? "bar-gold" : ""}" data-grow="${b.pct}" style="--p:${b.pct}">
                                <span class="bar-label">${counter(b.pct, { suffix: "%" })}</span>
                                <div class="bar-glass"><span class="bar-gloss"></span><span class="shine" style="animation-delay:${(i * 0.25).toFixed(2)}s"></span></div>
                            </div>
                        `).join("")}
                    </div>
                    <div class="flex gap-3 px-1.5 font-display text-[11px] font-semibold text-[#a9a4d8]">${bars.map((b) => `<span class="flex-1 text-center">${b.label}</span>`).join("")}</div>
                    <p class="text-[15px] text-[#c4c0ee]">${t("{tge}% unlocked at TGE, then {monthly}% of supply per month, claimable in real time.", { tge: project.tgeUnlockPercent, monthly: project.monthlyUnlockPercent })}</p>
                </div>
            </div>
        </section>
    `;
};

const CHECKS = [
    [ "Ownership renounced", "Owner is the zero address — no admin control." ],
    [ "Contract verified", "Source code is open and verified." ],
    [ "0% buy / sell tax", "No hidden fees on trades." ],
    [ "Not a honeypot", "Buying and selling work freely." ],
    [ "No mint function", "Supply is fixed." ],
    [ "Not a proxy", "Code cannot be swapped out." ],
    [ "No blacklist or pause", "Transfers can't be frozen." ],
    [ "No hidden owner", "No way to take back ownership." ],
];

const security = (token, explorerUrl) => {
    const lpTotal = Math.min(100, project.lpLockedPercent + project.lpBurnedPercent);
    const address = token?.address || project.tokenAddress;
    return /*html*/`
        <section id="security" data-depth class="relative z-[2] mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-14 sm:px-6">
            <div class="flex flex-wrap items-end justify-between gap-4">
                <div class="flex max-w-3xl flex-col gap-3">
                    ${eyebrow(t("Token security"))}
                    <h2 ${rv(80)} class="section-title">${t("Scanned. Verified.")} <span class="text-emerald-300 [text-shadow:0_0_24px_rgb(110_231_160/0.5)]">${t("All green.")}</span></h2>
                    <p class="text-[#c4c0ee]">${t("Independent contract scan by GoPlus Security. Check the live report any time.")}</p>
                </div>
                <a href="${project.securityReportUrl}" target="_blank" rel="noopener" class="btn-outline border-emerald-300/55 bg-emerald-900/30 text-emerald-300">${t("View live report")}${icons.external()}</a>
            </div>

            <!-- Token address -->
            <div ${rv(0)} class="glass-gold glow relative isolate flex flex-wrap items-center gap-5 overflow-hidden rounded-3xl p-6 sm:p-7">
                ${hex("hexTok", { color: "rgb(255 214 110 / .28)", mask: "linear-gradient(to right, #000, transparent 55%)", size: 36 })}
                <img src="/coin.webp" alt="" class="coin-glow size-18 shrink-0" width="400" height="400" loading="lazy" />
                <div class="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
                    <div class="flex flex-wrap items-center gap-2.5"><h3 class="font-display text-lg font-bold uppercase">${token ? `${escape(token.name)} · $${escape(token.symbol)}` : "…"}</h3><span class="pill border-gold-300/50 bg-gold-300/15 text-gold-300">BEP-20</span></div>
                    <p class="text-sm text-[#a9a4d8]">${t("Official token contract on BNB Chain")}</p>
                </div>
                <code data-token-address class="min-w-0 flex-[999_1_380px] overflow-x-auto whitespace-nowrap rounded-xl border border-gold-300/30 bg-[#040414]/70 px-4 py-3 font-mono text-[15px] text-gold-50">${escape(address)}</code>
                <div class="flex gap-2">
                    <button type="button" onclick="copyTokenAddress()" data-copy-label class="btn-outline border-[#a99cff]/45 bg-[#28227a]/60 text-[#eeeaff]">${t("Copy")}</button>
                    ${explorerUrl ? /*html*/`<a href="${explorerUrl}" target="_blank" rel="noopener" class="btn-outline border-gold-300/50 text-gold-300">BscScan${icons.external()}</a>` : ""}
                </div>
            </div>

            <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <!-- Liquidity ring -->
                <div ${rv(0)} class="glass-green glow relative isolate flex flex-col items-center gap-5 overflow-hidden rounded-3xl p-7">
                    ${grid({ at: "50% 40%", size: 26, color: "110 231 160", reach: 70 })}
                    <div class="scan-line" aria-hidden="true"></div>
                    <p class="font-display text-xs font-bold tracking-[0.2em] text-emerald-300">${t("Liquidity")}</p>
                    <div class="lp-ring" data-grow="${lpTotal}" style="--p:${lpTotal}">
                        <div class="lp-hole"><span class="font-display text-3xl font-black text-emerald-100 [text-shadow:0_0_16px_rgb(110_231_160/0.7)]">${counter(lpTotal, { suffix: "%" })}</span><span class="label text-emerald-200/80">${t("Locked / burned")}</span></div>
                    </div>
                    <dl class="flex w-full flex-col gap-1.5 text-sm">
                        <div class="flex justify-between gap-3"><dt class="text-[#c4c0ee]">${t("Locked on {locker}", { locker: escape(project.lpLocker) })}</dt><dd class="text-right font-semibold">≈${project.lpLockedPercent}% · ${t("until {date}", { date: utcDate(project.lpLockedUntil) })}</dd></div>
                        <div class="flex justify-between gap-3"><dt class="text-[#c4c0ee]">${t("Burned (dead address)")}</dt><dd class="font-semibold">≈${project.lpBurnedPercent}%</dd></div>
                        <div class="flex justify-between gap-3"><dt class="text-[#c4c0ee]">${t("Pool")}</dt><dd class="font-semibold">${escape(project.dexName)}</dd></div>
                    </dl>
                </div>
                <!-- Checks -->
                <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:col-span-2">
                    ${CHECKS.map(([ title, text ], i) => /*html*/`
                        <div ${rv(80 + i * 70)} class="glass glow relative isolate flex items-start gap-3.5 overflow-hidden rounded-2xl border-emerald-300/30 p-4.5">
                            <div class="absolute -right-8 -top-8 -z-10 size-24 rounded-full bg-[radial-gradient(circle,rgb(110_231_160/0.22),transparent_70%)]"></div>
                            <span class="glass-icon border-emerald-300/70 text-emerald-100">${icons.shield()}</span>
                            <div class="flex min-w-0 flex-col gap-0.5"><h3 class="font-display text-[13px] font-bold uppercase tracking-wide">${t(title)}</h3><p class="text-sm text-[#a9a4d8]">${t(text)}</p></div>
                        </div>
                    `).join("")}
                </div>
            </div>
            <p class="text-[13px] text-[#8f8abf]">${t("Scan results from GoPlus Security, {date}. Security scans are informational and not a guarantee — always do your own research.", { date: utcDate(project.securityScanDate) })}</p>
        </section>
    `;
};

const claim = (token) => {
    const steps = [
        [ "Open the claim page", "Go to {url} — always check the address bar.", { url: escape(project.claimUrl.replace(/^https?:\/\//, "")) } ],
        [ "Connect your wallet", "Use the same BNB Chain wallet you bought with.", {} ],
        [ "Claim unlocked tokens", "{tge}% at TGE, then {monthly}% per month — claim any time.", { tge: project.tgeUnlockPercent, monthly: project.monthlyUnlockPercent } ],
        [ "Add {symbol} to your wallet", "Import the token address above to see your balance.", {} ],
    ];
    const symbol = token ? escape(token.symbol) : "";
    return /*html*/`
        <section id="claim" data-depth class="relative z-[2] mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6">
            <div class="flex flex-wrap items-end justify-between gap-4">
                <div class="flex flex-col gap-3">${eyebrow(t("For presale buyers"))}<h2 ${rv(80)} class="section-title">${t("Claim in four steps")}</h2></div>
                <a href="${project.claimUrl}" class="inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-gold-300 hover:text-gold-100">${escape(project.claimUrl.replace(/^https?:\/\//, ""))}${icons.arrow()}</a>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                ${steps.map(([ title, text, vars ], i) => /*html*/`
                    <div class="lift" ${rv(i * 120)}><div class="lift-in glass glow relative isolate flex flex-col gap-2.5 overflow-hidden rounded-3xl p-6 ${i === 0 ? "border-gold-300/45" : ""}">
                        ${poly("right-0 top-0 h-2/3 w-2/3", { fade: "to bottom left" })}
                        <span class="glass-icon font-display text-lg font-black ${i === 0 ? "border-gold-100/90 text-gold-50 shadow-[0_0_20px_rgb(255_196_64/0.45)]" : "border-[#d6d0ff]/60"}">${i + 1}</span>
                        <h3 class="font-display text-[15px] font-bold uppercase">${t(title, { symbol })}</h3>
                        <p class="text-[15px] text-[#c4c0ee]">${t(text, vars)}</p>
                    </div></div>
                `).join("")}
            </div>
        </section>
    `;
};

const trade = (token, explorerUrl) => {
    const symbol = token ? escape(token.symbol) : "";
    const venues = [
        { icon: icons.swap(), name: escape(project.dexName), text: t("Swap BNB or USDT for {symbol}.", { symbol }), cta: t("Buy {symbol}", { symbol }), url: project.swapUrl, accent: "text-gold-300 border-gold-300", tint: "rgb(48 34 8 / .95)", kind: "gold", hasRing: true },
        { icon: icons.radar(), name: "DexScreener", text: t("Live price chart, volume and liquidity for the {symbol} pair.", { symbol }), cta: t("Open chart"), url: project.chartUrl, accent: "text-sky-300 border-sky-300", tint: "rgb(8 26 50 / .95)", kind: "ice", hasRing: false },
        { icon: icons.scope(), name: "BscScan", text: t("Holders, transfers and the verified contract source."), cta: t("View on BscScan"), url: explorerUrl, accent: "text-[#d6d0ff] border-[#d6d0ff]", tint: "rgb(24 16 60 / .95)", kind: "gas", hasRing: false },
    ].filter((v) => v.url);
    return /*html*/`
        <section id="trade" data-depth class="relative z-[2] mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6">
            <div class="flex flex-col gap-3">${eyebrow(t("Get {symbol}", { symbol: symbol ? `$${symbol}` : "" }))}<h2 ${rv(80)} class="section-title">${t("Trade & track")}</h2></div>
            <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                ${venues.map((v, i) => /*html*/`
                    <div class="lift" ${rv(i * 140)}><div class="lift-in glass glow relative isolate flex flex-col gap-3.5 overflow-hidden rounded-3xl p-7" style="background-image: linear-gradient(180deg, ${v.tint}, rgb(5 5 16 / .96))">
                        ${miniStars(20 + i)}
                        <div class="absolute -bottom-14 -right-14 -z-10 size-40 opacity-80">${planet(v.kind, { hasRing: v.hasRing, spin: 50 })}</div>
                        <span class="glass-icon size-13 ${v.accent.split(" ")[0]}">${v.icon}</span>
                        <h3 class="relative z-[2] font-display text-xl font-bold uppercase">${v.name}</h3>
                        <p class="relative z-[2] max-w-[85%] text-[15px] text-[#c4c0ee]">${v.text}</p>
                        <a href="${v.url}" target="_blank" rel="noopener" class="btn-outline relative z-[2] mt-1 self-start bg-[#05051a]/70 ${v.accent}">${v.cta}${icons.external()}</a>
                    </div></div>
                `).join("")}
            </div>
        </section>
    `;
};

const contact = () => /*html*/`
    <section id="contact" data-depth class="relative z-[2] mx-auto w-full max-w-6xl px-4 pb-28 pt-14 sm:px-6">
        <div ${rv(0)} class="contact-card glow relative isolate flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-[2.25rem] p-7 sm:p-14">
            ${poly("bottom-0 left-0 h-full w-1/2", { tone: "gold", flip: true, fade: "to right" })}
            ${miniStars(31)}
            <div class="flex min-w-0 flex-[1_1_440px] flex-col gap-3.5">
                ${eyebrow(t("Contact us"))}
                <h2 class="font-display text-3xl font-black uppercase leading-tight sm:text-4xl">${t("Questions about your claim or the project?")}</h2>
                <p class="text-[17px] text-[#d6d0ff]">${t("Email our team and we'll get back to you.")}</p>
                <div class="mt-2 flex flex-wrap gap-3">
                    <a href="mailto:${project.supportEmail}" class="btn-gold normal-case">${icons.mail()}${escape(project.supportEmail)}</a>
                    <a href="${project.claimUrl}" class="btn-ghost">${t("Claim page")}${icons.arrow()}</a>
                </div>
            </div>
            <div class="flex flex-[0_1_300px] justify-center"><img src="/mascot.webp" alt="" class="float size-72 object-contain drop-shadow-[0_24px_30px_rgb(0_0_0/0.6)]" width="800" height="800" loading="lazy" /></div>
        </div>
    </section>
`;

/** Planets drifting beside the content; each moves with the mouse by its own depth */
const driftingPlanets = () => /*html*/`
    <div class="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden md:block" aria-hidden="true">
        <div class="drift drift-1 -left-16 top-[21%] size-56">${planet("moon", { spin: 90 })}</div>
        <div class="drift drift-2 -right-24 top-[44%] size-64">${planet("gold", { hasRing: true, spin: 70 })}</div>
    </div>
`;

/* ------------------------------------ page */

/**
 * The whole landing page.
 *
 * @param {object|null} data  getHomeData() result, or null while loading / after an error
 * @param {object} options    { notice } html shown above the hero (e.g. the network did not answer)
 */
const home = (data, { notice = "" } = {}) => {
    revealCount = 0;
    const token = data?.token?.symbol ? data.token : null;
    const supply = token ? wholeSupply(token) : 0;
    const explorerUrl = explorerTokenUrl();
    return /*html*/`
        <main class="relative overflow-x-clip">
            ${driftingPlanets()}
            ${notice}
            ${hero(token, supply)}
            ${strip(token)}
            ${ecosystem()}
            ${utility(token)}
            ${tokenomics(token, supply)}
            ${security(token, explorerUrl)}
            ${claim(token)}
            ${trade(token, explorerUrl)}
            ${contact()}
        </main>
    `;
};

/** While loading: the same page, token numbers shown as "…" */
const homeLoading = () => home(null);

/** When the token could not be read: the page still shows, with a small note */
const homeError = (message) => home(null, {
    notice: /*html*/`
        <div class="relative z-[3] mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6" role="alert">
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <span>${t("Live token data could not load.")} ${escape(message)}</span>
                <button type="button" onclick="refreshPage()" class="rounded-lg bg-white/10 px-3 py-2 text-[13px] font-semibold hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">${t("Try again")}</button>
            </div>
        </div>
    `,
});

export { home, homeLoading, homeError };
