import React from "react";
import { EditorSettingsConfig, EditorTheme } from "./types";
import { Sliders, Check } from "lucide-react";

interface EditorSettingsProps {
  settings: EditorSettingsConfig;
  onUpdateSettings: (newSettings: EditorSettingsConfig) => void;
}

export const THEME_STYLES: Record<EditorTheme, { bg: string; text: string; sidebar: string; border: string; accent: string; lineNum: string }> = {
  catppuccin: {
    bg: "#1e1e2e",
    text: "#cdd6f4",
    sidebar: "#11111b",
    border: "#313244",
    accent: "#cba6f7",
    lineNum: "#585b70"
  },
  dracula: {
    bg: "#282a36",
    text: "#f8f8f2",
    sidebar: "#21222c",
    border: "#44475a",
    accent: "#ff79c6",
    lineNum: "#6272a4"
  },
  "one-dark": {
    bg: "#282c34",
    text: "#abb2bf",
    sidebar: "#21252b",
    border: "#3b4048",
    accent: "#61afef",
    lineNum: "#4b5263"
  },
  nord: {
    bg: "#2e3440",
    text: "#d8dee9",
    sidebar: "#242933",
    border: "#434c5e",
    accent: "#88c0d0",
    lineNum: "#4c566a"
  },
  cyberpunk: {
    bg: "#0d0221",
    text: "#00f0ff",
    sidebar: "#050014",
    border: "#ff0055",
    accent: "#ffe600",
    lineNum: "#7000ff"
  },
  light: {
    bg: "#f8f9fa",
    text: "#212529",
    sidebar: "#e9ecef",
    border: "#dee2e6",
    accent: "#0d6efd",
    lineNum: "#adb5bd"
  }
};

export const FONT_FAMILIES = [
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { name: "Fira Code", value: "'Fira Code', monospace" },
  { name: "Monaco", value: "Monaco, Consolas, monospace" },
  { name: "System Monospace", value: "ui-monospace, SFMono-Regular, Menlo, monospace" }
];

export default function EditorSettings({ settings, onUpdateSettings }: EditorSettingsProps) {
  return (
    <div className="space-y-4 p-1">
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
          <Sliders className="w-4 h-4 text-[#cba6f7]" /> Editor Themes & Customization
        </h3>

        {/* Theme Grid */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#a6adc8] uppercase tracking-wider block font-mono">
            Color Scheme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(THEME_STYLES) as EditorTheme[]).map((themeKey) => {
              const style = THEME_STYLES[themeKey];
              const isSelected = settings.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  onClick={() => onUpdateSettings({ ...settings, theme: themeKey })}
                  className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-all ${
                    isSelected ? "border-[#cba6f7] ring-1 ring-[#cba6f7]" : "border-[#313244] hover:border-[#45475a]"
                  }`}
                  style={{ backgroundColor: style.sidebar, color: style.text }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: style.accent }}
                    />
                    <span className="capitalize font-mono text-[11px] font-medium">{themeKey.replace("-", " ")}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#a6e3a1]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size & Family */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#a6adc8] uppercase tracking-wider block font-mono">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min={11}
              max={22}
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })}
              className="w-full accent-[#cba6f7] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#a6adc8] uppercase tracking-wider block font-mono">
              Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => onUpdateSettings({ ...settings, fontFamily: e.target.value })}
              className="w-full bg-[#11111b] border border-[#313244] text-[#cdd6f4] rounded p-1 text-[11px] font-mono focus:outline-none"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2 border-t border-[#313244] text-xs font-mono">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[#a6adc8]">Show Line Numbers</span>
            <input
              type="checkbox"
              checked={settings.showLineNumbers}
              onChange={(e) => onUpdateSettings({ ...settings, showLineNumbers: e.target.checked })}
              className="accent-[#cba6f7] cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[#a6adc8]">Word Wrap</span>
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => onUpdateSettings({ ...settings, wordWrap: e.target.checked })}
              className="accent-[#cba6f7] cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
