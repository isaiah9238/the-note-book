import React from "react";
import { Snapshot, VirtualFile } from "./types";
import { History, GitCommit, RotateCcw, Plus, CheckCircle, FileText } from "lucide-react";

interface SnapshotTimelineProps {
  snapshots: Snapshot[];
  onTakeSnapshot: (label?: string) => void;
  onRestoreSnapshot: (snapshot: Snapshot) => void;
  currentFiles: VirtualFile[];
}

export default function SnapshotTimeline({
  snapshots,
  onTakeSnapshot,
  onRestoreSnapshot,
  currentFiles
}: SnapshotTimelineProps) {
  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#cba6f7]" /> Micro-Git Timeline & Snapshots
          </h3>
          <button
            onClick={() => {
              const label = prompt("Enter snapshot commit label:", "Checkpoint - Auto Save");
              if (label) onTakeSnapshot(label);
            }}
            className="bg-[#cba6f7] text-[#11111b] font-bold px-3 py-1 rounded flex items-center gap-1 hover:bg-[#b4befe] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Take Snapshot
          </button>
        </div>

        <p className="text-[10px] text-[#a6adc8] leading-relaxed">
          Maintain an auto-save timeline allowing 1-click snapshot restores or time-travel debugging during heavy refactoring sessions.
        </p>

        {/* Current Working Tree Info */}
        <div className="bg-[#11111b] p-2 rounded border border-[#313244] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-4 h-4 text-[#a6e3a1]" /> Active Workspace Tree
          </div>
          <span className="text-[10px] text-[#a6adc8]">{currentFiles.length} File(s)</span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
        <span className="text-[10px] font-bold text-white uppercase block">Snapshot History ({snapshots.length})</span>

        {snapshots.length === 0 ? (
          <div className="text-[10px] text-[#585b70] italic">// Timeline history appears here...</div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="bg-[#11111b] p-2.5 rounded border border-[#313244] flex items-center justify-between transition-all hover:border-[#45475a]"
              >
                <div className="space-y-1 truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-[#cba6f7] shrink-0" />
                    <span className="font-bold text-white text-xs truncate">{snap.label}</span>
                  </div>
                  <div className="text-[10px] text-[#585b70] flex items-center gap-2">
                    <span>{snap.timestamp}</span>
                    <span>•</span>
                    <span>{snap.files.length} Files</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Restore workspace to snapshot "${snap.label}"?`)) {
                      onRestoreSnapshot(snap);
                    }
                  }}
                  className="bg-[#313244] hover:bg-[#89b4fa] hover:text-[#11111b] text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" /> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
