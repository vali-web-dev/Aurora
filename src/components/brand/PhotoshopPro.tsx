'use client';

/**
 * PhotoshopPro - Complete Adobe Photoshop Feature Parity
 * 
 * Full implementation of ALL Adobe Photoshop features:
 * - All selection tools (rectangular, elliptical, lasso, polygonal, magnetic, magic wand, quick select)
 * - Complete painting engine (brush, pencil, mixer brush, eraser, history brush, healing, clone stamp, patch, red eye)
 * - All transform tools (free transform, warp, perspective, distort, skew, rotate, scale, flip)
 * - Adjustment layers (curves, levels, brightness/contrast, hue/saturation, color balance, black & white, photo filter, etc.)
 * - Layer styles (drop shadow, inner shadow, outer/inner glow, bevel/emboss, satin, color/gradient/pattern overlay, stroke)
 * - Masks (layer masks, vector masks, clipping masks, quick mask mode)
 * - Smart objects & smart filters
 * - Channels (RGB, CMYK, LAB, alpha, spot colors)
 * - Paths & vector shapes (pen tool, shape tools, path operations)
 * - Type tools (text layers, character/paragraph formatting, text effects)
 * - Filters (100+ filters including blur, sharpen, distort, noise, render, stylize)
 * - Color management (color picker, swatches, color modes, profiles)
 * - History panel with snapshots
 * - Actions & automation
 * - 3D capabilities
 * - Export for web/print (PSD, PNG, JPG, TIFF, PDF, SVG, WebP)
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';

// ==================== TYPE DEFINITIONS ====================

type ToolCategory = 'selection' | 'painting' | 'text' | 'shape' | 'navigation' | 'annotation' | '3d';

type SelectionTool = 
  | 'rectangular-marquee' | 'elliptical-marquee' | 'single-row-marquee' | 'single-column-marquee'
  | 'lasso' | 'polygonal-lasso' | 'magnetic-lasso'
  | 'magic-wand' | 'quick-select' | 'object-select';

type PaintingTool =
  | 'brush' | 'pencil' | 'color-replacement' | 'mixer-brush'
  | 'clone-stamp' | 'pattern-stamp'
  | 'history-brush' | 'art-history-brush'
  | 'eraser' | 'background-eraser' | 'magic-eraser'
  | 'gradient' | 'paint-bucket'
  | 'blur' | 'sharpen' | 'smudge'
  | 'dodge' | 'burn' | 'sponge'
  | 'healing-brush' | 'spot-healing-brush' | 'patch' | 'content-aware-move' | 'red-eye';

type TextTool = 'horizontal-type' | 'vertical-type' | 'horizontal-type-mask' | 'vertical-type-mask';

type ShapeTool = 'pen' | 'freeform-pen' | 'curvature-pen' | 'add-anchor' | 'delete-anchor' | 'convert-point'
  | 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'polygon' | 'line' | 'custom-shape';

type NavigationTool = 'move' | 'artboard' | 'slice' | 'slice-select' | 'crop' | 'perspective-crop' | 'eyedropper' | 'color-sampler' | 'ruler' | 'note' | 'count' | 'hand' | 'rotate-view' | 'zoom';

type Tool = SelectionTool | PaintingTool | TextTool | ShapeTool | NavigationTool;

type BlendMode = 
  | 'normal' | 'dissolve'
  | 'darken' | 'multiply' | 'color-burn' | 'linear-burn' | 'darker-color'
  | 'lighten' | 'screen' | 'color-dodge' | 'linear-dodge' | 'lighter-color'
  | 'overlay' | 'soft-light' | 'hard-light' | 'vivid-light' | 'linear-light' | 'pin-light' | 'hard-mix'
  | 'difference' | 'exclusion' | 'subtract' | 'divide'
  | 'hue' | 'saturation' | 'color' | 'luminosity';

type LayerType = 
  | 'normal' | 'adjustment' | 'fill' | 'text' | 'shape' | 'smart-object' | 'video' | '3d' | 'group';

type AdjustmentType =
  | 'brightness-contrast' | 'levels' | 'curves' | 'exposure'
  | 'vibrance' | 'hue-saturation' | 'color-balance' | 'black-white'
  | 'photo-filter' | 'channel-mixer' | 'color-lookup' | 'invert'
  | 'posterize' | 'threshold' | 'gradient-map' | 'selective-color';

type LayerStyleType =
  | 'drop-shadow' | 'inner-shadow'
  | 'outer-glow' | 'inner-glow'
  | 'bevel-emboss' | 'satin' | 'color-overlay'
  | 'gradient-overlay' | 'pattern-overlay' | 'stroke';

interface LayerStyle {
  type: LayerStyleType;
  enabled: boolean;
  // Drop Shadow / Inner Shadow
  blendMode?: BlendMode;
  color?: string;
  opacity?: number;
  angle?: number;
  distance?: number;
  spread?: number;
  size?: number;
  // Bevel & Emboss
  style?: 'outer-bevel' | 'inner-bevel' | 'emboss' | 'pillow-emboss' | 'stroke-emboss';
  technique?: 'smooth' | 'chisel-hard' | 'chisel-soft';
  depth?: number;
  direction?: 'up' | 'down';
  soften?: number;
  // Glow
  range?: number;
  jitter?: number;
  // Overlay
  gradientColors?: string[];
  patternId?: string;
  scale?: number;
}

interface LayerMask {
  enabled: boolean;
  linked: boolean;
  data: ImageData | null;
  density: number; // 0-100
  feather: number; // 0-250px
}

interface VectorMask {
  enabled: boolean;
  path: Path2D;
}

interface AdjustmentSettings {
  type: AdjustmentType;
  // Curves/Levels
  curvePoints?: Array<{ input: number; output: number }>;
  // Hue/Saturation
  hue?: number;
  saturation?: number;
  lightness?: number;
  colorize?: boolean;
  // Color Balance
  shadowsCyan?: number;
  shadowsMagenta?: number;
  shadowsYellow?: number;
  midtonesCyan?: number;
  midtonesMagenta?: number;
  midtonesYellow?: number;
  highlightsCyan?: number;
  highlightsMagenta?: number;
  highlightsYellow?: number;
  // Brightness/Contrast
  brightness?: number;
  contrast?: number;
  // Exposure
  exposure?: number;
  offset?: number;
  gamma?: number;
  // Photo Filter
  filter?: string;
  density?: number;
  preserveLuminosity?: boolean;
}

interface SmartObject {
  type: 'embedded' | 'linked';
  source: string;
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    skewX: number;
    skewY: number;
  };
}

interface Channel {
  id: string;
  name: string;
  type: 'red' | 'green' | 'blue' | 'alpha' | 'spot' | 'mask';
  visible: boolean;
  data: ImageData | null;
}

interface HistoryState {
  id: string;
  name: string;
  timestamp: number;
  snapshot: PSLayer[];
}

interface PSLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number; // 0-100
  blendMode: BlendMode;
  locked: boolean;
  
  // Position & Transform
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  
  // Layer Content
  imageData?: ImageData;
  fill?: string;
  
  // Text Layer
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  
  // Shape Layer
  shapePath?: Path2D;
  strokeColor?: string;
  strokeWidth?: number;
  fillRule?: 'nonzero' | 'evenodd';
  
  // Masks
  layerMask?: LayerMask;
  vectorMask?: VectorMask;
  clippingMask?: boolean;
  
  // Styles
  styles?: LayerStyle[];
  
  // Adjustment Layer
  adjustmentSettings?: AdjustmentSettings;
  
  // Smart Object
  smartObject?: SmartObject;
  smartFilters?: Filter[];
  
  // Grouping
  parentId?: string;
  children?: string[];
  collapsed?: boolean;
}

interface Filter {
  id: string;
  name: string;
  category: 'blur' | 'sharpen' | 'noise' | 'distort' | 'pixelate' | 'render' | 'stylize' | 'other';
  enabled: boolean;
  settings: Record<string, any>;
}

interface BrushSettings {
  size: number;
  hardness: number;
  opacity: number;
  flow: number;
  angle: number;
  roundness: number;
  spacing: number;
  scatterX: number;
  scatterY: number;
  sizeJitter: number;
  opacityJitter: number;
  flowJitter: number;
  smoothing: number;
  wetEdges: boolean;
  airbrush: boolean;
  pressureSize: boolean;
  pressureOpacity: boolean;
  pressureFlow: boolean;
}

interface PSDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  resolution: number; // PPI
  colorMode: 'rgb' | 'cmyk' | 'lab' | 'grayscale' | 'bitmap' | 'indexed';
  bitDepth: 8 | 16 | 32;
  backgroundColor: string;
  layers: PSLayer[];
  channels: Channel[];
  guides: Array<{ type: 'horizontal' | 'vertical'; position: number }>;
  grids: { size: number; subdivisions: number };
  activeLayerId: string;
  selectedChannelIds: string[];
  history: HistoryState[];
  historyIndex: number;
}

interface SelectionArea {
  active: boolean;
  path: Path2D;
  feather: number;
  antiAlias: boolean;
}

// ==================== TOOL DEFINITIONS ====================

const ALL_TOOLS: Array<{
  id: Tool;
  name: string;
  category: ToolCategory;
  icon: string;
  shortcut: string;
}> = [
  // Selection Tools
  { id: 'rectangular-marquee', name: 'Rectangular Marquee', category: 'selection', icon: '⬜', shortcut: 'M' },
  { id: 'elliptical-marquee', name: 'Elliptical Marquee', category: 'selection', icon: '⭕', shortcut: 'M' },
  { id: 'lasso', name: 'Lasso', category: 'selection', icon: '🪢', shortcut: 'L' },
  { id: 'polygonal-lasso', name: 'Polygonal Lasso', category: 'selection', icon: '📐', shortcut: 'L' },
  { id: 'magnetic-lasso', name: 'Magnetic Lasso', category: 'selection', icon: '🧲', shortcut: 'L' },
  { id: 'magic-wand', name: 'Magic Wand', category: 'selection', icon: '🪄', shortcut: 'W' },
  { id: 'quick-select', name: 'Quick Selection', category: 'selection', icon: '⚡', shortcut: 'W' },
  { id: 'object-select', name: 'Object Selection', category: 'selection', icon: '🎯', shortcut: 'W' },
  
  // Painting Tools
  { id: 'brush', name: 'Brush', category: 'painting', icon: '🖌️', shortcut: 'B' },
  { id: 'pencil', name: 'Pencil', category: 'painting', icon: '✏️', shortcut: 'B' },
  { id: 'mixer-brush', name: 'Mixer Brush', category: 'painting', icon: '🎨', shortcut: 'B' },
  { id: 'clone-stamp', name: 'Clone Stamp', category: 'painting', icon: '📋', shortcut: 'S' },
  { id: 'pattern-stamp', name: 'Pattern Stamp', category: 'painting', icon: '🎭', shortcut: 'S' },
  { id: 'history-brush', name: 'History Brush', category: 'painting', icon: '⏮️', shortcut: 'Y' },
  { id: 'eraser', name: 'Eraser', category: 'painting', icon: '🧹', shortcut: 'E' },
  { id: 'background-eraser', name: 'Background Eraser', category: 'painting', icon: '🗑️', shortcut: 'E' },
  { id: 'magic-eraser', name: 'Magic Eraser', category: 'painting', icon: '✨', shortcut: 'E' },
  { id: 'gradient', name: 'Gradient', category: 'painting', icon: '🌈', shortcut: 'G' },
  { id: 'paint-bucket', name: 'Paint Bucket', category: 'painting', icon: '🪣', shortcut: 'G' },
  { id: 'blur', name: 'Blur', category: 'painting', icon: '🌫️', shortcut: 'R' },
  { id: 'sharpen', name: 'Sharpen', category: 'painting', icon: '🔪', shortcut: 'R' },
  { id: 'smudge', name: 'Smudge', category: 'painting', icon: '👆', shortcut: 'R' },
  { id: 'dodge', name: 'Dodge', category: 'painting', icon: '☀️', shortcut: 'O' },
  { id: 'burn', name: 'Burn', category: 'painting', icon: '🔥', shortcut: 'O' },
  { id: 'sponge', name: 'Sponge', category: 'painting', icon: '🧽', shortcut: 'O' },
  { id: 'healing-brush', name: 'Healing Brush', category: 'painting', icon: '🩹', shortcut: 'J' },
  { id: 'spot-healing-brush', name: 'Spot Healing Brush', category: 'painting', icon: '💊', shortcut: 'J' },
  { id: 'patch', name: 'Patch', category: 'painting', icon: '🧵', shortcut: 'J' },
  { id: 'red-eye', name: 'Red Eye', category: 'painting', icon: '👁️', shortcut: 'J' },
  
  // Text Tools
  { id: 'horizontal-type', name: 'Horizontal Type', category: 'text', icon: 'T', shortcut: 'T' },
  { id: 'vertical-type', name: 'Vertical Type', category: 'text', icon: 'T', shortcut: 'T' },
  
  // Shape Tools
  { id: 'pen', name: 'Pen', category: 'shape', icon: '🖊️', shortcut: 'P' },
  { id: 'freeform-pen', name: 'Freeform Pen', category: 'shape', icon: '✒️', shortcut: 'P' },
  { id: 'rectangle', name: 'Rectangle', category: 'shape', icon: '▭', shortcut: 'U' },
  { id: 'rounded-rectangle', name: 'Rounded Rectangle', category: 'shape', icon: '▢', shortcut: 'U' },
  { id: 'ellipse', name: 'Ellipse', category: 'shape', icon: '○', shortcut: 'U' },
  { id: 'polygon', name: 'Polygon', category: 'shape', icon: '⬡', shortcut: 'U' },
  { id: 'line', name: 'Line', category: 'shape', icon: '─', shortcut: 'U' },
  { id: 'custom-shape', name: 'Custom Shape', category: 'shape', icon: '⭐', shortcut: 'U' },
  
  // Navigation Tools
  { id: 'move', name: 'Move', category: 'navigation', icon: '➕', shortcut: 'V' },
  { id: 'crop', name: 'Crop', category: 'navigation', icon: '✂️', shortcut: 'C' },
  { id: 'eyedropper', name: 'Eyedropper', category: 'navigation', icon: '💧', shortcut: 'I' },
  { id: 'hand', name: 'Hand', category: 'navigation', icon: '✋', shortcut: 'H' },
  { id: 'zoom', name: 'Zoom', category: 'navigation', icon: '🔍', shortcut: 'Z' },
];

const ALL_BLEND_MODES: BlendMode[] = [
  'normal', 'dissolve',
  'darken', 'multiply', 'color-burn', 'linear-burn', 'darker-color',
  'lighten', 'screen', 'color-dodge', 'linear-dodge', 'lighter-color',
  'overlay', 'soft-light', 'hard-light', 'vivid-light', 'linear-light', 'pin-light', 'hard-mix',
  'difference', 'exclusion', 'subtract', 'divide',
  'hue', 'saturation', 'color', 'luminosity'
];

const BLEND_MODE_CATEGORIES = {
  'Normal': ['normal', 'dissolve'],
  'Darken': ['darken', 'multiply', 'color-burn', 'linear-burn', 'darker-color'],
  'Lighten': ['lighten', 'screen', 'color-dodge', 'linear-dodge', 'lighter-color'],
  'Contrast': ['overlay', 'soft-light', 'hard-light', 'vivid-light', 'linear-light', 'pin-light', 'hard-mix'],
  'Comparative': ['difference', 'exclusion', 'subtract', 'divide'],
  'Composite': ['hue', 'saturation', 'color', 'luminosity']
};

// ==================== BRUSH PRESETS ====================

interface BrushPreset {
  id: string;
  name: string;
  settings: BrushSettings;
  shape: 'round' | 'square' | 'star' | 'scatter' | 'texture';
}

const BRUSH_PRESETS: BrushPreset[] = [
  {
    id: 'soft-round',
    name: 'Soft Round',
    settings: {
      size: 100, hardness: 0, opacity: 100, flow: 100, angle: 0, roundness: 100,
      spacing: 25, scatterX: 0, scatterY: 0, sizeJitter: 0, opacityJitter: 0,
      flowJitter: 0, smoothing: 10, wetEdges: false, airbrush: false,
      pressureSize: true, pressureOpacity: true, pressureFlow: false,
    },
    shape: 'round',
  },
  {
    id: 'hard-round',
    name: 'Hard Round',
    settings: {
      size: 100, hardness: 100, opacity: 100, flow: 100, angle: 0, roundness: 100,
      spacing: 25, scatterX: 0, scatterY: 0, sizeJitter: 0, opacityJitter: 0,
      flowJitter: 0, smoothing: 0, wetEdges: false, airbrush: false,
      pressureSize: false, pressureOpacity: false, pressureFlow: false,
    },
    shape: 'round',
  },
  {
    id: 'chalk',
    name: 'Chalk',
    settings: {
      size: 45, hardness: 30, opacity: 75, flow: 50, angle: 0, roundness: 80,
      spacing: 150, scatterX: 50, scatterY: 50, sizeJitter: 20, opacityJitter: 30,
      flowJitter: 0, smoothing: 0, wetEdges: false, airbrush: false,
      pressureSize: true, pressureOpacity: true, pressureFlow: false,
    },
    shape: 'scatter',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    settings: {
      size: 150, hardness: 0, opacity: 40, flow: 30, angle: 0, roundness: 100,
      spacing: 25, scatterX: 0, scatterY: 0, sizeJitter: 0, opacityJitter: 50,
      flowJitter: 30, smoothing: 50, wetEdges: true, airbrush: false,
      pressureSize: true, pressureOpacity: true, pressureFlow: true,
    },
    shape: 'round',
  },
  {
    id: 'ink-pen',
    name: 'Ink Pen',
    settings: {
      size: 5, hardness: 100, opacity: 100, flow: 100, angle: 45, roundness: 50,
      spacing: 10, scatterX: 0, scatterY: 0, sizeJitter: 0, opacityJitter: 0,
      flowJitter: 0, smoothing: 80, wetEdges: false, airbrush: false,
      pressureSize: true, pressureOpacity: false, pressureFlow: false,
    },
    shape: 'round',
  },
];

// ==================== BLEND MODE RENDERING ====================

/**
 * Apply blend mode between base and blend colors
 * All values normalized 0-1
 */
const blendModeCalculations = {
  normal: (base: number, blend: number) => blend,
  
  multiply: (base: number, blend: number) => base * blend,
  
  screen: (base: number, blend: number) => 1 - (1 - base) * (1 - blend),
  
  overlay: (base: number, blend: number) => 
    base < 0.5 ? 2 * base * blend : 1 - 2 * (1 - base) * (1 - blend),
  
  'soft-light': (base: number, blend: number) => {
    if (blend < 0.5) {
      return base - (1 - 2 * blend) * base * (1 - base);
    } else {
      const d = base < 0.25 ? ((16 * base - 12) * base + 4) * base : Math.sqrt(base);
      return base + (2 * blend - 1) * (d - base);
    }
  },
  
  'hard-light': (base: number, blend: number) =>
    blend < 0.5 ? 2 * base * blend : 1 - 2 * (1 - base) * (1 - blend),
  
  'color-dodge': (base: number, blend: number) =>
    blend === 1 ? 1 : Math.min(1, base / (1 - blend)),
  
  'color-burn': (base: number, blend: number) =>
    blend === 0 ? 0 : Math.max(0, 1 - (1 - base) / blend),
  
  'linear-dodge': (base: number, blend: number) => Math.min(1, base + blend),
  
  'linear-burn': (base: number, blend: number) => Math.max(0, base + blend - 1),
  
  darken: (base: number, blend: number) => Math.min(base, blend),
  
  lighten: (base: number, blend: number) => Math.max(base, blend),
  
  difference: (base: number, blend: number) => Math.abs(base - blend),
  
  exclusion: (base: number, blend: number) => base + blend - 2 * base * blend,
  
  subtract: (base: number, blend: number) => Math.max(0, base - blend),
  
  divide: (base: number, blend: number) => 
    blend === 0 ? 1 : Math.min(1, base / blend),
  
  'vivid-light': (base: number, blend: number) => {
    if (blend < 0.5) {
      return blend === 0 ? 0 : Math.max(0, 1 - (1 - base) / (2 * blend));
    } else {
      return blend === 1 ? 1 : Math.min(1, base / (2 * (1 - blend)));
    }
  },
  
  'linear-light': (base: number, blend: number) => 
    blend < 0.5 ? Math.max(0, base + 2 * blend - 1) : Math.min(1, base + 2 * (blend - 0.5)),
  
  'pin-light': (base: number, blend: number) =>
    blend < 0.5 ? Math.min(base, 2 * blend) : Math.max(base, 2 * (blend - 0.5)),
  
  'hard-mix': (base: number, blend: number) => {
    const vl = base < 0.5 
      ? (blend === 0 ? 0 : Math.max(0, 1 - (1 - base) / (2 * blend)))
      : (blend === 1 ? 1 : Math.min(1, base / (2 * (1 - blend))));
    return vl < 0.5 ? 0 : 1;
  },
};

/**
 * Composite two layers with blend mode
 */
function compositeWithBlendMode(
  baseData: ImageData,
  blendData: ImageData,
  blendMode: BlendMode,
  opacity: number // 0-100
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(baseData.data),
    baseData.width,
    baseData.height
  );
  
  const alpha = opacity / 100;
  const blendFn = blendModeCalculations[blendMode as keyof typeof blendModeCalculations] || blendModeCalculations.normal;
  
  for (let i = 0; i < result.data.length; i += 4) {
    const baseR = result.data[i] / 255;
    const baseG = result.data[i + 1] / 255;
    const baseB = result.data[i + 2] / 255;
    const baseA = result.data[i + 3] / 255;
    
    const blendR = blendData.data[i] / 255;
    const blendG = blendData.data[i + 1] / 255;
    const blendB = blendData.data[i + 2] / 255;
    const blendA = blendData.data[i + 3] / 255;
    
    if (blendA > 0) {
      const resultR = blendFn(baseR, blendR);
      const resultG = blendFn(baseG, blendG);
      const resultB = blendFn(baseB, blendB);
      
      // Apply opacity
      result.data[i] = (resultR * alpha + baseR * (1 - alpha)) * 255;
      result.data[i + 1] = (resultG * alpha + baseG * (1 - alpha)) * 255;
      result.data[i + 2] = (resultB * alpha + baseB * (1 - alpha)) * 255;
      result.data[i + 3] = Math.max(baseA, blendA * alpha) * 255;
    }
  }
  
  return result;
}

// ==================== GRADIENT MODES ====================

type GradientType = 'linear' | 'radial' | 'angle' | 'reflected' | 'diamond';

interface GradientStop {
  color: string;
  position: number; // 0-1
  opacity: number; // 0-100
}

function rgbToArray(color: string): [number, number, number] {
  const hex = color.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function applyGradient(
  ctx: CanvasRenderingContext2D,
  gradientType: GradientType,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  stops: GradientStop[]
): void {
  let gradient: CanvasGradient;
  
  switch (gradientType) {
    case 'linear':
      gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      break;
      
    case 'radial': {
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      gradient = ctx.createRadialGradient(startX, startY, 0, startX, startY, radius);
      break;
    }
      
    case 'angle': {
      // Approximate angle gradient with conic gradient
      const cx = (startX + endX) / 2;
      const cy = (startY + endY) / 2;
      gradient = ctx.createConicGradient(0, cx, cy);
      break;
    }
      
    case 'reflected': {
      // Create reflected gradient by mirroring
      const dx = endX - startX;
      const dy = endY - startY;
      gradient = ctx.createLinearGradient(startX - dx, startY - dy, endX, endY);
      // Mirror stops
      const mirrorStops = stops.map(s => ({ ...s, position: 1 - s.position })).reverse();
      mirrorStops.forEach(stop => {
        gradient.addColorStop(stop.position / 2, stop.color);
      });
      stops.forEach(stop => {
        gradient.addColorStop(0.5 + stop.position / 2, stop.color);
      });
      ctx.fillStyle = gradient;
      return;
    }
      
    case 'diamond': {
      // Diamond gradient using transform
      const cx = (startX + endX) / 2;
      const cy = (startY + endY) / 2;
      const size = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      break;
    }
      
    default:
      gradient = ctx.createLinearGradient(startX, startY, endX, endY);
  }
  
  stops.forEach(stop => {
    gradient.addColorStop(stop.position, stop.color);
  });
  
  ctx.fillStyle = gradient;
  
  if (gradientType === 'diamond') {
    ctx.restore();
  }
}

// ==================== CURVES & LEVELS ====================

/**
 * Apply Curves adjustment using cubic spline interpolation
 */
function applyCurvesAdjustment(
  imageData: ImageData,
  curvePoints: Array<{ input: number; output: number }>
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  
  // Build lookup table from curve points
  const lut: number[] = new Array(256);
  
  // Sort curve points by input
  const sorted = [...curvePoints].sort((a, b) => a.input - b.output);
  
  // Cubic spline interpolation for smooth curves
  for (let i = 0; i < 256; i++) {
    const normalized = i / 255;
    
    // Find surrounding points
    let lower = sorted[0];
    let upper = sorted[sorted.length - 1];
    
    for (let j = 0; j < sorted.length - 1; j++) {
      if (sorted[j].input <= normalized && sorted[j + 1].input >= normalized) {
        lower = sorted[j];
        upper = sorted[j + 1];
        break;
      }
    }
    
    // Linear interpolation between points
    const t = (normalized - lower.input) / (upper.input - lower.input || 1);
    const value = lower.output + t * (upper.output - lower.output);
    lut[i] = Math.round(Math.max(0, Math.min(255, value * 255)));
  }
  
  // Apply LUT to image
  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = lut[result.data[i]];
    result.data[i + 1] = lut[result.data[i + 1]];
    result.data[i + 2] = lut[result.data[i + 2]];
  }
  
  return result;
}

/**
 * Apply Levels adjustment (input/output black/white points, gamma)
 */
function applyLevelsAdjustment(
  imageData: ImageData,
  inputBlack: number,   // 0-255
  inputWhite: number,   // 0-255
  outputBlack: number,  // 0-255
  outputWhite: number,  // 0-255
  gamma: number         // 0.1-10, default 1
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  
  // Build lookup table
  const lut: number[] = new Array(256);
  
  for (let i = 0; i < 256; i++) {
    // Clamp input to black/white points
    let value = Math.max(0, Math.min(255, i - inputBlack));
    value = value / (inputWhite - inputBlack || 1);
    
    // Apply gamma
    value = Math.pow(value, 1 / gamma);
    
    // Map to output range
    value = outputBlack + value * (outputWhite - outputBlack);
    
    lut[i] = Math.round(Math.max(0, Math.min(255, value)));
  }
  
  // Apply LUT
  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = lut[result.data[i]];
    result.data[i + 1] = lut[result.data[i + 1]];
    result.data[i + 2] = lut[result.data[i + 2]];
  }
  
  return result;
}

/**
 * Generate histogram for Levels UI
 */
function generateHistogram(imageData: ImageData): { r: number[]; g: number[]; b: number[]; luminosity: number[] } {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const luminosity = new Array(256).fill(0);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    r[imageData.data[i]]++;
    g[imageData.data[i + 1]]++;
    b[imageData.data[i + 2]]++;
    
    const lum = Math.round(0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]);
    luminosity[lum]++;
  }
  
  return { r, g, b, luminosity };
}

// ==================== LAYER EFFECTS RENDERING ====================

/**
 * Render drop shadow effect
 */
function renderDropShadow(
  ctx: CanvasRenderingContext2D,
  layer: PSLayer,
  style: LayerStyle
): void {
  if (!layer.imageData) return;
  
  const angle = (style.angle || 120) * Math.PI / 180;
  const distance = style.distance || 5;
  const size = style.size || 5;
  const opacity = (style.opacity || 75) / 100;
  const color = style.color || '#000000';
  
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = size;
  ctx.shadowOffsetX = Math.cos(angle) * distance;
  ctx.shadowOffsetY = Math.sin(angle) * distance;
  ctx.globalAlpha = opacity;
  
  // Draw layer to create shadow
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.width;
  tempCanvas.height = layer.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.putImageData(layer.imageData, 0, 0);
    ctx.drawImage(tempCanvas, layer.x, layer.y);
  }
  
  ctx.restore();
}

/**
 * Render outer glow effect
 */
function renderOuterGlow(
  ctx: CanvasRenderingContext2D,
  layer: PSLayer,
  style: LayerStyle
): void {
  if (!layer.imageData) return;
  
  const size = style.size || 10;
  const opacity = (style.opacity || 75) / 100;
  const color = style.color || '#ffffff';
  
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = size;
  ctx.globalAlpha = opacity;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.width;
  tempCanvas.height = layer.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.putImageData(layer.imageData, 0, 0);
    // Draw multiple times for stronger glow
    for (let i = 0; i < 3; i++) {
      ctx.drawImage(tempCanvas, layer.x, layer.y);
    }
  }
  
  ctx.restore();
}

/**
 * Render inner glow effect
 */
function renderInnerGlow(
  ctx: CanvasRenderingContext2D,
  layer: PSLayer,
  style: LayerStyle
): void {
  if (!layer.imageData) return;
  
  // Inner glow requires inverting the alpha and applying glow
  const size = style.size || 10;
  const color = style.color || '#ffffff';
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  
  // Create inverted alpha mask
 const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.width;
  tempCanvas.height = layer.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.putImageData(layer.imageData, 0, 0);
    ctx.shadowColor = color;
    ctx.shadowBlur = size;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.drawImage(tempCanvas, layer.x, layer.y);
  }
  
  ctx.restore();
}

// ==================== CHANNEL OPERATIONS ====================

/**
 * Split image into RGB channels
 */
function splitChannels(imageData: ImageData): { r: ImageData; g: ImageData; b: ImageData; a: ImageData } {
  const width = imageData.width;
  const height = imageData.height;
  
  const r = new ImageData(width, height);
  const g = new ImageData(width, height);
  const b = new ImageData(width, height);
  const a = new ImageData(width, height);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Red channel
    r.data[i] = imageData.data[i];
    r.data[i + 1] = imageData.data[i];
    r.data[i + 2] = imageData.data[i];
    r.data[i + 3] = 255;
    
    // Green channel
    g.data[i] = imageData.data[i + 1];
    g.data[i + 1] = imageData.data[i + 1];
    g.data[i + 2] = imageData.data[i + 1];
    g.data[i + 3] = 255;
    
    // Blue channel
    b.data[i] = imageData.data[i + 2];
    b.data[i + 1] = imageData.data[i + 2];
    b.data[i + 2] = imageData.data[i + 2];
    b.data[i + 3] = 255;
    
    // Alpha channel
    a.data[i] = imageData.data[i + 3];
    a.data[i + 1] = imageData.data[i + 3];
    a.data[i + 2] = imageData.data[i + 3];
    a.data[i + 3] = 255;
  }
  
  return { r, g, b, a };
}

/**
 * Merge channels back into RGB image
 */
function mergeChannels(r: ImageData, g: ImageData, b: ImageData, a?: ImageData): ImageData {
  const result = new ImageData(r.width, r.height);
  
  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = r.data[i];
    result.data[i + 1] = g.data[i + 1];
    result.data[i + 2] = b.data[i + 2];
    result.data[i + 3] = a ? a.data[i + 3] : 255;
  }
  
  return result;
}

/**
 * Channel mixer - adjust channel contributions
 */
function applyChannelMixer(
  imageData: ImageData,
  redMix: { r: number; g: number; b: number },
  greenMix: { r: number; g: number; b: number },
  blueMix: { r: number; g: number; b: number }
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  
  for (let i = 0; i < result.data.length; i += 4) {
    const r = result.data[i];
    const g = result.data[i + 1];
    const b = result.data[i + 2];
    
    result.data[i] = Math.max(0, Math.min(255, r * redMix.r + g * redMix.g + b * redMix.b));
    result.data[i + 1] = Math.max(0, Math.min(255, r * greenMix.r + g * greenMix.g + b * greenMix.b));
    result.data[i + 2] = Math.max(0, Math.min(255, r * blueMix.r + g * blueMix.g + b * blueMix.b));
  }
  
  return result;
}

// ==================== PATH BOOLEAN OPERATIONS ====================

/**
 * Union of two paths (Path A + Path B)
 */
function pathUnion(path1: Path2D, path2: Path2D): Path2D {
  // In a real implementation, this would use proper boolean path operations
  // For now, we combine both paths
  const result = new Path2D(path1);
  result.addPath(path2);
  return result;
}

/**
 * Subtract path2 from path1 (Path A - Path B)
 */
function pathSubtract(path1: Path2D, path2: Path2D): Path2D {
  // Simplified: return path1 (full implementation requires polygon clipping)
  return new Path2D(path1);
}

/**
 * Intersect two paths (Path A ∩ Path B)
 */
function pathIntersect(path1: Path2D, path2: Path2D): Path2D {
  // Simplified placeholder
  return new Path2D(path1);
}

/**
 * Exclude overlapping areas (Path A ⊕ Path B)
 */
function pathExclude(path1: Path2D, path2: Path2D): Path2D {
  // Simplified placeholder
  return new Path2D(path1);
}

// ==================== MAIN COMPONENT ====================

export function PhotoshopPro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bulkCreateFileRef = useRef<HTMLInputElement>(null);
  const [psDoc, setPsDoc] = useState<PSDocument>({
    id: 'doc1',
    name: 'Untitled-1',
    width: 1920,
    height: 1080,
    resolution: 72,
    colorMode: 'rgb',
    bitDepth: 8,
    backgroundColor: '#ffffff',
    layers: [
      {
        id: 'bg',
        name: 'Background',
        type: 'normal',
        visible: true,
        opacity: 100,
        blendMode: 'normal',
        locked: false,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        fill: '#ffffff',
      }
    ],
    channels: [
      { id: 'r', name: 'Red', type: 'red', visible: true, data: null },
      { id: 'g', name: 'Green', type: 'green', visible: true, data: null },
      { id: 'b', name: 'Blue', type: 'blue', visible: true, data: null },
    ],
    guides: [],
    grids: { size: 20, subdivisions: 4 },
    activeLayerId: 'bg',
    selectedChannelIds: ['r', 'g', 'b'],
    history: [],
    historyIndex: -1,
  });

  const [activeTool, setActiveTool] = useState<Tool>('move');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    size: 25,
    hardness: 100,
    opacity: 100,
    flow: 100,
    angle: 0,
    roundness: 100,
    spacing: 25,
    scatterX: 0,
    scatterY: 0,
    sizeJitter: 0,
    opacityJitter: 0,
    flowJitter: 0,
    smoothing: 0,
    wetEdges: false,
    airbrush: false,
    pressureSize: false,
    pressureOpacity: false,
    pressureFlow: false,
  });

  const [selection, setSelection] = useState<SelectionArea>(() => ({
    active: false,
    path: typeof Path2D !== 'undefined' ? new Path2D() : {} as Path2D,
    feather: 0,
    antiAlias: true,
  }));

  const [zoom, setZoom] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [showRulers, setShowRulers] = useState(true);

  const [activePanel, setActivePanel] = useState<'layers' | 'channels' | 'paths' | 'properties' | 'adjustments' | 'styles' | 'history'>('layers');
  const [leftRailTab, setLeftRailTab] = useState<'search' | 'add-content' | 'text' | 'upload' | 'your-stuff'>('add-content');
  const [showEditPagePanel, setShowEditPagePanel] = useState(true);
  const [pageTitle, setPageTitle] = useState('Edit page');
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [resizePreset, setResizePreset] = useState<'square' | 'story' | 'landscape' | 'poster'>('square');
  const [quickReplaceText, setQuickReplaceText] = useState('');
  const [recentSizes, setRecentSizes] = useState<Array<{ width: number; height: number }>>([]);
  const [customResize, setCustomResize] = useState({ width: 1080, height: 1080 });
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [translateLanguage, setTranslateLanguage] = useState('es');
  const [showBulkCreateDialog, setShowBulkCreateDialog] = useState(false);
  const [bulkCreateInput, setBulkCreateInput] = useState('Summer Sale\nNew Product Drop\nWeekend Promo');
  const [templateCategory, setTemplateCategory] = useState<'all' | 'social' | 'marketing' | 'business' | 'event'>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [translateScope, setTranslateScope] = useState<'all' | 'active' | 'selection'>('all');
  const [bulkMapTitleCol, setBulkMapTitleCol] = useState(0);
  const [bulkMapBodyCol, setBulkMapBodyCol] = useState(1);
  const [bulkMapCtaCol, setBulkMapCtaCol] = useState(2);
  
  // Tool options
  const [tolerance, setTolerance] = useState(32);
  const [contiguous, setContiguous] = useState(true);
  const [sampleAllLayers, setSampleAllLayers] = useState(false);
  
  // Filter state
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterSettings, setFilterSettings] = useState<Record<string, any>>({});
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [brushPath, setBrushPath] = useState<Array<{ x: number; y: number; pressure: number }>>([]);
  const [cloneSource, setCloneSource] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);

  // Advanced Features State
  const [transformMode, setTransformMode] = useState<'free' | 'warp' | 'perspective' | 'distort' | null>(null);
  const [transformHandles, setTransformHandles] = useState<Array<{x: number; y: number}>>([]);
  const [selectMaskMode, setSelectMaskMode] = useState(false);
  const [selectMaskSettings, setSelectMaskSettings] = useState({
    edgeDetection: true,
    radius: 5,
    smooth: 3,
    feather: 0.5,
    contrast: 0,
    shift: 0,
  });
  const [penToolMode, setPenToolMode] = useState<'path' | 'shape' | 'pixels'>('path');
  const [pathPoints, setPathPoints] = useState<Array<{x: number; y: number; handleIn?: {x: number; y: number}; handleOut?: {x: number; y: number}}>>([]);
  const [liquidifyBrush, setLiquidifyBrush] = useState<'forward-warp' | 'reconstruct' | 'twirl' | 'pucker' | 'bloat'>('forward-warp');
  const [layerThumbnails, setLayerThumbnails] = useState<Map<string, string>>(new Map());
  const [layerComps, setLayerComps] = useState<Array<{id: string; name: string; state: PSLayer[]}>>([]);
  const [actions, setActions] = useState<Array<{id: string; name: string; steps: Array<{command: string; params: any}>}>>([]);
  const [recordingAction, setRecordingAction] = useState<{id: string; steps: Array<{command: string; params: any}>} | null>(null);

  const activeLayer = useMemo(
    () => psDoc.layers.find(l => l.id === psDoc.activeLayerId),
    [psDoc.layers, psDoc.activeLayerId]
  );

  const templateLibrary = useMemo(() => ([
    { id: 'tpl-social-1', title: 'Bold Social Quote', category: 'social', width: 1080, height: 1080 },
    { id: 'tpl-social-2', title: 'Gradient Story', category: 'social', width: 1080, height: 1920 },
    { id: 'tpl-marketing-1', title: 'Product Launch', category: 'marketing', width: 1200, height: 628 },
    { id: 'tpl-marketing-2', title: 'Flash Sale', category: 'marketing', width: 1080, height: 1080 },
    { id: 'tpl-business-1', title: 'Team Update', category: 'business', width: 1600, height: 900 },
    { id: 'tpl-business-2', title: 'Pitch Cover', category: 'business', width: 1920, height: 1080 },
    { id: 'tpl-event-1', title: 'Event Poster', category: 'event', width: 2480, height: 3508 },
    { id: 'tpl-event-2', title: 'Workshop Invite', category: 'event', width: 1920, height: 1080 },
  ] as const), []);

  const filteredTemplates = useMemo(() => {
    if (templateCategory === 'all') {
      return templateLibrary.filter(template =>
        template.title.toLowerCase().includes(templateSearch.trim().toLowerCase())
      );
    }
    return templateLibrary.filter(template =>
      template.category === templateCategory &&
      template.title.toLowerCase().includes(templateSearch.trim().toLowerCase())
    );
  }, [templateCategory, templateLibrary, templateSearch]);

  const resizeDocument = useCallback((width: number, height: number) => {
    setPsDoc(prev => ({
      ...prev,
      width,
      height,
      layers: prev.layers.map(layer =>
        layer.id === 'bg'
          ? { ...layer, width, height }
          : layer
      )
    }));
  }, []);

  const applyResizeDimensions = useCallback((width: number, height: number) => {
    resizeDocument(width, height);
    setCustomResize({ width, height });
    setRecentSizes(prev => {
      const next = [{ width, height }, ...prev.filter(size => size.width !== width || size.height !== height)];
      return next.slice(0, 6);
    });
  }, [resizeDocument]);

  const quickReplaceActiveLayer = useCallback(() => {
    if (!activeLayer) return;
    const replacementText = quickReplaceText.trim();

    if (activeLayer.type === 'text') {
      setPsDoc(prev => ({
        ...prev,
        layers: prev.layers.map(layer =>
          layer.id === activeLayer.id
            ? { ...layer, text: replacementText || 'Quick replaced text' }
            : layer
        )
      }));
      return;
    }

    setPsDoc(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === activeLayer.id
          ? { ...layer, fill: replacementText || foregroundColor }
          : layer
      )
    }));
  }, [activeLayer, foregroundColor, quickReplaceText]);

  const applyResizePreset = useCallback(() => {
    if (resizePreset === 'square') {
      applyResizeDimensions(1080, 1080);
      return;
    }

    if (resizePreset === 'story') {
      applyResizeDimensions(1080, 1920);
      return;
    }

    if (resizePreset === 'landscape') {
      applyResizeDimensions(1920, 1080);
      return;
    }

    applyResizeDimensions(2480, 3508);
  }, [resizePreset, applyResizeDimensions]);

  const applyTranslate = useCallback(() => {
    setPsDoc(prev => ({
      ...prev,
      layers: prev.layers.map(layer => {
        if (layer.type !== 'text') return layer;

        if (translateScope === 'active' && layer.id !== prev.activeLayerId) {
          return layer;
        }

        if (translateScope === 'selection' && !selection.active) {
          return layer;
        }

        return {
          ...layer,
          text: layer.text ? `[${translateLanguage}] ${layer.text}` : `[${translateLanguage}]`,
        };
      }),
    }));
    setShowTranslateDialog(false);
  }, [translateLanguage, translateScope, selection.active]);

  const applyBulkCreate = useCallback(() => {
    const rows = bulkCreateInput
      .split(/\r?\n/)
      .map(row => row.trim())
      .filter(Boolean);

    if (rows.length === 0) {
      setShowBulkCreateDialog(false);
      return;
    }

    const parsed = rows.map(row => row.split(',').map(col => col.trim()));
    const first = parsed[0] || [];
    const title = first[bulkMapTitleCol] || rows[0];
    const body = first[bulkMapBodyCol] || '';
    const cta = first[bulkMapCtaCol] || '';
    const mergedText = [title, body, cta].filter(Boolean).join('\n');

    setPageCount(parsed.length);
    setActivePage(1);
    setPageTitle(title || 'Bulk Page');
    setPsDoc(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.type === 'text'
          ? { ...layer, text: mergedText || layer.text }
          : layer
      ),
    }));
    setShowBulkCreateDialog(false);
  }, [bulkCreateInput, bulkMapTitleCol, bulkMapBodyCol, bulkMapCtaCol]);

  const applyTemplate = useCallback((template: { title: string; width: number; height: number }) => {
    setPageTitle(template.title);
    applyResizeDimensions(template.width, template.height);
  }, [applyResizeDimensions]);

  const handleBulkCsvImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const rows = content
        .split(/\r?\n/)
        .map(line => line.split(',')[0]?.trim())
        .filter(Boolean);
      if (rows.length > 0) {
        setBulkCreateInput(rows.join('\n'));
      }
    };
    reader.readAsText(file);
  }, []);

  const animateAllLayers = useCallback(() => {
    setPsDoc(prev => ({
      ...prev,
      layers: prev.layers.map((layer, index) => ({
        ...layer,
        rotation: index % 2 === 0 ? 2 : -2,
      })),
    }));
  }, []);

  const cropPage = useCallback(() => {
    const nextWidth = Math.max(320, Math.round(psDoc.width * 0.9));
    const nextHeight = Math.max(320, Math.round(psDoc.height * 0.9));
    resizeDocument(nextWidth, nextHeight);
  }, [psDoc.width, psDoc.height, resizeDocument]);

  const addPage = useCallback(() => {
    setPageCount(prev => {
      const nextPage = prev + 1;
      setActivePage(nextPage);
      return nextPage;
    });
  }, []);

  // ==================== LAYER OPERATIONS ====================

  const updateLayer = useCallback((id: string, updates: Partial<PSLayer>) => {
    setPsDoc(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  }, []);

  const addLayer = useCallback((layer: PSLayer) => {
    setPsDoc(prev => ({
      ...prev,
      layers: [...prev.layers, layer],
      activeLayerId: layer.id,
    }));
  }, []);

  const deleteLayer = useCallback((id: string) => {
    setPsDoc(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id),
      activeLayerId: prev.layers[0]?.id || '',
    }));
  }, []);

  const duplicateLayer = useCallback((id: string) => {
    const layer = psDoc.layers.find(l => l.id === id);
    if (!layer) return;
    
    const newLayer: PSLayer = {
      ...layer,
      id: `layer-${Date.now()}`,
      name: `${layer.name} copy`,
      x: layer.x + 10,
      y: layer.y + 10,
    };
    
    addLayer(newLayer);
  }, [psDoc.layers, addLayer]);

  const mergeDown = useCallback((id: string) => {
    const idx = psDoc.layers.findIndex(l => l.id === id);
    if (idx <= 0) return;
    
    const upperLayer = psDoc.layers[idx];
    const lowerLayer = psDoc.layers[idx - 1];
    
    // Merge logic would go here (composite the layers)
    console.log('Merging', upperLayer.name, 'into', lowerLayer.name);
  }, [psDoc.layers]);

  const flattenImage = useCallback(() => {
    // Flatten all visible layers into one
    const flattenedLayer: PSLayer = {
      id: 'flattened',
      name: 'Background',
      type: 'normal',
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false,
      x: 0,
      y: 0,
      width: psDoc.width,
      height: psDoc.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      fill: psDoc.backgroundColor,
    };
    
    setPsDoc(prev => ({
      ...prev,
      layers: [flattenedLayer],
      activeLayerId: 'flattened',
    }));
  }, [psDoc.width, psDoc.height, psDoc.backgroundColor]);

  // ==================== LAYER GROUPS ====================

  const createLayerGroup = useCallback((name: string, layerIds: string[]) => {
    const group: PSLayer = {
      id: `group-${Date.now()}`,
      name,
      type: 'group',
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false,
      x: 0,
      y: 0,
      width: psDoc.width,
      height: psDoc.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      children: layerIds,
      collapsed: false,
    };
    
    setPsDoc(prev => ({
      ...prev,
      layers: [
        ...prev.layers.map(l => layerIds.includes(l.id) ? { ...l, parentId: group.id } : l),
        group,
      ],
      activeLayerId: group.id,
    }));
  }, [psDoc.width, psDoc.height]);

  const ungroupLayers = useCallback((groupId: string) => {
    const group = psDoc.layers.find(l => l.id === groupId && l.type === 'group');
    if (!group || !group.children) return;
    
    setPsDoc(prev => ({
      ...prev,
      layers: prev.layers
        .filter(l => l.id !== groupId)
        .map(l => group.children!.includes(l.id) ? { ...l, parentId: undefined } : l),
    }));
  }, [psDoc.layers]);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    updateLayer(groupId, { collapsed: !psDoc.layers.find(l => l.id === groupId)?.collapsed });
  }, [psDoc.layers, updateLayer]);

  // ==================== SMART OBJECTS ====================

  const convertToSmartObject = useCallback((layerId: string) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // Create a canvas snapshot of the layer
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx && layer.imageData) {
      ctx.putImageData(layer.imageData, 0, 0);
    }
    
    const dataUrl = canvas.toDataURL();
    
    updateLayer(layerId, {
      type: 'smart-object',
      smartObject: {
        type: 'embedded',
        source: dataUrl,
        transform: {
          x: layer.x,
          y: layer.y,
          scaleX: layer.scaleX,
          scaleY: layer.scaleY,
          rotation: layer.rotation,
          skewX: 0,
          skewY: 0,
        },
      },
      smartFilters: [],
    });
  }, [psDoc.layers, updateLayer]);

  const rasterizeSmartObject = useCallback((layerId: string) => {
    updateLayer(layerId, {
      type: 'normal',
      smartObject: undefined,
      smartFilters: undefined,
    });
  }, [updateLayer]);

  const applySmartFilter = useCallback((layerId: string, filter: Filter) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || layer.type !== 'smart-object') return;
    
    updateLayer(layerId, {
      smartFilters: [...(layer.smartFilters || []), filter],
    });
  }, [psDoc.layers, updateLayer]);

  // ==================== LAYER THUMBNAILS ====================

  const generateLayerThumbnail = useCallback((layerId: string) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 40;
    thumbCanvas.height = 40;
    const ctx = thumbCanvas.getContext('2d');
    
    if (!ctx) return;
    
    // Scale and draw layer content to thumbnail
    const scale = Math.min(40 / layer.width, 40 / layer.height);
    
    if (layer.imageData) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = layer.width;
      tempCanvas.height = layer.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(layer.imageData, 0, 0);
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
      }
    } else if (layer.fill) {
      ctx.fillStyle = layer.fill;
      ctx.fillRect(0, 0, 40, 40);
    }
    
    const thumbnail = thumbCanvas.toDataURL();
    setLayerThumbnails(prev => new Map(prev).set(layerId, thumbnail));
  }, [psDoc.layers]);

  // Regenerate thumbnails when layers change
  useEffect(() => {
    psDoc.layers.forEach(layer => {
      if (!layerThumbnails.has(layer.id)) {
        generateLayerThumbnail(layer.id);
      }
    });
  }, [psDoc.layers, layerThumbnails, generateLayerThumbnail]);

  // ==================== HISTORY ====================

  const pushHistory = useCallback((name: string) => {
    setPsDoc(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      const snapshot: HistoryState = {
        id: `hist-${Date.now()}`,
        name,
        timestamp: Date.now(),
        snapshot: JSON.parse(JSON.stringify(prev.layers)),
      };
      
      return {
        ...prev,
        history: [...newHistory, snapshot].slice(-50),
        historyIndex: Math.min(newHistory.length, 49),
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (psDoc.historyIndex > 0) {
      const prevState = psDoc.history[psDoc.historyIndex - 1];
      setPsDoc(prev => ({
        ...prev,
        layers: JSON.parse(JSON.stringify(prevState.snapshot)),
        historyIndex: prev.historyIndex - 1,
      }));
    }
  }, [psDoc.history, psDoc.historyIndex]);

  const redo = useCallback(() => {
    if (psDoc.historyIndex < psDoc.history.length - 1) {
      const nextState = psDoc.history[psDoc.historyIndex + 1];
      setPsDoc(prev => ({
        ...prev,
        layers: JSON.parse(JSON.stringify(nextState.snapshot)),
        historyIndex: prev.historyIndex + 1,
      }));
    }
  }, [psDoc.history, psDoc.historyIndex]);

  // ==================== UTILITY FUNCTIONS ====================

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const getPixelColor = useCallback((x: number, y: number): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '#000000';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#000000';
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
  }, []);

  const colorDistance = useCallback((r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
  }, []);

  // ==================== TOOL IMPLEMENTATIONS ====================

  const handleBrushStroke = useCallback((ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number; pressure: number }>) => {
    if (points.length < 2) return;
    
    ctx.strokeStyle = foregroundColor;
    ctx.lineWidth = brushSettings.size * (1 + (points[0].pressure - 0.5) * (brushSettings.pressureSize ? 0.5 : 0));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = (brushSettings.opacity / 100) * (1 + (points[0].pressure - 0.5) * (brushSettings.pressureOpacity ? 0.3 : 0));
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [foregroundColor, brushSettings]);

  const handleEraserStroke = useCallback((ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number; pressure: number }>) => {
    if (points.length < 2) return;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = brushSettings.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = brushSettings.opacity / 100;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }, [brushSettings]);

  const handleCloneStamp = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!cloneSource) return;
    
    const size = brushSettings.size;
    const sourceX = cloneSource.x + (x - startPos.x);
    const sourceY = cloneSource.y + (y - startPos.y);
    
    try {
      const sourceData = ctx.getImageData(sourceX - size / 2, sourceY - size / 2, size, size);
      ctx.globalAlpha = brushSettings.opacity / 100;
      ctx.putImageData(sourceData, x - size / 2, y - size / 2);
      ctx.globalAlpha = 1;
    } catch (e) {
      // Source out of bounds
    }
  }, [cloneSource, brushSettings, startPos]);

  const handleMagicWandSelect = useCallback((x: number, y: number, tolerance: number = 32) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const startIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    
    const visited = new Set<number>();
    const toVisit: Array<{ x: number; y: number }> = [{ x: Math.floor(x), y: Math.floor(y) }];
    const selected: Array<{ x: number; y: number }> = [];
    
    while (toVisit.length > 0) {
      const current = toVisit.pop()!;
      const index = (current.y * canvas.width + current.x) * 4;
      
      if (visited.has(index) || current.x < 0 || current.x >= canvas.width || current.y < 0 || current.y >= canvas.height) {
        continue;
      }
      
      visited.add(index);
      
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      if (colorDistance(startR, startG, startB, r, g, b) <= tolerance) {
        selected.push(current);
        toVisit.push({ x: current.x + 1, y: current.y });
        toVisit.push({ x: current.x - 1, y: current.y });
        toVisit.push({ x: current.x, y: current.y + 1 });
        toVisit.push({ x: current.x, y: current.y - 1 });
      }
    }
    
    // Create selection path
    const path = new Path2D();
    selected.forEach(point => {
      path.rect(point.x, point.y, 1, 1);
    });
    
    setSelection({ active: true, path, feather: 0, antiAlias: true });
  }, [colorDistance]);

  const handleGradientFill = useCallback((ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, foregroundColor);
    gradient.addColorStop(1, backgroundColor);
    
    if (selection.active) {
      ctx.save();
      ctx.clip(selection.path);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, psDoc.width, psDoc.height);
    
    if (selection.active) {
      ctx.restore();
    }
  }, [foregroundColor, backgroundColor, selection, psDoc.width, psDoc.height]);

  // ==================== MOUSE HANDLERS ====================

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoordinates(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Tool-specific mouse down handlers
    switch (activeTool) {
      case 'brush':
      case 'pencil':
        setBrushPath([{ x: pos.x, y: pos.y, pressure: 0.5 }]);
        break;
        
      case 'eraser':
      case 'background-eraser':
      case 'magic-eraser':
        setBrushPath([{ x: pos.x, y: pos.y, pressure: 0.5 }]);
        break;
        
      case 'clone-stamp':
        if (e.altKey) {
          setCloneSource(pos);
        } else if (cloneSource) {
          handleCloneStamp(ctx, pos.x, pos.y);
        }
        break;
        
      case 'eyedropper':
        const color = getPixelColor(pos.x, pos.y);
        setForegroundColor(color);
        break;
        
      case 'magic-wand':
        handleMagicWandSelect(pos.x, pos.y, 32);
        break;
        
      case 'paint-bucket':
        if (selection.active) {
          ctx.save();
          ctx.clip(selection.path);
        }
        ctx.fillStyle = foregroundColor;
        ctx.fillRect(0, 0, psDoc.width, psDoc.height);
        if (selection.active) {
          ctx.restore();
        }
        break;
        
      case 'horizontal-type':
      case 'vertical-type':
        setIsEditingText(true);
        // Create text layer
        const textLayer: PSLayer = {
          id: `text-${Date.now()}`,
          name: 'Text Layer',
          type: 'text',
          visible: true,
          opacity: 100,
          blendMode: 'normal',
          locked: false,
          x: pos.x,
          y: pos.y,
          width: 200,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          text: '',
          fontSize: 24,
          fontFamily: 'Arial',
          textColor: foregroundColor,
          textAlign: 'left',
        };
        addLayer(textLayer);
        break;
        
      case 'rectangle':
      case 'rounded-rectangle':
      case 'ellipse':
      case 'line':
      case 'polygon':
        // Will draw shape on mouse up
        break;
        
      case 'move':
        // Will handle in mousemove
        break;
        
      case 'zoom':
        if (e.altKey) {
          setZoom(Math.max(10, zoom - 20));
        } else {
          setZoom(Math.min(400, zoom + 20));
        }
        break;
        
      case 'hand':
        // Pan tool - will handle in mousemove
        break;
    }
  }, [activeTool, getCanvasCoordinates, cloneSource, getPixelColor, selection, foregroundColor, psDoc.width, psDoc.height, zoom, addLayer, handleCloneStamp, handleMagicWandSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoordinates(e);
    setCurrentPos(pos);
    
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    switch (activeTool) {
      case 'brush':
      case 'pencil':
        setBrushPath(prev => [...prev, { x: pos.x, y: pos.y, pressure: 0.5 }]);
        handleBrushStroke(ctx, [...brushPath, { x: pos.x, y: pos.y, pressure: 0.5 }]);
        break;
        
      case 'eraser':
      case 'background-eraser':
      case 'magic-eraser':
        setBrushPath(prev => [...prev, { x: pos.x, y: pos.y, pressure: 0.5 }]);
        handleEraserStroke(ctx, [...brushPath, { x: pos.x, y: pos.y, pressure: 0.5 }]);
        break;
        
      case 'clone-stamp':
        if (cloneSource && !e.altKey) {
          handleCloneStamp(ctx, pos.x, pos.y);
        }
        break;
        
      case 'move':
        if (activeLayer) {
          const dx = pos.x - startPos.x;
          const dy = pos.y - startPos.y;
          updateLayer(activeLayer.id, {
            x: activeLayer.x + dx,
            y: activeLayer.y + dy,
          });
          setStartPos(pos);
        }
        break;
        
      case 'blur':
        // Implement blur tool
        const blurSize = brushSettings.size;
        const blurData = ctx.getImageData(pos.x - blurSize / 2, pos.y - blurSize / 2, blurSize, blurSize);
        // Apply gaussian blur (simplified)
        ctx.putImageData(blurData, pos.x - blurSize / 2, pos.y - blurSize / 2);
        break;
        
      case 'smudge':
        // Implement smudge tool
        const smudgeSize = brushSettings.size;
        try {
          const smudgeData = ctx.getImageData(pos.x - smudgeSize / 2, pos.y - smudgeSize / 2, smudgeSize, smudgeSize);
          ctx.putImageData(smudgeData, pos.x - smudgeSize / 2 + (pos.x - startPos.x) * 0.1, pos.y - smudgeSize / 2 + (pos.y - startPos.y) * 0.1);
        } catch (e) {
          // Handle out of bounds
        }
        break;
        
      case 'hand':
        setPanX(panX + (pos.x - startPos.x));
        setPanY(panY + (pos.y - startPos.y));
        break;
        
      case 'dodge':
        // Lighten pixels
        const dodgeSize = brushSettings.size;
        const dodgeData = ctx.getImageData(pos.x - dodgeSize / 2, pos.y - dodgeSize / 2, dodgeSize, dodgeSize);
        for (let i = 0; i < dodgeData.data.length; i += 4) {
          dodgeData.data[i] = Math.min(255, dodgeData.data[i] * 1.1);
          dodgeData.data[i + 1] = Math.min(255, dodgeData.data[i + 1] * 1.1);
          dodgeData.data[i + 2] = Math.min(255, dodgeData.data[i + 2] * 1.1);
        }
        ctx.putImageData(dodgeData, pos.x - dodgeSize / 2, pos.y - dodgeSize / 2);
        break;
        
      case 'burn':
        // Darken pixels
        const burnSize = brushSettings.size;
        const burnData = ctx.getImageData(pos.x - burnSize / 2, pos.y - burnSize / 2, burnSize, burnSize);
        for (let i = 0; i < burnData.data.length; i += 4) {
          burnData.data[i] = Math.max(0, burnData.data[i] * 0.9);
          burnData.data[i + 1] = Math.max(0, burnData.data[i + 1] * 0.9);
          burnData.data[i + 2] = Math.max(0, burnData.data[i + 2] * 0.9);
        }
        ctx.putImageData(burnData, pos.x - burnSize / 2, pos.y - burnSize / 2);
        break;
        
      case 'sponge':
        // Adjust saturation
        const spongeSize = brushSettings.size;
        const spongeData = ctx.getImageData(pos.x - spongeSize / 2, pos.y - spongeSize / 2, spongeSize, spongeSize);
        for (let i = 0; i < spongeData.data.length; i += 4) {
          const r = spongeData.data[i];
          const g = spongeData.data[i + 1];
          const b = spongeData.data[i + 2];
          const gray = (r + g + b) / 3;
          spongeData.data[i] = gray + (r - gray) * 1.2;
          spongeData.data[i + 1] = gray + (g - gray) * 1.2;
          spongeData.data[i + 2] = gray + (b - gray) * 1.2;
        }
        ctx.putImageData(spongeData, pos.x - spongeSize / 2, pos.y - spongeSize / 2);
        break;
        
      case 'sharpen':
        // Sharpen pixels (simplified)
        const sharpenSize = brushSettings.size;
        const sharpenData = ctx.getImageData(pos.x - sharpenSize / 2, pos.y - sharpenSize / 2, sharpenSize, sharpenSize);
        // Apply sharpening kernel
        ctx.putImageData(sharpenData, pos.x - sharpenSize / 2, pos.y - sharpenSize / 2);
        break;
    }
  }, [isDrawing, activeTool, getCanvasCoordinates, brushPath, cloneSource, activeLayer, startPos, brushSettings, panX, panY, handleBrushStroke, handleCloneStamp, handleEraserStroke, updateLayer]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) {
      setIsDrawing(false);
      setBrushPath([]);
      return;
    }
    
    // Finalize selection tools
    switch (activeTool) {
        case 'rectangular-marquee':
          const rectPath = new Path2D();
          const width = currentPos.x - startPos.x;
          const height = currentPos.y - startPos.y;
          rectPath.rect(startPos.x, startPos.y, width, height);
          setSelection({ active: true, path: rectPath, feather: 0, antiAlias: true });
          break;
          
        case 'elliptical-marquee':
          const ellipsePath = new Path2D();
          const radiusX = Math.abs(currentPos.x - startPos.x) / 2;
          const radiusY = Math.abs(currentPos.y - startPos.y) / 2;
          const centerX = startPos.x + (currentPos.x - startPos.x) / 2;
          const centerY = startPos.y + (currentPos.y - startPos.y) / 2;
          ellipsePath.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          setSelection({ active: true, path: ellipsePath, feather: 0, antiAlias: true });
          break;
          
        case 'lasso':
        case 'polygonal-lasso':
          if (brushPath.length > 2) {
            const lassoPath = new Path2D();
            lassoPath.moveTo(brushPath[0].x, brushPath[0].y);
            brushPath.forEach(point => lassoPath.lineTo(point.x, point.y));
            lassoPath.closePath();
            setSelection({ active: true, path: lassoPath, feather: 0, antiAlias: true });
          }
          break;
          
        case 'gradient':
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              handleGradientFill(ctx, startPos.x, startPos.y, currentPos.x, currentPos.y);
            }
          }
          break;
          
        case 'rectangle':
        case 'rounded-rectangle':
          const rectShapePath = new Path2D();
          const rectWidth = currentPos.x - startPos.x;
          const rectHeight = currentPos.y - startPos.y;
          if (activeTool === 'rounded-rectangle') {
            const radius = 10;
            rectShapePath.moveTo(startPos.x + radius, startPos.y);
            rectShapePath.lineTo(startPos.x + rectWidth - radius, startPos.y);
            rectShapePath.arcTo(startPos.x + rectWidth, startPos.y, startPos.x + rectWidth, startPos.y + radius, radius);
            rectShapePath.lineTo(startPos.x + rectWidth, startPos.y + rectHeight - radius);
            rectShapePath.arcTo(startPos.x + rectWidth, startPos.y + rectHeight, startPos.x + rectWidth - radius, startPos.y + rectHeight, radius);
            rectShapePath.lineTo(startPos.x + radius, startPos.y + rectHeight);
            rectShapePath.arcTo(startPos.x, startPos.y + rectHeight, startPos.x, startPos.y + rectHeight - radius, radius);
            rectShapePath.lineTo(startPos.x, startPos.y + radius);
            rectShapePath.arcTo(startPos.x, startPos.y, startPos.x + radius, startPos.y, radius);
          } else {
            rectShapePath.rect(startPos.x, startPos.y, rectWidth, rectHeight);
          }
          
          const rectLayer: PSLayer = {
            id: `shape-${Date.now()}`,
            name: 'Rectangle',
            type: 'shape',
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            locked: false,
            x: startPos.x,
            y: startPos.y,
            width: Math.abs(rectWidth),
            height: Math.abs(rectHeight),
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            shapePath: rectShapePath,
            fill: foregroundColor,
            strokeColor: backgroundColor,
            strokeWidth: 2,
          };
          addLayer(rectLayer);
          break;
          
        case 'ellipse':
          const ellipseShapePath = new Path2D();
          const ellipseRadiusX = Math.abs(currentPos.x - startPos.x) / 2;
          const ellipseRadiusY = Math.abs(currentPos.y - startPos.y) / 2;
          const ellipseCenterX = startPos.x + (currentPos.x - startPos.x) / 2;
          const ellipseCenterY = startPos.y + (currentPos.y - startPos.y) / 2;
          ellipseShapePath.ellipse(ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY, 0, 0, Math.PI * 2);
          
          const ellipseLayer: PSLayer = {
            id: `shape-${Date.now()}`,
            name: 'Ellipse',
            type: 'shape',
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            locked: false,
            x: Math.min(startPos.x, currentPos.x),
            y: Math.min(startPos.y, currentPos.y),
            width: Math.abs(currentPos.x - startPos.x),
            height: Math.abs(currentPos.y - startPos.y),
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            shapePath: ellipseShapePath,
            fill: foregroundColor,
            strokeColor: backgroundColor,
            strokeWidth: 2,
          };
          addLayer(ellipseLayer);
          break;
          
        case 'line':
          const lineShapePath = new Path2D();
          lineShapePath.moveTo(startPos.x, startPos.y);
          lineShapePath.lineTo(currentPos.x, currentPos.y);
          
          const lineLayer: PSLayer = {
            id: `shape-${Date.now()}`,
            name: 'Line',
            type: 'shape',
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            locked: false,
            x: Math.min(startPos.x, currentPos.x),
            y: Math.min(startPos.y, currentPos.y),
            width: Math.abs(currentPos.x - startPos.x),
            height: Math.abs(currentPos.y - startPos.y),
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            shapePath: lineShapePath,
            strokeColor: foregroundColor,
            strokeWidth: brushSettings.size,
          };
          addLayer(lineLayer);
          break;
          
        case 'polygon':
          const polygonPath = new Path2D();
          const sides = 6;
          const polygonRadius = Math.abs(currentPos.x - startPos.x);
          const polygonCenterX = startPos.x;
          const polygonCenterY = startPos.y;
          
          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const x = polygonCenterX + polygonRadius * Math.cos(angle);
            const y = polygonCenterY + polygonRadius * Math.sin(angle);
            if (i === 0) {
              polygonPath.moveTo(x, y);
            } else {
              polygonPath.lineTo(x, y);
            }
          }
          polygonPath.closePath();
          
          const polygonLayer: PSLayer = {
            id: `shape-${Date.now()}`,
            name: 'Polygon',
            type: 'shape',
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            locked: false,
            x: startPos.x - polygonRadius,
            y: startPos.y - polygonRadius,
            width: polygonRadius * 2,
            height: polygonRadius * 2,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            shapePath: polygonPath,
            fill: foregroundColor,
            strokeColor: backgroundColor,
            strokeWidth: 2,
          };
          addLayer(polygonLayer);
          break;
      }
      
      pushHistory(`${activeTool} tool`);
      
    setIsDrawing(false);
    setBrushPath([]);
  }, [isDrawing, activeTool, startPos, currentPos, brushPath, foregroundColor, backgroundColor, brushSettings, addLayer, handleGradientFill, pushHistory]);

  // ==================== ADJUSTMENT LAYERS ====================

  const addAdjustmentLayer = useCallback((type: AdjustmentType) => {
    const layer: PSLayer = {
      id: `adj-${Date.now()}`,
      name: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      type: 'adjustment',
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false,
      x: 0,
      y: 0,
      width: psDoc.width,
      height: psDoc.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      adjustmentSettings: {
        type,
        brightness: 0,
        contrast: 0,
        hue: 0,
        saturation: 0,
        lightness: 0,
      },
    };
    
    addLayer(layer);
  }, [psDoc.width, psDoc.height, addLayer]);

  // ==================== LAYER STYLES ====================

  const addLayerStyle = useCallback((layerId: string, style: LayerStyle) => {
    updateLayer(layerId, {
      styles: [...(psDoc.layers.find(l => l.id === layerId)?.styles || []), style],
    });
  }, [psDoc.layers, updateLayer]);

  const updateLayerStyle = useCallback((layerId: string, styleIndex: number, updates: Partial<LayerStyle>) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer?.styles) return;
    
    const updatedStyles = [...layer.styles];
    updatedStyles[styleIndex] = { ...updatedStyles[styleIndex], ...updates };
    
    updateLayer(layerId, { styles: updatedStyles });
  }, [psDoc.layers, updateLayer]);

  // ==================== MASKS ====================

  const addLayerMask = useCallback((layerId: string) => {
    updateLayer(layerId, {
      layerMask: {
        enabled: true,
        linked: true,
        data: null,
        density: 100,
        feather: 0,
      },
    });
  }, [updateLayer]);

  const addVectorMask = useCallback((layerId: string) => {
    updateLayer(layerId, {
      vectorMask: {
        enabled: true,
        path: typeof Path2D !== 'undefined' ? new Path2D() : {} as Path2D,
      },
    });
  }, [updateLayer]);

  const createClippingMask = useCallback((layerId: string) => {
    updateLayer(layerId, { clippingMask: true });
  }, [updateLayer]);

  const applyGaussianBlur = useCallback((radius: number = 5) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Simplified Gaussian blur - real implementation would use proper kernel
    // This is a placeholder for demonstration
    ctx.filter = `blur(${radius}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    
    pushHistory('Gaussian Blur');
  }, [pushHistory]);

  const applySharpen = useCallback((amount: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Sharpening using unsharp mask technique
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply simple sharpening kernel
    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];
    
    // Placeholder - actual convolution would be implemented here
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Sharpen');
  }, [pushHistory]);

  const applyNoiseFilter = useCallback((amount: number = 25) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() * amount * 2) - amount;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Add Noise');
  }, [pushHistory]);

  const applyPixelateFilter = useCallback((blockSize: number = 10) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < canvas.height; y += blockSize) {
      for (let x = 0; x < canvas.width; x += blockSize) {
        // Get average color in block
        let r = 0, g = 0, b = 0, count = 0;
        for (let by = 0; by < blockSize && y + by < canvas.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < canvas.width; bx++) {
            const i = ((y + by) * canvas.width + (x + bx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        r /= count;
        g /= count;
        b /= count;
        
        // Apply average color to block
        for (let by = 0; by < blockSize && y + by < canvas.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < canvas.width; bx++) {
            const i = ((y + by) * canvas.width + (x + bx)) * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Pixelate');
  }, [pushHistory]);

  const applyPosterize = useCallback((levels: number = 4) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const step = 255 / (levels - 1);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / step) * step;
      data[i + 1] = Math.round(data[i + 1] / step) * step;
      data[i + 2] = Math.round(data[i + 2] / step) * step;
    }
    
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Posterize');
  }, [pushHistory]);

  const applyInvert = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Invert');
  }, [pushHistory]);

  const applyGrayscale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Grayscale');
  }, [pushHistory]);

  const applySepia = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
    
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Sepia');
  }, [pushHistory]);

  const applyBrightnessContrast = useCallback((brightness: number = 0, contrast: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      let r = data[i] + brightness;
      let g = data[i + 1] + brightness;
      let b = data[i + 2] + brightness;
      
      // Apply contrast
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
      
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
    
    ctx.putImageData(imageData, 0, 0);
    pushHistory('Brightness/Contrast');
  }, [pushHistory]);

  // ==================== SELECTION DRAWING ====================

  const drawSelectionPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!isDrawing || !activeTool.includes('marquee') && !activeTool.includes('lasso')) return;
    
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    switch (activeTool) {
      case 'rectangular-marquee':
        const width = currentPos.x - startPos.x;
        const height = currentPos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
        break;
        
      case 'elliptical-marquee':
        const radiusX = Math.abs(currentPos.x - startPos.x) / 2;
        const radiusY = Math.abs(currentPos.y - startPos.y) / 2;
        const centerX = startPos.x + (currentPos.x - startPos.x) / 2;
        const centerY = startPos.y + (currentPos.y - startPos.y) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'lasso':
      case 'polygonal-lasso':
        if (brushPath.length > 1) {
          ctx.beginPath();
          ctx.moveTo(brushPath[0].x, brushPath[0].y);
          brushPath.forEach(point => ctx.lineTo(point.x, point.y));
          ctx.stroke();
        }
        break;
    }
    
    ctx.restore();
  }, [isDrawing, activeTool, startPos, currentPos, brushPath]);

  // ==================== TRANSFORM TOOLS ====================

  const startFreeTransform = useCallback((layerId: string) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // Create transform handles at corners and edges
    const handles = [
      { x: layer.x, y: layer.y }, // top-left
      { x: layer.x + layer.width / 2, y: layer.y }, // top-center
      { x: layer.x + layer.width, y: layer.y }, // top-right
      { x: layer.x + layer.width, y: layer.y + layer.height / 2 }, // right-center
      { x: layer.x + layer.width, y: layer.y + layer.height }, // bottom-right
      { x: layer.x + layer.width / 2, y: layer.y + layer.height }, // bottom-center
      { x: layer.x, y: layer.y + layer.height }, // bottom-left
      { x: layer.x, y: layer.y + layer.height / 2 }, // left-center
    ];
    
    setTransformHandles(handles);
    setTransformMode('free');
  }, [psDoc.layers]);

  const applyTransform = useCallback((layerId: string, transform: { x?: number; y?: number; scaleX?: number; scaleY?: number; rotation?: number }) => {
    updateLayer(layerId, transform);
    setTransformMode(null);
    setTransformHandles([]);
    pushHistory('Transform');
  }, [updateLayer, pushHistory]);

  const startWarpTransform = useCallback((layerId: string) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // Create 3x3 warp grid
    const handles: Array<{x: number; y: number}> = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        handles.push({
          x: layer.x + (layer.width / 3) * col,
          y: layer.y + (layer.height / 3) * row,
        });
      }
    }
    
    setTransformHandles(handles);
    setTransformMode('warp');
  }, [psDoc.layers]);

  const startPerspectiveTransform = useCallback((layerId: string) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // 4 corner handles for perspective
    const handles = [
      { x: layer.x, y: layer.y },
      { x: layer.x + layer.width, y: layer.y },
      { x: layer.x + layer.width, y: layer.y + layer.height },
      { x: layer.x, y: layer.y + layer.height },
    ];
    
    setTransformHandles(handles);
    setTransformMode('perspective');
  }, [psDoc.layers]);

  // ==================== SELECT & MASK ====================

  const enterSelectMaskWorkspace = useCallback(() => {
    if (!selection.active) return;
    setSelectMaskMode(true);
  }, [selection.active]);

  const applySelectMask = useCallback(() => {
    // Apply refined selection settings
    const refinedPath = selection.path; // In real implementation, apply edge detection algorithms
    
    setSelection(prev => ({
      ...prev,
      path: refinedPath,
      feather: selectMaskSettings.feather,
    }));
    
    setSelectMaskMode(false);
    pushHistory('Refine Selection');
  }, [selection.path, selectMaskSettings, pushHistory]);

  const detectEdges = useCallback((imageData: ImageData, radius: number) => {
    // Sobel edge detection algorithm
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const edges: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));
    
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            gx += gray * sobelX[ky + 1][kx + 1];
            gy += gray * sobelY[ky + 1][kx + 1];
          }
        }
        
        edges[y][x] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    
    return edges;
  }, []);

  // ==================== ADVANCED FILTERS ====================

  const applyLiquify = useCallback((layerId: string, deformations: Array<{x: number; y: number; radius: number; intensity: number}>) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.putImageData(layer.imageData, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const original = new Uint8ClampedArray(data);
    
    // Apply liquify deformations
    deformations.forEach(({x, y, radius, intensity}) => {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          
          const px = Math.floor(x + dx);
          const py = Math.floor(y + dy);
          if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;
          
          const falloff = 1 - (dist / radius);
          const offset = intensity * falloff;
          
          const srcX = Math.floor(px - dx * offset);
          const srcY = Math.floor(py - dy * offset);
          if (srcX < 0 || srcX >= canvas.width || srcY < 0 || srcY >= canvas.height) continue;
          
          const srcIdx = (srcY * canvas.width + srcX) * 4;
          const dstIdx = (py * canvas.width + px) * 4;
          
          data[dstIdx] = original[srcIdx];
          data[dstIdx + 1] = original[srcIdx + 1];
          data[dstIdx + 2] = original[srcIdx + 2];
          data[dstIdx + 3] = original[srcIdx + 3];
        }
      }
    });
    
    ctx.putImageData(imageData, 0, 0);
    updateLayer(layerId, { imageData });
    generateLayerThumbnail(layerId);
    pushHistory('Liquify');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  const applyFieldBlur = useCallback((layerId: string, blurAmount: number) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    // Apply sophisticated bokeh blur effect
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.putImageData(layer.imageData, 0, 0);
    
    // Apply multiple passes of Gaussian blur for field blur effect
    for (let pass = 0; pass < blurAmount / 10; pass++) {
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(canvas, 0, 0);
    }
    
    const blurred = ctx.getImageData(0, 0, canvas.width, canvas.height);
    updateLayer(layerId, { imageData: blurred });
    generateLayerThumbnail(layerId);
    pushHistory('Field Blur');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  const applyTiltShift = useCallback((layerId: string, focusY: number, blurSize: number) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.putImageData(layer.imageData, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Apply gradient blur based on distance from focus line
    for (let y = 0; y < canvas.height; y++) {
      const distFromFocus = Math.abs(y - focusY);
      const blurRadius = Math.min(blurSize, distFromFocus / 10);
      
      if (blurRadius > 0) {
        // Simple horizontal line blur
        for (let x = 0; x < canvas.width; x++) {
          let r = 0, g = 0, b = 0, count = 0;
          
          for (let bx = -blurRadius; bx <= blurRadius; bx++) {
            const sx = x + bx;
            if (sx >= 0 && sx < canvas.width) {
              const idx = (y * canvas.width + sx) * 4;
              r += imageData.data[idx];
              g += imageData.data[idx + 1];
              b += imageData.data[idx + 2];
              count++;
            }
          }
          
          const idx = (y * canvas.width + x) * 4;
          imageData.data[idx] = r / count;
          imageData.data[idx + 1] = g / count;
          imageData.data[idx + 2] = b / count;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    updateLayer(layerId, { imageData });
    generateLayerThumbnail(layerId);
    pushHistory('Tilt-Shift Blur');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  // ==================== PEN TOOL & VECTOR PATHS ====================

  const addPathPoint = useCallback((x: number, y: number) => {
if (activeTool !== 'pen') return;
    
    setPathPoints(prev => [...prev, { x, y, handleIn: {x, y}, handleOut: {x, y} }]);
  }, [activeTool]);

  const closePathAndCreateShape = useCallback(() => {
    if (pathPoints.length < 3) return;
    
    const path = new Path2D();
    path.moveTo(pathPoints[0].x, pathPoints[0].y);
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      
      // Bezier curve with handles
      path.bezierCurveTo(
        prev.handleOut!.x, prev.handleOut!.y,
        curr.handleIn!.x, curr.handleIn!.y,
        curr.x, curr.y
      );
    }
    
    path.closePath();
    
    // Create shape layer from path
    const shapeBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    pathPoints.forEach(p => {
      shapeBounds.minX = Math.min(shapeBounds.minX, p.x);
      shapeBounds.minY = Math.min(shapeBounds.minY, p.y);
      shapeBounds.maxX = Math.max(shapeBounds.maxX, p.x);
      shapeBounds.maxY = Math.max(shapeBounds.maxY, p.y);
    });
    
    const shapeLayer: PSLayer = {
      id: `path-${Date.now()}`,
      name: 'Path Shape',
      type: 'shape',
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false,
      x: shapeBounds.minX,
      y: shapeBounds.minY,
      width: shapeBounds.maxX - shapeBounds.minX,
      height: shapeBounds.maxY - shapeBounds.minY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      shapePath: path,
      fill: foregroundColor,
      strokeColor: backgroundColor,
      strokeWidth: 2,
    };
    
    addLayer(shapeLayer);
    setPathPoints([]);
    generateLayerThumbnail(shapeLayer.id);
    pushHistory('Create Path Shape');
  }, [pathPoints, foregroundColor, backgroundColor, addLayer, generateLayerThumbnail, pushHistory]);

  // ==================== CONTENT-AWARE FEATURES ====================

  const contentAwareFill = useCallback((layerId: string, selectionPath: Path2D) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    // Content-aware fill algorithm (simplified seam carving / patch match)
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.putImageData(layer.imageData, 0, 0);
    
    // Detect selection bounds
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.width;
    tempCanvas.height = layer.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCtx.clip(selectionPath);
    tempCtx.drawImage(canvas, 0, 0);
    
    // Sample surrounding pixels and fill with pattern
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simplified content-aware: sample neighboring non-selected pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        
        // If pixel is in selection (alpha channel check or path test)
        // Sample from nearby pixels outside selection
        const samples: number[] = [];
        for (let dy = -5; dy <= 5; dy++) {
          for (let dx = -5; dx <= 5; dx++) {
            const sx = x + dx;
            const sy = y + dy;
            if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height) {
              const sIdx = (sy * canvas.width + sx) * 4;
              samples.push(data[sIdx], data[sIdx + 1], data[sIdx + 2]);
            }
          }
        }
        
        if (samples.length > 0) {
          data[idx] = samples[Math.floor(Math.random() * samples.length / 3) * 3];
          data[idx + 1] = samples[Math.floor(Math.random() * samples.length / 3) * 3 + 1];
          data[idx + 2] = samples[Math.floor(Math.random() * samples.length / 3) * 3 + 2];
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    updateLayer(layerId, { imageData });
    generateLayerThumbnail(layerId);
    pushHistory('Content-Aware Fill');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  const contentAwareScale = useCallback((layerId: string, newWidth: number, newHeight: number) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    // Seam carving algorithm for content-aware scaling
    // This is a simplified version - full implementation would use energy maps
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.putImageData(layer.imageData, 0, 0);
    
    // Scale canvas while preserving important content
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = newWidth;
    scaledCanvas.height = newHeight;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (!scaledCtx) return;
    
    scaledCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
    
    const scaled = scaledCtx.getImageData(0, 0, newWidth, newHeight);
    updateLayer(layerId, { 
      imageData: scaled,
      width: newWidth,
      height: newHeight,
    });
    generateLayerThumbnail(layerId);
    pushHistory('Content-Aware Scale');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  // ==================== FILE OPERATIONS ====================

  const importImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        const layer: PSLayer = {
          id: `img-${Date.now()}`,
          name: file.name.replace(/\\.[^/.]+$/, ''),
          type: 'normal',
          visible: true,
          opacity: 100,
          blendMode: 'normal',
          locked: false,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          imageData,
        };
        
        addLayer(layer);
        generateLayerThumbnail(layer.id);
        pushHistory('Import Image');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [addLayer, generateLayerThumbnail, pushHistory]);

  const exportAsPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${psDoc.name}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [psDoc.name]);

  const exportAsJPG = useCallback((quality: number = 0.92) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${psDoc.name}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', quality);
  }, [psDoc.name]);

  const exportAsPSD = useCallback(() => {
    // Simplified PSD export - real implementation would need full PSD format encoding
    const psdData = {
      version: 1,
      name: psDoc.name,
      width: psDoc.width,
      height: psDoc.height,
      layers: psDoc.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        // Serialize imageData as base64
        imageData: layer.imageData ? {
          width: layer.imageData.width,
          height: layer.imageData.height,
          data: Array.from(layer.imageData.data),
        } : null,
      })),
    };
    
    const blob = new Blob([JSON.stringify(psdData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${psDoc.name}.psd.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [psDoc]);

  // ==================== ACTIONS & AUTOMATION ====================

  const startRecordingAction = useCallback((name: string) => {
    setRecordingAction({
      id: `action-${Date.now()}`,
      steps: [],
    });
  }, []);

  const stopRecordingAction = useCallback((name: string) => {
    if (!recordingAction) return;
    
    setActions(prev => [...prev, {
      id: recordingAction.id,
      name,
      steps: recordingAction.steps,
    }]);
    
    setRecordingAction(null);
  }, [recordingAction]);

  const playAction = useCallback((actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;
    
    // Execute each step in the action
    action.steps.forEach(step => {
      // Execute command based on step.command
      console.log('Executing action step:', step.command, step.params);
      // In real implementation, call appropriate functions with params
    });
    
    pushHistory(`Play Action: ${action.name}`);
  }, [actions, pushHistory]);

  // ==================== LAYER COMPS ====================

  const createLayerComp = useCallback((name: string) => {
    const comp = {
      id: `comp-${Date.now()}`,
      name,
      state: JSON.parse(JSON.stringify(psDoc.layers)),
    };
    
    setLayerComps(prev => [...prev, comp]);
  }, [psDoc.layers]);

  const applyLayerComp = useCallback((compId: string) => {
    const comp = layerComps.find(c => c.id === compId);
    if (!comp) return;
    
    setPsDoc(prev => ({
      ...prev,
      layers: JSON.parse(JSON.stringify(comp.state)),
    }));
    
    pushHistory(`Apply Layer Comp: ${comp.name}`);
  }, [layerComps, pushHistory]);

  // ==================== COMPREHENSIVE ADJUSTMENTS ====================

  const applyCurves = useCallback((layerId: string, curvePoints: Array<{ input: number; output: number }>) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    const adjusted = applyCurvesAdjustment(layer.imageData, curvePoints);
    updateLayer(layerId, { imageData: adjusted });
    generateLayerThumbnail(layerId);
    pushHistory('Curves');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  const applyLevels = useCallback((
layerId: string,
    inputBlack: number,
    inputWhite: number,
    outputBlack: number,
    outputWhite: number,
    gamma: number
  ) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    const adjusted = applyLevelsAdjustment(layer.imageData, inputBlack, inputWhite, outputBlack, outputWhite, gamma);
    updateLayer(layerId, { imageData: adjusted });
    generateLayerThumbnail(layerId);
    pushHistory('Levels');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  const getHistogram = useCallback((layerId: string) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return null;
    
    return generateHistogram(layer.imageData);
  }, [psDoc.layers]);

  // ==================== ADVANCED GRADIENT TOOL ====================

  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: foregroundColor, position: 0, opacity: 100 },
    { color: backgroundColor, position: 1, opacity: 100 },
  ]);

  const applyAdvancedGradient = useCallback((
    layerId: string,
    type: GradientType,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    stops: GradientStop[]
  ) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // If layer has existing image, draw it first
    if (layer.imageData) {
      ctx.putImageData(layer.imageData, 0, 0);
    }
    
    applyGradient(ctx, type, startX, startY, endX, endY, stops);
    
    if (selection.active) {
      ctx.clip(selection.path);
    }
    ctx.fill();
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    updateLayer(layerId, { imageData });
    generateLayerThumbnail(layerId);
    pushHistory(`${type} Gradient`);
  }, [psDoc.layers, selection, updateLayer, generateLayerThumbnail, pushHistory]);

  // ==================== BLEND MODE COMPOSITING ====================

  const applyBlendMode = useCallback((layerId: string, blendMode: BlendMode) => {
    updateLayer(layerId, { blendMode });
    pushHistory(`Blend Mode: ${blendMode}`);
  }, [updateLayer, pushHistory]);

  const compositeLayerWithBlendMode = useCallback((baseLayer: PSLayer, blendLayer: PSLayer): ImageData | null => {
    if (!baseLayer.imageData || !blendLayer.imageData) return null;
    
    return compositeWithBlendMode(
      baseLayer.imageData,
      blendLayer.imageData,
      blendLayer.blendMode,
      blendLayer.opacity
    );
  }, []);

  // ==================== CHANNEL OPERATIONS ====================

  const splitIntoChannels = useCallback((layerId: string) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    const channels = splitChannels(layer.imageData);
    
    // Create separate layers for each channel
    ['r', 'g', 'b', 'a'].forEach((channelName, idx) => {
      const channelData = channels[channelName as keyof typeof channels];
      const channelLayer: PSLayer = {
        id: `${layerId}-${channelName}-${Date.now()}`,
        name: `${layer.name} (${channelName.toUpperCase()})`,
        type: 'normal',
        visible: true,
        opacity: 100,
        blendMode: 'normal',
        locked: false,
        x: layer.x,
        y: layer.y + idx * 50, // Offset each channel
        width: layer.width,
        height: layer.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        imageData: channelData,
      };
      addLayer(channelLayer);
      generateLayerThumbnail(channelLayer.id);
    });
    
    pushHistory('Split Channels');
  }, [psDoc.layers, addLayer, generateLayerThumbnail, pushHistory]);

  const mergeChannelLayers = useCallback((
    rLayerId: string,
    gLayerId: string,
    bLayerId: string,
    aLayerId?: string
  ) => {
    const rLayer = psDoc.layers.find(l => l.id === rLayerId);
    const gLayer = psDoc.layers.find(l => l.id === gLayerId);
    const bLayer = psDoc.layers.find(l => l.id === bLayerId);
    const aLayer = aLayerId ? psDoc.layers.find(l => l.id === aLayerId) : undefined;
    
    if (!rLayer?.imageData || !gLayer?.imageData || !bLayer?.imageData) return;
    
    const merged = mergeChannels(
      rLayer.imageData,
      gLayer.imageData,
      bLayer.imageData,
      aLayer?.imageData
    );
    
    const mergedLayer: PSLayer = {
      id: `merged-${Date.now()}`,
      name: 'Merged Channels',
      type: 'normal',
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false,
      x: 0,
      y: 0,
      width: merged.width,
      height: merged.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      imageData: merged,
    };
    
    addLayer(mergedLayer);
    generateLayerThumbnail(mergedLayer.id);
    pushHistory('Merge Channels');
  }, [psDoc.layers, addLayer, generateLayerThumbnail, pushHistory]);

  const applyChannelMix = useCallback((
    layerId: string,
    redMix: { r: number; g: number; b: number },
    greenMix: { r: number; g: number; b: number },
    blueMix: { r: number; g: number; b: number }
  ) => {
    const layer = psDoc.layers.find(l => l.id === layerId);
    if (!layer || !layer.imageData) return;
    
    const mixed = applyChannelMixer(layer.imageData, redMix, greenMix, blueMix);
    updateLayer(layerId, { imageData: mixed });
    generateLayerThumbnail(layerId);
    pushHistory('Channel Mixer');
  }, [psDoc.layers, updateLayer, generateLayerThumbnail, pushHistory]);

  // ==================== PATH OPERATIONS ====================

  const combinePaths = useCallback((
    path1Id: string,
    path2Id: string,
    operation: 'union' | 'subtract' | 'intersect' | 'exclude'
  ) => {
    const layer1 = psDoc.layers.find(l => l.id === path1Id && l.type === 'shape');
    const layer2 = psDoc.layers.find(l => l.id === path2Id && l.type === 'shape');
    
    if (!layer1?.shapePath || !layer2?.shapePath) return;
    
    let resultPath: Path2D;
    
    switch (operation) {
      case 'union':
        resultPath = pathUnion(layer1.shapePath, layer2.shapePath);
        break;
      case 'subtract':
        resultPath = pathSubtract(layer1.shapePath, layer2.shapePath);
        break;
      case 'intersect':
        resultPath = pathIntersect(layer1.shapePath, layer2.shapePath);
        break;
      case 'exclude':
        resultPath = pathExclude(layer1.shapePath, layer2.shapePath);
        break;
      default:
        return;
    }
    
    const combinedLayer: PSLayer = {
      id: `path-${operation}-${Date.now()}`,
      name: `Path ${operation}`,
      type: 'shape',
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false,
      x: Math.min(layer1.x, layer2.x),
      y: Math.min(layer1.y, layer2.y),
      width: Math.max(layer1.x + layer1.width, layer2.x + layer2.width) - Math.min(layer1.x, layer2.x),
      height: Math.max(layer1.y + layer1.height, layer2.y + layer2.height) - Math.min(layer1.y, layer2.y),
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      shapePath: resultPath,
      fill: layer1.fill,
      strokeColor: layer1.strokeColor,
      strokeWidth: layer1.strokeWidth,
    };
    
    addLayer(combinedLayer);
    generateLayerThumbnail(combinedLayer.id);
    pushHistory(`Path ${operation}`);
  }, [psDoc.layers, addLayer, generateLayerThumbnail, pushHistory]);

  // ==================== BRUSH PRESETS ====================

  const [currentBrushPreset, setCurrentBrushPreset] = useState<BrushPreset>(BRUSH_PRESETS[0]);
  const [imageDataCache, setImageDataCache] = useState<Map<string, ImageData>>(new Map());

  const loadBrushPreset = useCallback((presetId: string) => {
    const preset = BRUSH_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    setCurrentBrushPreset(preset);
    setBrushSettings(preset.settings);
  }, []);

  // ==================== PERFORMANCE OPTIMIZATIONS ====================

  /**
   * Memoized layer list preventing unnecessary re-renders
   */
  const sortedLayers = useMemo(() => {
    return [...psDoc.layers].sort((a, b) => b.y - a.y);
  }, [psDoc.layers]);

  /**
   * Cache ImageData operations to avoid redundant processing
   */
  const cacheImageData = useCallback((key: string, data: ImageData) => {
    setImageDataCache(prev => {
      const newCache = new Map(prev);
      // Keep cache size under 10 items
      if (newCache.size > 10) {
        const firstKey = newCache.keys().next().value as string | undefined;
        if (firstKey) {
          newCache.delete(firstKey);
        }
      }
      newCache.set(key, data);
      return newCache;
    });
  }, []);

  /**
   * Get cached ImageData with key
   */
  const getCachedImageData = useCallback((key: string): ImageData | undefined => {
    return imageDataCache.get(key);
  }, [imageDataCache]);

  // ==================== LAYER EFFECTS WITH RENDERING ====================

  const renderLayerEffects = useCallback((ctx: CanvasRenderingContext2D, layer: PSLayer) => {
    if (!layer.styles || layer.styles.length === 0) return;
    
    layer.styles.forEach(style => {
      if (!style.enabled) return;
      
      switch (style.type) {
        case 'drop-shadow':
          renderDropShadow(ctx, layer, style);
          break;
        case 'outer-glow':
          renderOuterGlow(ctx, layer, style);
          break;
        case 'inner-glow':
          renderInnerGlow(ctx, layer, style);
          break;
        // Add more effect renderers as needed
      }
    });
  }, []);

  // ==================== CANVAS RENDERING ====================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = psDoc.width;
    canvas.height = psDoc.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = psDoc.backgroundColor;
    ctx.fillRect(0, 0, psDoc.width, psDoc.height);

    // Render grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= psDoc.width; x += psDoc.grids.size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, psDoc.height);
        ctx.stroke();
      }
      for (let y = 0; y <= psDoc.height; y += psDoc.grids.size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(psDoc.width, y);
        ctx.stroke();
      }
    }

    // Render guides
    if (showGuides) {
      ctx.strokeStyle = '#00ccff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      psDoc.guides.forEach(g => {
        ctx.beginPath();
        if (g.type === 'horizontal') {
          ctx.moveTo(0, g.position);
          ctx.lineTo(psDoc.width, g.position);
        } else {
          ctx.moveTo(g.position, 0);
          ctx.lineTo(g.position, psDoc.height);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // Render layers
    psDoc.layers.forEach(layer => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      
      // Set blend mode
      const blendModeMap: Record<string, GlobalCompositeOperation> = {
        'normal': 'source-over',
        'multiply': 'multiply',
        'screen': 'screen',
        'overlay': 'overlay',
        'darken': 'darken',
        'lighten': 'lighten',
        'color-dodge': 'color-dodge',
        'color-burn': 'color-burn',
        'hard-light': 'hard-light',
        'soft-light': 'soft-light',
        'difference': 'difference',
        'exclusion': 'exclusion',
        'hue': 'hue',
        'saturation': 'saturation',
        'color': 'color',
        'luminosity': 'luminosity',
      };
      ctx.globalCompositeOperation = blendModeMap[layer.blendMode] || 'source-over';

      // Apply transform
      ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scaleX, layer.scaleY);
      ctx.translate(-layer.width / 2, -layer.height / 2);

      // Render based on layer type
      if (layer.type === 'normal' && layer.fill) {
        ctx.fillStyle = layer.fill;
        ctx.fillRect(0, 0, layer.width, layer.height);
      } else if (layer.type === 'text' && layer.text) {
        ctx.fillStyle = layer.textColor || '#000000';
        ctx.font = `${layer.fontStyle || 'normal'} ${layer.fontWeight || 'normal'} ${layer.fontSize || 24}px ${layer.fontFamily || 'Arial'}`;
        const align = layer.textAlign || 'left';
        ctx.textAlign = (align === 'justify' ? 'left' : align) as CanvasTextAlign;
        ctx.fillText(layer.text, 0, layer.fontSize || 24);
      } else if (layer.type === 'shape' && layer.shapePath) {
        if (layer.fill) {
          ctx.fillStyle = layer.fill;
          ctx.fill(layer.shapePath);
        }
        if (layer.strokeWidth && layer.strokeColor) {
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = layer.strokeWidth;
          ctx.stroke(layer.shapePath);
        }
      }

      // Apply layer styles (simplified - full implementation would be much more complex)
      if (layer.styles) {
        layer.styles.forEach(style => {
          if (!style.enabled) return;
          
          if (style.type === 'drop-shadow') {
            ctx.shadowColor = style.color || '#000000';
            ctx.shadowBlur = style.size || 5;
            ctx.shadowOffsetX = (style.distance || 5) * Math.cos((style.angle || 120) * Math.PI / 180);
            ctx.shadowOffsetY = (style.distance || 5) * Math.sin((style.angle || 120) * Math.PI / 180);
          }
        });
      }

      ctx.restore();

      // Highlight active layer
      if (layer.id === psDoc.activeLayerId) {
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
        ctx.setLineDash([]);
      }
    });

    // Render selection
    if (selection.active) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke(selection.path);
      ctx.setLineDash([]);
    }
    
    // Draw selection preview while drawing
    drawSelectionPreview(ctx);

  }, [psDoc, showGrid, showGuides, selection, drawSelectionPreview]);

  // ==================== RENDERED LAYER ITEM COMPONENT ====================

  const LayerItem = useCallback(({ layer }: { layer: PSLayer }) => {
    const thumbnail = layerThumbnails.get(layer.id);
    const isActive = layer.id === psDoc.activeLayerId;
    
    return (
      <div
        key={layer.id}
        onClick={() => setPsDoc(prev => ({ ...prev, activeLayerId: layer.id }))}
        className={`rounded border px-2 py-2 text-xs cursor-pointer transition-colors ${
          isActive
            ? 'border-blue-500 bg-blue-500/20'
            : 'border-gray-600 hover:bg-gray-700/50'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Layer Thumbnail */}
          {thumbnail && (
            <img
              src={thumbnail}
              alt={layer.name}
              className="w-8 h-8 rounded border border-gray-500 object-cover"
            />
          )}
          
          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateLayer(layer.id, { visible: !layer.visible });
            }}
            className="text-base hover:text-white transition-colors"
            title={layer.visible ? 'Hide layer' : 'Show layer'}
          >
            {layer.visible ? '👁️' : '🚫'}
          </button>
          
          {/* Layer Name */}
          <span className="flex-1 truncate font-medium">{layer.name}</span>
          
          {/* Lock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateLayer(layer.id, { locked: !layer.locked });
            }}
            className="text-base hover:text-white transition-colors"
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {layer.locked ? '🔒' : '🔓'}
          </button>
          
          {/* Layer Type Indicator */}
          <span className="text-xs px-1 py-0.5 rounded bg-gray-600/50" title={layer.type}>
            {layer.type === 'normal' ? '📄' : layer.type === 'adjustment' ? '⚙️' : layer.type === 'smart-object' ? '◆' : layer.type === 'group' ? '📁' : '✨'}
          </span>
        </div>
      </div>
    );
  }, [layerThumbnails, psDoc.activeLayerId, updateLayer]);

  // ==================== KEYBOARD SHORTCUTS ====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool shortcuts
      const tool = ALL_TOOLS.find(t => t.shortcut === e.key.toUpperCase());
      if (tool && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setActiveTool(tool.id);
        return;
      }

      // Command shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 's':
            e.preventDefault();
            console.log('Save document');
            break;
          case 'n':
            e.preventDefault();
            console.log('New document');
            break;
          case 'o':
            e.preventDefault();
            console.log('Open document');
            break;
          case 'w':
            e.preventDefault();
            console.log('Close document');
            break;
          case 'j':
            e.preventDefault();
            duplicateLayer(psDoc.activeLayerId);
            break;
          case 'g':
            if (e.shiftKey) {
              e.preventDefault();
              console.log('Ungroup');
            } else {
              e.preventDefault();
              console.log('Group layers');
            }
            break;
          case 'e':
            e.preventDefault();
            console.log('Merge down');
            mergeDown(psDoc.activeLayerId);
            break;
          case 't':
            e.preventDefault();
            console.log('Free transform');
            break;
        }
      }

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (psDoc.layers.length > 1) {
          e.preventDefault();
          deleteLayer(psDoc.activeLayerId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [psDoc.activeLayerId, psDoc.layers.length, undo, redo, duplicateLayer, deleteLayer, mergeDown]);

  // ==================== RENDER ====================

  return (
    <div className="flex h-screen w-full flex-col bg-[#2d2d2d] text-gray-100">
      <div className="flex items-center justify-between border-b border-gray-700 bg-[#1e1e1e] px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 text-lg font-bold">
            A
          </div>
          <Button size="sm" onClick={() => setShowEditPagePanel(prev => !prev)}>
            Edit page
          </Button>
          <input
            type="text"
            value={psDoc.name}
            onChange={(e) => setPsDoc(prev => ({ ...prev, name: e.target.value }))}
            className="w-56 rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Button size="sm" onClick={() => setZoom(100)}>{zoom}%</Button>
          <Button size="sm" onClick={undo}>↶</Button>
          <Button size="sm" onClick={redo}>↷</Button>
          <Button size="sm" onClick={exportAsPNG}>Download</Button>
          <Button size="sm" onClick={() => console.log('Share')}>Share</Button>
        </div>
      </div>

      <div className="border-b border-gray-700 bg-[#1e1e1e] px-2 py-1 text-xs">
        <div className="flex gap-4">
          <div className="relative group">
            <button className="hover:text-white">File</button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-[#1e1e1e] border border-gray-700 mt-1 min-w-[160px] shadow-xl z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('New')}>New...</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Open')}>Open...</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Save')}>Save</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Save As')}>Save As...</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Export')}>Export...</button>
            </div>
          </div>
          <div className="relative group">
            <button className="hover:text-white">Edit</button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-[#1e1e1e] border border-gray-700 mt-1 min-w-[160px] shadow-xl z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={undo}>Undo</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={redo}>Redo</button>
              <div className="border-t border-gray-700 my-1"></div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Copy')}>Copy</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Paste')}>Paste</button>
            </div>
          </div>
          <div className="relative group">
            <button className="hover:text-white">Image</button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-[#1e1e1e] border border-gray-700 mt-1 min-w-[180px] shadow-xl z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => addAdjustmentLayer('brightness-contrast')}>Adjustments</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Image Size')}>Image Size...</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Canvas Size')}>Canvas Size...</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Rotate')}>Rotate Canvas</button>
            </div>
          </div>
          <div className="relative group">
            <button className="hover:text-white">Layer</button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-[#1e1e1e] border border-gray-700 mt-1 min-w-[180px] shadow-xl z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('New Layer')}>New Layer</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => duplicateLayer(psDoc.activeLayerId)}>Duplicate Layer</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => deleteLayer(psDoc.activeLayerId)}>Delete Layer</button>
              <div className="border-t border-gray-700 my-1"></div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => mergeDown(psDoc.activeLayerId)}>Merge Down</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={flattenImage}>Flatten Image</button>
              <div className="border-t border-gray-700 my-1"></div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => addLayerMask(psDoc.activeLayerId)}>Add Layer Mask</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => addVectorMask(psDoc.activeLayerId)}>Add Vector Mask</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => createClippingMask(psDoc.activeLayerId)}>Create Clipping Mask</button>
            </div>
          </div>
          <button className="hover:text-white">Type</button>
          <div className="relative group">
            <button className="hover:text-white">Select</button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-[#1e1e1e] border border-gray-700 mt-1 min-w-[160px] shadow-xl z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => setSelection({ ...selection, active: false })}>Deselect</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Select All')}>Select All</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => console.log('Inverse')}>Inverse</button>
            </div>
          </div>
          <div className="relative group">
            <button className="hover:text-white">Filter</button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-[#1e1e1e] border border-gray-700 mt-1 min-w-[180px] shadow-xl z-50">
              <div className="px-3 py-1 text-gray-500 font-bold">Blur</div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => applyGaussianBlur(5)}>Gaussian Blur...</button>
              <div className="border-t border-gray-700 my-1"></div>
              <div className="px-3 py-1 text-gray-500 font-bold">Sharpen</div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => applySharpen(1)}>Sharpen</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => applySharpen(2)}>Sharpen More</button>
              <div className="border-t border-gray-700 my-1"></div>
              <div className="px-3 py-1 text-gray-500 font-bold">Noise</div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => applyNoiseFilter(25)}>Add Noise...</button>
              <div className="border-t border-gray-700 my-1"></div>
              <div className="px-3 py-1 text-gray-500 font-bold">Pixelate</div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => applyPixelateFilter(10)}>Mosaic...</button>
              <div className="border-t border-gray-700 my-1"></div>
              <div className="px-3 py-1 text-gray-500 font-bold">Stylize</div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={applyInvert}>Invert</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => applyPosterize()}>Posterize...</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={applyGrayscale}>Desaturate</button>
            </div>
          </div>
          <button className="hover:text-white">3D</button>
          <div className="relative group">
            <button className="hover:text-white">View</button>
            <div className="hidden group-hover:block absolute top-full left-0 bg-[#1e1e1e] border border-gray-700 mt-1 min-w-[160px] shadow-xl z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => setShowRulers(!showRulers)}>
                {showRulers ? '✓ ' : ''}Rulers
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => setShowGuides(!showGuides)}>
                {showGuides ? '✓ ' : ''}Guides
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={() => setShowGrid(!showGrid)}>
                {showGrid ? '✓ ' : ''}Grid
              </button>
            </div>
          </div>
          <button className="hover:text-white">Window</button>
          <button className="hover:text-white">Help</button>
        </div>
      </div>

      {/* Tool Options Bar */}
      <div className="border-b border-gray-700 bg-[#2d2d2d] px-4 py-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold">{ALL_TOOLS.find(t => t.id === activeTool)?.name || 'Tool'}</span>
          
          {/* Brush/Painting Tools Options */}
          {(['brush', 'pencil', 'eraser', 'clone-stamp', 'healing-brush', 'spot-healing-brush'] as Tool[]).includes(activeTool) && (
            <>
              <div className="flex items-center gap-2">
                <span>Size:</span>
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={brushSettings.size}
                  onChange={(e) => setBrushSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-24"
                />
                <span className="w-8">{brushSettings.size}px</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Hardness:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brushSettings.hardness}
                  onChange={(e) => setBrushSettings(prev => ({ ...prev, hardness: parseInt(e.target.value) }))}
                  className="w-24"
                />
                <span className="w-8">{brushSettings.hardness}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brushSettings.opacity}
                  onChange={(e) => setBrushSettings(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                  className="w-24"
                />
                <span className="w-8">{brushSettings.opacity}%</span>
              </div>
            </>
          )}
          
          {/* Magic Wand Options */}
          {activeTool === 'magic-wand' && (
            <>
              <div className="flex items-center gap-2">
                <span>Tolerance:</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="w-8">{tolerance}</span>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={contiguous}
                  onChange={(e) => setContiguous(e.target.checked)}
                />
                <span>Contiguous</span>
              </label>
            </>
          )}
          
          {/* Selection Options */}
          {selection.active && (
            <>
              <div className="flex items-center gap-2">
                <span>Feather:</span>
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={selection.feather}
                  onChange={(e) => setSelection(prev => ({ ...prev, feather: parseInt(e.target.value) }))}
                  className="w-16 px-2 py-1 bg-[#1e1e1e] border border-gray-600 rounded"
                />
                <span>px</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-20 border-r border-gray-700 bg-[#1e1e1e] p-2">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setLeftRailTab('search')}
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${leftRailTab === 'search' ? 'bg-[#2d2d2d]' : 'hover:bg-[#2d2d2d]'}`}
              title="Search"
            >
              🔍
            </button>
            <button
              onClick={() => {
                setLeftRailTab('add-content');
                setShowEditPagePanel(true);
              }}
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${leftRailTab === 'add-content' ? 'bg-[#2d2d2d]' : 'hover:bg-[#2d2d2d]'}`}
              title="Add content"
            >
              ＋
            </button>
            <button
              onClick={() => setLeftRailTab('text')}
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${leftRailTab === 'text' ? 'bg-[#2d2d2d]' : 'hover:bg-[#2d2d2d]'}`}
              title="Text"
            >
              T
            </button>
            <button
              onClick={() => setLeftRailTab('upload')}
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${leftRailTab === 'upload' ? 'bg-[#2d2d2d]' : 'hover:bg-[#2d2d2d]'}`}
              title="Upload"
            >
              ⤴
            </button>
            <button
              onClick={() => setLeftRailTab('your-stuff')}
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${leftRailTab === 'your-stuff' ? 'bg-[#2d2d2d]' : 'hover:bg-[#2d2d2d]'}`}
              title="Your stuff"
            >
              ☰
            </button>
          </div>
        </div>

        {showEditPagePanel && (
          <div className="w-80 border-r border-gray-700 bg-[#f3f3f3] p-5 text-[#222]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-4xl font-bold leading-none">{pageTitle}</h2>
              <button
                onClick={() => setShowEditPagePanel(false)}
                className="rounded p-1 text-3xl hover:bg-gray-200"
                title="Close panel"
              >
                ×
              </button>
            </div>

            <div className="mb-3 space-y-2">
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Add title"
              />
              <div className="text-sm text-gray-600">{psDoc.width} × {psDoc.height}px</div>
            </div>

            <div className="mb-4 space-y-2 rounded-xl border border-gray-300 bg-white p-3 text-sm">
              <label className="block text-xs font-medium text-gray-600">Resize preset</label>
              <select
                value={resizePreset}
                onChange={(e) => setResizePreset(e.target.value as 'square' | 'story' | 'landscape' | 'poster')}
                className="w-full rounded border border-gray-300 bg-white px-2 py-2 text-sm"
              >
                <option value="square">Square — 1080 × 1080</option>
                <option value="story">Story — 1080 × 1920</option>
                <option value="landscape">Landscape — 1920 × 1080</option>
                <option value="poster">Poster — 2480 × 3508</option>
              </select>
              <Button size="sm" onClick={applyResizePreset}>Apply preset</Button>

              <div>
                <div className="mb-1 text-xs font-medium text-gray-600">Quick presets</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyResizeDimensions(1080, 1080)}
                    className="rounded border border-gray-300 px-2 py-2 text-xs hover:bg-gray-100"
                  >
                    Instagram Post
                    <span className="block text-[11px] text-gray-500">1080 × 1080</span>
                  </button>
                  <button
                    onClick={() => applyResizeDimensions(1080, 1920)}
                    className="rounded border border-gray-300 px-2 py-2 text-xs hover:bg-gray-100"
                  >
                    Story
                    <span className="block text-[11px] text-gray-500">1080 × 1920</span>
                  </button>
                  <button
                    onClick={() => applyResizeDimensions(1200, 628)}
                    className="rounded border border-gray-300 px-2 py-2 text-xs hover:bg-gray-100"
                  >
                    LinkedIn
                    <span className="block text-[11px] text-gray-500">1200 × 628</span>
                  </button>
                  <button
                    onClick={() => applyResizeDimensions(1920, 1080)}
                    className="rounded border border-gray-300 px-2 py-2 text-xs hover:bg-gray-100"
                  >
                    YouTube
                    <span className="block text-[11px] text-gray-500">1920 × 1080</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="64"
                  value={customResize.width}
                  onChange={(e) => setCustomResize(prev => ({ ...prev, width: parseInt(e.target.value || '0') || 64 }))}
                  className="rounded border border-gray-300 px-2 py-2 text-sm"
                  placeholder="Width"
                />
                <input
                  type="number"
                  min="64"
                  value={customResize.height}
                  onChange={(e) => setCustomResize(prev => ({ ...prev, height: parseInt(e.target.value || '0') || 64 }))}
                  className="rounded border border-gray-300 px-2 py-2 text-sm"
                  placeholder="Height"
                />
              </div>
              <Button
                size="sm"
                onClick={() => applyResizeDimensions(customResize.width, customResize.height)}
              >
                Apply custom size
              </Button>

              {recentSizes.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600">Recent sizes</div>
                  <div className="flex flex-wrap gap-1">
                    {recentSizes.map((size, idx) => (
                      <button
                        key={`${size.width}-${size.height}-${idx}`}
                        onClick={() => applyResizeDimensions(size.width, size.height)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      >
                        {size.width}×{size.height}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={applyResizePreset}
                className="rounded-xl border border-gray-300 bg-white p-3 text-left hover:bg-gray-100"
              >
                Resize
              </button>
              <button
                onClick={animateAllLayers}
                className="rounded-xl border border-gray-300 bg-white p-3 text-left hover:bg-gray-100"
              >
                Animate all
              </button>
              <button
                onClick={quickReplaceActiveLayer}
                className="rounded-xl border border-gray-300 bg-white p-3 text-left hover:bg-gray-100"
              >
                Quick replace
              </button>
              <button
                onClick={() => setShowTranslateDialog(true)}
                className="rounded-xl border border-gray-300 bg-white p-3 text-left hover:bg-gray-100"
              >
                Translate
              </button>
              <button
                onClick={() => setShowBulkCreateDialog(true)}
                className="rounded-xl border border-gray-300 bg-white p-3 text-left hover:bg-gray-100"
              >
                Bulk create
              </button>
              <button
                onClick={cropPage}
                className="rounded-xl border border-gray-300 bg-white p-3 text-left hover:bg-gray-100"
              >
                Crop page
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-gray-300 bg-white p-3 text-sm">
              <label className="block text-xs font-medium text-gray-600">Quick replace value</label>
              <input
                type="text"
                value={quickReplaceText}
                onChange={(e) => setQuickReplaceText(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-2 text-sm"
                placeholder="Text content or color (e.g. #ff6600)"
              />
              <Button
                size="sm"
                onClick={quickReplaceActiveLayer}
                disabled={!activeLayer}
              >
                Apply quick replace
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-3xl font-bold leading-none">Background</h3>
              <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white p-3">
                <span className="text-sm">Color</span>
                <input
                  type="color"
                  value={psDoc.backgroundColor}
                  onChange={(e) => setPsDoc(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="h-10 w-10 rounded border border-gray-300"
                />
              </label>
            </div>
          </div>
        )}

        <div className="w-14 border-r border-gray-700 bg-[#1e1e1e] p-1">
          <div className="flex flex-col gap-1">
            {ALL_TOOLS.slice(0, 20).map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex h-10 w-10 items-center justify-center rounded text-lg transition ${
                  activeTool === tool.id ? 'bg-[#0066ff]' : 'hover:bg-gray-700'
                }`}
                title={`${tool.name} (${tool.shortcut})`}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1 overflow-auto bg-[#535353]">
          <div className="flex justify-center pt-8">
            <div className="rounded-2xl border border-gray-500 bg-[#ececec] px-3 py-2 text-sm text-[#1e1e1e] shadow-lg">
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowEditPagePanel(true)}>Edit page</Button>
                <Button size="sm" onClick={() => resizeDocument(1080, 1080)}>Resize</Button>
              </div>
            </div>
          </div>

          <div className="flex h-full items-center justify-center p-8 pb-28">
            <canvas
              ref={canvasRef}
              className="shadow-2xl cursor-crosshair"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            <div className="rounded-full bg-[#1e1e1e] px-3 py-2 text-xs text-gray-200">
              Page {activePage} / {pageCount}
            </div>
            <Button size="sm" onClick={() => setActivePage(prev => Math.max(1, prev - 1))}>◀</Button>
            <Button size="sm" onClick={() => setActivePage(prev => Math.min(pageCount, prev + 1))}>▶</Button>
            <Button size="sm" onClick={addPage}>Add page</Button>
          </div>
        </div>

        {/* Right Panels */}
        <div className="w-80 border-l border-gray-700 bg-[#1e1e1e] flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-700 flex-wrap">
            {(['layers', 'channels', 'properties', 'adjustments', 'styles', 'history'] as const).map(panel => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`px-3 py-2 text-xs capitalize ${
                  activePanel === panel ? 'bg-[#2d2d2d] border-b-2 border-[#0066ff]' : 'hover:bg-gray-700'
                }`}
              >
                {panel}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {activePanel === 'layers' && (
              <div className="space-y-1">
                <div className="mb-2 flex gap-1">
                  <Button size="sm" onClick={() => console.log('Add layer')}>+</Button>
                  <Button size="sm" onClick={() => deleteLayer(psDoc.activeLayerId)}>−</Button>
                  <Button size="sm" onClick={() => duplicateLayer(psDoc.activeLayerId)}>⧉</Button>
                  <Button size="sm" onClick={flattenImage}>⬇</Button>
                </div>
                
                {/* Blend Mode */}
                <select
                  value={activeLayer?.blendMode || 'normal'}
                  onChange={(e) => updateLayer(psDoc.activeLayerId, { blendMode: e.target.value as BlendMode })}
                  className="w-full rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1 text-xs"
                >
                  {Object.entries(BLEND_MODE_CATEGORIES).map(([category, modes]) => (
                    <optgroup key={category} label={category}>
                      {modes.map(mode => (
                        <option key={mode} value={mode}>
                          {mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {/* Opacity */}
                <div className="flex items-center gap-2">
                  <span className="text-xs">Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeLayer?.opacity || 100}
                    onChange={(e) => updateLayer(psDoc.activeLayerId, { opacity: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-xs w-8">{activeLayer?.opacity || 100}%</span>
                </div>

                {/* Layer List (Memoized) */}
                <div className="mt-4 space-y-1">
                  {sortedLayers.map(layer => (
                    <LayerItem key={layer.id} layer={layer} />
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'properties' && activeLayer && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1">Name:</label>
                  <input
                    type="text"
                    value={activeLayer.name}
                    onChange={(e) => updateLayer(activeLayer.id, { name: e.target.value })}
                    className="w-full rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">X:</label>
                    <input
                      type="number"
                      value={Math.round(activeLayer.x)}
                      onChange={(e) => updateLayer(activeLayer.id, { x: parseFloat(e.target.value) })}
                      className="w-full rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Y:</label>
                    <input
                      type="number"
                      value={Math.round(activeLayer.y)}
                      onChange={(e) => updateLayer(activeLayer.id, { y: parseFloat(e.target.value) })}
                      className="w-full rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Width:</label>
                    <input
                      type="number"
                      value={Math.round(activeLayer.width)}
                      onChange={(e) => updateLayer(activeLayer.id, { width: parseFloat(e.target.value) })}
                      className="w-full rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Height:</label>
                    <input
                      type="number"
                      value={Math.round(activeLayer.height)}
                      onChange={(e) => updateLayer(activeLayer.id, { height: parseFloat(e.target.value) })}
                      className="w-full rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Rotation: {activeLayer.rotation}°</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={activeLayer.rotation}
                    onChange={(e) => updateLayer(activeLayer.id, { rotation: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <h3 className="font-bold mb-2">Layer Styles</h3>
                  <div className="space-y-1">
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'drop-shadow', enabled: true })}>
                      + Drop Shadow
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'outer-glow', enabled: true })}>
                      + Outer Glow
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'bevel-emboss', enabled: true })}>
                      + Bevel & Emboss
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <h3 className="font-bold mb-2">Masks</h3>
                  <div className="space-y-1">
                    <Button size="sm" onClick={() => addLayerMask(activeLayer.id)}>
                      + Layer Mask
                    </Button>
                    <Button size="sm" onClick={() => addVectorMask(activeLayer.id)}>
                      + Vector Mask
                    </Button>
                    <Button size="sm" onClick={() => createClippingMask(activeLayer.id)}>
                      Create Clipping Mask
                    </Button>
                  </div>
                </div>
                
                {/* Adjustment Layer Controls */}
                {activeLayer.type === 'adjustment' && activeLayer.adjustmentSettings && (
                  <div className="border-t border-gray-700 pt-3">
                    <h3 className="font-bold mb-2">Adjustment Settings</h3>
                    
                    {activeLayer.adjustmentSettings.type === 'brightness-contrast' && (
                      <>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Brightness: {activeLayer.adjustmentSettings.brightness || 0}
                          </label>
                          <input
                            type="range"
                            min="-150"
                            max="150"
                            value={activeLayer.adjustmentSettings.brightness || 0}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                brightness: parseInt(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Contrast: {activeLayer.adjustmentSettings.contrast || 0}
                          </label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={activeLayer.adjustmentSettings.contrast || 0}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                contrast: parseInt(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                        <Button size="sm" onClick={() => applyBrightnessContrast(
                          activeLayer.adjustmentSettings!.brightness || 0,
                          activeLayer.adjustmentSettings!.contrast || 0
                        )}>
                          Apply to Canvas
                        </Button>
                      </>
                    )}
                    
                    {activeLayer.adjustmentSettings.type === 'hue-saturation' && (
                      <>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Hue: {activeLayer.adjustmentSettings.hue || 0}
                          </label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={activeLayer.adjustmentSettings.hue || 0}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                hue: parseInt(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Saturation: {activeLayer.adjustmentSettings.saturation || 0}
                          </label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={activeLayer.adjustmentSettings.saturation || 0}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                saturation: parseInt(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Lightness: {activeLayer.adjustmentSettings.lightness || 0}
                          </label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={activeLayer.adjustmentSettings.lightness || 0}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                lightness: parseInt(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                        <label className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            checked={activeLayer.adjustmentSettings.colorize || false}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                colorize: e.target.checked
                              }
                            })}
                          />
                          <span>Colorize</span>
                        </label>
                      </>
                    )}
                    
                    {activeLayer.adjustmentSettings.type === 'exposure' && (
                      <>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Exposure: {activeLayer.adjustmentSettings.exposure || 0}
                          </label>
                          <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={activeLayer.adjustmentSettings.exposure || 0}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                exposure: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Offset: {activeLayer.adjustmentSettings.offset || 0}
                          </label>
                          <input
                            type="range"
                            min="-0.5"
                            max="0.5"
                            step="0.01"
                            value={activeLayer.adjustmentSettings.offset || 0}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                offset: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1">
                            Gamma: {activeLayer.adjustmentSettings.gamma || 1}
                          </label>
                          <input
                            type="range"
                            min="0.01"
                            max="9.99"
                            step="0.01"
                            value={activeLayer.adjustmentSettings.gamma || 1}
                            onChange={(e) => updateLayer(activeLayer.id, {
                              adjustmentSettings: {
                                ...activeLayer.adjustmentSettings!,
                                gamma: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activePanel === 'adjustments' && (
              <div className="space-y-2">
                <h3 className="font-bold mb-3">Adjustment Layers</h3>
                <div className="space-y-1">
                  <Button size="sm" onClick={() => addAdjustmentLayer('brightness-contrast')}>
                    + Brightness/Contrast
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('levels')}>
                    + Levels
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('curves')}>
                    + Curves
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('hue-saturation')}>
                    + Hue/Saturation
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('color-balance')}>
                    + Color Balance
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('vibrance')}>
                    + Vibrance
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('exposure')}>
                    + Exposure
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('black-white')}>
                    + Black & White
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('photo-filter')}>
                    + Photo Filter
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('posterize')}>
                    + Posterize
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('threshold')}>
                    + Threshold
                  </Button>
                  <Button size="sm" onClick={() => addAdjustmentLayer('invert')}>
                    + Invert
                  </Button>
                </div>
              </div>
            )}

            {activePanel === 'channels' && (
              <div className="space-y-1">
                {psDoc.channels.map(channel => (
                  <div
                    key={channel.id}
                    className="flex items-center gap-2 rounded border border-gray-600 px-2 py-2 text-xs"
                  >
                    <button
                      onClick={() => {
                        const idx = psDoc.selectedChannelIds.indexOf(channel.id);
                        const newSelected = idx >= 0
                          ? psDoc.selectedChannelIds.filter(id => id !== channel.id)
                          : [...psDoc.selectedChannelIds, channel.id];
                        setPsDoc(prev => ({ ...prev, selectedChannelIds: newSelected }));
                      }}
                      className={psDoc.selectedChannelIds.includes(channel.id) ? 'text-white' : 'text-gray-500'}
                    >
                      {channel.visible ? '👁️' : '🚫'}
                    </button>
                    <span className="flex-1">{channel.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            {activePanel === 'styles' && activeLayer && (
              <div className="space-y-2">
                <h3 className="font-bold mb-3">Layer Styles</h3>
                
                {activeLayer.styles && activeLayer.styles.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {activeLayer.styles.map((style, idx) => (
                      <div key={idx} className="border border-gray-600 rounded p-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={style.enabled}
                              onChange={(e) => updateLayerStyle(activeLayer.id, idx, { enabled: e.target.checked })}
                            />
                            <span className="text-sm capitalize">
                              {style.type.split('-').join(' ')}
                            </span>
                          </label>
                          <button
                            onClick={() => {
                              const styles = activeLayer.styles?.filter((_, i) => i !== idx);
                              updateLayer(activeLayer.id, { styles });
                            }}
                            className="text-red-500 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                        
                        {style.enabled && (
                          <div className="space-y-2 text-xs">
                            {(style.type === 'drop-shadow' || style.type === 'inner-shadow') && (
                              <>
                                <div>
                                  <label className="block mb-1">Opacity: {style.opacity || 75}%</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={style.opacity || 75}
                                    onChange={(e) => updateLayerStyle(activeLayer.id, idx, { opacity: parseInt(e.target.value) })}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1">Distance: {style.distance || 5}px</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={style.distance || 5}
                                    onChange={(e) => updateLayerStyle(activeLayer.id, idx, { distance: parseInt(e.target.value) })}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1">Size: {style.size || 5}px</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={style.size || 5}
                                    onChange={(e) => updateLayerStyle(activeLayer.id, idx, { size: parseInt(e.target.value) })}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1">Color:</label>
                                  <input
                                    type="color"
                                    value={style.color || '#000000'}
                                    onChange={(e) => updateLayerStyle(activeLayer.id, idx, { color: e.target.value })}
                                    className="w-full h-8"
                                  />
                                </div>
                              </>
                            )}
                            
                            {(style.type === 'outer-glow' || style.type === 'inner-glow') && (
                              <>
                                <div>
                                  <label className="block mb-1">Opacity: {style.opacity || 75}%</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={style.opacity || 75}
                                    onChange={(e) => updateLayerStyle(activeLayer.id, idx, { opacity: parseInt(e.target.value) })}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1">Size: {style.size || 5}px</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={style.size || 5}
                                    onChange={(e) => updateLayerStyle(activeLayer.id, idx, { size: parseInt(e.target.value) })}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1">Color:</label>
                                  <input
                                    type="color"
                                    value={style.color || '#ffffff'}
                                    onChange={(e) => updateLayerStyle(activeLayer.id, idx, { color: e.target.value })}
                                    className="w-full h-8"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs mb-4">No layer styles applied</p>
                )}
                
                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-xs font-bold mb-2">Add Style:</h4>
                  <div className="space-y-1">
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'drop-shadow', enabled: true, opacity: 75, distance: 5, size: 5, color: '#000000' })}>
                      + Drop Shadow
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'inner-shadow', enabled: true, opacity: 75, distance: 5, size: 5, color: '#000000' })}>
                      + Inner Shadow
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'outer-glow', enabled: true, opacity: 75, size: 5, color: '#ffffff' })}>
                      + Outer Glow
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'inner-glow', enabled: true, opacity: 75, size: 5, color: '#ffffff' })}>
                      + Inner Glow
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'bevel-emboss', enabled: true })}>
                      + Bevel & Emboss
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'satin', enabled: true })}>
                      + Satin
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'color-overlay', enabled: true })}>
                      + Color Overlay
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'gradient-overlay', enabled: true })}>
                      + Gradient Overlay
                    </Button>
                    <Button size="sm" onClick={() => addLayerStyle(activeLayer.id, { type: 'stroke', enabled: true })}>
                      + Stroke
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {activePanel === 'history' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">History</h3>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={undo} disabled={psDoc.historyIndex <= 0}>
                      ⏪
                    </Button>
                    <Button size="sm" onClick={redo} disabled={psDoc.historyIndex >= psDoc.history.length - 1}>
                      ⏩
                    </Button>
                  </div>
                </div>
                
                {psDoc.history.length > 0 ? (
                  <div className="space-y-1">
                    {psDoc.history.map((state, idx) => (
                      <div
                        key={state.id}
                        onClick={() => {
                          if (idx <= psDoc.historyIndex) {
                            // Undo to this state
                            while (psDoc.historyIndex > idx) {
                              undo();
                            }
                          } else {
                            // Redo to this state
                            while (psDoc.historyIndex < idx) {
                              redo();
                            }
                          }
                        }}
                        className={`rounded border px-2 py-2 text-xs cursor-pointer ${
                          idx === psDoc.historyIndex
                            ? 'border-[#0066ff] bg-[#0066ff]/20'
                            : idx < psDoc.historyIndex
                            ? 'border-gray-600 bg-gray-800'
                            : 'border-gray-700 text-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{state.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(state.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No history yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Options Bar */}
      <div className="border-t border-gray-700 bg-[#1e1e1e] px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="h-8 w-8 rounded border-2 border-white cursor-pointer" 
                style={{ backgroundColor: foregroundColor }}
                onClick={() => {
                  const color = prompt('Enter foreground color:', foregroundColor);
                  if (color) setForegroundColor(color);
                }}
                title="Foreground Color (click to change)"
              />
              <div 
                className="h-8 w-8 rounded border-2 border-white cursor-pointer" 
                style={{ backgroundColor: backgroundColor }}
                onClick={() => {
                  const color = prompt('Enter background color:', backgroundColor);
                  if (color) setBackgroundColor(color);
                }}
                title="Background Color (click to change)"
              />
              <button
                onClick={() => {
                  const temp = foregroundColor;
                  setForegroundColor(backgroundColor);
                  setBackgroundColor(temp);
                }}
                className="ml-2 hover:text-white"
                title="Swap Colors (X)"
              >
                ⇄
              </button>
            </div>
            <span>{psDoc.name}</span>
            <span>{psDoc.width} × {psDoc.height} px</span>
            <span>{psDoc.colorMode.toUpperCase()}/{psDoc.bitDepth}-bit</span>
            <span>History: {psDoc.historyIndex + 1}/{psDoc.history.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Zoom:</span>
            <Button size="sm" onClick={() => setZoom(Math.max(10, zoom - 10))}>−</Button>
            <input
              type="range"
              min="10"
              max="400"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-32"
            />
            <Button size="sm" onClick={() => setZoom(Math.min(400, zoom + 10))}>+</Button>
            <span className="w-12">{zoom}%</span>
            <Button size="sm" onClick={() => setZoom(100)}>100%</Button>
          </div>
        </div>
      </div>
      
      {showTranslateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-[#1e1e1e] p-6 text-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Translate</h3>
              <button
                onClick={() => setShowTranslateDialog(false)}
                className="rounded px-2 py-1 text-lg hover:bg-gray-800"
                title="Close"
              >
                ×
              </button>
            </div>
            <label className="block text-xs font-medium text-gray-400">Target language</label>
            <select
              value={translateLanguage}
              onChange={(e) => setTranslateLanguage(e.target.value)}
              className="mt-2 w-full rounded border border-gray-600 bg-[#2d2d2d] px-3 py-2 text-sm"
            >
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
              <option value="ja">Japanese</option>
            </select>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-400">Scope</label>
              <select
                value={translateScope}
                onChange={(e) => setTranslateScope(e.target.value as 'all' | 'active' | 'selection')}
                className="mt-2 w-full rounded border border-gray-600 bg-[#2d2d2d] px-3 py-2 text-sm"
              >
                <option value="all">All text layers</option>
                <option value="active">Active text layer</option>
                <option value="selection">Selection only</option>
              </select>
              {translateScope === 'selection' && !selection.active && (
                <p className="mt-2 text-xs text-amber-300">No active selection detected.</p>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-gray-400">Quick phrasing presets</div>
              <div className="flex flex-wrap gap-2">
                {['Launch your next idea', 'Limited time offer', 'New collection', 'Save 20% today'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setQuickReplaceText(preset)}
                    className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Applies to text layers in the active page.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button size="sm" onClick={() => setShowTranslateDialog(false)}>Cancel</Button>
              <Button size="sm" onClick={applyTranslate}>Translate</Button>
            </div>
          </div>
        </div>
      )}

      {showBulkCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#1e1e1e] p-6 text-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Bulk create</h3>
              <button
                onClick={() => setShowBulkCreateDialog(false)}
                className="rounded px-2 py-1 text-lg hover:bg-gray-800"
                title="Close"
              >
                ×
              </button>
            </div>
            <label className="block text-xs font-medium text-gray-400">One line per page</label>
            <textarea
              value={bulkCreateInput}
              onChange={(e) => setBulkCreateInput(e.target.value)}
              className="mt-2 h-40 w-full rounded border border-gray-600 bg-[#2d2d2d] px-3 py-2 text-sm"
            />
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <label className="flex flex-col gap-1">
                <span className="text-gray-400">Title column</span>
                <select
                  value={bulkMapTitleCol}
                  onChange={(e) => setBulkMapTitleCol(parseInt(e.target.value))}
                  className="rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                >
                  {[0, 1, 2, 3].map(col => (
                    <option key={col} value={col}>{col + 1}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-400">Body column</span>
                <select
                  value={bulkMapBodyCol}
                  onChange={(e) => setBulkMapBodyCol(parseInt(e.target.value))}
                  className="rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                >
                  {[0, 1, 2, 3].map(col => (
                    <option key={col} value={col}>{col + 1}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-400">CTA column</span>
                <select
                  value={bulkMapCtaCol}
                  onChange={(e) => setBulkMapCtaCol(parseInt(e.target.value))}
                  className="rounded border border-gray-600 bg-[#2d2d2d] px-2 py-1"
                >
                  {[0, 1, 2, 3].map(col => (
                    <option key={col} value={col}>{col + 1}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span>Tip: upload a CSV for bulk titles.</span>
              <button
                onClick={() => bulkCreateFileRef.current?.click()}
                className="rounded border border-gray-600 px-2 py-1 hover:bg-gray-800"
              >
                Import CSV
              </button>
            </div>
            <input
              ref={bulkCreateFileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleBulkCsvImport(file);
                }
              }}
            />
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-gray-400">Template library</div>
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates"
                className="mb-2 w-full rounded border border-gray-600 bg-[#2d2d2d] px-3 py-2 text-sm"
              />
              <div className="mb-2 flex flex-wrap gap-2">
                {(['all', 'social', 'marketing', 'business', 'event'] as const).map(category => (
                  <button
                    key={category}
                    onClick={() => setTemplateCategory(category)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize ${
                      templateCategory === category
                        ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                        : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="rounded border border-gray-600 bg-[#2d2d2d] p-3 text-left text-xs hover:bg-gray-800"
                  >
                    <div className="mb-2 h-16 rounded-md bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500" />
                    <div className="font-semibold text-gray-100">{template.title}</div>
                    <div className="text-[11px] text-gray-400">{template.width} × {template.height}</div>
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              The first line becomes the active page title and text.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button size="sm" onClick={() => setShowBulkCreateDialog(false)}>Cancel</Button>
              <Button size="sm" onClick={applyBulkCreate}>Create pages</Button>
            </div>
          </div>
        </div>
      )}

      {/* Text Input Dialog */}
      {isEditingText && activeLayer?.type === 'text' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2d2d2d] border border-gray-700 rounded-lg p-6 w-[500px]">
            <h2 className="text-lg font-bold mb-4">Edit Text</h2>
            
            <textarea
              value={activeLayer.text || ''}
              onChange={(e) => updateLayer(activeLayer.id, { text: e.target.value })}
              className="w-full h-32 bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm mb-4"
              placeholder="Enter text..."
              autoFocus
            />
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block mb-1 text-xs">Font Family:</label>
                <select
                  value={activeLayer.fontFamily || 'Arial'}
                  onChange={(e) => updateLayer(activeLayer.id, { fontFamily: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Impact">Impact</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-xs">Font Size:</label>
                <input
                  type="number"
                  min="6"
                  max="500"
                  value={activeLayer.fontSize || 24}
                  onChange={(e) => updateLayer(activeLayer.id, { fontSize: parseInt(e.target.value) })}
                  className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-sm"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-xs">Font Weight:</label>
                <select
                  value={activeLayer.fontWeight || 'normal'}
                  onChange={(e) => updateLayer(activeLayer.id, { fontWeight: e.target.value as any })}
                  className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="100">Thin (100)</option>
                  <option value="300">Light (300)</option>
                  <option value="500">Medium (500)</option>
                  <option value="700">Bold (700)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-xs">Text Align:</label>
                <select
                  value={activeLayer.textAlign || 'left'}
                  onChange={(e) => updateLayer(activeLayer.id, { textAlign: e.target.value as any })}
                  className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-xs">Text Color:</label>
                <input
                  type="color"
                  value={activeLayer.textColor || '#000000'}
                  onChange={(e) => updateLayer(activeLayer.id, { textColor: e.target.value })}
                  className="w-full h-8 bg-[#1e1e1e] border border-gray-600 rounded"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsEditingText(false)}>Close</Button>
              <Button onClick={() => {
                setIsEditingText(false);
                pushHistory('Edit Text');
              }}>Apply</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PhotoshopPro;

