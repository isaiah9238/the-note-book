import React, { useState } from "react";
import { MockEndpoint, NetworkLog } from "./types";
import { Network, Plus, Trash2, ToggleLeft, ToggleRight, Radio, RefreshCw, Send } from "lucide-react";

interface ApiMockerProps {
  mockEndpoints: MockEndpoint[];
  onUpdateEndpoints: (endpoints: MockEndpoint[]) => void;
  networkLogs: NetworkLog[];
  onClearLogs: () => void;
}

const DEFAULT_ENDPOINTS: MockEndpoint[] = [
  {
    id: "m-1",
    method: "GET",
    url: "/api/user",
    status: 200,
    response: JSON.stringify({ id: 101, username: "dev_architect", role: "admin", status: "active" }, null, 2),
    enabled: true
  },
  {
    id: "m-2",
    method: "POST",
    url: "/api/data",
    status: 201,
    response: JSON.stringify({ success: true, message: "Payload committed successfully", id: "tx-994" }, null, 2),
    enabled: true
  }
];

export default function ApiMocker({ mockEndpoints, onUpdateEndpoints, networkLogs, onClearLogs }: ApiMockerProps) {
  const [editingEndpoint, setEditingEndpoint] = useState<Partial<MockEndpoint>>({
    method: "GET",
    url: "/api/v1/status",
    status: 200,
    response: JSON.stringify({ status: "healthy", version: "3.6.0" }, null, 2),
    enabled: true
  });

  const handleAddEndpoint = () => {
    if (!editingEndpoint.url) return;
    const newEp: MockEndpoint = {
      id: `ep-${Date.now()}`,
      method: (editingEndpoint.method as any) || "GET",
      url: editingEndpoint.url.trim(),
      status: Number(editingEndpoint.status) || 200,
      response: editingEndpoint.response || "{}",
      enabled: true
    };
    onUpdateEndpoints([...mockEndpoints, newEp]);
    setEditingEndpoint({
      method: "GET",
      url: "/api/v1/new",
      status: 200,
      response: "{\n  \"ok\": true\n}",
      enabled: true
    });
  };

  const handleDeleteEndpoint = (id: string) => {
    onUpdateEndpoints(mockEndpoints.filter((e) => e.id !== id));
  };

  const handleToggleEndpoint = (id: string) => {
    onUpdateEndpoints(
      mockEndpoints.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Network Interceptor Setup */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Network className="w-4 h-4 text-[#89b4fa]" /> Network Interceptor & API Mocker
        </h3>

        {/* Add Mock Endpoint Form */}
        <div className="bg-[#11111b] p-2.5 rounded border border-[#313244] space-y-2">
          <span className="text-[10px] font-bold text-[#a6adc8] uppercase block">Create Mock Endpoint</span>
          <div className="grid grid-cols-12 gap-2">
            <select
              value={editingEndpoint.method}
              onChange={(e) => setEditingEndpoint({ ...editingEndpoint, method: e.target.value as any })}
              className="col-span-3 bg-[#181825] border border-[#313244] text-white rounded p-1 text-[11px] font-bold focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={editingEndpoint.url}
              onChange={(e) => setEditingEndpoint({ ...editingEndpoint, url: e.target.value })}
              placeholder="/api/route"
              className="col-span-6 bg-[#181825] border border-[#313244] text-white rounded p-1 text-[11px] focus:outline-none"
            />
            <input
              type="number"
              value={editingEndpoint.status}
              onChange={(e) => setEditingEndpoint({ ...editingEndpoint, status: Number(e.target.value) })}
              placeholder="Status (200)"
              className="col-span-3 bg-[#181825] border border-[#313244] text-white rounded p-1 text-[11px] focus:outline-none"
            />
          </div>

          <textarea
            value={editingEndpoint.response}
            onChange={(e) => setEditingEndpoint({ ...editingEndpoint, response: e.target.value })}
            rows={3}
            placeholder="JSON Response Body"
            className="w-full bg-[#181825] border border-[#313244] text-[#cdd6f4] rounded p-2 text-[10px] resize-none focus:outline-none whitespace-pre-wrap break-words"
          />

          <button
            onClick={handleAddEndpoint}
            className="w-full bg-[#89b4fa] text-[#11111b] font-bold py-1 rounded flex items-center justify-center gap-1 hover:bg-[#b4befe] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Mock Endpoint
          </button>
        </div>

        {/* Existing Endpoints List */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#a6adc8] uppercase block">Active Mock Rules ({mockEndpoints.length})</span>
          {mockEndpoints.length === 0 ? (
            <div className="text-[10px] text-[#585b70] italic">No active mock rules configured.</div>
          ) : (
            mockEndpoints.map((ep) => (
              <div
                key={ep.id}
                className="bg-[#11111b] p-2 rounded border border-[#313244] flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      ep.method === "GET"
                        ? "bg-[#89b4fa]/20 text-[#89b4fa]"
                        : ep.method === "POST"
                        ? "bg-[#a6e3a1]/20 text-[#a6e3a1]"
                        : "bg-[#f9e2af]/20 text-[#f9e2af]"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-bold text-white truncate">{ep.url}</span>
                  <span className="text-[10px] text-[#a6adc8]">({ep.status})</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleEndpoint(ep.id)}
                    className="text-[#a6adc8] hover:text-white cursor-pointer"
                  >
                    {ep.enabled ? (
                      <ToggleRight className="w-5 h-5 text-[#a6e3a1]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-[#585b70]" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteEndpoint(ep.id)}
                    className="text-[#a6adc8] hover:text-[#f38ba8] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Intercepted Live Network Log */}
      <div className="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#a6e3a1]" /> Intercepted Traffic ({networkLogs.length})
          </span>
          <button onClick={onClearLogs} className="text-[10px] text-[#a6adc8] hover:text-white cursor-pointer">
            Clear
          </button>
        </div>

        <div className="space-y-1 max-h-44 overflow-y-auto">
          {networkLogs.length === 0 ? (
            <div className="text-[10px] text-[#585b70] italic">// Sandbox fetch & XHR requests log here...</div>
          ) : (
            networkLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#11111b] p-2 rounded border border-[#313244] flex items-center justify-between text-[10px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[#585b70] font-mono">[{log.timestamp}]</span>
                  <span className="font-bold text-white">{log.method}</span>
                  <span className="text-[#a6adc8] truncate">{log.url}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={log.status < 400 ? "text-[#a6e3a1] font-bold" : "text-[#f38ba8] font-bold"}>
                    {log.status}
                  </span>
                  {log.mocked && (
                    <span className="bg-[#89b4fa]/20 text-[#89b4fa] px-1 py-0.2 rounded text-[8px] uppercase font-bold">
                      Mocked
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
