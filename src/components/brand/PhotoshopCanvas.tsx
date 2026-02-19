'use client';

import { ChangeEvent, MouseEvent, WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ToolType = 'select' | 'rect' | 'ellipse' | 'pen' | 'text' | 'brush' | 'eraser' | 'fill' | 'gradient' | 'eyedropper' | 'hand' | 'zoom';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
type LayerType = 'raster' | 'text' | 'shape' | 'adjustment' | 'group';
type AdjustmentType = 'levels' | 'curves' | 'brightness-contrast' | 'hue-saturation' | 'color-balance' | 'exposure' | 'vibrance';
type ShapeType = 'rect' | 'ellipse' | 'line' | 'polygon';

interface GradientStop {
  position: number;
  color: string;
}

interface Gradient {
  id: string;
  type: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing: number;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
}

interface ShapeDefinition {
  type: ShapeType;
  width: number;
  height: number;
  radius?: number;
  sides?: number;
}

interface LayerFilter {
  type: 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'hue-rotate' | 'invert' | 'opacity' | 'saturate' | 'sepia';
  value: number;
}

interface AdjustmentLayer {
  type: AdjustmentType;
  settings: Record<string, number>;
}

interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  clipped: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  
  // Raster-specific
  imageData?: ImageData;
  
  // Text-specific
  text?: string;
  textStyle?: TextStyle;
  textColor?: string;
  
  // Shape-specific
  shape?: ShapeDefinition;
  fillColor?: string;
  fillGradient?: Gradient;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Adjustment layer
  adjustment?: AdjustmentLayer;
  
  // Layer effects
  filters?: LayerFilter[];
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  
  // Group-specific
  children?: string[];
  collapsed?: boolean;
}

interface HistoryState {
  layers: Layer[];
  selectedLayerId: string;
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
}

interface DocumentState {
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
  layers: Layer[];
  selectedLayerId: string;
  history: HistoryState[];
  historyIndex: number;
  zoom: number;
  panX: number;
  panY: number;
  gridVisible: boolean;
  gridSize: number;
  guidesVisible: boolean;
  rulers: boolean;
  snapToGrid: boolean;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;
const DEFAULT_CANVAS_BACKGROUND = '#ffffff';
const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function makeId(prefix: string = 'layer') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createBlankLayer(name: string, width: number = 100, height: number = 100): Layer {
  return {
    id: makeId('layer'),
    name,
    type: 'raster',
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    locked: false,
    clipped: false,
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    flipH: false,
    flipV: false,
    filters: [],
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };
}

function createTextLayer(text: string, x: number, y: number): Layer {
  return {
    id: makeId('text'),
    name: `Text Layer`,
    type: 'text',
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    locked: false,
    clipped: false,
    x,
    y,
    width: 200,
    height: 50,
    rotation: 0,
    flipH: false,
    flipV: false,
    text,
    textColor: '#000000',
    textStyle: {
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 1.2,
      textAlign: 'left',
    },
    filters: [],
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };
}

function createShapeLayer(shapeType: ShapeType, x: number, y: number, width: number, height: number): Layer {
  return {
    id: makeId('shape'),
    name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
    type: 'shape',
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    locked: false,
    clipped: false,
    x,
    y,
    width,
    height,
    rotation: 0,
    flipH: false,
    flipV: false,
    fillColor: '#000000',
    strokeColor: '#ffffff',
    strokeWidth: 1,
    shape: {
      type: shapeType,
      width,
      height,
      radius: shapeType === 'rect' ? 0 : undefined,
    },
    filters: [],
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };
}

// ============================================================================
// PHOTOSHOP CANVAS COMPONENT
// ============================================================================

export function PhotoshopCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageMapRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // ========== STATE ==========
  const [state, setState] = useState<DocumentState>({
    canvasWidth: DEFAULT_CANVAS_WIDTH,
    canvasHeight: DEFAULT_CANVAS_HEIGHT,
    canvasBackground: DEFAULT_CANVAS_BACKGROUND,
    layers: [createBlankLayer('Background', DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT)],
    selectedLayerId: '',
    history: [],
    historyIndex: -1,
    zoom: 1,
    panX: 0,
    panY: 0,
    gridVisible: false,
    gridSize: 20,
    guidesVisible: false,
    rulers: true,
    snapToGrid: false,
  });

  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [selectedLayerId, setSelectedLayerId] = useState<string>(state.layers[0]?.id ?? '');

  const dragRef = useRef<{ active: boolean; startX: number; startY: number; offsetX: number; offsetY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // ========== COMPUTED ==========
  const selectedLayer = useMemo(() => state.layers.find((l) => l.id === selectedLayerId) ?? null, [state.layers, selectedLayerId]);

  // ========== HISTORY ==========
  const pushHistory = useCallback(() => {
    const newState: HistoryState = {
      layers: state.layers,
      selectedLayerId,
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      canvasBackground: state.canvasBackground,
    };
    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(newState);
    setState((prev) => ({
      ...prev,
      history: nextHistory.slice(-50),
      historyIndex: Math.min(nextHistory.length - 1, 49),
    }));
  }, [state.history, state.historyIndex, state.layers, selectedLayerId, state.canvasWidth, state.canvasHeight, state.canvasBackground]);

  const undo = useCallback(() => {
    if (state.historyIndex <= 0) return;
    const nextIndex = state.historyIndex - 1;
    const snapshot = state.history[nextIndex];
    setState((prev) => ({
      ...prev,
      layers: snapshot.layers,
      canvasWidth: snapshot.canvasWidth,
      canvasHeight: snapshot.canvasHeight,
      canvasBackground: snapshot.canvasBackground,
      historyIndex: nextIndex,
    }));
    setSelectedLayerId(snapshot.selectedLayerId);
  }, [state.history, state.historyIndex]);

  const redo = useCallback(() => {
    if (state.historyIndex >= state.history.length - 1) return;
    const nextIndex = state.historyIndex + 1;
    const snapshot = state.history[nextIndex];
    setState((prev) => ({
      ...prev,
      layers: snapshot.layers,
      canvasWidth: snapshot.canvasWidth,
      canvasHeight: snapshot.canvasHeight,
      canvasBackground: snapshot.canvasBackground,
      historyIndex: nextIndex,
    }));
    setSelectedLayerId(snapshot.selectedLayerId);
  }, [state.history, state.historyIndex]);

  // ========== LAYER OPERATIONS ==========
  const updateLayer = useCallback(
    (id: string, patch: Partial<Layer>) => {
      const nextLayers = state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...patch } : layer
      );
      setState((prev) => ({ ...prev, layers: nextLayers }));
    },
    [state.layers]
  );

  const addLayer = useCallback(
    (layer: Layer) => {
      pushHistory();
      const nextLayers = [...state.layers, layer];
      setState((prev) => ({ ...prev, layers: nextLayers }));
      setSelectedLayerId(layer.id);
    },
    [state.layers, pushHistory]
  );

  const deleteLayer = useCallback(
    (id: string) => {
      if (state.layers.length <= 1) return;
      pushHistory();
      const nextLayers = state.layers.filter((l) => l.id !== id);
      setState((prev) => ({ ...prev, layers: nextLayers }));
      if (selectedLayerId === id) {
        setSelectedLayerId(nextLayers[nextLayers.length - 1]?.id ?? '');
      }
    },
    [state.layers, selectedLayerId, pushHistory]
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      pushHistory();
      const layer = state.layers.find((l) => l.id === id);
      if (!layer) return;
      const copy: Layer = { ...layer, id: makeId(layer.type), name: `${layer.name} Copy`, x: layer.x + 10, y: layer.y + 10 };
      const nextLayers = [...state.layers, copy];
      setState((prev) => ({ ...prev, layers: nextLayers }));
      setSelectedLayerId(copy.id);
    },
    [state.layers, pushHistory]
  );

  const moveLayerUp = useCallback(
    (id: string) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index < 0 || index === state.layers.length - 1) return;
      pushHistory();
      const nextLayers = [...state.layers];
      [nextLayers[index], nextLayers[index + 1]] = [nextLayers[index + 1], nextLayers[index]];
      setState((prev) => ({ ...prev, layers: nextLayers }));
    },
    [state.layers, pushHistory]
  );

  const moveLayerDown = useCallback(
    (id: string) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index <= 0) return;
      pushHistory();
      const nextLayers = [...state.layers];
      [nextLayers[index], nextLayers[index - 1]] = [nextLayers[index - 1], nextLayers[index]];
      setState((prev) => ({ ...prev, layers: nextLayers }));
    },
    [state.layers, pushHistory]
  );

  // ========== CANVAS RENDERING ==========
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = state.canvasBackground;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

    // Draw grid if visible
    if (state.gridVisible) {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= state.canvasWidth; x += state.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, state.canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= state.canvasHeight; y += state.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(state.canvasWidth, y);
        ctx.stroke();
      }
    }

    // Draw all visible layers
    state.layers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      
      // Map PS blend modes to canvas composite operations
      const blendModeMap: Record<BlendMode, GlobalCompositeOperation> = {
        normal: 'source-over',
        multiply: 'multiply',
        screen: 'screen',
        overlay: 'overlay',
        darken: 'darken',
        lighten: 'lighten',
        'color-dodge': 'color-dodge',
        'color-burn': 'color-burn',
        'hard-light': 'hard-light',
        'soft-light': 'soft-light',
        difference: 'difference',
        exclusion: 'exclusion',
        hue: 'hue',
        saturation: 'saturation',
        color: 'color',
        luminosity: 'luminosity',
      };
      
      ctx.globalCompositeOperation = blendModeMap[layer.blendMode] ?? 'source-over';

      // Apply filters
      if (layer.filters && layer.filters.length > 0) {
        const filterString = layer.filters
          .map((f) => {
            if (f.type === 'blur') return `blur(${f.value}px)`;
            if (f.type === 'brightness') return `brightness(${f.value}%)`;
            if (f.type === 'contrast') return `contrast(${f.value}%)`;
            if (f.type === 'grayscale') return `grayscale(${f.value}%)`;
            if (f.type === 'hue-rotate') return `hue-rotate(${f.value}deg)`;
            if (f.type === 'invert') return `invert(${f.value}%)`;
            if (f.type === 'saturate') return `saturate(${f.value}%)`;
            if (f.type === 'sepia') return `sepia(${f.value}%)`;
            return '';
          })
          .filter(Boolean)
          .join(' ');
        if (filterString) {
          ctx.filter = filterString;
        }
      }

      // Apply shadow
      if (layer.shadowBlur && layer.shadowBlur > 0) {
        ctx.shadowColor = layer.shadowColor || 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = layer.shadowBlur;
        ctx.shadowOffsetX = layer.shadowOffsetX || 0;
        ctx.shadowOffsetY = layer.shadowOffsetY || 0;
      }

      // Draw layer by type
      if (layer.type === 'raster' && layer.imageData) {
        ctx.putImageData(layer.imageData, layer.x, layer.y);
      } else if (layer.type === 'text' && layer.text && layer.textStyle) {
        ctx.fillStyle = layer.textColor || '#000000';
        ctx.font = `${layer.textStyle.fontWeight} ${layer.textStyle.fontSize}px ${layer.textStyle.fontFamily}`;
        ctx.textAlign = layer.textStyle.textAlign;
        ctx.fillText(layer.text, layer.x, layer.y + layer.textStyle.fontSize);
      } else if (layer.type === 'shape' && layer.shape) {
        const shape = layer.shape;
        if (shape.type === 'rect') {
          ctx.fillStyle = layer.fillColor || '#000000';
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          if (layer.strokeWidth && layer.strokeWidth > 0) {
            ctx.strokeStyle = layer.strokeColor || '#ffffff';
            ctx.lineWidth = layer.strokeWidth;
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          }
        } else if (shape.type === 'ellipse') {
          ctx.fillStyle = layer.fillColor || '#000000';
          ctx.beginPath();
          ctx.ellipse(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          if (layer.strokeWidth && layer.strokeWidth > 0) {
            ctx.strokeStyle = layer.strokeColor || '#ffffff';
            ctx.lineWidth = layer.strokeWidth;
            ctx.stroke();
          }
        }
      }

      // Draw highlight if selected
      if (layer.id === selectedLayerId) {
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
      }

      ctx.restore();
    });
  }, [state.layers, state.canvasWidth, state.canvasHeight, state.canvasBackground, state.gridVisible, state.gridSize, selectedLayerId]);

  // ========== MOUSE HANDLERS ==========
  const getCanvasCoords = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left - state.panX) / state.zoom;
      const y = (event.clientY - rect.top - state.panY) / state.zoom;
      return { x, y };
    },
    [state.panX, state.panY, state.zoom]
  );

  const handleCanvasMouseDown = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoords(event);
      dragRef.current = { active: true, startX: coords.x, startY: coords.y, offsetX: 0, offsetY: 0 };

      if (activeTool === 'select') {
        // Hit test to select layer
        for (let i = state.layers.length - 1; i >= 0; i--) {
          const layer = state.layers[i];
          if (!layer.visible) continue;
          if (
            coords.x >= layer.x &&
            coords.x <= layer.x + layer.width &&
            coords.y >= layer.y &&
            coords.y <= layer.y + layer.height
          ) {
            setSelectedLayerId(layer.id);
            return;
          }
        }
      } else if (activeTool === 'hand') {
        // Pan
      } else if (activeTool === 'text' && selectedLayer && selectedLayer.type === 'text') {
        // Text editing mode
      }
    },
    [activeTool, state.layers, getCanvasCoords, selectedLayer]
  );

  const handleCanvasMouseMove = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      if (!dragRef.current.active) return;
      const coords = getCanvasCoords(event);

      if (activeTool === 'select' && selectedLayer) {
        const dx = coords.x - dragRef.current.startX;
        const dy = coords.y - dragRef.current.startY;
        updateLayer(selectedLayer.id, { x: selectedLayer.x + dx, y: selectedLayer.y + dy });
        dragRef.current.startX = coords.x;
        dragRef.current.startY = coords.y;
      } else if (activeTool === 'hand') {
        const dx = event.clientX - dragRef.current.offsetX;
        const dy = event.clientY - dragRef.current.offsetY;
        setState((prev) => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
        dragRef.current.offsetX = event.clientX;
        dragRef.current.offsetY = event.clientY;
      } else if (activeTool === 'brush' && selectedLayer && selectedLayer.type === 'raster') {
        // Brush painting logic
      }
    },
    [activeTool, selectedLayer, getCanvasCoords, updateLayer]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (dragRef.current.active && activeTool === 'select' && selectedLayer) {
      pushHistory();
    }
    dragRef.current.active = false;
  }, [activeTool, selectedLayer, pushHistory]);

  const handleCanvasWheel = useCallback(
    (event: WheelEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const nextZoom = clamp(state.zoom * delta, 0.1, 5);
      setState((prev) => ({ ...prev, zoom: nextZoom }));
    },
    [state.zoom]
  );

  // ========== KEYBOARD SHORTCUTS ==========
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (modifier && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      } else if (event.key === 'Delete' && selectedLayer) {
        event.preventDefault();
        deleteLayer(selectedLayer.id);
      } else if (event.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (event.key.toLowerCase() === 'h') {
        setActiveTool('hand');
      } else if (event.key.toLowerCase() === 't') {
        setActiveTool('text');
      } else if (event.key.toLowerCase() === 'b') {
        setActiveTool('brush');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedLayer, deleteLayer]);

  // ========== EXPORT ==========
  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `ps-canvas-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  }, []);

  // ========== RENDER ==========
  return (
    <div className="flex h-screen w-full flex-col bg-slate-900 text-slate-100">
      {/* TOP TOOLBAR */}
      <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant={activeTool === 'select' ? 'primary' : 'secondary'} onClick={() => setActiveTool('select')} title="Selection (V)">
            ◤
          </Button>
          <Button size="sm" variant={activeTool === 'rect' ? 'primary' : 'secondary'} onClick={() => setActiveTool('rect')} title="Rectangle">
            □
          </Button>
          <Button size="sm" variant={activeTool === 'ellipse' ? 'primary' : 'secondary'} onClick={() => setActiveTool('ellipse')} title="Ellipse">
            ○
          </Button>
          <Button size="sm" variant={activeTool === 'text' ? 'primary' : 'secondary'} onClick={() => setActiveTool('text')} title="Text (T)">
            T
          </Button>
          <Button size="sm" variant={activeTool === 'brush' ? 'primary' : 'secondary'} onClick={() => setActiveTool('brush')} title="Brush (B)">
            ✏
          </Button>
          <Button size="sm" variant={activeTool === 'hand' ? 'primary' : 'secondary'} onClick={() => setActiveTool('hand')} title="Hand (H)">
            ✋
          </Button>
          <Button size="sm" variant={activeTool === 'eyedropper' ? 'primary' : 'secondary'} onClick={() => setActiveTool('eyedropper')} title="Color Picker">
            💧
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-600" />

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs">
            Zoom:
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={state.zoom}
              onChange={(e) => setState((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))}
              className="w-16"
            />
            {(state.zoom * 100).toFixed(0)}%
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => setState((prev) => ({ ...prev, gridVisible: !prev.gridVisible }))} title="Toggle Grid">
            Grid
          </Button>
          <Button size="sm" onClick={() => setState((prev) => ({ ...prev, rulers: !prev.rulers }))} title="Toggle Rulers">
            Rulers
          </Button>
          <Button size="sm" onClick={exportPNG}>
            Export PNG
          </Button>
          <Button size="sm" variant="primary" onClick={() => pushHistory()}>
            Snapshot
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 gap-px overflow-hidden bg-slate-900">
        {/* LEFT TOOLBAR */}
        <div className="w-16 border-r border-slate-700 bg-slate-800 p-2">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 rounded border border-slate-600 bg-slate-900 p-2">
              <div className="relative h-8 w-8 border-2 border-slate-500 bg-slate-700" style={{ background: foregroundColor }} />
              <div className="relative h-6 w-6 border-2 border-slate-500 bg-slate-700" style={{ background: backgroundColor }} />
            </div>
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div ref={containerRef} className="flex-1 overflow-hidden bg-slate-950">
          <canvas
            ref={canvasRef}
            width={state.canvasWidth}
            height={state.canvasHeight}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onWheel={handleCanvasWheel}
            className="cursor-move"
            style={{
              transform: `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`,
              transformOrigin: '0 0',
              background: state.canvasBackground,
            }}
          />
        </div>

        {/* RIGHT PANELS */}
        <div className="w-72 flex-col gap-px border-l border-slate-700 bg-slate-800">
          {/* LAYERS PANEL */}
          <div className="flex-1 overflow-y-auto border-b border-slate-700 p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">Layers</h3>
            <div className="space-y-1">
              {state.layers
                .slice()
                .reverse()
                .map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-2 rounded border px-2 py-1 text-xs transition ${
                      selectedLayerId === layer.id
                        ? 'border-blue-500 bg-blue-900/20 text-blue-200'
                        : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                    }`}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <button
                      className="text-slate-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLayer(layer.id, { visible: !layer.visible });
                      }}
                    >
                      {layer.visible ? '👁' : '🚫'}
                    </button>
                    <button
                      className="text-slate-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLayer(layer.id, { locked: !layer.locked });
                      }}
                    >
                      {layer.locked ? '🔒' : '🔓'}
                    </button>
                    <span className="flex-1 truncate">{layer.name}</span>
                  </div>
                ))}
            </div>

            <div className="mt-3 flex gap-1">
              <Button size="sm" onClick={() => addLayer(createBlankLayer('New Layer'))}>
                +
              </Button>
              <Button
                size="sm"
                onClick={() => selectedLayer && duplicateLayer(selectedLayer.id)}
                disabled={!selectedLayer}
              >
                Dup
              </Button>
              <Button
                size="sm"
                onClick={() => selectedLayer && deleteLayer(selectedLayer.id)}
                disabled={!selectedLayer}
              >
                Del
              </Button>
              <Button
                size="sm"
                onClick={() => selectedLayer && moveLayerUp(selectedLayer.id)}
                disabled={!selectedLayer}
              >
                ↑
              </Button>
              <Button
                size="sm"
                onClick={() => selectedLayer && moveLayerDown(selectedLayer.id)}
                disabled={!selectedLayer}
              >
                ↓
              </Button>
            </div>
          </div>

          {/* PROPERTIES PANEL */}
          {selectedLayer && (
            <div className="flex-1 overflow-y-auto border-b border-slate-700 p-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">Properties</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Name</label>
                  <input
                    type="text"
                    value={selectedLayer.name}
                    onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedLayer.x)}
                      onChange={(e) => updateLayer(selectedLayer.id, { x: parseFloat(e.target.value) })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedLayer.y)}
                      onChange={(e) => updateLayer(selectedLayer.id, { y: parseFloat(e.target.value) })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Width</label>
                    <input
                      type="number"
                      value={Math.round(selectedLayer.width)}
                      onChange={(e) => updateLayer(selectedLayer.id, { width: parseFloat(e.target.value) })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Height</label>
                    <input
                      type="number"
                      value={Math.round(selectedLayer.height)}
                      onChange={(e) => updateLayer(selectedLayer.id, { height: parseFloat(e.target.value) })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Opacity</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedLayer.opacity}
                      onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-10 text-xs text-slate-400">{Math.round(selectedLayer.opacity * 100)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Blend Mode</label>
                  <select
                    value={selectedLayer.blendMode}
                    onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value as BlendMode })}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                  >
                    {BLEND_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLayer.type === 'text' && selectedLayer.textStyle && (
                  <div>
                    <label className="text-xs font-medium text-slate-300">Font Size</label>
                    <input
                      type="number"
                      value={selectedLayer.textStyle.fontSize}
                      onChange={(e) => {
                      if (selectedLayer.textStyle) {
                        updateLayer(selectedLayer.id, {
                          textStyle: {
                            fontFamily: selectedLayer.textStyle.fontFamily,
                            fontSize: parseInt(e.target.value),
                            fontWeight: selectedLayer.textStyle.fontWeight,
                            letterSpacing: selectedLayer.textStyle.letterSpacing,
                            lineHeight: selectedLayer.textStyle.lineHeight,
                            textAlign: selectedLayer.textStyle.textAlign,
                          },
                        });
                      }
                    }}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                )}

                {selectedLayer.type === 'shape' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-slate-300">Fill Color</label>
                      <input
                        type="color"
                        value={selectedLayer.fillColor || '#000000'}
                        onChange={(e) => updateLayer(selectedLayer.id, { fillColor: e.target.value })}
                        className="h-8 w-full rounded border border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300">Stroke Width</label>
                      <input
                        type="number"
                        min="0"
                        value={selectedLayer.strokeWidth || 0}
                        onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: parseFloat(e.target.value) })}
                        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* COLORS PANEL */}
          <div className="border-b border-slate-700 p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">Colors</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-slate-300">Foreground</label>
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="h-8 w-full rounded border border-slate-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Background</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-8 w-full rounded border border-slate-600"
                />
              </div>
            </div>
          </div>

          {/* BRUSH SETTINGS */}
          {(activeTool === 'brush' || activeTool === 'eraser') && (
            <div className="border-b border-slate-700 p-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">Brush</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-slate-300">Size: {brushSize}px</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Opacity: {Math.round(brushOpacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={brushOpacity}
                    onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HISTORY */}
          <div className="p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">History</h3>
            <div className="flex gap-1">
              <Button size="sm" onClick={undo} disabled={state.historyIndex <= 0}>
                ↶ Undo
              </Button>
              <Button size="sm" onClick={redo} disabled={state.historyIndex >= state.history.length - 1}>
                ↷ Redo
              </Button>
            </div>
            <div className="mt-2 text-xs text-slate-400">{state.historyIndex + 1} / {state.history.length}</div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
    </div>
  );
}

export default PhotoshopCanvas;
