import React, { useEffect, useRef, useState } from "react";
import { MockEndpoint, NetworkLog, VirtualFile } from "./types";
import { RefreshCw, Play, Flame, Terminal, MousePointer } from "lucide-react";

interface HotReloadPreviewProps {
  virtualFiles: VirtualFile[];
  hotReloadEnabled: boolean;
  onToggleHotReload: () => void;
  mockEndpoints: MockEndpoint[];
  onNetworkLog: (log: NetworkLog) => void;
  terminalLogs: { level: "log" | "warn" | "error"; text: string; timestamp: string }[];
  onClearTerminalLogs: () => void;
  onConsoleLog: (level: "log" | "warn" | "error", text: string) => void;
  pickerActive: boolean;
  onSelectDomElement: (el: any) => void;
}

export default function HotReloadPreview({
  virtualFiles,
  hotReloadEnabled,
  onToggleHotReload,
  mockEndpoints,
  onNetworkLog,
  terminalLogs,
  onClearTerminalLogs,
  onConsoleLog,
  pickerActive,
  onSelectDomElement
}: HotReloadPreviewProps) {
  const [compiledUrl, setCompiledUrl] = useState<string | null>(null);
  const [compilerStatus, setCompilerStatus] = useState("Ready");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Message listener from iframe sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === "CONSOLE_LOG") {
        onConsoleLog(event.data.level, event.data.text);
      } else if (event.data.type === "NETWORK_INTERCEPT") {
        onNetworkLog({
          id: `net-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          method: event.data.method,
          url: event.data.url,
          status: event.data.status,
          durationMs: event.data.durationMs || 12,
          mocked: event.data.mocked,
          responsePreview: event.data.responsePreview || ""
        });
      } else if (event.data.type === "DOM_ELEMENT_SELECTED") {
        onSelectDomElement(event.data.element);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleLog, onNetworkLog, onSelectDomElement]);

  // Send picker state down to iframe when pickerActive changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "SET_DOM_PICKER", active: pickerActive }, "*");
    }
  }, [pickerActive, compiledUrl]);

  const compileBundle = () => {
    setCompilerStatus("Bundling...");
    const htmlFile = virtualFiles.find((f) => f.name.endsWith(".html")) || virtualFiles[0];
    const cssFile = virtualFiles.find((f) => f.name.endsWith(".css"));
    const jsFile = virtualFiles.find((f) => f.name.endsWith(".js"));

    if (!htmlFile) {
      setCompilerStatus("No HTML file found");
      return;
    }

    try {
      let rawHtml = htmlFile.content;
      const cssContent = cssFile ? cssFile.content : "";
      const jsContent = jsFile ? jsFile.content : "";

      // Injection scripts: Console interceptor + Fetch/XHR interceptor + DOM picker listener
      const interceptors = `
      (function() {
        // Console Interceptor
        const _log = console.log, _warn = console.warn, _error = console.error;
        console.log = function(...args) {
          _log.apply(console, args);
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
        };
        console.warn = function(...args) {
          _warn.apply(console, args);
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'warn', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
        };
        console.error = function(...args) {
          _error.apply(console, args);
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
        };

        // Mock Endpoints config
        const mockRules = ${JSON.stringify(mockEndpoints)};

        // Fetch Interceptor
        const _origFetch = window.fetch;
        window.fetch = async function(input, init) {
          const url = typeof input === 'string' ? input : input.url;
          const method = (init && init.method) ? init.method.toUpperCase() : 'GET';
          const rule = mockRules.find(r => r.enabled && r.url === url && r.method === method);

          if (rule) {
            window.parent.postMessage({ type: 'NETWORK_INTERCEPT', method, url, status: rule.status, mocked: true, responsePreview: rule.response }, '*');
            return new Response(rule.response, {
              status: rule.status,
              headers: { 'Content-Type': 'application/json' }
            });
          } else {
            const res = await _origFetch.apply(this, arguments);
            window.parent.postMessage({ type: 'NETWORK_INTERCEPT', method, url, status: res.status, mocked: false }, '*');
            return res;
          }
        };

        // Visual DOM Picker Handler
        let isPickerActive = false;
        let hoverOverlay = null;

        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'SET_DOM_PICKER') {
            isPickerActive = e.data.active;
            if (!isPickerActive && hoverOverlay) {
              hoverOverlay.remove();
              hoverOverlay = null;
            }
          }
        });

        document.addEventListener('mouseover', function(e) {
          if (!isPickerActive) return;
          e.stopPropagation();
          const target = e.target;
          if (!hoverOverlay) {
            hoverOverlay = document.createElement('div');
            hoverOverlay.style.position = 'absolute';
            hoverOverlay.style.border = '2px solid #89b4fa';
            hoverOverlay.style.backgroundColor = 'rgba(137, 180, 250, 0.2)';
            hoverOverlay.style.pointerEvents = 'none';
            hoverOverlay.style.zIndex = '999999';
            document.body.appendChild(hoverOverlay);
          }
          const rect = target.getBoundingClientRect();
          hoverOverlay.style.top = (rect.top + window.scrollY) + 'px';
          hoverOverlay.style.left = (rect.left + window.scrollX) + 'px';
          hoverOverlay.style.width = rect.width + 'px';
          hoverOverlay.style.height = rect.height + 'px';
        });

        document.addEventListener('click', function(e) {
          if (!isPickerActive) return;
          e.preventDefault();
          e.stopPropagation();
          const target = e.target;
          const rect = target.getBoundingClientRect();
          const computed = window.getComputedStyle(target);

          window.parent.postMessage({
            type: 'DOM_ELEMENT_SELECTED',
            element: {
              tagName: target.tagName,
              id: target.id || '',
              className: target.className || '',
              innerText: (target.innerText || '').substring(0, 80),
              rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
              computedStyle: {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize,
                display: computed.display,
                margin: computed.margin,
                padding: computed.padding
              }
            }
          }, '*');
        }, true);
      })();
      `;

      const compiledStyles = `<style>\n${cssContent}\n</style>`;
      if (/<\/head>/i.test(rawHtml)) {
        rawHtml = rawHtml.replace(/(<\/head>)/i, `${compiledStyles}\n$1`);
      } else {
        rawHtml = compiledStyles + rawHtml;
      }

      const compiledScript = `<script>\n${interceptors}\n${jsContent}\n</script>`;
      if (/<\/body>/i.test(rawHtml)) {
        rawHtml = rawHtml.replace(/(<\/body>)/i, `${compiledScript}\n$1`);
      } else {
        rawHtml = rawHtml + compiledScript;
      }

      const blob = new Blob([rawHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setCompiledUrl(url);
      setCompilerStatus("Compiled Live");
    } catch (err: any) {
      setCompilerStatus("Build Error: " + err.message);
    }
  };

  // 300ms Debounced Hot Reload
  useEffect(() => {
    if (!hotReloadEnabled) return;
    const timer = setTimeout(() => {
      compileBundle();
    }, 300);
    return () => clearTimeout(timer);
  }, [virtualFiles, hotReloadEnabled, mockEndpoints]);

  useEffect(() => {
    compileBundle();
  }, []);

  return (
    <div className="space-y-3 font-mono text-xs h-full flex flex-col">
      {/* Sandbox Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Play className="w-4 h-4 text-[#a6e3a1]" /> Hot-Reload Execution Sandbox
          </h3>
          <span className="text-[9px] bg-[#313244] text-[#a6adc8] px-1.5 py-0.5 rounded font-bold">
            {compilerStatus}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hot-Reload Toggle */}
          <button
            onClick={onToggleHotReload}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
              hotReloadEnabled
                ? "bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/40"
                : "bg-[#313244] text-[#a6adc8] hover:text-white"
            }`}
            title="Toggle 300ms Hot Reload on keypress"
          >
            <Flame className={`w-3.5 h-3.5 ${hotReloadEnabled ? "text-[#a6e3a1]" : ""}`} />
            <span>Hot Reload: {hotReloadEnabled ? "ON (300ms)" : "OFF"}</span>
          </button>

          <button
            onClick={compileBundle}
            className="bg-[#a6e3a1] text-[#11111b] text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1 hover:bg-[#89b4fa] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Re-compile
          </button>
        </div>
      </div>

      {/* Sandbox Output Iframe */}
      <div className="h-56 bg-white rounded-lg border border-[#45475a] overflow-hidden flex flex-col shrink-0 relative">
        <div className="bg-[#313244] text-[10px] px-3 py-1 flex items-center justify-between text-white font-semibold font-mono">
          <span>Sandbox Executable Frame</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        {compiledUrl ? (
          <iframe
            ref={iframeRef}
            src={compiledUrl}
            title="Compiler Hot Reload Sandbox"
            className="w-full flex-1 bg-white border-none"
            sandbox="allow-scripts allow-modals allow-forms"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 italic p-4">
            Compiling workspace iframe...
          </div>
        )}
      </div>

      {/* Live Captured Console Terminal */}
      <div className="flex-1 bg-[#11111b] border border-[#313244] rounded-lg p-2.5 flex flex-col overflow-hidden min-h-[120px]">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#313244] text-[10px] font-bold text-[#a6adc8] uppercase font-mono">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-[#f9e2af]" /> Console Terminal ({terminalLogs.length})
          </span>
          <button onClick={onClearTerminalLogs} className="hover:text-white cursor-pointer">
            Clear
          </button>
        </div>
        <div className="flex-1 font-mono text-[11px] overflow-y-auto space-y-1 select-text">
          {terminalLogs.length === 0 ? (
            <div className="text-[#585b70] italic">// Sandbox console logs output here...</div>
          ) : (
            terminalLogs.map((log, i) => (
              <div
                key={i}
                className={`flex gap-2 text-[10px] leading-relaxed ${
                  log.level === "error"
                    ? "text-[#f38ba8]"
                    : log.level === "warn"
                    ? "text-[#f9e2af]"
                    : "text-[#a6e3a1]"
                }`}
              >
                <span className="text-[#585b70] shrink-0">[{log.timestamp}]</span>
                <span className="font-bold uppercase shrink-0">[{log.level}]</span>
                <span className="break-all">{log.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
