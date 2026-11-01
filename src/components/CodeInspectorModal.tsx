import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  FolderTree,
  FileCode,
  Sparkles,
  Cpu,
  Layers,
  Key,
  Bot,
  Send,
  Wrench,
  ShieldAlert,
  Minimize2,
  RefreshCw,
  FilePlus,
  Trash2,
  Edit3,
  CheckCircle,
  Info,
  X,
  Package,
  Terminal,
  Globe,
  Brush,
  AlertTriangle,
  Play,
  Download,
  Upload,
  TestTube,
  Gauge,
  Network,
  History,
  Award,
  MousePointer,
  Search,
  Sliders,
  Flame
} from "lucide-react";

import { MockEndpoint, NetworkLog, Snapshot, VirtualFile, EditorSettingsConfig } from "./inspector/types";
import EditorSettings, { THEME_STYLES } from "./inspector/EditorSettings";
import UnitTestRunner from "./inspector/UnitTestRunner";
import PerformanceProfiler from "./inspector/PerformanceProfiler";
import ApiMocker from "./inspector/ApiMocker";
import SnapshotTimeline from "./inspector/SnapshotTimeline";
import A11yAuditor from "./inspector/A11yAuditor";
import DomInspector from "./inspector/DomInspector";
import StructuralDiagram from "./inspector/StructuralDiagram";
import RegexTester from "./inspector/RegexTester";
import HotReloadPreview from "./inspector/HotReloadPreview";

interface CodeInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
  initialCode?: string;
  initialLanguage?: string;
  customApiKey?: string;
}

const DEFAULT_FILES: VirtualFile[] = [
  {
    id: "app-js",
    name: "app.js",
    language: "javascript",
    content: `// Workspace JavaScript Entry Point

function runHeavyMath(payload) {
  let result = 0;
  if (payload) {
    for (let i = 1; i <= 10; i++) {
      result += (i * i);
    }
  }
  return result;
}

function renderHtml(userInput) {
  const outputContainer = document.getElementById("output");
  if (outputContainer) {
    outputContainer.textContent = userInput;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const calcBtn = document.getElementById("calcBtn");
  if (calcBtn) {
    calcBtn.addEventListener("click", () => {
      const mathValue = runHeavyMath(true);
      renderHtml("Computation Result Success: " + mathValue);
    });
  }
});`
  },
  {
    id: "index-html",
    name: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Security Check Sandbox</title>
</head>
<body>
  <div id="output">Rendering incoming data...</div>
  <button id="calcBtn" aria-label="Activate calculation">Activate</button>
</body>
</html>`
  },
  {
    id: "styles-css",
    name: "styles.css",
    language: "css",
    content: `/* Architecture Baseline Styling */
:root {
  --primary: #cba6f7;
  --secondary: #89b4fa;
}

body {
  background-color: #11111b;
  color: #cdd6f4;
  margin: 0;
  padding: 24px;
  font-family: sans-serif;
}

button {
  background: var(--primary);
  color: #11111b;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}`
  }
];

export default function CodeInspectorModal({
  isOpen,
  onClose,
  initialCode,
  initialLanguage,
  customApiKey
}: CodeInspectorModalProps) {
  const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>(() => {
    try {
      const saved = localStorage.getItem("code_inspector_files_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_FILES;
  });

  const [currentFileIdx, setCurrentFileIdx] = useState(0);
  type TabType =
    | "dashboard"
    | "compiler"
    | "tests"
    | "profiler"
    | "mocker"
    | "timeline"
    | "a11y"
    | "dom"
    | "diagram"
    | "regex"
    | "settings"
    | "issues"
    | "ast"
    | "ai";

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [bgDaemonEnabled, setBgDaemonEnabled] = useState(true);
  const [daemonStatus, setDaemonStatus] = useState<{ mode: "idle" | "typing" | "scanning" | "disabled"; text: string }>({
    mode: "idle",
    text: "Daemon: Watching"
  });

  const [apiKey, setApiKey] = useState(() => customApiKey || localStorage.getItem("gemini_api_key") || "");
  const [apiInput, setApiInput] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // New Features State
  const [hotReloadEnabled, setHotReloadEnabled] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<{ level: "log" | "warn" | "error"; text: string; timestamp: string }[]>([]);
  const [mockEndpoints, setMockEndpoints] = useState<MockEndpoint[]>(() => [
    {
      id: "m-1",
      method: "GET",
      url: "/api/user",
      status: 200,
      response: JSON.stringify({ id: 101, username: "dev_architect", role: "admin" }, null, 2),
      enabled: true
    }
  ]);
  const [networkLogs, setNetworkLogs] = useState<NetworkLog[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [domPickerActive, setDomPickerActive] = useState(false);
  const [selectedDomElement, setSelectedDomElement] = useState<any>(null);

  const [editorSettings, setEditorSettings] = useState<EditorSettingsConfig>(() => {
    try {
      const saved = localStorage.getItem("code_inspector_settings_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      // Ignore
    }
    return {
      theme: "catppuccin",
      fontSize: 13,
      fontFamily: "'JetBrains Mono', monospace",
      wordWrap: true,
      showLineNumbers: true,
      tabSize: 2
    };
  });

  const handleUpdateEditorSettings = (newSettings: EditorSettingsConfig) => {
    setEditorSettings(newSettings);
    try {
      localStorage.setItem("code_inspector_settings_v4", JSON.stringify(newSettings));
    } catch {
      // Ignore
    }
  };

  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customApiKey) setApiKey(customApiKey);
  }, [customApiKey]);

  // Sync virtual files & Take Auto Snapshot
  useEffect(() => {
    try {
      localStorage.setItem("code_inspector_files_v3", JSON.stringify(virtualFiles));
      setIsSaved(true);
      const timer = setTimeout(() => setIsSaved(false), 1500);
      return () => clearTimeout(timer);
    } catch {
      // Ignore
    }
  }, [virtualFiles]);

  const activeFile = virtualFiles[currentFileIdx] || virtualFiles[0];

  const updateFileContent = (newContent: string) => {
    setVirtualFiles((prev) => {
      const next = [...prev];
      if (next[currentFileIdx]) {
        next[currentFileIdx] = { ...next[currentFileIdx], content: newContent };
      }
      return next;
    });
  };

  const handleUpdateSpecificFile = (filename: string, newContent: string) => {
    setVirtualFiles((prev) =>
      prev.map((f) => (f.name === filename ? { ...f, content: newContent } : f))
    );
  };

  const handleTakeSnapshot = (label: string = "Checkpoint - Auto Save") => {
    const newSnapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      label,
      files: JSON.parse(JSON.stringify(virtualFiles))
    };
    setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 15)]);
  };

  const handleRestoreSnapshot = (snapshot: Snapshot) => {
    setVirtualFiles(JSON.parse(JSON.stringify(snapshot.files)));
    setCurrentFileIdx(0);
  };

  const exportWorkspaceJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(virtualFiles, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `workspace-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importWorkspaceJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVirtualFiles(parsed);
            setCurrentFileIdx(0);
          } else {
            alert("Invalid workspace format");
          }
        } catch (err: any) {
          alert("Failed to parse JSON: " + err.message);
        }
      };
    }
  };

  // Static Analysis
  const computeAnalysis = () => {
    if (!activeFile) {
      return {
        lineCount: 0,
        charCount: 0,
        estTokens: 0,
        sizeBytes: 0,
        complexity: 1,
        deadVariables: [],
        issues: [],
        astNodes: [],
        maintainability: 100,
        securityHealth: 100
      };
    }

    const code = activeFile.content;
    const lang = activeFile.language;
    const lineCount = code.split("\n").length;
    const charCount = code.length;
    const estTokens = Math.ceil(charCount / 4.2);
    const sizeBytes = new Blob([code]).size;

    const issues: { severity: "error" | "warning"; text: string; category: string }[] = [];
    const astNodes: { type: string; name: string; line: number }[] = [];
    let complexity = 1;
    const deadVariables: { name: string; line: number }[] = [];
    const getLineFromIdx = (str: string, index: number) => str.substring(0, index).split("\n").length;

    if (lang === "javascript") {
      const branches = code.match(/(if\s*\(|for\s*\(|while\s*\(|catch\s*\(|(?:&&|\|\|)|\bcase\s+)/g);
      complexity = branches ? branches.length + 1 : 1;

      const variableDeclarations = [...code.matchAll(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/g)];
      variableDeclarations.forEach((match) => {
        const varName = match[1];
        const escapedVarName = varName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const varRegex = new RegExp(`\\b${escapedVarName}\\b`, "g");
        const occurrences = (code.match(varRegex) || []).length;
        if (occurrences === 1) {
          deadVariables.push({ name: varName, line: getLineFromIdx(code, match.index || 0) });
        }
      });
    }

    let maintainability = Math.max(20, Math.round(100 - complexity * 4.5 - deadVariables.length * 5 - issues.length * 10));
    const securityHealth = Math.max(10, Math.min(100, 100 - issues.length * 20));

    return {
      lineCount,
      charCount,
      estTokens,
      sizeBytes,
      complexity,
      deadVariables,
      issues,
      astNodes,
      maintainability,
      securityHealth
    };
  };

  const analysis = computeAnalysis();

  const handleFormat = () => {
    if (!activeFile) return;
    const formatted = activeFile.content
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
    updateFileContent(formatted);
  };

  const handleMinify = () => {
    if (!activeFile) return;
    const minified = activeFile.content
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(?:^|[^:])\/\/.*/gm, "")
      .replace(/\s+/g, " ")
      .trim();
    updateFileContent(minified);
  };

  const handleAddFile = () => {
    const filename = prompt("Enter new filename:", "utils.js");
    if (!filename) return;
    const cleanName = filename.trim();
    if (!cleanName) return;

    const ext = cleanName.split(".").pop()?.toLowerCase();
    let language = "javascript";
    let template = `// Workspace script: ${cleanName}\nfunction initialize() {\n  return true;\n}\ninitialize();`;

    if (ext === "html") {
      language = "html";
      template = `<!DOCTYPE html>\n<html lang="en">\n<head><title>${cleanName}</title></head>\n<body>\n  <div id="app"></div>\n</body>\n</html>`;
    } else if (ext === "css") {
      language = "css";
      template = `/* ${cleanName} Baseline */\nbody { margin: 0; padding: 0; }`;
    }

    const newFile: VirtualFile = {
      id: `file-${Date.now()}`,
      name: cleanName,
      language,
      content: template
    };

    setVirtualFiles((prev) => [...prev, newFile]);
    setCurrentFileIdx(virtualFiles.length);
  };

  const currentTheme = THEME_STYLES[editorSettings.theme] || THEME_STYLES.catppuccin;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in font-sans">
      <div
        className="w-full max-w-7xl h-[94vh] border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-colors"
        style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border, color: currentTheme.text }}
      >
        {/* Modal Header */}
        <header
          className="border-b px-5 py-2.5 flex items-center justify-between shrink-0"
          style={{ backgroundColor: currentTheme.sidebar, borderColor: currentTheme.border }}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: currentTheme.accent, color: currentTheme.bg }}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wider uppercase flex items-center gap-2" style={{ color: currentTheme.text }}>
                The Code Inspector Pro{" "}
                <span className="text-[9px] px-1.5 py-0.5 rounded font-black font-mono bg-[#a6e3a1] text-[#11111b]">
                  V4.0 Enterprise-Edition
                </span>
              </h1>
              <p className="text-[10px] opacity-70">
                Real-time AST Linter, Multimodal Diagnostics & Memory Compiler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {isSaved && (
              <div className="flex items-center gap-1 text-[#a6e3a1]">
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Workspace Main Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* File Explorer Sidebar */}
          <aside
            className="w-52 border-r flex flex-col shrink-0"
            style={{ backgroundColor: currentTheme.sidebar, borderColor: currentTheme.border }}
          >
            <div className="p-2.5 border-b flex items-center justify-between" style={{ borderColor: currentTheme.border }}>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-[#89b4fa]" /> Workspace
              </span>
              <div className="flex items-center gap-1">
                <button onClick={handleAddFile} className="p-1 hover:text-white cursor-pointer" title="New file">
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button onClick={exportWorkspaceJSON} className="p-1 hover:text-[#a6e3a1] cursor-pointer" title="Export JSON">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="p-1 hover:text-[#f9e2af] cursor-pointer" title="Import JSON">
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <input type="file" ref={fileInputRef} onChange={importWorkspaceJSON} className="hidden" accept=".json" />
              </div>
            </div>

            {/* File Items */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {virtualFiles.map((file, idx) => {
                const isActive = idx === currentFileIdx;
                return (
                  <button
                    key={file.id || idx}
                    onClick={() => setCurrentFileIdx(idx)}
                    className={`w-full flex items-center gap-2 text-left text-xs truncate py-1.5 px-2 rounded font-mono transition-all ${
                      isActive ? "bg-white/15 text-white font-bold" : "opacity-80 hover:opacity-100 hover:bg-white/5"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-[#89b4fa] shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 border-t text-[10px] opacity-70" style={{ borderColor: currentTheme.border }}>
              Hot-reload and static linters active.
            </div>
          </aside>

          {/* Code Editor Central Pane */}
          <main className="flex-1 flex flex-col relative" style={{ backgroundColor: currentTheme.bg }}>
            {/* Editor Top Bar */}
            <div
              className="border-b px-3 py-1.5 flex items-center justify-between text-xs font-mono"
              style={{ backgroundColor: currentTheme.sidebar, borderColor: currentTheme.border }}
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" style={{ color: currentTheme.accent }} />
                <span className="font-bold">{activeFile?.name}</span>
                <span className="opacity-50">|</span>
                <span className="opacity-75 text-[10px] uppercase font-bold">{activeFile?.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFormat}
                  className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#f9e2af]" /> Format
                </button>
              </div>
            </div>

            {/* Textarea Editor */}
            <div className="flex-1 flex overflow-hidden relative">
              {editorSettings.showLineNumbers && (
                <div
                  ref={lineNumbersRef}
                  className="w-10 text-right pr-2 pt-3 select-none font-mono text-xs leading-6 overflow-hidden border-r opacity-50"
                  style={{ backgroundColor: currentTheme.sidebar, borderColor: currentTheme.border, color: currentTheme.lineNum }}
                >
                  {activeFile?.content.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              )}
              <textarea
                ref={editorRef}
                value={activeFile?.content || ""}
                onChange={(e) => updateFileContent(e.target.value)}
                onScroll={() => {
                  if (lineNumbersRef.current && editorRef.current) {
                    lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
                  }
                }}
                className={`flex-1 bg-transparent p-3 focus:outline-none resize-none font-mono text-xs leading-6 overflow-y-auto block ${
                  editorSettings.wordWrap ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]" : "whitespace-pre"
                }`}
                style={{
                  fontSize: `${editorSettings.fontSize}px`,
                  fontFamily: editorSettings.fontFamily,
                  color: currentTheme.text,
                  wordBreak: editorSettings.wordWrap ? "break-word" : "normal",
                  overflowWrap: editorSettings.wordWrap ? "break-word" : "normal"
                }}
                spellCheck={false}
              />
            </div>
          </main>

          {/* Right Inspector Tools Panel */}
          <section
            className="w-96 border-l flex flex-col shrink-0"
            style={{ backgroundColor: currentTheme.sidebar, borderColor: currentTheme.border }}
          >
            {/* 12 Tabs Header Navigation */}
            <div className="flex border-b text-[10px] overflow-x-auto shrink-0 font-mono scrollbar-none" style={{ borderColor: currentTheme.border }}>
              {[
                { id: "dashboard", label: "Dashboard", icon: <Cpu className="w-3 h-3" /> },
                { id: "compiler", label: "Sandbox", icon: <Flame className="w-3 h-3 text-[#a6e3a1]" /> },
                { id: "tests", label: "Tests", icon: <TestTube className="w-3 h-3 text-[#a6e3a1]" /> },
                { id: "profiler", label: "Profiler", icon: <Gauge className="w-3 h-3 text-[#f9e2af]" /> },
                { id: "mocker", label: "Mocker", icon: <Network className="w-3 h-3 text-[#89b4fa]" /> },
                { id: "timeline", label: "Git", icon: <History className="w-3 h-3 text-[#cba6f7]" /> },
                { id: "a11y", label: "a11y", icon: <Award className="w-3 h-3 text-[#a6e3a1]" /> },
                { id: "dom", label: "DOM", icon: <MousePointer className="w-3 h-3 text-[#89b4fa]" /> },
                { id: "diagram", label: "Flow", icon: <Network className="w-3 h-3 text-[#cba6f7]" /> },
                { id: "regex", label: "Regex", icon: <Search className="w-3 h-3 text-[#f9e2af]" /> },
                { id: "settings", label: "Theme", icon: <Sliders className="w-3 h-3" /> },
                { id: "ai", label: "AI", icon: <Bot className="w-3 h-3 text-[#f9e2af]" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-2 px-2.5 text-center border-b-2 font-bold whitespace-nowrap cursor-pointer flex items-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? "border-white text-white bg-white/10"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Active Tab View */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeTab === "dashboard" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Health Metrics</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#a6adc8]">Maintainability</span>
                        <span className="font-bold text-[#a6e3a1]">{analysis.maintainability}/100</span>
                      </div>
                      <div className="w-full bg-[#313244] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#a6e3a1] h-full" style={{ width: `${analysis.maintainability}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#181825] p-2.5 rounded border border-[#313244]">
                      <div className="text-[9px] uppercase text-[#a6adc8]">Complexity</div>
                      <div className="text-base font-bold text-white mt-0.5">{analysis.complexity}</div>
                    </div>
                    <div className="bg-[#181825] p-2.5 rounded border border-[#313244]">
                      <div className="text-[9px] uppercase text-[#a6adc8]">Unused Vars</div>
                      <div className="text-base font-bold text-white mt-0.5">{analysis.deadVariables.length}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "compiler" && (
                <HotReloadPreview
                  virtualFiles={virtualFiles}
                  hotReloadEnabled={hotReloadEnabled}
                  onToggleHotReload={() => setHotReloadEnabled(!hotReloadEnabled)}
                  mockEndpoints={mockEndpoints}
                  onNetworkLog={(log) => setNetworkLogs((prev) => [log, ...prev.slice(0, 19)])}
                  terminalLogs={terminalLogs}
                  onClearTerminalLogs={() => setTerminalLogs([])}
                  onConsoleLog={(level, text) =>
                    setTerminalLogs((prev) => [
                      ...prev,
                      {
                        level,
                        text,
                        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
                      }
                    ])
                  }
                  pickerActive={domPickerActive}
                  onSelectDomElement={(el) => {
                    setSelectedDomElement(el);
                    setActiveTab("dom");
                  }}
                />
              )}

              {activeTab === "tests" && <UnitTestRunner virtualFiles={virtualFiles} />}

              {activeTab === "profiler" && <PerformanceProfiler virtualFiles={virtualFiles} />}

              {activeTab === "mocker" && (
                <ApiMocker
                  mockEndpoints={mockEndpoints}
                  onUpdateEndpoints={setMockEndpoints}
                  networkLogs={networkLogs}
                  onClearLogs={() => setNetworkLogs([])}
                />
              )}

              {activeTab === "timeline" && (
                <SnapshotTimeline
                  snapshots={snapshots}
                  onTakeSnapshot={handleTakeSnapshot}
                  onRestoreSnapshot={handleRestoreSnapshot}
                  currentFiles={virtualFiles}
                />
              )}

              {activeTab === "a11y" && (
                <A11yAuditor virtualFiles={virtualFiles} onUpdateFileContent={handleUpdateSpecificFile} />
              )}

              {activeTab === "dom" && (
                <DomInspector
                  pickerActive={domPickerActive}
                  onTogglePicker={() => {
                    setDomPickerActive(!domPickerActive);
                    if (!domPickerActive) setActiveTab("compiler");
                  }}
                  selectedElement={selectedDomElement}
                />
              )}

              {activeTab === "diagram" && <StructuralDiagram virtualFiles={virtualFiles} />}

              {activeTab === "regex" && <RegexTester />}

              {activeTab === "settings" && (
                <EditorSettings settings={editorSettings} onUpdateSettings={handleUpdateEditorSettings} />
              )}

              {activeTab === "ai" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-[#cba6f7]" /> Gemini Copilot
                    </h3>
                    <textarea
                      rows={4}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Ask Gemini to refactor or add features to workspace..."
                      className="w-full bg-[#11111b] border border-[#313244] rounded p-2 text-xs text-white focus:outline-none resize-none whitespace-pre-wrap break-words"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Control Panel */}
            <div className="p-2.5 border-t shrink-0" style={{ backgroundColor: currentTheme.sidebar, borderColor: currentTheme.border }}>
              <button
                onClick={handleMinify}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                <Minimize2 className="w-3.5 h-3.5" /> Minify Active Buffer
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
