/*
 * YOUR CODE (off-chain). This project's own values from settings/.env (the engine reads the common ones).
 * No fallback values: a missing or malformed value is added to the engine's problem list,
 * so the page shows "Setup is not finished" instead of guessing.
 */

import { addProblem } from "../engine/settings";

const env = import.meta.env;
const text = (key) => String(env[key] ?? "").trim();
const number = (key) => Number(text(key));

const project = {
    description: text("VITE_APP_DESCRIPTION"),
    maintenance: text("VITE_MAINTENANCE"),
    maintenanceMessage: text("VITE_MAINTENANCE_MESSAGE"),
    maintenanceBypass: text("VITE_MAINTENANCE_BYPASS"),

    tokenAddress: text("VITE_TOKEN_ADDRESS"),

    claimUrl: text("VITE_CLAIM_URL"),
    swapUrl: text("VITE_SWAP_URL"),
    chartUrl: text("VITE_CHART_URL"),
    securityReportUrl: text("VITE_SECURITY_REPORT_URL"),
    supportEmail: text("VITE_SUPPORT_EMAIL"),
    socials: {
        telegram: text("VITE_TELEGRAM_URL"),
        facebook: text("VITE_FACEBOOK_URL"),
        youtube: text("VITE_YOUTUBE_URL"),
    },

    presaleAmount: number("VITE_PRESALE_AMOUNT"),
    tgeUnlockPercent: number("VITE_TGE_UNLOCK_PERCENT"),
    monthlyUnlockPercent: number("VITE_MONTHLY_UNLOCK_PERCENT"),
    rewardPoolPercent: number("VITE_REWARD_POOL_PERCENT"),

    dexName: text("VITE_DEX_NAME"),
    lpLocker: text("VITE_LP_LOCKER"),
    lpLockedPercent: number("VITE_LP_LOCKED_PERCENT"),
    lpBurnedPercent: number("VITE_LP_BURNED_PERCENT"),
    lpLockedUntil: text("VITE_LP_LOCKED_UNTIL"),
    securityScanDate: text("VITE_SECURITY_SCAN_DATE"),
};

/* ------------------------------------ checks */

const required = [
    "VITE_APP_DESCRIPTION", "VITE_SITE_URL", "VITE_TOKEN_ADDRESS", "VITE_CLAIM_URL", "VITE_SWAP_URL", "VITE_CHART_URL",
    "VITE_SECURITY_REPORT_URL", "VITE_SUPPORT_EMAIL", "VITE_DEX_NAME", "VITE_LP_LOCKER",
];
required.filter((key) => !text(key)).forEach((key) => addProblem(`${key} is not set in settings/.env.`));

// Percent and amount values must be real numbers (0 is allowed, empty is not)
const numbers = [
    "VITE_PRESALE_AMOUNT", "VITE_TGE_UNLOCK_PERCENT", "VITE_MONTHLY_UNLOCK_PERCENT", "VITE_REWARD_POOL_PERCENT",
    "VITE_LP_LOCKED_PERCENT", "VITE_LP_BURNED_PERCENT",
];
numbers.filter((key) => !text(key) || !Number.isFinite(number(key)) || number(key) < 0)
    .forEach((key) => addProblem(`${key} in settings/.env must be a number of 0 or more.`));

if (!/^0x[0-9a-fA-F]{40}$/.test(project.tokenAddress) && project.tokenAddress) addProblem("VITE_TOKEN_ADDRESS in settings/.env is not an address.");
if (project.monthlyUnlockPercent <= 0 && text("VITE_MONTHLY_UNLOCK_PERCENT")) addProblem("VITE_MONTHLY_UNLOCK_PERCENT in settings/.env must be more than 0.");
if (project.tgeUnlockPercent > 100) addProblem("VITE_TGE_UNLOCK_PERCENT in settings/.env cannot be more than 100.");
if (project.lpLockedPercent + project.lpBurnedPercent > 100) addProblem("VITE_LP_LOCKED_PERCENT + VITE_LP_BURNED_PERCENT in settings/.env cannot be more than 100.");
[ "VITE_LP_LOCKED_UNTIL", "VITE_SECURITY_SCAN_DATE" ]
    .filter((key) => !/^\d{4}-\d{2}-\d{2}$/.test(text(key)))
    .forEach((key) => addProblem(`${key} in settings/.env must be a date like 2027-06-05.`));
if (![ "on", "off" ].includes(project.maintenance)) addProblem("VITE_MAINTENANCE in settings/.env must be on or off.");

export { project };
