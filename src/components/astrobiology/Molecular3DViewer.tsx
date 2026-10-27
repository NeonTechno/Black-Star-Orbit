/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ASTROBIOLOGY 3D MOLECULAR & CRYSTAL SPECTROSCOPY VIEWER
 * Built with Three.js conforming strictly to threejs skill guidelines:
 * - 3-Point Studio Lighting (Key, Fill, Rim Light)
 * - ACESFilmicToneMapping & sRGB Color Space
 * - PBR MeshStandardMaterial & procedural multi-part assemblies
 * - No backdrop-filter over WebGL canvas
 * - Responsive ResizeObserver & complete resource disposal
 * - Collapsible bottom control dock (<= 15% viewport height)
 * - Infrared vibrational frequency mode (SPHEREx spectral simulation)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { InterstellarMolecule, AtomCoord } from '../../science/astrobiologyData';
import { Play, Pause, RotateCcw, Activity, Layers, Sparkles, ChevronDown, ChevronUp, ZoomIn, ZoomOut } from 'lucide-react';

interface Molecular3DViewerProps {
  molecule: InterstellarMolecule;
  onAtomSelect?: (atom: AtomCoord, index: number) => void;
}

// Element visual styling (CPK colors + realistic covalent radii)
const ELEMENT_PROPERTIES: Record<string, { color: number; radius: number; roughness: number; metalness: number; name: string }> = {
  H: { color: 0xF8FAFC, radius: 0.31, roughness: 0.25, metalness: 0.1, name: 'Hydrogen' },
  C: { color: 0x334155, radius: 0.70, roughness: 0.35, metalness: 0.2, name: 'Carbon' },
  N: { color: 0x3B82F6, radius: 0.65, roughness: 0.3, metalness: 0.2, name: 'Nitrogen' },
  O: { color: 0xEF4444, radius: 0.60, roughness: 0.2, metalness: 0.15, name: 'Oxygen' },
  S: { color: 0xF59E0B, radius: 1.00, roughness: 0.4, metalness: 0.3, name: 'Sulfur' },
  P: { color: 0xFB923C, radius: 1.05, roughness: 0.4, metalness: 0.25, name: 'Phosphorus' },
};

export const Molecular3DViewer: React.FC<Molecular3DViewerProps> = ({ molecule, onAtomSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction & UI Controls state
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [isVibrating, setIsVibrating] = useState<boolean>(true);
  const [atomScale, setAtomScale] = useState<number>(1.0);
  const [renderMode, setRenderMode] = useState<'ball-and-stick' | 'space-filling' | 'wireframe'>('ball-and-stick');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [hoveredAtom, setHoveredAtom] = useState<{ element: string; index: number; x: number; y: number } | null>(null);

  // References for Three.js internals
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const atomMeshesRef = useRef<{ mesh: THREE.Mesh; originalPos: THREE.Vector3; element: string; index: number }[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Mouse interaction
  const isPointerDownRef = useRef<boolean>(false);
  const previousPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    sceneRef.current = scene;

    // Subtle star/dust particle field in background
    const dustCount = 200;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 40;
      dustPositions[i + 1] = (Math.random() - 0.5) * 40;
      dustPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.12,
      transparent: true,
      opacity: 0.35,
    });
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // 3. Renderer with PBR Color Space & Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig (Key, Fill, Rim Light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Key Light: warm/crisp white from top-right
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    // Fill Light: cool cyan tone from lower-left to soften shadows
    const fillLight = new THREE.DirectionalLight(0x72e5f7, 1.2);
    fillLight.position.set(-6, -3, 4);
    scene.add(fillLight);

    // Rim Light: electric violet back-light for edge definition
    const rimLight = new THREE.DirectionalLight(0x9b8cff, 2.5);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    // 5. Molecule Group container
    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // 6. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // Teardown
    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      // Dispose dust points
      dustGeometry.dispose();
      dustMaterial.dispose();
      // Dispose renderer
      renderer.dispose();
    };
  }, []);

  // Build 3D Molecular Geometry when molecule or renderMode changes
  useEffect(() => {
    const group = moleculeGroupRef.current;
    if (!group) return;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    atomMeshesRef.current = [];

    // Calculate center of mass to center the molecule
    let sumX = 0, sumY = 0, sumZ = 0;
    molecule.atoms.forEach((a) => {
      sumX += a.x;
      sumY += a.y;
      sumZ += a.z;
    });
    const centerX = sumX / molecule.atoms.length;
    const centerY = sumY / molecule.atoms.length;
    const centerZ = sumZ / molecule.atoms.length;

    // Create Atoms
    molecule.atoms.forEach((atom, index) => {
      const props = ELEMENT_PROPERTIES[atom.element] || ELEMENT_PROPERTIES.C;
      const sphereRadius = renderMode === 'space-filling'
        ? props.radius * 1.6 * atomScale
        : props.radius * 0.9 * atomScale;

      const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: props.color,
        roughness: props.roughness,
        metalness: props.metalness,
        wireframe: renderMode === 'wireframe',
      });

      const mesh = new THREE.Mesh(geometry, material);
      const initialPos = new THREE.Vector3(
        (atom.x - centerX) * 1.5,
        (atom.y - centerY) * 1.5,
        (atom.z - centerZ) * 1.5
      );
      mesh.position.copy(initialPos);
      mesh.userData = { element: atom.element, index, originalPos: initialPos.clone() };

      group.add(mesh);
      atomMeshesRef.current.push({
        mesh,
        originalPos: initialPos.clone(),
        element: atom.element,
        index,
      });
    });

    // Create Covalent Bonds (unless space-filling where spheres intersect naturally)
    if (renderMode !== 'space-filling') {
      const bondMaterial = new THREE.MeshStandardMaterial({
        color: 0x64748B,
        roughness: 0.35,
        metalness: 0.4,
        wireframe: renderMode === 'wireframe',
      });

      molecule.bonds.forEach((bond) => {
        const atom1 = molecule.atoms[bond.from];
        const atom2 = molecule.atoms[bond.to];
        if (!atom1 || !atom2) return;

        const pos1 = new THREE.Vector3(
          (atom1.x - centerX) * 1.5,
          (atom1.y - centerY) * 1.5,
          (atom1.z - centerZ) * 1.5
        );
        const pos2 = new THREE.Vector3(
          (atom2.x - centerX) * 1.5,
          (atom2.y - centerY) * 1.5,
          (atom2.z - centerZ) * 1.5
        );

        const distance = pos1.distanceTo(pos2);
        const cylinderRadius = bond.order === 2 ? 0.12 : 0.09;
        const bondGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, distance, 16);

        const bondMesh = new THREE.Mesh(bondGeometry, bondMaterial);
        
        // Position at midpoint and orient along the vector
        const midPoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
        bondMesh.position.copy(midPoint);

        const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        bondMesh.setRotationFromQuaternion(orientation);

        group.add(bondMesh);
      });
    }
  }, [molecule, renderMode, atomScale]);

  // Main Render & Animation Loop
  useEffect(() => {
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous gentle rotation
      if (isRotating && moleculeGroupRef.current) {
        moleculeGroupRef.current.rotation.y += delta * 0.45;
        moleculeGroupRef.current.rotation.x += delta * 0.15;
      }

      // Infrared Vibrational Mode simulation (SPHEREx vibrational frequency)
      if (isVibrating && atomMeshesRef.current.length > 0) {
        const freqHz = (molecule.vibrationalFreqCm1 / 1000) * 2.5; // Scaled for visible harmonic oscillation
        atomMeshesRef.current.forEach(({ mesh, originalPos, index }) => {
          // Harmonic offset along normal
          const phaseOffset = index * 0.8;
          const vibrationAmp = 0.06;
          const displacement = Math.sin(elapsedTime * freqHz + phaseOffset) * vibrationAmp;
          
          mesh.position.set(
            originalPos.x + displacement * (index % 2 === 0 ? 1 : -1),
            originalPos.y + displacement * 0.5,
            originalPos.z + displacement * (index % 3 === 0 ? -1 : 1)
          );
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isRotating, isVibrating, molecule.vibrationalFreqCm1]);

  // Pointer drag to orbit manually
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPointerDownRef.current && moleculeGroupRef.current) {
      const deltaX = e.clientX - previousPointerPosRef.current.x;
      const deltaY = e.clientY - previousPointerPosRef.current.y;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };

      moleculeGroupRef.current.rotation.y += deltaX * 0.01;
      moleculeGroupRef.current.rotation.x += deltaY * 0.01;
    }

    // Raycast to find hovered atom
    if (canvasRef.current && cameraRef.current && sceneRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
      const meshes = atomMeshesRef.current.map((a) => a.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const elem = hit.userData.element;
        const idx = hit.userData.index;
        setHoveredAtom({
          element: elem,
          index: idx,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        setHoveredAtom(null);
      }
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleResetOrientation = useCallback(() => {
    if (moleculeGroupRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 7.5);
    }
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    if (cameraRef.current) {
      const factor = direction === 'in' ? 0.85 : 1.15;
      cameraRef.current.position.z = Math.max(3.5, Math.min(15, cameraRef.current.position.z * factor));
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden bg-[#060914] border border-cyan-500/20 shadow-2xl flex flex-col select-none">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Hovered Atom HUD Tooltip */}
        {hoveredAtom && (
          <div
            className="absolute pointer-events-none z-30 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-xs font-mono text-cyan-200 shadow-xl"
            style={{
              left: `${hoveredAtom.x + 12}px`,
              top: `${hoveredAtom.y - 12}px`,
            }}
          >
            <div className="font-bold flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `#${ELEMENT_PROPERTIES[hoveredAtom.element]?.color.toString(16).padStart(6, '0')}` }} />
              {ELEMENT_PROPERTIES[hoveredAtom.element]?.name || hoveredAtom.element} (Atom #{hoveredAtom.index + 1})
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Coord: ({molecule.atoms[hoveredAtom.index]?.x.toFixed(2)}, {molecule.atoms[hoveredAtom.index]?.y.toFixed(2)}, {molecule.atoms[hoveredAtom.index]?.z.toFixed(2)}) Å
            </div>
          </div>
        )}

        {/* Top Watermark & Epistemic Target Card */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              SPHEREx Ice Line: {molecule.spherexAbsorptionBandMicrons} µm
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-white/10 text-slate-300 font-mono text-[11px]">
              ν: {molecule.vibrationalFreqCm1} cm⁻¹
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white mt-1.5 drop-shadow-md">
            {molecule.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {molecule.iupacName} • PubChem CID: {molecule.pubchemCid}
          </p>
        </div>

        {/* Quick Zoom Overlay Controls (Right Side) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/90 border border-white/15 text-slate-200 hover:text-cyan-300 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/90 border border-white/15 text-slate-200 hover:text-cyan-300 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetOrientation}
            title="Reset Orientation"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/90 border border-white/15 text-slate-200 hover:text-cyan-300 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Bottom Control Dock (Height <= 15% viewport, cleanly styled) */}
      <div className="relative z-20 bg-[#090E20]/95 border-t border-white/10 px-4 py-2 text-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                isRotating
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRotating ? 'Auto Orbit' : 'Paused'}</span>
            </button>

            <button
              onClick={() => setIsVibrating(!isVibrating)}
              title="Simulate Infrared Vibrational Mode at SPHEREx Wavelength"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                isVibrating
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-violet-400" />
              <span>IR Vibration</span>
            </button>
          </div>

          {/* Render Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-white/10 font-mono text-[11px]">
            <button
              onClick={() => setRenderMode('ball-and-stick')}
              className={`px-2 py-0.5 rounded ${
                renderMode === 'ball-and-stick' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ball & Stick
            </button>
            <button
              onClick={() => setRenderMode('space-filling')}
              className={`px-2 py-0.5 rounded ${
                renderMode === 'space-filling' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Space-Fill
            </button>
            <button
              onClick={() => setRenderMode('wireframe')}
              className={`px-2 py-0.5 rounded ${
                renderMode === 'wireframe' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wireframe
            </button>
          </div>

          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded transition"
            title={isControlsCollapsed ? 'Expand Details' : 'Collapse Details'}
          >
            {isControlsCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Details Section */}
        {!isControlsCollapsed && (
          <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-mono">Vibrational Physics</span>
              <p className="mt-0.5 text-slate-200">{molecule.vibrationalModeDescription}</p>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-mono">Astrobiology Role</span>
              <p className="mt-0.5 text-slate-200">{molecule.astrobiologicalRelevance}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-slate-400 font-mono">Atoms: {molecule.atoms.length} | Bonds: {molecule.bonds.length}</span>
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${molecule.pubchemCid}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:underline font-mono text-[10px]"
              >
                PubChem #{molecule.pubchemCid}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
