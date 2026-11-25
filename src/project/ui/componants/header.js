/*
 * YOUR CODE (off-chain). Top bar: brand, section links, language menu and the Claim button.
 * Section links scroll with goTo() instead of #anchors, because #/name is the app's page router.
 */

import { settings } from "../../../engine/settings";
import { project } from "../../settings";
import { t, LANGUAGES, lang } from "../../lang";
import { icons } from "./icons";

const SECTIONS = [
    [ "ecosystem", "Ecosystem" ],
    [ "tokenomics", "Tokenomics" ],
    [ "security", "Security" ],
    [ "trade", "Trade" ],
    [ "contact", "Contact" ],
];

const navLink = ([ id, label ]) => /*html*/`
    <button type="button" onclick="goTo('${id}')" class="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-[#cfc9ff] transition hover:text-gold-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 rounded">
        ${t(label)}
    </button>
`;

const languageMenu = () => /*html*/`
    <details class="lang-menu relative">
        <summary class="flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-[#d6d0ff] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300" aria-label="${t("Language")}">
            ${icons.globe()}<span>${lang().short}</span>
        </summary>
        <div class="glass absolute right-0 z-40 mt-2 min-w-36 rounded-xl p-1.5">
            ${LANGUAGES.map((l) => /*html*/`
                <button type="button" onclick="setLanguage('${l.code}')" class="block w-full rounded-lg px-3 py-2 text-left text-sm ${l.code === lang().code ? "bg-white/10 text-gold-200" : "text-[#d6d0ff] hover:bg-white/5"}">${l.label}</button>
            `).join("")}
        </div>
    </details>
`;

const header = () => /*html*/`
    <header class="sticky top-0 z-30 border-b border-[#a096ff]/20 bg-[#080820]/60 backdrop-blur-xl">
        <div class="scroll-bar" aria-hidden="true"></div>
        <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <button type="button" onclick="goTo('top')" class="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300" aria-label="${settings.appName}">
                <img src="/brand.webp" alt="${settings.appName}" class="brand-glow h-10 w-auto sm:h-14" width="1000" height="250" />
            </button>
            <nav aria-label="${t("Main")}" class="order-3 flex w-full flex-wrap justify-center gap-x-6 gap-y-2 lg:order-none lg:w-auto">
                ${SECTIONS.map(navLink).join("")}
            </nav>
            <div class="flex items-center gap-2">
                ${languageMenu()}
                <a href="${project.claimUrl}" class="btn-gold-sm">${t("Claim tokens")}</a>
            </div>
        </div>
    </header>
`;

export { header };
