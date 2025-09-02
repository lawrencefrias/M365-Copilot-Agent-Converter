#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import { loadZip, readManifestJson, readDeclarativeAgentJson } from "./parsers.js";
import { writeArtifacts } from "./artifacts.js";
import { createBot } from "./dataverse.js";
import JSZip from "jszip";

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName("m3652cs")
    .usage("$0 -i <m365_agent_zip> -o <out_dir> [--provision]")
    .option("i", {
      alias: "input",
      type: "string",
      demandOption: true,
      describe: "Path to Microsoft 365/Teams app package zip (manifest.json + declarativeAgent_*.json)"
    })
    .option("o", {
      alias: "out",
      type: "string",
      demandOption: true,
      describe: "Output directory for Copilot Studio artifacts"
    })
    .option("provision", {
      type: "boolean",
      default: false,
      describe: "Create a new Copilot (bot) in Dataverse with name/description (requires .env)"
    })
    .help()
    .parse();

  const buf = fs.readFileSync(argv.input);
  const zip = await loadZip(buf);

  // Validate presence of manifest.json
  const app = await readManifestJson(zip);

  // Validate declarative agent file and parse
  const agent = await readDeclarativeAgentJson(zip, app);

  // Write Copilot Studio artifacts
  fs.mkdirSync(argv.out, { recursive: true });
  writeArtifacts(argv.out, { app, agent });

  console.log(`✔ Wrote Copilot Studio artifacts to: ${path.resolve(argv.out)}`);

  if (argv.provision) {
    const name = agent?.name || app?.name?.short || "Converted Copilot";
    const description =
      agent?.description || app?.description?.full || app?.description?.short || "";
    const bot = await createBot({ name, description });
    console.log(`✔ Created Copilot (bot) in Dataverse: ${bot.id}`);
    console.log(
      "➡ Open Copilot Studio, locate the new copilot by name, paste instructions and starters, and add capabilities."
    );
  }
}

main().catch((err) => {
  console.error("✖ Error:", err?.message || err);
  process.exit(1);
});