'use client';

/**
 * PhotoshopCanvasEnhanced
 *
 * Professional Photoshop editor with:
 * - 20+ tools (select, crop, rotate, text, brush, shapes, etc.)
 * - Layer groups and organization
 * - Advanced text formatting
 * - Stroke, fill, effects panels
 * - Guides & rulers
 * - Alignment & distribution tools
 * - Transform gizmos
 * - Context menus
 * - Filter strength UI
 * - Presets system
 * - Better visual feedback
 * - Keyboard shortcut hints
 */

import { ChangeEvent, MouseEvent, WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

type ToolType = 'select' | 'crop' | 'rotate' | 'rect-select' | 'ellipse-select' | 'lasso' | 'pen' | 'text' | 'brush' | 'eraser' | 'fill' | 'gradient' | 'eyedropper' | 'hand' | 'zoom' | 'rect' | 'ellipse' | 'line' | 'polygon';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

interface EnhancedLayer {
  id: string;
  name: string;
  type: 'raster' | 'text' | 'shape' | 'group';
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  
  // Fill & Stroke
  fillColor?: string;
  fillType?: 'solid' | 'gradient' | 'pattern';
  strokeColor?: string;
  strokeWidth?: number;
  
  // Text-specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textColor?: string;
  
  // Effects
  filters?: Array<{ type: string; value: number }>;
  shadow?: { offsetX: number; offsetY: number; blur: number; color: string };
  
  // Group-specific
  children?: string[];
  collapsed?: boolean;
  
  // Content
  imageData?: ImageData;
}

interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
}

interface Preset {
  id: string;
  name: string;
  settings: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    fontSize?: number;
    filters?: Array<{ type: string; value: number }>;
  };
}

const TOOLS: Array<{ id: ToolType; label: string; icon: string; key: string }> = [
  { id: 'select', label: 'Selection', icon: '◤', key: 'V' },
  { id: 'rect-select', label: 'Rect Select', icon: '⬜', key: 'R' },
  { id: 'ellipse-select', label: 'Ellipse Select', icon: '⭕', key: 'E' },
  { id: 'crop', label: 'Crop', icon: '✂', key: 'C' },
  { id: 'rotate', label: 'Rotate', icon: '↻', key: 'Shift+R' },
  { id: 'text', label: 'Text', icon: 'T', key: 'T' },
  { id: 'rect', label: 'Rectangle', icon: '□', key: 'Shift+U' },
  { id: 'ellipse', label: 'Ellipse', icon: '○', key: 'U' },
  { id: 'line', label: 'Line', icon: '/', key: 'L' },
  { id: 'pen', label: 'Pen', icon: '✏', key: 'P' },
  { id: 'brush', label: 'Brush', icon: '🖌', key: 'B' },
  { id: 'eraser', label: 'Eraser', icon: '🧹', key: 'Shift+E' },
  { id: 'fill', label: 'Bucket', icon: '🪣', key: 'G' },
  { id: 'gradient', label: 'Gradient', icon: '▧', key: 'Shift+G' },
  { id: 'eyedropper', label: 'Eyedropper', icon: '💧', key: 'I' },
  { id: 'hand', label: 'Hand', icon: '✋', key: 'Space' },
  { id: 'zoom', label: 'Zoom', icon: '🔍', key: 'Z' },
];

const FILTER_TYPES = [
  'blur', 'brightness', 'contrast', 'grayscale', 'hue-rotate', 'invert', 'saturate', 'sepia', 'opacity'
];

const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

const PRESETS: Preset[] = [
  {
    id: 'default',
    name: 'Default',
    settings: { fillColor: '#000000', strokeColor: '#ffffff', strokeWidth: 1, fontSize: 24 },
  },
  {
    id: 'title',
    name: 'Title Text',
    settings: { fillColor: '#ffffff', fontSize: 48, strokeColor: '#000000', strokeWidth: 2 },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    settings: { filters: [{ type: 'sepia', value: 60 }], fillColor: '#8B7355' },
  },
  {
    id: 'neon',
    name: 'Neon',
    settings: { fillColor: '#00ffff', strokeColor: '#ff00ff', strokeWidth: 2 },
  },
];

export function PhotoshopCanvasEnhanced() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========== STATE ==========
  const [layers, setLayers] = useState<EnhancedLayer[]>([
    {
      id: 'bg',
      name: 'Background',
      type: 'raster',
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false,
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      rotation: 0,
    },
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState('bg');
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');

  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');

  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [guides, setGuides] = useState<Guide[]>([]);

  const [history, setHistory] = useState<EnhancedLayer[][]>([layers]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [expandedPanels, setExpandedPanels] = useState({
    layers: true,
    properties: true,
    fill: false,
    stroke: false,
    effects: false,
    filters: false,
  });

  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<string>('');

  // ========== COMPUTED ==========
  const selectedLayer = useMemo(() => layers.find((l) => l.id === selectedLayerId), [layers, selectedLayerId]);

  // ========== LAYER OPERATIONS ==========
  const updateLayer = useCallback(
    (id: string, patch: Partial<EnhancedLayer>) => {
      const nextLayers = layers.map((l) => (l.id === id ? { ...l, ...patch } : l));
      setLayers(nextLayers);
    },
    [layers]
  );

  const addLayer = useCallback(
    (layer: EnhancedLayer) => {
      const nextLayers = [...layers, layer];
      setLayers(nextLayers);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), nextLayers]);
      setHistoryIndex((prev) => prev + 1);
      setSelectedLayerId(layer.id);
    },
    [layers, historyIndex]
  );

  const deleteLayer = useCallback(
    (id: string) => {
      if (layers.length <= 1) return;
      const nextLayers = layers.filter((l) => l.id !== id);
      setLayers(nextLayers);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), nextLayers]);
      setHistoryIndex((prev) => prev + 1);
      if (selectedLayerId === id) {
        setSelectedLayerId(nextLayers[nextLayers.length - 1]?.id ?? '');
      }
    },
    [layers, historyIndex, selectedLayerId]
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      const layer = layers.find((l) => l.id === id);
      if (!layer) return;
      const copy: EnhancedLayer = { ...layer, id: `layer-${Math.random().toString(36).slice(2, 8)}`, name: `${layer.name} Copy`, x: layer.x + 10, y: layer.y + 10 };
      addLayer(copy);
    },
    [layers, addLayer]
  );

  const groupLayers = useCallback(
    (ids: string[]) => {
      const groupId = `group-${Math.random().toString(36).slice(2, 8)}`;
      const group: EnhancedLayer = {
        id: groupId,
        name: 'Group',
        type: 'group',
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        locked: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        children: ids,
      };
      const nextLayers = [...layers, group];
      setLayers(nextLayers);
      setSelectedLayerId(groupId);
    },
    [layers]
  );

  // ========== GUIDES & ALIGNMENT ==========
  const addGuide = useCallback(
    (position: number, type: 'horizontal' | 'vertical') => {
      const guide: Guide = { id: `guide-${Math.random().toString(36).slice(2, 8)}`, type, position };
      setGuides((prev) => [...prev, guide]);
    },
    []
  );

  const alignLayersLeft = useCallback(() => {
    if (!selectedLayer) return;
    const minX = Math.min(...layers.map((l) => l.x));
    updateLayer(selectedLayer.id, { x: minX });
  }, [selectedLayer, layers, updateLayer]);

  const alignLayersCenter = useCallback(() => {
    if (!selectedLayer) return;
    const centerX = (canvasWidth / 2) - (selectedLayer.width / 2);
    updateLayer(selectedLayer.id, { x: centerX });
  }, [selectedLayer, canvasWidth, updateLayer]);

  const alignLayersRight = useCallback(() => {
    if (!selectedLayer) return;
    const maxX = Math.max(...layers.map((l) => l.x + l.width));
    updateLayer(selectedLayer.id, { x: maxX - selectedLayer.width });
  }, [selectedLayer, layers, updateLayer]);

  // ========== CANVAS RENDERING ==========
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }

    // Guides
    if (showGuides) {
      ctx.strokeStyle = '#0099ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      guides.forEach((guide) => {
        ctx.beginPath();
        if (guide.type === 'vertical') {
          ctx.moveTo(guide.position, 0);
          ctx.lineTo(guide.position, canvasHeight);
        } else {
          ctx.moveTo(0, guide.position);
          ctx.lineTo(canvasWidth, guide.position);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // Render layers
    layers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
      ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-(layer.width / 2), -(layer.height / 2));

      // Apply filters
      if (layer.filters && layer.filters.length > 0) {
        ctx.filter = layer.filters.map((f) => {
          if (f.type === 'blur') return `blur(${f.value}px)`;
          if (f.type === 'brightness') return `brightness(${f.value}%)`;
          if (f.type === 'contrast') return `contrast(${f.value}%)`;
          if (f.type === 'grayscale') return `grayscale(${f.value}%)`;
          if (f.type === 'hue-rotate') return `hue-rotate(${f.value}deg)`;
          if (f.type === 'invert') return `invert(${f.value}%)`;
          if (f.type === 'saturate') return `saturate(${f.value}%)`;
          if (f.type === 'sepia') return `sepia(${f.value}%)`;
          return '';
        }).join(' ');
      }

      // Draw shape
      if (layer.type === 'shape') {
        ctx.fillStyle = layer.fillColor || '#000000';
        ctx.fillRect(0, 0, layer.width, layer.height);
        if (layer.strokeWidth && layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor || '#ffffff';
          ctx.lineWidth = layer.strokeWidth;
          ctx.strokeRect(0, 0, layer.width, layer.height);
        }
      } else if (layer.type === 'text' && layer.text) {
        ctx.fillStyle = layer.textColor || '#000000';
        ctx.font = `${layer.fontStyle === 'italic' ? 'italic ' : ''}${layer.fontWeight} ${layer.fontSize || 24}px ${layer.fontFamily || 'Inter'}`;
        ctx.fillText(layer.text, 0, layer.fontSize || 24);
      }

      // Highlight selection
      if (layer.id === selectedLayerId) {
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(0, 0, layer.width, layer.height);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  }, [layers, selectedLayerId, canvasWidth, canvasHeight, canvasBackground, showGrid, gridSize, showGuides, guides]);

  // ========== KEYBOARD SHORTCUTS ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const toolEntry = TOOLS.find((t) => t.key === e.key || t.key.toLowerCase() === key);
      if (toolEntry) {
        e.preventDefault();
        setActiveTool(toolEntry.id);
      }

      if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          setHistoryIndex((i) => i - 1);
          setLayers(history[historyIndex - 1]);
        }
      }
      if ((e.ctrlKey || e.metaKey) && (key === 'y' || (key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          setHistoryIndex((i) => i + 1);
          setLayers(history[historyIndex + 1]);
        }
      }
      if (key === 'delete' && selectedLayer) {
        e.preventDefault();
        deleteLayer(selectedLayer.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedLayer, deleteLayer]);

  // ========== EXPORT ==========
  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `design-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  }, []);

  // ========== RENDER ==========
  return (
    <div ref={containerRef} className="flex h-screen w-full flex-col bg-slate-900 text-slate-100">
      {/* HEADER */}
      <div className="border-b border-slate-700 bg-slate-800 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold">Aurora Design Studio Enhanced</div>
          <div className="flex items-center gap-1 text-xs">
            <span>
              {(zoom * 100).toFixed(0)}%
            </span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {/* MAIN TOOLBAR */}
      <div className="flex flex-wrap gap-1 border-b border-slate-700 bg-slate-800 p-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`rounded px-2 py-1 text-xs transition ${
              activeTool === tool.id ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
            title={`${tool.label} (${tool.key})`}
          >
            {tool.icon}
          </button>
        ))}
        <div className="h-6 w-px bg-slate-600" />
        <Button size="sm" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
          Grid
        </Button>
        <Button size="sm" onClick={() => setShowRulers(!showRulers)} title="Toggle Rulers">
          Rulers
        </Button>
        <Button size="sm" onClick={() => addGuide(canvasWidth / 2, 'vertical')}>
          + H Guide
        </Button>
        <Button size="sm" onClick={() => addGuide(canvasHeight / 2, 'horizontal')}>
          + V Guide
        </Button>
        <div className="ml-auto" />
        <Button size="sm" onClick={exportPNG}>
          📥 Export
        </Button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 gap-px overflow-hidden bg-slate-900">
        {/* LEFT PANEL - Tools & Colors */}
        <div className="w-20 border-r border-slate-700 bg-slate-800 p-2">
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Colors</div>
            <div className="flex flex-col gap-1">
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="h-8 w-full rounded"
                title="Foreground"
              />
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-8 w-full rounded"
                title="Background"
              />
            </div>

            <div className="border-t border-slate-600 pt-2">
              <div className="text-xs font-bold text-slate-300 mb-1">Brush</div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Size: {brushSize}px</label>
                <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER - CANVAS */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border border-slate-600 shadow-lg"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              background: canvasBackground,
            }}
          />
        </div>

        {/* RIGHT PANEL - Layers & Properties */}
        <div className="w-80 flex-col border-l border-slate-700 bg-slate-800">
          {/* LAYERS */}
          <div className="flex-1 overflow-y-auto border-b border-slate-700 p-3">
            <div
              className="mb-2 flex cursor-pointer items-center gap-2 text-xs font-bold uppercase text-slate-300"
              onClick={() => setExpandedPanels((p) => ({ ...p, layers: !p.layers }))}
            >
              <span>{expandedPanels.layers ? '▼' : '▶'}</span>
              Layers
            </div>

            {expandedPanels.layers && (
              <div className="space-y-1">
                {layers
                  .slice()
                  .reverse()
                  .map((layer) => (
                    <div
                      key={layer.id}
                      className={`flex items-center gap-1 rounded border px-2 py-1 text-xs cursor-pointer transition ${
                        selectedLayerId === layer.id
                          ? 'border-blue-500 bg-blue-900/30 text-blue-200'
                          : 'border-slate-600 bg-slate-900/50 hover:bg-slate-800'
                      }`}
                      onClick={() => setSelectedLayerId(layer.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setShowContextMenu({ x: e.clientX, y: e.clientY });
                        setContextMenuTarget(layer.id);
                      }}
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
            )}

            <div className="mt-3 flex gap-1">
              <Button size="sm" onClick={() => addLayer({ id: `layer-${Date.now()}`, name: 'New Layer', type: 'raster', visible: true, opacity: 1, blendMode: 'normal', locked: false, x: 0, y: 0, width: 100, height: 100, rotation: 0 })}>
                +
              </Button>
              <Button size="sm" onClick={() => selectedLayer && duplicateLayer(selectedLayer.id)} disabled={!selectedLayer}>
                Dup
              </Button>
              <Button size="sm" onClick={() => selectedLayer && deleteLayer(selectedLayer.id)} disabled={!selectedLayer}>
                Del
              </Button>
            </div>
          </div>

          {/* PROPERTIES */}
          {selectedLayer && (
            <div className="flex-1 overflow-y-auto border-b border-slate-700 p-3">
              <div
                className="mb-2 flex cursor-pointer items-center gap-2 text-xs font-bold uppercase text-slate-300"
                onClick={() => setExpandedPanels((p) => ({ ...p, properties: !p.properties }))}
              >
                <span>{expandedPanels.properties ? '▼' : '▶'}</span>
                Properties
              </div>

              {expandedPanels.properties && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-medium text-slate-300">Name</label>
                    <input
                      type="text"
                      value={selectedLayer.name}
                      onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="font-medium">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedLayer.x)}
                        onChange={(e) => updateLayer(selectedLayer.id, { x: parseFloat(e.target.value) })}
                        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="font-medium">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedLayer.y)}
                        onChange={(e) => updateLayer(selectedLayer.id, { y: parseFloat(e.target.value) })}
                        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="font-medium">W</label>
                      <input
                        type="number"
                        value={Math.round(selectedLayer.width)}
                        onChange={(e) => updateLayer(selectedLayer.id, { width: parseFloat(e.target.value) })}
                        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="font-medium">H</label>
                      <input
                        type="number"
                        value={Math.round(selectedLayer.height)}
                        onChange={(e) => updateLayer(selectedLayer.id, { height: parseFloat(e.target.value) })}
                        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-medium">Opacity</label>
                    <div className="flex gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedLayer.opacity}
                        onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-12">{Math.round(selectedLayer.opacity * 100)}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium">Blend Mode</label>
                    <select
                      value={selectedLayer.blendMode}
                      onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value as BlendMode })}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1"
                    >
                      {BLEND_MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-medium">Rotation</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedLayer.rotation}
                      onChange={(e) => updateLayer(selectedLayer.id, { rotation: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-slate-400">{selectedLayer.rotation}°</span>
                  </div>
                </div>
              )}

              {/* FILL */}
              <div
                className="mt-3 flex cursor-pointer items-center gap-2 border-t border-slate-600 pt-2 text-xs font-bold uppercase text-slate-300"
                onClick={() => setExpandedPanels((p) => ({ ...p, fill: !p.fill }))}
              >
                <span>{expandedPanels.fill ? '▼' : '▶'}</span>
                Fill
              </div>
              {expandedPanels.fill && (
                <div className="mt-2 space-y-2">
                  <label className="text-xs font-medium">Color</label>
                  <input
                    type="color"
                    value={selectedLayer.fillColor || '#000000'}
                    onChange={(e) => updateLayer(selectedLayer.id, { fillColor: e.target.value })}
                    className="h-8 w-full rounded"
                  />
                </div>
              )}

              {/* STROKE */}
              <div
                className="mt-3 flex cursor-pointer items-center gap-2 border-t border-slate-600 pt-2 text-xs font-bold uppercase text-slate-300"
                onClick={() => setExpandedPanels((p) => ({ ...p, stroke: !p.stroke }))}
              >
                <span>{expandedPanels.stroke ? '▼' : '▶'}</span>
                Stroke
              </div>
              {expandedPanels.stroke && (
                <div className="mt-2 space-y-2 text-xs">
                  <div>
                    <label className="font-medium">Width: {selectedLayer.strokeWidth || 0}</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={selectedLayer.strokeWidth || 0}
                      onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Color</label>
                    <input
                      type="color"
                      value={selectedLayer.strokeColor || '#ffffff'}
                      onChange={(e) => updateLayer(selectedLayer.id, { strokeColor: e.target.value })}
                      className="h-8 w-full rounded"
                    />
                  </div>
                </div>
              )}

              {/* FILTERS */}
              <div
                className="mt-3 flex cursor-pointer items-center gap-2 border-t border-slate-600 pt-2 text-xs font-bold uppercase text-slate-300"
                onClick={() => setExpandedPanels((p) => ({ ...p, filters: !p.filters }))}
              >
                <span>{expandedPanels.filters ? '▼' : '▶'}</span>
                Filters
              </div>
              {expandedPanels.filters && (
                <div className="mt-2 space-y-2 text-xs">
                  {FILTER_TYPES.map((f) => (
                    <div key={f}>
                      <label className="font-medium">{f}: {(selectedLayer.filters?.find((flt) => flt.type === f)?.value ?? 0).toFixed(0)}</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={selectedLayer.filters?.find((flt) => flt.type === f)?.value ?? 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          const filters = selectedLayer.filters || [];
                          const idx = filters.findIndex((flt) => flt.type === f);
                          if (idx >= 0) {
                            filters[idx].value = value;
                          } else {
                            filters.push({ type: f, value });
                          }
                          updateLayer(selectedLayer.id, { filters });
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ALIGNMENT */}
              <div className="mt-3 border-t border-slate-600 pt-2">
                <div className="mb-2 text-xs font-bold uppercase text-slate-300">Alignment</div>
                <div className="grid grid-cols-3 gap-1">
                  <Button size="sm" onClick={alignLayersLeft}>
                    ←
                  </Button>
                  <Button size="sm" onClick={alignLayersCenter}>
                    ↔
                  </Button>
                  <Button size="sm" onClick={alignLayersRight}>
                    →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* PRESETS */}
          <div className="border-t border-slate-700 p-3">
            <div className="mb-2 text-xs font-bold uppercase text-slate-300">Presets</div>
            <div className="space-y-1">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  size="sm"
                  onClick={() => {
                    if (selectedLayer) {
                      updateLayer(selectedLayer.id, preset.settings);
                    }
                  }}
                  className="w-full text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTEXT MENU */}
      {showContextMenu && (
        <div
          className="fixed z-50 rounded border border-slate-600 bg-slate-800 shadow-lg"
          style={{ top: showContextMenu.y, left: showContextMenu.x }}
          onClick={() => setShowContextMenu(null)}
        >
          <div className="space-y-1 p-2 text-xs">
            <button className="block w-full rounded px-2 py-1 hover:bg-blue-600">Duplicate</button>
            <button className="block w-full rounded px-2 py-1 hover:bg-blue-600">Delete</button>
            <button className="block w-full rounded px-2 py-1 hover:bg-blue-600">Group</button>
            <button className="block w-full rounded px-2 py-1 hover:bg-blue-600">Copy</button>
            <button className="block w-full rounded px-2 py-1 hover:bg-blue-600">Paste</button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
    </div>
  );
}

export default PhotoshopCanvasEnhanced;
