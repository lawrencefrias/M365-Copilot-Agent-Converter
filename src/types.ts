export interface TeamsAppManifest {
  manifestVersion: string;
  name: { short: string; full?: string };
  description: { short: string; full?: string };
  developer?: any;
  copilotAgents?: {
    declarativeAgents?: { id?: string; file: string }[];
    customEngineAgents?: any[];
  };
}

export interface DeclarativeAgentV15 {
  version: string; // e.g., "v1.5"
  id?: string;
  name: string;
  description: string;
  instructions: string;
  conversation_starters?: { title: string; text: string }[];
  capabilities?: Array<{ name: string; [k: string]: any }>;
  behavior_overrides?: any;
}