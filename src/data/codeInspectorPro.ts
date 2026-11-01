export const CODE_INSPECTOR_HTML = `<!-- The Code Inspector Pro -->
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Workspace & Code Inspector Pro (TypeScript Enabled)</title>
 <script src="https://cdn.tailwindcss.com"></script>
 <link rel="preconnect" href="https://fonts.googleapis.com">
 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght=400;500;600&family=Inter:wght=300;400;500;600;700&display=swap" rel="stylesheet">
 <script src="https://unpkg.com/lucide@latest"></script>
 <!-- Babel Standalone for Live TypeScript Transpilation -->
 <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
 <style>
   body { font-family: 'Inter', sans-serif; }
   .code-font { font-family: 'Fira Code', monospace; }
   .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
   ::-webkit-scrollbar { width: 6px; height: 6px; }
   ::-webkit-scrollbar-track { background: #1e1e2e; }
   ::-webkit-scrollbar-thumb { background: #45475a; border-radius: 3px; }
   ::-webkit-scrollbar-thumb:hover { background: #585b70; }

   .matrix-console-wrapper {
     --bg-color: #0A0A0A;
     --surface-color: #141414;
     --border-color: #222222;
     --text-primary: #E0E0E0;
     --text-muted: #888888;
     --font-mono: 'Fira Code', monospace;
     --color-do: #FF5500;
     --color-schedule: #00FFCC;
     --color-delegate: #BD93F9;
     --color-eliminate: #444444;
     font-family: var(--font-mono);
     color: var(--text-primary);
   }
   .quadrant-q1 .quadrant-header { color: var(--color-do); }
   .quadrant-q2 .quadrant-header { color: var(--color-schedule); }
   .quadrant-q3 .quadrant-header { color: var(--color-delegate); }
   .quadrant-q4 .quadrant-header { color: var(--color-eliminate); }
   .quadrant-q1 .task-item { border-left-color: var(--color-do); }
   .quadrant-q2 .task-item { border-left-color: var(--color-schedule); }
   .quadrant-q3 .task-item { border-left-color: var(--color-delegate); }
   .quadrant-q4 .task-item { border-left-color: var(--color-eliminate); }
 </style>
</head>
<body class="bg-[#181825] text-[#cdd6f4] h-screen flex flex-col overflow-hidden">

 <!-- Workspace Header -->
 <header class="bg-[#11111b] border-b border-[#313244] px-6 py-3 flex items-center justify-between shrink-0">
   <div class="flex items-center gap-3">
     <div class="bg-gradient-to-tr from-[#cba6f7] to-[#89b4fa] p-2 rounded-lg text-[#11111b]">
       <i data-lucide="shield-check" class="w-5 h-5"></i>
     </div>
     <div>
       <h1 class="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
         The Code Inspector Pro <span class="text-[9px] bg-[#3178c6] text-white font-extrabold px-1.5 py-0.5 rounded">V4.6 TS Suite</span>
       </h1>
       <p class="text-[10px] text-[#a6adc8]">AST Linter, TS Transpiler, Unit Test Runner & Live Console</p>
     </div>
   </div>
   <div class="flex items-center gap-4">
     <div class="flex items-center gap-2 bg-[#1e1e2e] px-3 py-1 rounded border border-[#313244]">
       <label class="relative inline-flex items-center cursor-pointer">
         <input type="checkbox" id="bgMonitorToggle" class="sr-only peer" checked>
         <div class="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#a6e3a1]"></div>
       </label>
       <span class="text-[10px] text-[#a6adc8] font-medium uppercase tracking-wider">Background Daemon</span>
     </div>

     <div id="saveIndicator" class="hidden text-xs text-[#a6e3a1] items-center gap-1">
       <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Auto-Saved
     </div>
     <div id="statusBadge" class="flex items-center gap-2 bg-[#1e1e2e] px-3 py-1.5 rounded-md border border-[#313244] text-xs">
       <span id="statusPulse" class="w-2 h-2 rounded-full bg-[#a6e3a1]"></span>
       <span id="statusText" class="text-[#a6adc8] font-medium">System Idle</span>
     </div>
   </div>
 </header>

 <!-- Main View -->
 <div class="flex flex-1 overflow-hidden">
   
   <!-- Left Sidebar -->
   <aside class="w-64 bg-[#11111b] border-r border-[#313244] flex flex-col shrink-0">
     <div class="p-3 border-b border-[#313244] flex items-center justify-between">
       <span class="text-xs font-bold uppercase tracking-wider text-[#a6adc8] flex items-center gap-1.5">
         <i data-lucide="folder-tree" class="w-4 h-4 text-[#89b4fa]"></i> Workspace
       </span>
       <div class="flex items-center gap-1">
         <button id="exportWorkspaceBtn" class="text-[#a6adc8] hover:text-[#a6e3a1] transition-colors p-1 rounded hover:bg-[#313244]" title="Export Workspace JSON">
           <i data-lucide="download" class="w-3.5 h-3.5"></i>
         </button>
         <button id="importWorkspaceBtn" class="text-[#a6adc8] hover:text-[#f9e2af] transition-colors p-1 rounded hover:bg-[#313244]" title="Import Workspace JSON">
           <i data-lucide="upload" class="w-3.5 h-3.5"></i>
         </button>
         <input type="file" id="importFileInput" accept=".json,application/json" class="hidden" />
         <button id="addFileBtn" class="text-[#a6adc8] hover:text-white transition-colors p-1 rounded hover:bg-[#313244]" title="Create virtual sandbox file">
           <i data-lucide="file-plus" class="w-4 h-4"></i>
         </button>
       </div>
     </div>

     <!-- Quick Add File Input Bar (Fixes prompt blockage) -->
     <div id="quickAddContainer" class="hidden px-2 pt-2">
       <div class="flex gap-1 bg-[#1e1e2e] p-1.5 rounded border border-[#313244]">
         <input type="text" id="newFileInput" placeholder="styles.css or utils.ts..." class="flex-1 bg-[#11111b] border border-[#313244] rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-[#89b4fa]" />
         <button id="confirmAddFileBtn" class="bg-[#89b4fa] text-[#11111b] font-bold text-xs px-2 py-0.5 rounded hover:bg-[#b4befe]">Add</button>
       </div>
     </div>

     <div id="fileList" class="flex-1 overflow-y-auto p-2 space-y-1"></div>

     <div class="p-4 bg-[#181825] border-t border-[#313244] text-[11px] text-[#a6adc8] space-y-2">
       <div class="flex items-center gap-1.5 font-semibold text-white">
         <i data-lucide="info" class="w-3.5 h-3.5 text-[#f9e2af]"></i>
         <span>Background Fetch</span>
       </div>
       <p class="leading-relaxed">When active, the background daemon audits your active buffer automatically every 4 seconds of typing downtime.</p>
     </div>
   </aside>

   <!-- Center Pane: Editor View -->
   <main class="flex-1 flex flex-col bg-[#1e1e2e] relative overflow-hidden">
     <div class="bg-[#11111b] border-b border-[#313244] px-4 py-2 flex items-center justify-between text-xs">
       <div class="flex items-center gap-2">
         <i data-lucide="file-code" class="w-4 h-4 text-[#cba6f7]"></i>
         <span id="currentFileName" class="font-medium text-white">...</span>
         <span class="text-[#585b70]">|</span>
         <span id="fileLanguage" class="text-[#a6adc8] bg-[#313244] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">typescript</span>
       </div>
       <div class="flex items-center gap-2">
         <button id="formatBtn" class="bg-[#313244] hover:bg-[#45475a] text-white px-3 py-1 rounded flex items-center gap-1.5 transition-colors">
           <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#f9e2af]"></i> Pretty-Print
         </button>
         <button id="analyzeBtn" class="bg-[#89b4fa] hover:bg-[#b4befe] text-[#11111b] font-semibold px-3 py-1 rounded flex items-center gap-1.5 transition-colors">
           <i data-lucide="cpu" class="w-3.5 h-3.5"></i> Run Inspector
         </button>
       </div>
     </div>

     <div class="flex-1 flex overflow-hidden relative">
       <div id="lineNumbers" class="w-12 bg-[#11111b] text-[#585b70] text-right pr-3 pt-4 select-none code-font text-xs leading-6 overflow-hidden">
         1
       </div>
       <textarea id="editor" class="flex-1 bg-transparent text-[#cdd6f4] p-4 focus:outline-none resize-none code-font text-xs leading-6 overflow-y-auto whitespace-pre-wrap break-words block" spellcheck="false" placeholder="// Write or paste TypeScript code here..."></textarea>
     </div>
   </main>

   <!-- Right Sidebar -->
   <section class="w-96 bg-[#11111b] border-l border-[#313244] flex flex-col shrink-0">
     <div class="flex border-b border-[#313244] text-[11px] overflow-x-auto shrink-0">
       <button id="tabAiBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
         <i data-lucide="sparkles" class="w-3.5 h-3.5 inline mr-1 text-[#f9e2af]"></i> AI Copilot
       </button>
       <button id="tabDashboardBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-[#cba6f7] font-semibold text-white whitespace-nowrap">
         <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 inline mr-1"></i> Health
       </button>
       <button id="tabMatrixBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
         <i data-lucide="check-square" class="w-3.5 h-3.5 inline mr-1 text-[#00FFCC]"></i> Matrix
       </button>
       <button id="tabIssuesBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
         <i data-lucide="shield-alert" class="w-3.5 h-3.5 inline mr-1"></i> Diagnostics
       </button>
       <button id="tabAstBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
         <i data-lucide="code" class="w-3.5 h-3.5 inline mr-1"></i> AST
       </button>
       <button id="tabCompilerBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap bg-[#1e1e2e]">
         <i data-lucide="play-circle" class="w-3.5 h-3.5 inline mr-1 text-[#a6e3a1]"></i> TS Compiler
       </button>
       <button id="tabTestsBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
         <i data-lucide="test-tube" class="w-3.5 h-3.5 inline mr-1 text-[#a6e3a1]"></i> Unit Tests
       </button>
     </div>

     <div class="flex-1 overflow-y-auto p-4 space-y-4">

       <!-- Tab 0: AI Copilot -->
       <div id="tabAi" class="space-y-4 hidden flex-1 flex flex-col">
         <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
           <div class="flex items-center justify-between">
             <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
               <i data-lucide="key" class="w-4 h-4 text-[#f9e2af]"></i> API Connection
             </h3>
             <button id="removeKeyBtn" class="text-[10px] text-[#f38ba8] hover:underline hidden">Remove Key</button>
           </div>
           <div class="flex gap-2">
             <input type="password" id="apiKeyInput" placeholder="Enter Gemini API Key..." class="flex-1 bg-[#11111b] border border-[#313244] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#89b4fa]">
             <button id="saveKeyBtn" class="bg-[#89b4fa] text-[#11111b] font-bold text-xs px-3 py-1 rounded hover:bg-[#b4befe] transition-colors">Save</button>
           </div>
         </div>

         <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3 flex-1 flex flex-col">
           <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
             <i data-lucide="bot" class="w-4 h-4 text-[#cba6f7]"></i> Gemini Prompt Assistant
           </h3>
           <textarea id="aiPromptInput" rows="3" class="w-full bg-[#11111b] border border-[#313244] rounded p-2 text-xs text-white focus:outline-none focus:border-[#cba6f7] resize-none whitespace-pre-wrap break-words" placeholder="Ask Gemini to write, refactor, or type-check code in the active file..."></textarea>
   
           <div class="flex gap-2">
             <button id="aiAskBtn" class="flex-1 bg-[#cba6f7] text-[#11111b] font-bold text-xs py-1.5 rounded hover:bg-[#b4befe] transition-colors flex items-center justify-center gap-1">
               <i data-lucide="send" class="w-3.5 h-3.5"></i> Run Prompt
             </button>
             <button id="aiAutoFixBtn" class="bg-[#313244] hover:bg-[#45475a] text-[#a6e3a1] font-bold text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1" title="Auto-fix issues found in Diagnostics tab">
               <i data-lucide="wrench" class="w-3.5 h-3.5"></i> Auto-Fix
             </button>
           </div>

           <div id="aiStatus" class="text-[10px] text-[#a6adc8] italic hidden">Processing request with Gemini...</div>
         </div>
       </div>

       <!-- Tab 1: Dashboard Analytics -->
       <div id="tabDashboard" class="space-y-4">
         <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
           <h3 class="text-xs font-bold text-white uppercase tracking-wider">Health Metrics</h3>
           <div class="space-y-1">
             <div class="flex justify-between text-[11px]">
               <span class="text-[#a6adc8]">Maintainability Index</span>
               <span id="maintainabilityScore" class="font-bold text-[#a6e3a1]">100/100</span>
             </div>
             <div class="w-full bg-[#313244] h-2 rounded-full overflow-hidden">
               <div id="maintainabilityBar" class="bg-[#a6e3a1] h-full transition-all duration-500" style="width: 100%"></div>
             </div>
           </div>
           <div class="space-y-1">
             <div class="flex justify-between text-[11px]">
               <span class="text-[#a6adc8]">Security Health</span>
               <span id="securityScore" class="font-bold text-[#a6e3a1]">Excellent</span>
             </div>
             <div class="w-full bg-[#313244] h-2 rounded-full overflow-hidden">
               <div id="securityBar" class="bg-[#a6e3a1] h-full transition-all duration-500" style="width: 100%"></div>
             </div>
           </div>
         </div>

         <div class="grid grid-cols-2 gap-2">
           <div class="bg-[#181825] p-3 rounded-lg border border-[#313244]">
             <div class="text-[10px] uppercase text-[#a6adc8]">Cyclomatic Complexity</div>
             <div id="complexityMetric" class="text-lg font-bold text-white mt-1">1</div>
           </div>
           <div class="bg-[#181825] p-3 rounded-lg border border-[#313244]">
             <div class="text-[10px] uppercase text-[#a6adc8]">Unused Variables</div>
             <div id="deadCodeMetric" class="text-lg font-bold text-white mt-1">0</div>
           </div>
         </div>

         <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
           <h4 class="text-xs font-bold text-white uppercase tracking-wider">Physical Workspace Payload</h4>
           <div class="grid grid-cols-2 gap-2 text-[11px]">
             <div class="text-[#a6adc8]">Lines Count: <span id="metricLines" class="text-white font-mono">0</span></div>
             <div class="text-[#a6adc8]">Byte Size: <span id="metricSize" class="text-white font-mono">0 B</span></div>
             <div class="text-[#a6adc8]">Total Chars: <span id="metricChars" class="text-white font-mono">0</span></div>
             <div class="text-[#a6adc8]">Est. Tokens: <span id="metricTokens" class="text-white font-mono">0</span></div>
           </div>
         </div>
       </div>

       <!-- Tab: Priority Matrix -->
       <div id="tabMatrix" class="space-y-3 hidden matrix-console-wrapper">
         <div class="flex gap-2">
           <input type="text" id="task-text-input" class="flex-1 bg-[#050505] border border-[#222] rounded p-2 text-xs text-white" placeholder="Add task..." onkeydown="if(event.key === 'Enter') addTask()" />
           <select id="task-quadrant-input" class="bg-[#141414] border border-[#222] rounded p-1 text-[11px] text-white">
             <option value="q1">Q1 (Do)</option>
             <option value="q2">Q2 (Schedule)</option>
             <option value="q3">Q3 (Delegate)</option>
             <option value="q4">Q4 (Eliminate)</option>
           </select>
           <button class="bg-[#222] hover:bg-white hover:text-black text-white text-xs px-2 rounded" onclick="addTask()">Add</button>
         </div>

         <div class="space-y-2">
           <div class="quadrant quadrant-q1 bg-[#141414] border border-[#222] rounded p-2">
             <div class="quadrant-header flex justify-between font-bold text-[10px]"><span>Q1 // CRITICAL</span><span>[DO]</span></div>
             <div id="q1-list" class="space-y-1 mt-1"><div class="text-[10px] text-[#555] italic">No items queued.</div></div>
           </div>
           <div class="quadrant quadrant-q2 bg-[#141414] border border-[#222] rounded p-2">
             <div class="quadrant-header flex justify-between font-bold text-[10px]"><span>Q2 // STRATEGIC</span><span>[SCHEDULE]</span></div>
             <div id="q2-list" class="space-y-1 mt-1"><div class="text-[10px] text-[#555] italic">No items queued.</div></div>
           </div>
           <div class="quadrant quadrant-q3 bg-[#141414] border border-[#222] rounded p-2">
             <div class="quadrant-header flex justify-between font-bold text-[10px]"><span>Q3 // OPERATIONAL</span><span>[DELEGATE]</span></div>
             <div id="q3-list" class="space-y-1 mt-1"><div class="text-[10px] text-[#555] italic">No items queued.</div></div>
           </div>
           <div class="quadrant quadrant-q4 bg-[#141414] border border-[#222] rounded p-2">
             <div class="quadrant-header flex justify-between font-bold text-[10px]"><span>Q4 // TRIVIAL</span><span>[ELIMINATE]</span></div>
             <div id="q4-list" class="space-y-1 mt-1"><div class="text-[10px] text-[#555] italic">No items queued.</div></div>
           </div>
         </div>
       </div>

       <!-- Tab 2: Diagnostics -->
       <div id="tabIssues" class="space-y-4 hidden">
         <div class="bg-[#181825] border border-[#313244] rounded-lg p-3">
           <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
             <i data-lucide="shield-alert" class="w-4 h-4 text-[#f38ba8]"></i> Static Analysis Audit
           </h3>
           <div id="diagnosticLogs" class="space-y-2"></div>
         </div>
       </div>

       <!-- Tab 3: AST -->
       <div id="tabAst" class="space-y-4 hidden">
         <div class="bg-[#181825] border border-[#313244] rounded-lg p-3">
           <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
             <i data-lucide="layers" class="w-4 h-4 text-[#a6e3a1]"></i> AST Tree Map
           </h3>
           <div id="astTree" class="space-y-2 text-xs code-font"></div>
         </div>
       </div>

       <!-- Tab 4: Live TypeScript Compiler Output Preview -->
       <div id="tabCompiler" class="space-y-3 hidden h-full flex flex-col">
         <div class="flex items-center justify-between">
           <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
             <i data-lucide="play" class="w-4 h-4 text-[#a6e3a1]"></i> TS Transpiled Output Sandbox
           </h3>
           <button id="triggerBuildBtn" class="bg-[#3178c6] text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 hover:bg-[#89b4fa] hover:text-[#11111b] transition-colors">
             <i data-lucide="refresh-cw" class="w-3 h-3"></i> Transpile & Run
           </button>
         </div>
         <div class="bg-[#11111b] border border-[#313244] rounded p-2 text-[10px] font-mono text-[#a6adc8] space-y-1 select-text">
           <div><span class="text-blue-400 font-bold">[TS TRANSPIATION ENGINE]</span> Babel standalone ready.</div>
           <div id="compilerLogs" class="text-white">Ready to compile TypeScript file hierarchy.</div>
         </div>
         <div class="flex-1 bg-white rounded-lg border-2 border-[#45475a] overflow-hidden min-h-[170px] flex flex-col relative">
           <div class="bg-[#313244] text-[10px] px-3 py-1 flex items-center justify-between text-white font-semibold">
             <span>Dynamic Transpiled Execution View</span>
             <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
           </div>
           <iframe id="compiledSandboxFrame" class="w-full flex-1 bg-white border-none" sandbox="allow-scripts"></iframe>
         </div>

         <!-- Dedicated Real-time Console Output Terminal -->
         <div class="bg-[#0f0f17] border border-[#313244] rounded-lg overflow-hidden flex flex-col h-44 shrink-0 font-mono">
           <div class="bg-[#181825] px-3 py-1.5 border-b border-[#313244] flex items-center justify-between text-[11px]">
             <div class="flex items-center gap-2 text-[#cdd6f4] font-bold">
               <i data-lucide="terminal" class="w-3.5 h-3.5 text-[#89b4fa]"></i>
               <span>Console Output</span>
               <span id="terminalCountBadge" class="bg-[#313244] text-[#a6adc8] text-[9px] px-1.5 py-0.2 rounded-full font-semibold">0 logs</span>
             </div>
             <div class="flex items-center gap-2">
               <button id="clearTerminalBtn" class="text-[#a6adc8] hover:text-white text-[10px] px-2 py-0.5 rounded hover:bg-[#313244] transition-colors flex items-center gap-1" title="Clear console">
                 <i data-lucide="trash-2" class="w-3 h-3"></i> Clear
               </button>
             </div>
           </div>
           <div id="terminalBody" class="flex-1 overflow-y-auto p-2 space-y-1 text-[11px] leading-relaxed select-text">
             <div class="text-[#585b70] italic text-[10px]">// Console output stream will appear here in real-time...</div>
           </div>
         </div>
       </div>

       <!-- Tab 5: Unit Test Runner -->
       <div id="tabTests" class="space-y-3 hidden flex-1 flex flex-col">
         <div class="flex items-center justify-between">
           <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
             <i data-lucide="test-tube" class="w-4 h-4 text-[#a6e3a1]"></i> Unit Test Runner
           </h3>
           <div class="flex items-center gap-2">
             <button id="toggleTestEditorBtn" class="bg-[#313244] hover:bg-[#45475a] text-white text-[10px] px-2 py-1 rounded transition-colors flex items-center gap-1">
               <i data-lucide="edit" class="w-3 h-3 text-[#f9e2af]"></i> Specs Editor
             </button>
             <button id="runTestsBtn" class="bg-[#a6e3a1] hover:bg-[#89dceb] text-[#11111b] text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 transition-colors">
               <i data-lucide="play" class="w-3 h-3"></i> Run Tests
             </button>
           </div>
         </div>

         <!-- Test Summary Stats -->
         <div class="bg-[#181825] border border-[#313244] rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
           <div class="flex items-center gap-2.5">
             <div id="testStatusIcon" class="w-7 h-7 rounded-full bg-[#313244] flex items-center justify-center text-[#a6adc8] shrink-0">
               <i data-lucide="check" class="w-4 h-4"></i>
             </div>
             <div>
               <div id="testSummaryText" class="font-bold text-white text-xs">Ready to run tests</div>
               <div id="testDurationText" class="text-[10px] text-[#a6adc8]">describe / it assertions</div>
             </div>
           </div>
           <div class="flex items-center gap-1.5 text-[10px]">
             <span id="testPassedBadge" class="bg-[#a6e3a1]/20 text-[#a6e3a1] px-1.5 py-0.5 rounded font-bold">0 Pass</span>
             <span id="testFailedBadge" class="bg-[#f38ba8]/20 text-[#f38ba8] px-1.5 py-0.5 rounded font-bold">0 Fail</span>
           </div>
         </div>

         <!-- Test Code Editor (Collapsible) -->
         <div id="testEditorContainer" class="hidden flex-col space-y-1.5 bg-[#11111b] border border-[#313244] rounded-lg p-2.5">
           <div class="flex items-center justify-between text-[10px] text-[#a6adc8]">
             <span class="font-semibold uppercase tracking-wider">Test Suite Script (describe / it)</span>
             <button id="resetDefaultTestsBtn" class="text-[#89b4fa] hover:underline cursor-pointer">Reset Default Specs</button>
           </div>
           <textarea id="testSuiteCode" rows="9" class="w-full bg-[#181825] border border-[#313244] rounded p-2 text-[11px] font-mono text-[#cdd6f4] focus:outline-none resize-none whitespace-pre leading-relaxed" spellcheck="false"></textarea>
         </div>

         <!-- Test Results List -->
         <div class="flex-1 bg-[#181825] border border-[#313244] rounded-lg p-3 overflow-y-auto space-y-2 text-xs font-mono">
           <div id="testResultsOutput" class="space-y-2">
             <div class="text-[#585b70] italic text-xs">// Click "Run Tests" to execute unit assertions against active workspace functions...</div>
           </div>
         </div>
       </div>

     </div>

     <div class="p-4 bg-[#11111b] border-t border-[#313244] space-y-2 shrink-0">
       <button id="minifyBtn" class="w-full bg-[#313244] hover:bg-[#45475a] text-white py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all">
         <i data-lucide="minimize-2" class="w-4 h-4"></i> Safe-Minify Active Buffer
       </button>
     </div>
   </section>
 </div>

 <script>
   const defaultFiles = [
     {
       id: "index-ts",
       name: "index.ts",
       language: "typescript",
       content: \`// Workspace TypeScript Entry Point\\ninterface CalculationResult {\\n  value: number;\\n  status: string;\\n}\\n\\nfunction runHeavyMath(payload: boolean): CalculationResult {\\n  let result: number = 0;\\n  if (payload) {\\n    for (let i = 1; i <= 10; i++) {\\n      result += (i * i);\\n    }\\n  }\\n  return { value: result, status: "Success" };\\n}\\n\\nfunction renderHtml(userInput: string): void {\\n  const outputContainer = document.getElementById("output");\\n  if (outputContainer) {\\n    outputContainer.textContent = userInput;\\n  }\\n}\\n\\ndocument.addEventListener("DOMContentLoaded", () => {\\n  const calcBtn = document.getElementById("calcBtn");\\n  if (calcBtn) {\\n    calcBtn.addEventListener("click", () => {\\n      const mathRes: CalculationResult = runHeavyMath(true);\\n      renderHtml(\\\`Computation Result (\${mathRes.status}): \${mathRes.value}\\\`);\\n    });\\n  }\\n});\`
     },
     {
       id: "index-html",
       name: "index.html",
       language: "html",
       content: \`<!DOCTYPE html>\\n<html>\\n<head>\\n  <meta charset="utf-8">\\n  <title>Security Check Sandbox</title>\\n</head>\\n<body>\\n  <div id="output">Rendering incoming data...</div>\\n  <button id="calcBtn">Activate TypeScript</button>\\n</body>\\n</html>\`
     }
   ];

   const defaultTestSuite = \`describe("Math Calculation Suite", () => {
  it("computes heavy math correctly for truthy payload", () => {
    const res = runHeavyMath(true);
    expect(res.value).toBe(385);
    expect(res.status).toBe("Success");
  });

  it("returns 0 for falsy payload", () => {
    const res = runHeavyMath(false);
    expect(res.value).toBe(0);
    expect(res.status).toBe("Success");
  });

  it("yields calculation greater than 100", () => {
    const res = runHeavyMath(true);
    expect(res.value).toBeGreaterThan(100);
  });
});

describe("Runtime & Helper Assertions", () => {
  it("verifies runHeavyMath is defined as a function", () => {
    expect(typeof runHeavyMath).toBe("function");
  });

  it("verifies basic collection integrity", () => {
    expect([1, 2, 3]).toContain(2);
    expect("Success").toContain("ucc");
  });
});\`;

   const AppState = {
     virtualFiles: [],
     currentFileIndex: 0,
     daemonTimer: null,
     typingDebounceTimeout: null,
     saveDebounceTimeout: null,
     terminalLogCount: 0,
     apiKey: localStorage.getItem('gemini_api_key') || '',

     selectors: {
       fileListEl: document.getElementById('fileList'),
       currentFileNameEl: document.getElementById('currentFileName'),
       fileLanguageEl: document.getElementById('fileLanguage'),
       editorEl: document.getElementById('editor'),
       lineNumbersEl: document.getElementById('lineNumbers'),
       saveIndicator: document.getElementById('saveIndicator'),
       bgMonitorToggle: document.getElementById('bgMonitorToggle'),
       statusPulse: document.getElementById('statusPulse'),
       statusText: document.getElementById('statusText'),
       tabAiBtn: document.getElementById('tabAiBtn'),
       tabDashboardBtn: document.getElementById('tabDashboardBtn'),
       tabMatrixBtn: document.getElementById('tabMatrixBtn'),
       tabIssuesBtn: document.getElementById('tabIssuesBtn'),
       tabAstBtn: document.getElementById('tabAstBtn'),
       tabCompilerBtn: document.getElementById('tabCompilerBtn'),
       tabTestsBtn: document.getElementById('tabTestsBtn'),
       tabAi: document.getElementById('tabAi'),
       tabDashboard: document.getElementById('tabDashboard'),
       tabMatrix: document.getElementById('tabMatrix'),
       tabIssues: document.getElementById('tabIssues'),
       tabAst: document.getElementById('tabAst'),
       tabCompiler: document.getElementById('tabCompiler'),
       tabTests: document.getElementById('tabTests'),
       runTestsBtn: document.getElementById('runTestsBtn'),
       toggleTestEditorBtn: document.getElementById('toggleTestEditorBtn'),
       resetDefaultTestsBtn: document.getElementById('resetDefaultTestsBtn'),
       testSuiteCode: document.getElementById('testSuiteCode'),
       testStatusIcon: document.getElementById('testStatusIcon'),
       testSummaryText: document.getElementById('testSummaryText'),
       testDurationText: document.getElementById('testDurationText'),
       testPassedBadge: document.getElementById('testPassedBadge'),
       testFailedBadge: document.getElementById('testFailedBadge'),
       testResultsOutput: document.getElementById('testResultsOutput'),
       testEditorContainer: document.getElementById('testEditorContainer'),
       exportWorkspaceBtn: document.getElementById('exportWorkspaceBtn'),
       importWorkspaceBtn: document.getElementById('importWorkspaceBtn'),
       importFileInput: document.getElementById('importFileInput'),
       clearTerminalBtn: document.getElementById('clearTerminalBtn'),
       terminalBody: document.getElementById('terminalBody'),
       terminalCountBadge: document.getElementById('terminalCountBadge'),
       triggerBuildBtn: document.getElementById('triggerBuildBtn'),
       compilerLogs: document.getElementById('compilerLogs'),
       compiledSandboxFrame: document.getElementById('compiledSandboxFrame'),
       maintainabilityScore: document.getElementById('maintainabilityScore'),
       maintainabilityBar: document.getElementById('maintainabilityBar'),
       securityScore: document.getElementById('securityScore'),
       securityBar: document.getElementById('securityBar'),
       complexityMetric: document.getElementById('complexityMetric'),
       deadCodeMetric: document.getElementById('deadCodeMetric'),
       metricLines: document.getElementById('metricLines'),
       metricChars: document.getElementById('metricChars'),
       metricTokens: document.getElementById('metricTokens'),
       metricSize: document.getElementById('metricSize'),
       diagnosticLogs: document.getElementById('diagnosticLogs'),
       astTree: document.getElementById('astTree'),
       formatBtn: document.getElementById('formatBtn'),
       analyzeBtn: document.getElementById('analyzeBtn'),
       minifyBtn: document.getElementById('minifyBtn'),
       addFileBtn: document.getElementById('addFileBtn'),
       quickAddContainer: document.getElementById('quickAddContainer'),
       newFileInput: document.getElementById('newFileInput'),
       confirmAddFileBtn: document.getElementById('confirmAddFileBtn')
     }
   };

   function createNewFile(filename) {
     if (!filename || !filename.trim()) return;
     const cleanName = filename.trim();
     if (AppState.virtualFiles.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
       alert("A file with that name already exists.");
       return;
     }
     const ext = cleanName.split('.').pop().toLowerCase();
     let language = 'javascript';
     if (ext === 'html' || ext === 'htm') language = 'html';
     else if (ext === 'ts' || ext === 'tsx') language = 'typescript';
     else if (ext === 'css') language = 'css';

     AppState.virtualFiles.push({
       id: \`file-\${Date.now()}\`,
       name: cleanName,
       language: language,
       content: language === 'typescript' ? \`// Workspace TypeScript file: \${cleanName}\\n\` : language === 'css' ? \`/* Workspace Stylesheet: \${cleanName} */\\nbody {\\n  background-color: #111;\\n  color: #fff;\\n}\\n\` : \`// Workspace file: \${cleanName}\\n\`
     });
     debounceSaveToLocalStorage();
     renderFileList();
     loadFile(AppState.virtualFiles.length - 1);
   }

   function updateApiKeyUI() {
     const keyInput = document.getElementById('apiKeyInput');
     const removeBtn = document.getElementById('removeKeyBtn');
     if (!keyInput || !removeBtn) return;

     if (AppState.apiKey) {
       keyInput.value = '••••••••••••••••••••';
       removeBtn.classList.remove('hidden');
     } else {
       keyInput.value = '';
       removeBtn.classList.add('hidden');
     }
   }

   async function callGeminiApi(promptText) {
     if (!AppState.apiKey) {
       alert('Please enter a Gemini API key first.');
       return null;
     }

     const activeFile = AppState.virtualFiles[AppState.currentFileIndex];
     const statusEl = document.getElementById('aiStatus');
     if (statusEl) statusEl.classList.remove('hidden');

     const payload = {
       contents: [{
         parts: [{
           text: \`You are an expert TypeScript developer assistant inside Code Inspector Pro.\\nCurrent File Name: \${activeFile.name}\\nLanguage: \${activeFile.language}\\n\\nCurrent File Content:\\n\\\`\\\`\\\`\${activeFile.language}\\n\${activeFile.content}\\n\\\`\\\`\\\`\\n\\nTask: \${promptText}\\n\\nReturn ONLY the updated code without markdown code blocks or explanations so it can be directly injected into the editor.\`
         }]
       }]
     };

     try {
       const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${AppState.apiKey}\`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
       });

       const data = await response.json();
       if (statusEl) statusEl.classList.add('hidden');

       if (data.candidates && data.candidates[0].content.parts[0].text) {
         let cleanedCode = data.candidates[0].content.parts[0].text.trim();
         cleanedCode = cleanedCode.replace(/^\\\`\\\`\\\`[a-z]*\\n/i, '').replace(/\\n\\\`\\\`\\\`$/, '');
         return cleanedCode;
       } else {
         throw new Error(data.error?.message || 'Invalid API response');
       }
     } catch (err) {
       if (statusEl) statusEl.classList.add('hidden');
       alert('Gemini API Error: ' + err.message);
       return null;
     }
   }

   function init() {
     loadVirtualWorkspace();
     renderFileList();
     loadFile(AppState.currentFileIndex);
     setupListeners();
     updateApiKeyUI();
     if (AppState.selectors.testSuiteCode) {
       AppState.selectors.testSuiteCode.value = defaultTestSuite;
     }
     lucide.createIcons();
     startBackgroundDaemon();
   }

   function loadVirtualWorkspace() {
     try {
       const rawData = localStorage.getItem('code_inspector_files_v4_ts');
       if (rawData) {
         const parsed = JSON.parse(rawData);
         if (Array.isArray(parsed) && parsed.length > 0) {
           AppState.virtualFiles = parsed;
           return;
         }
       }
     } catch (error) {
       console.error("Local storage error parsing workspace payload.", error);
     }
     AppState.virtualFiles = JSON.parse(JSON.stringify(defaultFiles));
   }

   function loadFile(index) {
     if (AppState.virtualFiles.length === 0) {
       AppState.virtualFiles = JSON.parse(JSON.stringify(defaultFiles));
     }
     if (index < 0 || index >= AppState.virtualFiles.length) index = 0;
     
     AppState.currentFileIndex = index;
     const file = AppState.virtualFiles[index];
     
     AppState.selectors.editorEl.value = file.content;
     AppState.selectors.currentFileNameEl.textContent = file.name;
     AppState.selectors.fileLanguageEl.textContent = file.language;

     document.querySelectorAll('.file-item-btn').forEach((btn, idx) => {
       if (idx === index) {
         btn.classList.add('bg-[#313244]', 'text-white');
         btn.classList.remove('text-[#a6adc8]');
       } else {
         btn.classList.remove('bg-[#313244]', 'text-white');
         btn.classList.add('text-[#a6adc8]');
       }
     });

     updateLineNumbers();
     runAnalysisSuite();
   }

   function renderFileList() {
     AppState.selectors.fileListEl.innerHTML = '';
     AppState.virtualFiles.forEach((file, idx) => {
       const itemContainer = document.createElement('div');
       itemContainer.className = "group flex items-center justify-between w-full px-2 py-1.5 rounded-md transition-all hover:bg-[#1e1e2e]/60";
       
       let icon = 'file-text';
       if (file.language === 'html') icon = 'file-code';
       if (file.language === 'javascript') icon = 'file-json';
       if (file.language === 'typescript') icon = 'file-type-2';
       if (file.language === 'css') icon = 'file-type-2';

       const isActive = idx === AppState.currentFileIndex;

       itemContainer.innerHTML = \`
         <button class="file-item-btn flex-1 flex items-center gap-2 text-left text-xs truncate py-1 px-1 rounded transition-all \${isActive ? 'text-white font-medium bg-[#313244]' : 'text-[#a6adc8] hover:text-white'}" data-index="\${idx}">
           <i data-lucide="\${icon}" class="w-4 h-4 shrink-0 \${file.language === 'typescript' ? 'text-[#3178c6]' : 'text-[#89b4fa]'}"></i>
           <span class="truncate">\${file.name}</span>
         </button>
         <div class="hidden group-hover:flex items-center gap-1.5 shrink-0 ml-2 px-1">
           <button class="rename-file-btn text-[#a6adc8] hover:text-[#f9e2af] transition-colors p-0.5" title="Rename File" data-index="\${idx}"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
           <button class="delete-file-btn text-[#a6adc8] hover:text-[#f38ba8] transition-colors p-0.5" title="Delete File" data-index="\${idx}"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
         </div>
       \`;

       itemContainer.querySelector('.file-item-btn').addEventListener('click', () => loadFile(idx));
       itemContainer.querySelector('.rename-file-btn').addEventListener('click', (e) => { e.stopPropagation(); renameFile(idx); });
       itemContainer.querySelector('.delete-file-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteFile(idx); });

       AppState.selectors.fileListEl.appendChild(itemContainer);
     });
     lucide.createIcons({ node: AppState.selectors.fileListEl });
   }

   function renameFile(idx) {
     const file = AppState.virtualFiles[idx];
     let newName = prompt(\`Rename \${file.name} to:\`, file.name);
     if (!newName || newName.trim() === "" || newName === file.name) return;

     const isDuplicate = AppState.virtualFiles.some((f, i) => i !== idx && f.name.toLowerCase() === newName.toLowerCase());
     if (isDuplicate) {
       alert("Error: A file with that name already exists.");
       return;
     }

     const ext = newName.split('.').pop().toLowerCase();
     let language = 'javascript';
     if (ext === 'html' || ext === 'htm') language = 'html';
     else if (ext === 'ts' || ext === 'tsx') language = 'typescript';
     else if (ext === 'css') language = 'css';

     file.name = newName;
     file.language = language;

     debounceSaveToLocalStorage();
     renderFileList();
     loadFile(AppState.currentFileIndex);
   }

   function deleteFile(idx) {
     if (AppState.virtualFiles.length <= 1) {
       alert("Workspace Constraint: You must keep at least one sandbox file.");
       return;
     }
     const file = AppState.virtualFiles[idx];
     if (!confirm(\`Are you sure you want to delete "\${file.name}"?\`)) return;

     AppState.virtualFiles.splice(idx, 1);
     AppState.currentFileIndex = Math.max(0, AppState.currentFileIndex - 1);

     debounceSaveToLocalStorage();
     renderFileList();
     loadFile(AppState.currentFileIndex);
   }

   function debounceSaveToLocalStorage() {
     clearTimeout(AppState.saveDebounceTimeout);
     AppState.saveDebounceTimeout = setTimeout(() => {
       try {
         localStorage.setItem('code_inspector_files_v4_ts', JSON.stringify(AppState.virtualFiles));
         AppState.selectors.saveIndicator.classList.remove('hidden');
         AppState.selectors.saveIndicator.classList.add('flex');
         setTimeout(() => {
           AppState.selectors.saveIndicator.classList.remove('flex');
           AppState.selectors.saveIndicator.classList.add('hidden');
         }, 1000);
       } catch (e) {
         console.error("Could not serialize workspace state.", e);
       }
     }, 750);
   }

   function exportWorkspaceJSON() {
     try {
       const exportData = {
         version: "4.6",
         exportedAt: new Date().toISOString(),
         files: AppState.virtualFiles
       };
       const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
       const downloadAnchor = document.createElement("a");
       downloadAnchor.setAttribute("href", dataStr);
       downloadAnchor.setAttribute("download", \`workspace-backup-\${Date.now()}.json\`);
       document.body.appendChild(downloadAnchor);
       downloadAnchor.click();
       downloadAnchor.remove();
       setDaemonStatus("saved", "Workspace Exported");
       setTimeout(() => setDaemonStatus("idle", "Daemon: Watching"), 2000);
     } catch (err) {
       alert("Export failed: " + err.message);
     }
   }

   function importWorkspaceJSON(event) {
     const file = event.target.files && event.target.files[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = (e) => {
       try {
         const parsed = JSON.parse(e.target.result);
         let importedFiles = null;
         if (Array.isArray(parsed)) {
           importedFiles = parsed;
         } else if (parsed && Array.isArray(parsed.files)) {
           importedFiles = parsed.files;
         }
         if (importedFiles && importedFiles.length > 0 && importedFiles[0].name && typeof importedFiles[0].content === 'string') {
           AppState.virtualFiles = importedFiles;
           AppState.currentFileIndex = 0;
           debounceSaveToLocalStorage();
           renderFileList();
           loadFile(0);
           setDaemonStatus("saved", "Workspace Imported");
           setTimeout(() => setDaemonStatus("idle", "Daemon: Watching"), 2000);
         } else {
           alert("Invalid workspace format: Expected an array or { files: [...] } with valid file objects.");
         }
       } catch (err) {
         alert("Failed to parse JSON file: " + err.message);
       }
     };
     reader.readAsText(file);
     event.target.value = '';
   }

   function appendTerminalLog(level, text, time) {
     if (!AppState.selectors.terminalBody) return;
     const placeholder = AppState.selectors.terminalBody.querySelector('.italic');
     if (placeholder) placeholder.remove();

     AppState.terminalLogCount = (AppState.terminalLogCount || 0) + 1;
     if (AppState.selectors.terminalCountBadge) {
       AppState.selectors.terminalCountBadge.textContent = \`\${AppState.terminalLogCount} logs\`;
     }

     let badgeClass = "bg-[#89b4fa]/20 text-[#89b4fa]";
     let badgeLabel = "LOG";
     if (level === 'warn') { badgeClass = "bg-[#f9e2af]/20 text-[#f9e2af]"; badgeLabel = "WARN"; }
     else if (level === 'error') { badgeClass = "bg-[#f38ba8]/20 text-[#f38ba8]"; badgeLabel = "ERROR"; }
     else if (level === 'info') { badgeClass = "bg-[#a6e3a1]/20 text-[#a6e3a1]"; badgeLabel = "INFO"; }

     const safeText = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
     const row = document.createElement('div');
     row.className = "flex items-start gap-1.5 py-0.5 border-b border-[#313244]/40 font-mono text-[11px]";
     row.innerHTML = \`
       <span class="text-[9px] text-[#585b70] shrink-0 pt-0.5">\${time || ''}</span>
       <span class="px-1 rounded text-[9px] font-bold shrink-0 \${badgeClass}">\${badgeLabel}</span>
       <span class="text-[#cdd6f4] break-all leading-tight">\${safeText}</span>
     \`;
     AppState.selectors.terminalBody.appendChild(row);
     AppState.selectors.terminalBody.scrollTop = AppState.selectors.terminalBody.scrollHeight;
   }

   function clearTerminalLogs() {
     AppState.terminalLogCount = 0;
     if (AppState.selectors.terminalCountBadge) {
       AppState.selectors.terminalCountBadge.textContent = "0 logs";
     }
     AppState.selectors.terminalBody.innerHTML = '<div class="text-[#585b70] italic text-[10px]">// Console output stream will appear here in real-time...</div>';
   }

   function compileWorkspace() {
     AppState.selectors.compilerLogs.textContent = "Booting TypeScript Babel Transpiler...";
     const htmlFile = AppState.virtualFiles.find(f => f.name.endsWith('.html'));
     const cssFile = AppState.virtualFiles.find(f => f.name.endsWith('.css'));
     const codeFile = AppState.virtualFiles.find(f => f.name.endsWith('.ts') || f.name.endsWith('.js'));

     if (!htmlFile) {
       AppState.selectors.compilerLogs.innerHTML = \`<span class="text-red-400">ERROR: Compilation failed. No HTML file found in workspace root.</span>\`;
       return;
     }

     AppState.selectors.compilerLogs.innerHTML = \`<div>Transpiling TypeScript to ES6 JavaScript...</div>\`;

     const startTimeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
     appendTerminalLog('info', \`--- TS Transpilation & Execution Started [\${startTimeStr}] ---\`, startTimeStr);

     setTimeout(() => {
       try {
         let rawHtml = htmlFile.content;
         const cssContent = cssFile ? cssFile.content : '';
         let jsContent = '';

         if (codeFile) {
           if (codeFile.language === 'typescript' || codeFile.name.endsWith('.ts')) {
             if (window.Babel) {
               jsContent = window.Babel.transform(codeFile.content, {
                 presets: ['typescript', 'env'],
                 filename: codeFile.name
               }).code;
             } else {
               jsContent = codeFile.content.replace(/:\s*[\w<>\[\]]+(?=[=,;\)\n{])/g, '');
             }
           } else {
             jsContent = codeFile.content;
           }
         }

         const consoleBridge = \`<script>
(function() {
  function formatArg(a) {
    if (a === null) return 'null';
    if (a === undefined) return 'undefined';
    if (typeof a === 'object') {
      try { return JSON.stringify(a); } catch(e) { return String(a); }
    }
    return String(a);
  }
  function send(level, args) {
    try {
      var msg = Array.from(args).map(formatArg).join(' ');
      var time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      window.parent.postMessage({ type: 'CONSOLE_STREAM', level: level, text: msg, time: time }, '*');
    } catch(e) {}
  }
  var _log = console.log, _warn = console.warn, _error = console.error, _info = console.info;
  console.log = function() { _log.apply(console, arguments); send('log', arguments); };
  console.warn = function() { _warn.apply(console, arguments); send('warn', arguments); };
  console.error = function() { _error.apply(console, arguments); send('error', arguments); };
  console.info = function() { _info.apply(console, arguments); send('info', arguments); };
  window.addEventListener('error', function(err) {
    send('error', [err.message + (err.filename ? ' (' + err.filename + ':' + err.lineno + ')' : '')]);
  });
})();
<\/script>\`;

         const compiledStyles = \`<style>\n\${cssContent}\n</style>\`;
         rawHtml = /<head[^>]*>/i.test(rawHtml) ? rawHtml.replace(/(<head[^>]*>)/i, \`$1\n\${consoleBridge}\n\${compiledStyles}\`) : consoleBridge + compiledStyles + rawHtml;

         const compiledScript = \`<script>\n\${jsContent}\n<\/script>\`;
         rawHtml = /<\/body>/i.test(rawHtml) ? rawHtml.replace(/(<\/body>)/i, \`\${compiledScript}\n$1\`) : rawHtml + compiledScript;

         const blob = new Blob([rawHtml], { type: 'text/html' });
         AppState.selectors.compiledSandboxFrame.setAttribute('sandbox', 'allow-scripts');
         AppState.selectors.compiledSandboxFrame.src = URL.createObjectURL(blob);

         AppState.selectors.compilerLogs.innerHTML = \`
           <div class="text-green-400">⚡ Transpiled & Compiled Successfully!</div>
           <div class="text-[#89b4fa]">> Bundled HTML (\${htmlFile.content.length} Bytes)</div>
           <div class="text-[#3178c6]">> Transpiled \${codeFile ? codeFile.name : 'JS/TS'} to standard ES6 JS</div>
           <div class="text-[#89b4fa]">> Injected CSS Styles (\${cssContent.length} Bytes)</div>
         \`;
       } catch (err) {
         AppState.selectors.compilerLogs.innerHTML = \`<span class="text-red-400">TYPESCRIPT COMPILER EXCEPTION: \${err.message}</span>\`;
         appendTerminalLog('error', \`Compiler Exception: \${err.message}\`);
       }
     }, 300);
   }

   function executeTestSuite(userTestCode) {
     const suites = [];
     let currentSuite = null;

     function describe(name, fn) {
       const suite = { name, tests: [], error: null };
       suites.push(suite);
       const prevSuite = currentSuite;
       currentSuite = suite;
       try {
         fn();
       } catch (err) {
         suite.error = err.message || String(err);
       }
       currentSuite = prevSuite;
     }

     function it(name, fn) {
       const test = { name, passed: false, error: null, duration: 0 };
       if (currentSuite) currentSuite.tests.push(test);
       const t0 = performance.now();
       try {
         fn();
         test.passed = true;
       } catch (err) {
         test.passed = false;
         test.error = err.message || String(err);
       }
       test.duration = Math.round((performance.now() - t0) * 100) / 100;
     }

     function expect(actual) {
       return {
         toBe(expected) {
           if (actual !== expected) throw new Error("Expected " + JSON.stringify(expected) + ", received " + JSON.stringify(actual));
         },
         toEqual(expected) {
           if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Expected " + JSON.stringify(expected) + ", received " + JSON.stringify(actual));
         },
         toBeTruthy() {
           if (!actual) throw new Error("Expected truthy value, received " + JSON.stringify(actual));
         },
         toBeFalsy() {
           if (actual) throw new Error("Expected falsy value, received " + JSON.stringify(actual));
         },
         toBeGreaterThan(val) {
           if (actual <= val) throw new Error("Expected " + actual + " to be greater than " + val);
         },
         toBeLessThan(val) {
           if (actual >= val) throw new Error("Expected " + actual + " to be less than " + val);
         },
         toContain(item) {
           if (!Array.isArray(actual) && typeof actual !== 'string') throw new Error("Expected array or string, received " + typeof actual);
           if (!actual.includes(item)) throw new Error("Expected collection to contain " + JSON.stringify(item));
         },
         toThrow() {
           if (typeof actual !== 'function') throw new Error("Expected function");
           let threw = false;
           try { actual(); } catch(e) { threw = true; }
           if (!threw) throw new Error("Expected function to throw error");
         }
       };
     }

     let workspaceJs = '';
     AppState.virtualFiles.forEach(f => {
       if (f.name.endsWith('.ts') || f.name.endsWith('.js')) {
         if (f.language === 'typescript' || f.name.endsWith('.ts')) {
           try {
             if (window.Babel) {
               workspaceJs += window.Babel.transform(f.content, { presets: ['typescript', 'env'], filename: f.name }).code + '\n';
             } else {
               workspaceJs += f.content.replace(/:\s*[\w<>\[\]]+(?=[=,;\)\n{])/g, '') + '\n';
             }
           } catch(e) {
             workspaceJs += f.content + '\n';
           }
         } else {
           workspaceJs += f.content + '\n';
         }
       }
     });

     try {
       const fn = new Function('describe', 'it', 'expect', workspaceJs + '\n' + userTestCode);
       fn(describe, it, expect);
       return { suites, globalError: null };
     } catch (err) {
       return { suites, globalError: err.message || String(err) };
     }
   }

   function runTestSuite() {
     const code = AppState.selectors.testSuiteCode.value;
     AppState.selectors.testResultsOutput.innerHTML = '<div class="text-[#89b4fa] text-xs">Running assertions...</div>';

     const tStart = performance.now();
     const { suites, globalError } = executeTestSuite(code);
     const totalDuration = Math.round((performance.now() - tStart) * 100) / 100;

     if (globalError) {
       AppState.selectors.testStatusIcon.className = "w-7 h-7 rounded-full bg-[#f38ba8]/20 text-[#f38ba8] flex items-center justify-center shrink-0";
       AppState.selectors.testStatusIcon.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4"></i>';
       AppState.selectors.testSummaryText.textContent = "Syntax / Runtime Error";
       AppState.selectors.testDurationText.textContent = \`Failed in \${totalDuration}ms\`;
       AppState.selectors.testPassedBadge.textContent = "0 Pass";
       AppState.selectors.testFailedBadge.textContent = "1 Error";
       AppState.selectors.testResultsOutput.innerHTML = \`
         <div class="bg-[#f38ba8]/10 border border-[#f38ba8]/30 rounded p-2.5 text-[#f38ba8] text-xs">
           <div class="font-bold flex items-center gap-1.5"><i data-lucide="shield-alert" class="w-4 h-4"></i> Test Suite Error</div>
           <div class="mt-1 font-mono text-[11px]">\${globalError}</div>
         </div>
       \`;
       lucide.createIcons({ node: AppState.selectors.tabTests });
       return;
     }

     let totalTests = 0;
     let passedTests = 0;
     let failedTests = 0;

     AppState.selectors.testResultsOutput.innerHTML = '';

     suites.forEach(suite => {
       const suiteCard = document.createElement('div');
       suiteCard.className = "bg-[#11111b] border border-[#313244] rounded-md p-2.5 space-y-1.5";

       const suiteHeader = document.createElement('div');
       suiteHeader.className = "text-xs font-bold text-white flex items-center gap-1.5 border-b border-[#313244] pb-1";
       suiteHeader.innerHTML = \`<i data-lucide="folder-check" class="w-3.5 h-3.5 text-[#89b4fa]"></i> <span>describe("\${suite.name}")</span>\`;
       suiteCard.appendChild(suiteHeader);

       if (suite.error) {
         failedTests++;
         const errDiv = document.createElement('div');
         errDiv.className = "text-[#f38ba8] text-[11px] p-1.5 bg-[#f38ba8]/10 rounded";
         errDiv.textContent = "Suite Error: " + suite.error;
         suiteCard.appendChild(errDiv);
       }

       suite.tests.forEach(test => {
         totalTests++;
         if (test.passed) passedTests++;
         else failedTests++;

         const testRow = document.createElement('div');
         testRow.className = "text-[11px] flex flex-col pl-2 py-0.5";

         const titleRow = document.createElement('div');
         titleRow.className = "flex items-center justify-between";
         titleRow.innerHTML = \`
           <span class="\${test.passed ? 'text-[#a6e3a1]' : 'text-[#f38ba8]'} flex items-center gap-1 font-medium">
             <span>\${test.passed ? '✓' : '✗'}</span> it("\${test.name}")
           </span>
           <span class="text-[9px] text-[#585b70]">\${test.duration}ms</span>
         \`;
         testRow.appendChild(titleRow);

         if (!test.passed && test.error) {
           const errDetail = document.createElement('div');
           errDetail.className = "text-[#f38ba8] bg-[#f38ba8]/10 border border-[#f38ba8]/20 rounded p-1 mt-1 text-[10px] pl-3 font-mono";
           errDetail.textContent = "Assertion Error: " + test.error;
           testRow.appendChild(errDetail);
         }

         suiteCard.appendChild(testRow);
       });

       AppState.selectors.testResultsOutput.appendChild(suiteCard);
     });

     AppState.selectors.testPassedBadge.textContent = \`\${passedTests} Pass\`;
     AppState.selectors.testFailedBadge.textContent = \`\${failedTests} Fail\`;

     if (failedTests === 0 && totalTests > 0) {
       AppState.selectors.testStatusIcon.className = "w-7 h-7 rounded-full bg-[#a6e3a1]/20 text-[#a6e3a1] flex items-center justify-center shrink-0";
       AppState.selectors.testStatusIcon.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i>';
       AppState.selectors.testSummaryText.textContent = \`\${passedTests}/\${totalTests} Tests Passed (100%)\`;
       AppState.selectors.testDurationText.textContent = \`Completed in \${totalDuration}ms\`;
     } else {
       AppState.selectors.testStatusIcon.className = "w-7 h-7 rounded-full bg-[#f38ba8]/20 text-[#f38ba8] flex items-center justify-center shrink-0";
       AppState.selectors.testStatusIcon.innerHTML = '<i data-lucide="x-circle" class="w-4 h-4"></i>';
       AppState.selectors.testSummaryText.textContent = \`\${failedTests} Failed, \${passedTests} Passed\`;
       AppState.selectors.testDurationText.textContent = \`Completed in \${totalDuration}ms\`;
     }

     lucide.createIcons({ node: AppState.selectors.tabTests });
   }

   function setupListeners() {
     document.getElementById('saveKeyBtn')?.addEventListener('click', () => {
       const val = document.getElementById('apiKeyInput').value.trim();
       if (val && !val.startsWith('•••')) {
         AppState.apiKey = val;
         localStorage.setItem('gemini_api_key', val);
         alert('API Key saved!');
         updateApiKeyUI();
       }
     });

     document.getElementById('removeKeyBtn')?.addEventListener('click', () => {
       AppState.apiKey = '';
       localStorage.removeItem('gemini_api_key');
       updateApiKeyUI();
       alert('API Key removed permanently.');
     });

     document.getElementById('aiAskBtn')?.addEventListener('click', async () => {
       const prompt = document.getElementById('aiPromptInput').value.trim();
       if (!prompt) return;
       const result = await callGeminiApi(prompt);
       if (result) {
         AppState.selectors.editorEl.value = result;
         AppState.virtualFiles[AppState.currentFileIndex].content = result;
         updateLineNumbers();
         runAnalysisSuite();
         debounceSaveToLocalStorage();
       }
     });

     document.getElementById('aiAutoFixBtn')?.addEventListener('click', async () => {
       const autoFixPrompt = "Review this TypeScript code and automatically resolve any security risks, type errors, unused variables, or formatting issues found in static analysis.";
       const result = await callGeminiApi(autoFixPrompt);
       if (result) {
         AppState.selectors.editorEl.value = result;
         AppState.virtualFiles[AppState.currentFileIndex].content = result;
         updateLineNumbers();
         runAnalysisSuite();
         debounceSaveToLocalStorage();
       }
     });

     AppState.selectors.editorEl.addEventListener('input', () => {
       AppState.virtualFiles[AppState.currentFileIndex].content = AppState.selectors.editorEl.value;
       updateLineNumbers();
       triggerBackgroundDaemonPulse();
       debounceSaveToLocalStorage();
     });

     AppState.selectors.editorEl.addEventListener('scroll', () => {
       AppState.selectors.lineNumbersEl.scrollTop = AppState.selectors.editorEl.scrollTop;
     });

     AppState.selectors.editorEl.addEventListener('keydown', (e) => {
       if (e.key === 'Tab') {
         e.preventDefault();
         const start = AppState.selectors.editorEl.selectionStart;
         const end = AppState.selectors.editorEl.selectionEnd;
         const value = AppState.selectors.editorEl.value;
         AppState.selectors.editorEl.value = value.substring(0, start) + "  " + value.substring(end);
         AppState.selectors.editorEl.selectionStart = AppState.selectors.editorEl.selectionEnd = start + 2;
         AppState.virtualFiles[AppState.currentFileIndex].content = AppState.selectors.editorEl.value;
         updateLineNumbers();
         triggerBackgroundDaemonPulse();
         debounceSaveToLocalStorage();
       }
     });

     AppState.selectors.tabAiBtn?.addEventListener('click', () => switchTab('ai'));
     AppState.selectors.tabDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
     AppState.selectors.tabMatrixBtn.addEventListener('click', () => switchTab('matrix'));
     AppState.selectors.tabIssuesBtn.addEventListener('click', () => switchTab('issues'));
     AppState.selectors.tabAstBtn.addEventListener('click', () => switchTab('ast'));
     AppState.selectors.tabCompilerBtn.addEventListener('click', () => {
       switchTab('compiler');
       compileWorkspace();
     });
     AppState.selectors.tabTestsBtn?.addEventListener('click', () => switchTab('tests'));
     AppState.selectors.runTestsBtn?.addEventListener('click', runTestSuite);
     AppState.selectors.toggleTestEditorBtn?.addEventListener('click', () => {
       if (AppState.selectors.testEditorContainer) {
         AppState.selectors.testEditorContainer.classList.toggle('hidden');
         AppState.selectors.testEditorContainer.classList.toggle('flex');
       }
     });
     AppState.selectors.resetDefaultTestsBtn?.addEventListener('click', () => {
       if (confirm('Reset test suite to default specs?')) {
         AppState.selectors.testSuiteCode.value = defaultTestSuite;
       }
     });

     AppState.selectors.exportWorkspaceBtn?.addEventListener('click', exportWorkspaceJSON);
     AppState.selectors.importWorkspaceBtn?.addEventListener('click', () => {
       AppState.selectors.importFileInput?.click();
     });
     AppState.selectors.importFileInput?.addEventListener('change', importWorkspaceJSON);
     AppState.selectors.clearTerminalBtn?.addEventListener('click', clearTerminalLogs);

     window.addEventListener('message', (event) => {
       if (event.data && event.data.type === 'CONSOLE_STREAM') {
         appendTerminalLog(event.data.level, event.data.text, event.data.time);
       }
     });

     AppState.selectors.analyzeBtn.addEventListener('click', runAnalysisSuite);
     AppState.selectors.formatBtn.addEventListener('click', formatCurrentBuffer);
     AppState.selectors.minifyBtn.addEventListener('click', minifyCurrentBuffer);
     AppState.selectors.triggerBuildBtn.addEventListener('click', compileWorkspace);

     // Fix Add File toggle inline UI
     AppState.selectors.addFileBtn.addEventListener('click', () => {
       AppState.selectors.quickAddContainer.classList.toggle('hidden');
       if (!AppState.selectors.quickAddContainer.classList.contains('hidden')) {
         AppState.selectors.newFileInput.focus();
       }
     });

     AppState.selectors.confirmAddFileBtn.addEventListener('click', () => {
       createNewFile(AppState.selectors.newFileInput.value);
       AppState.selectors.newFileInput.value = '';
       AppState.selectors.quickAddContainer.classList.add('hidden');
     });

     AppState.selectors.newFileInput.addEventListener('keydown', (e) => {
       if (e.key === 'Enter') {
         createNewFile(AppState.selectors.newFileInput.value);
         AppState.selectors.newFileInput.value = '';
         AppState.selectors.quickAddContainer.classList.add('hidden');
       }
     });
   }

   function switchTab(target) {
     const tabs = [
       { name: 'ai', btn: AppState.selectors.tabAiBtn, container: AppState.selectors.tabAi },
       { name: 'dashboard', btn: AppState.selectors.tabDashboardBtn, container: AppState.selectors.tabDashboard },
       { name: 'matrix', btn: AppState.selectors.tabMatrixBtn, container: AppState.selectors.tabMatrix },
       { name: 'issues', btn: AppState.selectors.tabIssuesBtn, container: AppState.selectors.tabIssues },
       { name: 'ast', btn: AppState.selectors.tabAstBtn, container: AppState.selectors.tabAst },
       { name: 'compiler', btn: AppState.selectors.tabCompilerBtn, container: AppState.selectors.tabCompiler },
       { name: 'tests', btn: AppState.selectors.tabTestsBtn, container: AppState.selectors.tabTests }
     ];

     tabs.forEach(tab => {
       if (!tab.btn || !tab.container) return;
       if (tab.name === target) {
         tab.btn.classList.add('border-[#cba6f7]', 'text-white');
         tab.btn.classList.remove('border-transparent', 'text-[#a6adc8]');
         tab.container.classList.remove('hidden');
       } else {
         tab.btn.classList.remove('border-[#cba6f7]', 'text-white');
         tab.btn.classList.add('border-transparent', 'text-[#a6adc8]');
         tab.container.classList.add('hidden');
       }
     });
   }

   function updateLineNumbers() {
     const count = AppState.selectors.editorEl.value.split('\\n').length;
     let lineStr = '';
     for (let i = 1; i <= count; i++) lineStr += \`\${i}<br>\`;
     AppState.selectors.lineNumbersEl.innerHTML = lineStr;
   }

   function startBackgroundDaemon() {
     if (AppState.daemonTimer) clearInterval(AppState.daemonTimer);
     AppState.daemonTimer = setInterval(() => {
       if (AppState.selectors.bgMonitorToggle.checked) {
         setDaemonStatus("scanning", "Daemon: Auto-Checking");
         setTimeout(() => {
           runAnalysisSuite(false);
           setDaemonStatus("idle", "Daemon: Watching");
         }, 300);
       } else {
         setDaemonStatus("disabled", "Daemon: Suspended");
       }
     }, 4000);
   }

   function triggerBackgroundDaemonPulse() {
     if (!AppState.selectors.bgMonitorToggle.checked) return;
     setDaemonStatus("typing", "Daemon: Catching changes...");
     clearTimeout(AppState.typingDebounceTimeout);
     AppState.typingDebounceTimeout = setTimeout(() => {
       runAnalysisSuite(false);
       setDaemonStatus("idle", "Daemon: Watching");
     }, 1200);
   }

   function setDaemonStatus(mode, text) {
     AppState.selectors.statusText.textContent = text;
     AppState.selectors.statusPulse.className = "w-2 h-2 rounded-full";
     if (mode === 'scanning') AppState.selectors.statusPulse.classList.add('bg-[#f9e2af]', 'animate-ping');
     else if (mode === 'typing') AppState.selectors.statusPulse.classList.add('bg-[#89b4fa]');
     else if (mode === 'disabled') AppState.selectors.statusPulse.classList.add('bg-[#585b70]');
     else AppState.selectors.statusPulse.classList.add('bg-[#a6e3a1]');
   }

   function runAnalysisSuite(flashUI = true) {
     if (AppState.virtualFiles.length === 0) return;
     const code = AppState.selectors.editorEl.value;
     const lang = AppState.virtualFiles[AppState.currentFileIndex].language;

     const lineCount = code.split('\\n').length;
     const charCount = code.length;
     const estTokens = Math.ceil(charCount / 4.2);
     const sizeBytes = new Blob([code]).size;

     AppState.selectors.metricLines.textContent = lineCount;
     AppState.selectors.metricChars.textContent = charCount;
     AppState.selectors.metricTokens.textContent = estTokens;
     AppState.selectors.metricSize.textContent = sizeBytes < 1024 ? \`\${sizeBytes} B\` : \`\${(sizeBytes/1024).toFixed(1)} KB\`;

     const issues = [];
     const astNodes = [];
     let complexity = 1;
     let deadVariables = [];

     if (lang === 'javascript' || lang === 'typescript') {
       const branches = code.match(/(if\\s*\\(|for\\s*\\(|while\\s*\\(|catch\\s*\\(|(?:&&|\\|\\|)|\\bcase\\s+)/g);
       complexity = branches ? branches.length + 1 : 1;

       const variableDeclarations = [...code.matchAll(/(?:const|let|var)\\s+([a-zA-Z0-9_$]+)\\s*[:=]/g)];
       variableDeclarations.forEach(match => {
         const varName = match[1];
         const escapedVarName = varName.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
         const varRegex = new RegExp(\`\\\\b\${escapedVarName}\\\\b\`, 'g');
         const occurrences = (code.match(varRegex) || []).length;
         if (occurrences === 1) {
           deadVariables.push({ name: varName, line: getLineFromIdx(code, match.index) });
         }
       });

       const secretRegex = /(?:api_key|token|secret|password|passwd|auth)\\s*=\\s*['"]([a-zA-Z0-9_\\-]{8,})['"]/gi;
       let secMatch;
       while ((secMatch = secretRegex.exec(code)) !== null) {
         issues.push({
           severity: 'error',
           text: \`Hardcoded secrets detection near: "\${secMatch[1].substring(0,4)}***"\`,
           category: 'security'
         });
       }

       if (code.includes('.innerHTML')) {
         issues.push({
           severity: 'warning',
           text: "Unsafe DOM write (.innerHTML). Prefer textContent or DOMPurify.",
           category: 'security'
         });
       }

       if (code.match(/\\beval\\s*\\(/)) {
         issues.push({
           severity: 'error',
           text: "Severe Threat: eval() invocation detected.",
           category: 'security'
         });
       }

       const tsTypeRegex = /(?:interface|type|enum)\\s+(\\w+)/g;
       let tsMatch;
       while ((tsMatch = tsTypeRegex.exec(code)) !== null) {
         const typeKind = tsMatch[0].split(/\\s+/)[0];
         astNodes.push({ type: typeKind.charAt(0).toUpperCase() + typeKind.slice(1) + 'Node', name: tsMatch[1], line: getLineFromIdx(code, tsMatch.index) });
       }

       const classRegex = /class\\s+(\\w+)/g;
       let cls;
       while ((cls = classRegex.exec(code)) !== null) {
         astNodes.push({ type: 'ClassNode', name: cls[1], line: getLineFromIdx(code, cls.index) });
       }

       const funcRegex = /function\\s+(\\w+)|(\\w+)\\s*=\\s*\\([^)]*\\)\\s*=>/g;
       let fn;
       while ((fn = funcRegex.exec(code)) !== null) {
         const name = fn[1] || fn[2];
         if (name) astNodes.push({ type: 'FunctionNode', name: name, line: getLineFromIdx(code, fn.index) });
       }

       variableDeclarations.forEach(match => {
         astNodes.push({ type: 'VariableScope', name: match[1], line: getLineFromIdx(code, match.index) });
       });
     }

     deadVariables.forEach(v => {
       issues.push({
         severity: 'warning',
         text: \`"\${v.name}" declared but never referenced.\`,
         category: 'static'
       });
     });

     let maintainability = Math.max(20, Math.round(100 - (complexity * 4.5) - (deadVariables.length * 5) - (issues.length * 10)));
     maintainability = Math.max(10, Math.min(100, maintainability));
     AppState.selectors.maintainabilityScore.textContent = \`\${maintainability}/100\`;
     AppState.selectors.maintainabilityBar.style.width = \`\${maintainability}%\`;

     const securityIssuesCount = issues.filter(i => i.category === 'security').length;
     let securityHealth = Math.max(10, Math.min(100, 100 - (securityIssuesCount * 35)));
     AppState.selectors.securityBar.style.width = \`\${securityHealth}%\`;
     AppState.selectors.securityScore.textContent = securityHealth > 80 ? "Excellent" : securityHealth > 45 ? "Vulnerable" : "Critical Risk";

     AppState.selectors.complexityMetric.textContent = complexity;
     AppState.selectors.deadCodeMetric.textContent = deadVariables.length;

     renderDiagnostics(issues);
     renderAst(astNodes);
   }

   function getLineFromIdx(code, index) {
     return code.substring(0, index).split('\\n').length;
   }

   function renderDiagnostics(issues) {
     AppState.selectors.diagnosticLogs.innerHTML = '';
     if (issues.length === 0) {
       AppState.selectors.diagnosticLogs.innerHTML = \`<div class="text-[#a6e3a1] text-xs">Workspace clean. No static warnings found.</div>\`;
     } else {
       issues.forEach(issue => {
         const isErr = issue.severity === 'error';
         const wrapper = document.createElement('div');
         wrapper.className = \`p-2 rounded border text-xs \${isErr ? 'bg-[#f38ba8]/10 border-[#f38ba8]/30 text-[#f38ba8]' : 'bg-[#f9e2af]/10 border-[#f9e2af]/30 text-[#f9e2af]'}\`;
         wrapper.textContent = \`[\${issue.category.toUpperCase()}] \${issue.text}\`;
         AppState.selectors.diagnosticLogs.appendChild(wrapper);
       });
     }
   }

   function renderAst(nodes) {
     AppState.selectors.astTree.innerHTML = '';
     if (nodes.length === 0) {
       AppState.selectors.astTree.innerHTML = \`<div class="text-[#585b70] italic">No AST structures found.</div>\`;
       return;
     }
     nodes.forEach(node => {
       const el = document.createElement('div');
       el.className = "flex justify-between bg-[#1e1e2e] p-1.5 rounded border border-[#313244] text-[11px] cursor-pointer hover:border-[#89b4fa]";
       el.innerHTML = \`<span>\${node.type}: <b class="text-[#89b4fa]">\${node.name}</b></span><span class="text-[#585b70]">Ln \${node.line}</span>\`;
       AppState.selectors.astTree.appendChild(el);
     });
   }

   function formatCurrentBuffer() {
     const code = AppState.selectors.editorEl.value;
     const formatted = code.split('\\n').map(l => l.trimEnd()).join('\\n');
     AppState.selectors.editorEl.value = formatted;
     AppState.virtualFiles[AppState.currentFileIndex].content = formatted;
     updateLineNumbers();
     runAnalysisSuite();
     debounceSaveToLocalStorage();
   }

   function minifyCurrentBuffer() {
     const code = AppState.selectors.editorEl.value;
     const minified = code.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '').replace(/(?:^|[^:])\\/\\/.*/gm, '').replace(/\\s+/g, ' ').trim();
     AppState.selectors.editorEl.value = minified;
     AppState.virtualFiles[AppState.currentFileIndex].content = minified;
     updateLineNumbers();
     runAnalysisSuite();
     debounceSaveToLocalStorage();
   }

   // Matrix Helper functions
   function addTask() {
     const textInput = document.getElementById('task-text-input');
     const quadInput = document.getElementById('task-quadrant-input');
     const taskText = textInput.value.trim();
     const targetQuad = quadInput.value;
     if (!taskText) return;

     const targetList = document.getElementById(targetQuad + "-list");
     const empty = targetList.querySelector('.text-\\\\[\\\\#555\\\\]');
     if (empty) empty.remove();

     const item = document.createElement('div');
     item.className = 'task-item bg-[#1b1b1b] p-1.5 rounded text-[11px] flex justify-between items-center border-l-2';
     item.innerHTML = \`<span>\${taskText}</span><button class="text-[#888] hover:text-red-400 text-[10px]" onclick="removeTask(this, '\${targetQuad}')">✖</button>\`;

     targetList.appendChild(item);
     textInput.value = '';
   }

   function removeTask(button, quadId) {
     const list = document.getElementById(quadId + "-list");
     button.parentElement.remove();
     if (list.children.length === 0) {
       list.innerHTML = \`<div class="text-[10px] text-[#555] italic">No items queued.</div>\`;
     }
   }

   window.addEventListener('DOMContentLoaded', init);
 </script>
</body>
</html>`;

export const CODE_INSPECTOR_SECTION_MD = `---

## The Code Inspector Pro V4.5 (TypeScript Enabled)
An advanced static code inspector, dead-code linter, AST parser, Eisenhower Matrix, and live TypeScript transpilation engine embedded directly inside your notebook:

\`\`\`html
${CODE_INSPECTOR_HTML}
\`\`\`
`;

