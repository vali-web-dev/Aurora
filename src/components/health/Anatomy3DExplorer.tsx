'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { Group, Material, Mesh } from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { AuroraModal } from '@/components/aurora/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/aurora/Form';
import {
  ANATOMY_MESH_REGIONS,
  BLUEPRINT_FEATURE_IDS,
  BLUEPRINT_ORGAN_IDS,
  BLUEPRINT_SYSTEM_IDS,
  HUMAN_BLUEPRINT_LIBRARY,
  HUMAN_BLUEPRINT_LIBRARY_BY_ID,
} from '@/lib/human-blueprint/contentLibrary';
import { formatTimelineDate, getDailyFocusNode } from '@/lib/human-blueprint/dailyFocus';
import { BLUEPRINT_PHASES, type AnatomyMeshRegion, type BlueprintPhase, type HumanBlueprintNode } from '@/lib/human-blueprint/schema';
import { HumanBlueprintDailyFocus } from '@/components/health/human-blueprint/HumanBlueprintDailyFocus';
import { HumanBlueprintInsightPanel } from '@/components/health/human-blueprint/HumanBlueprintInsightPanel';
import { HumanBlueprintProgressRail } from '@/components/health/human-blueprint/HumanBlueprintProgressRail';
import { HUMAN_BLUEPRINT_GLB_DEFAULT_PATH } from '@/lib/human-blueprint/modelManifest';
import { resolveRegionIdFromMeshName } from '@/lib/human-blueprint/modelManifest';

type ViewPreset = 'front' | 'back';

const GLB_MODEL_URL = (process.env.NEXT_PUBLIC_HUMAN_BLUEPRINT_GLB_URL || '').trim() || HUMAN_BLUEPRINT_GLB_DEFAULT_PATH;
const GLB_MODEL_ENABLED = (process.env.NEXT_PUBLIC_HUMAN_BLUEPRINT_MODEL_SOURCE || 'procedural').trim().toLowerCase() === 'glb';

const STORAGE_KEY = 'aurora-human-blueprint-progress-v1';
const UI_PREFS_KEY = 'aurora-human-blueprint-ui-prefs-v1';

interface BlueprintProgressState {
  explored: Record<string, number>;
  mastered: string[];
  journalByNode: Record<string, string>;
  favorites: string[];
  notes: Record<string, string[]>;
  phaseHistory: Record<string, Array<{ phase: number; timestamp: number }>>;
  achievements: string[];
  goals: Array<{ id: string; type: 'explore' | 'master' | 'phase'; target: number; current: number; deadline?: number }>;
  healthMetrics: Record<string, Array<{ value: number; timestamp: number; unit: string }>>;
  communityRank?: number;
  lastVisitedAt: number | null;
}

interface GLBPickDebugEvent {
  objectName: string;
  parentName: string;
  resolvedRegionId: string | null;
  timestamp: number;
}

const DEFAULT_PROGRESS: BlueprintProgressState = {
  explored: {},
  mastered: [],
  journalByNode: {},
  favorites: [],
  notes: {},
  phaseHistory: {},
  achievements: [],
  goals: [],
  healthMetrics: {},
  lastVisitedAt: null,
};

const MESH_TO_LIBRARY_ALIAS: Record<string, string> = {
  'left-lung': 'lungs',
  'right-lung': 'lungs',
  'left-kidney': 'kidneys',
  'right-kidney': 'kidneys',
  'left-eye': 'eyes',
  'right-eye': 'eyes',
  'left-hand': 'hands',
  'right-hand': 'hands',
};

function loadProgressState(): BlueprintProgressState {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<BlueprintProgressState>;
    return {
      explored: parsed.explored ?? {},
      mastered: parsed.mastered ?? [],
      journalByNode: parsed.journalByNode ?? {},
      favorites: parsed.favorites ?? [],
      notes: parsed.notes ?? {},
      phaseHistory: parsed.phaseHistory ?? {},
      achievements: parsed.achievements ?? [],
      goals: parsed.goals ?? [],
      healthMetrics: parsed.healthMetrics ?? {},
      communityRank: parsed.communityRank,
      lastVisitedAt: parsed.lastVisitedAt ?? null,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function resolveLibraryNode(nodeId: string | null): HumanBlueprintNode | null {
  if (!nodeId) return null;
  return HUMAN_BLUEPRINT_LIBRARY_BY_ID[nodeId] ?? HUMAN_BLUEPRINT_LIBRARY_BY_ID[MESH_TO_LIBRARY_ALIAS[nodeId] ?? ''] ?? null;
}

function BodyShell() {
  return (
    <group>
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.55, 1.9, 10, 18]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.08} roughness={0.38} metalness={0.09} />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.12} roughness={0.32} metalness={0.08} />
      </mesh>
      <mesh position={[-0.78, 1.03, 0]} rotation={[0, 0, 0.16]}>
        <capsuleGeometry args={[0.11, 1.2, 8, 14]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.08} roughness={0.4} />
      </mesh>
      <mesh position={[0.78, 1.03, 0]} rotation={[0, 0, -0.16]}>
        <capsuleGeometry args={[0.11, 1.2, 8, 14]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.08} roughness={0.4} />
      </mesh>
      <mesh position={[-0.24, -0.7, 0]}>
        <capsuleGeometry args={[0.12, 1.5, 10, 14]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.08} roughness={0.4} />
      </mesh>
      <mesh position={[0.24, -0.7, 0]}>
        <capsuleGeometry args={[0.12, 1.5, 10, 14]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.08} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.75, -0.12]}>
        <capsuleGeometry args={[0.08, 1.4, 10, 16]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.18} roughness={0.28} metalness={0.12} />
      </mesh>
    </group>
  );
}

function applyTransparentMaterial(material: Material | Material[]) {
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((entry) => {
    if ('transparent' in entry) {
      entry.transparent = true;
      entry.opacity = Math.min(entry.opacity ?? 1, 0.18);
    }
    if ('depthWrite' in entry) {
      entry.depthWrite = false;
    }
  });
}

function GLBTransparentShell({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const cloned = useMemo(() => {
    const next = scene.clone(true);
    next.traverse((child) => {
      const maybeMesh = child as Mesh;
      if (!maybeMesh.isMesh || !maybeMesh.material) return;
      applyTransparentMaterial(maybeMesh.material);
    });
    return next;
  }, [scene]);

  return <primitive object={cloned} />;
}

function CameraDirector({ preset }: { preset: ViewPreset }) {
  const { camera } = useThree();

  useFrame(() => {
    const target = preset === 'front' ? [0, 1, 4.3] : [0, 1, -4.3];
    camera.position.x += (target[0] - camera.position.x) * 0.06;
    camera.position.y += (target[1] - camera.position.y) * 0.06;
    camera.position.z += (target[2] - camera.position.z) * 0.06;
    camera.lookAt(0, 1, 0);
  });

  return null;
}

function RegionMesh({
  region,
  hovered,
  selected,
  onEnter,
  onLeave,
  onSelect,
  theme,
}: {
  region: AnatomyMeshRegion;
  hovered: boolean;
  selected: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: () => void;
  theme: 'medical' | 'artistic' | 'minimalist' | 'colorblind';
}) {
  const themeColor =
    theme === 'artistic'
      ? '#c084fc'
      : theme === 'minimalist'
      ? '#e2e8f0'
      : theme === 'colorblind'
      ? '#2563eb'
      : region.color;
  return (
    <mesh
      name={region.id === 'heart' ? 'heart-organ' : region.id}
      position={region.position}
      scale={region.scale}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onSelect}
    >
      {region.geometry === 'sphere' ? (
        <sphereGeometry args={[1, 24, 24]} />
      ) : region.geometry === 'capsule' ? (
        <capsuleGeometry args={[1, 1.4, 10, 16]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial
        color={themeColor}
        emissive={themeColor}
        emissiveIntensity={selected ? 0.28 : hovered ? 0.18 : 0.09}
        transparent
        opacity={region.id === 'skin' ? 0.08 : hovered || selected ? 0.85 : 0.72}
        roughness={0.46}
        metalness={0.06}
      />
    </mesh>
  );
}

function AnatomyScene({
  onPick,
  selectedId,
  viewPreset,
  onGLBDebug,
  onHover,
  animationsEnabled,
  animationQuality,
  visualTheme,
}: {
  onPick: (id: string) => void;
  selectedId: string | null;
  viewPreset: ViewPreset;
  onGLBDebug?: (event: GLBPickDebugEvent) => void;
  onHover?: (id: string | null) => void;
  animationsEnabled: boolean;
  animationQuality: 'low' | 'medium' | 'high';
  visualTheme: 'medical' | 'artistic' | 'minimalist' | 'colorblind';
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [glbAvailable, setGlbAvailable] = useState(false);
  const groupRef = useState(() => ({ current: null as Group | null }))[0];
  const vitals = useMemo(
    () => ({
      breathHz: 0.23,
      basePulseBpm: 72,
    }),
    []
  );

  useFrame((state) => {
    if (!animationsEnabled) return;

    const t = state.clock.getElapsedTime();
    const qualityScale = animationQuality === 'low' ? 0.3 : animationQuality === 'medium' ? 0.6 : 1;
    const breathOffset = Math.sin(t * Math.PI * 2 * vitals.breathHz) * 0.035 * qualityScale;
    const pulse = Math.sin(t * Math.PI * 2 * (vitals.basePulseBpm / 60)) * 0.08 * qualityScale;

    if (groupRef.current) {
      groupRef.current.position.y = breathOffset;
      if (animationQuality !== 'low') {
        groupRef.current.rotation.y = state.pointer.x * 0.12;
        groupRef.current.rotation.x = -state.pointer.y * 0.06;
      }
    }

    const heart = state.scene.getObjectByName('heart-organ') as Mesh | null;
    if (heart) {
      const scale = 1 + pulse * 0.06;
      heart.scale.set(scale, scale, scale);
    }
  });

  useEffect(() => {
    let active = true;

    if (!GLB_MODEL_ENABLED) {
      setGlbAvailable(false);
      return () => {
        active = false;
      };
    }

    fetch(GLB_MODEL_URL, { method: 'HEAD' })
      .then((response) => {
        if (active) setGlbAvailable(response.ok);
      })
      .catch(() => {
        if (active) setGlbAvailable(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGLBPick = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const objectName = event.object?.name ?? '';
    const parentName = event.object?.parent?.name ?? '';
    const resolved = resolveRegionIdFromMeshName(objectName) ?? resolveRegionIdFromMeshName(parentName);
    onGLBDebug?.({
      objectName,
      parentName,
      resolvedRegionId: resolved,
      timestamp: Date.now(),
    });
    if (resolved) onPick(resolved);
  }, [onGLBDebug, onPick]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 3]} intensity={1.1} />
      <pointLight position={[-2, 2, 2]} intensity={0.7} />
      <group ref={(next) => { groupRef.current = next; }}>
        {GLB_MODEL_ENABLED && glbAvailable ? (
          <group onPointerDown={handleGLBPick}>
            <GLBTransparentShell url={GLB_MODEL_URL} />
          </group>
        ) : (
          <>
            <BodyShell />
            {ANATOMY_MESH_REGIONS.map((region) => (
              <RegionMesh
                key={region.id}
                region={region}
                hovered={hoveredId === region.id}
                selected={selectedId === region.id}
                onEnter={() => { setHoveredId(region.id); onHover?.(region.id); }}
                onLeave={() => { setHoveredId((prev) => (prev === region.id ? null : prev)); onHover?.(null); }}
                onSelect={() => onPick(region.id)}
                theme={visualTheme}
              />
            ))}
          </>
        )}
      </group>

      <CameraDirector preset={viewPreset} />

      <OrbitControls
        enablePan={false}
        minDistance={2.4}
        maxDistance={5.4}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
    </>
  );
}

export function Anatomy3DExplorer() {
  const [activeOrganId, setActiveOrganId] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<BlueprintPhase>(1);
  const [viewPreset, setViewPreset] = useState<ViewPreset>('front');
  const [heartRate, setHeartRate] = useState(72);
  const [respirationRate, setRespirationRate] = useState(14);
  const [progress, setProgress] = useState<BlueprintProgressState>(DEFAULT_PROGRESS);
  const [glbDebugEvent, setGlbDebugEvent] = useState<GLBPickDebugEvent | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationQuality, setAnimationQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [linkCopied, setLinkCopied] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [learningPathMode, setLearningPathMode] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [visualTheme, setVisualTheme] = useState<'medical' | 'artistic' | 'minimalist' | 'colorblind'>('medical');
  const [quizMode, setQuizMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [collaborationMode, setCollaborationMode] = useState(false);
  const [showGoalsPanel, setShowGoalsPanel] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonNodeId, setComparisonNodeId] = useState<string | null>(null);
  const [showInsightsDashboard, setShowInsightsDashboard] = useState(false);
  const [meditationActive, setMeditationActive] = useState(false);
  const [showCommunityInsights, setShowCommunityInsights] = useState(false);
  const [showProgressViz, setShowProgressViz] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [phaseAutoplay, setPhaseAutoplay] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [showOfflineHint, setShowOfflineHint] = useState(true);
  const [favoritesFirstSort, setFavoritesFirstSort] = useState(false);
  const [autoHideTooltip, setAutoHideTooltip] = useState(false);
  const [eyeStrainMode, setEyeStrainMode] = useState(false);
  const [challengeReached, setChallengeReached] = useState(false);
  const [sampleSeeded, setSampleSeeded] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<BlueprintProgressState | null>(null);
  const [compactToolbar, setCompactToolbar] = useState(false);
  const [showDailyReminder, setShowDailyReminder] = useState(false);
  const [markdownExported, setMarkdownExported] = useState(false);
  const [sceneSlotStatus, setSceneSlotStatus] = useState<Record<number, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const nodeParam = params.get('node');
    const phaseParam = params.get('phase');
    if (nodeParam && HUMAN_BLUEPRINT_LIBRARY_BY_ID[nodeParam]) {
      setActiveOrganId(nodeParam);
    }
    if (phaseParam) {
      const phase = parseInt(phaseParam);
      if (phase >= 1 && phase <= 5) {
        setActivePhase(phase as BlueprintPhase);
      }
    }
  }, []);

  useEffect(() => {
    setProgress(loadProgressState());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    setLastSavedAt(Date.now());
  }, [progress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<{
        showOnlyFavorites: boolean;
        learningPathMode: boolean;
        focusMode: boolean;
        animationsEnabled: boolean;
        animationQuality: 'low' | 'medium' | 'high';
      }>;
      if (typeof parsed.showOnlyFavorites === 'boolean') setShowOnlyFavorites(parsed.showOnlyFavorites);
      if (typeof parsed.learningPathMode === 'boolean') setLearningPathMode(parsed.learningPathMode);
      if (typeof parsed.focusMode === 'boolean') setFocusMode(parsed.focusMode);
      if (typeof parsed.animationsEnabled === 'boolean') setAnimationsEnabled(parsed.animationsEnabled);
      if (parsed.animationQuality) setAnimationQuality(parsed.animationQuality);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      UI_PREFS_KEY,
      JSON.stringify({ showOnlyFavorites, learningPathMode, focusMode, animationsEnabled, animationQuality })
    );
  }, [showOnlyFavorites, learningPathMode, focusMode, animationsEnabled, animationQuality]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeartRate((prev) => Math.max(60, Math.min(105, prev + (Math.random() > 0.5 ? 1 : -1))));
      setRespirationRate((prev) => Math.max(10, Math.min(22, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1300);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          setActivePhase((prev) => Math.max(1, prev - 1) as BlueprintPhase);
          break;
        case 'ArrowRight':
          setActivePhase((prev) => Math.min(5, prev + 1) as BlueprintPhase);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          setActivePhase(parseInt(event.key) as BlueprintPhase);
          break;
        case 'f':
        case 'F':
          setViewPreset('front');
          break;
        case 'b':
        case 'B':
          setViewPreset('back');
          break;
        case 'Escape':
          setActiveOrganId(null);
          break;
        case '?':
          setShowShortcutHelp((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (activePhase) {
      const phase = BLUEPRINT_PHASES.find((p) => p.id === activePhase);
      if (phase) {
        setAnnouncement(`Phase ${phase.id}: ${phase.label}. ${phase.subtitle}`);
      }
    }
  }, [activePhase]);

  useEffect(() => {
    if (!phaseAutoplay) return;
    const interval = window.setInterval(() => {
      setActivePhase((prev) => (prev === 5 ? 1 : ((prev + 1) as BlueprintPhase)));
    }, 4500);

    return () => window.clearInterval(interval);
  }, [phaseAutoplay]);

  useEffect(() => {
    if (!autoHideTooltip || !hoveredRegionId) return;
    const timeout = window.setTimeout(() => setHoveredRegionId(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [autoHideTooltip, hoveredRegionId]);

  useEffect(() => {
    if (!eyeStrainMode) return;
    setAnimationsEnabled(false);
    setAnimationQuality('low');
    setVisualTheme('minimalist');
  }, [eyeStrainMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().split('T')[0];
    const seen = localStorage.getItem('aurora-human-blueprint-daily-reminder');
    if (seen !== today) {
      setShowDailyReminder(true);
      localStorage.setItem('aurora-human-blueprint-daily-reminder', today);
    }
  }, []);

  const selectedNode = useMemo(() => resolveLibraryNode(activeOrganId), [activeOrganId]);
  const hoveredNode = useMemo(() => resolveLibraryNode(hoveredRegionId), [hoveredRegionId]);
  const pushUndoSnapshot = useCallback(() => {
    setUndoSnapshot(progress);
  }, [progress]);
  
  const toggleFavorite = useCallback(
    (nodeId: string) => {
      pushUndoSnapshot();
      setProgress((prev) => {
        const isFavorite = prev.favorites.includes(nodeId);
        return {
          ...prev,
          favorites: isFavorite
            ? prev.favorites.filter((id) => id !== nodeId)
            : [...prev.favorites, nodeId],
        };
      });
    },
    [pushUndoSnapshot]
  );
  
  const quickLookup = useMemo(() => {
    const filter = (entries: HumanBlueprintNode[]) => {
      let filtered = entries;
      if (showOnlyFavorites) {
        filtered = filtered.filter((entry) => progress.favorites.includes(entry.id));
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((entry) =>
          entry.name.toLowerCase().includes(q) ||
          entry.category.toLowerCase().includes(q) ||
          entry.summary.toLowerCase().includes(q)
        );
      }
      if (favoritesFirstSort) {
        filtered = [...filtered].sort((a, b) => {
          const aFav = progress.favorites.includes(a.id) ? 1 : 0;
          const bFav = progress.favorites.includes(b.id) ? 1 : 0;
          return bFav - aFav || a.name.localeCompare(b.name);
        });
      }
      return filtered;
    };
    return {
      organs: filter(HUMAN_BLUEPRINT_LIBRARY.filter((entry) => BLUEPRINT_ORGAN_IDS.includes(entry.id))),
      systems: filter(HUMAN_BLUEPRINT_LIBRARY.filter((entry) => BLUEPRINT_SYSTEM_IDS.includes(entry.id))),
      features: filter(HUMAN_BLUEPRINT_LIBRARY.filter((entry) => BLUEPRINT_FEATURE_IDS.includes(entry.id))),
    };
  }, [searchQuery, showOnlyFavorites, progress.favorites, favoritesFirstSort]);

  const dailyFocusNode = useMemo(() => getDailyFocusNode(HUMAN_BLUEPRINT_LIBRARY), []);
  const exploredCount = Object.keys(progress.explored).length;
  const masteredCount = progress.mastered.length;
  const timeline = useMemo(() => {
    return Object.entries(progress.explored)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, at]) => ({ id, at, node: HUMAN_BLUEPRINT_LIBRARY_BY_ID[id] }));
  }, [progress.explored]);

  const daysSinceVisit = useMemo(() => {
    if (!progress.lastVisitedAt) return null;
    return Math.floor((Date.now() - progress.lastVisitedAt) / 86400000);
  }, [progress.lastVisitedAt]);

  const lastVisitLabel = useMemo(() => {
    if (daysSinceVisit === null) return 'No prior visits';
    if (daysSinceVisit === 0) return 'Visited today';
    return `Visited ${daysSinceVisit} day(s) ago`;
  }, [daysSinceVisit]);

  const sessionLabel = useMemo(() => {
    const minutes = Math.floor(sessionSeconds / 60);
    const seconds = sessionSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [sessionSeconds]);

  const recommendedNodes = useMemo(() => {
    const unseen = HUMAN_BLUEPRINT_LIBRARY.filter((entry) => !(entry.id in progress.explored));
    const fromFavorites = HUMAN_BLUEPRINT_LIBRARY.filter((entry) => progress.favorites.includes(entry.id));
    return [...fromFavorites, ...unseen].slice(0, 4);
  }, [progress.explored, progress.favorites]);

  const heatmapNodes = useMemo(() => {
    return HUMAN_BLUEPRINT_LIBRARY.map((entry) => ({
      node: entry,
      visits: (progress.phaseHistory[entry.id] ?? []).length,
    }))
      .filter((entry) => entry.visits > 0)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);
  }, [progress.phaseHistory]);

  const weeklyTarget = 12;
  const weeklyProgress = Math.min(weeklyTarget, exploredCount);
  const recentNodes = useMemo(() => timeline.slice(0, 4), [timeline]);
  const weeklyReachedNow = weeklyProgress >= weeklyTarget;
  const noSearchResults = searchQuery.trim().length > 0 && quickLookup.organs.length + quickLookup.systems.length + quickLookup.features.length === 0;
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [] as HumanBlueprintNode[];
    const q = searchQuery.toLowerCase();
    return HUMAN_BLUEPRINT_LIBRARY.filter((entry) =>
      entry.name.toLowerCase().includes(q) || entry.summary.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);
  const heartTrend = (progress.healthMetrics.heart_rate ?? []).slice(-2);
  const heartTrendLabel =
    heartTrend.length < 2 ? '—' : heartTrend[1].value > heartTrend[0].value ? '↗ rising' : heartTrend[1].value < heartTrend[0].value ? '↘ falling' : '→ stable';
  const nodeTags = useMemo(() => {
    if (!selectedNode) return [] as string[];
    return [
      selectedNode.category,
      progress.mastered.includes(selectedNode.id) ? 'mastered' : 'learning',
      progress.favorites.includes(selectedNode.id) ? 'favorite' : 'standard',
      `phase-${activePhase}`,
    ];
  }, [activePhase, progress.favorites, progress.mastered, selectedNode]);

  useEffect(() => {
    if (weeklyReachedNow && !challengeReached) {
      setChallengeReached(true);
      setAnnouncement('Weekly challenge complete. Great consistency.');
    }
  }, [challengeReached, weeklyReachedNow]);

  const copyShareLink = useCallback(() => {
    if (typeof window === 'undefined' || !activeOrganId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('node', activeOrganId);
    url.searchParams.set('phase', activePhase.toString());
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [activeOrganId, activePhase]);

  const saveSceneToSlot = useCallback(
    (slot: number) => {
      if (typeof window === 'undefined') return;
      const payload = {
        activeOrganId,
        activePhase,
        viewPreset,
        visualTheme,
        timestamp: Date.now(),
      };
      localStorage.setItem(`aurora-human-blueprint-scene-slot-${slot}`, JSON.stringify(payload));
      setSceneSlotStatus((prev) => ({ ...prev, [slot]: `Saved ${formatTimelineDate(payload.timestamp)}` }));
      setAnnouncement(`Saved scene to slot ${slot}`);
    },
    [activeOrganId, activePhase, viewPreset, visualTheme]
  );

  const loadSceneFromSlot = useCallback((slot: number) => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(`aurora-human-blueprint-scene-slot-${slot}`);
    if (!raw) {
      setAnnouncement(`Slot ${slot} is empty`);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        activeOrganId: string | null;
        activePhase: BlueprintPhase;
        viewPreset: ViewPreset;
        visualTheme: 'medical' | 'artistic' | 'minimalist' | 'colorblind';
      };
      setActiveOrganId(parsed.activeOrganId);
      setActivePhase(parsed.activePhase ?? 1);
      setViewPreset(parsed.viewPreset ?? 'front');
      setVisualTheme(parsed.visualTheme ?? 'medical');
      setAnnouncement(`Loaded scene slot ${slot}`);
    } catch {
      setAnnouncement(`Could not load slot ${slot}`);
    }
  }, []);

  const undoLastProgressChange = useCallback(() => {
    if (!undoSnapshot) return;
    setProgress(undoSnapshot);
    setUndoSnapshot(null);
    setAnnouncement('Undid last progress change');
  }, [undoSnapshot]);

  const copyNodeSummary = useCallback(() => {
    if (!selectedNode) return;
    navigator.clipboard.writeText(`${selectedNode.name}: ${selectedNode.summary}`).then(() => {
      setAnnouncement(`Copied summary for ${selectedNode.name}`);
    });
  }, [selectedNode]);

  const goToNextPhase = useCallback(() => {
    setActivePhase((prev) => (prev === 5 ? 1 : ((prev + 1) as BlueprintPhase)));
  }, []);

  const revisitMostRecent = useCallback(() => {
    const latest = timeline[0];
    if (!latest) return;
    setActiveOrganId(latest.id);
    setAnnouncement(`Revisited ${latest.node?.name ?? latest.id}`);
  }, [timeline]);

  const resetSelectedNodeData = useCallback(() => {
    if (!selectedNode) return;
    pushUndoSnapshot();
    setProgress((prev) => {
      const nextJournal = { ...prev.journalByNode };
      const nextNotes = { ...prev.notes };
      const nextHistory = { ...prev.phaseHistory };
      const nextExplored = { ...prev.explored };
      delete nextJournal[selectedNode.id];
      delete nextNotes[selectedNode.id];
      delete nextHistory[selectedNode.id];
      delete nextExplored[selectedNode.id];
      return {
        ...prev,
        journalByNode: nextJournal,
        notes: nextNotes,
        phaseHistory: nextHistory,
        explored: nextExplored,
        mastered: prev.mastered.filter((id) => id !== selectedNode.id),
      };
    });
    setAnnouncement(`Reset saved data for ${selectedNode.name}`);
  }, [pushUndoSnapshot, selectedNode]);

  const collapseUtilityPanels = useCallback(() => {
    setShowRecommendations(false);
    setShowHeatmap(false);
    setShowShortcutHelp(false);
    setShowGoalsPanel(false);
    setShowInsightsDashboard(false);
    setShowCommunityInsights(false);
    setShowProgressViz(false);
    setShowCommandCenter(false);
    setAnnouncement('Collapsed utility panels');
  }, []);

  const resetAllProgressData = useCallback(() => {
    pushUndoSnapshot();
    setProgress(DEFAULT_PROGRESS);
    setActiveOrganId(null);
    setComparisonNodeId(null);
    setAnnouncement('All progress reset to default state');
  }, [pushUndoSnapshot]);

  const seedSampleData = useCallback(() => {
    const sampleIds = ['heart', 'brain', 'lungs', 'liver', 'stomach'];
    const now = Date.now();
    pushUndoSnapshot();
    setProgress((prev) => {
      const explored = { ...prev.explored };
      const phaseHistory = { ...prev.phaseHistory };
      sampleIds.forEach((id, index) => {
        explored[id] = now - index * 120000;
        phaseHistory[id] = [...(phaseHistory[id] ?? []), { phase: ((index % 5) + 1) as BlueprintPhase, timestamp: now - index * 120000 }];
      });
      return {
        ...prev,
        explored,
        phaseHistory,
        mastered: [...new Set([...prev.mastered, 'heart', 'brain'])],
        favorites: [...new Set([...prev.favorites, 'heart', 'lungs'])],
      };
    });
    setSampleSeeded(true);
    setAnnouncement('Sample learning data added');
  }, [pushUndoSnapshot]);

  const addNote = useCallback(
    (nodeId: string, note: string) => {
      if (!note.trim()) return;
      pushUndoSnapshot();
      setProgress((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [nodeId]: [...(prev.notes[nodeId] ?? []), note.trim()],
        },
      }));
      setNotesInput('');
    },
    [pushUndoSnapshot]
  );

  const deleteNote = useCallback(
    (nodeId: string, index: number) => {
      pushUndoSnapshot();
      setProgress((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [nodeId]: (prev.notes[nodeId] ?? []).filter((_, i) => i !== index),
        },
      }));
    },
    [pushUndoSnapshot]
  );

  const checkAchievements = useCallback(
    (currentProgress: BlueprintProgressState) => {
      const newAchievements: string[] = [];
      const explored = Object.keys(currentProgress.explored).length;
      const mastered = currentProgress.mastered.length;
      
      if (explored >= 5 && !currentProgress.achievements.includes('explorer-5')) newAchievements.push('explorer-5');
      if (explored >= 10 && !currentProgress.achievements.includes('explorer-10')) newAchievements.push('explorer-10');
      if (explored === HUMAN_BLUEPRINT_LIBRARY.length && !currentProgress.achievements.includes('complete-explorer')) newAchievements.push('complete-explorer');
      if (mastered >= 3 && !currentProgress.achievements.includes('master-3')) newAchievements.push('master-3');
      if (mastered >= 10 && !currentProgress.achievements.includes('master-10')) newAchievements.push('master-10');
      if (currentProgress.favorites.length >= 5 && !currentProgress.achievements.includes('collector')) newAchievements.push('collector');
      
      if (newAchievements.length > 0) {
        setProgress((prev) => ({
          ...prev,
          achievements: [...prev.achievements, ...newAchievements],
        }));
      }
    },
    []
  );

  const selectNode = useCallback((nodeId: string) => {
    const resolvedId = HUMAN_BLUEPRINT_LIBRARY_BY_ID[nodeId] ? nodeId : (MESH_TO_LIBRARY_ALIAS[nodeId] ?? nodeId);
    const node = HUMAN_BLUEPRINT_LIBRARY_BY_ID[resolvedId];
    setActiveOrganId(nodeId);
    if (node) {
      setAnnouncement(`Selected ${node.name}, ${node.category}. ${node.summary}`);
    }
    pushUndoSnapshot();
    setProgress((prev) => {
      const updated = {
        ...prev,
        explored: {
          ...prev.explored,
          [resolvedId]: Date.now(),
        },
        phaseHistory: {
          ...prev.phaseHistory,
          [resolvedId]: [
            ...(prev.phaseHistory[resolvedId] ?? []),
            { phase: activePhase, timestamp: Date.now() },
          ],
        },
        lastVisitedAt: Date.now(),
      };
      checkAchievements(updated);
      return updated;
    });
  }, [activePhase, checkAchievements, pushUndoSnapshot]);

  const randomExplore = useCallback(() => {
    const pool = HUMAN_BLUEPRINT_LIBRARY.filter((entry) => !(entry.id in progress.explored));
    const fallback = HUMAN_BLUEPRINT_LIBRARY;
    const source = pool.length > 0 ? pool : fallback;
    const randomNode = source[Math.floor(Math.random() * source.length)];
    if (randomNode) {
      selectNode(randomNode.id);
      setAnnouncement(`Random exploration: ${randomNode.name}`);
    }
  }, [progress.explored, selectNode]);

  const saveJournal = useCallback((value: string) => {
    if (!selectedNode) return;
    pushUndoSnapshot();
    setProgress((prev) => ({
      ...prev,
      journalByNode: {
        ...prev.journalByNode,
        [selectedNode.id]: value,
      },
    }));
  }, [pushUndoSnapshot, selectedNode]);

  const markMastered = useCallback(() => {
    if (!selectedNode) return;
    pushUndoSnapshot();
    setProgress((prev) => ({
      ...prev,
      mastered: prev.mastered.includes(selectedNode.id) ? prev.mastered : [...prev.mastered, selectedNode.id],
    }));
  }, [pushUndoSnapshot, selectedNode]);

  const exportMarkdown = useCallback(() => {
    const lines = HUMAN_BLUEPRINT_LIBRARY.filter((node) => progress.explored[node.id]).map(
      (node) => `## ${node.name}\n\n- Category: ${node.category}\n- Summary: ${node.summary}\n- Physical: ${node.function_physical}\n- Emotional: ${node.function_emotional_psychological}\n- Journal: ${progress.journalByNode[node.id] || 'None'}\n`
    );
    const body = `# Human Blueprint Markdown Report\n\n- Explored: ${exploredCount}\n- Mastered: ${masteredCount}\n\n${lines.join('\n')}`;
    const blob = new Blob([body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `human-blueprint-report-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setMarkdownExported(true);
    setTimeout(() => setMarkdownExported(false), 2000);
  }, [exploredCount, masteredCount, progress.explored, progress.journalByNode]);

  const exportPDF = useCallback(() => {
    if (typeof window === 'undefined') return;
    const content = HUMAN_BLUEPRINT_LIBRARY.filter((node) => progress.explored[node.id]).map((node) => `
${node.name.toUpperCase()}
${'-'.repeat(40)}
${node.summary}

Physical Function: ${node.function_physical}
Emotional/Psychological: ${node.function_emotional_psychological}

Lifestyle Support:
${node.lifestyle_support.map((s) => `  • ${s}`).join('\n')}

Lifestyle Harm:
${node.lifestyle_harm.map((h) => `  • ${h}`).join('\n')}

Mythic Identity: ${node.mythic_identity}
Narrative: ${node.narrative_voice}

Journal: ${progress.journalByNode[node.id] || 'No journal entry'}
`
    ).join('\n\n');
    const blob = new Blob([`Human Blueprint System - Progress Report\n${'='.repeat(60)}\n\nExplored: ${Object.keys(progress.explored).length}\nMastered: ${progress.mastered.length}\nFavorites: ${progress.favorites.length}\nAchievements: ${progress.achievements.join(', ') || 'None'}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `human-blueprint-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [progress]);

  const exportProgress = useCallback(() => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurora-blueprint-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [progress]);

  const importProgress = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as Partial<BlueprintProgressState>;
          setProgress({
            explored: imported.explored ?? {},
            mastered: imported.mastered ?? [],
            journalByNode: imported.journalByNode ?? {},
            favorites: imported.favorites ?? [],
            notes: imported.notes ?? {},
            phaseHistory: imported.phaseHistory ?? {},
            achievements: imported.achievements ?? [],
            goals: imported.goals ?? [],
            healthMetrics: imported.healthMetrics ?? {},
            communityRank: imported.communityRank,
            lastVisitedAt: imported.lastVisitedAt ?? null,
          });
        } catch (error) {
          console.error('Failed to import progress:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const addGoal = useCallback(
    (type: 'explore' | 'master' | 'phase', target: number, deadline?: number) => {
      const newGoal = {
        id: `goal-${Date.now()}`,
        type,
        target,
        current: type === 'explore' ? Object.keys(progress.explored).length : type === 'master' ? progress.mastered.length : 0,
        deadline,
      };
      pushUndoSnapshot();
      setProgress((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal],
      }));
    },
    [progress, pushUndoSnapshot]
  );

  const removeGoal = useCallback((goalId: string) => {
    pushUndoSnapshot();
    setProgress((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId),
    }));
  }, [pushUndoSnapshot]);

  const addHealthMetric = useCallback((metric: string, value: number, unit: string) => {
    pushUndoSnapshot();
    setProgress((prev) => ({
      ...prev,
      healthMetrics: {
        ...prev.healthMetrics,
        [metric]: [...(prev.healthMetrics[metric] ?? []), { value, timestamp: Date.now(), unit }],
      },
    }));
  }, [pushUndoSnapshot]);

  const startMeditation = useCallback((nodeId: string) => {
    setMeditationActive(true);
    setAnnouncement(`Starting guided meditation for ${HUMAN_BLUEPRINT_LIBRARY_BY_ID[nodeId]?.name}`);
    setTimeout(() => setMeditationActive(false), 300000);
  }, []);

  return (
    <div role="application" aria-label="Human Blueprint Anatomy Explorer">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Card className="space-y-5" id="main-content">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Human Blueprint System</CardTitle>
              <CardDescription>
                A living manual of body, mind, emotion, identity, and long-horizon trajectory through a transparent 3D human model.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="error" size="sm">HR {heartRate} bpm</Badge>
              <Badge variant="info" size="sm">RR {respirationRate}/min</Badge>
              <Badge variant="default" size="sm">Model {GLB_MODEL_ENABLED ? 'GLB' : 'Procedural'}</Badge>
              <Badge variant="primary" size="sm">Explored {exploredCount}</Badge>
              <Badge variant="success" size="sm">Mastered {masteredCount}</Badge>
              <Badge variant="info" size="sm">Session {sessionLabel}</Badge>
              <Badge variant="default" size="sm">Save {lastSavedAt ? formatTimelineDate(lastSavedAt) : 'Pending'}</Badge>
              {progress.achievements.length > 0 && (
                <Badge variant="warning" size="sm" title={progress.achievements.join(', ')}>
                  Achievements {progress.achievements.length}
                </Badge>
              )}
              <Badge variant="success" size="sm">Live</Badge>
              <Button variant="secondary" size="sm" onClick={exportProgress} title="Export progress data">
                Export
              </Button>
              <Button variant="secondary" size="sm" onClick={importProgress} title="Import progress data">
                Import
              </Button>
              {activeOrganId && (
                <Button variant="secondary" size="sm" onClick={copyShareLink} title="Copy shareable link">
                  {linkCopied ? 'Copied' : 'Share Link'}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={exportPDF} title="Export progress as text report">
                PDF Report
              </Button>
              <Button variant="secondary" size="sm" onClick={exportMarkdown} title="Export markdown report">
                {markdownExported ? 'Markdown Ready' : 'Export Markdown'}
              </Button>
              <Button variant="secondary" size="sm" onClick={undoLastProgressChange} disabled={!undoSnapshot}>
                Undo
              </Button>
              <Button
                variant={collaborationMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCollaborationMode((prev) => !prev)}
                title="Share with healthcare providers"
              >
                {collaborationMode ? 'Collaboration On' : 'Collaboration Off'}
              </Button>
              <Button
                variant={showGoalsPanel ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowGoalsPanel((prev) => !prev)}
                title="Set learning goals"
              >
                Goals
              </Button>
              <Button
                variant={showInsightsDashboard ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowInsightsDashboard((prev) => !prev)}
                title="View health insights"
              >
                Dashboard
              </Button>
              <Button
                variant={showProgressViz ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowProgressViz((prev) => !prev)}
                title="Visualize learning journey"
                aria-label="Toggle progress timeline panel"
              >
                Timeline
              </Button>
              <Button variant={showCommandCenter ? 'primary' : 'secondary'} size="sm" onClick={() => setShowCommandCenter((prev) => !prev)}>
                Command Center
              </Button>
              <Button variant="secondary" size="sm" onClick={collapseUtilityPanels}>
                Collapse Panels
              </Button>
              <Button variant={compactToolbar ? 'primary' : 'secondary'} size="sm" onClick={() => setCompactToolbar((prev) => !prev)}>
                {compactToolbar ? 'Compact' : 'Expanded'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showDailyReminder && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-3 flex items-center justify-between gap-2">
            <p className="aurora-label text-sm text-emerald-700 dark:text-emerald-300">Daily focus ready: revisit one organ for 2 minutes to keep momentum.</p>
            <div className="flex items-center gap-2">
              {dailyFocusNode && (
                <Button size="sm" variant="secondary" onClick={() => selectNode(dailyFocusNode.id)}>Open Focus</Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setShowDailyReminder(false)}>Dismiss</Button>
            </div>
          </div>
        )}

        {exploredCount === 0 && (
          <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 p-3">
            <p className="aurora-label text-sm text-sky-700 dark:text-sky-300">
              Start with one organ using Quick Links or hit Random Node to begin your first guided exploration.
            </p>
          </div>
        )}

        {showOfflineHint && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 flex items-center justify-between gap-2">
            <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Tip: Progress autosaves locally. Use Export for offline backup or transfer.</p>
            <Button size="sm" variant="secondary" onClick={() => setShowOfflineHint(false)}>Dismiss</Button>
          </div>
        )}

        {showCommandCenter && (
          <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-violet-700 dark:text-violet-300">Command Center</p>
              <Button variant="secondary" size="sm" onClick={() => setShowCommandCenter(false)}>Close</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={randomExplore}>Explore Random</Button>
              <Button size="sm" variant="secondary" onClick={revisitMostRecent} disabled={timeline.length === 0}>Revisit Recent</Button>
              <Button size="sm" variant="secondary" onClick={() => setActivePhase(1)}>Phase 1</Button>
              <Button size="sm" variant="secondary" onClick={() => setActivePhase(5)}>Phase 5</Button>
              <Button size="sm" variant="secondary" onClick={goToNextPhase}>Next Phase</Button>
              <Button size="sm" variant="secondary" onClick={exportProgress}>Export JSON</Button>
              <Button size="sm" variant="secondary" onClick={seedSampleData}>{sampleSeeded ? 'Sample Seeded' : 'Seed Sample Data'}</Button>
              <Button size="sm" variant="secondary" onClick={resetAllProgressData}>Reset All Progress</Button>
            </div>
            <div className="space-y-2">
              <p className="aurora-label text-xs uppercase tracking-wide text-violet-700 dark:text-violet-300">Scene Slots</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((slot) => (
                  <div key={slot} className="flex items-center gap-1 rounded border border-violet-200 dark:border-violet-700 px-2 py-1">
                    <Button size="sm" variant="secondary" onClick={() => saveSceneToSlot(slot)}>Save {slot}</Button>
                    <Button size="sm" variant="secondary" onClick={() => loadSceneFromSlot(slot)}>Load {slot}</Button>
                    <span className="aurora-label text-[10px] text-violet-700 dark:text-violet-300">{sceneSlotStatus[slot] ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search organs, systems, features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="aurora-label px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[280px]"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="aurora-label px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Select language"
          >
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="zh">🇨🇳 中文</option>
          </select>
          <Button
            variant={learningPathMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setLearningPathMode((prev) => !prev)}
            title="Follow guided learning path"
          >
            {learningPathMode ? 'Path Mode' : 'Free Mode'}
          </Button>
          <Button
            variant={quizMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setQuizMode((prev) => !prev)}
            title="Test your knowledge"
          >
            {quizMode ? 'Quiz On' : 'Quiz Off'}
          </Button>
          <Button
            variant={voiceEnabled ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setVoiceEnabled((prev) => !prev)}
            title="Enable voice navigation"
          >
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </Button>
          <select
            value={visualTheme}
            onChange={(e) => setVisualTheme(e.target.value as 'medical' | 'artistic' | 'minimalist' | 'colorblind')}
            className="aurora-label px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Visual theme"
          >
            <option value="medical">Medical</option>
            <option value="artistic">Artistic</option>
            <option value="minimalist">Minimalist</option>
            <option value="colorblind">Colorblind</option>
          </select>
          <Button
            variant={showOnlyFavorites ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowOnlyFavorites((prev) => !prev)}
            aria-label="Toggle favorites filter"
          >
            Favorites {progress.favorites.length > 0 && `(${progress.favorites.length})`}
          </Button>
          <Button variant={favoritesFirstSort ? 'primary' : 'secondary'} size="sm" onClick={() => setFavoritesFirstSort((prev) => !prev)}>
            Favorites First
          </Button>
          {!compactToolbar && (
            <>
              <Button
                variant={comparisonMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setComparisonMode((prev) => !prev)}
                title="Compare body systems"
              >
                {comparisonMode ? 'Compare On' : 'Compare Off'}
              </Button>
              <Button
                variant={showCommunityInsights ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowCommunityInsights((prev) => !prev)}
                title="See community trends"
              >
                Community
              </Button>
            </>
          )}
          <Button variant={showRecommendations ? 'primary' : 'secondary'} size="sm" onClick={() => setShowRecommendations((prev) => !prev)}>
            Recommendations
          </Button>
          <Button variant={showHeatmap ? 'primary' : 'secondary'} size="sm" onClick={() => setShowHeatmap((prev) => !prev)}>
            Heatmap
          </Button>
          <Button variant={focusMode ? 'primary' : 'secondary'} size="sm" onClick={() => setFocusMode((prev) => !prev)}>
            {focusMode ? 'Focus On' : 'Focus Off'}
          </Button>
          <Button variant={phaseAutoplay ? 'primary' : 'secondary'} size="sm" onClick={() => setPhaseAutoplay((prev) => !prev)}>
            {phaseAutoplay ? 'Phase Auto' : 'Phase Manual'}
          </Button>
          <Button variant="secondary" size="sm" onClick={goToNextPhase}>
            Next Phase
          </Button>
          <Button variant={eyeStrainMode ? 'primary' : 'secondary'} size="sm" onClick={() => setEyeStrainMode((prev) => !prev)}>
            Eye Strain {eyeStrainMode ? 'On' : 'Off'}
          </Button>
          <Button variant={autoHideTooltip ? 'primary' : 'secondary'} size="sm" onClick={() => setAutoHideTooltip((prev) => !prev)}>
            Tooltip Auto-hide
          </Button>
          <Button variant={showShortcutHelp ? 'primary' : 'secondary'} size="sm" onClick={() => setShowShortcutHelp((prev) => !prev)}>
            Shortcuts
          </Button>
          <Button variant="secondary" size="sm" onClick={randomExplore}>
            Random Node
          </Button>
          <Button variant={animationsEnabled ? 'primary' : 'secondary'} size="sm" onClick={() => setAnimationsEnabled((prev) => !prev)}>
            {animationsEnabled ? 'Animations On' : 'Animations Off'}
          </Button>
          {animationsEnabled && (
            <select
              value={animationQuality}
              onChange={(e) => setAnimationQuality(e.target.value as 'low' | 'medium' | 'high')}
              className="aurora-label px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="high">High Quality</option>
            </select>
          )}
          <Button variant={screenReaderMode ? 'primary' : 'secondary'} size="sm" onClick={() => setScreenReaderMode((prev) => !prev)}>
            {screenReaderMode ? 'Text Mode' : 'Visual Mode'}
          </Button>
          <Button variant={viewPreset === 'front' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewPreset('front')}>
            Front View
          </Button>
          <Button variant={viewPreset === 'back' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewPreset('back')}>
            Back View
          </Button>
          {BLUEPRINT_PHASES.map((phase) => (
            <Button
              key={phase.id}
              variant={activePhase === phase.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActivePhase(phase.id)}
            >
              P{phase.id} {phase.label}
            </Button>
          ))}
        </div>

        {searchSuggestions.length > 0 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 space-y-2">
            <p className="aurora-label text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((entry) => (
                <Button key={entry.id} size="sm" variant="secondary" onClick={() => selectNode(entry.id)}>
                  {entry.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {!screenReaderMode && (
          <div className="w-full h-[620px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
            <Canvas camera={{ position: [0, 1, 4.3], fov: 42 }}>
              <Suspense fallback={null}>
                <AnatomyScene
                  onPick={selectNode}
                  selectedId={activeOrganId}
                  viewPreset={viewPreset}
                  onGLBDebug={setGlbDebugEvent}
                  onHover={setHoveredRegionId}
                  animationsEnabled={animationsEnabled}
                  animationQuality={animationQuality}
                  visualTheme={visualTheme}
                />
              </Suspense>
            </Canvas>
            {hoveredNode && (
              <div className="absolute top-4 left-4 max-w-sm pointer-events-none">
                <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 shadow-xl">
                  <p className="aurora-label text-sm font-semibold text-slate-900 dark:text-slate-50">{hoveredNode.name}</p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 mt-1">{hoveredNode.summary}</p>
                  <Badge variant="info" size="sm" className="mt-2">{hoveredNode.category}</Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {focusMode && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-3">
            <p className="aurora-label text-sm text-emerald-700 dark:text-emerald-300">
              Focus mode is active — keep attention on one node and one phase at a time.
            </p>
          </div>
        )}

        {showRecommendations && (
          <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-cyan-700 dark:text-cyan-300">Smart Recommendations</p>
              <Button variant="secondary" size="sm" onClick={() => setShowRecommendations(false)}>Close</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recommendedNodes.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => selectNode(entry.id)}
                  className="text-left rounded bg-white dark:bg-slate-900 p-3 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition"
                >
                  <p className="aurora-label text-sm font-medium text-slate-900 dark:text-slate-100">{entry.name}</p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{entry.summary}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {showShortcutHelp && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 space-y-2">
            <p className="aurora-label text-sm font-semibold text-slate-700 dark:text-slate-300">Keyboard Shortcuts</p>
            <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">`←`/`→` phase · `1-5` jump phase · `F/B` view · `Esc` close modal</p>
          </div>
        )}

        {showHeatmap && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-rose-700 dark:text-rose-300">Revisit Heatmap</p>
              <Button variant="secondary" size="sm" onClick={() => setShowHeatmap(false)}>Close</Button>
            </div>
            <div className="space-y-2">
              {heatmapNodes.length === 0 ? (
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">No revisit history yet.</p>
              ) : (
                heatmapNodes.map((entry) => (
                  <div key={entry.node.id} className="flex items-center gap-3">
                    <span className="aurora-label text-sm min-w-28 text-slate-700 dark:text-slate-300">{entry.node.name}</span>
                    <div className="flex-1 h-2 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, entry.visits * 14)}%` }} />
                    </div>
                    <span className="aurora-label text-xs text-slate-500 dark:text-slate-400">{entry.visits} visits</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="aurora-label text-sm font-semibold text-amber-700 dark:text-amber-300">Weekly Challenge</p>
            <p className="aurora-label text-xs text-amber-700 dark:text-amber-300">{weeklyProgress}/{weeklyTarget}</p>
          </div>
          <div className="h-2 rounded bg-amber-100 dark:bg-amber-900 overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${Math.round((weeklyProgress / weeklyTarget) * 100)}%` }} />
          </div>
        </div>

        {challengeReached && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-3 flex items-center justify-between gap-2">
            <p className="aurora-label text-sm text-emerald-700 dark:text-emerald-300">Weekly target reached. Excellent consistency.</p>
            <Button size="sm" variant="secondary" onClick={() => setChallengeReached(false)}>Dismiss</Button>
          </div>
        )}

        {quizMode && (
          <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-indigo-700 dark:text-indigo-300">Knowledge Check</p>
              <Button variant="secondary" size="sm" onClick={() => setQuizMode(false)}>Close Quiz</Button>
            </div>
            <div className="space-y-3">
              {HUMAN_BLUEPRINT_LIBRARY.filter((n) => progress.explored[n.id]).slice(0, 3).map((node) => (
                <div key={node.id} className="rounded bg-white dark:bg-slate-900 p-3 space-y-2">
                  <p className="aurora-label text-sm font-medium text-slate-800 dark:text-slate-200">
What is the primary function of the {node.name}?
                  </p>
                  <div className="space-y-1">
                    <button className="aurora-label w-full text-left px-3 py-2 text-sm rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition">
A) {node.function_physical.slice(0, 60)}...
                    </button>
                    <button className="aurora-label w-full text-left px-3 py-2 text-sm rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition">
B) {node.function_emotional_psychological.slice(0, 60)}...
                    </button>
                  </div>
                </div>
              ))}
              {progress.explored && Object.keys(progress.explored).length === 0 && (
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
Explore some organs first to unlock quiz questions!
                </p>
              )}
            </div>
          </div>
        )}

        {showGoalsPanel && (
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-green-700 dark:text-green-300">Learning Goals</p>
              <Button variant="secondary" size="sm" onClick={() => setShowGoalsPanel(false)}>Close</Button>
            </div>
            <div className="space-y-2">
              {progress.goals.map((goal) => {
                const current = goal.type === 'explore' ? Object.keys(progress.explored).length : goal.type === 'master' ? progress.mastered.length : 0;
                const percentage = Math.min(100, Math.round((current / goal.target) * 100));
                return (
                  <div key={goal.id} className="rounded bg-white dark:bg-slate-900 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="aurora-label text-sm text-slate-800 dark:text-slate-200">
                        {goal.type === 'explore' ? 'Explore' : goal.type === 'master' ? 'Master' : 'Phase'} {goal.target} nodes
                      </span>
                      <button onClick={() => removeGoal(goal.id)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {current} / {goal.target} ({percentage}%)
                      {goal.deadline && ` · Due ${new Date(goal.deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                );
              })}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => addGoal('explore', 10)}>+ Explore 10</Button>
                <Button variant="secondary" size="sm" onClick={() => addGoal('master', 5)}>+ Master 5</Button>
              </div>
            </div>
          </div>
        )}

        {showInsightsDashboard && (
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-blue-700 dark:text-blue-300">Health Insights Dashboard</p>
              <Button variant="secondary" size="sm" onClick={() => setShowInsightsDashboard(false)}>Close</Button>
            </div>
            <p className="aurora-label text-xs text-blue-700 dark:text-blue-300">Heart-rate trend: {heartTrendLabel}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded bg-white dark:bg-slate-900 p-3">
                <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Completion Rate</p>
                <p className="aurora-label text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((Object.keys(progress.explored).length / HUMAN_BLUEPRINT_LIBRARY.length) * 100)}%
                </p>
              </div>
              <div className="rounded bg-white dark:bg-slate-900 p-3">
                <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Average Phase</p>
                <p className="aurora-label text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.values(progress.phaseHistory).length > 0
                    ? Math.round(
                        Object.values(progress.phaseHistory).flat().reduce((sum, e) => sum + e.phase, 0) /
                          Object.values(progress.phaseHistory).flat().length
                      )
                    : 0}
                </p>
              </div>
              <div className="rounded bg-white dark:bg-slate-900 p-3">
                <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Study Streak</p>
                <p className="aurora-label text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {daysSinceVisit !== null ? (daysSinceVisit === 0 ? 'Today' : `${daysSinceVisit}d ago`) : '—'}
                </p>
              </div>
              <div className="rounded bg-white dark:bg-slate-900 p-3">
                <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Total Notes</p>
                <p className="aurora-label text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.values(progress.notes).flat().length}
                </p>
              </div>
            </div>
          </div>
        )}

        {showCommunityInsights && (
          <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-purple-700 dark:text-purple-300">Community Insights</p>
              <Button variant="secondary" size="sm" onClick={() => setShowCommunityInsights(false)}>Close</Button>
            </div>
            <div className="space-y-2">
              <div className="rounded bg-white dark:bg-slate-900 p-3">
                <p className="aurora-label text-xs text-purple-600 dark:text-purple-400 mb-2">Most Explored Organs (Global)</p>
                <div className="space-y-1">
                  {['Heart', 'Brain', 'Lungs'].map((organ, idx) => (
                    <div key={organ} className="flex items-center gap-2">
                      <Badge variant="default" size="sm">#{idx + 1}</Badge>
                      <span className="aurora-label text-sm text-slate-700 dark:text-slate-300">{organ}</span>
                    </div>
                  ))}
                </div>
              </div>
              {progress.communityRank && (
                <div className="rounded bg-white dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Your Rank</p>
                  <p className="aurora-label text-2xl font-bold text-purple-600 dark:text-purple-400">Top {progress.communityRank}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showProgressViz && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-amber-700 dark:text-amber-300">Learning Journey Timeline</p>
              <Button variant="secondary" size="sm" onClick={() => setShowProgressViz(false)}>Close</Button>
            </div>
            <div className="space-y-2">
              {timeline.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 rounded bg-white dark:bg-slate-900 p-2">
                  <Badge variant="info" size="sm">{formatTimelineDate(entry.at)}</Badge>
                  <span className="aurora-label text-sm text-slate-700 dark:text-slate-300">{entry.node?.name || entry.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {comparisonMode && activeOrganId && (
          <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="aurora-label text-sm font-semibold text-teal-700 dark:text-teal-300">Comparison Mode</p>
              <Button variant="secondary" size="sm" onClick={() => setComparisonMode(false)}>Close</Button>
            </div>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">
              Select another organ to compare with {selectedNode?.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {HUMAN_BLUEPRINT_LIBRARY.filter((n) => n.id !== activeOrganId).slice(0, 5).map((node) => (
                <Button
                  key={node.id}
                  variant={comparisonNodeId === node.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setComparisonNodeId(node.id)}
                >
                  {node.name}
                </Button>
              ))}
            </div>
            {comparisonNodeId && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded bg-white dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{selectedNode?.name}</p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{selectedNode?.summary}</p>
                </div>
                <div className="rounded bg-white dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {HUMAN_BLUEPRINT_LIBRARY_BY_ID[comparisonNodeId]?.name}
                  </p>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {HUMAN_BLUEPRINT_LIBRARY_BY_ID[comparisonNodeId]?.summary}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {GLB_MODEL_ENABLED && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 space-y-1">
            <p className="aurora-label text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">GLB Mesh Debug</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">Clicked mesh: {glbDebugEvent?.objectName || '—'}</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">Parent mesh: {glbDebugEvent?.parentName || '—'}</p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">Resolved region: {glbDebugEvent?.resolvedRegionId || 'No match in manifest'}</p>
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">
              Last event: {glbDebugEvent ? formatTimelineDate(glbDebugEvent.timestamp) : 'No GLB mesh click yet'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[['Organs', quickLookup.organs], ['Systems', quickLookup.systems], ['Features', quickLookup.features]].map(([label, nodes]) => (
            <div key={label as string} className="space-y-2">
              <p className="aurora-label text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label as string}</p>
              <div className="flex flex-wrap gap-2" role="list" aria-label={`${label as string} quick links`}>
                {(nodes as HumanBlueprintNode[]).map((entry) => {
                  const isFavorite = progress.favorites.includes(entry.id);
                  const isExplored = entry.id in progress.explored;
                  const isMastered = progress.mastered.includes(entry.id);
                  return (
                    <div key={entry.id} className="relative group">
                      <button
                        type="button"
                        className={`aurora-label px-3 py-1.5 rounded-full transition-colors pr-8 ${
                          isMastered
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : isExplored
                            ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => selectNode(entry.id)}
                        role="listitem"
                      >
                        {isMastered && '✓ '}
                        {isExplored && !isMastered && '• '}
                        {entry.name}
                      </button>
                      <button
                        type="button"
                        className={`absolute right-1 top-1/2 -translate-y-1/2 text-base transition-colors ${
                          isFavorite
                            ? 'text-amber-500 hover:text-amber-400'
                            : 'text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500 opacity-0 group-hover:opacity-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(entry.id);
                        }}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        ⭐
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {noSearchResults && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-3">
            <p className="aurora-label text-sm text-amber-700 dark:text-amber-300">
              No matches for "{searchQuery}". Try a broader term like heart, brain, breath, or system.
            </p>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={goToNextPhase}>Next Phase</Button>
            <Button size="sm" variant="secondary" onClick={revisitMostRecent} disabled={timeline.length === 0}>Revisit Recent</Button>
            <Button size="sm" variant="secondary" onClick={randomExplore}>Random Explore</Button>
            <Button size="sm" variant="secondary" onClick={collapseUtilityPanels}>Close Utility Panels</Button>
          </div>
        </div>

        {recentNodes.length > 0 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 space-y-2">
            <p className="aurora-label text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Recently Visited</p>
            <div className="flex flex-wrap gap-2">
              {recentNodes.map((item) => (
                <Button key={item.id} size="sm" variant="secondary" onClick={() => selectNode(item.id)}>
                  {item.node?.name ?? item.id}
                </Button>
              ))}
            </div>
          </div>
        )}

        <HumanBlueprintInsightPanel node={selectedNode} phase={activePhase} />
      </Card>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-4">
        <div className="space-y-4">
          <HumanBlueprintDailyFocus node={dailyFocusNode} phase={activePhase} />
          {dailyFocusNode && (
            <Button variant="secondary" size="sm" onClick={() => selectNode(dailyFocusNode.id)}>
              Open Focus Guide
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <HumanBlueprintProgressRail
            exploredCount={exploredCount}
            masteredCount={masteredCount}
            totalCount={HUMAN_BLUEPRINT_LIBRARY.length}
            lastVisitLabel={lastVisitLabel}
          />

          <Card className="space-y-3">
            <CardHeader>
              <CardTitle>Inner Evolution Timeline</CardTitle>
              <CardDescription>
                {daysSinceVisit === null
                  ? 'Start with one region to begin your continuity trail.'
                  : `Last exploration ${daysSinceVisit === 0 ? 'today' : `${daysSinceVisit} day(s) ago`}.`}
              </CardDescription>
            </CardHeader>
            <div className="space-y-2" role="list" aria-label="Recent blueprint timeline">
              {timeline.length === 0 ? (
                <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">No entries yet.</p>
              ) : (
                timeline.map((item) => (
                  <div key={item.id} role="listitem" className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                    <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{item.node?.name ?? item.id}</p>
                    <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">{formatTimelineDate(item.at)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <AuroraModal
        isOpen={Boolean(selectedNode)}
        onClose={() => setActiveOrganId(null)}
        size="xl"
        title={selectedNode ? `${selectedNode.name} Blueprint` : undefined}
        description={selectedNode ? BLUEPRINT_PHASES.find((phase) => phase.id === activePhase)?.subtitle : undefined}
      >
        {selectedNode && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="primary" size="sm">Category: {selectedNode.category}</Badge>
              <Badge variant="info" size="sm">
                Dynamic State: {selectedNode.id === 'heart' ? `${heartRate} bpm` : `${respirationRate} cycles/min`}
              </Badge>
              <Badge variant="success" size="sm">Phase {activePhase}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {nodeTags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {nodeTags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
              ))}
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 1 — Core Facts</p>
                <p className="aurora-label text-sm text-slate-800 dark:text-slate-200">{selectedNode.summary}</p>
                {activePhase >= 3 && (
                  <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-2">{selectedNode.function_physical}</p>
                )}
              </div>

              {activePhase >= 2 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 2 — Lifestyle Links</p>
                  <p className="aurora-label text-xs uppercase text-emerald-600 dark:text-emerald-400 mt-2">Support</p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {selectedNode.lifestyle_support.map((item) => (
                      <li key={item} className="aurora-label">{item}</li>
                    ))}
                  </ul>
                  <p className="aurora-label text-xs uppercase text-amber-600 dark:text-amber-400 mt-2">Harm</p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {selectedNode.lifestyle_harm.map((item) => (
                      <li key={item} className="aurora-label">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activePhase >= 3 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 3 — Emotional & Psychological</p>
                  <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">{selectedNode.function_emotional_psychological}</p>
                  <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-2">{selectedNode.psychological_identity}</p>
                </div>
              )}

              {activePhase >= 2 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 4 — Reflective Guidance</p>
                  <p className="aurora-label text-xs uppercase text-cyan-600 dark:text-cyan-400 mt-2">Reflection Questions</p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {selectedNode.reflection_questions.map((item) => (
                      <li key={item} className="aurora-label">{item}</li>
                    ))}
                  </ul>
                  <p className="aurora-label text-xs uppercase text-blue-600 dark:text-blue-400 mt-2">Micro-actions</p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {selectedNode.micro_actions.map((item) => (
                      <li key={item} className="aurora-label">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activePhase >= 5 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Layer 5 — Long-term Consequences</p>
                  <p className="aurora-label text-sm text-emerald-700 dark:text-emerald-300 mt-1">If honored: {selectedNode.if_honor_this}</p>
                  <p className="aurora-label text-sm text-amber-700 dark:text-amber-300 mt-1">If ignored: {selectedNode.if_ignore_this}</p>
                  <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-2">{selectedNode.long_term_positive}</p>
                  <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedNode.long_term_negative}</p>
                </div>
              )}

              {activePhase >= 4 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                  <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Mythic & Narrative Layer</p>
                  <p className="aurora-label text-sm text-amber-700 dark:text-amber-300 mt-1">{selectedNode.mythic_identity}</p>
                  <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-2">{selectedNode.narrative_voice}</p>
                  <p className="aurora-label text-sm text-slate-700 dark:text-slate-300 mt-2">{selectedNode.transformation_arc}</p>
                </div>
              )}
            </div>

            {selectedNode.relatedNodes && selectedNode.relatedNodes.length > 0 && (
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-3">
                <p className="aurora-label text-xs text-blue-600 dark:text-blue-400 mb-2">Related Content</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.relatedNodes.map((relatedId) => {
                    const related = HUMAN_BLUEPRINT_LIBRARY_BY_ID[relatedId];
                    return related ? (
                      <button
                        key={relatedId}
                        onClick={() => selectNode(relatedId)}
                        className="aurora-label px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                      >
                        {related.name}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {progress.phaseHistory[selectedNode.id] && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 p-3">
                <p className="aurora-label text-xs text-purple-600 dark:text-purple-400 mb-2">Phase History</p>
                <div className="flex flex-wrap gap-1 text-xs">
                  {progress.phaseHistory[selectedNode.id].slice(-5).map((entry, idx) => (
                    <Badge key={idx} variant="default" size="sm">
                      P{entry.phase} · {new Date(entry.timestamp).toLocaleDateString()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950 p-3">
              <p className="aurora-label text-xs text-teal-600 dark:text-teal-400 mb-2">Personal Notes</p>
              <div className="space-y-2">
                {(progress.notes[selectedNode.id] ?? []).map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm bg-white dark:bg-slate-900 rounded p-2">
                    <span className="aurora-label flex-1 text-slate-700 dark:text-slate-300">{note}</span>
                    <button
                      onClick={() => deleteNote(selectedNode.id, idx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote(selectedNode.id, notesInput)}
                    placeholder="Add a quick note..."
                    className="aurora-label flex-1 px-2 py-1.5 text-sm rounded border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addNote(selectedNode.id, notesInput)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Textarea
              label="Optional journal — Your Body’s Story So Far"
              value={progress.journalByNode[selectedNode.id] ?? ''}
              onChange={(event) => saveJournal(event.target.value)}
              placeholder="Capture one insight, one commitment, and one action for this region."
              rows={4}
            />

            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={markMastered}>
                Mark Mastery
              </Button>
              <Button variant="secondary" size="sm" onClick={copyNodeSummary}>
                Copy Summary
              </Button>
              <Button
                variant={meditationActive ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => selectedNode && startMeditation(selectedNode.id)}
                disabled={meditationActive}
              >
                {meditationActive ? 'Meditating...' : 'Guided Meditation'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (selectedNode && collaborationMode) {
                    navigator.clipboard.writeText(`Check out ${selectedNode.name}: ${selectedNode.summary}`);
                    setAnnouncement('Shared with collaborators');
                  }
                }}
                disabled={!collaborationMode}
              >
                Share with Team
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (selectedNode) {
                    const hr = Math.floor(60 + Math.random() * 20);
                    addHealthMetric('heart_rate', hr, 'bpm');
                    setAnnouncement(`Added health metric: Heart rate ${hr} bpm`);
                  }
                }}
              >
                Log Metric
              </Button>
              <Button variant="secondary" size="sm" onClick={resetSelectedNodeData}>
                Reset Node Data
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveOrganId(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </AuroraModal>
    </div>
  );
}
