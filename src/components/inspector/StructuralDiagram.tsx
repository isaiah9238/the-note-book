import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { VirtualFile } from "./types";
import { Network, Copy, Check, Sparkles, Code2, RefreshCw } from "lucide-react";

interface StructuralDiagramProps {
  virtualFiles: VirtualFile[];
}

export default function StructuralDiagram({ virtualFiles }: StructuralDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaidCode, setMermaidCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDiagramSyntax = () => {
    let code = "graph TD\n";
    code += "  subgraph Workspace [Codebase Structure]\n";

    const jsFile = virtualFiles.find((f) => f.language === "javascript");
    const htmlFile = virtualFiles.find((f) => f.language === "html");
    const cssFile = virtualFiles.find((f) => f.language === "css");

    if (htmlFile) {
      code += "    HTML[index.html Document]\n";
      const tags = [...new Set(htmlFile.content.match(/<([a-zA-Z0-9\-]+)(?:\s+id=["']([^"']+)["'])?/g) || [])];
      tags.slice(0, 6).forEach((t, idx) => {
        const cleanTag = t.replace(/<|>/g, "").trim();
        code += `    HTML --> DOM_${idx}["<${cleanTag}>"]\n`;
      });
    }

    if (jsFile) {
      code += "    JS[app.js Logic Engine]\n";
      const funcs = [...jsFile.content.matchAll(/function\s+(\w+)|const\s+(\w+)\s*=\s*\(/g)];
      const fnNames = funcs.map((m) => m[1] || m[2]).filter(Boolean);

      fnNames.forEach((fn) => {
        code += `    JS --> FN_${fn}["fn: ${fn}()"]\n`;
      });

      if (htmlFile) {
        code += "    DOM_0 -. Event Listeners .-> JS\n";
      }
    }

    if (cssFile) {
      code += "    CSS[styles.css Themes]\n";
      if (htmlFile) {
        code += "    CSS --> HTML\n";
      }
    }

    code += "  end\n";
    return code;
  };

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose"
    });
  }, []);

  const renderMermaid = async () => {
    setError(null);
    const syntax = generateDiagramSyntax();
    setMermaidCode(syntax);

    if (!containerRef.current) return;

    try {
      containerRef.current.innerHTML = "";
      const id = `mermaid-svg-${Date.now()}`;
      const { svg } = await mermaid.render(id, syntax);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    } catch (err: any) {
      setError("Mermaid Render Warning: " + (err.message || String(err)));
    }
  };

  useEffect(() => {
    renderMermaid();
  }, [virtualFiles]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-[#cba6f7]" /> Mermaid Structural Flowchart
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="bg-[#313244] text-white hover:bg-[#45475a] px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3 h-3" /> {showCode ? "Diagram View" : "Syntax"}
            </button>
            <button
              onClick={handleCopyCode}
              className="bg-[#cba6f7] text-[#11111b] hover:bg-[#b4befe] px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#a6e3a1]" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-[#a6adc8] leading-relaxed">
          Automatically parse class relationships, function calls, and HTML-to-JS bindings into interactive Mermaid flowcharts.
        </p>
      </div>

      {/* Rendered Diagram / Syntax View */}
      {showCode ? (
        <div className="bg-[#181825] border border-[#313244] rounded-lg p-3">
          <pre className="bg-[#11111b] p-3 rounded text-[11px] text-[#cdd6f4] overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap break-words [overflow-wrap:anywhere]" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
            {mermaidCode}
          </pre>
        </div>
      ) : (
        <div className="bg-[#181825] border border-[#313244] rounded-lg p-4 flex items-center justify-center min-h-[220px] overflow-x-auto">
          {error ? (
            <div className="text-[11px] text-[#f9e2af] italic text-center p-2">{error}</div>
          ) : (
            <div ref={containerRef} className="w-full flex justify-center" />
          )}
        </div>
      )}
    </div>
  );
}
