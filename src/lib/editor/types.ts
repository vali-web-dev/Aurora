export type SourceTool = 'figma' | 'canva' | 'photopea' | 'photoshop' | 'adobe-express' | 'pixlr';

export type ParityStatus = 'not-started' | 'in-progress' | 'complete';

export type DeliveryPhase =
  | 'phase-0-foundation'
  | 'phase-1-platform-core'
  | 'phase-2-vector-layout'
  | 'phase-3-raster-pro'
  | 'phase-4-templates-brand'
  | 'phase-5-collaboration-handoff'
  | 'phase-6-ai-automation-plugins'
  | 'phase-7-hardening-launch';

export type FeatureCategory =
  | 'canvas-vector'
  | 'raster-photo'
  | 'templates-brand'
  | 'collaboration-prototyping'
  | 'developer-handoff'
  | 'ai-automation'
  | 'files-interoperability'
  | 'governance-security';

export interface FeatureMatrixItem {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  sources: SourceTool[];
  auroraStatus: ParityStatus;
  phase: DeliveryPhase;
  acceptance: string;
}

export type EditorNodeKind = 'frame' | 'rect' | 'ellipse' | 'text' | 'image';
export type LayoutMode = 'none' | 'row' | 'column';
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch';
export type ConstraintMode = 'start' | 'center' | 'end' | 'stretch';

export interface EditorNode {
  id: string;
  kind: EditorNodeKind;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fill: string;
  text?: string;
  fontSize?: number;
  parentId?: string;
  isComponentMaster?: boolean;
  componentId?: string;
  instanceOf?: string;
  layoutMode?: LayoutMode;
  layoutGap?: number;
  layoutPadding?: number;
  layoutAlign?: LayoutAlign;
  constraintX?: ConstraintMode;
  constraintY?: ConstraintMode;
  visible: boolean;
  locked: boolean;
}

export interface EditorState {
  nodes: EditorNode[];
  selectedId: string | null;
  zoom: number;
  canvas: {
    width: number;
    height: number;
    background: string;
  };
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export type EditorAction =
  | { type: 'add-node'; node: EditorNode }
  | { type: 'update-node'; id: string; patch: Partial<EditorNode> }
  | { type: 'duplicate-node'; id: string }
  | { type: 'bring-forward'; id: string }
  | { type: 'send-backward'; id: string }
  | { type: 'remove-node'; id: string }
  | { type: 'select-node'; id: string | null }
  | { type: 'set-parent'; id: string; parentId: string | null }
  | { type: 'set-layout'; id: string; patch: Pick<EditorNode, 'layoutMode' | 'layoutGap' | 'layoutPadding' | 'layoutAlign'> }
  | { type: 'set-constraints'; id: string; constraintX: ConstraintMode; constraintY: ConstraintMode }
  | { type: 'apply-auto-layout'; id: string }
  | { type: 'apply-constraints'; id: string }
  | { type: 'align-node'; id: string; axis: 'x' | 'y'; mode: 'start' | 'center' | 'end' }
  | { type: 'convert-component'; id: string }
  | { type: 'create-instance'; id: string }
  | { type: 'set-zoom'; zoom: number }
  | { type: 'toggle-grid' }
  | { type: 'toggle-snap' }
  | { type: 'set-grid-size'; gridSize: number }
  | { type: 'set-canvas'; patch: Partial<EditorState['canvas']> };

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}
