/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Grounded Gemini Scientific Intelligence Copilot
 * NASA Space Apps Challenge 2026
 */

import React, { useState } from 'react';
import { GeminiExplanationResponse } from '../../types/index.ts';
import {
  Sparkles,
  ShieldCheck,
  Send,
  X,
  BookOpen,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Cpu,
  FileCode,
} from 'lucide-react';

interface CosmicAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeContextType: string;
  activePayload: Record<string, unknown> | null;
}

export const CosmicAiAssistant: React.FC<CosmicAiAssistantProps> = ({
  isOpen,
  onClose,
  activeContextType,
  activePayload,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<GeminiExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestExplanation = async (customPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const payloadToSend = activePayload || {
        mission: 'NASA Space Apps Challenge 2026',
        topic: 'Cosmic Frontier Astronomy Architecture',
        spherexBands: 102,
        wavelengthRangeMicrons: '0.75 - 5.00',
        planetXHypothesis: 'Batygin & Brown (2021)',
      };

      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextType: activeContextType || 'general_science',
          dataPayload: payloadToSend,
          userPrompt: customPrompt || userQuery,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: GeminiExplanationResponse = await res.json();
      setResponse(data);
    } catch (err: unknown) {
      console.error('Explanation request failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to retrieve grounded AI explanation.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'Explain the physics of interstellar H2O (3.05µm) and CO2 (4.27µm) ice absorption.',
    'How does annual parallactic reflex motion distinguish Planet X from foreground asteroids?',
    'What is the Rayleigh test significance for the extreme TNO clustering?',
    'How does SPHEREx Linear Variable Filter (LVF) spectrometry differ from dispersive grating spectrographs?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  COSMIC FRONTIER Scientific Intelligence Copilot
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Grounded Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Active Grounded Context: <span className="text-cyan-300 font-semibold">{activeContextType}</span>
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

        {/* Scientific Grounding Guardrail Banner */}
        <div className="bg-cyan-950/30 border-b border-cyan-800/30 px-4 py-2.5 text-xs text-cyan-200/90 flex items-center space-x-2 font-mono">
          <ShieldCheck className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span>
            Strict grounding enforced: The AI engine explains verified metadata and physical laws; it is restricted from inventing observations or coordinates.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Preset question pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400 block">Suggested Scientific Inquiries:</span>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setUserQuery(q);
                    handleRequestExplanation(q);
                  }}
                  className="text-left text-xs bg-slate-900 border border-slate-800 hover:border-cyan-600/50 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Active Context Telemetry Payload Inspector */}
          {activePayload && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                  Verified Context Attributes:
                </span>
                <span className="text-emerald-400 text-[10px]">VERIFIED GROUND TRUTH</span>
              </div>
              <div className="text-[11px] text-slate-300 max-h-24 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-800">
                <pre>{JSON.stringify(activePayload, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Response Container */}
          {isLoading && (
            <div className="p-8 text-center space-y-3 bg-slate-900/40 rounded-xl border border-slate-800">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-xs font-mono text-slate-300">
                Synthesizing grounded astrophysical explanation with Gemini...
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs font-mono text-red-200">
              {error}
            </div>
          )}

          {response && !isLoading && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle className="h-4 w-4" /> Grounded Analysis Complete
                </span>
                <span className="text-slate-400 text-[10px]">
                  Engine: {response.modelUsed}
                </span>
              </div>

              {/* Formatted Markdown Explanation */}
              <div className="text-sm text-slate-200 leading-relaxed font-sans space-y-2 whitespace-pre-line">
                {response.explanation}
              </div>

              {/* Scientific literature citations */}
              {response.scientificReferences && response.scientificReferences.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                    <BookOpen className="h-3.5 w-3.5" /> Peer-Reviewed References:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                    {response.scientificReferences.map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRequestExplanation()}
            placeholder="Ask Gemini to explain any verified observation, spectrum, or orbital parameter..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            disabled={isLoading}
            onClick={() => handleRequestExplanation()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Inquire</span>
          </button>
        </div>
      </div>
    </div>
  );
};
