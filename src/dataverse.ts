import "dotenv/config";
import fetch from "node-fetch";
import { ClientSecretCredential, TokenCredential } from "@azure/identity";

function getEnv(name: string, required = true): string | undefined {
  const v = process.env[name];
  if (!v && required) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function createBot(options: {
  name: string;
  description?: string;
}): Promise<{ id: string }> {
  const url = getEnv("DATAVERSE_URL")!;
  const token = await getToken();
  const res = await fetch(`${url}/api/data/v9.2/bots`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0"
    },
    body: JSON.stringify({
      name: options.name,
      description: options.description ?? ""
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to create bot (${res.status} ${res.statusText}): ${text}`
    );
  }
  const data = (await res.json()) as { botid: string };
  return { id: data.botid };
}

async function getToken(): Promise<string> {
  const tenantId = getEnv("TENANT_ID")!;
  const clientId = getEnv("CLIENT_ID")!;
  const clientSecret = getEnv("CLIENT_SECRET")!;
  const resource = getEnv("DATAVERSE_URL")!;

  const credential: TokenCredential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  );

  // Dataverse uses resource/.default scope
  const scope = `${resource}/.default`;
  const token = await credential.getToken(scope);
  if (!token) throw new Error("Failed to acquire token for Dataverse.");
  return token.token;
}