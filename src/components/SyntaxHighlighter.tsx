import React, { useState, useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-markup"; // HTML, XML, SVG
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import { Check, Copy, Code2, ShieldCheck, WrapText } from "lucide-react";

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  theme?: "light" | "dark";
  onOpenInspector?: (code: string, lang: string) => void;
  showInspectorButton?: boolean;
  allowLineWrapToggle?: boolean;
  defaultWrap?: boolean;
  className?: string;
}

// Map alias / common extensions to Prism grammar keys
function normalizeLanguage(lang?: string): { id: string; label: string } {
  if (!lang) return { id: "plaintext", label: "Plain Text" };
  const l = lang.trim().toLowerCase();
  
  switch (l) {
    case "ts":
    case "typescript":
      return { id: "typescript", label: "TypeScript" };
    case "tsx":
      return { id: "tsx", label: "React TSX" };
    case "js":
    case "javascript":
      return { id: "javascript", label: "JavaScript" };
    case "jsx":
      return { id: "jsx", label: "React JSX" };
    case "html":
    case "htm":
    case "xml":
    case "svg":
      return { id: "markup", label: "HTML" };
    case "css":
    case "scss":
    case "sass":
      return { id: "css", label: "CSS" };
    case "json":
      return { id: "json", label: "JSON" };
    case "py":
    case "python":
      return { id: "python", label: "Python" };
    case "sh":
    case "bash":
    case "shell":
    case "zsh":
      return { id: "bash", label: "Bash" };
    case "sql":
      return { id: "sql", label: "SQL" };
    case "md":
    case "markdown":
      return { id: "markdown", label: "Markdown" };
    case "rs":
    case "rust":
      return { id: "rust", label: "Rust" };
    case "go":
    case "golang":
      return { id: "go", label: "Go" };
    case "c":
      return { id: "c", label: "C" };
    case "cpp":
    case "c++":
      return { id: "cpp", label: "C++" };
    default:
      return { id: l, label: lang.toUpperCase() };
  }
}

// Developer-grade syntax color map tuned for high contrast & dark theme
function getTokenColor(type: string): string {
  switch (type) {
    case "comment":
    case "prolog":
    case "doctype":
    case "cdata":
      return "text-[#7f848e] italic";
    case "punctuation":
      return "text-[#a6adc8]";
    case "property":
    case "tag":
    case "constant":
    case "symbol":
    case "deleted":
      return "text-[#f38ba8]"; // Coral Red
    case "boolean":
    case "number":
      return "text-[#fab387]"; // Peach / Orange
    case "selector":
    case "attr-name":
    case "string":
    case "char":
    case "builtin":
    case "inserted":
      return "text-[#a6e3a1]"; // Bright Mint Green
    case "operator":
    case "entity":
    case "url":
    case "variable":
      return "text-[#89dceb]"; // Cyan / Sky
    case "atrule":
    case "attr-value":
    case "keyword":
      return "text-[#cba6f7] font-medium"; // Mauve / Lavender
    case "function":
    case "class-name":
      return "text-[#89b4fa]"; // Soft Blue
    case "regex":
    case "important":
      return "text-[#f9e2af]"; // Warm Gold
    default:
      return "text-[#cdd6f4]";
  }
}

// Recursively render Prism tokens into safe React nodes
function renderPrismTokens(
  tokens: (string | Prism.Token)[],
  keyPrefix = "tok"
): React.ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (typeof token === "string") {
      return <span key={key}>{token}</span>;
    }

    const colorClass = getTokenColor(token.type);
    let children: React.ReactNode;

    if (Array.isArray(token.content)) {
      children = renderPrismTokens(token.content as (string | Prism.Token)[], `${key}-arr`);
    } else if (typeof token.content === "object" && token.content !== null) {
      children = renderPrismTokens([token.content as unknown as (string | Prism.Token)], `${key}-obj`);
    } else {
      children = String(token.content);
    }

    return (
      <span key={key} className={colorClass}>
        {children}
      </span>
    );
  });
}

export const SyntaxHighlightedCode: React.FC<SyntaxHighlighterProps> = ({
  code,
  language = "typescript",
  theme = "dark",
  onOpenInspector,
  showInspectorButton = true,
  allowLineWrapToggle = true,
  defaultWrap = true,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [isWrap, setIsWrap] = useState(defaultWrap);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const { id: langId, label: langLabel } = useMemo(
    () => normalizeLanguage(language),
    [language]
  );

  const lines = useMemo(() => code.split("\n"), [code]);

  // Tokenize code using Prism with fallback to plain text
  const highlightedContent = useMemo(() => {
    try {
      const grammar = Prism.languages[langId] || Prism.languages.javascript || Prism.languages.markup;
      if (!grammar) {
        return <span>{code}</span>;
      }
      const tokens = Prism.tokenize(code, grammar);
      return renderPrismTokens(tokens);
    } catch {
      return <span>{code}</span>;
    }
  }, [code, langId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const isHtmlOrJsx =
    langId === "markup" ||
    langId === "jsx" ||
    langId === "tsx" ||
    language.toLowerCase() === "html";

  return (
    <div
      className={`rounded-xs overflow-hidden border shadow-md flex flex-col font-mono text-xs ${
        theme === "dark"
          ? "border-zinc-800/90 bg-[#121217]"
          : "border-black/15 bg-[#18181f]"
      } ${className}`}
    >
      {/* Header bar */}
      <div
        className={`text-[10px] px-3.5 py-2 uppercase tracking-widest font-sans border-b flex flex-wrap justify-between items-center gap-2 select-none ${
          theme === "dark"
            ? "bg-[#0b0b0f] text-zinc-400 border-zinc-800/80"
            : "bg-[#111116] text-zinc-300 border-white/5"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-zinc-800/80 border border-zinc-700/50 text-[#cdd6f4] font-mono font-medium">
            <Code2 className="w-3 h-3 text-[#cba6f7]" />
            <span>{langLabel}</span>
          </div>
          <span className="text-[9px] text-zinc-500 lowercase font-mono">
            {lines.length} {lines.length === 1 ? "line" : "lines"} &bull; {code.length} chars
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {allowLineWrapToggle && (
            <button
              type="button"
              onClick={() => setIsWrap(!isWrap)}
              className={`flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-xs border transition-colors cursor-pointer ${
                isWrap
                  ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                  : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200"
              }`}
              title={isWrap ? "Line Wrap: Enabled" : "Line Wrap: Disabled"}
            >
              <WrapText className="w-3 h-3" />
              <span>Wrap</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-xs border transition-colors cursor-pointer ${
              showLineNumbers
                ? "bg-zinc-800 border-zinc-600 text-zinc-200"
                : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200"
            }`}
            title="Toggle Line Numbers"
          >
            <span># Lines</span>
          </button>

          {showInspectorButton && onOpenInspector && (
            <button
              type="button"
              onClick={() => onOpenInspector(code, language)}
              className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#a6e3a1] hover:text-[#b4f5af] font-semibold cursor-pointer border border-[#a6e3a1]/30 bg-[#a6e3a1]/10 px-2 py-0.5 rounded-xs transition-colors"
              title="Open inside Code Inspector Pro"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Inspect</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-xs border transition-all cursor-pointer ${
              copied
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold"
                : "bg-zinc-800/80 hover:bg-zinc-750 border-zinc-700/60 text-zinc-300 hover:text-white"
            }`}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body with optional line numbers and wrapping */}
      <div className="flex relative bg-[#131318] text-[#cdd6f4]">
        {showLineNumbers && (
          <div
            className="w-10 flex-shrink-0 bg-[#0e0e13] text-[#585b70] text-right pr-2.5 py-3.5 select-none font-mono text-[11px] leading-6 border-r border-zinc-800/60"
            aria-hidden="true"
          >
            {lines.map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <pre
          className={`flex-1 p-3.5 font-mono text-xs leading-6 overflow-x-auto ${
            isWrap
              ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
              : "whitespace-pre"
          }`}
          style={{
            wordBreak: isWrap ? "break-word" : "normal",
            overflowWrap: isWrap ? "anywhere" : "normal",
          }}
        >
          <code
            className={`font-mono text-xs leading-6 block ${
              isWrap ? "whitespace-pre-wrap break-words [overflow-wrap:anywhere]" : "whitespace-pre"
            }`}
            style={{
              wordBreak: isWrap ? "break-word" : "normal",
              overflowWrap: isWrap ? "anywhere" : "normal",
            }}
          >
            {highlightedContent}
          </code>
        </pre>
      </div>

      {/* Live Preview footer for HTML/JSX snippets */}
      {isHtmlOrJsx && (() => {
        const isComplexApp =
          code.includes("<script") ||
          code.includes("<!DOCTYPE") ||
          code.includes("<html") ||
          code.includes("Code Inspector Pro");
        return (
          <div
            className={`p-2.5 border-t font-sans w-full ${
              theme === "dark"
                ? "bg-[#0c0c10] border-zinc-800/80 text-zinc-300"
                : "bg-[#f8f8fa] border-black/10 text-black"
            }`}
          >
            <div className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5 flex items-center gap-1">
              <span>Interactive HTML / JSX Preview</span>
            </div>
            {isComplexApp ? (
              <iframe
                srcDoc={code}
                title="Embedded App Preview"
                className="w-full h-[720px] border-0 rounded-xs shadow-xs bg-[#181825]"
                sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-forms"
              />
            ) : (
              <div
                className="p-3 bg-white text-black rounded-xs border border-black/10 overflow-auto"
                dangerouslySetInnerHTML={{ __html: code }}
              />
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default SyntaxHighlightedCode;
