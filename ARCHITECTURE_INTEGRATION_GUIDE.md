# Aurora Design Tools - Architecture & Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Aurora Application                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Aurora UI Enhanced Library (14 Components)       │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ • Tooltip  • CollapsiblePanel  • Slider           │  │   │
│  │  │ • ColorInput • TextInput • SelectInput             │  │   │
│  │  │ • IconButtonGroup • GridInput • TabGroup           │  │   │
│  │  │ • SectionHeader • StatusBadge • HotkeyHelper      │  │   │
│  │  │ • KeyboardShortcutDisplay • Divider               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↑                ↑                ↑                    │
│           │                │                │                    │
│  ┌────────┴────────┐  ┌────┴──────────┐  ┌─┴───────────────┐   │
│  │ Photoshop       │  │ ArcPanel      │  │ Advanced        │   │
│  │ Canvas Enhanced │  │ Studio Pro    │  │ Filters/Canvas  │   │
│  │ (1,400 lines)   │  │ (400 lines)   │  │ (existing)      │   │
│  │                 │  │               │  │                 │   │
│  │ Routes:         │  │ Routes:       │  │ Routes:         │   │
│  │ /brand/         │  │ /brand/       │  │ /brand/         │   │
│  │ photoshop-      │  │ studio-pro    │  │ photoshop-      │   │
│  │ enhanced        │  │               │  │ canvas-advanced │   │
│  └────────────────┘  └───────────────┘  └─────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Aurora Design System
│
├── PhotoshopCanvasEnhanced (Standalone Full Editor)
│   ├── Canvas Rendering Layer
│   ├── Layer Management System
│   ├── Tool Handlers (20+ tools)
│   ├── Property Panels
│   │   ├── Layers Panel
│   │   ├── Properties Panel
│   │   ├── Fill Panel
│   │   ├── Stroke Panel
│   │   ├── Filters Panel
│   │   ├── Alignment Tools
│   │   └── Presets
│   ├── Keyboard Shortcut System
│   └── Export Engine
│
├── ArcPanelStudioPro (Integrated Studio)
│   ├── Mode Selector (5 modes)
│   ├── Editor 1 (Left Panel)
│   ├── Editor 2 (Right Panel - Optional)
│   ├── Properties Panel (4 Tabs)
│   │   ├── Properties Tab
│   │   ├── Layers Tab
│   │   ├── Colors Tab
│   │   └── Shortcuts Tab
│   ├── Toolbar
│   │   ├── Mode Buttons
│   │   ├── Action Buttons
│   │   └── Status Display
│   ├── Export Dialog
│   └── Status/Footer Bar
│
└── Aurora UI Enhanced
    ├── Input Components
    │   ├── Tooltip
    │   ├── Slider
    │   ├── ColorInput
    │   ├── TextInput
    │   ├── SelectInput
    │   └── GridInput
    ├── Layout Components
    │   ├── CollapsiblePanel
    │   ├── TabGroup
    │   ├── SectionHeader
    │   └── Divider
    ├── Display Components
    │   ├── StatusBadge
    │   ├── KeyboardShortcutDisplay
    │   └── HotkeyHelper
    └── Control Components
        └── IconButtonGroup
```

## Data Flow Architecture

```
User Interaction
    ↓
    ├─────────────────────────────────────────────────────┐
    ↓                                                      ↓
Tool Handler              State Update              Canvas Rendering
    ↓                          ↓                          ↓
Get Tool Mode         updateLayer(patch)         Canvas 2D Context
    ↓                          ↓                          ↓
Execute Tool Action   setLayers(nextLayers)      Apply Transformations
    ↓                          ↓                          ↓
Update Layer Data     Update History             Apply Blend Modes
    ↓                          ↓                          ↓
Trigger Render        Store in History           Apply Filters
    ↓                          ↓                          ↓
Update UI             Notify Components          Draw to Screen
    ↓                          ↓                          ↓
Display on Canvas     Update Properties          Visual Feedback
```

## State Management

```
PhotoshopCanvasEnhanced State:
├── layers: EnhancedLayer[]
├── selectedLayerId: string
├── activeTool: ToolType
├── foregroundColor: string
├── backgroundColor: string
├── zoom: number
├── panX/panY: number
├── showGrid: boolean
├── showRulers: boolean
├── showGuides: boolean
├── guides: Guide[]
├── history: EnhancedLayer[][]
├── historyIndex: number
└── expandedPanels: { [key]: boolean }

ArcPanelStudioPro State:
├── editorMode: EditorMode
├── zoom: number
├── panX/panY: number
├── isDirty: boolean
├── showPanels: boolean
├── activeTab: string
├── syncStatus: string
└── showExportDialog: boolean

Shared UI State:
├── tooltips: visible/hidden
├── panels: expanded/collapsed
├── tabs: active
└── modals: open/closed
```

## Feature Integration Points

```
Canvas Engine
    ↓
┌───────────────────────────────────┐
│ Layer Properties                   │
│ • Position, Size, Rotation         │
│ • Opacity, Blend Mode              │
│ • Fill, Stroke, Effects            │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ Rendering Pipeline                │
│ • Clear Canvas                     │
│ • Apply Grid/Guides               │
│ • Render Layers                   │
│ • Apply Filters                   │
│ • Apply Blend Modes               │
│ • Draw Selection                  │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ Interactive Layer                 │
│ • Mouse Handlers                  │
│ • Keyboard Handlers               │
│ • Touch Support (future)          │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ Export System                     │
│ • Canvas to PNG                   │
│ • Format Options (future)         │
│ • Quality Control                 │
└───────────────────────────────────┘
```

## Tool Categories

```
20+ Tools Organized By Function:

SELECTION TOOLS (4)
├── Select (V)
├── Rect Select (R)
├── Ellipse Select (E)
└── Lasso

TRANSFORM TOOLS (5)
├── Crop (C)
├── Rotate (Shift+R)
├── Scale
├── Skew
└── Perspective

DRAWING TOOLS (4)
├── Brush (B)
├── Eraser (Shift+E)
├── Pen (P)
└── Pencil

SHAPE TOOLS (4)
├── Rectangle (Shift+U)
├── Ellipse (U)
├── Line (L)
└── Polygon

FILL/COLOR TOOLS (3)
├── Fill (G)
├── Gradient (Shift+G)
└── Eyedropper (I)

UTILITY TOOLS (3)
├── Text (T)
├── Hand (Space)
└── Zoom (Z)
```

## Filter Pipeline

```
Input Image
    ↓
Filter 1 (Blur)
    ↓
Filter 2 (Brightness)
    ↓
Filter 3 (Contrast)
    ↓
Filter 4 (Grayscale)
    ↓
Filter 5 (Hue-rotate)
    ↓
Filter 6 (Invert)
    ↓
Filter 7 (Saturate)
    ↓
Filter 8 (Sepia)
    ↓
Filter 9 (Opacity)
    ↓
CSS Filter String
    ↓
Applied to Canvas
    ↓
Output Image
```

## Editor Modes in Studio Pro

```
ARC PANEL MODE
   └── Single Arc Panel Editor

PHOTOSHOP BASIC MODE
   └── PhotoshopCanvas

PHOTOSHOP PRO MODE
   └── PhotoshopCanvasAdvanced

SPLIT HORIZONTAL MODE
   ├── Left: Arc Panel
   └── Right: PhotoshopCanvas

SPLIT VERTICAL MODE
   ├── Top: Arc Panel
   └── Bottom: PhotoshopCanvas
```

## Keyboard Shortcut System

```
Key Press Event
    ↓
handleKeyDown
    ↓
Find Tool in TOOLS Array
    ↓
Match Key or Shortcut
    ↓
Set Active Tool
    ↓
OR
    ├── Ctrl+Z → undo()
    ├── Ctrl+Y → redo()
    ├── Delete → deleteLayer()
    ├── Tab → togglePanels()
    ├── Ctrl+S → save()
    ├── Ctrl+E → export()
    └── Space → setTool('hand')
```

## Performance Optimization Strategy

```
Rendering Optimization:
├── Canvas Context Caching
├── Layer Visibility Culling
├── Transform Batching
└── Memoized Handlers (useCallback)

Memory Management:
├── History Limit (50 steps)
├── Layer Data Compression
├── Cleanup Functions
└── Ref Management

Interaction Optimization:
├── Debounced Updates
├── Smooth Zoom (requestAnimationFrame)
├── Pan Acceleration
└── Filter Updates (lazy evaluation)
```

## Integration with Existing Aurora

```
Aurora Ecosystem
    ↓
    ├── Commerce (Product Images)
    ├── Social (Thumbnails)
    ├── Entertainment (Posters)
    ├── Brand (Logo Design) ← HERE
    │   ├── Arc Panel Logo Lab (Existing)
    │   ├── Photoshop Canvas (New)
    │   ├── Photoshop Enhanced (NEW!)
    │   └── Studio Pro (NEW!)
    ├── Create (Asset Design)
    ├── Learning (Tutorials)
    └── Community (Galleries)
```

## Component Reusability

```
Aurora UI Enhanced Components can be used in:

┌─────────────────────────────────────┐
│ PhotoshopCanvasEnhanced             │
│ • Slider for filters                │
│ • CollapsiblePanel for properties  │
│ • Tooltip for tool hints            │
│ • IconButtonGroup for alignment     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ArcPanelStudioPro                  │
│ • TabGroup for properties           │
│ • CollapsiblePanel for layers       │
│ • Tooltip for mode hints            │
│ • Slider for zoom/pan               │
│ • SectionHeader for organization    │
│ • HotkeyHelper for shortcuts        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Other Aurora Features               │
│ Can import and use any of the       │
│ 14 components for consistent UI     │
│ • Modals                            │
│ • Settings panels                   │
│ • Property editors                  │
│ • Dialogs                           │
│ • Toolbars                          │
└─────────────────────────────────────┘
```

## File Organization

```
src/
├── components/brand/
│   ├── PhotoshopCanvasEnhanced.tsx (1400 lines)
│   ├── ArcPanelStudioPro.tsx (400 lines)
│   ├── ArcPanelLogoLab.tsx (existing)
│   ├── PhotoshopCanvas.tsx (existing)
│   └── PhotoshopCanvasAdvanced.tsx (existing)
│
├── lib/
│   ├── aurora-ui-enhanced.tsx (600 lines)
│   └── ... (existing utils)
│
├── app/brand/
│   ├── photoshop-enhanced/
│   │   └── page.tsx
│   ├── studio-pro/
│   │   └── page.tsx
│   ├── photoshop-canvas/ (existing)
│   ├── arc-panel-lab/ (existing)
│   └── ... (other brand routes)
│
└── types/ 
    └── aurora-design.ts (optional: shared types)

docs/
├── AURORA_DESIGN_TOOLS_ENHANCED.md (500+ lines)
└── ... (existing docs)

Root Documentation:
├── AURORA_DESIGN_TOOLS_COMPLETE.md
├── AURORA_DESIGN_ENHANCED_ACCESS_GUIDE.md
├── ENHANCEMENT_SUMMARY.md
└── QUICK_START_DESIGN_TOOLS.md
```

## API Surface

```
External API (What Others Import):

from @/components/brand/PhotoshopCanvasEnhanced:
  export function PhotoshopCanvasEnhanced() → JSX.Element

from @/components/brand/ArcPanelStudioPro:
  export function ArcPanelStudioPro() → JSX.Element

from @/lib/aurora-ui-enhanced:
  export { Tooltip, CollapsiblePanel, Slider, ColorInput,
           TextInput, SelectInput, IconButtonGroup, GridInput,
           KeyboardShortcutDisplay, TabGroup, SectionHeader,
           StatusBadge, HotkeyHelper, Divider }
```

## Extension Points

```
Easy to Extend:

1. Add More Tools:
   Edit TOOLS array + add handler

2. Add More Filters:
   Edit FILTER_TYPES array + add rendering

3. Add More Presets:
   Edit PRESETS array

4. Add More Blend Modes:
   Edit blend mode mapping

5. Add More Colors:
   Edit color palette

6. Add More Shortcuts:
   Edit keyboard handler

7. Add More UI Components:
   Add to aurora-ui-enhanced.tsx

8. Add More Export Formats:
   Add to export dialog
```

## Deployment Considerations

```
Production Ready:
✓ TypeScript - Full type coverage
✓ Performance - Optimized handlers
✓ Accessibility - ARIA, semantic HTML
✓ Browser Support - Chrome 90+, FF 88+, Safari 14+, Edge 90+
✓ Error Handling - Try-catch, validation
✓ Build Size - Minimal dependencies
✓ Documentation - 2000+ lines
✓ Testing - Component validation

For Production:
1. Review build output
2. Monitor canvas performance
3. Set up analytics
4. Implement persistent storage
5. Add collaborative features
6. Configure CDN for assets
7. Set up monitoring/logging
8. Test across devices
```

---

## Quick Reference Links

**Component Files:**
- [PhotoshopCanvasEnhanced](../src/components/brand/PhotoshopCanvasEnhanced.tsx)
- [ArcPanelStudioPro](../src/components/brand/ArcPanelStudioPro.tsx)
- [Aurora UI Enhanced](../src/lib/aurora-ui-enhanced.tsx)

**Documentation:**
- [Complete Reference](./docs/AURORA_DESIGN_TOOLS_ENHANCED.md)
- [Quick Start](./QUICK_START_DESIGN_TOOLS.md)
- [Access Guide](./AURORA_DESIGN_ENHANCED_ACCESS_GUIDE.md)
- [Enhancement Summary](./ENHANCEMENT_SUMMARY.md)

**Routes:**
- Enhanced: http://localhost:3000/brand/photoshop-enhanced
- Studio Pro: http://localhost:3000/brand/studio-pro

---

*Aurora Design Tools v2.0 | Architecture & Integration Guide | February 2026*
