'use client';

import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Surface, SurfaceHeader } from '@/components/aurora/Surface';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';

type LayerKind = 'rect' | 'circle' | 'text' | 'image';
type LayerBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';
type GradientType = 'linear' | 'radial';

type GradientStop = {
  position: number;
  color: string;
};

type Layer = {
  id: string;
  name: string;
  kind: LayerKind;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation: number;
  opacity: number;
  fill: string;
  imageSrc: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  letterSpacing: number;
  gradientEnabled: boolean;
  gradientType: GradientType;
  gradientAngle: number;
  gradientStops: GradientStop[];
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hueRotate: number;
  invert: number;
  sepia: number;
  grayscale: number;
  blendMode: LayerBlendMode;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  innerShadowEnabled: boolean;
  innerShadowColor: string;
  innerShadowBlur: number;
  innerShadowOffsetX: number;
  innerShadowOffsetY: number;
  outerGlowEnabled: boolean;
  outerGlowColor: string;
  outerGlowBlur: number;
  clipToBelow: boolean;
  visible: boolean;
  locked: boolean;
};

type LabProject = {
  version: 1;
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  layers: Layer[];
};

const initialLayers: Layer[] = [
  {
    id: 'layer-circle-1',
    name: 'Primary Circle',
    kind: 'circle',
    x: 280,
    y: 220,
    width: 180,
    height: 180,
    radius: 90,
    rotation: 0,
    opacity: 1,
    fill: '#6366f1',
    imageSrc: '',
    text: '',
    fontSize: 36,
    fontFamily: 'Inter',
    fontWeight: '400',
    letterSpacing: 0,
    gradientEnabled: false,
    gradientType: 'linear',
    gradientAngle: 0,
    gradientStops: [{ position: 0, color: '#6366f1' }, { position: 1, color: '#8b5cf6' }],
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hueRotate: 0,
    invert: 0,
    sepia: 0,
    grayscale: 0,
    blendMode: 'normal',
    strokeEnabled: false,
    strokeColor: '#e2e8f0',
    strokeWidth: 2,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 12,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    innerShadowEnabled: false,
    innerShadowColor: '#000000',
    innerShadowBlur: 10,
    innerShadowOffsetX: 0,
    innerShadowOffsetY: 2,
    outerGlowEnabled: false,
    outerGlowColor: '#ffffff',
    outerGlowBlur: 15,
    clipToBelow: false,
    visible: true,
    locked: false,
  },
  {
    id: 'layer-text-1',
    name: 'Brand Text',
    kind: 'text',
    x: 280,
    y: 220,
    width: 260,
    height: 80,
    radius: 0,
    rotation: 0,
    opacity: 1,
    fill: '#ffffff',
    imageSrc: '',
    text: 'AURORA',
    fontSize: 44,
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: 2,
    gradientEnabled: false,
    gradientType: 'linear',
    gradientAngle: 0,
    gradientStops: [{ position: 0, color: '#ffffff' }, { position: 1, color: '#cbd5e1' }],
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hueRotate: 0,
    invert: 0,
    sepia: 0,
    grayscale: 0,
    blendMode: 'normal',
    strokeEnabled: false,
    strokeColor: '#0f172a',
    strokeWidth: 1,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 8,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    innerShadowEnabled: false,
    innerShadowColor: '#000000',
    innerShadowBlur: 10,
    innerShadowOffsetX: 0,
    innerShadowOffsetY: 2,
    outerGlowEnabled: false,
    outerGlowColor: '#ffffff',
    outerGlowBlur: 15,
    clipToBelow: false,
    visible: true,
    locked: false,
  },
];

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function canvasBlendMode(mode: LayerBlendMode): GlobalCompositeOperation {
  if (mode === 'normal') return 'source-over';
  if (mode === 'color-dodge' || mode === 'color-burn' || mode === 'hard-light' || mode === 'soft-light') {
    return mode;
  }
  return mode;
}

function layerCssFilter(layer: Layer): string {
  const parts = [
    `brightness(${layer.brightness}%)`,
    `contrast(${layer.contrast}%)`,
    `saturate(${layer.saturation}%)`,
  ];

  if (layer.hueRotate !== 0) {
    parts.push(`hue-rotate(${layer.hueRotate}deg)`);
  }

  if (layer.invert > 0) {
    parts.push(`invert(${layer.invert}%)`);
  }

  if (layer.sepia > 0) {
    parts.push(`sepia(${layer.sepia}%)`);
  }

  if (layer.grayscale > 0) {
    parts.push(`grayscale(${layer.grayscale}%)`);
  }

  if (layer.blur > 0) {
    parts.push(`blur(${layer.blur}px)`);
  }

  if (layer.shadowEnabled) {
    parts.push(`drop-shadow(${layer.shadowOffsetX}px ${layer.shadowOffsetY}px ${layer.shadowBlur}px ${layer.shadowColor})`);
  }

  if (layer.outerGlowEnabled) {
    parts.push(`drop-shadow(0px 0px ${layer.outerGlowBlur}px ${layer.outerGlowColor})`);
  }

  return parts.join(' ');
}

function svgLayerStyle(layer: Layer): string {
  const styles: string[] = [];
  if (layer.blendMode !== 'normal') {
    styles.push(`mix-blend-mode:${layer.blendMode}`);
  }
  styles.push(`filter:${layerCssFilter(layer)}`);
  return styles.join(';');
}

function createGradient(context: CanvasRenderingContext2D, layer: Layer): string | CanvasGradient {
  if (!layer.gradientEnabled || layer.gradientStops.length < 2) {
    return layer.fill;
  }

  let gradient: CanvasGradient;

  if (layer.gradientType === 'linear') {
    const angleRad = (layer.gradientAngle * Math.PI) / 180;
    const length = Math.max(layer.width, layer.height);
    const x1 = Math.cos(angleRad) * (-length / 2);
    const y1 = Math.sin(angleRad) * (-length / 2);
    const x2 = Math.cos(angleRad) * (length / 2);
    const y2 = Math.sin(angleRad) * (length / 2);
    gradient = context.createLinearGradient(x1, y1, x2, y2);
  } else {
    const radius = Math.max(layer.width, layer.height) / 2;
    gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
  }

  layer.gradientStops.forEach((stop) => {
    gradient.addColorStop(Math.max(0, Math.min(1, stop.position)), stop.color);
  });

  return gradient;
}

function svgGradientDef(layer: Layer): string {
  if (!layer.gradientEnabled || layer.gradientStops.length < 2) return '';

  const stops = layer.gradientStops
    .map((stop) => `<stop offset="${(stop.position * 100).toFixed(1)}%" stop-color="${stop.color}" />`)
    .join('');

  if (layer.gradientType === 'linear') {
    const angleRad = (layer.gradientAngle * Math.PI) / 180;
    const x1 = 50 + Math.cos(angleRad) * 50;
    const y1 = 50 + Math.sin(angleRad) * 50;
    const x2 = 50 - Math.cos(angleRad) * 50;
    const y2 = 50 - Math.sin(angleRad) * 50;
    return `<linearGradient id="grad-${layer.id}" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%">${stops}</linearGradient>`;
  }

  return `<radialGradient id="grad-${layer.id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`;
}

function layerFillAttr(layer: Layer): string {
  return layer.gradientEnabled && layer.gradientStops.length >= 2 ? `url(#grad-${layer.id})` : layer.fill;
}

function defineLayerPath(context: CanvasRenderingContext2D, layer: Layer) {
  if (layer.kind === 'circle') {
    context.beginPath();
    context.arc(0, 0, layer.radius, 0, Math.PI * 2);
    return;
  }

  context.beginPath();
  context.rect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
}

function svgClipShape(layer: Layer): string {
  const transform = `translate(${layer.x} ${layer.y}) rotate(${layer.rotation})`;
  if (layer.kind === 'circle') {
    return `<circle cx="0" cy="0" r="${layer.radius}" transform="${transform}" />`;
  }
  return `<rect x="${-layer.width / 2}" y="${-layer.height / 2}" width="${layer.width}" height="${layer.height}" transform="${transform}" />`;
}

export function ArcPanelLogoLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const importImageRef = useRef<HTMLInputElement>(null);
  const importProjectRef = useRef<HTMLInputElement>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const dragRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({ active: false, offsetX: 0, offsetY: 0 });

  const [canvasWidth, setCanvasWidth] = useState(560);
  const [canvasHeight, setCanvasHeight] = useState(440);
  const [canvasBackground, setCanvasBackground] = useState('#0f172a');
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedLayerId, setSelectedLayerId] = useState(initialLayers[initialLayers.length - 1].id);
  const [history, setHistory] = useState<Layer[][]>([initialLayers]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [imageRenderTick, setImageRenderTick] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [activeTool, setActiveTool] = useState<'select' | 'rect' | 'circle' | 'text' | 'image'>('select');
  const [expandedSections, setExpandedSections] = useState({
    transform: true,
    appearance: true,
    fill: false,
    stroke: false,
    effects: false,
    filters: false,
    text: false,
  });

  const selectedLayer = useMemo(() => layers.find((layer) => layer.id === selectedLayerId) ?? null, [layers, selectedLayerId]);

  const svgMarkup = useMemo(() => {
    const clipDefs = layers
      .map((layer, index) => {
        if (!layer.visible || !layer.clipToBelow || index === 0) return '';
        const baseLayer = layers[index - 1];
        if (!baseLayer?.visible) return '';
        return `<clipPath id="clip-${layer.id}">${svgClipShape(baseLayer)}</clipPath>`;
      })
      .filter(Boolean)
      .join('');

    const gradientDefs = layers
      .filter((layer) => layer.visible && layer.gradientEnabled)
      .map((layer) => svgGradientDef(layer))
      .filter(Boolean)
      .join('');

    const body = layers
      .filter((layer) => layer.visible)
      .map((layer) => {
        const transform = `translate(${layer.x} ${layer.y}) rotate(${layer.rotation})`;
        const opacity = Math.min(1, Math.max(0, layer.opacity));
        const clipPath = layer.clipToBelow ? ` clip-path="url(#clip-${layer.id})"` : '';
        const fillAttr = layerFillAttr(layer);

        if (layer.kind === 'rect') {
          return `<rect x="${-layer.width / 2}" y="${-layer.height / 2}" width="${layer.width}" height="${layer.height}" fill="${fillAttr}" opacity="${opacity}" stroke="${layer.strokeEnabled ? layer.strokeColor : 'none'}" stroke-width="${layer.strokeEnabled ? layer.strokeWidth : 0}" transform="${transform}" style="${svgLayerStyle(layer)}"${clipPath} />`;
        }

        if (layer.kind === 'circle') {
          return `<circle cx="0" cy="0" r="${layer.radius}" fill="${fillAttr}" opacity="${opacity}" stroke="${layer.strokeEnabled ? layer.strokeColor : 'none'}" stroke-width="${layer.strokeEnabled ? layer.strokeWidth : 0}" transform="${transform}" style="${svgLayerStyle(layer)}"${clipPath} />`;
        }

        if (layer.kind === 'text') {
          const safeText = escapeXml(layer.text || 'TEXT');
          const fontStyle = `font-family:${layer.fontFamily},sans-serif;font-weight:${layer.fontWeight};letter-spacing:${layer.letterSpacing}px`;
          return `<text x="0" y="0" text-anchor="middle" dominant-baseline="middle" fill="${fillAttr}" font-size="${layer.fontSize}" opacity="${opacity}" stroke="${layer.strokeEnabled ? layer.strokeColor : 'none'}" stroke-width="${layer.strokeEnabled ? layer.strokeWidth : 0}" transform="${transform}" style="${svgLayerStyle(layer)};${fontStyle}"${clipPath}>${safeText}</text>`;
        }

        if (layer.kind === 'image' && layer.imageSrc) {
          return `<image href="${layer.imageSrc}" x="${-layer.width / 2}" y="${-layer.height / 2}" width="${layer.width}" height="${layer.height}" opacity="${opacity}" transform="${transform}" style="${svgLayerStyle(layer)}"${clipPath} />`;
        }

        return '';
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}"><defs>${clipDefs}${gradientDefs}</defs><rect x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" fill="${canvasBackground}" />${body}</svg>`;
  }, [canvasBackground, canvasHeight, canvasWidth, layers]);

  const commitLayers = useCallback((nextLayers: Layer[]) => {
    setLayers(nextLayers);
    const nextHistory = [...history.slice(0, historyIndex + 1), nextLayers];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }, [history, historyIndex]);

  const setLayer = useCallback((id: string, patch: Partial<Layer>) => {
    const nextLayers = layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer));
    commitLayers(nextLayers);
  }, [layers, commitLayers]);

  const addRect = useCallback(() => {
    const layer: Layer = {
      id: makeId('rect'),
      name: `Rectangle ${layers.filter((entry) => entry.kind === 'rect').length + 1}`,
      kind: 'rect',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width: 180,
      height: 110,
      radius: 0,
      rotation: 0,
      opacity: 1,
      fill: '#06b6d4',
      imageSrc: '',
      text: '',
      fontSize: 28,
      fontFamily: 'Inter',
      fontWeight: '400',
      letterSpacing: 0,
      gradientEnabled: false,
      gradientType: 'linear',
      gradientAngle: 0,
      gradientStops: [{ position: 0, color: '#06b6d4' }, { position: 1, color: '#0891b2' }],
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      sepia: 0,
      grayscale: 0,
      blendMode: 'normal',
      strokeEnabled: false,
      strokeColor: '#e2e8f0',
      strokeWidth: 2,
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      innerShadowEnabled: false,
      innerShadowColor: '#000000',
      innerShadowBlur: 10,
      innerShadowOffsetX: 0,
      innerShadowOffsetY: 2,
      outerGlowEnabled: false,
      outerGlowColor: '#ffffff',
      outerGlowBlur: 15,
      clipToBelow: false,
      visible: true,
      locked: false,
    };
    const nextLayers = [...layers, layer];
    commitLayers(nextLayers);
    setSelectedLayerId(layer.id);
  }, [canvasHeight, canvasWidth, commitLayers, layers]);

  const addCircle = useCallback(() => {
    const layer: Layer = {
      id: makeId('circle'),
      name: `Circle ${layers.filter((entry) => entry.kind === 'circle').length + 1}`,
      kind: 'circle',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width: 140,
      height: 140,
      radius: 70,
      rotation: 0,
      opacity: 1,
      fill: '#34d399',
      imageSrc: '',
      text: '',
      fontSize: 26,
      fontFamily: 'Inter',
      fontWeight: '400',
      letterSpacing: 0,
      gradientEnabled: false,
      gradientType: 'linear',
      gradientAngle: 0,
      gradientStops: [{ position: 0, color: '#34d399' }, { position: 1, color: '#10b981' }],
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      sepia: 0,
      grayscale: 0,
      blendMode: 'normal',
      strokeEnabled: false,
      strokeColor: '#e2e8f0',
      strokeWidth: 2,
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      innerShadowEnabled: false,
      innerShadowColor: '#000000',
      innerShadowBlur: 10,
      innerShadowOffsetX: 0,
      innerShadowOffsetY: 2,
      outerGlowEnabled: false,
      outerGlowColor: '#ffffff',
      outerGlowBlur: 15,
      clipToBelow: false,
      visible: true,
      locked: false,
    };
    const nextLayers = [...layers, layer];
    commitLayers(nextLayers);
    setSelectedLayerId(layer.id);
  }, [canvasHeight, canvasWidth, commitLayers, layers]);

  const addText = useCallback(() => {
    const layer: Layer = {
      id: makeId('text'),
      name: `Text ${layers.filter((entry) => entry.kind === 'text').length + 1}`,
      kind: 'text',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width: 240,
      height: 80,
      radius: 0,
      rotation: 0,
      opacity: 1,
      fill: '#f8fafc',
      imageSrc: '',
      text: 'LOGO',
      fontSize: 42,
      fontFamily: 'Inter',
      fontWeight: '700',
      letterSpacing: 1,
      gradientEnabled: false,
      gradientType: 'linear',
      gradientAngle: 0,
      gradientStops: [{ position: 0, color: '#f8fafc' }, { position: 1, color: '#e2e8f0' }],
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      sepia: 0,
      grayscale: 0,
      blendMode: 'normal',
      strokeEnabled: false,
      strokeColor: '#0f172a',
      strokeWidth: 1,
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      innerShadowEnabled: false,
      innerShadowColor: '#000000',
      innerShadowBlur: 10,
      innerShadowOffsetX: 0,
      innerShadowOffsetY: 2,
      outerGlowEnabled: false,
      outerGlowColor: '#ffffff',
      outerGlowBlur: 15,
      clipToBelow: false,
      visible: true,
      locked: false,
    };
    const nextLayers = [...layers, layer];
    commitLayers(nextLayers);
    setSelectedLayerId(layer.id);
  }, [canvasHeight, canvasWidth, commitLayers, layers]);

  const importImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (!src) return;

      const image = new Image();
      image.src = src;
      image.onload = () => {
        const maxSize = 280;
        const sourceWidth = image.naturalWidth || maxSize;
        const sourceHeight = image.naturalHeight || maxSize;
        const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight));
        const width = Math.max(24, Math.round(sourceWidth * scale));
        const height = Math.max(24, Math.round(sourceHeight * scale));

        imageCacheRef.current[src] = image;

        const layer: Layer = {
          id: makeId('image'),
          name: `Image ${layers.filter((entry) => entry.kind === 'image').length + 1}`,
          kind: 'image',
          x: canvasWidth / 2,
          y: canvasHeight / 2,
          width,
          height,
          radius: 0,
          rotation: 0,
          opacity: 1,
          fill: '#ffffff',
          imageSrc: src,
          text: '',
          fontSize: 36,
          fontFamily: 'Inter',
          fontWeight: '400',
          letterSpacing: 0,
          gradientEnabled: false,
          gradientType: 'linear',
          gradientAngle: 0,
          gradientStops: [{ position: 0, color: '#000000' }, { position: 1, color: '#333333' }],
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          hueRotate: 0,
          invert: 0,
          sepia: 0,
          grayscale: 0,
          blendMode: 'normal',
          strokeEnabled: false,
          strokeColor: '#e2e8f0',
          strokeWidth: 1,
          shadowEnabled: false,
          shadowColor: '#000000',
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 3,
          innerShadowEnabled: false,
          innerShadowColor: '#000000',
          innerShadowBlur: 10,
          innerShadowOffsetX: 0,
          innerShadowOffsetY: 2,
          outerGlowEnabled: false,
          outerGlowColor: '#ffffff',
          outerGlowBlur: 15,
          clipToBelow: false,
          visible: true,
          locked: false,
        };

        const nextLayers = [...layers, layer];
        commitLayers(nextLayers);
        setSelectedLayerId(layer.id);
      };
    };

    reader.readAsDataURL(file);
  };

  const duplicateSelected = useCallback(() => {
    if (!selectedLayer) return;
    const copy: Layer = {
      ...selectedLayer,
      id: makeId(selectedLayer.kind),
      name: `${selectedLayer.name} Copy`,
      x: selectedLayer.x + 24,
      y: selectedLayer.y + 24,
    };
    const nextLayers = [...layers, copy];
    commitLayers(nextLayers);
    setSelectedLayerId(copy.id);
  }, [commitLayers, layers, selectedLayer]);

  const deleteSelected = useCallback(() => {
    if (!selectedLayer) return;
    const nextLayers = layers.filter((layer) => layer.id !== selectedLayer.id);
    if (nextLayers.length === 0) {
      commitLayers(initialLayers);
      setSelectedLayerId(initialLayers[initialLayers.length - 1].id);
      return;
    }
    commitLayers(nextLayers);
    setSelectedLayerId(nextLayers[nextLayers.length - 1].id);
  }, [commitLayers, layers, selectedLayer]);

  const bringForward = useCallback(() => {
    if (!selectedLayer) return;
    const index = layers.findIndex((layer) => layer.id === selectedLayer.id);
    if (index < 0 || index === layers.length - 1) return;
    const nextLayers = [...layers];
    const [layer] = nextLayers.splice(index, 1);
    nextLayers.splice(index + 1, 0, layer);
    commitLayers(nextLayers);
  }, [commitLayers, layers, selectedLayer]);

  const sendBackward = useCallback(() => {
    if (!selectedLayer) return;
    const index = layers.findIndex((layer) => layer.id === selectedLayer.id);
    if (index <= 0) return;
    const nextLayers = [...layers];
    const [layer] = nextLayers.splice(index, 1);
    nextLayers.splice(index - 1, 0, layer);
    commitLayers(nextLayers);
  }, [commitLayers, layers, selectedLayer]);

  const alignCenterHorizontal = useCallback(() => {
    if (!selectedLayer) return;
    setLayer(selectedLayer.id, { x: canvasWidth / 2 });
  }, [canvasWidth, selectedLayer, setLayer]);

  const alignCenterVertical = useCallback(() => {
    if (!selectedLayer) return;
    setLayer(selectedLayer.id, { y: canvasHeight / 2 });
  }, [canvasHeight, selectedLayer, setLayer]);

  const distributeHorizontal = useCallback(() => {
    const targets = layers
      .map((layer, index) => ({ layer, index }))
      .filter(({ layer }) => layer.visible && !layer.locked)
      .sort((left, right) => left.layer.x - right.layer.x);

    if (targets.length < 3) return;

    const first = targets[0].layer.x;
    const last = targets[targets.length - 1].layer.x;
    const step = (last - first) / (targets.length - 1);

    const positions = new Map<string, number>();
    targets.forEach((entry, index) => {
      positions.set(entry.layer.id, first + index * step);
    });

    const nextLayers = layers.map((layer) => {
      const nextX = positions.get(layer.id);
      return typeof nextX === 'number' ? { ...layer, x: nextX } : layer;
    });

    commitLayers(nextLayers);
  }, [commitLayers, layers]);

  const distributeVertical = useCallback(() => {
    const targets = layers
      .map((layer, index) => ({ layer, index }))
      .filter(({ layer }) => layer.visible && !layer.locked)
      .sort((left, right) => left.layer.y - right.layer.y);

    if (targets.length < 3) return;

    const first = targets[0].layer.y;
    const last = targets[targets.length - 1].layer.y;
    const step = (last - first) / (targets.length - 1);

    const positions = new Map<string, number>();
    targets.forEach((entry, index) => {
      positions.set(entry.layer.id, first + index * step);
    });

    const nextLayers = layers.map((layer) => {
      const nextY = positions.get(layer.id);
      return typeof nextY === 'number' ? { ...layer, y: nextY } : layer;
    });

    commitLayers(nextLayers);
  }, [commitLayers, layers]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    const snapshot = history[nextIndex];
    setHistoryIndex(nextIndex);
    setLayers(snapshot);
    if (!snapshot.some((layer) => layer.id === selectedLayerId)) {
      setSelectedLayerId(snapshot[snapshot.length - 1]?.id ?? '');
    }
  }, [history, historyIndex, selectedLayerId]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const snapshot = history[nextIndex];
    setHistoryIndex(nextIndex);
    setLayers(snapshot);
    if (!snapshot.some((layer) => layer.id === selectedLayerId)) {
      setSelectedLayerId(snapshot[snapshot.length - 1]?.id ?? '');
    }
  }, [history, historyIndex, selectedLayerId]);

  const resetAll = () => {
    setLayers(initialLayers);
    setSelectedLayerId(initialLayers[initialLayers.length - 1].id);
    setHistory([initialLayers]);
    setHistoryIndex(0);
    setCanvasBackground('#0f172a');
    setCanvasWidth(560);
    setCanvasHeight(440);
  };

  const exportPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `aurora-logo-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  }, []);

  const exportSvg = useCallback(() => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurora-logo-${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [svgMarkup]);

  const exportProject = () => {
    const payload: LabProject = {
      version: 1,
      canvasWidth,
      canvasHeight,
      canvasBackground,
      showGrid,
      snapToGrid,
      gridSize,
      layers,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurora-logo-project-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProject = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = typeof reader.result === 'string' ? reader.result : '';
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<LabProject>;
        if (!Array.isArray(parsed.layers)) return;

        const safeLayers = parsed.layers.filter((layer): layer is Layer => {
          return typeof layer?.id === 'string' && typeof layer?.kind === 'string' && typeof layer?.x === 'number' && typeof layer?.y === 'number';
        }).map((layer) => ({
          ...layer,
          brightness: layer.brightness ?? 100,
          contrast: layer.contrast ?? 100,
          saturation: layer.saturation ?? 100,
          blur: layer.blur ?? 0,
          hueRotate: layer.hueRotate ?? 0,
          invert: layer.invert ?? 0,
          sepia: layer.sepia ?? 0,
          grayscale: layer.grayscale ?? 0,
          blendMode: layer.blendMode ?? 'normal',
          strokeEnabled: layer.strokeEnabled ?? false,
          strokeColor: layer.strokeColor ?? '#e2e8f0',
          strokeWidth: layer.strokeWidth ?? 1,
          shadowEnabled: layer.shadowEnabled ?? false,
          shadowColor: layer.shadowColor ?? '#000000',
          shadowBlur: layer.shadowBlur ?? 10,
          shadowOffsetX: layer.shadowOffsetX ?? 0,
          shadowOffsetY: layer.shadowOffsetY ?? 3,
          innerShadowEnabled: layer.innerShadowEnabled ?? false,
          innerShadowColor: layer.innerShadowColor ?? '#000000',
          innerShadowBlur: layer.innerShadowBlur ?? 10,
          innerShadowOffsetX: layer.innerShadowOffsetX ?? 0,
          innerShadowOffsetY: layer.innerShadowOffsetY ?? 2,
          outerGlowEnabled: layer.outerGlowEnabled ?? false,
          outerGlowColor: layer.outerGlowColor ?? '#ffffff',
          outerGlowBlur: layer.outerGlowBlur ?? 15,
          clipToBelow: layer.clipToBelow ?? false,
          fontFamily: layer.fontFamily ?? 'Inter',
          fontWeight: layer.fontWeight ?? '400',
          letterSpacing: layer.letterSpacing ?? 0,
          gradientEnabled: layer.gradientEnabled ?? false,
          gradientType: layer.gradientType ?? 'linear',
          gradientAngle: layer.gradientAngle ?? 0,
          gradientStops: Array.isArray(layer.gradientStops) && layer.gradientStops.length >= 2 ? layer.gradientStops : [{ position: 0, color: '#000000' }, { position: 1, color: '#ffffff' }],
        }));
        if (!safeLayers.length) return;

        setCanvasWidth(typeof parsed.canvasWidth === 'number' ? parsed.canvasWidth : 560);
        setCanvasHeight(typeof parsed.canvasHeight === 'number' ? parsed.canvasHeight : 440);
        setCanvasBackground(typeof parsed.canvasBackground === 'string' ? parsed.canvasBackground : '#0f172a');
        setShowGrid(typeof parsed.showGrid === 'boolean' ? parsed.showGrid : true);
        setSnapToGrid(typeof parsed.snapToGrid === 'boolean' ? parsed.snapToGrid : true);
        setGridSize(typeof parsed.gridSize === 'number' ? Math.max(4, Math.min(80, parsed.gridSize)) : 20);
        setLayers(safeLayers);
        setSelectedLayerId(safeLayers[safeLayers.length - 1].id);
        setHistory([safeLayers]);
        setHistoryIndex(0);
      } catch {
        // Ignore invalid project payloads.
      }
    };

    reader.readAsText(file);
  };

  const hitTest = (x: number, y: number): Layer | null => {
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const layer = layers[index];
      if (!layer.visible || layer.locked) continue;

      if (layer.kind === 'circle') {
        const dx = x - layer.x;
        const dy = y - layer.y;
        if (Math.sqrt(dx * dx + dy * dy) <= layer.radius) {
          return layer;
        }
      } else if (layer.kind === 'rect') {
        if (
          x >= layer.x - layer.width / 2 &&
          x <= layer.x + layer.width / 2 &&
          y >= layer.y - layer.height / 2 &&
          y <= layer.y + layer.height / 2
        ) {
          return layer;
        }
      } else {
        if (
          x >= layer.x - layer.width / 2 &&
          x <= layer.x + layer.width / 2 &&
          y >= layer.y - layer.height / 2 &&
          y <= layer.y + layer.height / 2
        ) {
          return layer;
        }
      }
    }

    return null;
  };

  const getPointer = (event: MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvasWidth;
    const y = ((event.clientY - rect.top) / rect.height) * canvasHeight;
    return { x, y };
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const pointer = getPointer(event);
    const target = hitTest(pointer.x, pointer.y);

    if (!target) {
      setSelectedLayerId('');
      dragRef.current.active = false;
      return;
    }

    setSelectedLayerId(target.id);
    dragRef.current.active = true;
    dragRef.current.offsetX = pointer.x - target.x;
    dragRef.current.offsetY = pointer.y - target.y;
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active || !selectedLayerId) return;
    const pointer = getPointer(event);
    const snap = (value: number) => {
      if (!snapToGrid) return value;
      const safeGrid = Math.max(4, gridSize);
      return Math.round(value / safeGrid) * safeGrid;
    };
    const nextLayers = layers.map((layer) => {
      if (layer.id !== selectedLayerId || layer.locked) return layer;
      return {
        ...layer,
        x: snap(pointer.x - dragRef.current.offsetX),
        y: snap(pointer.y - dragRef.current.offsetY),
      };
    });
    setLayers(nextLayers);
  };

  const handleMouseUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const nextHistory = [...history.slice(0, historyIndex + 1), layers];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const getCachedImage = (src: string) => {
    const cached = imageCacheRef.current[src];
    if (cached) return cached;
    const image = new Image();
    image.src = src;
    image.onload = () => setImageRenderTick((value) => value + 1);
    imageCacheRef.current[src] = image;
    return image;
  };

  const nudgeSelected = useCallback((dx: number, dy: number) => {
    if (!selectedLayer) return;
    setLayer(selectedLayer.id, {
      x: selectedLayer.x + dx,
      y: selectedLayer.y + dy,
    });
  }, [selectedLayer, setLayer]);

  useEffect(() => {
    const isTypingContext = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      const tag = element.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
          return;
        }
        undo();
        return;
      }

      if (modifier && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }

      if (modifier && key === 's') {
        event.preventDefault();
        if (event.shiftKey) {
          exportSvg();
          return;
        }
        exportPng();
        return;
      }

      if (modifier && key === 'd' && selectedLayerId) {
        event.preventDefault();
        duplicateSelected();
        return;
      }

      if (isTypingContext(event.target)) return;

      if (selectedLayerId && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        deleteSelected();
        return;
      }

      if (selectedLayerId && event.key.startsWith('Arrow')) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        if (event.key === 'ArrowLeft') nudgeSelected(-step, 0);
        if (event.key === 'ArrowRight') nudgeSelected(step, 0);
        if (event.key === 'ArrowUp') nudgeSelected(0, -step);
        if (event.key === 'ArrowDown') nudgeSelected(0, step);
        return;
      }

      if (modifier && event.shiftKey && key === 'h') {
        event.preventDefault();
        alignCenterHorizontal();
        return;
      }

      if (modifier && event.shiftKey && key === 'v') {
        event.preventDefault();
        alignCenterVertical();
        return;
      }

      if (modifier && event.altKey && key === 'h') {
        event.preventDefault();
        distributeHorizontal();
        return;
      }

      if (modifier && event.altKey && key === 'v') {
        event.preventDefault();
        distributeVertical();
        return;
      }

      if (!modifier && !event.altKey && !event.shiftKey && key === 'r') {
        event.preventDefault();
        addRect();
        return;
      }

      if (!modifier && !event.altKey && !event.shiftKey && key === 'c') {
        event.preventDefault();
        addCircle();
        return;
      }

      if (!modifier && !event.altKey && !event.shiftKey && key === 't') {
        event.preventDefault();
        addText();
        return;
      }

      if (!modifier && !event.altKey && !event.shiftKey && key === 'i') {
        event.preventDefault();
        importImageRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    alignCenterHorizontal,
    alignCenterVertical,
    deleteSelected,
    distributeHorizontal,
    distributeVertical,
    duplicateSelected,
    addCircle,
    addRect,
    addText,
    exportPng,
    exportSvg,
    nudgeSelected,
    redo,
    selectedLayerId,
    undo,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = canvasBackground;
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    if (showGrid) {
      const safeGrid = Math.max(4, gridSize);
      context.save();
      context.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      context.lineWidth = 1;

      for (let x = safeGrid; x < canvasWidth; x += safeGrid) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvasHeight);
        context.stroke();
      }

      for (let y = safeGrid; y < canvasHeight; y += safeGrid) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvasWidth, y);
        context.stroke();
      }

      context.restore();
    }

    layers.forEach((layer, index) => {
      if (!layer.visible) return;

      context.save();

      if (layer.clipToBelow && index > 0) {
        const baseLayer = layers[index - 1];
        if (baseLayer?.visible) {
          context.save();
          context.translate(baseLayer.x, baseLayer.y);
          context.rotate((baseLayer.rotation * Math.PI) / 180);
          defineLayerPath(context, baseLayer);
          context.restore();
          context.clip();
        }
      }

      context.translate(layer.x, layer.y);
      context.rotate((layer.rotation * Math.PI) / 180);
      context.globalAlpha = Math.min(1, Math.max(0, layer.opacity));
      context.globalCompositeOperation = canvasBlendMode(layer.blendMode);
      context.filter = layerCssFilter(layer);
      context.shadowColor = layer.shadowEnabled ? layer.shadowColor : 'transparent';
      context.shadowBlur = layer.shadowEnabled ? layer.shadowBlur : 0;
      context.shadowOffsetX = layer.shadowEnabled ? layer.shadowOffsetX : 0;
      context.shadowOffsetY = layer.shadowEnabled ? layer.shadowOffsetY : 0;

      if (layer.kind === 'rect') {
        context.fillStyle = createGradient(context, layer);
        context.fillRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
        if (layer.strokeEnabled && layer.strokeWidth > 0) {
          context.strokeStyle = layer.strokeColor;
          context.lineWidth = layer.strokeWidth;
          context.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
        }
      }

      if (layer.kind === 'circle') {
        context.fillStyle = createGradient(context, layer);
        context.beginPath();
        context.arc(0, 0, layer.radius, 0, Math.PI * 2);
        context.fill();
        if (layer.strokeEnabled && layer.strokeWidth > 0) {
          context.strokeStyle = layer.strokeColor;
          context.lineWidth = layer.strokeWidth;
          context.stroke();
        }
      }

      if (layer.kind === 'text') {
        context.fillStyle = createGradient(context, layer);
        const fontWeight = layer.fontWeight || '400';
        context.font = `${fontWeight} ${layer.fontSize}px ${layer.fontFamily}, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        if (layer.letterSpacing !== 0) {
          const text = layer.text || 'TEXT';
          const chars = text.split('');
          const totalWidth = chars.reduce((sum, char) => sum + context.measureText(char).width, 0);
          const totalSpacing = layer.letterSpacing * (chars.length - 1);
          const fullWidth = totalWidth + totalSpacing;
          let currentX = -fullWidth / 2;
          
          chars.forEach((char) => {
            const charWidth = context.measureText(char).width;
            context.fillText(char, currentX + charWidth / 2, 0);
            if (layer.strokeEnabled && layer.strokeWidth > 0) {
              context.strokeStyle = layer.strokeColor;
              context.lineWidth = layer.strokeWidth;
              context.strokeText(char, currentX + charWidth / 2, 0);
            }
            currentX += charWidth + layer.letterSpacing;
          });
        } else {
          context.fillText(layer.text || 'TEXT', 0, 0, layer.width);
          if (layer.strokeEnabled && layer.strokeWidth > 0) {
            context.strokeStyle = layer.strokeColor;
            context.lineWidth = layer.strokeWidth;
            context.strokeText(layer.text || 'TEXT', 0, 0, layer.width);
          }
        }
      }

      if (layer.kind === 'image' && layer.imageSrc) {
        const image = getCachedImage(layer.imageSrc);
        if (image.complete && image.naturalWidth > 0) {
          context.drawImage(image, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
          if (layer.strokeEnabled && layer.strokeWidth > 0) {
            context.strokeStyle = layer.strokeColor;
            context.lineWidth = layer.strokeWidth;
            context.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
          }
        }
      }

      context.restore();
    });

    const activeSelection = layers.find((layer) => layer.id === selectedLayerId && layer.visible);
    if (activeSelection) {
      context.save();
      context.translate(activeSelection.x, activeSelection.y);
      context.rotate((activeSelection.rotation * Math.PI) / 180);
      context.strokeStyle = 'rgba(56, 189, 248, 0.95)';
      context.lineWidth = 2;
      context.setLineDash([6, 4]);

      if (activeSelection.kind === 'circle') {
        context.beginPath();
        context.arc(0, 0, Math.max(2, activeSelection.radius + 2), 0, Math.PI * 2);
        context.stroke();
      } else {
        context.strokeRect(
          -activeSelection.width / 2,
          -activeSelection.height / 2,
          activeSelection.width,
          activeSelection.height,
        );
      }

      context.beginPath();
      context.moveTo(-8, 0);
      context.lineTo(8, 0);
      context.moveTo(0, -8);
      context.lineTo(0, 8);
      context.stroke();
      context.restore();
    }
  }, [canvasBackground, canvasHeight, canvasWidth, gridSize, imageRenderTick, layers, selectedLayerId, showGrid]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);
    if (tool === 'rect') addRect();
    else if (tool === 'circle') addCircle();
    else if (tool === 'text') addText();
    else if (tool === 'image') importImageRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top Header - Photoshop Style */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/brand">
            <Button variant="ghost" className="text-xs">← Brand</Button>
          </Link>
          <h1 className="text-sm font-semibold text-slate-100">Arc Panel Lab</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={undo} 
            disabled={historyIndex <= 0}
            className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button 
            onClick={redo} 
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1"></div>
          <Button variant="secondary" onClick={exportSvg} className="text-xs">SVG</Button>
          <Button variant="primary" onClick={exportPng} className="text-xs">PNG</Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar - Photoshop Style */}
        <div className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 gap-1">
          <button
            onClick={() => handleToolClick('select')}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
              activeTool === 'select' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Move Tool (V)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
            </svg>
          </button>
          
          <button
            onClick={() => handleToolClick('rect')}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
              activeTool === 'rect' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Rectangle Tool (R)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" strokeWidth={2} />
            </svg>
          </button>

          <button
            onClick={() => handleToolClick('circle')}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
              activeTool === 'circle' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Ellipse Tool (C)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
            </svg>
          </button>

          <button
            onClick={() => handleToolClick('text')}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
              activeTool === 'text' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Text Tool (T)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 19h18M5 5v14M19 5v14M9 12h6" />
            </svg>
          </button>

          <button
            onClick={() => handleToolClick('image')}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
              activeTool === 'image' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Place Image (I)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <div className="flex-1"></div>

          <button
            onClick={resetAll}
            className="w-10 h-10 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 transition-colors"
            title="Reset All"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-8 overflow-auto">
          <div className="relative" style={{ boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.15)' }}>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="block cursor-crosshair"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          {/* Canvas Controls at Bottom */}
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span>Grid</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="rounded"
              />
              <span>Snap</span>
            </label>
            <span className="text-slate-600">|</span>
            <span>{canvasWidth}×{canvasHeight}px</span>
          </div>
        </div>

        {/* Right Panels */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
          {/* Layers Panel */}
          <div className="border-b border-slate-800" style={{ height: '40%' }}>
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300">LAYERS</h2>
              <div className="flex gap-1">
                <button
                  onClick={duplicateSelected}
                  disabled={!selectedLayer}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  title="Duplicate Layer (Ctrl+D)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={deleteSelected}
                  disabled={!selectedLayer}
                  className="p-1 text-slate-400 hover:text-red-400 disabled:opacity-30 transition-colors"
                  title="Delete Layer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto" style={{ height: 'calc(100% - 42px)' }}>
              {[...layers].reverse().map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                const canClip = layers.findIndex((entry) => entry.id === layer.id) > 0;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 border-b border-slate-800/50 transition-colors ${
                      isSelected ? 'bg-slate-700' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Layer Thumbnail */}
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-700">
                      {layer.kind === 'rect' && (
                        <div
                          className="w-5 h-4 rounded-sm"
                          style={{
                            background: layer.gradientEnabled
                              ? `linear-gradient(${layer.gradientAngle}deg, ${layer.gradientStops.map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`).join(', ')})`
                              : layer.fill,
                            border: layer.strokeEnabled ? `1px solid ${layer.strokeColor}` : '1px solid rgba(148,163,184,0.5)',
                            opacity: layer.opacity,
                          }}
                        />
                      )}
                      {layer.kind === 'circle' && (
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{
                            background: layer.gradientEnabled
                              ? `linear-gradient(${layer.gradientAngle}deg, ${layer.gradientStops.map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`).join(', ')})`
                              : layer.fill,
                            border: layer.strokeEnabled ? `1px solid ${layer.strokeColor}` : '1px solid rgba(148,163,184,0.5)',
                            opacity: layer.opacity,
                          }}
                        />
                      )}
                      {layer.kind === 'text' && (
                        <span className="text-[10px] font-bold" style={{ color: layer.fill, opacity: layer.opacity }}>
                          {(layer.text || 'T').slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      {layer.kind === 'image' && (
                        <img src={layer.imageSrc} alt={layer.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">{layer.name}</div>
                      <div className="text-xs text-slate-500">
                        {layer.kind === 'text' && (layer.text || 'Text layer')}
                        {layer.kind !== 'text' && `${Math.round(layer.opacity * 100)}% opacity`}
                        {layer.clipToBelow && canClip ? ' · clipped' : ''}
                      </div>
                    </div>

                    <div className="flex gap-1 items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLayer(layer.id, { visible: !layer.visible });
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {layer.visible ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.5 6.5m12.372 12.372L15.5 15.5m3.372 3.372l-3.372-3.372m0 0L12 12m3.5 3.5L18.5 18.5" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLayer(layer.id, { locked: !layer.locked });
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {layer.locked ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
              <h2 className="text-xs font-semibold text-slate-300">PROPERTIES</h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Shortcuts: <span className="text-slate-400">V</span> Move, <span className="text-slate-400">R</span> Rect, <span className="text-slate-400">C</span> Circle, <span className="text-slate-400">T</span> Text, <span className="text-slate-400">I</span> Image
              </p>
            </div>

            {!selectedLayer && (
              <div className="px-3 py-8 text-center text-xs text-slate-500">
                Select a layer to edit properties
              </div>
            )}

            {selectedLayer && (
              <div className="text-xs">
                <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/70">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Selected</p>
                  <p className="text-xs font-medium text-slate-200 truncate">{selectedLayer.name}</p>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    <Button variant="secondary" onClick={bringForward} disabled={!selectedLayer} className="text-[10px]">Bring Forward</Button>
                    <Button variant="secondary" onClick={sendBackward} disabled={!selectedLayer} className="text-[10px]">Send Backward</Button>
                  </div>
                </div>

                {/* Transform Section */}
                <div className="border-b border-slate-800">
                  <button
                    onClick={() => toggleSection('transform')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-medium text-slate-200">Transform</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.transform ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.transform && (
                    <div className="px-3 py-2 space-y-3 bg-slate-900/50">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="space-y-1">
                          <span className="text-slate-400">X</span>
                          <input
                            type="number"
                            value={Math.round(selectedLayer.x)}
                            onChange={(e) => setLayer(selectedLayer.id, { x: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-slate-400">Y</span>
                          <input
                            type="number"
                            value={Math.round(selectedLayer.y)}
                            onChange={(e) => setLayer(selectedLayer.id, { y: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                          />
                        </label>
                      </div>
                      {selectedLayer.kind !== 'circle' && (
                        <div className="grid grid-cols-2 gap-2">
                          <label className="space-y-1">
                            <span className="text-slate-400">W</span>
                            <input
                              type="number"
                              value={Math.round(selectedLayer.width)}
                              onChange={(e) => setLayer(selectedLayer.id, { width: Number(e.target.value) })}
                              className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-slate-400">H</span>
                            <input
                              type="number"
                              value={Math.round(selectedLayer.height)}
                              onChange={(e) => setLayer(selectedLayer.id, { height: Number(e.target.value) })}
                              className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                            />
                          </label>
                        </div>
                      )}
                      {selectedLayer.kind === 'circle' && (
                        <label className="space-y-1">
                          <span className="text-slate-400">Radius</span>
                          <input
                            type="number"
                            value={Math.round(selectedLayer.radius)}
                            onChange={(e) => {
                              const r = Number(e.target.value);
                              setLayer(selectedLayer.id, { radius: r, width: r * 2, height: r * 2 });
                            }}
                            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                          />
                        </label>
                      )}
                      <label className="space-y-1">
                        <span className="text-slate-400">Rotation: {selectedLayer.rotation}°</span>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          value={selectedLayer.rotation}
                          onChange={(e) => setLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                          className="w-full"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Appearance Section */}
                <div className="border-b border-slate-800">
                  <button
                    onClick={() => toggleSection('appearance')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-medium text-slate-200">Appearance</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.appearance ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.appearance && (
                    <div className="px-3 py-2 space-y-3 bg-slate-900/50">
                      <label className="space-y-1">
                        <span className="text-slate-400">Opacity: {Math.round(selectedLayer.opacity * 100)}%</span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={selectedLayer.opacity}
                          onChange={(e) => setLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                          className="w-full"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-slate-400">Blend Mode</span>
                        <select
                          value={selectedLayer.blendMode}
                          onChange={(e) => setLayer(selectedLayer.id, { blendMode: e.target.value as LayerBlendMode })}
                          className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                        >
                          <option value="normal">Normal</option>
                          <option value="multiply">Multiply</option>
                          <option value="screen">Screen</option>
                          <option value="overlay">Overlay</option>
                          <option value="darken">Darken</option>
                          <option value="lighten">Lighten</option>
                          <option value="color-dodge">Color Dodge</option>
                          <option value="color-burn">Color Burn</option>
                          <option value="hard-light">Hard Light</option>
                          <option value="soft-light">Soft Light</option>
                          <option value="difference">Difference</option>
                          <option value="exclusion">Exclusion</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>

                {/* Fill Section */}
                {selectedLayer.kind !== 'image' && (
                  <div className="border-b border-slate-800">
                    <button
                      onClick={() => toggleSection('fill')}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="font-medium text-slate-200">Fill</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.fill ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.fill && (
                      <div className="px-3 py-2 space-y-3 bg-slate-900/50">
                        <label className="space-y-1 block">
                          <span className="text-slate-400">Color</span>
                          <input
                            type="color"
                            value={selectedLayer.fill}
                            onChange={(e) => setLayer(selectedLayer.id, { fill: e.target.value })}
                            className="h-9 w-full rounded bg-slate-800 border border-slate-700"
                          />
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedLayer.gradientEnabled}
                            onChange={(e) => setLayer(selectedLayer.id, { gradientEnabled: e.target.checked })}
                          />
                          <span className="text-slate-400">Enable Gradient</span>
                        </label>

                        {selectedLayer.gradientEnabled && (
                          <>
                            <label className="space-y-1 block">
                              <span className="text-slate-400">Type</span>
                              <select
                                value={selectedLayer.gradientType}
                                onChange={(e) => setLayer(selectedLayer.id, { gradientType: e.target.value as GradientType })}
                                className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                              >
                                <option value="linear">Linear</option>
                                <option value="radial">Radial</option>
                              </select>
                            </label>

                            {selectedLayer.gradientType === 'linear' && (
                              <label className="space-y-1 block">
                                <span className="text-slate-400">Angle</span>
                                <input
                                  type="range"
                                  min={0}
                                  max={360}
                                  value={selectedLayer.gradientAngle}
                                  onChange={(e) => setLayer(selectedLayer.id, { gradientAngle: Number(e.target.value) })}
                                  className="w-full"
                                />
                              </label>
                            )}

                            <div className="space-y-2">
                              <span className="text-slate-400">Stops</span>
                              {selectedLayer.gradientStops.map((stop, index) => (
                                <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
                                  <input
                                    type="color"
                                    value={stop.color}
                                    onChange={(e) => {
                                      const nextStops = [...selectedLayer.gradientStops];
                                      nextStops[index] = { ...stop, color: e.target.value };
                                      setLayer(selectedLayer.id, { gradientStops: nextStops });
                                    }}
                                    className="h-8 w-full rounded bg-slate-800 border border-slate-700"
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={Math.round(stop.position * 100)}
                                    onChange={(e) => {
                                      const nextStops = [...selectedLayer.gradientStops];
                                      nextStops[index] = {
                                        ...stop,
                                        position: Math.max(0, Math.min(1, Number(e.target.value) / 100)),
                                      };
                                      setLayer(selectedLayer.id, { gradientStops: nextStops });
                                    }}
                                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                                  />
                                  <button
                                    type="button"
                                    disabled={selectedLayer.gradientStops.length <= 2}
                                    onClick={() => {
                                      if (selectedLayer.gradientStops.length <= 2) return;
                                      const nextStops = selectedLayer.gradientStops.filter((_, stopIndex) => stopIndex !== index);
                                      setLayer(selectedLayer.id, { gradientStops: nextStops });
                                    }}
                                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30"
                                  >
                                    −
                                  </button>
                                </div>
                              ))}
                              <Button
                                variant="secondary"
                                disabled={selectedLayer.gradientStops.length >= 5}
                                onClick={() => {
                                  if (selectedLayer.gradientStops.length >= 5) return;
                                  const nextStops = [
                                    ...selectedLayer.gradientStops,
                                    { color: '#ffffff', position: 1 },
                                  ];
                                  setLayer(selectedLayer.id, { gradientStops: nextStops });
                                }}
                                className="text-[10px]"
                              >
                                Add Stop
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Stroke Section */}
                {selectedLayer.kind !== 'image' && (
                  <div className="border-b border-slate-800">
                    <button
                      onClick={() => toggleSection('stroke')}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="font-medium text-slate-200">Stroke</span>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.stroke ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.stroke && (
                      <div className="px-3 py-2 space-y-3 bg-slate-900/50">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedLayer.strokeEnabled}
                            onChange={(e) => setLayer(selectedLayer.id, { strokeEnabled: e.target.checked })}
                          />
                          <span className="text-slate-400">Enable Stroke</span>
                        </label>

                        {selectedLayer.strokeEnabled && (
                          <>
                            <label className="space-y-1 block">
                              <span className="text-slate-400">Color</span>
                              <input
                                type="color"
                                value={selectedLayer.strokeColor}
                                onChange={(e) => setLayer(selectedLayer.id, { strokeColor: e.target.value })}
                                className="h-9 w-full rounded bg-slate-800 border border-slate-700"
                              />
                            </label>
                            <label className="space-y-1 block">
                              <span className="text-slate-400">Width</span>
                              <input
                                type="range"
                                min={1}
                                max={20}
                                value={selectedLayer.strokeWidth}
                                onChange={(e) => setLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })}
                                className="w-full"
                              />
                            </label>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Effects Section */}
                <div className="border-b border-slate-800">
                  <button
                    onClick={() => toggleSection('effects')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-medium text-slate-200">Effects</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.effects ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.effects && (
                    <div className="px-3 py-2 space-y-4 bg-slate-900/50">
                      <div className="space-y-2 border border-slate-800 rounded p-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedLayer.shadowEnabled}
                            onChange={(e) => setLayer(selectedLayer.id, { shadowEnabled: e.target.checked })}
                          />
                          <span className="text-slate-300">Drop Shadow</span>
                        </label>
                        {selectedLayer.shadowEnabled && (
                          <>
                            <input
                              type="color"
                              value={selectedLayer.shadowColor}
                              onChange={(e) => setLayer(selectedLayer.id, { shadowColor: e.target.value })}
                              className="h-8 w-full rounded bg-slate-800 border border-slate-700"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input type="number" value={selectedLayer.shadowOffsetX} onChange={(e) => setLayer(selectedLayer.id, { shadowOffsetX: Number(e.target.value) })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100" />
                              <input type="number" value={selectedLayer.shadowOffsetY} onChange={(e) => setLayer(selectedLayer.id, { shadowOffsetY: Number(e.target.value) })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100" />
                              <input type="number" min={0} value={selectedLayer.shadowBlur} onChange={(e) => setLayer(selectedLayer.id, { shadowBlur: Number(e.target.value) })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100" />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2 border border-slate-800 rounded p-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedLayer.innerShadowEnabled}
                            onChange={(e) => setLayer(selectedLayer.id, { innerShadowEnabled: e.target.checked })}
                          />
                          <span className="text-slate-300">Inner Shadow</span>
                        </label>
                        {selectedLayer.innerShadowEnabled && (
                          <>
                            <input
                              type="color"
                              value={selectedLayer.innerShadowColor}
                              onChange={(e) => setLayer(selectedLayer.id, { innerShadowColor: e.target.value })}
                              className="h-8 w-full rounded bg-slate-800 border border-slate-700"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input type="number" value={selectedLayer.innerShadowOffsetX} onChange={(e) => setLayer(selectedLayer.id, { innerShadowOffsetX: Number(e.target.value) })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100" />
                              <input type="number" value={selectedLayer.innerShadowOffsetY} onChange={(e) => setLayer(selectedLayer.id, { innerShadowOffsetY: Number(e.target.value) })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100" />
                              <input type="number" min={0} value={selectedLayer.innerShadowBlur} onChange={(e) => setLayer(selectedLayer.id, { innerShadowBlur: Number(e.target.value) })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100" />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2 border border-slate-800 rounded p-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedLayer.outerGlowEnabled}
                            onChange={(e) => setLayer(selectedLayer.id, { outerGlowEnabled: e.target.checked })}
                          />
                          <span className="text-slate-300">Outer Glow</span>
                        </label>
                        {selectedLayer.outerGlowEnabled && (
                          <>
                            <input
                              type="color"
                              value={selectedLayer.outerGlowColor}
                              onChange={(e) => setLayer(selectedLayer.id, { outerGlowColor: e.target.value })}
                              className="h-8 w-full rounded bg-slate-800 border border-slate-700"
                            />
                            <input
                              type="range"
                              min={0}
                              max={80}
                              value={selectedLayer.outerGlowBlur}
                              onChange={(e) => setLayer(selectedLayer.id, { outerGlowBlur: Number(e.target.value) })}
                              className="w-full"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filters Section */}
                <div className="border-b border-slate-800">
                  <button
                    onClick={() => toggleSection('filters')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-medium text-slate-200">Filters</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.filters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.filters && (
                    <div className="px-3 py-2 space-y-3 bg-slate-900/50">
                      <label className="space-y-1 block"><span className="text-slate-400">Brightness {selectedLayer.brightness}%</span><input type="range" min={0} max={200} value={selectedLayer.brightness} onChange={(e) => setLayer(selectedLayer.id, { brightness: Number(e.target.value) })} className="w-full" /></label>
                      <label className="space-y-1 block"><span className="text-slate-400">Contrast {selectedLayer.contrast}%</span><input type="range" min={0} max={200} value={selectedLayer.contrast} onChange={(e) => setLayer(selectedLayer.id, { contrast: Number(e.target.value) })} className="w-full" /></label>
                      <label className="space-y-1 block"><span className="text-slate-400">Saturation {selectedLayer.saturation}%</span><input type="range" min={0} max={200} value={selectedLayer.saturation} onChange={(e) => setLayer(selectedLayer.id, { saturation: Number(e.target.value) })} className="w-full" /></label>
                      <label className="space-y-1 block"><span className="text-slate-400">Blur {selectedLayer.blur}px</span><input type="range" min={0} max={24} step={0.5} value={selectedLayer.blur} onChange={(e) => setLayer(selectedLayer.id, { blur: Number(e.target.value) })} className="w-full" /></label>
                      <label className="space-y-1 block"><span className="text-slate-400">Hue {selectedLayer.hueRotate}°</span><input type="range" min={0} max={360} value={selectedLayer.hueRotate} onChange={(e) => setLayer(selectedLayer.id, { hueRotate: Number(e.target.value) })} className="w-full" /></label>
                      <label className="space-y-1 block"><span className="text-slate-400">Invert {selectedLayer.invert}%</span><input type="range" min={0} max={100} value={selectedLayer.invert} onChange={(e) => setLayer(selectedLayer.id, { invert: Number(e.target.value) })} className="w-full" /></label>
                      <label className="space-y-1 block"><span className="text-slate-400">Sepia {selectedLayer.sepia}%</span><input type="range" min={0} max={100} value={selectedLayer.sepia} onChange={(e) => setLayer(selectedLayer.id, { sepia: Number(e.target.value) })} className="w-full" /></label>
                      <label className="space-y-1 block"><span className="text-slate-400">Grayscale {selectedLayer.grayscale}%</span><input type="range" min={0} max={100} value={selectedLayer.grayscale} onChange={(e) => setLayer(selectedLayer.id, { grayscale: Number(e.target.value) })} className="w-full" /></label>
                    </div>
                  )}
                </div>

                {/* Text Section */}
                <div className="border-b border-slate-800">
                  <button
                    onClick={() => toggleSection('text')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-medium text-slate-200">Text</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedSections.text ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.text && (
                    <div className="px-3 py-2 space-y-3 bg-slate-900/50">
                      {selectedLayer.kind !== 'text' ? (
                        <p className="text-slate-500">Select a text layer to edit typography.</p>
                      ) : (
                        <>
                          <label className="space-y-1 block">
                            <span className="text-slate-400">Content</span>
                            <textarea
                              rows={2}
                              value={selectedLayer.text}
                              onChange={(e) => setLayer(selectedLayer.id, { text: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
                            />
                          </label>
                          <label className="space-y-1 block"><span className="text-slate-400">Size</span><input type="range" min={8} max={240} value={selectedLayer.fontSize} onChange={(e) => setLayer(selectedLayer.id, { fontSize: Number(e.target.value) })} className="w-full" /></label>
                          <label className="space-y-1 block">
                            <span className="text-slate-400">Family</span>
                            <select value={selectedLayer.fontFamily} onChange={(e) => setLayer(selectedLayer.id, { fontFamily: e.target.value })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100">
                              <option value="Inter">Inter</option>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                              <option value="Courier New">Courier New</option>
                            </select>
                          </label>
                          <label className="space-y-1 block">
                            <span className="text-slate-400">Weight</span>
                            <select value={selectedLayer.fontWeight} onChange={(e) => setLayer(selectedLayer.id, { fontWeight: e.target.value })} className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100">
                              <option value="100">100</option>
                              <option value="200">200</option>
                              <option value="300">300</option>
                              <option value="400">400</option>
                              <option value="500">500</option>
                              <option value="600">600</option>
                              <option value="700">700</option>
                              <option value="800">800</option>
                              <option value="900">900</option>
                            </select>
                          </label>
                          <label className="space-y-1 block"><span className="text-slate-400">Letter Spacing {selectedLayer.letterSpacing}px</span><input type="range" min={-5} max={20} step={0.5} value={selectedLayer.letterSpacing} onChange={(e) => setLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })} className="w-full" /></label>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        ref={importImageRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={importImage}
        className="hidden"
      />
      <input
        ref={importProjectRef}
        type="file"
        accept="application/json"
        onChange={importProject}
        className="hidden"
      />
    </div>
  );
}
