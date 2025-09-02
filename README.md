# m365-agent-to-copilotstudio

Convert a **Microsoft 365 declarative agent** app package (Teams app `manifest.json` + `declarativeAgent_*.json`) into **Copilot Studio–ready artifacts** and optionally create a new **Copilot (bot)** record in Dataverse for you to finish authoring.

## Why?

- Copilot Studio imports/exports via **Dataverse solutions**. A Microsoft 365/Teams app package is **not** a Dataverse solution, which is why importing it as a solution fails (`solution.xml`, `customizations.xml`, `[Content_Types].xml` are required). [4](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-solutions-import-export)[1](https://learn.microsoft.com/en-us/troubleshoot/power-platform/dataverse/working-with-solutions/the-solution-file-is-invalid)
- Declarative agents are defined in a JSON manifest that is **referenced by the Microsoft 365 app manifest** under `copilotAgents.declarativeAgents` in schema v1.21+. [2](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-manifest-1.5)[3](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)
- Dataverse exposes a **Copilot (bot)** table that supports creating bots programmatically; this tool creates the bot shell so you can paste instructions, add conversation starters, and configure capabilities in Copilot Studio. [5](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/bot)

## Features

- Extracts:
  - **Instructions** → `copilot-studio/instructions.md`
  - **Conversation starters** → `copilot-studio/conversation-starters.csv`
  - **Capabilities** → `copilot-studio/capabilities.json` (for re‑adding in Studio)
- Optional: **Creates a new Copilot (bot)** in your Dataverse environment (`POST /api/data/v9.2/bots`) and prints the created `botid`. [5](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/bot)

> **Limitation:** There is no public, supported API to import a full Copilot Studio agent including topics and all components as a Dataverse solution from a declarative agent JSON. Finish configuration in Copilot Studio, then export an unmanaged solution from there.

## Getting Started


npm i
cp .env.sample .env
# populate DATAVERSE_URL, TENANT_ID, CLIENT_ID, CLIENT_SECRET if you want provisioning
npm run build

# Convert only
m3652cs -i ./examples/sample.m365.agent.zip -o ./out

# Convert + create a new Copilot (bot)
m3652cs -i ./examples/sample.m365.agent.zip -o ./out --provision
