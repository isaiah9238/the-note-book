export interface VirtualFile {
  id: string;
  name: string;
  language: "javascript" | "html" | "css" | string;
  content: string;
}

export interface MockEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  status: number;
  response: string; // JSON string
  enabled: boolean;
}

export interface NetworkLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  mocked: boolean;
  responsePreview: string;
}

export interface Snapshot {
  id: string;
  timestamp: string;
  label: string;
  files: VirtualFile[];
}

export interface TestCaseResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface A11yViolation {
  id: string;
  severity: "error" | "warning";
  rule: string;
  message: string;
  lineNumber: number;
  fixAvailable: boolean;
  fixAction?: () => void;
  snippet: string;
}

export type EditorTheme = "catppuccin" | "dracula" | "one-dark" | "nord" | "cyberpunk" | "light";

export interface EditorSettingsConfig {
  theme: EditorTheme;
  fontSize: number;
  fontFamily: string;
  wordWrap: boolean;
  showLineNumbers: boolean;
  tabSize: number;
}
