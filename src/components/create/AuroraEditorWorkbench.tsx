'use client';

import { ChangeEvent, MouseEvent, WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/aurora/Badge';
import { Card, CardDescription, CardTitle } from '@/components/aurora/Card';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { Button } from '@/components/ui/Button';
import {
  applyEditorAction,
  commit,
  createHistory,
  createId,
  createInitialEditorState,
  getGlobalNodeBounds,
  redo,
  undo,
} from '@/lib/editor/commandEngine';
import { auroraEditorFeatureMatrix, featureCategoryLabels, getFeatureMatrixSummary } from '@/lib/editor/featureMatrix';
import { ConstraintMode, EditorAction, EditorNode, EditorNodeKind, HistoryState, LayoutAlign, LayoutMode } from '@/lib/editor/types';

const nodeKindLabel: Record<EditorNodeKind, string> = {
  frame: 'Frame',
  rect: 'Rectangle',
  ellipse: 'Ellipse',
  text: 'Text',
  image: 'Image',
};

const layoutModeOptions: LayoutMode[] = ['none', 'row', 'column'];
const layoutAlignOptions: LayoutAlign[] = ['start', 'center', 'end', 'stretch'];
const constraintOptions: ConstraintMode[] = ['start', 'center', 'end', 'stretch'];
type ExportPreset = 'marketing' | 'product' | 'engineering';
type PackageAssetRecord = {
  id: string;
  name: string;
  kind: EditorNodeKind;
  files: {
    svg: string;
    png: string;
  };
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type ImportedScenePayload = {
  canvas?: {
    width?: number;
    height?: number;
    background?: string;
  };
  nodes?: unknown[];
};

type PackageAssetInput = {
  name?: unknown;
  kind?: unknown;
  frame?: {
    x?: unknown;
    y?: unknown;
    width?: unknown;
    height?: unknown;
  };
  files?: {
    svg?: unknown;
    png?: unknown;
  };
};

type PackageManifestInput = {
  packageVersion?: unknown;
  canvas?: { width?: unknown; height?: unknown; background?: unknown };
  assets?: PackageAssetInput[];
};

const LOCAL_DRAFT_KEY = 'aurora-editor-draft-v1';
const SNAP_GUIDES_KEY = 'aurora-editor-snap-guides';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function nodeToSvg(node: EditorNode) {
  if (node.kind === 'ellipse') {
    return `<ellipse cx="${node.x + node.width / 2}" cy="${node.y + node.height / 2}" rx="${node.width / 2}" ry="${node.height / 2}" fill="${node.fill}" fill-opacity="${node.opacity}" transform="rotate(${node.rotation} ${node.x + node.width / 2} ${node.y + node.height / 2})" />`;
  }

  if (node.kind === 'text') {
    const fontSize = node.fontSize ?? 20;
    const content = escapeXml(node.text ?? node.name);
    return `<text x="${node.x}" y="${node.y + fontSize}" font-size="${fontSize}" font-family="Inter, Arial, sans-serif" fill="${node.fill}" fill-opacity="${node.opacity}" transform="rotate(${node.rotation} ${node.x} ${node.y + fontSize})">${content}</text>`;
  }

  return `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.kind === 'frame' ? 8 : 6}" fill="${node.fill}" fill-opacity="${node.opacity}" transform="rotate(${node.rotation} ${node.x + node.width / 2} ${node.y + node.height / 2})" />`;
}

function makeAssetName(node: EditorNode, index: number, preset: ExportPreset, extension: 'svg' | 'png') {
  const base = node.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `node-${index + 1}`;
  const prefix = preset === 'marketing' ? 'mk' : preset === 'product' ? 'prd' : 'dev';
  const kind = node.kind;
  return `${prefix}-${kind}-${String(index + 1).padStart(2, '0')}-${base}.${extension}`;
}

function renderNodeToPngBlob(node: EditorNode): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(24, Math.ceil(node.width + 24));
  canvas.height = Math.max(24, Math.ceil(node.height + 24));
  const context = canvas.getContext('2d');
  if (!context) return Promise.resolve(null);

  const offsetX = 12;
  const offsetY = 12;
  context.globalAlpha = node.opacity;
  context.translate(offsetX + node.width / 2, offsetY + node.height / 2);
  context.rotate((node.rotation * Math.PI) / 180);
  context.translate(-(offsetX + node.width / 2), -(offsetY + node.height / 2));

  if (node.kind === 'ellipse') {
    context.fillStyle = node.fill;
    context.beginPath();
    context.ellipse(offsetX + node.width / 2, offsetY + node.height / 2, node.width / 2, node.height / 2, 0, 0, Math.PI * 2);
    context.fill();
  } else if (node.kind === 'text') {
    const fontSize = node.fontSize ?? 20;
    context.fillStyle = node.fill;
    context.font = `${fontSize}px Inter, Arial, sans-serif`;
    context.textBaseline = 'top';
    context.fillText(node.text ?? node.name, offsetX, offsetY);
  } else {
    context.fillStyle = node.fill;
    context.fillRect(offsetX, offsetY, node.width, node.height);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function buildPackageManifest(args: {
  preset: ExportPreset;
  canvas: { width: number; height: number; background: string };
  assets: PackageAssetRecord[];
}) {
  return {
    packageVersion: 'aurora-asset-package-v1',
    generatedAt: new Date().toISOString(),
    preset: args.preset,
    canvas: args.canvas,
    assetCount: args.assets.length,
    assets: args.assets,
  };
}

function isNodeKind(value: unknown): value is EditorNodeKind {
  return value === 'frame' || value === 'rect' || value === 'ellipse' || value === 'text' || value === 'image';
}

function normalizeImportedNode(input: unknown, index: number, preserveId = false): EditorNode | null {
  if (!input || typeof input !== 'object') return null;
  const record = input as Record<string, unknown>;
  const kind = isNodeKind(record.kind) ? record.kind : 'rect';
  const name = typeof record.name === 'string' ? record.name : `Imported ${kind} ${index + 1}`;
  const x = typeof record.x === 'number' ? record.x : 80 + index * 12;
  const y = typeof record.y === 'number' ? record.y : 80 + index * 12;
  const width = typeof record.width === 'number' ? Math.max(20, record.width) : 180;
  const height = typeof record.height === 'number' ? Math.max(20, record.height) : 100;
  const rotation = typeof record.rotation === 'number' ? record.rotation : 0;
  const opacity = typeof record.opacity === 'number' ? Math.min(1, Math.max(0.1, record.opacity)) : 1;
  const fill = typeof record.fill === 'string' ? record.fill : '#cbd5e1';

  const node: EditorNode = {
    id: preserveId && typeof record.id === 'string' ? record.id : createId(kind),
    kind,
    name,
    x,
    y,
    width,
    height,
    rotation,
    opacity,
    fill,
    visible: true,
    locked: false,
  };

  if (kind === 'text') {
    node.text = typeof record.text === 'string' ? record.text : name;
    node.fontSize = typeof record.fontSize === 'number' ? Math.max(8, record.fontSize) : 24;
  }

  return node;
}

function validatePackageManifest(input: PackageManifestInput) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(input.assets)) {
    errors.push('Manifest must include an assets array.');
    return { errors, warnings };
  }

  if (typeof input.packageVersion !== 'string') {
    warnings.push('Missing packageVersion field.');
  }

  input.assets.forEach((asset, index) => {
    const slot = index + 1;

    if (!isNodeKind(asset.kind)) {
      warnings.push(`Asset ${slot}: unknown kind, defaulting to rectangle.`);
    }

    if (!asset.frame || typeof asset.frame !== 'object') {
      warnings.push(`Asset ${slot}: missing frame data.`);
    }

    if (!asset.files || typeof asset.files !== 'object') {
      warnings.push(`Asset ${slot}: missing files references.`);
      return;
    }

    if (typeof asset.files.svg !== 'string') {
      warnings.push(`Asset ${slot}: missing SVG reference.`);
    }

    if (typeof asset.files.png !== 'string') {
      warnings.push(`Asset ${slot}: missing PNG reference.`);
    }
  });

  return { errors, warnings };
}

function statusVariant(status: 'not-started' | 'in-progress' | 'complete'): 'default' | 'success' | 'warning' {
  if (status === 'complete') return 'success';
  if (status === 'in-progress') return 'warning';
  return 'default';
}

function makeNode(kind: EditorNodeKind): EditorNode {
  const base = {
    x: 160,
    y: 140,
    width: 200,
    height: 120,
    rotation: 0,
    opacity: 1,
    fill: '#cbd5e1',
    visible: true,
    locked: false,
  } satisfies Omit<EditorNode, 'id' | 'kind' | 'name'>;

  if (kind === 'frame') {
    return { ...base, id: createId('frame'), kind, name: 'New Frame', width: 640, height: 420, fill: '#f8fafc' };
  }

  if (kind === 'ellipse') {
    return { ...base, id: createId('ellipse'), kind, name: 'New Ellipse', fill: '#93c5fd' };
  }

  if (kind === 'text') {
    return {
      ...base,
      id: createId('text'),
      kind,
      name: 'New Text',
      width: 260,
      height: 60,
      fill: '#0f172a',
      text: 'Edit text',
      fontSize: 28,
    };
  }

  if (kind === 'image') {
    return {
      ...base,
      id: createId('image'),
      kind,
      name: 'Image Placeholder',
      width: 280,
      height: 180,
      fill: '#e2e8f0',
    };
  }

  return { ...base, id: createId('rect'), kind, name: 'New Rectangle' };
}

export function AuroraEditorWorkbench() {
  const router = useRouter();
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const sceneImportRef = useRef<HTMLInputElement>(null);
  const packageImportRef = useRef<HTMLInputElement>(null);
  const previewImportRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<HistoryState<ReturnType<typeof createInitialEditorState>>>(() =>
    createHistory(createInitialEditorState())
  );
  const [dragging, setDragging] = useState<{
    ids: string[];
    startX: number;
    startY: number;
    origins: Record<string, { x: number; y: number }>;
  } | null>(null);
  const [marqueeSelection, setMarqueeSelection] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    append: boolean;
  } | null>(null);
  const [activeGuides, setActiveGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [resizeSelection, setResizeSelection] = useState<{
    handle: 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';
    startX: number;
    startY: number;
    bounds: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      width: number;
      height: number;
    };
    ratio: number;
    nodes: Array<{ id: string; x: number; y: number; width: number; height: number }>;
  } | null>(null);
  const [panning, setPanning] = useState<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isMinimapDragging, setIsMinimapDragging] = useState(false);
  const [viewportMetrics, setViewportMetrics] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 0,
    clientHeight: 0,
  });
  const [snapGuidesEnabled, setSnapGuidesEnabled] = useState(true);
  const [exportPreset, setExportPreset] = useState<ExportPreset>('product');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [nodePreviews, setNodePreviews] = useState<Record<string, string>>({});
  const [importNotice, setImportNotice] = useState('');
  const [packageIssues, setPackageIssues] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const state = history.present;
  const selectedNode = state.nodes.find((node) => node.id === state.selectedId) ?? null;
  const selectedNodeId = selectedNode?.id ?? null;
  const frameNodes = state.nodes.filter((node) => node.kind === 'frame');
  const childCount = selectedNode ? state.nodes.filter((node) => node.parentId === selectedNode.id).length : 0;
  const selectedNodes = state.nodes.filter((node) => selectedIds.includes(node.id));
  const disallowedParentIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();

    const blocked = new Set<string>([selectedNode.id]);
    const queue = [selectedNode.id];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) continue;

      state.nodes
        .filter((node) => node.parentId === currentId)
        .forEach((child) => {
          if (blocked.has(child.id)) return;
          blocked.add(child.id);
          queue.push(child.id);
        });
    }

    return blocked;
  }, [selectedNode, state.nodes]);
  const canUngroupSelection = selectedNodes.some(
    (node) => node.kind === 'frame' && state.nodes.some((child) => child.parentId === node.id)
  );
  const selectionBounds = useMemo(() => {
    if (selectedNodes.length === 0) return null;

    const globalBounds = selectedNodes.map((node) => getGlobalNodeBounds(node, state.nodes));
    const minX = Math.min(...globalBounds.map((node) => node.x));
    const minY = Math.min(...globalBounds.map((node) => node.y));
    const maxX = Math.max(...globalBounds.map((node) => node.x + node.width));
    const maxY = Math.max(...globalBounds.map((node) => node.y + node.height));

    return {
      count: selectedNodes.length,
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY),
    };
  }, [selectedNodes, state.nodes]);
  const matrixSummary = useMemo(() => getFeatureMatrixSummary(auroraEditorFeatureMatrix), []);

  const clampZoom = useCallback((value: number) => Math.min(3, Math.max(0.2, value)), []);

  const viewportPadding = 24;
  const minimap = useMemo(() => {
    const baseWidth = 180;
    const maxHeight = 140;
    const rawHeight = (state.canvas.height / state.canvas.width) * baseWidth;
    const height = Math.min(maxHeight, rawHeight);
    const width = rawHeight > maxHeight ? (state.canvas.width / state.canvas.height) * height : baseWidth;
    const scale = width / state.canvas.width;
    return { width, height, scale };
  }, [state.canvas.height, state.canvas.width]);

  const viewportBox = useMemo(() => {
    if (viewportMetrics.clientWidth === 0 || viewportMetrics.clientHeight === 0) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    const visibleWidth = Math.max(0, viewportMetrics.clientWidth - viewportPadding * 2) / state.zoom;
    const visibleHeight = Math.max(0, viewportMetrics.clientHeight - viewportPadding * 2) / state.zoom;
    const visibleX = Math.max(0, (viewportMetrics.scrollLeft - viewportPadding) / state.zoom);
    const visibleY = Math.max(0, (viewportMetrics.scrollTop - viewportPadding) / state.zoom);

    return {
      left: Math.min(minimap.width - 2, visibleX * minimap.scale),
      top: Math.min(minimap.height - 2, visibleY * minimap.scale),
      width: Math.min(minimap.width, visibleWidth * minimap.scale),
      height: Math.min(minimap.height, visibleHeight * minimap.scale),
    };
  }, [minimap.height, minimap.scale, minimap.width, state.zoom, viewportMetrics, viewportPadding]);

  useEffect(() => {
    const existingIds = new Set(state.nodes.map((node) => node.id));
    setSelectedIds((current) => current.filter((id) => existingIds.has(id)));
  }, [state.nodes]);

  useEffect(() => {
    const selectedId = state.selectedId;
    if (typeof selectedId !== 'string') {
      setSelectedIds([]);
      return;
    }

    const stableSelectedId: string = selectedId;

    setSelectedIds((current) => {
      if (current.length > 1) return current;
      if (current.length === 1 && current[0] === stableSelectedId) return current;
      return [stableSelectedId];
    });
  }, [state.selectedId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(SNAP_GUIDES_KEY);
    if (stored === 'true' || stored === 'false') {
      setSnapGuidesEnabled(stored === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SNAP_GUIDES_KEY, String(snapGuidesEnabled));
  }, [snapGuidesEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      version: 'aurora-editor-draft-v1',
      savedAt: new Date().toISOString(),
      canvas: state.canvas,
      nodes: state.nodes,
      selectedId: state.selectedId,
      nodePreviews,
    };
    window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(payload));
  }, [nodePreviews, state.canvas, state.nodes, state.selectedId]);

  const downloadBlob = useCallback((filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportSceneAsJson = useCallback(() => {
    const payload = {
      version: 'aurora-editor-v2',
      exportedAt: new Date().toISOString(),
      canvas: state.canvas,
      nodes: state.nodes,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob('aurora-scene.json', blob);
  }, [downloadBlob, state.canvas, state.nodes]);

  const exportSelectedAsSvg = useCallback(() => {
    if (!selectedNode) return;

    const minX = Math.min(0, selectedNode.x);
    const minY = Math.min(0, selectedNode.y);
    const width = Math.max(selectedNode.width + Math.abs(minX) + 24, 24);
    const height = Math.max(selectedNode.height + Math.abs(minY) + 24, 24);
    const svgNode = {
      ...selectedNode,
      x: selectedNode.x - minX + 12,
      y: selectedNode.y - minY + 12,
    };

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  ${nodeToSvg(svgNode)}\n</svg>`;
    const safeName = selectedNode.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'node';
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(`${safeName}.svg`, blob);
  }, [downloadBlob, selectedNode]);

  const exportNodeAsSvg = useCallback((node: EditorNode, filename: string) => {
    const svgNode = {
      ...node,
      x: 12,
      y: 12,
    };
    const width = Math.max(24, node.width + 24);
    const height = Math.max(24, node.height + 24);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  ${nodeToSvg(svgNode)}\n</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(filename, blob);
  }, [downloadBlob]);

  const exportAssetSet = useCallback(async () => {
    const targets = state.nodes.filter((node) => node.visible);
    for (let index = 0; index < targets.length; index += 1) {
      const node = targets[index];
      const svgName = makeAssetName(node, index, exportPreset, 'svg');
      exportNodeAsSvg(node, svgName);

      const pngBlob = await renderNodeToPngBlob(node);
      if (pngBlob) {
        const pngName = makeAssetName(node, index, exportPreset, 'png');
        downloadBlob(pngName, pngBlob);
      }
    }
  }, [downloadBlob, exportNodeAsSvg, exportPreset, state.nodes]);

  const exportPackageBundle = useCallback(async () => {
    const targets = state.nodes.filter((node) => node.visible);
    const assets: PackageAssetRecord[] = [];

    for (let index = 0; index < targets.length; index += 1) {
      const node = targets[index];
      const svgName = makeAssetName(node, index, exportPreset, 'svg');
      const pngName = makeAssetName(node, index, exportPreset, 'png');

      exportNodeAsSvg(node, svgName);
      const pngBlob = await renderNodeToPngBlob(node);
      if (pngBlob) {
        downloadBlob(pngName, pngBlob);
      }

      assets.push({
        id: node.id,
        name: node.name,
        kind: node.kind,
        files: {
          svg: svgName,
          png: pngName,
        },
        frame: {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        },
      });
    }

    const index = {
      package: 'aurora-editor-package',
      createdAt: new Date().toISOString(),
      assets: assets.map((asset) => asset.files),
    };
    const indexBlob = new Blob([JSON.stringify(index, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob('aurora-assets.index.json', indexBlob);

    const manifest = buildPackageManifest({
      preset: exportPreset,
      canvas: state.canvas,
      assets,
    });
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob('aurora-package.manifest.json', manifestBlob);
  }, [downloadBlob, exportNodeAsSvg, exportPreset, state.canvas, state.nodes]);

  const importSceneFile = useCallback(async (file: File) => {
    const content = await file.text();
    const parsed = JSON.parse(content) as ImportedScenePayload;

    const importedNodes = Array.isArray(parsed.nodes)
      ? parsed.nodes.map((item, index) => normalizeImportedNode(item, index)).filter((item): item is EditorNode => Boolean(item))
      : [];

    if (importedNodes.length === 0) {
      setImportNotice('Scene import skipped: no valid nodes found.');
      return;
    }

    const nextCanvas = {
      width: typeof parsed.canvas?.width === 'number' ? parsed.canvas.width : state.canvas.width,
      height: typeof parsed.canvas?.height === 'number' ? parsed.canvas.height : state.canvas.height,
      background: typeof parsed.canvas?.background === 'string' ? parsed.canvas.background : state.canvas.background,
    };

    const nextNodes = importMode === 'append' ? [...state.nodes, ...importedNodes] : importedNodes;
    const nextState = {
      ...state,
      canvas: importMode === 'append' ? state.canvas : nextCanvas,
      nodes: nextNodes,
      selectedId: importedNodes[0]?.id ?? state.selectedId,
    };

    setHistory((current) => commit(current, nextState));
    setPackageIssues([]);
    setImportNotice(`Scene imported (${importMode}): ${importedNodes.length} nodes.`);
  }, [importMode, state]);

  const importPackageFile = useCallback(async (file: File) => {
    const content = await file.text();
    const parsed = JSON.parse(content) as PackageManifestInput;

    const validation = validatePackageManifest(parsed);
    if (validation.errors.length > 0) {
      setPackageIssues(validation.errors);
      setImportNotice(`Package import blocked: ${validation.errors[0]}`);
      return;
    }

    const importedNodes = Array.isArray(parsed.assets)
      ? parsed.assets.map((asset, index) => {
          const kind = isNodeKind(asset.kind) ? asset.kind : 'rect';
          const frame = asset.frame ?? {};
          const baseName = typeof asset.name === 'string' && asset.name.trim().length > 0
            ? asset.name
            : `Package ${kind} ${index + 1}`;

          const node: EditorNode = {
            id: createId(kind),
            kind,
            name: baseName,
            x: typeof frame.x === 'number' ? frame.x : 96 + index * 8,
            y: typeof frame.y === 'number' ? frame.y : 96 + index * 8,
            width: typeof frame.width === 'number' ? Math.max(20, frame.width) : 180,
            height: typeof frame.height === 'number' ? Math.max(20, frame.height) : 110,
            rotation: 0,
            opacity: 1,
            fill: kind === 'frame' ? '#f8fafc' : kind === 'ellipse' ? '#93c5fd' : kind === 'text' ? '#0f172a' : '#cbd5e1',
            visible: true,
            locked: false,
          };

          if (kind === 'text') {
            node.text = baseName;
            node.fontSize = 24;
          }

          return node;
        })
      : [];

    if (importedNodes.length === 0) {
      setImportNotice('Package import skipped: no valid assets found.');
      setPackageIssues(validation.warnings);
      return;
    }

    const nextCanvas = {
      width: typeof parsed.canvas?.width === 'number' ? parsed.canvas.width : state.canvas.width,
      height: typeof parsed.canvas?.height === 'number' ? parsed.canvas.height : state.canvas.height,
      background: typeof parsed.canvas?.background === 'string' ? parsed.canvas.background : state.canvas.background,
    };

    const nextNodes = importMode === 'append' ? [...state.nodes, ...importedNodes] : importedNodes;
    const nextState = {
      ...state,
      canvas: importMode === 'append' ? state.canvas : nextCanvas,
      nodes: nextNodes,
      selectedId: importedNodes[0]?.id ?? state.selectedId,
    };

    setHistory((current) => commit(current, nextState));
    setPackageIssues(validation.warnings);
    setImportNotice(
      validation.warnings.length > 0
        ? `Package imported (${importMode}): ${importedNodes.length} assets with ${validation.warnings.length} warnings.`
        : `Package imported (${importMode}): ${importedNodes.length} assets.`
    );
  }, [importMode, state]);

  const restoreLocalDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) {
      setImportNotice('No local draft found.');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ImportedScenePayload & { selectedId?: unknown; nodePreviews?: unknown };
      const importedNodes = Array.isArray(parsed.nodes)
        ? parsed.nodes.map((item, index) => normalizeImportedNode(item, index, true)).filter((item): item is EditorNode => Boolean(item))
        : [];

      if (importedNodes.length === 0) {
        setImportNotice('Local draft invalid: no nodes to restore.');
        return;
      }

      const nextCanvas = {
        width: typeof parsed.canvas?.width === 'number' ? parsed.canvas.width : state.canvas.width,
        height: typeof parsed.canvas?.height === 'number' ? parsed.canvas.height : state.canvas.height,
        background: typeof parsed.canvas?.background === 'string' ? parsed.canvas.background : state.canvas.background,
      };

      const nextSelected = typeof parsed.selectedId === 'string' && importedNodes.some((node) => node.id === parsed.selectedId)
        ? parsed.selectedId
        : importedNodes[0]?.id ?? null;

      const nextState = {
        ...state,
        canvas: nextCanvas,
        nodes: importedNodes,
        selectedId: nextSelected,
      };

      const restoredPreviews =
        parsed.nodePreviews && typeof parsed.nodePreviews === 'object'
          ? Object.entries(parsed.nodePreviews as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
              if (typeof value === 'string') {
                acc[key] = value;
              }
              return acc;
            }, {})
          : {};

      setHistory((current) => commit(current, nextState));
      setNodePreviews(restoredPreviews);
      setPackageIssues([]);
      setImportNotice(`Local draft restored: ${importedNodes.length} nodes.`);
    } catch {
      setImportNotice('Local draft restore failed: invalid saved data.');
    }
  }, [state]);

  const clearLocalDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(LOCAL_DRAFT_KEY);
    setPackageIssues([]);
    setImportNotice('Local draft cleared.');
  }, []);

  const onAttachPreviewChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedNode) return;

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('Failed to read image preview'));
        reader.readAsDataURL(file);
      });

      if (!dataUrl) {
        setImportNotice('Preview attach failed: empty image payload.');
        return;
      }

      setNodePreviews((current) => ({
        ...current,
        [selectedNode.id]: dataUrl,
      }));
      setImportNotice(`Preview attached to ${selectedNode.name}.`);
    } catch {
      setImportNotice('Preview attach failed: unreadable image file.');
    }

    event.target.value = '';
  }, [selectedNode]);

  const clearSelectedPreview = useCallback(() => {
    if (!selectedNode) return;
    setNodePreviews((current) => {
      const next = { ...current };
      delete next[selectedNode.id];
      return next;
    });
    setImportNotice(`Preview cleared for ${selectedNode.name}.`);
  }, [selectedNode]);

  const onImportSceneChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importSceneFile(file);
    } catch {
      setImportNotice('Scene import failed: invalid JSON format.');
    }
    event.target.value = '';
  }, [importSceneFile]);

  const onImportPackageChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importPackageFile(file);
    } catch {
      setImportNotice('Package import failed: invalid manifest format.');
    }
    event.target.value = '';
  }, [importPackageFile]);

  const runAction = useCallback((action: EditorAction, recordHistory = true) => {
    setHistory((current) => {
      const nextState = applyEditorAction(current.present, action);
      if (!recordHistory) {
        return { ...current, present: nextState };
      }
      return commit(current, nextState);
    });
  }, []);

  const runBatchActions = useCallback((actions: EditorAction[]) => {
    if (actions.length === 0) return;
    setHistory((current) => {
      const nextState = actions.reduce((acc, action) => applyEditorAction(acc, action), current.present);
      return commit(current, nextState);
    });
  }, []);

  const handleNodeSelection = useCallback((id: string, append: boolean) => {
    if (append) {
      const exists = selectedIds.includes(id);
      const nextSelectedIds = exists ? selectedIds.filter((value) => value !== id) : [...selectedIds, id];
      setSelectedIds(nextSelectedIds);
      runAction({ type: 'select-node', id: nextSelectedIds[nextSelectedIds.length - 1] ?? null }, false);
      return;
    }

    setSelectedIds([id]);
    runAction({ type: 'select-node', id }, false);
  }, [runAction, selectedIds]);

  const groupSelectedNodes = useCallback(() => {
    if (selectedIds.length < 2) return;

    const nodes = state.nodes.filter((node) => selectedIds.includes(node.id));
    if (nodes.length < 2) return;

    const minX = Math.min(...nodes.map((node) => node.x));
    const minY = Math.min(...nodes.map((node) => node.y));
    const maxX = Math.max(...nodes.map((node) => node.x + node.width));
    const maxY = Math.max(...nodes.map((node) => node.y + node.height));

    const groupId = createId('frame');
    const groupNode: EditorNode = {
      id: groupId,
      kind: 'frame',
      name: 'Selection Group',
      x: minX - 16,
      y: minY - 16,
      width: Math.max(120, maxX - minX + 32),
      height: Math.max(120, maxY - minY + 32),
      rotation: 0,
      opacity: 1,
      fill: '#f8fafc',
      layoutMode: 'none',
      layoutGap: 12,
      layoutPadding: 16,
      layoutAlign: 'start',
      visible: true,
      locked: false,
    };

    const actions: EditorAction[] = [
      { type: 'add-node', node: groupNode },
      ...nodes.map((node) => ({
        type: 'update-node' as const,
        id: node.id,
        patch: {
          parentId: groupId,
          constraintX: node.constraintX ?? 'start',
          constraintY: node.constraintY ?? 'start',
        },
      })),
      { type: 'select-node', id: groupId },
    ];

    runBatchActions(actions);
    setSelectedIds([groupId]);
  }, [runBatchActions, selectedIds, state.nodes]);

  const ungroupSelectedNodes = useCallback(() => {
    const groupNodes = state.nodes.filter(
      (node) => selectedIds.includes(node.id) && node.kind === 'frame' && state.nodes.some((child) => child.parentId === node.id)
    );

    if (groupNodes.length === 0) return;

    const actions: EditorAction[] = [];
    const releasedIds: string[] = [];

    groupNodes.forEach((groupNode) => {
      state.nodes
        .filter((child) => child.parentId === groupNode.id)
        .forEach((child) => {
          releasedIds.push(child.id);
          actions.push({
            type: 'update-node',
            id: child.id,
            patch: {
              parentId: undefined,
              constraintX: undefined,
              constraintY: undefined,
            },
          });
        });

      actions.push({ type: 'remove-node', id: groupNode.id });
    });

    if (releasedIds.length > 0) {
      actions.push({ type: 'select-node', id: releasedIds[0] });
    }

    runBatchActions(actions);
    setSelectedIds(releasedIds);
  }, [runBatchActions, selectedIds, state.nodes]);

  const updateSelectedNode = (patch: Partial<EditorNode>) => {
    if (!selectedNode) return;
    runAction({ type: 'update-node', id: selectedNode.id, patch });
  };

  const alignSelectedNode = useCallback((axis: 'x' | 'y', mode: 'start' | 'center' | 'end') => {
    if (!selectedNodeId) return;
    runAction({ type: 'align-node', id: selectedNodeId, axis, mode });
  }, [runAction, selectedNodeId]);

  const alignSelection = useCallback((axis: 'x' | 'y', mode: 'start' | 'center' | 'end') => {
    if (selectedNodes.length <= 1 || !selectionBounds) {
      alignSelectedNode(axis, mode);
      return;
    }

    const actions = selectedNodes.map((node) => {
      let patch: Partial<EditorNode> = {};
      if (axis === 'x') {
        if (mode === 'start') patch = { x: selectionBounds.minX };
        if (mode === 'center') patch = { x: selectionBounds.minX + (selectionBounds.width - node.width) / 2 };
        if (mode === 'end') patch = { x: selectionBounds.maxX - node.width };
      }

      if (axis === 'y') {
        if (mode === 'start') patch = { y: selectionBounds.minY };
        if (mode === 'center') patch = { y: selectionBounds.minY + (selectionBounds.height - node.height) / 2 };
        if (mode === 'end') patch = { y: selectionBounds.maxY - node.height };
      }

      return { type: 'update-node' as const, id: node.id, patch };
    });

    runBatchActions(actions);
  }, [alignSelectedNode, runBatchActions, selectionBounds, selectedNodes]);

  const getHandleCursor = (handle: 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se') => {
    if (handle === 'n' || handle === 's') return 'ns-resize';
    if (handle === 'e' || handle === 'w') return 'ew-resize';
    if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
    return 'nwse-resize';
  };

  const distributeSelection = useCallback((axis: 'x' | 'y') => {
    if (!selectionBounds || selectedNodes.length < 3) return;

    const ordered = [...selectedNodes].sort((a, b) => (axis === 'x' ? a.x - b.x : a.y - b.y));
    const totalSize = ordered.reduce((sum, node) => sum + (axis === 'x' ? node.width : node.height), 0);
    const available = (axis === 'x' ? selectionBounds.width : selectionBounds.height) - totalSize;
    const gap = available / (ordered.length - 1);

    let cursor = axis === 'x' ? selectionBounds.minX : selectionBounds.minY;
    const actions = ordered.map((node) => {
      const patch: Partial<EditorNode> = axis === 'x' ? { x: cursor } : { y: cursor };
      cursor += (axis === 'x' ? node.width : node.height) + gap;
      return { type: 'update-node' as const, id: node.id, patch };
    });

    runBatchActions(actions);
  }, [runBatchActions, selectionBounds, selectedNodes]);

  const selectAllNodes = useCallback(() => {
    if (state.nodes.length === 0) return;
    const ids = state.nodes.map((node) => node.id);
    setSelectedIds(ids);
    runAction({ type: 'select-node', id: ids[ids.length - 1] ?? null }, false);
  }, [runAction, state.nodes]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    runAction({ type: 'select-node', id: null }, false);
  }, [runAction]);

  const getCanvasCoordinatesFromClient = useCallback((clientX: number, clientY: number) => {
    const viewport = canvasViewportRef.current;
    if (!viewport) {
      return { x: 0, y: 0 };
    }

    const viewportRect = viewport.getBoundingClientRect();
    return {
      x: (clientX - viewportRect.left) / state.zoom,
      y: (clientY - viewportRect.top) / state.zoom,
    };
  }, [state.zoom]);

  const updateViewportMetrics = useCallback(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    setViewportMetrics({
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      clientWidth: viewport.clientWidth,
      clientHeight: viewport.clientHeight,
    });
  }, []);

  useEffect(() => {
    updateViewportMetrics();
    const handleResize = () => updateViewportMetrics();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateViewportMetrics, state.zoom, state.canvas.height, state.canvas.width]);

  const zoomToFit = useCallback(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    const availableWidth = Math.max(0, viewport.clientWidth - viewportPadding * 2);
    const availableHeight = Math.max(0, viewport.clientHeight - viewportPadding * 2);
    if (availableWidth === 0 || availableHeight === 0) return;

    const zoomX = availableWidth / state.canvas.width;
    const zoomY = availableHeight / state.canvas.height;
    const nextZoom = clampZoom(Math.min(zoomX, zoomY));
    runAction({ type: 'set-zoom', zoom: nextZoom }, false);

    requestAnimationFrame(() => {
      const contentWidth = state.canvas.width * nextZoom + viewportPadding * 2;
      const contentHeight = state.canvas.height * nextZoom + viewportPadding * 2;
      viewport.scrollLeft = Math.max(0, (contentWidth - viewport.clientWidth) / 2);
      viewport.scrollTop = Math.max(0, (contentHeight - viewport.clientHeight) / 2);
      updateViewportMetrics();
    });
  }, [clampZoom, runAction, state.canvas.height, state.canvas.width, updateViewportMetrics, viewportPadding]);

  const resetZoom = useCallback(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    const nextZoom = 1;
    runAction({ type: 'set-zoom', zoom: nextZoom }, false);

    requestAnimationFrame(() => {
      const contentWidth = state.canvas.width * nextZoom + viewportPadding * 2;
      const contentHeight = state.canvas.height * nextZoom + viewportPadding * 2;
      viewport.scrollLeft = Math.max(0, (contentWidth - viewport.clientWidth) / 2);
      viewport.scrollTop = Math.max(0, (contentHeight - viewport.clientHeight) / 2);
      updateViewportMetrics();
    });
  }, [runAction, state.canvas.height, state.canvas.width, updateViewportMetrics, viewportPadding]);

  const stepZoom = useCallback((delta: number) => {
    const nextZoom = clampZoom(state.zoom + delta);
    if (nextZoom === state.zoom) return;
    runAction({ type: 'set-zoom', zoom: nextZoom }, false);
    updateViewportMetrics();
  }, [clampZoom, runAction, state.zoom, updateViewportMetrics]);

  const setViewportFromMinimap = useCallback((clientX: number, clientY: number) => {
    const viewport = canvasViewportRef.current;
    const minimapEl = minimapRef.current;
    if (!viewport || !minimapEl) return;

    const rect = minimapEl.getBoundingClientRect();
    const relativeX = Math.min(minimap.width, Math.max(0, clientX - rect.left));
    const relativeY = Math.min(minimap.height, Math.max(0, clientY - rect.top));

    const visibleWidth = Math.max(0, viewport.clientWidth - viewportPadding * 2) / state.zoom;
    const visibleHeight = Math.max(0, viewport.clientHeight - viewportPadding * 2) / state.zoom;

    const targetCenterX = relativeX / minimap.scale;
    const targetCenterY = relativeY / minimap.scale;

    const targetX = Math.min(state.canvas.width - visibleWidth, Math.max(0, targetCenterX - visibleWidth / 2));
    const targetY = Math.min(state.canvas.height - visibleHeight, Math.max(0, targetCenterY - visibleHeight / 2));

    viewport.scrollLeft = targetX * state.zoom + viewportPadding;
    viewport.scrollTop = targetY * state.zoom + viewportPadding;
    updateViewportMetrics();
  }, [minimap.height, minimap.scale, minimap.width, state.canvas.height, state.canvas.width, state.zoom, updateViewportMetrics, viewportPadding]);

  useEffect(() => {
    if (!isMinimapDragging) return undefined;

    const handleMove = (event: globalThis.MouseEvent) => {
      setViewportFromMinimap(event.clientX, event.clientY);
    };

    const handleUp = () => {
      setIsMinimapDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isMinimapDragging, setViewportFromMinimap]);

  const startPanning = useCallback((event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    event.preventDefault();
    event.stopPropagation();
    setPanning({
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    });
  }, []);

  const handleViewportWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const currentZoom = state.zoom;
    const zoomStep = Math.sign(-event.deltaY) * 0.1;
    const nextZoom = clampZoom(currentZoom + zoomStep);
    if (nextZoom === currentZoom) return;

    const beforeX = (viewport.scrollLeft + pointerX) / currentZoom;
    const beforeY = (viewport.scrollTop + pointerY) / currentZoom;

    runAction({ type: 'set-zoom', zoom: nextZoom }, false);
    viewport.scrollLeft = beforeX * nextZoom - pointerX;
    viewport.scrollTop = beforeY * nextZoom - pointerY;
  }, [clampZoom, runAction, state.zoom]);

  const startDraggingNode = (event: MouseEvent<HTMLButtonElement>, node: EditorNode) => {
    if (isSpacePressed) {
      startPanning(event);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const { x: mouseX, y: mouseY } = getCanvasCoordinatesFromClient(event.clientX, event.clientY);

    const dragIds = selectedIds.includes(node.id) && selectedIds.length > 0 ? selectedIds : [node.id];
    if (!selectedIds.includes(node.id)) {
      setSelectedIds([node.id]);
      runAction({ type: 'select-node', id: node.id }, false);
    }

    const origins = dragIds.reduce<Record<string, { x: number; y: number }>>((acc, id) => {
      const dragNode = state.nodes.find((entry) => entry.id === id);
      if (dragNode) {
        acc[id] = { x: dragNode.x, y: dragNode.y };
      }
      return acc;
    }, {});

    setMarqueeSelection(null);
    setDragging({
      ids: dragIds,
      startX: mouseX,
      startY: mouseY,
      origins,
    });
  };

  const dragNode = (event: MouseEvent<HTMLDivElement>) => {
    if (panning) {
      const viewport = canvasViewportRef.current;
      if (!viewport) return;
      const deltaX = event.clientX - panning.startX;
      const deltaY = event.clientY - panning.startY;
      viewport.scrollLeft = panning.scrollLeft - deltaX;
      viewport.scrollTop = panning.scrollTop - deltaY;
      return;
    }
    const { x: mouseX, y: mouseY } = getCanvasCoordinatesFromClient(event.clientX, event.clientY);

    if (resizeSelection) {
      const minSize = 20;
      let nextMinX = resizeSelection.bounds.minX;
      let nextMaxX = resizeSelection.bounds.maxX;
      let nextMinY = resizeSelection.bounds.minY;
      let nextMaxY = resizeSelection.bounds.maxY;

      if (resizeSelection.handle.includes('w')) {
        nextMinX = Math.min(mouseX, nextMaxX - minSize);
      }

      if (resizeSelection.handle.includes('e')) {
        nextMaxX = Math.max(mouseX, nextMinX + minSize);
      }

      if (resizeSelection.handle.includes('n')) {
        nextMinY = Math.min(mouseY, nextMaxY - minSize);
      }

      if (resizeSelection.handle.includes('s')) {
        nextMaxY = Math.max(mouseY, nextMinY + minSize);
      }

      if (event.altKey) {
        const centerX = (resizeSelection.bounds.minX + resizeSelection.bounds.maxX) / 2;
        const centerY = (resizeSelection.bounds.minY + resizeSelection.bounds.maxY) / 2;

        if (resizeSelection.handle.includes('w') || resizeSelection.handle.includes('e')) {
          const halfWidth = Math.max(minSize / 2, Math.abs((resizeSelection.handle.includes('w') ? nextMinX : nextMaxX) - centerX));
          nextMinX = centerX - halfWidth;
          nextMaxX = centerX + halfWidth;
        }

        if (resizeSelection.handle.includes('n') || resizeSelection.handle.includes('s')) {
          const halfHeight = Math.max(minSize / 2, Math.abs((resizeSelection.handle.includes('n') ? nextMinY : nextMaxY) - centerY));
          nextMinY = centerY - halfHeight;
          nextMaxY = centerY + halfHeight;
        }
      }

      if (event.shiftKey && resizeSelection.ratio > 0) {
        const nextWidth = Math.max(minSize, nextMaxX - nextMinX);
        const nextHeight = Math.max(minSize, nextMaxY - nextMinY);
        const widthBasedHeight = nextWidth / resizeSelection.ratio;
        const heightBasedWidth = nextHeight * resizeSelection.ratio;

        if (Math.abs(nextWidth - resizeSelection.bounds.width) >= Math.abs(nextHeight - resizeSelection.bounds.height)) {
          const targetHeight = Math.max(minSize, widthBasedHeight);
          if (resizeSelection.handle.includes('n')) {
            nextMinY = nextMaxY - targetHeight;
          } else {
            nextMaxY = nextMinY + targetHeight;
          }
        } else {
          const targetWidth = Math.max(minSize, heightBasedWidth);
          if (resizeSelection.handle.includes('w')) {
            nextMinX = nextMaxX - targetWidth;
          } else {
            nextMaxX = nextMinX + targetWidth;
          }
        }
      }

      const snapTolerance = 6;
      let guideX: number[] = [];
      let guideY: number[] = [];

      if (snapGuidesEnabled) {
        const candidatesX = new Set<number>([0, state.canvas.width / 2, state.canvas.width]);
        const candidatesY = new Set<number>([0, state.canvas.height / 2, state.canvas.height]);

        state.nodes
          .filter((node) => !resizeSelection.nodes.some((entry) => entry.id === node.id))
          .forEach((node) => {
            const globalBounds = getGlobalNodeBounds(node, state.nodes);
            candidatesX.add(globalBounds.x);
            candidatesX.add(globalBounds.x + globalBounds.width / 2);
            candidatesX.add(globalBounds.x + globalBounds.width);
            candidatesY.add(globalBounds.y);
            candidatesY.add(globalBounds.y + globalBounds.height / 2);
            candidatesY.add(globalBounds.y + globalBounds.height);
          });

        const checkSnap = (value: number, candidates: Set<number>): { delta: number; guide: number } | null => {
          let closest: { delta: number; guide: number } | null = null;
          candidates.forEach((candidate) => {
            const delta = candidate - value;
            if (Math.abs(delta) <= snapTolerance) {
              if (!closest || Math.abs(delta) < Math.abs(closest.delta)) {
                closest = { delta, guide: candidate };
              }
            }
          });
          return closest;
        };

        const snapMinX = resizeSelection.handle.includes('w') ? checkSnap(nextMinX, candidatesX) : null;
        const snapMaxX = resizeSelection.handle.includes('e') ? checkSnap(nextMaxX, candidatesX) : null;
        const snapMinY = resizeSelection.handle.includes('n') ? checkSnap(nextMinY, candidatesY) : null;
        const snapMaxY = resizeSelection.handle.includes('s') ? checkSnap(nextMaxY, candidatesY) : null;

        if (snapMinX) {
          nextMinX += snapMinX.delta;
          guideX = [snapMinX.guide];
        } else if (snapMaxX) {
          nextMaxX += snapMaxX.delta;
          guideX = [snapMaxX.guide];
        }

        if (snapMinY) {
          nextMinY += snapMinY.delta;
          guideY = [snapMinY.guide];
        } else if (snapMaxY) {
          nextMaxY += snapMaxY.delta;
          guideY = [snapMaxY.guide];
        }
      }

      const nextWidth = Math.max(minSize, nextMaxX - nextMinX);
      const nextHeight = Math.max(minSize, nextMaxY - nextMinY);
      const scaleX = resizeSelection.bounds.width > 0 ? nextWidth / resizeSelection.bounds.width : 1;
      const scaleY = resizeSelection.bounds.height > 0 ? nextHeight / resizeSelection.bounds.height : 1;

      setActiveGuides({ x: guideX, y: guideY });

      setHistory((current) => ({
        ...current,
        present: {
          ...current.present,
          nodes: current.present.nodes.map((node) => {
            const origin = resizeSelection.nodes.find((item) => item.id === node.id);
            if (!origin) return node;
            const relativeX = origin.x - resizeSelection.bounds.minX;
            const relativeY = origin.y - resizeSelection.bounds.minY;
            return {
              ...node,
              x: nextMinX + relativeX * scaleX,
              y: nextMinY + relativeY * scaleY,
              width: Math.max(minSize, origin.width * scaleX),
              height: Math.max(minSize, origin.height * scaleY),
            };
          }),
        },
      }));
      return;
    }

    if (dragging) {
      const deltaX = mouseX - dragging.startX;
      const deltaY = mouseY - dragging.startY;
      const targets = state.nodes.filter((node) => !dragging.ids.includes(node.id));

      const movingBounds = dragging.ids.reduce(
        (acc, id) => {
          const origin = dragging.origins[id];
          const node = state.nodes.find((entry) => entry.id === id);
          if (!origin || !node) return acc;
          const minX = origin.x + deltaX;
          const minY = origin.y + deltaY;
          const maxX = minX + node.width;
          const maxY = minY + node.height;
          return {
            minX: Math.min(acc.minX, minX),
            minY: Math.min(acc.minY, minY),
            maxX: Math.max(acc.maxX, maxX),
            maxY: Math.max(acc.maxY, maxY),
          };
        },
        { minX: Number.POSITIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, maxY: Number.NEGATIVE_INFINITY }
      );

      const movingCenterX = (movingBounds.minX + movingBounds.maxX) / 2;
      const movingCenterY = (movingBounds.minY + movingBounds.maxY) / 2;

      const snapTolerance = 6;
      let snapDeltaX = 0;
      let snapDeltaY = 0;
      let guideX: number[] = [];
      let guideY: number[] = [];

      const candidateXs = new Set<number>([0, state.canvas.width / 2, state.canvas.width]);
      const candidateYs = new Set<number>([0, state.canvas.height / 2, state.canvas.height]);

      targets.forEach((node) => {
        const globalBounds = getGlobalNodeBounds(node, state.nodes);
        candidateXs.add(globalBounds.x);
        candidateXs.add(globalBounds.x + globalBounds.width / 2);
        candidateXs.add(globalBounds.x + globalBounds.width);
        candidateYs.add(globalBounds.y);
        candidateYs.add(globalBounds.y + globalBounds.height / 2);
        candidateYs.add(globalBounds.y + globalBounds.height);
      });

      const checkSnap = (value: number, candidates: Set<number>): { delta: number; guide: number } | null => {
        let closest: { delta: number; guide: number } | null = null;
        candidates.forEach((candidate) => {
          const delta = candidate - value;
          if (Math.abs(delta) <= snapTolerance) {
            if (!closest || Math.abs(delta) < Math.abs(closest.delta)) {
              closest = { delta, guide: candidate };
            }
          }
        });
        return closest;
      };

      const snapLeft = checkSnap(movingBounds.minX, candidateXs);
      const snapCenterX = checkSnap(movingCenterX, candidateXs);
      const snapRight = checkSnap(movingBounds.maxX, candidateXs);
      const snapTop = checkSnap(movingBounds.minY, candidateYs);
      const snapCenterY = checkSnap(movingCenterY, candidateYs);
      const snapBottom = checkSnap(movingBounds.maxY, candidateYs);

      if (snapGuidesEnabled) {
        const pickX = snapLeft ?? snapCenterX ?? snapRight;
        if (pickX) {
          snapDeltaX = pickX.delta;
          guideX = [pickX.guide];
        }

        const pickY = snapTop ?? snapCenterY ?? snapBottom;
        if (pickY) {
          snapDeltaY = pickY.delta;
          guideY = [pickY.guide];
        }
      }

      setActiveGuides({ x: guideX, y: guideY });

      const finalDeltaX = deltaX + snapDeltaX;
      const finalDeltaY = deltaY + snapDeltaY;

      setHistory((current) => ({
        ...current,
        present: {
          ...current.present,
          nodes: current.present.nodes.map((node) => {
            const origin = dragging.origins[node.id];
            if (!origin) return node;
            return {
              ...node,
              x: origin.x + finalDeltaX,
              y: origin.y + finalDeltaY,
            };
          }),
        },
      }));
      return;
    }

    if (marqueeSelection) {
      setMarqueeSelection((current) => (current ? { ...current, currentX: mouseX, currentY: mouseY } : current));
    }
  };

  const stopDraggingNode = () => {
    if (panning) {
      setPanning(null);
      return;
    }
    if (resizeSelection) {
      setHistory((current) => commit(current, current.present));
      setResizeSelection(null);
      return;
    }

    if (dragging) {
      setHistory((current) => commit(current, current.present));
      setDragging(null);
      setActiveGuides({ x: [], y: [] });
      return;
    }

    if (marqueeSelection) {
      const minX = Math.min(marqueeSelection.startX, marqueeSelection.currentX);
      const maxX = Math.max(marqueeSelection.startX, marqueeSelection.currentX);
      const minY = Math.min(marqueeSelection.startY, marqueeSelection.currentY);
      const maxY = Math.max(marqueeSelection.startY, marqueeSelection.currentY);

      const hitIds = state.nodes
        .filter((node) => {
          const nodeMinX = node.x;
          const nodeMaxX = node.x + node.width;
          const nodeMinY = node.y;
          const nodeMaxY = node.y + node.height;
          return !(nodeMaxX < minX || nodeMinX > maxX || nodeMaxY < minY || nodeMinY > maxY);
        })
        .map((node) => node.id);

      const nextSelectedIds = marqueeSelection.append
        ? Array.from(new Set([...selectedIds, ...hitIds]))
        : hitIds;

      setSelectedIds(nextSelectedIds);
      runAction({ type: 'select-node', id: nextSelectedIds[nextSelectedIds.length - 1] ?? null }, false);
      setMarqueeSelection(null);
      setActiveGuides({ x: [], y: [] });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        Boolean(target?.isContentEditable);

      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (!isTypingTarget && event.code === 'Space') {
        event.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          setHistory((current) => redo(current));
          return;
        }
        setHistory((current) => undo(current));
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        setHistory((current) => redo(current));
        return;
      }

      if (isModifierPressed && event.shiftKey && event.key === ']') {
        event.preventDefault();
        const targetIds = selectedIds.length > 0 ? selectedIds : selectedNode ? [selectedNode.id] : [];
        if (targetIds.length > 0) {
          runBatchActions(targetIds.map((id) => ({ type: 'bring-forward' as const, id })));
        }
        return;
      }

      if (isModifierPressed && event.shiftKey && event.key === '[') {
        event.preventDefault();
        const targetIds = selectedIds.length > 0 ? selectedIds : selectedNode ? [selectedNode.id] : [];
        if (targetIds.length > 0) {
          runBatchActions(targetIds.map((id) => ({ type: 'send-backward' as const, id })));
        }
        return;
      }

      if (isTypingTarget) {
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        selectAllNodes();
        return;
      }

      if (isModifierPressed && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        stepZoom(0.1);
        return;
      }

      if (isModifierPressed && event.key === '-') {
        event.preventDefault();
        stepZoom(-0.1);
        return;
      }

      if (isModifierPressed && event.key === '0') {
        event.preventDefault();
        resetZoom();
        return;
      }

      if (isModifierPressed && event.key === '1') {
        event.preventDefault();
        zoomToFit();
        return;
      }

      if (isModifierPressed && event.key === ';') {
        event.preventDefault();
        setSnapGuidesEnabled((current) => !current);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clearSelection();
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        if (event.shiftKey) {
          ungroupSelectedNodes();
        } else {
          groupSelectedNodes();
        }
        return;
      }

      if (!selectedNode) {
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        runAction({ type: 'duplicate-node', id: selectedNode.id });
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        const targetIds = selectedIds.length > 0 ? selectedIds : [selectedNode.id];
        runBatchActions(targetIds.map((id) => ({ type: 'remove-node' as const, id })));
        setSelectedIds([]);
        return;
      }

      const isArrowKey =
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown';

      if (isArrowKey && event.altKey) {
        event.preventDefault();
        const resizeStep = event.shiftKey ? 20 : 2;
        if (event.key === 'ArrowLeft') {
          runAction({
            type: 'update-node',
            id: selectedNode.id,
            patch: { width: Math.max(20, selectedNode.width - resizeStep) },
          });
        } else if (event.key === 'ArrowRight') {
          runAction({
            type: 'update-node',
            id: selectedNode.id,
            patch: { width: selectedNode.width + resizeStep },
          });
        } else if (event.key === 'ArrowUp') {
          runAction({
            type: 'update-node',
            id: selectedNode.id,
            patch: { height: Math.max(20, selectedNode.height - resizeStep) },
          });
        } else if (event.key === 'ArrowDown') {
          runAction({
            type: 'update-node',
            id: selectedNode.id,
            patch: { height: selectedNode.height + resizeStep },
          });
        }
        return;
      }

      const nudgeStep = event.shiftKey ? 10 : 1;
      const moveSelection = (deltaX: number, deltaY: number) => {
        const idsToMove = selectedIds.length > 0 ? selectedIds : selectedNode ? [selectedNode.id] : [];
        const actions = idsToMove
          .map((id) => {
            const node = state.nodes.find((entry) => entry.id === id);
            if (!node) return null;
            return {
              type: 'update-node' as const,
              id,
              patch: {
                x: node.x + deltaX,
                y: node.y + deltaY,
              },
            };
          })
          .filter((action): action is { type: 'update-node'; id: string; patch: { x: number; y: number } } => Boolean(action));

        if (actions.length > 0) {
          runBatchActions(actions);
        }
      };

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveSelection(-nudgeStep, 0);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveSelection(nudgeStep, 0);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveSelection(0, -nudgeStep);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveSelection(0, nudgeStep);
      }

      if (event.key === '[' || event.key === ']') {
        event.preventDefault();
        const rotateStep = event.shiftKey ? 15 : 1;
        const direction = event.key === '[' ? -1 : 1;
        runAction({
          type: 'update-node',
          id: selectedNode.id,
          patch: { rotation: selectedNode.rotation + direction * rotateStep },
        });
      }
    };

    const handleKeyUp = (event: globalThis.KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [clearSelection, groupSelectedNodes, resetZoom, runAction, runBatchActions, selectAllNodes, selectedIds, selectedNode, state.nodes, stepZoom, ungroupSelectedNodes, zoomToFit]);

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Aurora Editor"
        description="A live implementation foundation for the full superset roadmap: vector, raster, templates, collaboration, handoff, AI, and governance."
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setHistory((current) => undo(current))} disabled={history.past.length === 0}>
              Undo
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setHistory((current) => redo(current))} disabled={history.future.length === 0}>
              Redo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              tooltip="Zoom out"
              shortcut="Ctrl/Cmd+-"
              onClick={() => runAction({ type: 'set-zoom', zoom: state.zoom - 0.1 }, false)}
            >
              Zoom -
            </Button>
            <Button
              variant="secondary"
              size="sm"
              tooltip="Zoom in"
              shortcut="Ctrl/Cmd++"
              onClick={() => runAction({ type: 'set-zoom', zoom: state.zoom + 0.1 }, false)}
            >
              Zoom +
            </Button>
            <Button
              variant="secondary"
              size="sm"
              tooltip="Reset zoom to 100%"
              shortcut="Ctrl/Cmd+0"
              onClick={resetZoom}
            >
              Zoom 100%
            </Button>
            <Button
              variant="secondary"
              size="sm"
              tooltip="Fit canvas in view"
              shortcut="Ctrl/Cmd+1"
              onClick={zoomToFit}
            >
              Zoom Fit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => runAction({ type: 'toggle-grid' }, false)}>
              {state.showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => runAction({ type: 'toggle-snap' }, false)}>
              Snap {state.snapToGrid ? 'On' : 'Off'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSnapGuidesEnabled((current) => !current)}>
              Guides: {snapGuidesEnabled ? 'On' : 'Off'}
            </Button>
            <Button variant="secondary" size="sm" onClick={exportSceneAsJson}>
              Export JSON
            </Button>
            <Button variant="secondary" size="sm" onClick={() => sceneImportRef.current?.click()}>
              Import Scene
            </Button>
            <Button variant="secondary" size="sm" onClick={exportSelectedAsSvg} disabled={!selectedNode}>
              Export SVG
            </Button>
            <Button variant="secondary" size="sm" onClick={() => packageImportRef.current?.click()}>
              Import Package
            </Button>
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs">
              Import Mode
              <select
                value={importMode}
                onChange={(event) => setImportMode(event.target.value as 'replace' | 'append')}
                className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
              >
                <option value="replace">Replace</option>
                <option value="append">Append</option>
              </select>
            </label>
            <Button variant="secondary" size="sm" onClick={restoreLocalDraft}>
              Restore Draft
            </Button>
            <Button variant="ghost" size="sm" onClick={clearLocalDraft}>
              Clear Draft
            </Button>
            <Button variant="secondary" size="sm" onClick={() => previewImportRef.current?.click()} disabled={!selectedNode}>
              Attach Preview
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelectedPreview} disabled={!selectedNode || !nodePreviews[selectedNode.id]}>
              Clear Preview
            </Button>
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs">
              Preset
              <select
                value={exportPreset}
                onChange={(event) => setExportPreset(event.target.value as ExportPreset)}
                className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
              >
                <option value="product">Product</option>
                <option value="marketing">Marketing</option>
                <option value="engineering">Engineering</option>
              </select>
            </label>
            <Button variant="secondary" size="sm" onClick={() => void exportAssetSet()} disabled={state.nodes.length === 0}>
              Export Set
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void exportPackageBundle()} disabled={state.nodes.length === 0}>
              Export Package
            </Button>
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs">
              Grid
              <input
                type="number"
                min={4}
                max={64}
                value={state.gridSize}
                onChange={(event) => runAction({ type: 'set-grid-size', gridSize: Number(event.target.value) }, false)}
                className="w-14 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
              />
            </label>
            <Button variant="ghost" size="sm" onClick={() => router.push('/create')}>Back to Create</Button>
            {importNotice ? <Badge size="sm" variant="info">{importNotice}</Badge> : null}
            {packageIssues.length > 0 ? <Badge size="sm" variant="warning">Package warnings: {packageIssues.length}</Badge> : null}
          </div>
        )}
      />

      {packageIssues.length > 0 && (
        <Card className="mb-4 p-4">
          <CardTitle className="text-base">Package Integrity Warnings</CardTitle>
          <CardDescription>Import proceeded with non-blocking manifest issues.</CardDescription>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            {packageIssues.slice(0, 6).map((issue, index) => (
              <li key={`${issue}-${index}`}>{issue}</li>
            ))}
          </ul>
        </Card>
      )}

      <SurfaceSection title="Superset Delivery Tracker" description="Feature parity matrix spanning Figma, Canva, Photopea, Photoshop, Adobe Express, and Pixlr capabilities.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <CardDescription>Total Features</CardDescription>
            <CardTitle className="text-2xl">{matrixSummary.total}</CardTitle>
          </Card>
          <Card className="p-4">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">{matrixSummary.completed}</CardTitle>
          </Card>
          <Card className="p-4">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-2xl">{matrixSummary.inProgress}</CardTitle>
          </Card>
          <Card className="p-4">
            <CardDescription>Not Started</CardDescription>
            <CardTitle className="text-2xl">{matrixSummary.notStarted}</CardTitle>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {matrixSummary.byCategory.map((group) => (
            <Card key={group.category} className="p-4">
              <CardDescription>{group.label}</CardDescription>
              <CardTitle>{group.count} scoped items</CardTitle>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Editor Workbench" description="Working foundation: layer model, history engine, node creation, selection, and inspector editing.">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <Card className="xl:col-span-2 p-4 space-y-4">
            <div>
              <CardTitle className="text-base">Tools</CardTitle>
              <CardDescription>Add nodes to the canvas</CardDescription>
            </div>
            <div className="grid gap-2">
              {(['frame', 'rect', 'ellipse', 'text', 'image'] as const).map((kind) => (
                <Button
                  key={kind}
                  variant="secondary"
                  size="sm"
                  onClick={() => runAction({ type: 'add-node', node: makeNode(kind) })}
                >
                  Add {nodeKindLabel[kind]}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedNode}
                onClick={() => selectedNode && runAction({ type: 'duplicate-node', id: selectedNode.id })}
              >
                Duplicate
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedNode}
                onClick={() => selectedNode && runAction({ type: 'convert-component', id: selectedNode.id })}
              >
                Make Component
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedNode?.componentId}
                onClick={() => selectedNode && runAction({ type: 'create-instance', id: selectedNode.id })}
              >
                Add Instance
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={selectedNode?.kind !== 'frame'}
                onClick={() => selectedNode && runAction({ type: 'apply-auto-layout', id: selectedNode.id })}
              >
                Apply Auto Layout
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!selectedNode?.parentId}
                onClick={() => selectedNode && runAction({ type: 'apply-constraints', id: selectedNode.id })}
              >
                Apply Constraints
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={state.nodes.length === 0}
                onClick={selectAllNodes}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedIds.length === 0}
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={selectedIds.length < 2}
                onClick={groupSelectedNodes}
              >
                Group Selection
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!canUngroupSelection}
                onClick={ungroupSelectedNodes}
              >
                Ungroup
              </Button>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-base">Align</CardTitle>
              <div className="grid grid-cols-3 gap-1">
                <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => alignSelection('x', 'start')}>L</Button>
                <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => alignSelection('x', 'center')}>C</Button>
                <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => alignSelection('x', 'end')}>R</Button>
                <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => alignSelection('y', 'start')}>T</Button>
                <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => alignSelection('y', 'center')}>M</Button>
                <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => alignSelection('y', 'end')}>B</Button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={selectedIds.length < 3}
                  onClick={() => distributeSelection('x')}
                >
                  Distribute H
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={selectedIds.length < 3}
                  onClick={() => distributeSelection('y')}
                >
                  Distribute V
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Layers</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    onClick={() =>
                      selectedIds.length > 0 && runBatchActions(selectedIds.map((id) => ({ type: 'send-backward' as const, id })))
                    }
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    onClick={() =>
                      selectedIds.length > 0 && runBatchActions(selectedIds.map((id) => ({ type: 'bring-forward' as const, id })))
                    }
                  >
                    ↑
                  </Button>
                </div>
              </div>
              <div className="space-y-2" role="list" aria-label="Canvas layers">
                {state.nodes.slice().reverse().map((node) => {
                  const selected = selectedIds.includes(node.id);
                  const preview = nodePreviews[node.id];
                  return (
                    <button
                      key={node.id}
                      type="button"
                      role="listitem"
                      onClick={(event) => handleNodeSelection(node.id, event.shiftKey)}
                      className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                        selected
                          ? 'border-blue-500 bg-blue-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 shrink-0 overflow-hidden rounded border border-slate-300/70 dark:border-slate-700/70 bg-slate-100 dark:bg-slate-900">
                          {preview ? (
                            <img src={preview} alt={`${node.name} preview`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-500">{node.kind}</div>
                          )}
                        </div>
                        <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{node.name}</p>
                      </div>
                      <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                        {nodeKindLabel[node.kind]}
                        {node.isComponentMaster ? ' • Component' : ''}
                        {node.instanceOf ? ' • Instance' : ''}
                        {node.parentId ? ' • Child' : ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-7 p-4">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-base">Canvas</CardTitle>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Badge size="sm" variant="default">Arrows Move</Badge>
                <Badge size="sm" variant="default">Shift+Click Multi-select</Badge>
                <Badge size="sm" variant="default">Drag Empty Area Select</Badge>
                <Badge size="sm" variant="default">Guides {snapGuidesEnabled ? 'On' : 'Off'}</Badge>
                <Badge size="sm" variant="default">Ctrl/Cmd+; Guides</Badge>
                <Badge size="sm" variant="default">Shift+Arrows x10</Badge>
                <Badge size="sm" variant="default">Alt+Arrows Resize</Badge>
                <Badge size="sm" variant="default">Shift Lock Ratio</Badge>
                <Badge size="sm" variant="default">Alt Center Resize</Badge>
                <Badge size="sm" variant="default">[ ] Rotate</Badge>
                <Badge size="sm" variant="default">Ctrl/Cmd+D Duplicate</Badge>
                <Badge size="sm" variant="default">Ctrl/Cmd+A Select All</Badge>
                <Badge size="sm" variant="default">Esc Clear</Badge>
                <Badge size="sm" variant="default">Ctrl/Cmd+Shift+[ ] Reorder</Badge>
                <Badge size="sm" variant="default">Space Drag Pan</Badge>
                <Badge size="sm" variant="default">Ctrl/Cmd+Wheel Zoom</Badge>
                <Badge size="sm" variant="default" title="Zoom reset">Ctrl/Cmd+0 Reset</Badge>
                <Badge size="sm" variant="default" title="Zoom to fit">Ctrl/Cmd+1 Fit</Badge>
                <Badge size="sm" variant="default">Ctrl/Cmd+G Group</Badge>
                <Badge size="sm" variant="default">Zoom {Math.round(state.zoom * 100)}%</Badge>
                <Badge size="sm" variant="info">Grid {state.gridSize}px</Badge>
                <Badge size="sm" variant={state.snapToGrid ? 'success' : 'warning'}>Snap {state.snapToGrid ? 'On' : 'Off'}</Badge>
              </div>
            </div>
            <div className="relative">
              <div
                ref={canvasViewportRef}
                className={`overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-6 ${
                  panning ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : 'cursor-default'
                }`}
                onMouseDown={(event) => {
                  if (isSpacePressed) {
                    startPanning(event);
                  }
                }}
                onMouseMove={dragNode}
                onMouseUp={stopDraggingNode}
                onMouseLeave={stopDraggingNode}
                onWheel={handleViewportWheel}
                onScroll={updateViewportMetrics}
              >
                <div
                  className="relative origin-top-left rounded-lg shadow-inner"
                  onMouseDown={(event) => {
                    if (event.button !== 0) return;
                    if (isSpacePressed) {
                      startPanning(event);
                      return;
                    }
                    const { x, y } = getCanvasCoordinatesFromClient(event.clientX, event.clientY);
                    setMarqueeSelection({
                      startX: x,
                      startY: y,
                      currentX: x,
                      currentY: y,
                      append: event.shiftKey,
                    });
                    if (!event.shiftKey) {
                      setSelectedIds([]);
                      runAction({ type: 'select-node', id: null }, false);
                    }
                  }}
                  style={{
                    width: state.canvas.width,
                    height: state.canvas.height,
                    background: state.canvas.background,
                    transform: `scale(${state.zoom})`,
                  }}
                  aria-label="Editor canvas"
                >
                {state.showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(148, 163, 184, 0.24) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.24) 1px, transparent 1px)`,
                      backgroundSize: `${state.gridSize}px ${state.gridSize}px`,
                    }}
                  />
                )}
                {state.nodes.map((node) => {
                  const isSelected = selectedIds.includes(node.id);
                  const preview = nodePreviews[node.id];
                  const globalBounds = getGlobalNodeBounds(node, state.nodes);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onMouseDown={(event) => startDraggingNode(event, node)}
                      onClick={(event) => handleNodeSelection(node.id, event.shiftKey)}
                      className={`absolute flex items-center justify-center overflow-hidden text-center border ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-400/50' : 'border-slate-400/40'
                      } ${node.kind === 'ellipse' ? 'rounded-full' : 'rounded-md'}`}
                      style={{
                        left: globalBounds.x,
                        top: globalBounds.y,
                        width: globalBounds.width,
                        height: globalBounds.height,
                        background: node.kind === 'text' ? 'transparent' : preview ? `url(${preview}) center / cover no-repeat` : node.fill,
                        color: node.fill,
                        transform: `rotate(${node.rotation}deg)`,
                        opacity: node.opacity,
                      }}
                      aria-label={`Select ${node.name}`}
                    >
                      {node.kind === 'text' ? (
                        <span
                          className="aurora-label font-semibold"
                          style={{ fontSize: node.fontSize ?? 18, color: node.fill }}
                        >
                          {node.text || 'Text'}
                        </span>
                      ) : node.kind === 'image' ? (
                        <span className="aurora-label text-xs text-slate-700">Image</span>
                      ) : node.isComponentMaster ? (
                        <span className="aurora-label text-[10px] text-slate-700">Component</span>
                      ) : node.instanceOf ? (
                        <span className="aurora-label text-[10px] text-slate-700">Instance</span>
                      ) : null}
                    </button>
                  );
                })}
                {activeGuides.x.map((x) => (
                  <div
                    key={`guide-x-${x}`}
                    className="pointer-events-none absolute top-0 h-full border-l border-blue-500/70"
                    style={{ left: x }}
                    aria-hidden="true"
                  />
                ))}
                {activeGuides.y.map((y) => (
                  <div
                    key={`guide-y-${y}`}
                    className="pointer-events-none absolute left-0 w-full border-t border-blue-500/70"
                    style={{ top: y }}
                    aria-hidden="true"
                  />
                ))}
                {selectionBounds && selectedIds.length > 1 && (
                  <div
                    className="pointer-events-none absolute border border-blue-600/70 bg-blue-500/5"
                    style={{
                      left: selectionBounds.minX,
                      top: selectionBounds.minY,
                      width: selectionBounds.width,
                      height: selectionBounds.height,
                    }}
                    aria-hidden="true"
                  />
                )}
                {(dragging || resizeSelection) && selectionBounds && (
                  <div
                    className="pointer-events-none absolute -translate-y-full rounded border border-blue-600/60 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-800 shadow"
                    style={{
                      left: selectionBounds.minX,
                      top: selectionBounds.minY - 6,
                    }}
                    aria-hidden="true"
                  >
                    {resizeSelection
                      ? `${Math.round(selectionBounds.width)} × ${Math.round(selectionBounds.height)}`
                      : `X: ${Math.round(selectionBounds.minX)} Y: ${Math.round(selectionBounds.minY)}`}
                  </div>
                )}
                {selectionBounds && selectedIds.length > 1 && (
                  <>
                    <div
                      className="pointer-events-none absolute border-l border-blue-600/60"
                      style={{
                        left: selectionBounds.minX + selectionBounds.width / 2,
                        top: selectionBounds.minY,
                        height: selectionBounds.height,
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute border-t border-blue-600/60"
                      style={{
                        left: selectionBounds.minX,
                        top: selectionBounds.minY + selectionBounds.height / 2,
                        width: selectionBounds.width,
                      }}
                      aria-hidden="true"
                    />
                    {([
                      { id: 'nw', x: selectionBounds.minX, y: selectionBounds.minY },
                      { id: 'n', x: selectionBounds.minX + selectionBounds.width / 2, y: selectionBounds.minY },
                      { id: 'ne', x: selectionBounds.maxX, y: selectionBounds.minY },
                      { id: 'w', x: selectionBounds.minX, y: selectionBounds.minY + selectionBounds.height / 2 },
                      { id: 'e', x: selectionBounds.maxX, y: selectionBounds.minY + selectionBounds.height / 2 },
                      { id: 'sw', x: selectionBounds.minX, y: selectionBounds.maxY },
                      { id: 's', x: selectionBounds.minX + selectionBounds.width / 2, y: selectionBounds.maxY },
                      { id: 'se', x: selectionBounds.maxX, y: selectionBounds.maxY },
                    ] as const).map((handle) => (
                      <button
                        key={`selection-handle-${handle.id}`}
                        type="button"
                        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-blue-700 bg-white"
                        style={{ left: handle.x, top: handle.y, cursor: getHandleCursor(handle.id) }}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!selectionBounds) return;
                          const { x, y } = getCanvasCoordinatesFromClient(event.clientX, event.clientY);
                          const nodes = selectedNodes.map((node) => ({
                            id: node.id,
                            x: node.x,
                            y: node.y,
                            width: node.width,
                            height: node.height,
                          }));
                          setResizeSelection({
                            handle: handle.id,
                            startX: x,
                            startY: y,
                            bounds: selectionBounds,
                            ratio: selectionBounds.width > 0 && selectionBounds.height > 0
                              ? selectionBounds.width / selectionBounds.height
                              : 1,
                            nodes,
                          });
                        }}
                        aria-label={`Resize selection ${handle.id}`}
                      />
                    ))}
                  </>
                )}
                {marqueeSelection && (
                  <div
                    className="pointer-events-none absolute border border-blue-500 bg-blue-400/20"
                    style={{
                      left: Math.min(marqueeSelection.startX, marqueeSelection.currentX),
                      top: Math.min(marqueeSelection.startY, marqueeSelection.currentY),
                      width: Math.abs(marqueeSelection.currentX - marqueeSelection.startX),
                      height: Math.abs(marqueeSelection.currentY - marqueeSelection.startY),
                    }}
                    aria-hidden="true"
                  />
                )}
                </div>
              </div>
              <div
                className="absolute bottom-4 right-4 rounded-lg border border-slate-200/80 bg-white/90 p-2 shadow-lg backdrop-blur"
                style={{ width: minimap.width + 16 }}
              >
                <div
                  ref={minimapRef}
                  className={`relative overflow-hidden rounded border bg-slate-100 transition-shadow duration-200 ${
                    isMinimapDragging
                      ? 'cursor-grabbing border-blue-300/70 shadow-[0_0_0_2px_rgba(37,99,235,0.25)]'
                      : 'cursor-grab border-slate-300/70 shadow-sm'
                  }`}
                  style={{ width: minimap.width, height: minimap.height }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setViewportFromMinimap(event.clientX, event.clientY);
                    setIsMinimapDragging(true);
                  }}
                  aria-label="Minimap"
                >
                  {state.nodes.map((node) => (
                    <div
                      key={`minimap-${node.id}`}
                      className="absolute rounded-sm"
                      style={{
                        left: node.x * minimap.scale,
                        top: node.y * minimap.scale,
                        width: Math.max(2, node.width * minimap.scale),
                        height: Math.max(2, node.height * minimap.scale),
                        background: node.fill,
                        opacity: node.visible ? 0.7 : 0.2,
                        border: selectedIds.includes(node.id) ? '1px solid #2563eb' : '1px solid rgba(148,163,184,0.6)',
                      }}
                    />
                  ))}
                  <div
                    className="absolute rounded border border-blue-600/80 bg-blue-500/10"
                    style={{
                      left: viewportBox.left,
                      top: viewportBox.top,
                      width: Math.max(2, viewportBox.width),
                      height: Math.max(2, viewportBox.height),
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-600">
                  <span>Minimap</span>
                  <span>{Math.round(state.zoom * 100)}%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-3 p-4 space-y-4">
            <div>
              <CardTitle className="text-base">Inspector</CardTitle>
              <CardDescription>
                {selectedNode
                  ? `Editing ${selectedNode.name}${selectedNode.kind === 'frame' ? ` • ${childCount} children` : ''}`
                  : 'Select a node to edit properties.'}
              </CardDescription>
            </div>

            {selectionBounds && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs">Selection</CardTitle>
                  <Badge size="sm" variant="info">{selectionBounds.count} items</Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div>Min X: {Math.round(selectionBounds.minX)}</div>
                  <div>Min Y: {Math.round(selectionBounds.minY)}</div>
                  <div>Max X: {Math.round(selectionBounds.maxX)}</div>
                  <div>Max Y: {Math.round(selectionBounds.maxY)}</div>
                  <div>Width: {Math.round(selectionBounds.width)}</div>
                  <div>Height: {Math.round(selectionBounds.height)}</div>
                </div>
              </div>
            )}

            {selectedNode ? (
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Name</span>
                  <input
                    value={selectedNode.name}
                    onChange={(event) => updateSelectedNode({ name: event.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block space-y-1">
                    <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">X</span>
                    <input
                      type="number"
                      value={selectedNode.x}
                      onChange={(event) => updateSelectedNode({ x: Number(event.target.value) })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Y</span>
                    <input
                      type="number"
                      value={selectedNode.y}
                      onChange={(event) => updateSelectedNode({ y: Number(event.target.value) })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Width</span>
                    <input
                      type="number"
                      value={selectedNode.width}
                      onChange={(event) => updateSelectedNode({ width: Math.max(20, Number(event.target.value)) })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Height</span>
                    <input
                      type="number"
                      value={selectedNode.height}
                      onChange={(event) => updateSelectedNode({ height: Math.max(20, Number(event.target.value)) })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Parent Frame</span>
                  <select
                    value={selectedNode.parentId ?? ''}
                    onChange={(event) =>
                      runAction({
                        type: 'set-parent',
                        id: selectedNode.id,
                        parentId: event.target.value || null,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  >
                    <option value="">No Parent</option>
                    {frameNodes
                      .filter((node) => !disallowedParentIds.has(node.id))
                      .map((frame) => (
                        <option key={frame.id} value={frame.id}>
                          {frame.name}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Color</span>
                  <input
                    type="color"
                    value={selectedNode.fill}
                    onChange={(event) => updateSelectedNode({ fill: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Rotation</span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selectedNode.rotation}
                    onChange={(event) => updateSelectedNode({ rotation: Number(event.target.value) })}
                    className="w-full"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Opacity</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={selectedNode.opacity}
                    onChange={(event) => updateSelectedNode({ opacity: Number(event.target.value) })}
                    className="w-full"
                  />
                </label>

                {selectedNode.kind === 'frame' && (
                  <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <p className="aurora-label text-xs font-semibold text-slate-700 dark:text-slate-300">Auto Layout</p>
                    <label className="block space-y-1">
                      <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Layout Mode</span>
                      <select
                        value={selectedNode.layoutMode ?? 'none'}
                        onChange={(event) =>
                          runAction({
                            type: 'set-layout',
                            id: selectedNode.id,
                            patch: {
                              layoutMode: event.target.value as LayoutMode,
                              layoutGap: selectedNode.layoutGap ?? 12,
                              layoutPadding: selectedNode.layoutPadding ?? 16,
                              layoutAlign: selectedNode.layoutAlign ?? 'start',
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      >
                        {layoutModeOptions.map((mode) => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-1">
                      <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Align</span>
                      <select
                        value={selectedNode.layoutAlign ?? 'start'}
                        onChange={(event) =>
                          runAction({
                            type: 'set-layout',
                            id: selectedNode.id,
                            patch: {
                              layoutMode: selectedNode.layoutMode ?? 'none',
                              layoutGap: selectedNode.layoutGap ?? 12,
                              layoutPadding: selectedNode.layoutPadding ?? 16,
                              layoutAlign: event.target.value as LayoutAlign,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      >
                        {layoutAlignOptions.map((align) => (
                          <option key={align} value={align}>{align}</option>
                        ))}
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block space-y-1">
                        <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Gap</span>
                        <input
                          type="number"
                          value={selectedNode.layoutGap ?? 12}
                          onChange={(event) =>
                            runAction({
                              type: 'set-layout',
                              id: selectedNode.id,
                              patch: {
                                layoutMode: selectedNode.layoutMode ?? 'none',
                                layoutGap: Number(event.target.value),
                                layoutPadding: selectedNode.layoutPadding ?? 16,
                                layoutAlign: selectedNode.layoutAlign ?? 'start',
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Padding</span>
                        <input
                          type="number"
                          value={selectedNode.layoutPadding ?? 16}
                          onChange={(event) =>
                            runAction({
                              type: 'set-layout',
                              id: selectedNode.id,
                              patch: {
                                layoutMode: selectedNode.layoutMode ?? 'none',
                                layoutGap: selectedNode.layoutGap ?? 12,
                                layoutPadding: Number(event.target.value),
                                layoutAlign: selectedNode.layoutAlign ?? 'start',
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {selectedNode.parentId && (
                  <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <p className="aurora-label text-xs font-semibold text-slate-700 dark:text-slate-300">Constraints</p>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block space-y-1">
                        <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Horizontal</span>
                        <select
                          value={selectedNode.constraintX ?? 'start'}
                          onChange={(event) =>
                            runAction({
                              type: 'set-constraints',
                              id: selectedNode.id,
                              constraintX: event.target.value as ConstraintMode,
                              constraintY: selectedNode.constraintY ?? 'start',
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                        >
                          {constraintOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1">
                        <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Vertical</span>
                        <select
                          value={selectedNode.constraintY ?? 'start'}
                          onChange={(event) =>
                            runAction({
                              type: 'set-constraints',
                              id: selectedNode.id,
                              constraintX: selectedNode.constraintX ?? 'start',
                              constraintY: event.target.value as ConstraintMode,
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                        >
                          {constraintOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => runAction({ type: 'apply-constraints', id: selectedNode.id })}
                    >
                      Apply Constraint Positioning
                    </Button>
                  </div>
                )}

                {selectedNode.kind === 'text' && (
                  <>
                    <label className="block space-y-1">
                      <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Text</span>
                      <textarea
                        value={selectedNode.text ?? ''}
                        onChange={(event) => updateSelectedNode({ text: event.target.value })}
                        className="min-h-24 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">Font Size</span>
                      <input
                        type="number"
                        value={selectedNode.fontSize ?? 20}
                        onChange={(event) => updateSelectedNode({ fontSize: Math.max(8, Number(event.target.value)) })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      />
                    </label>
                  </>
                )}

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mb-2"
                    onClick={() => runAction({ type: 'duplicate-node', id: selectedNode.id })}
                  >
                    Duplicate Layer
                  </Button>
                  <Button variant="danger" size="sm" className="w-full" onClick={() => runAction({ type: 'remove-node', id: selectedNode.id })}>
                    Delete Layer
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="p-4">
                <CardDescription>Select a layer from the canvas or layers panel to edit.</CardDescription>
              </Card>
            )}
          </Card>
        </div>
      </SurfaceSection>

      <SurfaceSection title="Phase Scope" description="Roadmap sequencing for complete superset delivery.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(matrixSummary.byPhase).map(([phase, count]) => (
            <Card key={phase} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardDescription className="capitalize">{phase.replace(/-/g, ' ')}</CardDescription>
                  <CardTitle>{count} feature items</CardTitle>
                </div>
                <Badge size="sm" variant={statusVariant(count === 0 ? 'not-started' : 'in-progress')}>
                  {count > 0 ? 'Scoped' : 'Empty'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Priority Backlog" description="First 16 feature rows from the canonical matrix.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {auroraEditorFeatureMatrix.slice(0, 16).map((feature) => (
            <Card key={feature.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{feature.name}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
                <Badge size="sm" variant={statusVariant(feature.auroraStatus)}>
                  {feature.auroraStatus}
                </Badge>
              </div>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                <strong>Category:</strong> {featureCategoryLabels[feature.category]} • <strong>Phase:</strong> {feature.phase.replace(/-/g, ' ')}
              </p>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                <strong>Acceptance:</strong> {feature.acceptance}
              </p>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <input
        ref={sceneImportRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => void onImportSceneChange(event)}
      />
      <input
        ref={packageImportRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => void onImportPackageChange(event)}
      />
      <input
        ref={previewImportRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void onAttachPreviewChange(event)}
      />
    </Surface>
  );
}
