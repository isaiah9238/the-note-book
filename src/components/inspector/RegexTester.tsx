import React, { useState } from "react";
import { Search, Sparkles, CheckCircle2, Info, Layers } from "lucide-react";

export default function RegexTester() {
  const [pattern, setPattern] = useState("(\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b)");
  const [flags, setFlags] = useState({ g: true, i: true, m: false });
  const [testText, setTestText] = useState(
    "Contact support at dev@example.com or admin@notebook.io for system updates."
  );

  const flagStr = Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag)
    .join("");

  let matches: { index: number; text: string; groups: string[] }[] = [];
  let regexError: string | null = null;

  try {
    if (pattern) {
      const regex = new RegExp(pattern, flagStr);
      if (flags.g) {
        let m;
        while ((m = regex.exec(testText)) !== null) {
          matches.push({
            index: m.index,
            text: m[0],
            groups: m.slice(1)
          });
          if (!regex.global) break;
        }
      } else {
        const m = regex.exec(testText);
        if (m) {
          matches.push({
            index: m.index,
            text: m[0],
            groups: m.slice(1)
          });
        }
      }
    }
  } catch (err: any) {
    regexError = err.message;
  }

  // Token Explainer Helper
  const getRegexExplainer = (pat: string) => {
    const explanations: { token: string; desc: string }[] = [];
    if (pat.includes("\\b")) explanations.push({ token: "\\b", desc: "Word boundary anchor" });
    if (pat.includes("[A-Za-z0-9._%+-]+")) explanations.push({ token: "[A-Za-z0-9._%+-]+", desc: "One or more alphanumeric, dot, or symbol characters" });
    if (pat.includes("@")) explanations.push({ token: "@", desc: "Literal '@' character" });
    if (pat.includes("(")) explanations.push({ token: "(...)", desc: "Capturing group" });
    if (pat.includes("\\d+")) explanations.push({ token: "\\d+", desc: "One or more digits (0-9)" });
    if (pat.includes("(?=")) explanations.push({ token: "(?=...)", desc: "Positive lookahead" });
    if (pat.includes("$")) explanations.push({ token: "$", desc: "End of string/line anchor" });

    if (explanations.length === 0) {
      explanations.push({ token: pat, desc: "Evaluates standard regular expression character sequence" });
    }
    return explanations;
  };

  const explainerTokens = getRegexExplainer(pattern);

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Header & Pattern Input */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-[#f9e2af]" /> Interactive Regex Tester & Explainer
        </h3>

        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-[#11111b] border border-[#313244] rounded px-2.5 py-1">
              <span className="text-[#585b70] mr-1 font-bold">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="regex pattern"
                className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs"
              />
              <span className="text-[#585b70] ml-1 font-bold">/{flagStr}</span>
            </div>
          </div>

          {/* Flags Toggles */}
          <div className="flex items-center gap-3 text-[10px] text-[#a6adc8]">
            <span className="font-bold uppercase">Flags:</span>
            {(["g", "i", "m"] as const).map((flag) => (
              <label key={flag} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags[flag]}
                  onChange={(e) => setFlags({ ...flags, [flag]: e.target.checked })}
                  className="accent-[#f9e2af] cursor-pointer"
                />
                <span className="font-bold text-white uppercase">{flag}</span>
              </label>
            ))}
          </div>
        </div>

        {regexError && (
          <div className="text-[10px] text-[#f38ba8] bg-[#f38ba8]/10 p-2 rounded border border-[#f38ba8]/30">
            Regex Syntax Error: {regexError}
          </div>
        )}
      </div>

      {/* Test Text Input */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
        <span className="text-[10px] font-bold text-[#a6adc8] uppercase block">Test Subject String</span>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          rows={3}
          className="w-full bg-[#11111b] border border-[#313244] text-white rounded p-2 focus:outline-none focus:border-[#f9e2af] text-[11px] leading-relaxed resize-none whitespace-pre-wrap break-words"
        />
      </div>

      {/* Matches & Group Breakdown */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#a6e3a1]" /> Matches Found ({matches.length})
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="text-[10px] text-[#585b70] italic">// No match found for active pattern...</div>
        ) : (
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {matches.map((m, idx) => (
              <div key={idx} className="bg-[#11111b] p-2 rounded border border-[#313244] space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#a6e3a1]">Match #{idx + 1}</span>
                  <span className="text-[#585b70]">Index: {m.index}</span>
                </div>
                <div className="text-white font-bold bg-[#313244] p-1 rounded break-all text-[11px]">{m.text}</div>
                {m.groups.length > 0 && (
                  <div className="text-[9px] text-[#a6adc8] space-y-0.5 pt-1">
                    {m.groups.map((g, gi) => (
                      <div key={gi}>
                        Group ${gi + 1}: <span className="text-[#f9e2af] font-bold">{g}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regex Explainer */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
        <span className="text-[10px] font-bold text-[#a6adc8] uppercase block flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#89b4fa]" /> Plain-English Pattern Explainer
        </span>
        <div className="space-y-1">
          {explainerTokens.map((t, i) => (
            <div key={i} className="flex items-center justify-between bg-[#11111b] p-1.5 rounded text-[10px]">
              <code className="text-[#f9e2af] font-bold">{t.token}</code>
              <span className="text-[#a6adc8]">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
