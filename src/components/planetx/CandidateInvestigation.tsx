/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Planet X Candidate Astrometric Investigation Workbench
 */

import React, { useState, useRef, useEffect } from 'react';
import { PlanetXCandidate } from '../../types/index.ts';
import { calculateAstrometricTrajectory } from '../../science/orbitalMechanics.ts';
import {
  Compass,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Play,
  Pause,
  Sliders,
  Send,
  Check,
  Flame,
} from 'lucide-react';

interface CandidateInvestigationProps {
  candidates: PlanetXCandidate[];
  onVetCandidate: (id: string, status: PlanetXCandidate['status'], notes: string, verdict: string) => Promise<void>;
  onExplainCandidate: (candidate: PlanetXCandidate) => void;
}

export const CandidateInvestigation: React.FC<CandidateInvestigationProps> = ({
  candidates,
  onVetCandidate,
  onExplainCandidate,
}) => {
  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBlinking, setIsBlinking] = useState<boolean>(true);
  const [activeEpochIdx, setActiveEpochIdx] = useState<number>(0);
  const [userNotes, setUserNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [vetSuccess, setVetSuccess] = useState<boolean>(false);

  const blinkCanvasRef = useRef<HTMLCanvasElement>(null);
  const trajectoryCanvasRef = useRef<HTMLCanvasElement>(null);

  const candidate = candidates.find((c) => c.id === selectedId) || candidates[0];

  // Sync userNotes when selected candidate changes
  useEffect(() => {
    if (candidate) {
      setUserNotes(candidate.notes || '');
      setActiveEpochIdx(0);
    }
  }, [candidate?.id]);

  // Blink animation loop across observation history
  useEffect(() => {
    if (!isBlinking || !candidate || candidate.observationHistory.length <= 1) return;
    const interval = setInterval(() => {
      setActiveEpochIdx((idx) => (idx + 1) % candidate.observationHistory.length);
    }, 600); // 600ms blink rate
    return () => clearInterval(interval);
  }, [isBlinking, candidate]);

  // Draw simulated multi-epoch blink comparator canvas
  useEffect(() => {
    const canvas = blinkCanvasRef.current;
    if (!canvas || !candidate) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, w, h);

    const currentObs = candidate.observationHistory[activeEpochIdx] || candidate.observationHistory[0];

    // Background stationary stars
    const fixedStars = [
      { x: 0.22, y: 0.28, r: 2.5, flux: 1.0 },
      { x: 0.82, y: 0.18, r: 3.0, flux: 1.2 },
      { x: 0.15, y: 0.75, r: 2.0, flux: 0.8 },
      { x: 0.78, y: 0.82, r: 2.2, flux: 0.9 },
      { x: 0.45, y: 0.15, r: 1.8, flux: 0.7 },
    ];

    fixedStars.forEach((star) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x * w, star.y * h, star.r, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Moving candidate object: displaced by dx, dy arcseconds
    // Scale: 1 arcsec = 120 pixels on canvas
    const pxOffsetX = (currentObs.dxArcsec || 0) * 140;
    const pxOffsetY = -(currentObs.dyArcsec || 0) * 140;

    const objX = cx + pxOffsetX;
    const objY = cy + pxOffsetY;

    // Diffraction artifact rendering if candidate is an artifact
    if (candidate.status === 'instrumental_artifact') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(objX - 60, objY - 60);
      ctx.lineTo(objX + 60, objY + 60);
      ctx.moveTo(objX - 60, objY + 60);
      ctx.lineTo(objX + 60, objY - 60);
      ctx.stroke();
    }

    // Candidate Point Source
    const isColdCandidate = candidate.colorW1W2 > 1.8;
    ctx.fillStyle = isColdCandidate ? '#f43f5e' : '#facc15';
    ctx.shadowColor = isColdCandidate ? '#fb7185' : '#fde047';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(objX, objY, 4.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crosshair Reticle
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(objX, objY, 14, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(objX - 20, objY);
    ctx.lineTo(objX - 8, objY);
    ctx.moveTo(objX + 8, objY);
    ctx.lineTo(objX + 20, objY);
    ctx.moveTo(objX, objY - 20);
    ctx.lineTo(objX, objY - 8);
    ctx.moveTo(objX, objY + 8);
    ctx.lineTo(objX, objY + 20);
    ctx.stroke();

    // Scale bar: 0.1 arcsec
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - 70, h - 20);
    ctx.lineTo(w - 70 + 0.1 * 140, h - 20);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px JetBrains Mono';
    ctx.fillText('0.1″', w - 55, h - 24);

  }, [candidate, activeEpochIdx]);

  // Draw astrometric reflex parallax trajectory
  useEffect(() => {
    const canvas = trajectoryCanvasRef.current;
    if (!canvas || !candidate) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    const fit = calculateAstrometricTrajectory(candidate);

    // Compute coordinate bounds
    const allRas = fit.modelTrajectory.map((p) => p.ra);
    const allDecs = fit.modelTrajectory.map((p) => p.dec);
    const minRa = Math.min(...allRas);
    const maxRa = Math.max(...allRas);
    const minDec = Math.min(...allDecs);
    const maxDec = Math.max(...allDecs);

    const pad = 35;
    const toPxX = (ra: number) =>
      pad + ((ra - minRa) / (maxRa - minRa || 0.0001)) * (w - 2 * pad);
    const toPxY = (dec: number) =>
      h - pad - ((dec - minDec) / (maxDec - minDec || 0.0001)) * (h - 2 * pad);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pad, cy);
    ctx.lineTo(w - pad, cy);
    ctx.moveTo(cx, pad);
    ctx.lineTo(cx, h - pad);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw model reflex loop curve
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    fit.modelTrajectory.forEach((pt, i) => {
      const x = toPxX(pt.ra);
      const y = toPxY(pt.dec);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw observed epochs points
    fit.observedPositions.forEach((pt, i) => {
      const x = toPxX(pt.ra);
      const y = toPxY(pt.dec);

      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText(`Ep ${i + 1}`, x + 6, y - 4);
    });

    // Titles
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`Reflex Ellipse: π = ${fit.parallaxAmplitudeArcsec}″`, 12, 18);
    ctx.fillText(`Proper Motion: μ = ${fit.linearProperMotionArcsecYr}″/yr`, 12, 32);

  }, [candidate]);

  const handleVetSubmit = async (verdict: PlanetXCandidate['status']) => {
    if (!candidate) return;
    setIsSubmitting(true);
    try {
      await onVetCandidate(
        candidate.id,
        verdict,
        userNotes,
        verdict === 'candidate'
          ? 'Confirmed High-Priority Planet X Candidate'
          : verdict === 'known_asteroid'
          ? 'Classified as Foreground Centaur / Asteroid'
          : 'Rejected as Instrumental Diffraction Ghost'
      );
      setVetSuccess(true);
      setTimeout(() => setVetSuccess(false), 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Candidate Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Candidate Astrometry Queue
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                aria-label="Select candidate designation from queue"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {filteredCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.designation} ({c.survey})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 mr-1">Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'candidate', label: 'Candidates' },
            { id: 'unvetted', label: 'Unvetted' },
            { id: 'known_asteroid', label: 'Centaur/Asteroid' },
            { id: 'instrumental_artifact', label: 'Artifacts' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setStatusFilter(flt.id)}
              className={`px-2.5 py-1 rounded transition ${
                statusFilter === flt.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Investigation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Multi-Epoch Blinker & Parallax Loop */}
        <div className="lg:col-span-7 space-y-4">
          {/* Multi-Epoch Blink Comparator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Infrared Astrometric Blinker (WISE / NEOWISE Coadds)
                </h4>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <button
                  onClick={() => setIsBlinking(!isBlinking)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  {isBlinking ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isBlinking ? 'Pause Blink' : 'Auto Blink'}</span>
                </button>
              </div>
            </div>

            {/* Blink Canvas */}
            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border border-slate-800 bg-black">
              <canvas
                ref={blinkCanvasRef}
                width={420}
                height={420}
                className="w-full h-full object-contain"
              />

              {/* Epoch Tag on Canvas */}
              {candidate?.observationHistory[activeEpochIdx] && (
                <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-xs font-mono text-cyan-300">
                  <span className="font-bold text-white">
                    {candidate.observationHistory[activeEpochIdx].surveyTag}
                  </span>
                  <span className="text-slate-400 block text-[10px]">
                    Date: {candidate.observationHistory[activeEpochIdx].epoch}
                  </span>
                </div>
              )}

              {/* Candidate Info Pill */}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300">
                  Δx: {candidate?.observationHistory[activeEpochIdx]?.dxArcsec.toFixed(2)}″ | Δy:{' '}
                  {candidate?.observationHistory[activeEpochIdx]?.dyArcsec.toFixed(2)}″
                </span>
                <span
                  className={`font-semibold ${
                    candidate?.colorW1W2 > 1.8 ? 'text-red-400' : 'text-amber-400'
                  }`}
                >
                  W1−W2: {candidate?.colorW1W2.toFixed(1)} mag
                </span>
              </div>
            </div>

            {/* Epoch Selector Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono pt-1">
              {candidate?.observationHistory.map((ep, i) => (
                <button
                  key={ep.epoch}
                  onClick={() => {
                    setIsBlinking(false);
                    setActiveEpochIdx(i);
                  }}
                  className={`px-2.5 py-1 rounded border transition ${
                    activeEpochIdx === i
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Ep {i + 1} ({ep.epoch.split('-')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Astrometric Parallax Ellipse Fit */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Earth Reflex Parallax & Proper Motion Loop
                </h4>
              </div>
              <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                Distance: {candidate?.heliocentricDistanceAU} AU
              </span>
            </div>

            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
              <canvas
                ref={trajectoryCanvasRef}
                width={600}
                height={320}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Evidence & Vetting Form */}
        <div className="lg:col-span-5 space-y-4">
          {/* Candidate Diagnostics Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Physical & Astrometric Measurements
                </h4>
              </div>
              <button
                onClick={() => onExplainCandidate(candidate)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900/50 transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Explain with AI</span>
              </button>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Astrometric SNR</span>
                <span className="text-amber-400 font-bold text-sm">{candidate?.astrometricSnr} σ</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Infrared Color W1−W2</span>
                <span className="text-white font-bold text-sm">{candidate?.colorW1W2} mag</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Annual Parallax (π)</span>
                <span className="text-cyan-400 font-bold text-sm">{(candidate?.parallaxArcsec * 1000).toFixed(1)} mas</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Predicted Mass</span>
                <span className="text-purple-300 font-bold text-sm">~{candidate?.estimatedMassEarths} M⊕</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">RA / Dec (J2000)</span>
                <span className="text-slate-200 font-semibold truncate block">
                  {candidate?.raDeg.toFixed(2)}°, {candidate?.decDeg.toFixed(2)}°
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Batygin & Brown Fit</span>
                <span className="text-emerald-400 font-bold text-sm">{candidate?.theoreticalConsistency}%</span>
              </div>
            </div>

            {/* Color physics note */}
            <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="text-amber-300 font-semibold">Photometric Diagnosis:</div>
              <p className="text-slate-400 leading-relaxed">
                {candidate?.colorW1W2 > 1.8
                  ? 'Extremely red W1-W2 color (> 2.0) matches methane absorption in 40K giant planet atmospheres. Passes photometric vetting.'
                  : 'Neutral or blue W1-W2 color (< 1.0) is inconsistent with cold outer planets. Strong indicator of rocky asteroid or stellar diffraction.'}
              </p>
            </div>
          </div>

          {/* Student Vetting & Classification Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Citizen Science Vetting Workbench</span>
              </h4>
              <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Current: {candidate?.status}
              </span>
            </div>

            {candidate?.vettedBy && (
              <div className="bg-emerald-950/30 border border-emerald-800/40 p-2 rounded text-[11px] font-mono text-emerald-300">
                Vetted by {candidate.vettedBy}: "{candidate.vettingVerdict}"
              </div>
            )}

            <div className="space-y-1.5 text-xs font-mono">
              <label className="text-slate-300 block">Analysis & Vetting Notes:</label>
              <textarea
                rows={3}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Document your evidence: proper motion consistency, color index, or diffraction characteristics..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono text-slate-400">Record Scientific Classification:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleVetSubmit('candidate')}
                  className="px-2.5 py-2 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/50 font-mono text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm PX</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleVetSubmit('known_asteroid')}
                  className="px-2.5 py-2 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/50 hover:bg-amber-600/50 font-mono text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Centaur</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleVetSubmit('instrumental_artifact')}
                  className="px-2.5 py-2 rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/50 hover:bg-rose-600/50 font-mono text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Artifact</span>
                </button>
              </div>

              {vetSuccess && (
                <div className="text-center font-mono text-xs text-emerald-400 animate-pulse pt-1">
                  ✓ Classification recorded in backend state!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
