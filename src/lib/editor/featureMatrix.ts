import { DeliveryPhase, FeatureMatrixItem, FeatureCategory } from './types';

const byCategoryOrder: FeatureCategory[] = [
  'canvas-vector',
  'raster-photo',
  'templates-brand',
  'collaboration-prototyping',
  'developer-handoff',
  'ai-automation',
  'files-interoperability',
  'governance-security',
];

function item(
  id: string,
  name: string,
  category: FeatureCategory,
  phase: DeliveryPhase,
  sources: FeatureMatrixItem['sources'],
  acceptance: string,
  description: string,
  auroraStatus: FeatureMatrixItem['auroraStatus'] = 'not-started'
): FeatureMatrixItem {
  return { id, name, category, phase, sources, acceptance, description, auroraStatus };
}

export const auroraEditorFeatureMatrix: FeatureMatrixItem[] = [
  item('vec-frames', 'Frames & artboards', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'canva'], 'Create/nest/resize frames with preset sizes.', 'Structured canvases and output formats.', 'complete'),
  item('vec-components', 'Components & variants', 'canvas-vector', 'phase-2-vector-layout', ['figma'], 'Create reusable variants with override properties.', 'Design-system scale and consistency.', 'in-progress'),
  item('vec-autolayout', 'Auto layout constraints', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'canva'], 'Parent container reflows children based on rules.', 'Responsive UI composition.', 'in-progress'),
  item('vec-boolean', 'Boolean operations', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'photoshop'], 'Union/subtract/intersect/exclude on vector nodes.', 'Advanced shape building.'),
  item('vec-pen', 'Pen/path editing', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'photoshop', 'photopea'], 'Bezier path create/edit with anchors and handles.', 'Precision vector drawing.'),
  item('vec-grids', 'Rulers, guides, snapping', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'photoshop', 'pixlr'], 'Enable smart guides and deterministic snapping.', 'Alignment speed and precision.', 'complete'),
  item('ras-layers', 'Layer stack with masks', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'photopea', 'pixlr'], 'Visibility, lock, grouping, clipping, masks.', 'Non-destructive composition.'),
  item('ras-adjustments', 'Adjustment layers', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'photopea'], 'Live curves, levels, hue/sat as editable layers.', 'Pro-grade non-destructive edits.'),
  item('ras-retouch', 'Retouching tools', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'pixlr'], 'Clone, healing, patch with pressure support.', 'Photo repair workflows.'),
  item('ras-liquify', 'Liquify & warp', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'photopea'], 'Push/pucker/bloat warps with brush control.', 'Advanced deformation edits.'),
  item('ras-raw', 'RAW image workflow', 'raster-photo', 'phase-3-raster-pro', ['photoshop'], 'Import and adjust RAW non-destructively.', 'Professional photography pipeline.'),
  item('ras-filters', 'Filter gallery pipeline', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'pixlr', 'photopea'], 'GPU-accelerated effects with parameter presets.', 'Creative effects and consistency.'),
  item('tmp-templates', 'Template marketplace', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Browse, duplicate, and customize templates.', 'Fast content creation at scale.'),
  item('tmp-brand-kit', 'Brand kits', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Centralized logos, colors, typography lock.', 'Brand governance in creation.'),
  item('tmp-resize', 'One-click resize', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Resize layouts into social presets with reflow.', 'Multi-channel publishing speed.'),
  item('tmp-stock', 'Stock media integration', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express', 'pixlr'], 'Search/license/insert stock assets safely.', 'Content velocity with legal controls.'),
  item('tmp-video', 'Simple timeline video', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Basic clips, transitions, text overlays export.', 'Motion-ready campaigns.'),
  item('col-comments', 'Comments & mentions', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'canva'], 'Anchor comments with mention notifications.', 'Review and feedback loops.'),
  item('col-presence', 'Live multi-user presence', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'canva'], 'Realtime cursors, edit locks and status.', 'Collaborative editing confidence.'),
  item('col-prototype', 'Interactive prototypes', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'adobe-express'], 'Frame links with transitions and hotspots.', 'Pre-build UX testing.'),
  item('col-versions', 'Version history & branch', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'photoshop'], 'Branch, compare and restore revisions.', 'Safe iteration at team scale.', 'in-progress'),
  item('dev-inspect', 'Developer inspect mode', 'developer-handoff', 'phase-5-collaboration-handoff', ['figma'], 'Read spacing, tokens, CSS-like values.', 'Reliable design handoff.', 'in-progress'),
  item('dev-tokens', 'Token export sync', 'developer-handoff', 'phase-5-collaboration-handoff', ['figma', 'canva'], 'Export variables to Aurora token schemas.', 'System-wide consistency.'),
  item('dev-assets', 'Asset export sets', 'developer-handoff', 'phase-5-collaboration-handoff', ['figma', 'photoshop'], 'Batch export by format, scale and naming.', 'Production-ready assets.', 'complete'),
  item('ai-generate', 'Generate image/layout', 'ai-automation', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express', 'photoshop'], 'Prompt-to-draft creation with style controls.', 'Fast ideation and production.'),
  item('ai-edit', 'Generative fill/replace', 'ai-automation', 'phase-6-ai-automation-plugins', ['photoshop', 'adobe-express'], 'Selection-based replace and expand actions.', 'Contextual editing acceleration.'),
  item('ai-copy', 'Copy rewrite assistant', 'ai-automation', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express'], 'Generate/shorten/re-tone text blocks.', 'Campaign-ready copy iterations.'),
  item('ai-automations', 'Workflow automations', 'ai-automation', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express'], 'Trigger-based generation and exports.', 'Scalable content operations.'),
  item('plug-sdk', 'Plugin runtime SDK', 'ai-automation', 'phase-6-ai-automation-plugins', ['figma', 'photoshop'], 'Install sandboxed plugins with grants.', 'Extensible ecosystem growth.'),
  item('file-psd', 'PSD import/export fidelity', 'files-interoperability', 'phase-3-raster-pro', ['photoshop', 'photopea'], 'Round-trip layers and adjustments safely.', 'Migration and compatibility.', 'in-progress'),
  item('file-svg', 'SVG/PDF/EPS workflows', 'files-interoperability', 'phase-2-vector-layout', ['figma', 'photoshop', 'photopea'], 'Preserve vectors and typography mapping.', 'Cross-tool interchange.', 'in-progress'),
  item('file-web', 'Web asset optimization', 'files-interoperability', 'phase-4-templates-brand', ['canva', 'pixlr', 'adobe-express'], 'Smart presets for web/social quality-size.', 'Fast publishing with quality control.', 'in-progress'),
  item('file-cloud', 'Cloud docs and offline drafts', 'files-interoperability', 'phase-1-platform-core', ['figma', 'canva', 'photopea'], 'Open/edit offline then sync conflict-safe.', 'Reliable authoring anywhere.', 'complete'),
  item('gov-permissions', 'Enterprise permissions', 'governance-security', 'phase-1-platform-core', ['figma', 'canva', 'adobe-express'], 'Granular org/workspace/asset permissions.', 'Secure role-aware collaboration.'),
  item('gov-audit', 'Audit logs', 'governance-security', 'phase-7-hardening-launch', ['figma', 'adobe-express'], 'Immutable action trail for compliance.', 'Operational governance and trust.'),
  item('gov-content', 'Content safety checks', 'governance-security', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express'], 'Detect unsafe content before publish.', 'Responsible AI and policy alignment.'),
  item('gov-privacy', 'Privacy and data residency', 'governance-security', 'phase-7-hardening-launch', ['figma', 'adobe-express'], 'Configurable retention and residency controls.', 'Global enterprise readiness.'),
];

export const featureCategoryLabels: Record<FeatureCategory, string> = {
  'canvas-vector': 'Canvas & Vector',
  'raster-photo': 'Raster & Photo',
  'templates-brand': 'Templates & Brand',
  'collaboration-prototyping': 'Collaboration & Prototyping',
  'developer-handoff': 'Developer Handoff',
  'ai-automation': 'AI, Automation & Plugins',
  'files-interoperability': 'Files & Interoperability',
  'governance-security': 'Governance & Security',
};

export function getFeatureMatrixSummary(items: FeatureMatrixItem[]) {
  const total = items.length;
  const completed = items.filter((item) => item.auroraStatus === 'complete').length;
  const inProgress = items.filter((item) => item.auroraStatus === 'in-progress').length;
  const notStarted = items.filter((item) => item.auroraStatus === 'not-started').length;

  const byPhase = items.reduce<Record<DeliveryPhase, number>>((acc, item) => {
    acc[item.phase] = (acc[item.phase] ?? 0) + 1;
    return acc;
  }, {
    'phase-0-foundation': 0,
    'phase-1-platform-core': 0,
    'phase-2-vector-layout': 0,
    'phase-3-raster-pro': 0,
    'phase-4-templates-brand': 0,
    'phase-5-collaboration-handoff': 0,
    'phase-6-ai-automation-plugins': 0,
    'phase-7-hardening-launch': 0,
  });

  const byCategory = byCategoryOrder.map((category) => ({
    category,
    label: featureCategoryLabels[category],
    count: items.filter((item) => item.category === category).length,
  }));

  return { total, completed, inProgress, notStarted, byPhase, byCategory };
}
