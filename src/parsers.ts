import JSZip from "jszip";
import { DeclarativeAgentV15, TeamsAppManifest } from "./types.js";

export async function loadZip(buffer: Buffer): Promise<JSZip> {
  const zip = await JSZip.loadAsync(buffer);
  return zip;
}

export async function readManifestJson(zip: JSZip): Promise<TeamsAppManifest> {
  const file = zip.file(/(^|\/)manifest\.json$/i)?.[0];
  if (!file) throw new Error("manifest.json not found in the zip root.");
  const text = await file.async("string");
  return JSON.parse(text);
}

export async function readDeclarativeAgentJson(
  zip: JSZip,
  manifest: TeamsAppManifest
): Promise<DeclarativeAgentV15> {
  const fileRef =
    manifest.copilotAgents?.declarativeAgents?.[0]?.file ||
    "declarativeAgent.json";
  const file = zip.file(new RegExp(`(^|/)${escapeRegex(fileRef)}$`, "i"))?.[0];
  if (!file)
    throw new Error(
      `Declarative agent file "${fileRef}" not found in the package.`
    );
  const text = await file.async("string");
  const json = JSON.parse(text);
  if (!json.version?.startsWith("v")) {
    throw new Error(
      `Unexpected declarative agent schema version: ${json.version}`
    );
  }
  return json as DeclarativeAgentV15;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}