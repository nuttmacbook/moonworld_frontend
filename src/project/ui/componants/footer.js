/*
 * YOUR CODE (off-chain). Footer: brand, social icons (only the ones set in settings/.env) and the support email.
 */

import { settings } from "../../../engine/settings";
import { project } from "../../settings";
import { t } from "../../lang";
import { icons } from "./icons";

const SOCIALS = [
    [ "telegram", "Telegram" ],
    [ "facebook", "Facebook" ],
    [ "youtube", "YouTube" ],
];

const socialLinks = () => SOCIALS
    .filter(([ key ]) => project.socials?.[key])
    .map(([ key, label ]) => /*html*/`
        <a href="${project.socials[key]}" target="_blank" rel="noopener" aria-label="${label}" class="glass grid size-11 place-items-center rounded-xl text-[#d6d0ff] hover:text-gold-200">${icons[key]()}</a>
    `).join("");

// Built on each paint so the language can change
const footer = () => /*html*/`
    <footer class="relative z-[2] border-t border-[#a096ff]/20 bg-[#050516]/75">
        <div class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 text-sm text-[#a9a4d8] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
            <div class="flex flex-wrap items-center gap-4">
                <img src="/brand.webp" alt="${settings.appName}" class="h-10 w-auto" width="1000" height="250" loading="lazy" />
                <span>${t("Adventure continues beyond the Moon World · Built on BNB Chain")}</span>
            </div>
            <div class="flex gap-2.5">${socialLinks()}</div>
            <span>© ${new Date().getUTCFullYear()} ${settings.appName} · <a href="mailto:${project.supportEmail}" class="text-gold-300 hover:text-gold-100">${project.supportEmail}</a></span>
        </div>
    </footer>
`;

export { footer };
