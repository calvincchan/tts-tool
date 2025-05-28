import { Database } from "./database.types";

export const SpeechScriptStatus = [
  "Draft",
  "In Progress",
  "Completed",
  "Approved",
] as const;

export type SpeechScriptStatus = (typeof SpeechScriptStatus)[number];

export type ISpeechScript = Database["public"]["Tables"]["speech_scripts"]["Row"];