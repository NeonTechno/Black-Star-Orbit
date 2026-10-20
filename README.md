# COSMIC FRONTIER — NASA Space Apps Challenge 2026

**COSMIC FRONTIER** is an astronomy exploration platform and citizen science workbench built for the NASA Space Apps Challenge 2026. It integrates two primary astronomical frontiers:

1. **SPHEREx Explorer**: An interactive spectrophotometric all-sky infrared image viewer designed to analyze observations from NASA's SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer) mission.
2. **Planet X Explorer**: An astrometric investigation workbench supporting the search for a hypothetical ninth outer solar system planet, built upon the dynamical orbital framework of Batygin & Brown (2016, 2021) and real extreme Trans-Neptunian Object (eTNO) clustering observations.

---

## Key Modules & Features

### 1. SPHEREx Explorer
- **Interactive Sky Canvas**: Pan, zoom, coordinate crosshair, and real-time RA/Dec coordinate + flux readout in $\text{MJy/sr}$.
- **102 Spectral Channels**: Full coverage across SPHEREx's 6 Hawaii-2RG detector arrays ($0.75 - 5.00\,\mu\text{m}$, resolving power $R \approx 40 - 130$).
- **Astronomical Flux Stretching**: High-fidelity mathematical stretch functions including **Asinh** (Lupton et al. 2004 SDSS stretch), **Logarithmic**, **Linear**, and **Square Root**.
- **Color Palettes**: Standard astronomical colormaps: **Inferno**, **Viridis**, **Magma**, **Plasma**, **Grayscale**, and **Cool-Warm** (diverging bipolar).
- **Observation & FITS Metadata Inspector**: Complete FITS standard header cards (WCS keywords, CRVAL1/2, CDELT, EXPTIME, DATE-OBS, BUNIT, detector cryo-temperature 80 K).
- **Side-by-Side Comparison**: Dual-view and interactive curtain slider comparing different epochs or spectral bands.
- **Multi-Epoch Time-lapse**: Sequential animation player with speed controls (0.5x, 1x, 2x, 4x) and astronomical **Blink Comparator** mode.
- **Change Highlighting & Difference Imaging**: Calibrated image subtraction ($I_{\text{science}} - I_{\text{reference}}$) with adjustable SNR threshold slider and transient candidate alert extraction (variable protostars, supernovae, moving objects).
- **SED Spectral Plotter**: Interactive Spectral Energy Distribution chart revealing characteristic molecular ice absorption troughs ($\mathrm{H}_2\mathrm{O}$ at $3.05\,\mu\text{m}$, $\mathrm{CO}_2$ at $4.27\,\mu\text{m}$, $\mathrm{CO}$ at $4.67\,\mu\text{m}$).

### 2. Planet X Explorer
- **3D/2D Orbital Phase Space Simulator**: Interactive canvas from 30 AU to 1200 AU illustrating Neptune's orbit, peer-reviewed clustered eTNO orbits (Sedna, 2012 VP113, 2004 VN112, 2010 GB174, 2014 SR349, Leleakuhonua), and Planet X's anti-aligned eccentric orbit ($a = 380\,\text{AU}, e = 0.35, q = 285\,\text{AU}, i = 16^\circ$).
- **Candidate Investigation Workbench**: Multi-epoch astrometric blink comparator (WISE Coadds vs NEOWISE), proper motion vector calculation, and annual heliocentric reflex parallax solver ($\pi = 1 / d$).
- **Photometric Diagnostics**: Infrared color index ($W1 - W2$) evaluating atmospheric methane absorption at $40\,\text{K}$.
- **Citizen Science Vetting**: Community classification tools to confirm high-priority candidates, flag known Centaurs/asteroids, or reject instrumental diffraction spikes.
- **Quantitative Statistical Significance**: Rayleigh Z-test for perihelion alignment ($p < 0.001$) and orbital pole dispersion.
- **Uncertainty & Bayesian Posteriors**: 1-sigma (68%) and 2-sigma (95%) confidence intervals for mass, distance, and sky coordinates.

### 3. Server-Side Grounded AI (Gemini 3.8 Flash)
- **Zero Client Key Exposure**: All calls to `@google/genai` are executed strictly on the Node.js / Express backend.
- **Strict Scientific Guardrails**: System instructions explicitly forbid the model from inventing observations, coordinates, candidate detections, or physical constants.
- **Context Grounding**: Explains verified telemetry, FITS keywords, molecular vibrations, and Keplerian orbital dynamics based strictly on user session data.

---

## Data Integration & Architecture

### Mandatory Scientific Integrity Notice
In accordance with NASA Open Science principles:
- **SPHEREx Pre-Commissioning Data Status**: While SPHEREx in-orbit calibration and initial public data releases (Level 2/3) are scheduled via Caltech/IPAC IRSA, all observation cutouts in this workbench are calibrated synthetic benchmarks generated according to official SPHEREx instrument point spread function ($6.2^{\prime\prime}$) and Hawaii-2RG linear variable filter specifications.
- **Real Archival Data**: Planet X eTNO orbits and WISE/NEOWISE astrometric formats correspond directly to IAU Minor Planet Center and peer-reviewed astronomical catalogs.

### Decoupled Codebase Structure
```
├── server.ts                       # Node.js Express backend + Gemini API server
├── src/
│   ├── types/index.ts              # Core TypeScript type definitions
│   ├── science/
│   │   ├── spherexEngine.ts        # Flux stretch, colormaps, FITS/diff algorithms, 102 bands
│   │   ├── orbitalMechanics.ts     # Keplerian orbital solver, eTNO catalog, Rayleigh test
│   │   └── dataConnector.ts        # NASA IPAC/IRSA, IVOA TAP/SIAv2, MPC connector registry
│   ├── components/
│   │   ├── Navbar.tsx              # Mission switcher & status pills
│   │   ├── spherex/
│   │   │   ├── SpherexViewer.tsx   # Master sky image viewer
│   │   │   ├── BandSelector.tsx    # 102 SPHEREx spectral channels
│   │   │   ├── MetadataPanel.tsx   # FITS header inspector
│   │   │   ├── ComparisonView.tsx  # Dual & curtain split viewer
│   │   │   ├── TimelapseViewer.tsx # Multi-epoch blink comparator
│   │   │   ├── DifferenceOverlay.tsx # Transient detection & residual heatmap
│   │   │   └── SpectralPlot.tsx    # SED & molecular ice absorption
│   │   ├── planetx/
│   │   │   ├── PlanetXDashboard.tsx# Master Planet X dashboard
│   │   │   ├── CandidateInvestigation.tsx # Astrometric vetting workbench
│   │   │   ├── OrbitalSimulation.tsx # 3D orbital phase space simulator
│   │   │   ├── EvidencePanel.tsx   # Statistical tests & parameter sandbox
│   │   │   └── UncertaintyIndicator.tsx # Bayesian posterior intervals
│   │   ├── ai/
│   │   │   └── CosmicAiAssistant.tsx # Grounded Gemini copilot modal
│   │   └── data/
│   │       ├── ArchitectureView.tsx # System architecture & roadmap
│   │       └── DataIntegrationModal.tsx # NASA endpoint status & ping diagnostic
│   ├── App.tsx                     # Master full-stack application component
│   ├── main.tsx                    # React DOM entry
│   └── index.css                   # Tailwind CSS v4 styling & dark theme
├── metadata.json                   # Applet metadata
└── package.json                    # Full-stack dependencies & scripts
```

---

## Setup & Running Instructions

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
*(Note: If `GEMINI_API_KEY` is not provided, the application automatically runs using a deterministic scientific rule-based explanation engine without crashing).*

### 3. Install & Start Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Remaining Integrations Roadmap

1. **Live IPAC IRSA Table Access Protocol (TAP)**:
   - When SPHEREx Data Release 1 (DR1) becomes public, point `/api/spherex/observations` directly to `https://irsa.ipac.caltech.edu/TAP` using Astronomical Data Query Language (ADQL) queries.
2. **Direct Simple Image Access (SIAv2)**:
   - Stream multi-megabyte 3D FITS data cubes into WebGL 2.0 or WebGPU shaders for real-time volumetric slicing.
3. **Rubin Observatory (LSST) Alert Brokers**:
   - Ingest live real-time transient streams from Fink or Alerce to flag high-proper-motion outer solar system candidates ($r > 23$).
