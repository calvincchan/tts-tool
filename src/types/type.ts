export const SpeechScriptStatus = [
  "Draft",
  "In Progress",
  "Completed",
  "Approved",
] as const;

export type SpeechScriptStatus = (typeof SpeechScriptStatus)[number];

export interface ISpeechScript {
  id?: number;
  created_at?: string;
  updated_at?: string;
  refno?: number;
  revision: number;
  original: string;
  content: string;
  status: SpeechScriptStatus;
}
