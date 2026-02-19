'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

type DockMode = 'left' | 'right' | 'top' | 'bottom' | 'floating';
type ToolSetMode = 'all' | 'size' | 'arc' | 'side' | 'transform' | 'style';
type MenuPanel = 'dock' | 'toolset' | 'size' | 'arc' | 'side' | 'transform' | 'style' | null;
type CanvasHandle = 'move' | 'width' | 'height' | 'scale' | 'rotate' | 'skewX' | 'skewY' | 'arcRx' | 'arcRy' | 'topArcRx' | 'topArcRy' | 'topLeftY' | 'topRightY' | 'bottomLeftY' | 'bottomRightY' | 'origin';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  decimals?: number;
}

function SliderControl({ label, value, min, max, step = 1, onChange, unit = '', decimals = 2 }: SliderControlProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderPercent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <label className="grid gap-0 text-[8px]">
      <span className="flex items-center justify-between gap-0">
        <span>{label}</span>
        <span className="text-slate-300">{value.toFixed(decimals)}{unit}</span>
      </span>
      <div className="grid grid-cols-[1fr_0.6rem] gap-0">
        <div className="relative">
          {showTooltip && (
            <span
              className="pointer-events-none absolute -top-4 z-30 rounded border border-white/90 bg-slate-950/95 px-1 py-0 text-[7px] text-white"
              style={{ left: `${Math.max(0, Math.min(100, sliderPercent))}%`, transform: 'translateX(-50%)', color: '#ffffff' }}
            >
              {label}: {value.toFixed(decimals)}{unit}
            </span>
          )}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            onMouseDown={() => setShowTooltip(true)}
            className="h-[3px] w-full"
          />
        </div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded border border-slate-600 bg-slate-950 px-0 py-0 text-[8px] text-slate-100"
        />
      </div>
    </label>
  );
}

interface StylePreset {
  id: string;
  name: string;
  panelFillStart: string;
  panelFillMid: string;
  panelFillEnd: string;
  panelBorderColor: string;
  panelBorderWidth: number;
  panelOpacity: number;
  panelGlow: number;
  couplerFillColor: string;
  couplerBorderColor: string;
  showArcText: boolean;
}

interface LabSnapshot {
  panelWidth: number;
  panelHeight: number;
  panelFillStart: string;
  panelFillMid: string;
  panelFillEnd: string;
  panelBorderColor: string;
  panelBorderWidth: number;
  panelOpacity: number;
  panelGlow: number;
  couplerFillColor: string;
  couplerBorderColor: string;
  showArcText: boolean;
  arcRx: number;
  arcRy: number;
  arcRotation: number;
  arcLargeFlag: number;
  arcSweepFlag: number;
  topArcRx: number;
  topArcRy: number;
  topArcRotation: number;
  topArcLargeFlag: number;
  topArcSweepFlag: number;
  topLeftY: number;
  topRightY: number;
  bottomLeftY: number;
  bottomRightY: number;
  couplerSize: number;
  overlap: number;
  translateX: number;
  translateY: number;
  rotateDeg: number;
  skewX: number;
  skewY: number;
  scaleX: number;
  scaleY: number;
  originX: number;
  originY: number;
  couplerRotate: number;
  moduleGap: number;
}

export default function ArcPanelLabPage() {
  const layoutRef = useRef<HTMLElement>(null);
  const importPresetsInputRef = useRef<HTMLInputElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const handleStartRef = useRef<{
    x: number;
    y: number;
    panelWidth: number;
    panelHeight: number;
    arcRx: number;
    arcRy: number;
    topArcRx: number;
    topArcRy: number;
    topLeftY: number;
    topRightY: number;
    bottomLeftY: number;
    bottomRightY: number;
    translateX: number;
    translateY: number;
    rotateDeg: number;
    skewX: number;
    skewY: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [dockMode, setDockMode] = useState<DockMode>('top');
  const [activeToolSet, setActiveToolSet] = useState<ToolSetMode>('all');
  const [toolPanelWidth, setToolPanelWidth] = useState(360);
  const [toolPanelHeight, setToolPanelHeight] = useState(96);
  const [floatingX, setFloatingX] = useState(24);
  const [floatingY, setFloatingY] = useState(24);
  const [openMenuPanel, setOpenMenuPanel] = useState<MenuPanel>(null);
  const [activeCanvasHandle, setActiveCanvasHandle] = useState<CanvasHandle | null>(null);
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const [isHorizontalResizing, setIsHorizontalResizing] = useState(false);
  const [isFloatingResizing, setIsFloatingResizing] = useState(false);
  const [isFloatingDragging, setIsFloatingDragging] = useState(false);
  const [panelWidth, setPanelWidth] = useState(180);
  const [panelHeight, setPanelHeight] = useState(44);
  const [panelFillStart, setPanelFillStart] = useState('#6366f1');
  const [panelFillMid, setPanelFillMid] = useState('#06b6d4');
  const [panelFillEnd, setPanelFillEnd] = useState('#34d399');
  const [panelBorderColor, setPanelBorderColor] = useState('#7dd3fc');
  const [panelBorderWidth, setPanelBorderWidth] = useState(1);
  const [panelOpacity, setPanelOpacity] = useState(78);
  const [panelGlow, setPanelGlow] = useState(38);
  const [couplerFillColor, setCouplerFillColor] = useState('#22d3ee');
  const [couplerBorderColor, setCouplerBorderColor] = useState('#7dd3fc');
  const [showArcText, setShowArcText] = useState(true);
  const [presetName, setPresetName] = useState('');
  const [customPresets, setCustomPresets] = useState<StylePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [arcRx, setArcRx] = useState(0.5);
  const [arcRy, setArcRy] = useState(0.78);
  const [arcRotation, setArcRotation] = useState(0);
  const [arcLargeFlag, setArcLargeFlag] = useState(0);
  const [arcSweepFlag, setArcSweepFlag] = useState(0);
  const [topArcRx, setTopArcRx] = useState(0.5);
  const [topArcRy, setTopArcRy] = useState(0.38);
  const [topArcRotation, setTopArcRotation] = useState(0);
  const [topArcLargeFlag, setTopArcLargeFlag] = useState(0);
  const [topArcSweepFlag, setTopArcSweepFlag] = useState(100);
  const [topLeftY, setTopLeftY] = useState(0);
  const [topRightY, setTopRightY] = useState(0);
  const [bottomLeftY, setBottomLeftY] = useState(0);
  const [bottomRightY, setBottomRightY] = useState(0);
  const [couplerSize, setCouplerSize] = useState(14);
  const [overlap, setOverlap] = useState(5);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [originX, setOriginX] = useState(50);
  const [originY, setOriginY] = useState(50);
  const [couplerRotate, setCouplerRotate] = useState(0);
  const [moduleGap, setModuleGap] = useState(0);
  const [history, setHistory] = useState<LabSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [hoveredCanvasTooltip, setHoveredCanvasTooltip] = useState<CanvasHandle | null>(null);
  const [expandedCanvasTooltip, setExpandedCanvasTooltip] = useState<CanvasHandle | null>(null);

  const clipId = useId().replace(/:/g, '');

  const pathD = useMemo(
    () =>
      `M0 ${topLeftY} A${topArcRx} ${topArcRy} ${topArcRotation} ${topArcLargeFlag >= 50 ? 1 : 0} ${topArcSweepFlag >= 50 ? 1 : 0} 1 ${topRightY} L1 ${1 - bottomRightY} A${arcRx} ${arcRy} ${arcRotation} ${arcLargeFlag >= 50 ? 1 : 0} ${arcSweepFlag >= 50 ? 1 : 0} 0 ${1 - bottomLeftY} Z`,
    [topLeftY, topRightY, bottomRightY, bottomLeftY, arcRx, arcRy, arcRotation, arcLargeFlag, arcSweepFlag, topArcRx, topArcRy, topArcRotation, topArcLargeFlag, topArcSweepFlag]
  );

  const panelTransform = useMemo(
    () =>
      `translate(${translateX}px, ${translateY}px) rotate(${rotateDeg}deg) skew(${skewX}deg, ${skewY}deg) scale(${scaleX}, ${scaleY})`,
    [translateX, translateY, rotateDeg, skewX, skewY, scaleX, scaleY]
  );

  const panelStyle = useMemo(
    (): CSSProperties => ({
      width: `${panelWidth}px`,
      height: `${panelHeight}px`,
      margin: `0 -${Math.max(1, Math.round(overlap / 2))}px`,
      clipPath: `url(#${clipId})`,
      WebkitClipPath: `url(#${clipId})`,
      transform: panelTransform,
      transformOrigin: `${originX}% ${originY}%`,
      borderWidth: `${panelBorderWidth}px`,
      borderColor: panelBorderColor,
      backgroundImage: `linear-gradient(90deg, ${panelFillStart}, ${panelFillMid}, ${panelFillEnd})`,
      opacity: panelOpacity / 100,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 0 16px rgba(34, 211, 238, ${panelGlow / 100})`,
    }),
    [panelWidth, panelHeight, overlap, clipId, panelTransform, originX, originY, panelBorderWidth, panelBorderColor, panelFillStart, panelFillMid, panelFillEnd, panelOpacity, panelGlow]
  );

  const couplerStyle = useMemo(
    (): CSSProperties => ({
      width: `${couplerSize}px`,
      height: `${couplerSize}px`,
      transform: `rotate(${couplerRotate}deg)`,
      backgroundColor: couplerFillColor,
      borderColor: couplerBorderColor,
    }),
    [couplerSize, couplerRotate, couplerFillColor, couplerBorderColor]
  );

  const isSideDock = dockMode === 'left' || dockMode === 'right';
  const isTopBottomDock = dockMode === 'top' || dockMode === 'bottom';

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const startCanvasHandleDrag = (handle: CanvasHandle, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveCanvasHandle(handle);
    handleStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panelWidth,
      panelHeight,
      arcRx,
      arcRy,
      topArcRx,
      topArcRy,
      topLeftY,
      topRightY,
      bottomLeftY,
      bottomRightY,
      translateX,
      translateY,
      rotateDeg,
      skewX,
      skewY,
      scaleX,
      scaleY,
      originX,
      originY,
    };
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isEditable =
        Boolean(target?.isContentEditable) ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT';

      if (isEditable) return;

      if (event.key === '[') {
        event.preventDefault();
        setDockMode('left');
        return;
      }

      if (event.key === ']') {
        event.preventDefault();
        setDockMode('right');
        return;
      }

      if (event.key === '-') {
        event.preventDefault();
        setDockMode('top');
        return;
      }

      if (event.key === '=') {
        event.preventDefault();
        setDockMode('bottom');
        return;
      }

      if (event.key === '0') {
        event.preventDefault();
        setDockMode('floating');
        return;
      }

      if (event.key === '1') {
        event.preventDefault();
        setOpenMenuPanel((prev) => (prev === 'size' ? null : 'size'));
        return;
      }

      if (event.key === '2') {
        event.preventDefault();
        setOpenMenuPanel((prev) => (prev === 'arc' ? null : 'arc'));
        return;
      }

      if (event.key === '3') {
        event.preventDefault();
        setOpenMenuPanel((prev) => (prev === 'side' ? null : 'side'));
        return;
      }

      if (event.key === '4') {
        event.preventDefault();
        setOpenMenuPanel((prev) => (prev === 'transform' ? null : 'transform'));
        return;
      }

      if (event.key === 'Escape') {
        setOpenMenuPanel(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('aurora-arc-panel-presets-v1');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as StylePreset[];
      if (Array.isArray(parsed)) {
        setCustomPresets(parsed);
      }
    } catch {
      setCustomPresets([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('aurora-arc-panel-presets-v1', JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    if (!isVerticalResizing && !isHorizontalResizing && !isFloatingResizing && !isFloatingDragging && !activeCanvasHandle) return;

    const onMouseMove = (event: MouseEvent) => {
      const rect = layoutRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (isVerticalResizing) {
        const rawWidth = dockMode === 'left' ? event.clientX - rect.left : rect.right - event.clientX;
        const nextWidth = Math.max(240, Math.min(560, Math.round(rawWidth)));
        setToolPanelWidth(nextWidth);
      }

      if (isHorizontalResizing) {
        const rawHeight = dockMode === 'top' ? event.clientY - rect.top : rect.bottom - event.clientY;
        const nextHeight = Math.max(72, Math.min(420, Math.round(rawHeight)));
        setToolPanelHeight(nextHeight);
      }

      if (isFloatingResizing) {
        const width = Math.max(240, Math.min(560, Math.round(event.clientX - rect.left - floatingX)));
        const height = Math.max(140, Math.min(520, Math.round(event.clientY - rect.top - floatingY)));
        setToolPanelWidth(width);
        setToolPanelHeight(height);
      }

      if (isFloatingDragging) {
        const maxX = Math.max(8, rect.width - toolPanelWidth - 8);
        const maxY = Math.max(8, rect.height - toolPanelHeight - 8);
        const nextX = Math.max(8, Math.min(maxX, Math.round(event.clientX - rect.left - dragOffsetRef.current.x)));
        const nextY = Math.max(8, Math.min(maxY, Math.round(event.clientY - rect.top - dragOffsetRef.current.y)));
        setFloatingX(nextX);
        setFloatingY(nextY);
      }

      if (activeCanvasHandle && handleStartRef.current) {
        const start = handleStartRef.current;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;

        if (activeCanvasHandle === 'move') {
          setTranslateX(start.translateX + dx);
          setTranslateY(start.translateY + dy);
        }

        if (activeCanvasHandle === 'width') {
          setPanelWidth(clamp(Math.round(start.panelWidth + dx), 90, 420));
        }

        if (activeCanvasHandle === 'height') {
          setPanelHeight(clamp(Math.round(start.panelHeight + dy), 20, 120));
        }

        if (activeCanvasHandle === 'scale') {
          setScaleX(clamp(Number((start.scaleX + dx / 180).toFixed(2)), 0.2, 2.5));
          setScaleY(clamp(Number((start.scaleY + dy / 180).toFixed(2)), 0.2, 2.5));
        }

        if (activeCanvasHandle === 'rotate') {
          setRotateDeg(clamp(Math.round(start.rotateDeg + dx * 0.65), -180, 180));
        }

        if (activeCanvasHandle === 'skewX') {
          setSkewX(clamp(Math.round(start.skewX + dx * 0.35), -75, 75));
        }

        if (activeCanvasHandle === 'skewY') {
          setSkewY(clamp(Math.round(start.skewY + dy * 0.35), -75, 75));
        }

        if (activeCanvasHandle === 'arcRx') {
          setArcRx(clamp(Number((start.arcRx + dx * 0.005).toFixed(2)), 0.1, 1.2));
        }

        if (activeCanvasHandle === 'arcRy') {
          setArcRy(clamp(Number((start.arcRy - dy * 0.005).toFixed(2)), 0.1, 1.5));
        }

        if (activeCanvasHandle === 'topArcRx') {
          setTopArcRx(clamp(Number((start.topArcRx + dx * 0.005).toFixed(2)), 0.1, 1.2));
        }

        if (activeCanvasHandle === 'topArcRy') {
          setTopArcRy(clamp(Number((start.topArcRy + dy * 0.005).toFixed(2)), 0.1, 1.5));
        }

        if (activeCanvasHandle === 'topLeftY') {
          setTopLeftY(clamp(Number((start.topLeftY + dy * 0.002).toFixed(2)), 0, 0.45));
        }

        if (activeCanvasHandle === 'topRightY') {
          setTopRightY(clamp(Number((start.topRightY + dy * 0.002).toFixed(2)), 0, 0.45));
        }

        if (activeCanvasHandle === 'bottomLeftY') {
          setBottomLeftY(clamp(Number((start.bottomLeftY - dy * 0.002).toFixed(2)), 0, 0.45));
        }

        if (activeCanvasHandle === 'bottomRightY') {
          setBottomRightY(clamp(Number((start.bottomRightY - dy * 0.002).toFixed(2)), 0, 0.45));
        }

        if (activeCanvasHandle === 'origin') {
          const nextOriginX = start.originX + (dx / Math.max(1, start.panelWidth)) * 100;
          const nextOriginY = start.originY + (dy / Math.max(1, start.panelHeight)) * 100;
          setOriginX(clamp(Number(nextOriginX.toFixed(0)), 0, 100));
          setOriginY(clamp(Number(nextOriginY.toFixed(0)), 0, 100));
        }
      }
    };

    const stopInteractions = () => {
      setIsVerticalResizing(false);
      setIsHorizontalResizing(false);
      setIsFloatingResizing(false);
      setIsFloatingDragging(false);
      setActiveCanvasHandle(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopInteractions);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopInteractions);
    };
  }, [isVerticalResizing, isHorizontalResizing, isFloatingResizing, isFloatingDragging, activeCanvasHandle, dockMode, floatingX, floatingY, toolPanelWidth, toolPanelHeight]);

  const dockOptions: DockMode[] = ['left', 'right', 'top', 'bottom', 'floating'];
  const toolSetOptions: Array<{ id: ToolSetMode; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'size', label: 'Size' },
    { id: 'arc', label: 'Arc' },
    { id: 'side', label: 'Side' },
    { id: 'transform', label: 'Transform' },
    { id: 'style', label: 'Style' },
  ];

  const canvasHandleHelp: Record<CanvasHandle, { short: string; detail: string }> = {
    move: { short: 'Move', detail: 'Drag to reposition the panel in X and Y.' },
    width: { short: 'Width', detail: 'Drag horizontally to change panel width.' },
    height: { short: 'Height', detail: 'Drag vertically to change panel height.' },
    scale: { short: 'Scale', detail: 'Drag diagonally to scale width and height together.' },
    rotate: { short: 'Rotate', detail: 'Drag left or right to rotate the panel.' },
    skewX: { short: 'Skew X', detail: 'Drag horizontally to shear the panel on the X axis.' },
    skewY: { short: 'Skew Y', detail: 'Drag vertically to shear the panel on the Y axis.' },
    arcRx: { short: 'Arc rx', detail: 'Adjust bottom arc horizontal radius.' },
    arcRy: { short: 'Arc ry', detail: 'Adjust bottom arc vertical radius.' },
    topArcRx: { short: 'Top arc rx', detail: 'Adjust top arc horizontal radius.' },
    topArcRy: { short: 'Top arc ry', detail: 'Adjust top arc vertical radius.' },
    topLeftY: { short: 'Top-left inset', detail: 'Move top-left corner inset up or down.' },
    topRightY: { short: 'Top-right inset', detail: 'Move top-right corner inset up or down.' },
    bottomLeftY: { short: 'Bottom-left inset', detail: 'Move bottom-left corner inset up or down.' },
    bottomRightY: { short: 'Bottom-right inset', detail: 'Move bottom-right corner inset up or down.' },
    origin: { short: 'Origin', detail: 'Set transform origin point used for rotate/scale/skew.' },
  };

  const renderCanvasHandle = (handle: CanvasHandle, className: string, style?: CSSProperties) => {
    const tooltip = canvasHandleHelp[handle];
    const showSmallTooltip = hoveredCanvasTooltip === handle || expandedCanvasTooltip === handle;
    const showDetailTooltip = expandedCanvasTooltip === handle;

    return (
      <button
        type="button"
        key={handle}
        aria-label={tooltip.short}
        onMouseDown={(event) => startCanvasHandleDrag(handle, event)}
        onMouseEnter={() => setHoveredCanvasTooltip(handle)}
        onMouseLeave={() => {
          setHoveredCanvasTooltip((prev) => (prev === handle ? null : prev));
        }}
        className={`canvas-handle ${className}`}
        style={style}
      >
        {showSmallTooltip && (
          <span
            className="handle-tooltip-small"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpandedCanvasTooltip((prev) => (prev === handle ? null : handle));
            }}
          >
            {tooltip.short}
          </span>
        )}
        {showDetailTooltip && (
          <span
            className="handle-tooltip-detail"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {tooltip.detail}
          </span>
        )}
      </button>
    );
  };

  const showAllTools = activeToolSet === 'all';
  const showSizeTools = showAllTools || activeToolSet === 'size';
  const showArcTools = showAllTools || activeToolSet === 'arc';
  const showSideTools = showAllTools || activeToolSet === 'side';
  const showTransformTools = showAllTools || activeToolSet === 'transform';
  const showStyleTools = showAllTools || activeToolSet === 'style';

  const applyStylePreset = (preset: 'default' | 'neon' | 'glass' | 'industrial') => {
    pushHistory();
    if (preset === 'default') {
      setPanelFillStart('#6366f1');
      setPanelFillMid('#06b6d4');
      setPanelFillEnd('#34d399');
      setPanelBorderColor('#7dd3fc');
      setPanelBorderWidth(1);
      setPanelOpacity(78);
      setPanelGlow(38);
      setCouplerFillColor('#22d3ee');
      setCouplerBorderColor('#7dd3fc');
      setShowArcText(true);
      return;
    }

    if (preset === 'neon') {
      setPanelFillStart('#7c3aed');
      setPanelFillMid('#0ea5e9');
      setPanelFillEnd('#22c55e');
      setPanelBorderColor('#67e8f9');
      setPanelBorderWidth(2);
      setPanelOpacity(92);
      setPanelGlow(72);
      setCouplerFillColor('#06b6d4');
      setCouplerBorderColor('#67e8f9');
      setShowArcText(true);
      return;
    }

    if (preset === 'glass') {
      setPanelFillStart('#64748b');
      setPanelFillMid('#0f172a');
      setPanelFillEnd('#334155');
      setPanelBorderColor('#94a3b8');
      setPanelBorderWidth(1);
      setPanelOpacity(62);
      setPanelGlow(20);
      setCouplerFillColor('#94a3b8');
      setCouplerBorderColor('#cbd5e1');
      setShowArcText(true);
      return;
    }

    setPanelFillStart('#374151');
    setPanelFillMid('#4b5563');
    setPanelFillEnd('#6b7280');
    setPanelBorderColor('#d1d5db');
    setPanelBorderWidth(2);
    setPanelOpacity(95);
    setPanelGlow(8);
    setCouplerFillColor('#6b7280');
    setCouplerBorderColor('#e5e7eb');
    setShowArcText(false);
  };

  const applyStyleValues = (preset: StylePreset) => {
    setPanelFillStart(preset.panelFillStart);
    setPanelFillMid(preset.panelFillMid);
    setPanelFillEnd(preset.panelFillEnd);
    setPanelBorderColor(preset.panelBorderColor);
    setPanelBorderWidth(preset.panelBorderWidth);
    setPanelOpacity(preset.panelOpacity);
    setPanelGlow(preset.panelGlow);
    setCouplerFillColor(preset.couplerFillColor);
    setCouplerBorderColor(preset.couplerBorderColor);
    setShowArcText(preset.showArcText);
  };

  const captureCurrentStyle = (): StylePreset => ({
    id: `${Date.now()}`,
    name: presetName.trim() || `Preset ${customPresets.length + 1}`,
    panelFillStart,
    panelFillMid,
    panelFillEnd,
    panelBorderColor,
    panelBorderWidth,
    panelOpacity,
    panelGlow,
    couplerFillColor,
    couplerBorderColor,
    showArcText,
  });

  const saveCustomPreset = () => {
    const next = captureCurrentStyle();
    setCustomPresets((prev) => [next, ...prev].slice(0, 24));
    setPresetName('');
    setSelectedPresetId(next.id);
  };

  const loadCustomPreset = () => {
    const selected = customPresets.find((preset) => preset.id === selectedPresetId);
    if (!selected) return;
    pushHistory();
    applyStyleValues(selected);
  };

  const deleteCustomPreset = () => {
    if (!selectedPresetId) return;
    setCustomPresets((prev) => prev.filter((preset) => preset.id !== selectedPresetId));
    setSelectedPresetId('');
  };

  const exportCustomPresets = () => {
    if (typeof window === 'undefined' || customPresets.length === 0) return;

    const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), presets: customPresets }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `aurora-arc-presets-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const importCustomPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const parsed = JSON.parse(text) as { presets?: StylePreset[] } | StylePreset[];
        const incoming = Array.isArray(parsed) ? parsed : Array.isArray(parsed.presets) ? parsed.presets : [];
        if (incoming.length === 0) return;

        const normalized = incoming
          .filter((item) => typeof item?.name === 'string')
          .map((item) => ({
            ...item,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: item.name || 'Imported Preset',
          }))
          .slice(0, 24);

        if (normalized.length === 0) return;

        setCustomPresets((prev) => [...normalized, ...prev].slice(0, 24));
        setSelectedPresetId(normalized[0].id);
      } catch {
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const captureSnapshot = (): LabSnapshot => ({
    panelWidth,
    panelHeight,
    panelFillStart,
    panelFillMid,
    panelFillEnd,
    panelBorderColor,
    panelBorderWidth,
    panelOpacity,
    panelGlow,
    couplerFillColor,
    couplerBorderColor,
    showArcText,
    arcRx,
    arcRy,
    arcRotation,
    arcLargeFlag,
    arcSweepFlag,
    topArcRx,
    topArcRy,
    topArcRotation,
    topArcLargeFlag,
    topArcSweepFlag,
    topLeftY,
    topRightY,
    bottomLeftY,
    bottomRightY,
    couplerSize,
    overlap,
    translateX,
    translateY,
    rotateDeg,
    skewX,
    skewY,
    scaleX,
    scaleY,
    originX,
    originY,
    couplerRotate,
    moduleGap,
  });

  const pushHistory = () => {
    const snapshot = captureSnapshot();
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), snapshot].slice(-50));
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  };

  const applySnapshot = useCallback((snapshot: LabSnapshot) => {
    setPanelWidth(snapshot.panelWidth);
    setPanelHeight(snapshot.panelHeight);
    setPanelFillStart(snapshot.panelFillStart);
    setPanelFillMid(snapshot.panelFillMid);
    setPanelFillEnd(snapshot.panelFillEnd);
    setPanelBorderColor(snapshot.panelBorderColor);
    setPanelBorderWidth(snapshot.panelBorderWidth);
    setPanelOpacity(snapshot.panelOpacity);
    setPanelGlow(snapshot.panelGlow);
    setCouplerFillColor(snapshot.couplerFillColor);
    setCouplerBorderColor(snapshot.couplerBorderColor);
    setShowArcText(snapshot.showArcText);
    setArcRx(snapshot.arcRx);
    setArcRy(snapshot.arcRy);
    setArcRotation(snapshot.arcRotation);
    setArcLargeFlag(snapshot.arcLargeFlag);
    setArcSweepFlag(snapshot.arcSweepFlag);
    setTopArcRx(snapshot.topArcRx);
    setTopArcRy(snapshot.topArcRy);
    setTopArcRotation(snapshot.topArcRotation);
    setTopArcLargeFlag(snapshot.topArcLargeFlag);
    setTopArcSweepFlag(snapshot.topArcSweepFlag);
    setTopLeftY(snapshot.topLeftY);
    setTopRightY(snapshot.topRightY);
    setBottomLeftY(snapshot.bottomLeftY);
    setBottomRightY(snapshot.bottomRightY);
    setCouplerSize(snapshot.couplerSize);
    setOverlap(snapshot.overlap);
    setTranslateX(snapshot.translateX);
    setTranslateY(snapshot.translateY);
    setRotateDeg(snapshot.rotateDeg);
    setSkewX(snapshot.skewX);
    setSkewY(snapshot.skewY);
    setScaleX(snapshot.scaleX);
    setScaleY(snapshot.scaleY);
    setOriginX(snapshot.originX);
    setOriginY(snapshot.originY);
    setCouplerRotate(snapshot.couplerRotate);
    setModuleGap(snapshot.moduleGap);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    applySnapshot(history[newIndex]);
  }, [applySnapshot, history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    applySnapshot(history[newIndex]);
  }, [applySnapshot, history, historyIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        setShowGrid((prev) => !prev);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setOpenMenuPanel(null);
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [redo, undo]);

  const resetAll = () => {
    pushHistory();
    setPanelWidth(180);
    setPanelHeight(44);
    setPanelFillStart('#6366f1');
    setPanelFillMid('#06b6d4');
    setPanelFillEnd('#34d399');
    setPanelBorderColor('#7dd3fc');
    setPanelBorderWidth(1);
    setPanelOpacity(78);
    setPanelGlow(38);
    setCouplerFillColor('#22d3ee');
    setCouplerBorderColor('#7dd3fc');
    setShowArcText(true);
    setArcRx(0.5);
    setArcRy(0.78);
    setArcRotation(0);
    setArcLargeFlag(0);
    setArcSweepFlag(0);
    setTopArcRx(0.5);
    setTopArcRy(0.38);
    setTopArcRotation(0);
    setTopArcLargeFlag(0);
    setTopArcSweepFlag(100);
    setTopLeftY(0);
    setTopRightY(0);
    setBottomLeftY(0);
    setBottomRightY(0);
    setCouplerSize(14);
    setOverlap(5);
    setTranslateX(0);
    setTranslateY(0);
    setRotateDeg(0);
    setSkewX(0);
    setSkewY(0);
    setScaleX(1);
    setScaleY(1);
    setOriginX(50);
    setOriginY(50);
    setCouplerRotate(0);
    setModuleGap(0);
  };

  const renderMenuPanel = () => {
    if (openMenuPanel === 'dock') {
      return (
        <div className="rounded border border-slate-700/70 bg-slate-900/95 p-1 space-y-0.5">
          <p className="text-[9px] text-slate-400">Dock Position</p>
          <div className="grid grid-cols-3 gap-0.5">
            {dockOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDockMode(option)}
                className={`rounded border px-1 py-0 text-[7px] font-semibold uppercase transition ${dockMode === option ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate-500">Panel: {toolPanelWidth}px × {toolPanelHeight}px</p>
        </div>
      );
    }

    if (openMenuPanel === 'toolset') {
      return (
        <div className="rounded border border-slate-700/70 bg-slate-900/95 p-1 space-y-0.5">
          <p className="text-[9px] text-slate-400">Toolset Menu</p>
          <div className="flex flex-wrap gap-0.5">
            {toolSetOptions.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveToolSet(tool.id)}
                className={`rounded border px-1 py-0 text-[7px] font-semibold transition ${activeToolSet === tool.id ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (openMenuPanel === 'size' && showSizeTools) {
      return (
        <div className="rounded border border-slate-700/70 bg-slate-900/95 p-1 space-y-0.5">
          <p className="text-[9px] text-slate-400">Size + Couplers</p>
          <SliderControl label="Panel width" value={panelWidth} min={90} max={420} onChange={setPanelWidth} unit="px" decimals={0} />
          <SliderControl label="Panel height" value={panelHeight} min={20} max={120} onChange={setPanelHeight} unit="px" decimals={0} />
          <SliderControl label="Coupler size" value={couplerSize} min={8} max={42} onChange={setCouplerSize} unit="px" decimals={0} />
          <SliderControl label="Coupler overlap" value={overlap} min={0} max={24} onChange={setOverlap} unit="px" decimals={0} />
          <SliderControl label="Module gap" value={moduleGap} min={-20} max={30} onChange={setModuleGap} unit="px" decimals={0} />
          <SliderControl label="Coupler rotation" value={couplerRotate} min={-180} max={180} onChange={setCouplerRotate} unit="°" decimals={0} />
        </div>
      );
    }

    if (openMenuPanel === 'arc' && showArcTools) {
      return (
        <div className="rounded border border-slate-700/70 bg-slate-900/95 p-1 space-y-0.5">
          <div className="space-y-0.5">
            <p className="text-[9px] text-slate-400 font-semibold">Top Arc (SVG A)</p>
            <SliderControl label="Top arc rx" value={topArcRx} min={0.1} max={1.2} step={0.01} onChange={setTopArcRx} />
            <SliderControl label="Top arc ry" value={topArcRy} min={0.1} max={1.5} step={0.01} onChange={setTopArcRy} />
            <SliderControl label="Top rotation" value={topArcRotation} min={-180} max={180} onChange={setTopArcRotation} unit="°" decimals={0} />
            <SliderControl label="Top large-arc" value={topArcLargeFlag} min={0} max={100} onChange={(value) => setTopArcLargeFlag(value >= 50 ? 100 : 0)} decimals={0} />
            <SliderControl label="Top sweep" value={topArcSweepFlag} min={0} max={100} onChange={(value) => setTopArcSweepFlag(value >= 50 ? 100 : 0)} decimals={0} />
          </div>
          <div className="border-t border-slate-700/50 pt-0.5 space-y-0.5">
            <p className="text-[9px] text-slate-400 font-semibold">Bottom Arc (SVG A)</p>
            <SliderControl label="Bottom arc rx" value={arcRx} min={0.1} max={1.2} step={0.01} onChange={setArcRx} />
            <SliderControl label="Bottom arc ry" value={arcRy} min={0.1} max={1.5} step={0.01} onChange={setArcRy} />
            <SliderControl label="Bottom rotation" value={arcRotation} min={-180} max={180} onChange={setArcRotation} unit="°" decimals={0} />
            <SliderControl label="Bottom large-arc" value={arcLargeFlag} min={0} max={100} onChange={(value) => setArcLargeFlag(value >= 50 ? 100 : 0)} decimals={0} />
            <SliderControl label="Bottom sweep" value={arcSweepFlag} min={0} max={100} onChange={(value) => setArcSweepFlag(value >= 50 ? 100 : 0)} decimals={0} />
          </div>
        </div>
      );
    }

    if (openMenuPanel === 'side' && showSideTools) {
      return (
        <div className="rounded border border-slate-700/70 bg-slate-900/95 p-1 space-y-0.5">
          <p className="text-[9px] text-slate-400">Side Geometry</p>
          <SliderControl label="Top-left Y" value={topLeftY} min={0} max={0.45} step={0.01} onChange={setTopLeftY} />
          <SliderControl label="Top-right Y" value={topRightY} min={0} max={0.45} step={0.01} onChange={setTopRightY} />
          <SliderControl label="Bottom-left inset" value={bottomLeftY} min={0} max={0.45} step={0.01} onChange={setBottomLeftY} />
          <SliderControl label="Bottom-right inset" value={bottomRightY} min={0} max={0.45} step={0.01} onChange={setBottomRightY} />
        </div>
      );
    }

    if (openMenuPanel === 'transform' && showTransformTools) {
      return (
        <div className="rounded border border-slate-700/70 bg-slate-900/95 p-1 space-y-0.5">
          <p className="text-[9px] text-slate-400">Transform Stack</p>
          <SliderControl label="Translate X" value={translateX} min={-220} max={220} onChange={setTranslateX} unit="px" decimals={0} />
          <SliderControl label="Translate Y" value={translateY} min={-220} max={220} onChange={setTranslateY} unit="px" decimals={0} />
          <SliderControl label="Rotate" value={rotateDeg} min={-180} max={180} onChange={setRotateDeg} unit="°" decimals={0} />
          <SliderControl label="Skew X" value={skewX} min={-75} max={75} onChange={setSkewX} unit="°" decimals={0} />
          <SliderControl label="Skew Y" value={skewY} min={-75} max={75} onChange={setSkewY} unit="°" decimals={0} />
          <SliderControl label="Scale X" value={scaleX} min={0.2} max={2.5} step={0.01} onChange={setScaleX} />
          <SliderControl label="Scale Y" value={scaleY} min={0.2} max={2.5} step={0.01} onChange={setScaleY} />
          <SliderControl label="Origin X" value={originX} min={0} max={100} onChange={setOriginX} unit="%" decimals={0} />
          <SliderControl label="Origin Y" value={originY} min={0} max={100} onChange={setOriginY} unit="%" decimals={0} />
        </div>
      );
    }

    if (openMenuPanel === 'style' && showStyleTools) {
      return (
        <div className="rounded border border-slate-700/70 bg-slate-900/95 p-1 space-y-0.5">
          <p className="text-[9px] text-slate-400">Style</p>

          <div className="grid grid-cols-2 gap-0.5">
            <button type="button" onClick={() => applyStylePreset('default')} className="rounded border border-slate-600 bg-slate-950 px-0.5 py-0 text-[7px] text-slate-200 hover:border-slate-400">Default</button>
            <button type="button" onClick={() => applyStylePreset('neon')} className="rounded border border-slate-600 bg-slate-950 px-0.5 py-0 text-[7px] text-slate-200 hover:border-slate-400">Neon</button>
            <button type="button" onClick={() => applyStylePreset('glass')} className="rounded border border-slate-600 bg-slate-950 px-0.5 py-0 text-[7px] text-slate-200 hover:border-slate-400">Glass</button>
            <button type="button" onClick={() => applyStylePreset('industrial')} className="rounded border border-slate-600 bg-slate-950 px-0.5 py-0 text-[7px] text-slate-200 hover:border-slate-400">Industrial</button>
          </div>

          <div className="rounded border border-slate-700/80 bg-slate-950/60 p-0.5 space-y-0.5">
            <p className="text-[9px] text-slate-400">Custom presets</p>
            <div className="grid grid-cols-[1fr_auto] gap-0.5">
              <input
                type="text"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                placeholder="Preset name"
                className="w-full rounded border border-slate-600 bg-slate-950 px-0.5 py-0 text-[7px] text-slate-100"
              />
              <button
                type="button"
                onClick={saveCustomPreset}
                className="rounded border border-cyan-500/60 bg-cyan-500/20 px-1 py-0 text-[7px] font-semibold text-cyan-200 hover:border-cyan-400"
              >
                Save
              </button>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto] gap-0.5">
              <select
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-950 px-0.5 py-0 text-[7px] text-slate-100"
              >
                <option value="">Select preset</option>
                {customPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadCustomPreset}
                disabled={!selectedPresetId}
                className="rounded border border-slate-500 px-1 py-0 text-[7px] text-slate-200 disabled:opacity-50"
              >
                Load
              </button>
              <button
                type="button"
                onClick={deleteCustomPreset}
                disabled={!selectedPresetId}
                className="rounded border border-rose-500/60 px-1 py-0 text-[7px] text-rose-200 disabled:opacity-50"
              >
                Delete
              </button>
            </div>

              <div className="grid grid-cols-2 gap-0.5">
                <button
                  type="button"
                  onClick={exportCustomPresets}
                  disabled={customPresets.length === 0}
                  className="rounded border border-slate-500 px-1 py-0 text-[7px] text-slate-200 disabled:opacity-50"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => importPresetsInputRef.current?.click()}
                  className="rounded border border-slate-500 px-1 py-0 text-[7px] text-slate-200"
                >
                  Import JSON
                </button>
                <input
                  ref={importPresetsInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={importCustomPresets}
                  className="hidden"
                />
              </div>
          </div>

          <label className="grid gap-0 text-[9px]">
            <span className="text-slate-300">Fill Start</span>
            <input type="color" value={panelFillStart} onChange={(event) => setPanelFillStart(event.target.value)} className="h-3 w-full rounded border border-slate-600 bg-slate-950" />
          </label>
          <label className="grid gap-0 text-[9px]">
            <span className="text-slate-300">Fill Mid</span>
            <input type="color" value={panelFillMid} onChange={(event) => setPanelFillMid(event.target.value)} className="h-3 w-full rounded border border-slate-600 bg-slate-950" />
          </label>
          <label className="grid gap-0 text-[9px]">
            <span className="text-slate-300">Fill End</span>
            <input type="color" value={panelFillEnd} onChange={(event) => setPanelFillEnd(event.target.value)} className="h-3 w-full rounded border border-slate-600 bg-slate-950" />
          </label>
          <label className="grid gap-0 text-[9px]">
            <span className="text-slate-300">Border Color</span>
            <input type="color" value={panelBorderColor} onChange={(event) => setPanelBorderColor(event.target.value)} className="h-3 w-full rounded border border-slate-600 bg-slate-950" />
          </label>
          <label className="grid gap-0 text-[9px]">
            <span className="text-slate-300">Coupler Fill</span>
            <input type="color" value={couplerFillColor} onChange={(event) => setCouplerFillColor(event.target.value)} className="h-3 w-full rounded border border-slate-600 bg-slate-950" />
          </label>
          <label className="grid gap-0 text-[9px]">
            <span className="text-slate-300">Coupler Border</span>
            <input type="color" value={couplerBorderColor} onChange={(event) => setCouplerBorderColor(event.target.value)} className="h-3 w-full rounded border border-slate-600 bg-slate-950" />
          </label>

          <SliderControl label="Border Width" value={panelBorderWidth} min={1} max={4} onChange={setPanelBorderWidth} unit="px" decimals={0} />
          <SliderControl label="Panel Opacity" value={panelOpacity} min={20} max={100} step={1} onChange={setPanelOpacity} decimals={0} />
          <SliderControl label="Glow" value={panelGlow} min={0} max={90} step={1} onChange={setPanelGlow} decimals={0} />

          <button
            type="button"
            onClick={() => setShowArcText((prev) => !prev)}
            className={`rounded border px-1 py-0 text-[7px] font-semibold transition ${showArcText ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
          >
            {showArcText ? 'Hide text' : 'Show text'}
          </button>
        </div>
      );
    }

    return null;
  };

  const globalMenuBar = (
    <div className="sticky top-2 z-40">
      <div className="relative rounded-lg border border-slate-700/80 bg-slate-900/95 p-1 shadow-xl backdrop-blur">
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setOpenMenuPanel((prev) => (prev === 'dock' ? null : 'dock'))} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${openMenuPanel === 'dock' ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>Dock</button>
          <button type="button" onClick={() => setOpenMenuPanel((prev) => (prev === 'toolset' ? null : 'toolset'))} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${openMenuPanel === 'toolset' ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>Toolset</button>
          {showSizeTools && <button type="button" onClick={() => setOpenMenuPanel((prev) => (prev === 'size' ? null : 'size'))} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${openMenuPanel === 'size' ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>Size</button>}
          {showArcTools && <button type="button" onClick={() => setOpenMenuPanel((prev) => (prev === 'arc' ? null : 'arc'))} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${openMenuPanel === 'arc' ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>Arc</button>}
          {showSideTools && <button type="button" onClick={() => setOpenMenuPanel((prev) => (prev === 'side' ? null : 'side'))} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${openMenuPanel === 'side' ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>Side</button>}
          {showTransformTools && <button type="button" onClick={() => setOpenMenuPanel((prev) => (prev === 'transform' ? null : 'transform'))} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${openMenuPanel === 'transform' ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>Transform</button>}
          {showStyleTools && <button type="button" onClick={() => setOpenMenuPanel((prev) => (prev === 'style' ? null : 'style'))} className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${openMenuPanel === 'style' ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>Style</button>}
          
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={undo} disabled={historyIndex <= 0} aria-label="Undo (Ctrl+Z)" className="rounded border px-1 py-0.5 text-[10px] font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500 disabled:hover:border-slate-600">↶</button>
            <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} aria-label="Redo (Ctrl+Y)" className="rounded border px-1 py-0.5 text-[10px] font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500 disabled:hover:border-slate-600">↷</button>
            <button type="button" onClick={() => setShowGrid((prev) => !prev)} aria-label="Toggle Grid (Ctrl+G)" className={`rounded border px-1 py-0.5 text-[10px] font-semibold transition ${showGrid ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>#</button>
            <button type="button" onClick={resetAll} aria-label="Reset All" className="rounded border px-1 py-0.5 text-[10px] font-semibold transition border-slate-600 bg-slate-950 text-slate-300 hover:border-red-500 hover:text-red-300">⟲</button>
            <button type="button" onClick={() => setShowShortcuts((prev) => !prev)} aria-label="Keyboard Shortcuts (Ctrl+/)" className={`rounded border px-1 py-0.5 text-[10px] font-semibold transition ${showShortcuts ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200' : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>?</button>
          </div>
        </div>
        <p className="mt-1 px-0.5 text-[9px] text-slate-500">Active toolset: <span className="text-slate-300 uppercase">{activeToolSet}</span> • Dock: <span className="text-slate-300 uppercase">{dockMode}</span></p>

        {openMenuPanel && (
          <div className="absolute left-0 top-[calc(100%+0.35rem)] z-50 w-[92vw] sm:w-[70vw] md:w-[42vw] lg:w-[18vw] lg:min-w-[14rem] lg:max-w-[20rem] max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain pr-1">
            {renderMenuPanel()}
          </div>
        )}
      </div>
    </div>
  );

  const panelControls = (
    <>
      <p className="text-xs uppercase tracking-wide text-slate-400">Tool Panel</p>
      <p className="text-[11px] text-slate-500">Shortcuts: <span className="text-slate-300">[</span> left, <span className="text-slate-300">]</span> right, <span className="text-slate-300">-</span> top, <span className="text-slate-300">=</span> bottom, <span className="text-slate-300">0</span> floating, <span className="text-slate-300">1-4</span> toggle sections.</p>
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-2">
        <p className="px-1 text-[11px] text-slate-500">Use the sticky menu bar above the canvas to open Dock/Toolset/section panels.</p>
      </div>
    </>
  );

  const panelSurfaceBase = 'border border-slate-700/70 bg-slate-900/70 p-4 space-y-4 overflow-visible';

  const previewPane = (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 grid gap-4 min-h-[34rem]">
      <div className="relative grid place-items-center min-h-[28rem] rounded-lg border border-slate-700/50 bg-slate-950/70 overflow-visible">
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        )}
        <div className="inline-flex items-center" role="group" aria-label="Arc panel preview" style={{ gap: `${moduleGap}px` }}>
          <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true" focusable="false">
            <defs>
              <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                <path d={pathD} />
              </clipPath>
            </defs>
          </svg>

          <span className="rounded-full border border-cyan-300/70 bg-cyan-400/25" style={{ ...couplerStyle, marginRight: `-${overlap}px` }} />
          <span className="relative inline-block" style={{ width: `${panelWidth}px`, height: `${panelHeight}px`, transformOrigin: `${originX}% ${originY}%`, transform: panelTransform }}>
            <span className="absolute inset-0 border border-cyan-300/70 bg-gradient-to-r from-indigo-500/60 via-cyan-500/55 to-emerald-400/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] grid place-items-center" style={{ 
              clipPath: `url(#${clipId})`,
              WebkitClipPath: `url(#${clipId})`,
              borderWidth: `${panelBorderWidth}px`,
              borderColor: panelBorderColor,
              backgroundImage: `linear-gradient(90deg, ${panelFillStart}, ${panelFillMid}, ${panelFillEnd})`,
              opacity: panelOpacity / 100,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 0 16px rgba(34, 211, 238, ${panelGlow / 100})`,
            }}>
              {showArcText && <span className="text-xs tracking-wide font-semibold">ARC</span>}
            </span>
            {renderCanvasHandle('move', 'center')}
            {renderCanvasHandle('width', 'right')}
            {renderCanvasHandle('height', 'bottom')}
            {renderCanvasHandle('scale', 'corner')}
            {renderCanvasHandle('rotate', 'top')}
            {renderCanvasHandle('skewX', 'top-left-mid')}
            {renderCanvasHandle('skewY', 'left-mid')}
            {renderCanvasHandle('arcRx', 'arc-rx')}
            {renderCanvasHandle('arcRy', 'arc-ry')}
            {renderCanvasHandle('topArcRx', 'top-arc-rx')}
            {renderCanvasHandle('topArcRy', 'top-arc-ry')}
            {renderCanvasHandle('topLeftY', 'top-left')}
            {renderCanvasHandle('topRightY', 'top-right')}
            {renderCanvasHandle('bottomLeftY', 'bottom-left')}
            {renderCanvasHandle('bottomRightY', 'bottom-right')}
            {renderCanvasHandle('origin', 'origin', { left: `${originX}%`, top: `${originY}%` })}
          </span>
          <span className="rounded-full border border-cyan-300/70 bg-cyan-400/25" style={{ ...couplerStyle, marginLeft: `-${overlap}px` }} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-3 text-xs text-slate-300 space-y-2">
        <p className="font-semibold text-slate-200">Live Output</p>
        <p>SVG path: <span className="text-cyan-300 break-all">{pathD}</span></p>
        <p>Transform: <span className="text-cyan-300 break-all">{panelTransform}</span></p>
        <p>Origin: <span className="text-cyan-300">{originX.toFixed(0)}% {originY.toFixed(0)}%</span></p>
      </div>

      <style jsx>{`
        .canvas-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: 1px solid rgba(56, 189, 248, 0.8);
          background: rgba(8, 47, 73, 0.92);
          box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.8);
          cursor: grab;
          transform: translate(-50%, -50%);
          z-index: 10;
          pointer-events: auto;
        }

        .canvas-handle:hover {
          background: rgba(34, 211, 238, 0.95);
          border-color: rgba(125, 211, 252, 0.95);
          z-index: 20;
        }

        .canvas-handle:active {
          cursor: grabbing;
        }

        .handle-tooltip-small {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%);
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: rgba(2, 6, 23, 0.96);
          color: #ffffff !important;
          font-size: 9px;
          line-height: 1.1;
          padding: 2px 5px;
          border-radius: 6px;
          z-index: 50;
          pointer-events: auto;
        }

        .handle-tooltip-detail {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 30px);
          transform: translateX(-50%);
          width: max-content;
          max-width: 180px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          background: rgba(2, 6, 23, 0.98);
          color: #ffffff !important;
          font-size: 9px;
          line-height: 1.2;
          padding: 4px 6px;
          border-radius: 6px;
          z-index: 55;
          text-align: center;
          white-space: normal;
          pointer-events: auto;
        }

        .canvas-handle.center { left: 50%; top: 50%; }
        .canvas-handle.right { left: 100%; top: 50%; }
        .canvas-handle.bottom { left: 50%; top: 100%; }
        .canvas-handle.corner { left: 100%; top: 100%; }
        .canvas-handle.top { left: 50%; top: 0%; }
        .canvas-handle.top-left-mid { left: 28%; top: 0%; }
        .canvas-handle.left-mid { left: 0%; top: 50%; }
        .canvas-handle.arc-rx { left: 20%; top: 100%; }
        .canvas-handle.arc-ry { left: 80%; top: 100%; }
        .canvas-handle.top-arc-rx { left: 20%; top: 0%; }
        .canvas-handle.top-arc-ry { left: 80%; top: 0%; }
        .canvas-handle.top-left { left: 0%; top: 0%; }
        .canvas-handle.top-right { left: 100%; top: 0%; }
        .canvas-handle.bottom-left { left: 0%; top: 100%; }
        .canvas-handle.bottom-right { left: 100%; top: 100%; }
        .canvas-handle.origin { transform: translate(-50%, -50%); }
      `}</style>
    </div>
  );

  const layoutClassName =
    dockMode === 'left'
      ? 'grid grid-cols-1 lg:[grid-template-columns:var(--layout-cols)]'
      : dockMode === 'right'
        ? 'grid grid-cols-1 lg:[grid-template-columns:var(--layout-cols)]'
        : dockMode === 'top'
          ? 'grid grid-cols-1 lg:[grid-template-rows:var(--layout-rows)]'
          : dockMode === 'bottom'
            ? 'grid grid-cols-1 lg:[grid-template-rows:var(--layout-rows)]'
            : 'grid grid-cols-1';

  const layoutStyle: CSSProperties = {
    ...(dockMode === 'left' ? { ['--layout-cols' as string]: `${toolPanelWidth}px minmax(0,1fr)` } : {}),
    ...(dockMode === 'right' ? { ['--layout-cols' as string]: `minmax(0,1fr) ${toolPanelWidth}px` } : {}),
    ...(dockMode === 'top' ? { ['--layout-rows' as string]: `${toolPanelHeight}px 8px minmax(0,1fr)` } : {}),
    ...(dockMode === 'bottom' ? { ['--layout-rows' as string]: `minmax(0,1fr) 8px ${toolPanelHeight}px` } : {}),
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto grid gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold">Arc Panel Lab</h1>
          <p className="text-slate-400">Standalone arc-panel lab with full shape and transform controls for side, angle, arc, and pose tuning.</p>
        </header>

        {globalMenuBar}

        <section
          ref={layoutRef}
          className={`${layoutClassName} gap-0 items-stretch relative ${isVerticalResizing || isHorizontalResizing || isFloatingResizing || isFloatingDragging ? 'select-none' : ''}`}
          style={layoutStyle}
        >
          {isSideDock && (
            <>
              <aside
                className={`${panelSurfaceBase} lg:max-h-[calc(100vh-4rem)] ${dockMode === 'left' ? 'lg:order-1 rounded-l-xl' : 'lg:order-3 rounded-r-xl'}`}
                style={{ width: `${toolPanelWidth}px`, maxWidth: '100%' }}
              >
                {panelControls}
              </aside>

              <button
                type="button"
                aria-label="Resize tools panel"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setIsVerticalResizing(true);
                }}
                className="hidden lg:block w-2 cursor-col-resize bg-slate-800/60 hover:bg-cyan-500/30 transition lg:order-2"
              />

              <div className={`${dockMode === 'left' ? 'lg:order-3' : 'lg:order-1'}`}>{previewPane}</div>
            </>
          )}

          {isTopBottomDock && (
            <>
              {dockMode === 'top' && (
                <aside className={`${panelSurfaceBase} rounded-t-xl lg:order-1`} style={{ height: `${toolPanelHeight}px` }}>
                  {panelControls}
                </aside>
              )}

              <button
                type="button"
                aria-label="Resize tools panel"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setIsHorizontalResizing(true);
                }}
                className="hidden lg:block h-2 cursor-row-resize bg-slate-800/60 hover:bg-cyan-500/30 transition lg:order-2"
              />

              <div className="lg:order-3">{previewPane}</div>

              {dockMode === 'bottom' && (
                <aside className={`${panelSurfaceBase} rounded-b-xl lg:order-4`} style={{ height: `${toolPanelHeight}px` }}>
                  {panelControls}
                </aside>
              )}
            </>
          )}

          {dockMode === 'floating' && (
            <>
              <div>{previewPane}</div>
              <aside
                className={`${panelSurfaceBase} rounded-xl shadow-2xl absolute z-20`}
                style={{
                  width: `${toolPanelWidth}px`,
                  height: `${toolPanelHeight}px`,
                  left: `${floatingX}px`,
                  top: `${floatingY}px`,
                }}
              >
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    const rect = (event.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                    dragOffsetRef.current = {
                      x: event.clientX - rect.left,
                      y: event.clientY - rect.top,
                    };
                    setIsFloatingDragging(true);
                  }}
                  className="w-full mb-2 rounded border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-slate-300 cursor-move"
                >
                  Drag Panel
                </button>
                {panelControls}
                <button
                  type="button"
                  aria-label="Resize floating panel"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setIsFloatingResizing(true);
                  }}
                  className="absolute bottom-1 right-1 h-4 w-4 rounded-sm border border-slate-500 bg-slate-800/80 cursor-se-resize"
                />
              </aside>
            </>
          )}
        </section>

        {showShortcuts && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
            <div className="max-w-md w-full mx-4 rounded-lg border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl space-y-2" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-sm font-semibold text-cyan-300">Keyboard Shortcuts</h2>
              <div className="space-y-1 text-[10px] text-slate-300">
                <div className="flex justify-between gap-2">
                  <span>Undo</span>
                  <kbd className="rounded border border-slate-600 bg-slate-950 px-1 py-0.5 text-[9px] text-slate-400">Ctrl+Z</kbd>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Redo</span>
                  <kbd className="rounded border border-slate-600 bg-slate-950 px-1 py-0.5 text-[9px] text-slate-400">Ctrl+Y / Ctrl+Shift+Z</kbd>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Toggle Grid</span>
                  <kbd className="rounded border border-slate-600 bg-slate-950 px-1 py-0.5 text-[9px] text-slate-400">Ctrl+G</kbd>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Toggle Shortcuts</span>
                  <kbd className="rounded border border-slate-600 bg-slate-950 px-1 py-0.5 text-[9px] text-slate-400">Ctrl+/</kbd>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Close Panels</span>
                  <kbd className="rounded border border-slate-600 bg-slate-950 px-1 py-0.5 text-[9px] text-slate-400">Esc</kbd>
                </div>
              </div>
              <button type="button" onClick={() => setShowShortcuts(false)} className="w-full rounded border border-slate-600 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-300 hover:border-slate-500 transition">Close</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
