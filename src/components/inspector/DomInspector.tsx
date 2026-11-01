import React, { useState, useEffect } from "react";
import { MousePointer, Box, Layers, Code, Sparkles, CheckCircle } from "lucide-react";

interface DomElementDetails {
  tagName: string;
  id: string;
  className: string;
  innerText: string;
  rect: { width: number; height: number; top: number; left: number };
  computedStyle: {
    color: string;
    backgroundColor: string;
    fontSize: string;
    display: string;
    margin: string;
    padding: string;
  };
  sourceLine?: number;
}

interface DomInspectorProps {
  pickerActive: boolean;
  onTogglePicker: () => void;
  selectedElement: DomElementDetails | null;
}

export default function DomInspector({ pickerActive, onTogglePicker, selectedElement }: DomInspectorProps) {
  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Header Controls */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-[#89b4fa]" /> Visual DOM Inspector & Picker
          </h3>
          <button
            onClick={onTogglePicker}
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              pickerActive
                ? "bg-[#89b4fa] text-[#11111b] ring-2 ring-white/20 animate-pulse"
                : "bg-[#313244] text-white hover:bg-[#45475a]"
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>{pickerActive ? "Inspect Mode Active" : "Inspect Element"}</span>
          </button>
        </div>

        <p className="text-[10px] text-[#a6adc8] leading-relaxed">
          Hover or click rendered DOM elements inside the compiled iframe to highlight their exact HTML source line and CSS declarations.
        </p>
      </div>

      {/* Selected Element Details */}
      {selectedElement ? (
        <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#313244] pb-2">
            <span className="text-xs font-bold text-[#89b4fa]">
              &lt;{selectedElement.tagName.toLowerCase()}
              {selectedElement.id ? ` id="${selectedElement.id}"` : ""}
              {selectedElement.className ? ` class="${selectedElement.className.split(" ")[0]}..."` : ""}&gt;
            </span>
            <span className="text-[10px] text-[#a6adc8]">
              {Math.round(selectedElement.rect.width)} × {Math.round(selectedElement.rect.height)} px
            </span>
          </div>

          {/* Computed CSS Declarations */}
          <div className="space-y-1.5 bg-[#11111b] p-2.5 rounded border border-[#313244] text-[11px]">
            <span className="text-[10px] font-bold text-[#a6adc8] uppercase block">Computed CSS Properties</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>Display: <span className="text-white font-bold">{selectedElement.computedStyle.display}</span></div>
              <div>Font Size: <span className="text-white font-bold">{selectedElement.computedStyle.fontSize}</span></div>
              <div className="truncate">Color: <span className="text-[#a6e3a1] font-bold">{selectedElement.computedStyle.color}</span></div>
              <div className="truncate">BG: <span className="text-[#f9e2af] font-bold">{selectedElement.computedStyle.backgroundColor}</span></div>
            </div>
          </div>

          {/* CSS Box Model Visual Representation */}
          <div className="bg-[#11111b] p-3 rounded border border-[#313244] space-y-2 text-[10px]">
            <span className="text-[10px] font-bold text-[#a6adc8] uppercase block flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-[#cba6f7]" /> Box Model
            </span>
            <div className="bg-[#f9e2af]/20 border border-[#f9e2af]/40 p-2 text-center rounded text-white">
              <span className="text-[9px] uppercase font-bold text-[#f9e2af]">Margin ({selectedElement.computedStyle.margin})</span>
              <div className="bg-[#89b4fa]/20 border border-[#89b4fa]/40 p-2 my-1 text-center rounded">
                <span className="text-[9px] uppercase font-bold text-[#89b4fa]">Padding ({selectedElement.computedStyle.padding})</span>
                <div className="bg-[#a6e3a1]/20 border border-[#a6e3a1]/40 p-2 text-center rounded text-white font-bold">
                  Content ({Math.round(selectedElement.rect.width)} × {Math.round(selectedElement.rect.height)})
                </div>
              </div>
            </div>
          </div>

          {selectedElement.innerText && (
            <div className="bg-[#11111b] p-2 rounded border border-[#313244] text-[10px]">
              <span className="text-[#a6adc8] block font-bold uppercase mb-1">Inner Text Snippet</span>
              <p className="text-white truncate italic">"{selectedElement.innerText}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#181825] border border-[#313244] rounded-lg p-4 text-center text-[#585b70] text-xs space-y-2">
          <MousePointer className="w-6 h-6 mx-auto opacity-50" />
          <p>Click "Inspect Element" above and hover/click any element in the iframe sandbox to inspect.</p>
        </div>
      )}
    </div>
  );
}
