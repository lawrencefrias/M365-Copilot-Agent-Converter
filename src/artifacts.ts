import fs from "node:fs";
import path from "node:path";
import { DeclarativeAgentV15, TeamsAppManifest } from "./types.js";

export function toInstructionsMd(agent: DeclarativeAgentV15): string {
  const header = `# Instructions\n\n> Converted from Microsoft 365 declarative agent schema ${agent.version}\n`;
  return [
    header,
    "## Name",
    agent.name,
    "",
    "## Description",
    agent.description,
    "",
    "## Instructions",
    agent.instructions,
    ""
  ].join("\n");
}

export function toConversationStartersCsv(
  agent: DeclarativeAgentV15
): string {
  const header = "title,text";
  const rows =
    agent.conversation_starters?.map((s) =>
      csvRow([s.title ?? "", s.text ?? ""])
    ) ?? [];
  return [header, ...rows].join("\n");
}

export function toCapabilitiesJson(agent: DeclarativeAgentV15): any {
  return {
    version: agent.version,
    capabilities: agent.capabilities ?? [],
    notes:
      "Use Copilot Studio to re-add equivalent capabilities (Web search, OneDrive/SharePoint, Graph connectors, Code Interpreter, etc.)."
  };
}

export function writeArtifacts(
  outDir: string,
  inputs: {
    app: TeamsAppManifest;
    agent: DeclarativeAgentV15;
  }
) {
  fs.mkdirSync(path.join(outDir, "copilot-studio"), { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "copilot-studio", "instructions.md"),
    toInstructionsMd(inputs.agent),
    "utf8"
  );
  fs.writeFileSync(
    path.join(outDir, "copilot-studio", "conversation-starters.csv"),
    toConversationStartersCsv(inputs.agent),
    "utf8"
  );
  fs.writeFileSync(
    path.join(outDir, "copilot-studio", "capabilities.json"),
    JSON.stringify(toCapabilitiesJson(inputs.agent), null, 2),
    "utf8"
  );

  // Keep originals for reference
  fs.writeFileSync(
    path.join(outDir, "m365.manifest.json"),
    JSON.stringify(inputs.app, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(outDir, "declarativeAgent.json"),
    JSON.stringify(inputs.agent, null, 2),
    "utf8"
  );
}

function csvRow(cols: string[]) {
  return cols
    .map((c) => `"${c.replace(/"/g, '""')}"`)
    .join(",");
}