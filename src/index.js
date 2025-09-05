// src/index.ts
import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { loadZip, readManifestJson, readDeclarativeAgentJson } from "./parsers.js";
import { writeArtifacts } from "./artifacts.js";
import { createBot } from "./dataverse.js";
const argv = yargs(hideBin(process.argv))
    .scriptName("m3652cs")
    .usage("$0 -i <m365_agent_zip> -o <out_dir> [--provision]")
    .option("input", {
    alias: "i",
    type: "string",
    demandOption: true,
    describe: "Path to Microsoft 365/Teams app package zip (manifest.json + declarativeAgent_*.json)"
})
    .option("out", {
    alias: "o",
    type: "string",
    demandOption: true,
    describe: "Output directory for Copilot Studio artifacts"
})
    .option("provision", {
    type: "boolean",
    default: false,
    describe: "Create a new Copilot (bot) in Dataverse with name/description (requires .env)"
})
    .strict()
    .parseSync();
// 2) Narrow unknowns -> strings using a type predicate
function assertString(val, name) {
    if (typeof val !== "string" || val.trim() === "") {
        throw new Error(`${name} must be a non-empty string`);
    }
}
assertString(argv.input, "--input");
assertString(argv.out, "--out");
// Create resolved, typed paths for fs/path APIs
const inputZipPath = path.resolve(argv.input);
const outDir = path.resolve(argv.out);
(async () => {
    // Read the zip as Buffer (Node fs API requires a string/PathLike path)
    const buf = fs.readFileSync(inputZipPath);
    const zip = await loadZip(buf);
    const app = await readManifestJson(zip);
    const agent = await readDeclarativeAgentJson(zip, app);
    fs.mkdirSync(outDir, { recursive: true });
    writeArtifacts(outDir, { app, agent });
    console.log(`✔ Wrote Copilot Studio artifacts to: ${outDir}`);
    if (argv.provision) {
        const name = agent?.name || app?.name?.short || "Converted Copilot";
        const description = agent?.description || app?.description?.full || app?.description?.short || "";
        const bot = await createBot({ name, description });
        console.log(`✔ Created Copilot (bot) in Dataverse: ${bot.id}`);
        console.log("➡ Open Copilot Studio, locate the new copilot, paste instructions/starters, and add capabilities.");
    }
})().catch((err) => {
    console.error("✖ Error:", err?.message || err);
    process.exit(1);
});
