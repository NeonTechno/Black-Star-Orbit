/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * COSMIC FRONTIER — Change-Highlighting & Difference Imaging Visualization
 */

import React, { useRef, useEffect, useState } from 'react';
import { ObservationFrame, TransientCandidate, StretchMode } from '../../types/index.ts';
import { applyFluxStretch, getColorFromMap } from '../../science/spherexEngine.ts';
import { AlertCircle, Crosshair, Sparkles, Sliders, ShieldCheck, Download } from 'lucide-react';
import { exportGenericCanvasPNG } from '../../science/spherexExport.ts';

interface DifferenceOverlayProps {
  referenceFrame: ObservationFrame;
  scienceFrame: ObservationFrame;
  stretch: StretchMode;
  onExplainTransient: (transient: TransientCandidate) => void;
}

export const DifferenceOverlay: React.FC<DifferenceOverlayProps> = ({
  referenceFrame,
  scienceFrame,
  stretch,
  onExplainTransient,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snrThreshold, setSnrThreshold] = useState<number>(3.0);
  const [selectedTransient, setSelectedTransient] = useState<TransientCandidate | null>(
    scienceFrame.transients[0] || null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // Synthesize subtraction field: science - reference
    for (let y = 0; y < h; y++) {
      const ny = y / h;
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const idx = (y * w + x) * 4;

        // Background residual baseline
        let deltaFlux = (scienceFrame.backgroundLevelMJySr - referenceFrame.backgroundLevelMJySr) * 0.1;

        // Differences from stars (outbursts or variable sources)
        for (const sStar of scienceFrame.stars) {
          const rStar = referenceFrame.stars.find((r) => r.id === sStar.id);
          const rFlux = rStar ? rStar.peakFlux : 0;
          const diffPeak = sStar.peakFlux - rFlux;

          if (Math.abs(diffPeak) > 0.05) {
            const dx = (nx - sStar.x) * (w / h);
            const dy = ny - sStar.y;
            const distSq = dx * dx + dy * dy;
            const fwhmSq = sStar.fwhm * sStar.fwhm;

            if (distSq < fwhmSq * 8) {
              deltaFlux += diffPeak * Math.exp(-distSq / (2 * fwhmSq));
            }
          }
        }

        // Add transient objects unique to science frame
        for (const tr of scienceFrame.transients) {
          const dx = (nx - tr.x) * (w / h);
          const dy = ny - tr.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 0.0006) {
            deltaFlux += tr.deltaFluxMJySr * Math.exp(-distSq / 0.00015);
          }
        }

        // Mild difference noise
        deltaFlux += (Math.random() - 0.5) * 0.04;

        // Map delta flux: Diverging scale centered at 0.5 (gray = zero change, red = positive outburst, blue = negative dimming)
        const normalized = Math.max(0, Math.min(1, 0.5 + deltaFlux / 15.0));
        const stretched = applyFluxStretch(normalized, stretch);
        const [r, g, b] = getColorFromMap(stretched, 'coolwarm');

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Overlay detected transient markers
    for (const tr of scienceFrame.transients) {
      if (tr.snr >= snrThreshold) {
        const cx = tr.x * w;
        const cy = tr.y * h;

        // Outer pulsing ring
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
        ctx.stroke();

        // Target reticle
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy);
        ctx.lineTo(cx - 10, cy);
        ctx.moveTo(cx + 10, cy);
        ctx.lineTo(cx + 24, cy);
        ctx.moveTo(cx, cy - 24);
        ctx.lineTo(cx, cy - 10);
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx, cy + 24);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${tr.id} (SNR ${tr.snr})`, cx + 14, cy - 14);
      }
    }
  }, [referenceFrame, scienceFrame, stretch, snrThreshold]);

  const visibleTransients = scienceFrame.transients.filter((t) => t.snr >= snrThreshold);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const handleDownloadDifferenceView = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      await exportGenericCanvasPNG(
        canvasRef.current,
        `SPHEREx_Difference_Residual_${scienceFrame.frameId}_vs_${referenceFrame.frameId}.png`,
        `Difference Subtraction (Threshold: ${snrThreshold.toFixed(1)}σ)`
      );
    } catch (err) {
      console.error('Difference view export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header and Threshold slider */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Calibrated Image Difference & Transient Extraction
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Residual = Epoch B ({scienceFrame.timestamp.split('T')[0]}) − Epoch A ({referenceFrame.timestamp.split('T')[0]})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* SNR Threshold control */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Detection Threshold:</span>
            <span className="text-amber-400 font-bold">{snrThreshold.toFixed(1)}σ</span>
            <input
              type="range"
              min={2.0}
              max={15.0}
              step={0.5}
              value={snrThreshold}
              onChange={(e) => setSnrThreshold(Number(e.target.value))}
              aria-label="Transient detection signal-to-noise threshold in sigmas"
              className="w-24 accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Download View Button */}
          <button
            onClick={handleDownloadDifferenceView}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-xs font-mono font-semibold transition shadow-sm disabled:opacity-50"
            title="Download Residual Map as PNG"
          >
            {isExporting ? (
              <div className="h-3 w-3 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Download View</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Difference Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative aspect-square w-full max-w-md rounded-lg overflow-hidden border border-slate-800 bg-black shadow-inner">
            <canvas
              ref={canvasRef}
              width={450}
              height={450}
              className="w-full h-full object-contain"
            />
            {/* Color key */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono flex items-center justify-between text-slate-300 border border-slate-800">
              <span className="text-blue-400">Dimming (−ΔF)</span>
              <span className="text-slate-400">Zero Residual</span>
              <span className="text-red-400">Outburst / Transient (+ΔF)</span>
            </div>
          </div>
        </div>

        {/* Detected Transients Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5 text-amber-400" />
              <span>Extracted Transient Alerts ({visibleTransients.length})</span>
            </span>
          </div>

          {visibleTransients.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-6 text-center space-y-2">
              <ShieldCheck className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                No residuals detected above {snrThreshold.toFixed(1)}σ threshold.
              </p>
              <p className="text-[11px] text-slate-500">
                Lower the detection threshold slider to inspect low-amplitude variations.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {visibleTransients.map((tr) => {
                const isSelected = selectedTransient?.id === tr.id;
                return (
                  <div
                    key={tr.id}
                    onClick={() => setSelectedTransient(tr)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/70 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono font-bold text-amber-300">{tr.id}</span>
                      <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        SNR {tr.snr}σ
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-medium mt-1">
                      {tr.candidateType}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                      <div>Δ Flux: +{tr.deltaFluxMJySr} MJy/sr</div>
                      <div>RA: {tr.raDeg.toFixed(4)}°</div>
                      <div>Dec: {tr.decDeg.toFixed(4)}°</div>
                      <div>Significance: {tr.significanceSigma}σ</div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExplainTransient(tr);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900/60 transition cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <span>Explain Anomaly with AI</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
