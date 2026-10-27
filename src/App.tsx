/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — NASA Space Apps Challenge 2026
 * Full-Stack Astronomy Web Application
 * 
 * Modules:
 * 1. SPHEREx Explorer (Spectrophotometric all-sky infrared imaging)
 * 2. Planet X Explorer (Outer solar system candidate investigation)
 * 3. NASA Data & Architecture (Official IPAC/IRSA specifications & roadmap)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CosmicFrontierSuite } from './cosmic-frontier/CosmicFrontierSuite';
import { Navbar } from './components/Navbar.tsx';
import { SpherexViewer } from './components/spherex/SpherexViewer.tsx';
import { PlanetXDashboard } from './components/planetx/PlanetXDashboard.tsx';
import { ArchitectureView } from './components/data/ArchitectureView.tsx';
import { CosmicAiAssistant } from './components/ai/CosmicAiAssistant.tsx';
import { DataIntegrationModal } from './components/data/DataIntegrationModal.tsx';
import { AstrobiologyLab } from './components/astrobiology/AstrobiologyLab.tsx';
import { BlackStarLogo } from './components/common/BlackStarLogo.tsx';
import { CosmicLoadingScreen } from './components/common/CosmicLoadingScreen.tsx';
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
import { ShieldCheck, Compass, ExternalLink, ArrowUpRight, Orbit, Telescope, Sparkles, Activity, FlaskConical, ImageIcon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'spherex' | 'planetx' | 'astrobiology' | 'architecture' | 'cosmic-suite'>('cosmic-suite');
  const [serverOk, setServerOk] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [showIntroModal, setShowIntroModal] = useState<boolean>(false);

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
      {/* Cosmic Loading Screen & Intro Visual Display */}
      {isInitialLoading && (
        <CosmicLoadingScreen
          isLoading={isInitialLoading}
          onEnter={() => setIsInitialLoading(false)}
        />
      )}

      {showIntroModal && (
        <CosmicLoadingScreen
          isLoading={false}
          showIntroMode={true}
          onCloseIntro={() => setShowIntroModal(false)}
        />
      )}

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
        onOpenIntroModal={() => setShowIntroModal(true)}
        serverStatusOk={serverOk}
      />

      {activeTab !== 'cosmic-suite' && <>
      {/* Mission landing panel */}
      <section className="mission-hero relative overflow-hidden border-b border-white/[0.07]">
        <div className="mission-hero__stars" aria-hidden="true" />
        <div className="mission-hero__orb mission-hero__orb--one" aria-hidden="true" />
        <div className="mission-hero__orb mission-hero__orb--two" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="mission-kicker"><BlackStarLogo size="xs" showGlow={false} /> BLACK STAR ORBIT · ACCRA, GHANA</span>
            <span className="mission-tag"><Activity className="h-3 w-3" /> CITIZEN SCIENCE LAB</span>
          </div>
          <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] gap-10 lg:gap-14 items-end">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-cyan-200/75 font-mono mb-4">Explore the unseen universe</p>
              <h2 className="mission-title max-w-3xl">
                The sky is full of <span>unknowns.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-slate-300/80">
                A space-science workbench for exploring infrared observations, comparing what changes, and investigating the evidence behind the outer solar system’s biggest questions.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <button onClick={() => setActiveTab('spherex')} className="mission-primary-button">
                  <Telescope className="h-4 w-4" /> Explore SPHEREx <ArrowUpRight className="h-4 w-4" />
                </button>
                <button onClick={() => setActiveTab('astrobiology')} className="mission-secondary-button">
                  <FlaskConical className="h-4 w-4 text-emerald-400" /> Astrobiology & Ice Lab
                </button>
                <button onClick={() => setActiveTab('planetx')} className="mission-secondary-button">
                  <Orbit className="h-4 w-4 text-indigo-400" /> Investigate Planet X
                </button>
                <button onClick={() => setShowIntroModal(true)} className="mission-secondary-button">
                  <ImageIcon className="h-4 w-4 text-cyan-300" /> Cosmic Dust Intro
                </button>
              </div>
            </div>
            <div className="mission-console">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
                <span className="font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">Mission console</span>
                <span className={`flex items-center gap-2 text-[10px] font-mono ${serverOk ? "text-emerald-300" : "text-amber-300"}`}><span className="status-dot" /> {serverOk ? "API ONLINE" : "LOCAL FALLBACK"}</span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
                <div className="mission-stat"><span className="mission-stat__label">ACTIVE MODULE</span><strong>{activeTab === 'spherex' ? 'SPHEREx' : activeTab === 'planetx' ? 'PLANET X' : activeTab === 'astrobiology' ? 'ASTROBIOLOGY' : 'DATA LAB'}</strong><small>{activeTab === 'spherex' ? 'Infrared sky explorer' : activeTab === 'planetx' ? 'Hypothesis workbench' : activeTab === 'astrobiology' ? 'Prebiotic Ice Spectroscopy' : 'Sources & architecture'}</small></div>
                <div className="mission-stat"><span className="mission-stat__label">OBSERVATION MODE</span><strong>{activeTab === 'spherex' ? 'BENCHMARK' : activeTab === 'planetx' ? 'RESEARCH' : activeTab === 'astrobiology' ? 'IN-SITU & LAB' : 'REFERENCE'}</strong><small>{activeTab === 'spherex' ? 'Synthetic demo data' : activeTab === 'planetx' ? 'Evidence-led inquiry' : activeTab === 'astrobiology' ? 'PubChem / UniProt Grounded' : 'Integration status'}</small></div>
                <div className="mission-stat mission-stat--wide"><span className="mission-stat__label">SCIENCE FIRST</span><div className="flex items-start gap-2 mt-2"><ShieldCheck className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" /><p className="text-xs leading-5 text-slate-300/75">Candidate signals are leads to investigate—not discoveries. All spectra and molecular databases are vetted against published literature.</p></div></div>
              </div>
              <button onClick={() => setIsDataModalOpen(true)} className="mission-console__footer">
                <span><Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Review data sources & methodology</span><ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mission-bottomline"><span>NASA SPACE APPS CHALLENGE 2026</span><span className="mission-bottomline__line" /><span>LOOK CLOSER. QUESTION EVERYTHING.</span></div>
        </div>
      </section>
      </>}

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'cosmic-suite' ? 'max-w-none' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6'}`}>
        {activeTab === 'cosmic-suite' && <CosmicFrontierSuite />}
        {activeTab === 'spherex' && (
          <SpherexViewer
            observations={spherexObservations}
            isLoading={isSpherexLoading}
            error={spherexError}
            onRetry={loadData}
            onExplainWithAi={handleExplainWithAi}
          />
        )}

        {activeTab === 'astrobiology' && (
          <AstrobiologyLab
            onNavigateToSpherex={() => setActiveTab('spherex')}
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
      {activeTab !== 'cosmic-suite' && <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BlackStarLogo size="xs" />
            <span className="text-slate-300 font-semibold font-display">BLACK STAR ORBIT</span>
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
      </footer>}

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
