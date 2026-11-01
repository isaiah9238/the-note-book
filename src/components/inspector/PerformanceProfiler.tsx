import React, { useState } from "react";
import { VirtualFile } from "./types";
import { Gauge, Play, Activity, Cpu, Zap, RefreshCw } from "lucide-react";

interface PerformanceProfilerProps {
  virtualFiles: VirtualFile[];
}

export default function PerformanceProfiler({ virtualFiles }: PerformanceProfilerProps) {
  const [benchmarkCode, setBenchmarkCode] = useState(
    `// Benchmarking Target Script\nif (typeof runHeavyMath === "function") {\n  runHeavyMath(true);\n} else {\n  let sum = 0;\n  for (let i = 0; i < 50; i++) sum += Math.sqrt(i);\n}`
  );
  const [iterations, setIterations] = useState(10000);
  const [isProfiling, setIsProfiling] = useState(false);
  const [results, setResults] = useState<{
    totalMs: number;
    avgMs: number;
    opsPerSec: number;
    minMs: number;
    maxMs: number;
    memoryAllocKb: number;
  } | null>(null);

  const runProfiler = () => {
    setIsProfiling(true);
    setResults(null);

    setTimeout(() => {
      const jsFiles = virtualFiles.filter((f) => f.language === "javascript");
      const combinedJs = jsFiles.map((f) => f.content).join("\n\n");

      try {
        const benchmarkFn = new Function(`${combinedJs}\n\nreturn function() {\n${benchmarkCode}\n};`)();

        // Warm up JIT
        for (let i = 0; i < 100; i++) {
          benchmarkFn();
        }

        const times: number[] = [];
        const memStart = (performance as any).memory?.usedJSHeapSize || 0;
        const startTotal = performance.now();

        for (let i = 0; i < iterations; i++) {
          const t0 = performance.now();
          benchmarkFn();
          times.push(performance.now() - t0);
        }

        const endTotal = performance.now();
        const memEnd = (performance as any).memory?.usedJSHeapSize || 0;

        const totalMs = endTotal - startTotal;
        const avgMs = totalMs / iterations;
        const opsPerSec = Math.round(1000 / (avgMs || 0.0001));
        const minMs = Math.min(...times);
        const maxMs = Math.max(...times);
        const memoryAllocKb = Math.max(0, Math.round((memEnd - memStart) / 1024));

        setResults({
          totalMs: Math.round(totalMs * 100) / 100,
          avgMs: Math.round(avgMs * 10000) / 10000,
          opsPerSec,
          minMs: Math.round(minMs * 10000) / 10000,
          maxMs: Math.round(maxMs * 1000) / 1000,
          memoryAllocKb
        });
      } catch (err: any) {
        alert("Profiler Error: " + err.message);
      } finally {
        setIsProfiling(false);
      }
    }, 150);
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#f9e2af]" /> Function Profiler & Benchmarking
          </h3>
          <button
            onClick={runProfiler}
            disabled={isProfiling}
            className="bg-[#f9e2af] text-[#11111b] font-bold px-3 py-1 rounded flex items-center gap-1 hover:bg-[#89b4fa] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isProfiling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isProfiling ? "Benchmarking..." : "Benchmark"}</span>
          </button>
        </div>

        {/* Script Selection / Code Area */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#a6adc8] uppercase tracking-wider block font-bold">
            Code Snippet to Benchmark
          </label>
          <textarea
            value={benchmarkCode}
            onChange={(e) => setBenchmarkCode(e.target.value)}
            rows={5}
            className="w-full bg-[#11111b] border border-[#313244] text-[#cdd6f4] rounded p-2 focus:outline-none focus:border-[#f9e2af] text-[11px] leading-relaxed resize-none whitespace-pre-wrap break-words"
            spellCheck={false}
          />
        </div>

        {/* Iterations selector */}
        <div className="flex items-center justify-between bg-[#11111b] p-2 rounded border border-[#313244]">
          <span className="text-[10px] text-[#a6adc8] uppercase font-bold">Sample Iterations</span>
          <select
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            className="bg-[#181825] border border-[#313244] text-white rounded px-2 py-0.5 text-xs font-bold focus:outline-none"
          >
            <option value={1000}>1,000 runs</option>
            <option value={10000}>10,000 runs</option>
            <option value={50000}>50,000 runs</option>
            <option value={100000}>100,000 runs</option>
          </select>
        </div>
      </div>

      {/* Profiler Metrics Output */}
      {results && (
        <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#a6e3a1]" /> Benchmark Results
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#11111b] p-2.5 rounded border border-[#313244]">
              <span className="text-[9px] uppercase text-[#a6adc8] block font-bold">Ops / Second</span>
              <span className="text-base font-bold text-[#a6e3a1]">{results.opsPerSec.toLocaleString()}</span>
            </div>
            <div className="bg-[#11111b] p-2.5 rounded border border-[#313244]">
              <span className="text-[9px] uppercase text-[#a6adc8] block font-bold">Total Duration</span>
              <span className="text-base font-bold text-white">{results.totalMs} ms</span>
            </div>
            <div className="bg-[#11111b] p-2.5 rounded border border-[#313244]">
              <span className="text-[9px] uppercase text-[#a6adc8] block font-bold">Avg Call Time</span>
              <span className="text-xs font-bold text-[#89b4fa]">{results.avgMs} ms</span>
            </div>
            <div className="bg-[#11111b] p-2.5 rounded border border-[#313244]">
              <span className="text-[9px] uppercase text-[#a6adc8] block font-bold">Min / Max Time</span>
              <span className="text-xs font-bold text-[#cba6f7]">
                {results.minMs} / {results.maxMs} ms
              </span>
            </div>
          </div>

          <div className="bg-[#11111b] p-2 rounded border border-[#313244] text-[10px] text-[#a6adc8]">
            <span className="font-bold text-white uppercase">Memory Snapshot:</span>{" "}
            {results.memoryAllocKb > 0 ? `~${results.memoryAllocKb} KB heap delta` : "Sub-alloc Heap (Opt)"}
          </div>
        </div>
      )}
    </div>
  );
}
