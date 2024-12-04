export type TSpeechScriptStatus = "Draft" | "In Progress" | "Approved";

export interface ISpeechScript {
  id?: number;
  created_at?: string;
  updated_at?: string;
  refno?: number;
  revision: number;
  original: string;
  content: string;
  status: TSpeechScriptStatus;
}
