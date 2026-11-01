import React, { useState } from "react";
import { TestCaseResult, VirtualFile } from "./types";
import { Play, CheckCircle2, XCircle, TestTube, Code2, RefreshCw } from "lucide-react";

interface UnitTestRunnerProps {
  virtualFiles: VirtualFile[];
}

const DEFAULT_TEST_CODE = `// Embedded Micro-Test Suite
describe("Math & Logic Suite", () => {
  it("computes heavy math correctly", () => {
    // Calling workspace function if available
    if (typeof runHeavyMath === "function") {
      const res = runHeavyMath(true);
      expect(res).toBe(385);
    } else {
      expect(10 + 20).toBe(30);
    }
  });

  it("handles empty payloads gracefully", () => {
    if (typeof runHeavyMath === "function") {
      const res = runHeavyMath(false);
      expect(res).toBe(0);
    } else {
      expect("notebook".length).toBe(8);
    }
  });

  it("validates string operations", () => {
    const text = "System Design Console";
    expect(text.includes("System")).toBe(true);
  });
});
`;

export default function UnitTestRunner({ virtualFiles }: UnitTestRunnerProps) {
  const [testCode, setTestCode] = useState(DEFAULT_TEST_CODE);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState<number | null>(null);

  const runUnitTestSuite = () => {
    setIsRunning(true);
    setTestResults([]);
    const startTime = performance.now();

    setTimeout(() => {
      const results: TestCaseResult[] = [];
      const jsFiles = virtualFiles.filter((f) => f.language === "javascript");
      const combinedJs = jsFiles.map((f) => f.content).join("\n\n");

      let currentSuite = "Global Test Suite";

      const describe = (suiteName: string, fn: () => void) => {
        currentSuite = suiteName;
        try {
          fn();
        } catch (err: any) {
          results.push({
            suiteName,
            testName: "Suite Execution",
            passed: false,
            error: err.message,
            durationMs: 0
          });
        }
      };

      const it = (testName: string, fn: () => void) => {
        const t0 = performance.now();
        try {
          fn();
          const durationMs = Math.round((performance.now() - t0) * 100) / 100;
          results.push({
            suiteName: currentSuite,
            testName,
            passed: true,
            durationMs
          });
        } catch (err: any) {
          const durationMs = Math.round((performance.now() - t0) * 100) / 100;
          results.push({
            suiteName: currentSuite,
            testName,
            passed: false,
            error: err.message || String(err),
            durationMs
          });
        }
      };

      const expect = (actual: any) => ({
        toBe: (expected: any) => {
          if (actual !== expected) {
            throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
          }
        },
        toEqual: (expected: any) => {
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`Expected equal objects, received ${JSON.stringify(actual)}`);
          }
        },
        toBeTruthy: () => {
          if (!actual) {
            throw new Error(`Expected truthy value, received ${JSON.stringify(actual)}`);
          }
        },
        toBeFalsy: () => {
          if (actual) {
            throw new Error(`Expected falsy value, received ${JSON.stringify(actual)}`);
          }
        }
      });

      try {
        // Execute combined workspace JS first, then run unit test code
        const runnerFn = new Function("describe", "it", "expect", `${combinedJs}\n\n${testCode}`);
        runnerFn(describe, it, expect);
      } catch (err: any) {
        results.push({
          suiteName: "Compilation",
          testName: "Syntax / Execution",
          passed: false,
          error: err.message,
          durationMs: 0
        });
      }

      setTotalTime(Math.round((performance.now() - startTime) * 100) / 100);
      setTestResults(results);
      setIsRunning(false);
    }, 150);
  };

  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TestTube className="w-4 h-4 text-[#a6e3a1]" /> Embedded Test Runner
          </h3>
          <button
            onClick={runUnitTestSuite}
            disabled={isRunning}
            className="bg-[#a6e3a1] text-[#11111b] font-bold px-3 py-1 rounded flex items-center gap-1.5 hover:bg-[#89b4fa] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? "Running..." : "Run Tests"}</span>
          </button>
        </div>

        {/* Test Code Editor */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#a6adc8] uppercase tracking-wider block font-bold">
            Assertions Code
          </label>
          <textarea
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            rows={8}
            className="w-full bg-[#11111b] border border-[#313244] text-[#cdd6f4] rounded p-2 focus:outline-none focus:border-[#a6e3a1] text-[11px] leading-relaxed resize-none whitespace-pre-wrap break-words"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Summary Bar */}
      {testResults.length > 0 && (
        <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#313244] pb-2">
            <div className="flex items-center gap-3">
              <span className="text-[#a6e3a1] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {passedCount} Passed
              </span>
              {failedCount > 0 && (
                <span className="text-[#f38ba8] font-bold flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {failedCount} Failed
                </span>
              )}
            </div>
            {totalTime !== null && <span className="text-[10px] text-[#a6adc8]">{totalTime} ms</span>}
          </div>

          {/* Test Items List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {testResults.map((res, i) => (
              <div
                key={i}
                className={`p-2 rounded border text-xs leading-relaxed flex flex-col gap-1 ${
                  res.passed
                    ? "bg-[#a6e3a1]/10 border-[#a6e3a1]/30 text-[#a6e3a1]"
                    : "bg-[#f38ba8]/10 border-[#f38ba8]/30 text-[#f38ba8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {res.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>
                      {res.suiteName} &gt; {res.testName}
                    </span>
                  </span>
                  <span className="text-[10px] opacity-75">{res.durationMs}ms</span>
                </div>
                {res.error && (
                  <div className="text-[10px] bg-black/40 p-1.5 rounded font-mono text-[#f38ba8] break-all mt-1">
                    Error: {res.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
