/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Official NASA Data Integration & Endpoint Diagnostic Guide
 */

import React, { useState } from 'react';
import { OFFICIAL_NASA_DATA_SOURCES, testEndpointReadiness } from '../../science/dataConnector.ts';
import {
  Database,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Activity,
  X,
  RefreshCw,
  Server,
  Layers,
  Code2,
} from 'lucide-react';

interface DataIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataIntegrationModal: React.FC<DataIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<
    Record<string, { reachable: boolean; latencyMs: number; message: string }>
  >({});

  if (!isOpen) return null;

  const handleTestPing = async (serviceId: string) => {
    setTestingId(serviceId);
    try {
      const res = await testEndpointReadiness(serviceId);
      setPingResults((prev) => ({
        ...prev,
        [serviceId]: {
          reachable: res.isReachable,
          latencyMs: res.latencyMs,
          message: res.message,
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                NASA & Caltech/IPAC Data Integration Architecture
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Official APIs, VO Protocols, and Pre-Commissioning Data Pipeline Status
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Simulated vs Real Data Boundary Banner */}
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-3 text-xs text-amber-200/90 flex items-start space-x-3 font-mono">
          <ShieldAlert className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-300 uppercase tracking-wide">
              MANDATORY NASA SCIENTIFIC INTEGRITY DECLARATION
            </div>
            <p className="leading-relaxed text-amber-200/80">
              In accordance with NASA Open Science principles and the Space Apps Challenge guidelines:
              Real SPHEREx in-orbit spectroscopic observations will become publicly accessible via Caltech/IPAC IRSA following post-launch commissioning. All demonstration observations in this workbench are rigorously calibrated synthetic benchmarks generated in exact alignment with the SPHEREx Level 2/3 instrument point spread function (6.2″) and Hawaii-2RG filter profiles.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Section 1: Official Data Sources Registry */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-mono">
              <Server className="h-4 w-4 text-cyan-400" />
              <span>Target Endpoints & Protocol Connectors</span>
            </h4>

            <div className="space-y-3">
              {OFFICIAL_NASA_DATA_SOURCES.map((source) => {
                const ping = pingResults[source.serviceId];
                const isTesting = testingId === source.serviceId;

                return (
                  <div
                    key={source.serviceId}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{source.name}</span>
                          <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                            {source.protocol}
                          </span>
                        </div>
                        <span className="text-[11px] text-cyan-400">{source.organization}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            source.status === 'ONLINE_AVAILABLE'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : source.status === 'PRE_LAUNCH_SPEC'
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {source.status.replace('_', ' ')}
                        </span>

                        <button
                          disabled={isTesting}
                          onClick={() => handleTestPing(source.serviceId)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <RefreshCw className={`h-3 w-3 ${isTesting ? 'animate-spin' : ''}`} />
                          <span>{isTesting ? 'Testing...' : 'Ping Test'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {source.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span className="truncate max-w-sm text-slate-500">
                        Endpoint: {source.endpointUrl}
                      </span>
                      <a
                        href={source.documentationRef}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        <span>Official Docs</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {ping && (
                      <div
                        className={`p-2 rounded text-[11px] flex items-center justify-between ${
                          ping.reachable
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                            : 'bg-red-950/40 text-red-300 border border-red-800/40'
                        }`}
                      >
                        <span>{ping.message}</span>
                        <span className="font-bold">{ping.latencyMs} ms latency</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Architectural Separation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs font-mono">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-purple-400" />
              <span>Full-Stack Engineering & Decoupling Model</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block">1. Frontend Layer</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  React 19 + TypeScript with HTML5 Canvas acceleration for FITS pixel rendering, dynamic asinh/log flux stretching, and multi-epoch blink comparisons.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold block">2. Scientific Core</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Isolated in <code>src/science/</code>: Keplerian orbital mechanics, eTNO Rayleigh Z-clustering, image difference subtraction, and 102-channel LVF table.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">3. Backend & AI Security</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Express.js server strictly holds API keys on the server. Calls <code>gemini-3.8-flash</code> via <code>@google/genai</code> with non-negotiable scientific grounding directives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono rounded-lg transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
