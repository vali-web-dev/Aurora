import { EditorAction, EditorNode, EditorState, HistoryState } from './types';

function clampZoom(value: number) {
  return Math.min(3, Math.max(0.2, value));
}

function snap(value: number, gridSize: number) {
  return Math.round(value / gridSize) * gridSize;
}

function applyGridSnapToNode(node: EditorNode, gridSize: number): EditorNode {
  return {
    ...node,
    x: snap(node.x, gridSize),
    y: snap(node.y, gridSize),
    width: Math.max(20, snap(node.width, gridSize)),
    height: Math.max(20, snap(node.height, gridSize)),
  };
}

function cloneNodeForDuplicate(node: EditorNode): EditorNode {
  return {
    ...node,
    id: createId(node.kind),
    name: `${node.name} Copy`,
    x: node.x + 24,
    y: node.y + 24,
  };
}

function reorderNodeByDelta(nodes: EditorNode[], id: string, delta: number): EditorNode[] {
  const index = nodes.findIndex((node) => node.id === id);
  if (index < 0) return nodes;

  const nextIndex = Math.max(0, Math.min(nodes.length - 1, index + delta));
  if (nextIndex === index) return nodes;

  const nextNodes = [...nodes];
  const [moved] = nextNodes.splice(index, 1);
  nextNodes.splice(nextIndex, 0, moved);
  return nextNodes;
}

function findNode(nodes: EditorNode[], id: string) {
  return nodes.find((node) => node.id === id) ?? null;
}

function collectDescendantIds(nodes: EditorNode[], rootId: string): string[] {
  const descendants: string[] = [];
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;

    const children = nodes.filter((node) => node.parentId === currentId);
    for (const child of children) {
      descendants.push(child.id);
      queue.push(child.id);
    }
  }

  return descendants;
}

function applyConstraintsToNode(nodes: EditorNode[], childId: string): EditorNode[] {
  const child = findNode(nodes, childId);
  if (!child || !child.parentId) return nodes;

  const parent = findNode(nodes, child.parentId);
  if (!parent) return nodes;

  const padding = parent.layoutPadding ?? 0;
  const availableWidth = Math.max(20, parent.width - padding * 2);
  const availableHeight = Math.max(20, parent.height - padding * 2);

  const nextPatch: Partial<EditorNode> = {};

  const modeX = child.constraintX ?? 'start';
  if (modeX === 'start') nextPatch.x = parent.x + padding;
  if (modeX === 'center') nextPatch.x = parent.x + (parent.width - child.width) / 2;
  if (modeX === 'end') nextPatch.x = parent.x + parent.width - padding - child.width;
  if (modeX === 'stretch') {
    nextPatch.x = parent.x + padding;
    nextPatch.width = availableWidth;
  }

  const modeY = child.constraintY ?? 'start';
  if (modeY === 'start') nextPatch.y = parent.y + padding;
  if (modeY === 'center') nextPatch.y = parent.y + (parent.height - child.height) / 2;
  if (modeY === 'end') nextPatch.y = parent.y + parent.height - padding - child.height;
  if (modeY === 'stretch') {
    nextPatch.y = parent.y + padding;
    nextPatch.height = availableHeight;
  }

  return nodes.map((node) => (node.id === child.id ? { ...node, ...nextPatch } : node));
}

function applyAutoLayoutToNodes(nodes: EditorNode[], frameId: string): EditorNode[] {
  const frame = findNode(nodes, frameId);
  if (!frame || frame.kind !== 'frame') return nodes;

  const layoutMode = frame.layoutMode ?? 'none';
  if (layoutMode === 'none') return nodes;

  const padding = frame.layoutPadding ?? 16;
  const gap = frame.layoutGap ?? 12;
  const align = frame.layoutAlign ?? 'start';

  const children = nodes.filter((node) => node.parentId === frame.id);
  if (children.length === 0) return nodes;

  let cursor = padding;
  const childPatches = new Map<string, Partial<EditorNode>>();

  for (const child of children) {
    const patch: Partial<EditorNode> = {};

    if (layoutMode === 'row') {
      patch.x = frame.x + cursor;

      if (align === 'start') {
        patch.y = frame.y + padding;
      } else if (align === 'center') {
        patch.y = frame.y + (frame.height - child.height) / 2;
      } else if (align === 'end') {
        patch.y = frame.y + frame.height - padding - child.height;
      } else {
        patch.y = frame.y + padding;
        patch.height = Math.max(20, frame.height - padding * 2);
      }

      cursor += child.width + gap;
    }

    if (layoutMode === 'column') {
      patch.y = frame.y + cursor;

      if (align === 'start') {
        patch.x = frame.x + padding;
      } else if (align === 'center') {
        patch.x = frame.x + (frame.width - child.width) / 2;
      } else if (align === 'end') {
        patch.x = frame.x + frame.width - padding - child.width;
      } else {
        patch.x = frame.x + padding;
        patch.width = Math.max(20, frame.width - padding * 2);
      }

      cursor += child.height + gap;
    }

    childPatches.set(child.id, patch);
  }

  return nodes.map((node) => {
    const patch = childPatches.get(node.id);
    if (!patch) return node;
    return { ...node, ...patch };
  });
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getGlobalNodeBounds(node: EditorNode, nodes: EditorNode[]): { x: number; y: number; width: number; height: number } {
  let globalX = node.x;
  let globalY = node.y;
  let currentParentId = node.parentId;

  while (currentParentId) {
    const parent = findNode(nodes, currentParentId);
    if (!parent) break;
    globalX += parent.x;
    globalY += parent.y;
    currentParentId = parent.parentId;
  }

  return {
    x: globalX,
    y: globalY,
    width: node.width,
    height: node.height,
  };
}

export function createInitialEditorState(): EditorState {
  const frameId = createId('frame');
  const titleId = createId('text');

  const nodes: EditorNode[] = [
    {
      id: frameId,
      kind: 'frame',
      name: 'Hero Frame',
      x: 120,
      y: 80,
      width: 720,
      height: 460,
      rotation: 0,
      opacity: 1,
      fill: '#f8fafc',
      layoutMode: 'column',
      layoutGap: 16,
      layoutPadding: 24,
      layoutAlign: 'start',
      visible: true,
      locked: false,
    },
    {
      id: titleId,
      kind: 'text',
      name: 'Headline',
      x: 200,
      y: 180,
      width: 400,
      height: 80,
      rotation: 0,
      opacity: 1,
      fill: '#0f172a',
      text: 'Aurora Editor',
      fontSize: 42,
      parentId: frameId,
      constraintX: 'start',
      constraintY: 'start',
      visible: true,
      locked: false,
    },
  ];

  return {
    nodes,
    selectedId: titleId,
    zoom: 1,
    canvas: {
      width: 1600,
      height: 900,
      background: '#e2e8f0',
    },
    showGrid: true,
    snapToGrid: true,
    gridSize: 16,
  };
}

export function applyEditorAction(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'add-node':
      return {
        ...state,
        nodes: [...state.nodes, state.snapToGrid ? applyGridSnapToNode(action.node, state.gridSize) : action.node],
        selectedId: action.node.id,
      };

    case 'duplicate-node': {
      const source = state.nodes.find((node) => node.id === action.id);
      if (!source) return state;
      const duplicate = cloneNodeForDuplicate(source);
      return {
        ...state,
        nodes: [...state.nodes, state.snapToGrid ? applyGridSnapToNode(duplicate, state.gridSize) : duplicate],
        selectedId: duplicate.id,
      };
    }

    case 'bring-forward':
      return {
        ...state,
        nodes: reorderNodeByDelta(state.nodes, action.id, 1),
      };

    case 'send-backward':
      return {
        ...state,
        nodes: reorderNodeByDelta(state.nodes, action.id, -1),
      };

    case 'update-node':
      return {
        ...state,
        nodes: state.nodes.map((node) => {
          if (node.id !== action.id) return node;
          const nextNode = { ...node, ...action.patch };
          return state.snapToGrid ? applyGridSnapToNode(nextNode, state.gridSize) : nextNode;
        }),
      };

    case 'set-parent': {
      const node = findNode(state.nodes, action.id);
      if (!node) return state;
      const parentId = action.parentId;

      if (!parentId) {
        return {
          ...state,
          nodes: state.nodes.map((current) =>
            current.id === action.id
              ? {
                  ...current,
                  parentId: undefined,
                }
              : current
          ),
        };
      }

      const parent = findNode(state.nodes, parentId);
      if (!parent || parent.kind !== 'frame') return state;
      if (parentId === action.id) return state;

      const descendantIds = new Set(collectDescendantIds(state.nodes, action.id));
      if (descendantIds.has(parentId)) return state;

      const nextNodes = state.nodes.map((current) =>
        current.id === action.id
          ? {
              ...current,
              parentId: parentId ?? undefined,
            }
          : current
      );

      return {
        ...state,
        nodes: applyAutoLayoutToNodes(nextNodes, parentId),
      };
    }

    case 'set-layout': {
      const frame = findNode(state.nodes, action.id);
      if (!frame || frame.kind !== 'frame') return state;

      const nextNodes = state.nodes.map((current) =>
        current.id === action.id
          ? {
              ...current,
              ...action.patch,
            }
          : current
      );

      return {
        ...state,
        nodes: applyAutoLayoutToNodes(nextNodes, action.id),
      };
    }

    case 'set-constraints':
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.id
            ? {
                ...node,
                constraintX: action.constraintX,
                constraintY: action.constraintY,
              }
            : node
        ),
      };

    case 'apply-auto-layout': {
      return {
        ...state,
        nodes: applyAutoLayoutToNodes(state.nodes, action.id),
      };
    }

    case 'apply-constraints':
      return {
        ...state,
        nodes: applyConstraintsToNode(state.nodes, action.id),
      };

    case 'remove-node': {
      const idsToRemove = new Set([action.id, ...collectDescendantIds(state.nodes, action.id)]);
      const nextNodes = state.nodes.filter((node) => !idsToRemove.has(node.id));
      const nextSelected = state.selectedId && idsToRemove.has(state.selectedId) ? null : state.selectedId;
      return {
        ...state,
        nodes: nextNodes,
        selectedId: nextSelected,
      };
    }

    case 'select-node':
      return {
        ...state,
        selectedId: action.id,
      };

    case 'align-node': {
      const node = state.nodes.find((current) => current.id === action.id);
      if (!node) return state;

      const alignedPatch: Partial<EditorNode> = {};
      if (action.axis === 'x') {
        if (action.mode === 'start') alignedPatch.x = 0;
        if (action.mode === 'center') alignedPatch.x = (state.canvas.width - node.width) / 2;
        if (action.mode === 'end') alignedPatch.x = state.canvas.width - node.width;
      }

      if (action.axis === 'y') {
        if (action.mode === 'start') alignedPatch.y = 0;
        if (action.mode === 'center') alignedPatch.y = (state.canvas.height - node.height) / 2;
        if (action.mode === 'end') alignedPatch.y = state.canvas.height - node.height;
      }

      return {
        ...state,
        nodes: state.nodes.map((current) => {
          if (current.id !== action.id) return current;
          const nextNode = { ...current, ...alignedPatch };
          return state.snapToGrid ? applyGridSnapToNode(nextNode, state.gridSize) : nextNode;
        }),
      };
    }

    case 'convert-component': {
      const node = state.nodes.find((current) => current.id === action.id);
      if (!node) return state;
      const componentId = node.componentId ?? createId('component');

      return {
        ...state,
        nodes: state.nodes.map((current) =>
          current.id === action.id
            ? {
                ...current,
                isComponentMaster: true,
                componentId,
                instanceOf: undefined,
                name: current.name.includes('Component') ? current.name : `${current.name} Component`,
              }
            : current
        ),
      };
    }

    case 'create-instance': {
      const source = state.nodes.find((current) => current.id === action.id);
      if (!source || !source.componentId) return state;

      const instance = {
        ...cloneNodeForDuplicate(source),
        isComponentMaster: false,
        instanceOf: source.componentId,
        componentId: undefined,
        name: `${source.name} Instance`,
      } satisfies EditorNode;

      return {
        ...state,
        nodes: [...state.nodes, state.snapToGrid ? applyGridSnapToNode(instance, state.gridSize) : instance],
        selectedId: instance.id,
      };
    }

    case 'set-zoom':
      return {
        ...state,
        zoom: clampZoom(action.zoom),
      };

    case 'toggle-grid':
      return {
        ...state,
        showGrid: !state.showGrid,
      };

    case 'toggle-snap':
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      };

    case 'set-grid-size':
      return {
        ...state,
        gridSize: Math.max(4, Math.min(64, action.gridSize)),
      };

    case 'set-canvas':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          ...action.patch,
        },
      };

    default:
      return state;
  }
}

export function createHistory<T>(initial: T): HistoryState<T> {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function commit<T>(history: HistoryState<T>, next: T): HistoryState<T> {
  return {
    past: [...history.past, history.present],
    present: next,
    future: [],
  };
}

export function undo<T>(history: HistoryState<T>): HistoryState<T> {
  const previous = history.past[history.past.length - 1];

  if (!previous) {
    return history;
  }

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo<T>(history: HistoryState<T>): HistoryState<T> {
  const [next, ...remaining] = history.future;

  if (!next) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: next,
    future: remaining,
  };
}
