# Photoshop Canvas Integration Guide

## Overview

Aurora now includes three professional editing environments seamlessly integrated:

1. **PhotoshopCanvas** - Comprehensive PS-like editor with full feature parity
2. **PhotoshopCanvasAdvanced** - Extended version with Smart Objects, Adjustment Layers, Masks
3. **ArcPanelLogoLabIntegrated** - Unified studio combining Arc Panel + PS Canvas

## Architecture

```
┌─────────────────────────────────────────────────────┐
│       Aurora Logo Studio (Integrated)              │
├─────────────────────────────────────────────────────┤
│  [Arc Panel] [Photoshop] [PS Advanced] [Split]     │
├──────┬──────────────────────────────────┬───────────┤
│      │    Main Editor                    │  Panels   │
│  Tools  (Depends on Mode)              │ Layers    │
│      │                                  │ Props     │
│      │                                  │ Colors    │
└──────┴──────────────────────────────────┴───────────┘
```

## Feature Matrix

### PhotoshopCanvas (Standalone)
- ✓ Full layer system with visibility/lock
- ✓ 16 blend modes (normal, multiply, screen, overlay, etc.)
- ✓ Text layers with font controls
- ✓ Shape tools (rect, ellipse, line)
- ✓ Brush/eraser tools
- ✓ Color picker
- ✓ Filters (blur, grayscale, sepia, hue-rotate, etc.)
- ✓ Shadow effects
- ✓ Opacity & transform
- ✓ Full undo/redo with 50-step history
- ✓ Keyboard shortcuts (V, T, B, H, Ctrl+Z, Delete)
- ✓ Grid & guides
- ✓ Zoom & pan
- ✓ PNG/SVG export
- ✓ Project save/load

### PhotoshopCanvasAdvanced
- ✓ Everything from PhotoshopCanvas +
- ✓ Adjustment layers (brightness, curves, hue-saturation)
- ✓ Smart Objects with linking
- ✓ Layer masks
- ✓ Gradient fills
- ✓ Clipping masks
- ✓ Layer groups
- ✓ Guides system
- ✓ Filter presets (sketch, vintage, cinematic, glow)
- ✓ Compact/embedded mode
- ✓ Customizable UI panels
- ✓ Advanced color management

### ArcPanelLogoLabIntegrated
- ✓ All PS Canvas features
- ✓ Arc Panel Logo Lab (specialized for branding)
- ✓ Multi-mode editor switching
- ✓ Sync between editors
- ✓ Split-view editing
- ✓ Unified workflow

## Usage

### Standalone PhotoshopCanvas

```tsx
import { PhotoshopCanvas } from '@/components/brand/PhotoshopCanvas';

export default function Example() {
  return (
    <div className="h-screen w-screen">
      <PhotoshopCanvas />
    </div>
  );
}
```

**Route:** `/brand/photoshop-canvas`

### PhotoshopCanvasAdvanced (Embedded)

```tsx
import { PhotoshopCanvasAdvanced } from '@/components/brand/PhotoshopCanvasAdvanced';

export default function MyComponent() {
  return (
    <PhotoshopCanvasAdvanced
      mode="embedded"
      compact={true}
      onExport={(data) => console.log('Exported:', data)}
      onLayerSelect={(layerId) => console.log('Selected:', layerId)}
      initialState={{
        width: 1200,
        height: 800,
        backgroundColor: '#f0f0f0',
      }}
    />
  );
}
```

### Integrated Studio

```tsx
import { ArcPanelLogoLabIntegrated } from '@/components/brand/ArcPanelLogoLabIntegrated';

export default function Studio() {
  return (
    <div className="h-screen w-screen">
      <ArcPanelLogoLabIntegrated />
    </div>
  );
}
```

**Route:** `/brand/aurora-logo-studio`

## Integration with Arc Panel Lab

### Option 1: Add PS Canvas Tab to Arc Panel Lab

```tsx
// In ArcPanelLogoLab.tsx, near the return statement:
const [showPhotoshopMode, setShowPhotoshopMode] = useState(false);

if (showPhotoshopMode) {
  return <PhotoshopCanvas />;
}

// Add button in toolbar:
<Button onClick={() => setShowPhotoshopMode(!showPhotoshopMode)}>
  {showPhotoshopMode ? 'Back to Arc' : 'Photoshop'}
</Button>
```

### Option 2: Split View (Recommended)

```tsx
import { ArcPanelLogoLabIntegrated } from '@/components/brand/ArcPanelLogoLabIntegrated';

// Use the integrated component directly
<ArcPanelLogoLabIntegrated initialMode="split" />
```

### Option 3: Modal/Drawer

```tsx
const [psCanvasOpen, setPsCanvasOpen] = useState(false);

return (
  <>
    <ArcPanelLogoLab />
    
    {psCanvasOpen && (
      <Dialog onClose={() => setPsCanvasOpen(false)}>
        <PhotoshopCanvasAdvanced 
          compact={true}
          onExport={(data) => {
            // Sync back to Arc Panel
            syncPhotoshopToArcPanel(data);
          }}
        />
      </Dialog>
    )}
  </>
);
```

## Keyboard Shortcuts

### PhotoshopCanvas

| Key | Action |
|-----|--------|
| V | Selection tool |
| T | Text tool |
| B | Brush tool |
| H | Hand/pan tool |
| Ctrl+Z / Cmd+Z | Undo |
| Ctrl+Shift+Z / Cmd+Shift+Z | Redo |
| Ctrl+Y / Cmd+Y | Redo |
| Delete | Delete selected layer |
| Scroll | Zoom |
| Space+Drag | Pan |

## Layer System

### Layer Types

1. **Raster** - Pixel-based content
   - Can be painted with brush
   - Supports all filters
   - Has opacity, blend mode

2. **Text** - Text layers
   - Font family, size, weight
   - Letter spacing, line height
   - Editable in place

3. **Shape** - Vector shapes
   - Rectangle, circle, line, polygon
   - Fill and stroke colors
   - Gradients supported

4. **Adjustment** - Non-destructive adjustments
   - Brightness/contrast
   - Hue/saturation
   - Curves, levels
   - Affects all layers below

5. **Group** - Layer organization
   - Can contain other layers
   - Collapse/expand
   - Shared opacity/blendMode

## Advanced Features

### Blend Modes (16 total)

```
normal, multiply, screen, overlay, darken, lighten,
color-dodge, color-burn, hard-light, soft-light,
difference, exclusion, hue, saturation, color, luminosity
```

### Filters

```
blur, brightness, contrast, grayscale, hue-rotate,
invert, opacity, saturate, sepia
```

### Effects

- Drop shadow (offset, blur, color)
- Inner shadow
- Outer glow

## Data Structures

### Layer

```tsx
interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  
  // Type-specific
  imageData?: ImageData;
  text?: string;
  textStyle?: TextStyle;
  shape?: ShapeDefinition;
  fillColor?: string;
  filters?: LayerFilter[];
}
```

### DocumentState

```tsx
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
}
```

## Export/Import

### Export as PNG

```tsx
// Automatic via UI button
// Or programmatic:
const canvas = canvasRef.current;
const url = canvas.toDataURL('image/png');
const link = document.createElement('a');
link.href = url;
link.download = 'design.png';
link.click();
```

### Export Project (JSON)

```tsx
const projectData = {
  version: 1,
  canvasWidth: state.canvasWidth,
  canvasHeight: state.canvasHeight,
  layers: state.layers,
  // ... other state
};

const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Download via link...
```

### Import Project

```tsx
const file = event.target.files[0];
const text = await file.text();
const data = JSON.parse(text);
setState(data);
```

## Performance Considerations

### Optimizations

1. **Canvas rendering** - Only re-render on state changes
2. **Layer filtering** - Filter out invisible layers before render
3. **Memoized callbacks** - All handlers use useCallback
4. **History limiting** - Max 50 undo steps
5. **Image caching** - Maintain image element cache

### Large Documents

- Use layer groups to organize
- Hide layers when not needed
- Consider smart objects for complex content
- Limit to ~100 layers for smooth performance

## Customization

### Theme

Edit Tailwind colors in component CSS classes:
```tsx
// Change primary color
bg-slate-900 → bg-blue-900
border-slate-700 → border-blue-700
```

### UI Panels

Toggle visibility via state:
```tsx
const [showLayers, setShowLayers] = useState(true);
const [showProperties, setShowProperties] = useState(true);
const [showTools, setShowTools] = useState(true);
```

### Initial State

```tsx
<PhotoshopCanvasAdvanced
  initialState={{
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
    gridSize: 20,
    zoom: 1,
  }}
/>
```

## Common Workflows

### Create Presentation Slide

1. Set canvas size: 1920x1080
2. Add background shape/image
3. Add text layers for title, content
4. Use adjustment layers for color grading
5. Export as PNG

### Design System Asset

1. Create master component layer
2. Make variations via adjustment layers
3. Use export to save all variants
4. Use Smart Objects for linked instances

### Logo Iteration

1. Start in Arc Panel for quick variations
2. Switch to PS Canvas for pixel perfection
3. Use adjustment layers for different color themes
4. Sync back to Arc Panel for final export

## Troubleshooting

### Canvas not rendering

- Check browser console for errors
- Verify canvas ref is properly mounted
- Check image data is valid

### Performance issues

- Reduce layer count
- Hide unnecessary layers
- Clear history older than needed
- Use PNG instead of SVG for complex graphics

### Export issues

- Ensure layers are visible
- Check canvas size is reasonable
- Verify no WebGL errors in console

## Future Enhancements

Planned features:
- [ ] Tablet stylus support
- [ ] Custom brush presets
- [ ] AI content generation
- [ ] Real-time collaboration
- [ ] Vector path editing
- [ ] 3D transforms
- [ ] Animation timeline
- [ ] Plugin system
- [ ] Cloud sync

## Support

For issues or feature requests:
- Check GitHub issues
- Review component JSDoc comments
- Refer to TypeScript interfaces for API docs
