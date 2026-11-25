/*
 * YOUR CODE (off-chain). The website in one place:
 *   1. which pages exist
 *   2. what each button does
 * Blockchain work comes from src/project/chain (imported, never written here).
 * Drawing and loading are handled by src/engine/ui/app.js. Settings live in settings/.env.
 */

import "./main.css";
import { startApp } from "../../engine/ui/app";
import { getHomeData } from "../chain";
import { setLang, t } from "../lang";
import { header } from "./componants/header";
import { footer } from "./componants/footer";
import { notify } from "./componants/toast";
import { mountAmbient } from "./componants/ambient";
import { mountEffects } from "./componants/effects";
import { isMaintenance, showMaintenance } from "./componants/maintenance";
import { home, homeLoading, homeError } from "./pages/home";

/* ------------------------------------ 1. pages (the first one opens by default; others at #/name) */

// The engine joins `loading` and `footer` as plain text. Objects with toString() do not survive the production build
// (the minifier turned `{ toString: footer }` into `{}` → "[object Object]"), so pass strings and draw the footer in its own box.
const pages = {
    home: { load: getHomeData, view: home, loading: homeLoading(), error: homeError },
};

mountAmbient();
const isClosed = isMaintenance();
if (isClosed) showMaintenance();
/** The footer lives right after #app (not inside it), so a language change can redraw it on its own */
const drawFooter = () => {
    let box = document.getElementById("site-footer");
    if (!box) {
        box = document.createElement("div");
        box.id = "site-footer";
        document.getElementById("app")?.after(box);
    }
    box.innerHTML = footer();
};

drawFooter();
const app = isClosed ? null : startApp({ pages, header, footer: "", notify });
if (app) mountEffects();

/* ------------------------------------ 2. buttons (called from onclick="..." in the pages) */

window.refreshPage = () => app?.refresh({ fresh: true });

/** Scrolls to a section; the URL keeps #/ because the hash is the page router */
window.goTo = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const isCalm = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    target.scrollIntoView({ behavior: isCalm ? "auto" : "smooth", block: "start" });
};

window.setLanguage = (code) => {
    setLang(code);
    drawFooter();
    document.querySelectorAll("details.lang-menu").forEach((el) => el.removeAttribute("open"));
    if (app) app.refresh({ quiet: true });
    else showMaintenance();
};

window.copyTokenAddress = async () => {
    try {
        const address = document.querySelector("[data-token-address]")?.textContent?.trim() ?? "";
        await navigator.clipboard.writeText(address);
        document.querySelectorAll("[data-copy-label]").forEach((el) => { el.textContent = t("Copied"); });
    } catch (err) {
        console.error(err);
        notify.error(new Error(t("Copy did not work. Select the address and copy it by hand.")));
    }
};

// Close the language menu when clicking anywhere else
document.addEventListener("click", (e) => {
    document.querySelectorAll("details.lang-menu[open]").forEach((menu) => {
        if (!menu.contains(e.target)) menu.removeAttribute("open");
    });
});
