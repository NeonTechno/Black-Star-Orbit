/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — System Architecture & NASA Data Integration Roadmap
 */

import React, { useState } from 'react';
import { OFFICIAL_NASA_DATA_SOURCES, testEndpointReadiness } from '../../science/dataConnector.ts';
import {
  Database,
  Telescope,
  Orbit,
  Sparkles,
  Server,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<
    Record<string, { reachable: boolean; latencyMs: number; message: string }>
  >({});

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800/60">
            System Architecture & NASA Integration
          </span>
          <span className="font-mono text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Full-Stack Production Design
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          COSMIC FRONTIER — NASA Space Apps Challenge 2026
        </h2>
        <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
          An extensible, modular full-stack astronomy workbench uniting SPHEREx all-sky infrared spectrophotometry with the outer solar system Planet X candidate discovery challenge. Built with strict separation of concerns, scientific integrity guardrails, and server-side artificial intelligence.
        </p>
      </div>

      {/* Grid of Key Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="h-10 w-10 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center">
            <Telescope className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            1. SPHEREx Spectrophotometry
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Engineered to handle SPHEREx's 102 continuous spectral channels across 6 Hawaii-2RG focal plane arrays (0.75 - 5.00 µm). Features multi-epoch time-lapse, asinh flux stretching, and difference image subtraction for transient alerts.
          </p>
          <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] text-cyan-400">
            Resolution: R ~ 40 to 130
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="h-10 w-10 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center">
            <Orbit className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            2. Planet X Orbital Dynamics
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Incorporates the Batygin & Brown (2021) theoretical baseline (a ≈ 380 AU, e ≈ 0.35, M ≈ 6.2 Earth masses), extreme TNO orbital clustering significance (p &lt; 0.001), annual reflex parallax fitting, and citizen science vetting.
          </p>
          <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] text-indigo-400">
            Parallax Sensitivity: π ~ 2.5 mas
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="h-10 w-10 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            3. Grounded Gemini AI Engine
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Gemini 3.8 Flash SDK integration deployed strictly server-side with zero client exposure of API keys. Grounding directives strictly prohibit hallucinating coordinates or undiscovered candidates.
          </p>
          <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] text-purple-400">
            Model: gemini-3.8-flash (Server-Side)
          </div>
        </div>
      </div>

      {/* Official Data Integration & Protocol Diagnostic Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                NASA & Caltech/IPAC Data Connector Status
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time ping diagnostic of astronomical endpoints and protocol interfaces
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Total Endpoints: {OFFICIAL_NASA_DATA_SOURCES.length}
          </span>
        </div>

        <div className="space-y-3">
          {OFFICIAL_NASA_DATA_SOURCES.map((source) => {
            const ping = pingResults[source.serviceId];
            const isTesting = testingId === source.serviceId;

            return (
              <div
                key={source.serviceId}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2 text-xs font-mono"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{source.name}</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
                        {source.protocol}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{source.organization}</span>
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
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                    >
                      <RefreshCw className={`h-3 w-3 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {source.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                  <span className="truncate max-w-md text-slate-500">
                    Endpoint: {source.endpointUrl}
                  </span>
                  <a
                    href={source.documentationRef}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    <span>Documentation</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {ping && (
                  <div
                    className={`p-2.5 rounded-lg text-[11px] flex items-center justify-between ${
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

      {/* Integration Roadmap & Next Steps */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <Clock className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Remaining Integrations & Testing Roadmap (Post-Challenge Deployment)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block text-sm">
              SPHEREx Data Access Roadmap
            </span>
            <ul className="space-y-1.5 text-slate-300 font-sans leading-relaxed text-[11px]">
              <li>
                <strong>1. In-Orbit Commissioning:</strong> SPHEREx completes its initial 6-month all-sky survey pass.
              </li>
              <li>
                <strong>2. Real IVOA TAP Integration:</strong> Replace the <code>/api/spherex/synthetic-pipeline</code> proxy with live queries against <code>irsa.ipac.caltech.edu/TAP</code> once the public Data Release 1 (DR1) table schema is finalized.
              </li>
              <li>
                <strong>3. Full FITS Streaming:</strong> Implement binary streaming parser for 3D multi-gigabyte spectral datacubes using WebGL or WebGPU shader pipelines.
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-indigo-400 font-bold block text-sm">
              Planet X Discovery Roadmap
            </span>
            <ul className="space-y-1.5 text-slate-300 font-sans leading-relaxed text-[11px]">
              <li>
                <strong>1. Vera C. Rubin Observatory (LSST):</strong> Hook into real-time Rubin alert brokers (Antares, Alerce, Fink) for slow-moving faint optical transients ($r &gt; 23$).
              </li>
              <li>
                <strong>2. Automated Multi-Arc Fitting:</strong> Implement full n-body numerical integration (REBOUND / Mercury) in WebAssembly for on-the-fly candidate orbit stability verification.
              </li>
              <li>
                <strong>3. MPC Recovery Submission:</strong> Connect with Minor Planet Center API to automatically generate standard 80-column observation records for vetted candidates.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
