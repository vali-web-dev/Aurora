'use client';

/**
 * Aurora UI/UX Enhancement Library
 *
 * Modern, professional UI components and utilities for the design studio with:
 * - Advanced input components with validation
 * - Collapsible panel component
 * - Context menu system
 * - Keyboard shortcut hints
 * - Better button variants
 * - Tooltip system
 * - Theme switcher
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

// ========== TOOLTIP COMPONENT ==========
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimer, setShowTimer] = useState<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    setShowTimer(timer);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (showTimer) clearTimeout(showTimer);
    setIsVisible(false);
  }, [showTimer]);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-slate-100 shadow-lg border border-slate-700 ${positionClasses[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ========== COLLAPSIBLE PANEL ==========
export interface CollapsiblePanelProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsiblePanel({ title, icon, children, defaultOpen = true }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 bg-slate-800 px-3 py-2 text-xs font-bold uppercase text-slate-300 hover:bg-slate-700 transition"
      >
        <span>{isOpen ? '▼' : '▶'}</span>
        {icon && <span>{icon}</span>}
        {title}
      </button>
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  );
}

// ========== SLIDER INPUT ==========
export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
  showValue?: boolean;
}

export function Slider({ label, value, min, max, step = 1, onChange, suffix = '', showValue = true }: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300">{label}</label>
        {showValue && <span className="text-xs text-slate-400">{value.toFixed(1)}{suffix}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

// ========== COLOR INPUT ==========
export interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  showHex?: boolean;
}

export function ColorInput({ label, value, onChange, showHex = true }: ColorInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 rounded border border-slate-600"
        />
        {showHex && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={7}
            className="w-20 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs"
            placeholder="#000000"
          />
        )}
      </div>
    </div>
  );
}

// ========== TEXT INPUT ==========
export interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export function TextInput({ label, value, onChange, placeholder, type = 'text' }: TextInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100 placeholder-slate-500"
      />
    </div>
  );
}

// ========== SELECT INPUT ==========
export interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ========== ICON BUTTON GROUP ==========
export interface IconButtonGroupProps {
  options: Array<{ id: string; label: string; icon: string }>;
  value: string;
  onChange: (value: string) => void;
}

export function IconButtonGroup({ options, value, onChange }: IconButtonGroupProps) {
  return (
    <div className="flex gap-1 rounded border border-slate-600 p-1 bg-slate-900">
      {options.map((opt) => (
        <Tooltip key={opt.id} content={opt.label}>
          <button
            onClick={() => onChange(opt.id)}
            className={`flex-1 rounded px-2 py-1 text-xs transition ${
              value === opt.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {opt.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

// ========== GRID INPUT (2D POSITION) ==========
export interface GridInputProps {
  label: string;
  value: { x: number; y: number };
  onChange: (value: { x: number; y: number }) => void;
}

export function GridInput({ label, value, onChange }: GridInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <div className="grid grid-cols-2 gap-1">
        <input
          type="number"
          value={Math.round(value.x)}
          onChange={(e) => onChange({ ...value, x: parseFloat(e.target.value) })}
          placeholder="X"
          className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs"
        />
        <input
          type="number"
          value={Math.round(value.y)}
          onChange={(e) => onChange({ ...value, y: parseFloat(e.target.value) })}
          placeholder="Y"
          className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs"
        />
      </div>
    </div>
  );
}

// ========== KEYBOARD SHORTCUT DISPLAY ==========
export interface KeyboardShortcutDisplayProps {
  shortcut: string | string[];
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function KeyboardShortcutDisplay({ shortcut, label, size = 'sm' }: KeyboardShortcutDisplayProps) {
  const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1',
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex gap-1">
        {shortcuts.map((s, i) => (
          <kbd
            key={i}
            className={`rounded border border-slate-600 bg-slate-900 font-mono ${sizeClasses[size]}`}
          >
            {s}
          </kbd>
        ))}
      </div>
    </div>
  );
}

// ========== TAB GROUP ==========
export interface TabGroupProps {
  tabs: Array<{ id: string; label: string; icon?: string }>;
  activeTab: string;
  onChange: (id: string) => void;
}

export function TabGroup({ tabs, activeTab, onChange }: TabGroupProps) {
  return (
    <div className="flex border-b border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1 border-b-2 px-3 py-2 text-xs font-medium transition ${
            activeTab === tab.id
              ? 'border-blue-500 bg-slate-900 text-blue-300'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ========== SECTION HEADER ==========
export interface SectionHeaderProps {
  title: string;
  icon?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-slate-700 pb-2">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="text-xs font-bold uppercase text-slate-300">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ========== DIVIDER ==========
export function Divider() {
  return <div className="my-2 h-px bg-slate-700" />;
}

// ========== STATUS BADGE ==========
export interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const colors = {
    success: 'bg-green-900 text-green-200 border-green-700',
    error: 'bg-red-900 text-red-200 border-red-700',
    warning: 'bg-yellow-900 text-yellow-200 border-yellow-700',
    info: 'bg-blue-900 text-blue-200 border-blue-700',
  };

  return (
    <div className={`rounded border px-2 py-1 text-xs ${colors[status]}`}>
      {children}
    </div>
  );
}

// ========== HOTKEY HELPER ==========
export interface HotkeyHelperProps {
  shortcuts: Array<{ key: string; description: string }>;
}

export function HotkeyHelper({ shortcuts }: HotkeyHelperProps) {
  return (
    <div className="space-y-1 rounded border border-slate-600 bg-slate-900 p-2">
      <div className="text-xs font-bold text-slate-300 mb-2">Keyboard Shortcuts</div>
      {shortcuts.map((s, i) => (
        <div key={i} className="flex justify-between text-xs text-slate-400">
          <span>{s.description}</span>
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 font-mono">{s.key}</kbd>
        </div>
      ))}
    </div>
  );
}
