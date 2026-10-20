/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — NASA Space Apps Challenge 2026
 * Full-Stack Astronomy Web Application
 * 
 * Modules:
 * 1. SPHEREx Explorer (Spectrophotometric all-sky infrared imaging)
 * 2. Planet X Explorer (Outer solar system candidate investigation)
 * 3. NASA Data & Architecture (Official IPAC/IRSA specifications & roadmap)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SpherexViewer } from './components/spherex/SpherexViewer.tsx';
import { PlanetXDashboard } from './components/planetx/PlanetXDashboard.tsx';
import { ArchitectureView } from './components/data/ArchitectureView.tsx';
import { CosmicAiAssistant } from './components/ai/CosmicAiAssistant.tsx';
import { DataIntegrationModal } from './components/data/DataIntegrationModal.tsx';
import {
  SpherexObservation,
  PlanetXCandidate,
  ExtremeTNO,
  PlanetXHypothesisParams,
} from './types/index.ts';
import { generateSyntheticSpherexObservations } from './science/spherexEngine.ts';
import {
  VERIFIED_ETNO_CATALOG,
  DEFAULT_PLANET_X_HYPOTHESIS,
  INITIAL_CANDIDATE_QUEUE,
} from './science/orbitalMechanics.ts';
import { ShieldCheck, Compass, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'spherex' | 'planetx' | 'architecture'>('spherex');
  const [serverOk, setServerOk] = useState<boolean>(true);

  // SPHEREx State
  const [spherexObservations, setSpherexObservations] = useState<SpherexObservation[]>([]);
  const [isSpherexLoading, setIsSpherexLoading] = useState<boolean>(true);
  const [spherexError, setSpherexError] = useState<string | null>(null);

  // Planet X State
  const [candidates, setCandidates] = useState<PlanetXCandidate[]>([]);
  const [etnoCatalog, setEtnoCatalog] = useState<ExtremeTNO[]>([]);
  const [hypothesis, setHypothesis] = useState<PlanetXHypothesisParams>(DEFAULT_PLANET_X_HYPOTHESIS);

  // Modals & AI State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [aiContextType, setAiContextType] = useState<string>('general_science');
  const [aiPayload, setAiPayload] = useState<Record<string, unknown> | null>(null);

  // Fetch initial telemetry from backend
  const loadData = useCallback(async () => {
    setIsSpherexLoading(true);
    setSpherexError(null);

    try {
      // Health check
      fetch('/api/health')
        .then((r) => r.json())
        .then(() => setServerOk(true))
        .catch(() => setServerOk(false));

      // SPHEREx observations
      const obsRes = await fetch('/api/spherex/observations');
      if (obsRes.ok) {
        const obsData = await obsRes.json();
        setSpherexObservations(obsData.observations || []);
      } else {
        // Fallback to client-side scientific generator
        setSpherexObservations(generateSyntheticSpherexObservations());
      }

      // Planet X candidates
      const candRes = await fetch('/api/planetx/candidates');
      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData.candidates || INITIAL_CANDIDATE_QUEUE);
        if (candData.hypothesis) setHypothesis(candData.hypothesis);
      } else {
        setCandidates(INITIAL_CANDIDATE_QUEUE);
      }

      // eTNO catalog
      const etnoRes = await fetch('/api/planetx/etno-catalog');
      if (etnoRes.ok) {
        const etnoData = await etnoRes.json();
        setEtnoCatalog(etnoData.objects || VERIFIED_ETNO_CATALOG);
      } else {
        setEtnoCatalog(VERIFIED_ETNO_CATALOG);
      }
    } catch (err: unknown) {
      console.warn('Backend fetch failed, utilizing client-side scientific fallback:', err);
      setSpherexObservations(generateSyntheticSpherexObservations());
      setCandidates(INITIAL_CANDIDATE_QUEUE);
      setEtnoCatalog(VERIFIED_ETNO_CATALOG);
    } finally {
      setIsSpherexLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Vetting handler
  const handleVetCandidate = async (
    id: string,
    status: PlanetXCandidate['status'],
    notes: string,
    verdict: string
  ) => {
    try {
      const res = await fetch(`/api/planetx/candidates/${id}/vet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, verdict }),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? data.candidate : c))
        );
        return;
      }
    } catch (err) {
      console.error('Failed to update candidate on server:', err);
    }

    // Local fallback update
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              notes,
              vettedBy: 'Space Apps Researcher / You',
              vettingTimestamp: new Date().toISOString(),
              vettingVerdict: verdict,
            }
          : c
      )
    );
  };

  // Open AI modal with context
  const handleExplainWithAi = (
    contextType: string,
    payload: Record<string, unknown>,
    _prompt?: string
  ) => {
    setAiContextType(contextType);
    setAiPayload(payload);
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col cosmic-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAssistant={() => {
          setAiContextType('general_science');
          setAiPayload({
            mission: 'NASA Space Apps Challenge 2026',
            spherexStatus: 'Level-2/3 Specification Calibrated',
            planetXModel: 'Batygin & Brown (2021) Eccentric Perturber',
          });
          setIsAiModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        serverStatusOk={serverOk}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'spherex' && (
          <SpherexViewer
            observations={spherexObservations}
            isLoading={isSpherexLoading}
            error={spherexError}
            onRetry={loadData}
            onExplainWithAi={handleExplainWithAi}
          />
        )}

        {activeTab === 'planetx' && (
          <PlanetXDashboard
            candidates={candidates}
            etnoCatalog={etnoCatalog}
            hypothesis={hypothesis}
            onVetCandidate={handleVetCandidate}
            onUpdateHypothesis={setHypothesis}
            onExplainWithAi={handleExplainWithAi}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              CF
            </div>
            <span className="text-slate-300 font-semibold">COSMIC FRONTIER</span>
            <span>•</span>
            <span>NASA Space Apps Challenge 2026</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              Grounded AI (No Fabricated Detections)
            </span>
            <span>•</span>
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              NASA IPAC IRSA Specifications
            </button>
            <span>•</span>
            <a
              href="https://spherex.caltech.edu"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 flex items-center gap-1"
            >
              <span>Caltech SPHEREx</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* AI Assistant Modal */}
      <CosmicAiAssistant
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        activeContextType={aiContextType}
        activePayload={aiPayload}
      />

      {/* NASA Data & Protocol Architecture Modal */}
      <DataIntegrationModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </div>
  );
}
