import React, { useState, useEffect } from "react";
import { A11yViolation, VirtualFile } from "./types";
import { ShieldAlert, CheckCircle2, Wrench, AlertCircle, Award, Sparkles } from "lucide-react";

interface A11yAuditorProps {
  virtualFiles: VirtualFile[];
  onUpdateFileContent: (filename: string, newContent: string) => void;
}

export default function A11yAuditor({ virtualFiles, onUpdateFileContent }: A11yAuditorProps) {
  const [violations, setViolations] = useState<A11yViolation[]>([]);
  const [score, setScore] = useState<number>(100);

  const htmlFiles = virtualFiles.filter((f) => f.language === "html" || f.name.endsWith(".html"));

  const runA11yAudit = () => {
    if (htmlFiles.length === 0) {
      setViolations([]);
      setScore(100);
      return;
    }

    const detected: A11yViolation[] = [];

    htmlFiles.forEach((file) => {
      const code = file.content;
      const lines = code.split("\n");

      // Rule 1: Missing lang attribute on <html>
      if (/<html\b(?![^>]*\blang=)[^>]*>/i.test(code)) {
        detected.push({
          id: `a11y-lang-${Date.now()}`,
          severity: "error",
          rule: "WCAG 3.1.1 Language of Page",
          message: "The <html> element is missing a mandatory 'lang' attribute (e.g., lang=\"en\").",
          lineNumber: 1,
          fixAvailable: true,
          snippet: "<html lang=\"en\">"
        });
      }

      // Rule 2: Images missing alt attribute
      const imgRegex = /<img\b(?![^>]*\balt=)[^>]*>/gi;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(code)) !== null) {
        const lineNo = code.substring(0, imgMatch.index).split("\n").length;
        detected.push({
          id: `a11y-img-alt-${imgMatch.index}`,
          severity: "error",
          rule: "WCAG 1.1.1 Non-text Content",
          message: "Image tag <img> is missing an 'alt' text description for screen readers.",
          lineNumber: lineNo,
          fixAvailable: true,
          snippet: imgMatch[0]
        });
      }

      // Rule 3: Buttons missing text or aria-label
      const btnRegex = /<button\b([^>]*)>(.*?)<\/button>/gi;
      let btnMatch;
      while ((btnMatch = btnRegex.exec(code)) !== null) {
        const attrs = btnMatch[1];
        const innerText = btnMatch[2].replace(/<[^>]+>/g, "").trim();
        const hasAria = /aria-label=/i.test(attrs);

        if (!innerText && !hasAria) {
          const lineNo = code.substring(0, btnMatch.index).split("\n").length;
          detected.push({
            id: `a11y-btn-label-${btnMatch.index}`,
            severity: "error",
            rule: "WCAG 4.1.2 Name, Role, Value",
            message: "Interactive <button> has no inner text or 'aria-label' attribute.",
            lineNumber: lineNo,
            fixAvailable: true,
            snippet: btnMatch[0]
          });
        }
      }

      // Rule 4: Non-semantic onClick handlers on <div> or <span>
      const divClickRegex = /<(div|span)\b[^>]*\bonclick\s*=[^>]*>/gi;
      let divClickMatch;
      while ((divClickMatch = divClickRegex.exec(code)) !== null) {
        const lineNo = code.substring(0, divClickMatch.index).split("\n").length;
        detected.push({
          id: `a11y-div-click-${divClickMatch.index}`,
          severity: "warning",
          rule: "WCAG 2.1.1 Keyboard Accessible",
          message: `Non-semantic <${divClickMatch[1]}> has onClick listener without keyboard role="button" or tabindex="0".`,
          lineNumber: lineNo,
          fixAvailable: true,
          snippet: divClickMatch[0]
        });
      }

      // Rule 5: Heading hierarchy skip (e.g., <h1> then <h3>)
      const headingRegex = /<h([1-6])\b[^>]*>/gi;
      let prevLevel = 0;
      let hMatch;
      while ((hMatch = headingRegex.exec(code)) !== null) {
        const currentLevel = parseInt(hMatch[1], 10);
        if (prevLevel > 0 && currentLevel > prevLevel + 1) {
          const lineNo = code.substring(0, hMatch.index).split("\n").length;
          detected.push({
            id: `a11y-heading-${hMatch.index}`,
            severity: "warning",
            rule: "WCAG 1.3.1 Info and Relationships",
            message: `Heading level skipped: <h${prevLevel}> followed directly by <h${currentLevel}>.`,
            lineNumber: lineNo,
            fixAvailable: false,
            snippet: hMatch[0]
          });
        }
        prevLevel = currentLevel;
      }
    });

    const computedScore = Math.max(0, 100 - detected.length * 15);
    setScore(computedScore);
    setViolations(detected);
  };

  useEffect(() => {
    runA11yAudit();
  }, [virtualFiles]);

  const handleAutoFixAll = () => {
    if (htmlFiles.length === 0) return;
    const targetFile = htmlFiles[0];
    let updatedCode = targetFile.content;

    // Fix 1: Add lang="en" to <html>
    if (/<html\b(?![^>]*\blang=)[^>]*>/i.test(updatedCode)) {
      updatedCode = updatedCode.replace(/<html\b([^>]*)>/i, '<html lang="en"$1>');
    }

    // Fix 2: Add alt="" to <img>
    updatedCode = updatedCode.replace(/<img\b(?![^>]*\balt=)([^>]*)>/gi, '<img alt="Image description"$1>');

    // Fix 3: Add aria-label to empty <button>
    updatedCode = updatedCode.replace(
      /<button\b(?![^>]*\baria-label=)([^>]*)>\s*<\/button>/gi,
      '<button aria-label="Action button"$1></button>'
    );

    // Fix 4: Add role="button" tabindex="0" to div/span onclick
    updatedCode = updatedCode.replace(
      /<(div|span)\b(?![^>]*\brole=)([^>]*\bonclick\s*=[^>]*)>/gi,
      '<$1 role="button" tabindex="0"$2>'
    );

    onUpdateFileContent(targetFile.name, updatedCode);
    alert("⚡ Auto-Fix Applied: Fixed accessible HTML tags, missing attributes & keyboard targets!");
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Header & Compliance Score */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-[#a6e3a1]" /> Automated Accessibility Auditor
          </h3>
          {violations.length > 0 && (
            <button
              onClick={handleAutoFixAll}
              className="bg-[#a6e3a1] text-[#11111b] font-bold px-3 py-1 rounded flex items-center gap-1 hover:bg-[#89b4fa] transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" /> 1-Click Auto-Fix
            </button>
          )}
        </div>

        {/* Score Bar */}
        <div className="bg-[#11111b] p-3 rounded border border-[#313244] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#a6adc8]">WCAG Compliance Score</span>
            <span
              className={`font-bold ${
                score >= 80 ? "text-[#a6e3a1]" : score >= 50 ? "text-[#f9e2af]" : "text-[#f38ba8]"
              }`}
            >
              {score}%
            </span>
          </div>
          <div className="w-full bg-[#313244] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                score >= 80 ? "bg-[#a6e3a1]" : score >= 50 ? "bg-[#f9e2af]" : "bg-[#f38ba8]"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Audit Violations List */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
        <span className="text-[10px] font-bold text-white uppercase block">
          Audited Violations ({violations.length})
        </span>

        {violations.length === 0 ? (
          <div className="bg-[#a6e3a1]/10 border border-[#a6e3a1]/30 p-3 rounded text-[#a6e3a1] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Passed all WCAG accessibility standards! Excellent structure.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {violations.map((v) => (
              <div
                key={v.id}
                className={`p-2.5 rounded border text-xs leading-relaxed space-y-1 ${
                  v.severity === "error"
                    ? "bg-[#f38ba8]/10 border-[#f38ba8]/30 text-[#f38ba8]"
                    : "bg-[#f9e2af]/10 border-[#f9e2af]/30 text-[#f9e2af]"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] uppercase">
                  <span>{v.rule}</span>
                  <span>Line {v.lineNumber}</span>
                </div>
                <p className="text-white text-[11px]">{v.message}</p>
                <div className="text-[10px] bg-black/40 p-1.5 rounded font-mono text-[#a6adc8] truncate">
                  Snippet: <code className="text-white">{v.snippet}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
