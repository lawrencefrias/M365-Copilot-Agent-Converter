// src/solutionBuilder.ts
import JSZip from "jszip";

// ---- Types ---------------------------------------------------------------

export interface SolutionMetadata {
  solutionUniqueName: string;     // e.g., "m3652cs_<slug>"
  friendlyName: string;           // e.g., "Converted Copilot"
  version: string;                // e.g., "1.0.0.0"
  publisherUniqueName: string;    // e.g., "m3652cs"
  publisherFriendlyName?: string; // e.g., "M365 → Copilot Studio Converter"
  customizationPrefix: string;    // e.g., "m365"
  languageCode?: number;          // LCID; default 1033 (en-US)
  managed?: boolean;              // false = unmanaged
}

export interface BuildResult {
  zipBuffer: Buffer;
  files: { name: string; content: string }[];
}

// ---- Public API ----------------------------------------------------------

/**
 * Build a minimal, valid Dataverse solution .zip with:
 *  - solution.xml (with SolutionManifest)
 *  - customizations.xml (empty ImportExportXml)
 *  - [Content_Types].xml (open packaging content types)
 */
export async function buildDataverseSolutionZip(meta: SolutionMetadata): Promise<BuildResult> {
  const normalized = normalize(meta);
  const solutionXml = generateSolutionXml(normalized);
  const customizationsXml = generateCustomizationsXml();
  const contentTypesXml = generateContentTypesXml();

  const zip = new JSZip();
  zip.file("solution.xml", solutionXml);
  zip.file("customizations.xml", customizationsXml);
  zip.file("[Content_Types].xml", contentTypesXml);

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return {
    zipBuffer,
    files: [
      { name: "solution.xml", content: solutionXml },
      { name: "customizations.xml", content: customizationsXml },
      { name: "[Content_Types].xml", content: contentTypesXml },
    ],
  };
}

// ---- Implementation details ---------------------------------------------

function normalize(meta: SolutionMetadata): Required<SolutionMetadata> {
  const lang = meta.languageCode ?? 1033;
  return {
    ...meta,
    friendlyName: meta.friendlyName || meta.solutionUniqueName,
    publisherFriendlyName: meta.publisherFriendlyName || meta.publisherUniqueName,
    languageCode: lang,
    managed: meta.managed ?? false,
  };
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


/**
 * `solution.xml`:
 * Official examples show a root <ImportExportXml> node that includes <SolutionManifest>.
 * Keep attributes simple; platform fills in additional metadata during import. [2](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/create-custom-api-solution)
 */
function generateSolutionXml(meta: Required<SolutionMetadata>): string {
  const managedFlag = meta.managed ? 1 : 0;

  return `<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml SolutionPackageVersion="9.2" languagecode="${meta.languageCode}" generatedBy="m3652cs" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SolutionManifest>
    <UniqueName>${xmlEscape(meta.solutionUniqueName)}</UniqueName>
    <LocalizedNames>
      <LocalizedName description="${xmlEscape(meta.friendlyName)}" languagecode="${meta.languageCode}" />
    </LocalizedNames>
    <Descriptions />
    <Version>${xmlEscape(meta.version)}</Version>
    <Managed>${managedFlag}</Managed>
    <Publisher>
      <UniqueName>${xmlEscape(meta.publisherUniqueName)}</UniqueName>
      <LocalizedNames>
        <LocalizedName description="${xmlEscape(meta.publisherFriendlyName)}" languagecode="${meta.languageCode}" />
      </LocalizedNames>
      <Descriptions />
      <EMailAddress xsi:nil="true"></EMailAddress>
      <SupportingWebsiteUrl xsi:nil="true"></SupportingWebsiteUrl>
      <CustomizationPrefix>${xmlEscape(meta.customizationPrefix)}</CustomizationPrefix>
      <!-- OptionValuePrefix is optional here; platform can assign one on import if missing -->
    </Publisher>
    <!-- No RootComponents → solution imports as an empty shell; customizations.xml will define components if you add them later -->
  </SolutionManifest>
</ImportExportXml>`;
}

/**
 * `customizations.xml`:
 * Minimal, schema‑valid empty document; all primary sections are optional (minOccurs=0). [3](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/customization-solutions-file-schema)
 */
function generateCustomizationsXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" />`;
}

/**
 * `[Content_Types].xml`:
 * Minimal Open Packaging declaration is sufficient for a solution containing only XML files. [1](https://learn.microsoft.com/en-us/troubleshoot/power-platform/dataverse/working-with-solutions/the-solution-file-is-invalid)
 */
function generateContentTypesXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
</Types>`;
}

// ---- Helpers to derive metadata from your M365 package (optional) -------

/**
 * Create a reasonable SolutionMetadata from your M365 app/agent payload.
 * Use this to wire into your current index.ts after you've read `app` and `agent`.
 */
export function deriveSolutionMetadata(input: {
  app: any;   // Teams manifest.json
  agent: any; // declarativeAgent_*.json
}): SolutionMetadata {
  // Unique name: prefer declarative agent id or app id; fallback to slug(name)
  const agentId: string | undefined = input?.agent?.id || input?.agent?.appId;
  const appId: string | undefined = input?.app?.id;
  const base = (agentId || appId || slug(input?.agent?.name || input?.app?.name?.short || "copilot")).toString();

  return {
    solutionUniqueName: `m3652cs_${slug(base)}`.slice(0, 100), // Dataverse uniqueness + practical length guard
    friendlyName: input?.agent?.name || input?.app?.name?.short || "Converted Copilot",
    version: "1.0.0.0",                  // You can bump this per run if desired
    publisherUniqueName: "m3652cs",      // Change if you maintain a specific publisher
    publisherFriendlyName: "M365 → Copilot Studio Converter",
    customizationPrefix: "m365",
    languageCode: 1033,
    managed: false,
  };
}

function slug(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
