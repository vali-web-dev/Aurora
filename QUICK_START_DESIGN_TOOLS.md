# Aurora Design Tools - Quick Start Guide

## ⚡ 30-Second Setup

```bash
npm run dev
```

Dev now runs Aurora’s websocket-enabled runtime by default (internal realtime connectivity is active without extra flags).

Quick verify (optional): open `http://localhost:3000/api/ws` and confirm status is `ok`.

Then open these in your browser:
- **Enhanced Editor**: http://localhost:3000/brand/photoshop-enhanced
- **Studio Pro**: http://localhost:3000/brand/studio-pro

## 🎨 What You Get

### PhotoshopCanvasEnhanced
A professional design editor with:
- **20+ editing tools** (select, text, brush, shapes, etc.)
- **16 blend modes** for advanced compositing
- **9+ adjustable filters** (blur, brightness, contrast, etc.)
- **Full layer management** (create, delete, duplicate, groups)
- **Grid & guides system** for precise alignment
- **4 built-in presets** (Default, Title Text, Vintage, Neon)
- **Alignment tools** (left, center, right)
- **Keyboard shortcuts** for power users
- **PNG export** with automatic naming

### ArcPanelStudioPro
An integrated studio combining All tools with:
- **5 editor modes** (Arc Panel, PS Basic, Pro, Split-H, Split-V)
- **Tabbed properties panel** (Properties, Layers, Colors, Shortcuts)
- **Export dialog** (format, quality, size selection)
- **Save & sync workflows**
- **Status feedback** for all actions
- **Professional UI** with modern design

### Aurora UI Enhanced Library
A collection of **14 reusable components**:
- Tooltips, collapsible panels, sliders
- Color inputs, text inputs, selects
- Icon button groups, grids, tabs
- Status badges, keyboard shortcut displays

## 🎯 5-Minute Tutorial

### 1. Basic Design (3 min)
1. Open PhotoshopCanvasEnhanced
2. Click **T** (or Text tool from toolbar)
3. Type text on canvas
4. Right panel opens:
   - Change **Name** to something meaningful
   - Adjust **Font Size** (24 default)
   - Adjust **Opacity** (100% for solid)
5. See it update on canvas in real-time

### 2. Styling (2 min)
1. Select your text layer (if not selected)
2. Scroll right panel down to **Fill** section
3. Click color picker, choose a vibrant color
4. Click **Stroke** section
5. Set stroke width to 2px, pick a contrasting color
6. See stroke appear around text

### 3. Filters (1 min)
1. Layer still selected
2. Click **Filters** to expand
3. Drag "Blur" slider right (5-10px)
4. See blur applied to text
5. Try "Hue-rotate" slider
6. Click **Export**, save as PNG

Done! You've created and exported a styled design. 🎉

## 🎮 Interactive Playground

### Feature Quick Test
```
Tool Selection (T key)       → See text tool activate
Layer Addition (+)           → Create new layer
Visibility Toggle (👁)       → Hide/show layers
Opacity Slider              → Make layer semi-transparent
Blend Mode Dropdown         → Try "multiply" or "screen"
Filter Sliders              → Apply multiple filters
Zoom Slider                 → Zoom in/out smooth
Alignment Buttons           → Auto-align selected layer
Keyboard Shortcut (Ctrl+Z)  → Undo your changes
```

## 🔥 Pro Tips

### Tip 1: Keyboard Mastery
Master these 5 shortcuts to 10x speed:
- **V** = Selection (most used)
- **T** = Text Tool
- **B** = Brush Tool
- **Ctrl+Z** = Undo
- **Delete** = Remove selected layer

### Tip 2: Layer Organization
1. Name your layers clearly (Properties > Name)
2. Lock layers you won't be editing (🔒 button)
3. Hide helper layers (👁 button)
4. Group related layers (Ctrl+G)

### Tip 3: Precision Placement
1. Use **Guides** button to add H/V guides
2. Use **Alignment Tools** to snap to center
3. Adjust **X/Y position** in Properties
4. Fine-tune with **arrow keys**

### Tip 4: Multi-Filter Stacking
1. Open **Filters** section
2. Set Blur to 5px
3. Set Contrast to 120% (below Blur)
4. Set Hue-rotate to -45°
5. See all 3 effects combine on canvas

### Tip 5: Batch Presets
1. Adjust colors, stroke, effects perfectly
2. Note down settings
3. Use **Presets** section to apply same settings to other layers
4. Consistency in seconds

## 📍 UI Layout Quick Tour

```
┌─────────────────────────────────────────────────────────┐
│ Top: Toolbar (Tools, Grid, Rulers, Export)              │
├────────────┬──────────────────────────────┬──────────────┤
│ Left Panel │                              │ Right Panel  │
│ • Colors   │  CENTER CANVAS               │ • Layers     │
│ • Brushes  │  (Your design appears here)  │ • Properties │
│            │                              │ • Fill       │
│            │                              │ • Stroke     │
│            │                              │ • Filters    │
│            │                              │ • Alignment  │
│            │                              │ • Presets    │
└────────────┴──────────────────────────────┴──────────────┘
```

## 🚀 Studio Pro Quick Features

### Mode Switching (Top Toolbar)
- 📐 = Arc Panel Logo Lab
- 🎨 = Photoshop Basic
- 🖼️ = Photoshop Pro  
- ↔️ = Split Horizontal
- ⇅ = Split Vertical

### Action Buttons
- 💾 = Save project to browser
- 🔄 = Sync changes between editors
- 📥 = Export with format dialog
- ⊡ = Toggle right panel visibility

### Tab Switcher (Right Panel)
- **Properties** ⚙️ = Canvas controls + presets
- **Layers** 📑 = Layer list
- **Colors** 🎨 = Color palette (click to select)
- **Shortcuts** ⌨️ = All keyboard shortcuts

## ❓ Common Questions

### Q: Which tool should I use?
**A:** 
- Start with **Selection Tool (V)** to move things
- Use **Text Tool (T)** for text
- Use **Brush (B)** for drawing
- Try different tools - they're all fun!

### Q: How do I undo?
**A:** Press **Ctrl+Z** (or Cmd+Z on Mac). Up to 50 undo levels available.

### Q: How do I export my design?
**A:** 
1. Click **Export** button
2. File automatically downloads as PNG
3. In Studio Pro, click Export for format options

### Q: Can I save my work?
**A:** Yes! 
- Studio Pro: Click 💾 button (saves to browser storage)
- Regular editor: No persistent save yet

### Q: How do I make layers transparent?
**A:**
1. Select the layer
2. In Properties, adjust **Opacity** slider (0-100%)
3. Done!

### Q: What are blend modes?
**A:** They control how overlapping layers interact:
- **Multiply** = Darker overlays
- **Screen** = Lighter overlays
- **Overlay** = Medium blend
- Try them all to see the effect!

## 🎨 Design Workflow Examples

### Create a Logo
1. Open **PhotoshopCanvasEnhanced**
2. Add Circle shape (U key, then draw)
3. Add Text inside (T key)
4. Adjust colors via Fill panel
5. Add stroke via Stroke panel
6. Export as PNG

### Create a Banner
1. Open **PhotoshopCanvasEnhanced**
2. Add Rectangle background (Shift+U key)
3. Set to blue via Fill panel
4. Add Text on top (T key)
5. Apply Blur filter to background
6. Export for web

### Compare Designs
1. Open **ArcPanelStudioPro**
2. Select **Split Vertical** mode (⇅)
3. Left shows Arc Panel, right shows Photoshop
4. Make changes in left
5. See comparison in real-time
6. Pick best version and export

## 📊 Feature Comparison Table

| Feature | Photoshop Enhanced | Studio Pro |
|---------|------------------|-----------|
| Tools | 20+ | Full access |
| Filters | 9+ | Full access |
| Blend Modes | 16 | Full access |
| Export | PNG | PNG, SVG, PDF, JPG |
| Modes | 1 | 5 |
| Split View | No | Yes |
| Presets | Yes | Yes |
| Save | No | Yes |
| Keyboard Help | No | Built-in |

## 🎓 Learning Resources

**In This Package:**
- [ENHANCEMENT_SUMMARY.md](ENHANCEMENT_SUMMARY.md) - What was added
- [AURORA_DESIGN_ENHANCED_ACCESS_GUIDE.md](AURORA_DESIGN_ENHANCED_ACCESS_GUIDE.md) - Detailed testing guide
- [docs/AURORA_DESIGN_TOOLS_ENHANCED.md](docs/AURORA_DESIGN_TOOLS_ENHANCED.md) - Complete feature reference

## ⚡ Keyboard Shortcut Cheat Sheet

```
TOOLS                   EDITING
V = Selection          Ctrl+Z = Undo
T = Text               Ctrl+Y = Redo
B = Brush              Delete = Remove layer
H = Hand (pan)         Tab = Toggle panels (Studio Pro)
Z = Zoom               Ctrl+S = Save (Studio Pro)
                       Ctrl+E = Export (Studio Pro)

SHAPES
U = Ellipse
Shift+U = Rectangle
L = Line
```

## 🚀 Next Steps

1. **Start Now**: Open the enhanced editor
2. **Play Around**: Try all tools and filters
3. **Read Docs**: Full reference in AURORA_DESIGN_TOOLS_ENHANCED.md
4. **Explore Advanced**: Try split view and mode switching in Studio Pro
5. **Create**: Make your first design!

---

## 🎉 You're Ready!

Everything is set up and working. Just:
```bash
npm run dev
# Then visit the URLs in your browser
```

Have fun creating! 🎨✨

---

*Aurora Design Tools v2.0 - Quick Start | Last Updated: February 2026*
