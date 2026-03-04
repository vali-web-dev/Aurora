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
  return {
    id,
    name,
    category,
    phase,
    sources,
    acceptance,
    description,
    auroraStatus,
    scalabilityGuardrails: ['horizontal-scaling', 'bounded-resource-usage', 'backpressure-aware'],
    reliabilityGuardrails: ['retry-with-jitter', 'idempotent-operations', 'telemetry-and-audit-trace'],
  };
}

export const auroraEditorFeatureMatrix: FeatureMatrixItem[] = [
  item('vec-frames', 'Frames & artboards', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'canva'], 'Create/nest/resize frames with preset sizes.', 'Structured canvases and output formats.', 'complete'),
  item('vec-components', 'Components & variants', 'canvas-vector', 'phase-2-vector-layout', ['figma'], 'Create reusable variants with override properties.', 'Design-system scale and consistency.', 'complete'),
  item('vec-autolayout', 'Auto layout constraints', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'canva'], 'Parent container reflows children based on rules.', 'Responsive UI composition.', 'complete'),
  item('vec-boolean', 'Boolean operations', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'photoshop'], 'Union/subtract/intersect/exclude on vector nodes.', 'Advanced shape building.', 'complete'),
  item('vec-pen', 'Pen/path editing', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'photoshop', 'photopea'], 'Bezier path create/edit with anchors and handles.', 'Precision vector drawing.', 'complete'),
  item('vec-grids', 'Rulers, guides, snapping', 'canvas-vector', 'phase-2-vector-layout', ['figma', 'photoshop', 'pixlr'], 'Enable smart guides and deterministic snapping.', 'Alignment speed and precision.', 'complete'),
  item('ras-layers', 'Layer stack with masks', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'photopea', 'pixlr'], 'Visibility, lock, grouping, clipping, masks.', 'Non-destructive composition.', 'complete'),
  item('ras-adjustments', 'Adjustment layers', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'photopea'], 'Live curves, levels, hue/sat as editable layers.', 'Pro-grade non-destructive edits.', 'complete'),
  item('ras-retouch', 'Retouching tools', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'pixlr'], 'Clone, healing, patch with pressure support.', 'Photo repair workflows.', 'complete'),
  item('ras-liquify', 'Liquify & warp', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'photopea'], 'Push/pucker/bloat warps with brush control.', 'Advanced deformation edits.', 'complete'),
  item('ras-raw', 'RAW image workflow', 'raster-photo', 'phase-3-raster-pro', ['photoshop'], 'Import and adjust RAW non-destructively.', 'Professional photography pipeline.', 'complete'),
  item('ras-filters', 'Filter gallery pipeline', 'raster-photo', 'phase-3-raster-pro', ['photoshop', 'pixlr', 'photopea'], 'GPU-accelerated effects with parameter presets.', 'Creative effects and consistency.', 'complete'),
  item('tmp-templates', 'Template marketplace', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Browse, duplicate, and customize templates.', 'Fast content creation at scale.', 'complete'),
  item('tmp-brand-kit', 'Brand kits', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Centralized logos, colors, typography lock.', 'Brand governance in creation.', 'complete'),
  item('tmp-resize', 'One-click resize', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Resize layouts into social presets with reflow.', 'Multi-channel publishing speed.', 'complete'),
  item('tmp-stock', 'Stock media integration', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express', 'pixlr'], 'Search/license/insert stock assets safely.', 'Content velocity with legal controls.', 'complete'),
  item('tmp-video', 'Simple timeline video', 'templates-brand', 'phase-4-templates-brand', ['canva', 'adobe-express'], 'Basic clips, transitions, text overlays export.', 'Motion-ready campaigns.', 'complete'),
  item('col-comments', 'Comments & mentions', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'canva'], 'Anchor comments with mention notifications.', 'Review and feedback loops.', 'complete'),
  item('col-presence', 'Live multi-user presence', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'canva'], 'Realtime cursors, edit locks and status.', 'Collaborative editing confidence.', 'complete'),
  item('col-prototype', 'Interactive prototypes', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'adobe-express'], 'Frame links with transitions and hotspots.', 'Pre-build UX testing.', 'complete'),
  item('col-versions', 'Version history & branch', 'collaboration-prototyping', 'phase-5-collaboration-handoff', ['figma', 'photoshop'], 'Branch, compare and restore revisions.', 'Safe iteration at team scale.', 'complete'),
  item('dev-inspect', 'Developer inspect mode', 'developer-handoff', 'phase-5-collaboration-handoff', ['figma'], 'Read spacing, tokens, CSS-like values.', 'Reliable design handoff.', 'complete'),
  item('dev-tokens', 'Token export sync', 'developer-handoff', 'phase-5-collaboration-handoff', ['figma', 'canva'], 'Export variables to Aurora token schemas.', 'System-wide consistency.', 'complete'),
  item('dev-assets', 'Asset export sets', 'developer-handoff', 'phase-5-collaboration-handoff', ['figma', 'photoshop'], 'Batch export by format, scale and naming.', 'Production-ready assets.', 'complete'),
  item('ai-generate', 'Generate image/layout', 'ai-automation', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express', 'photoshop'], 'Prompt-to-draft creation with style controls.', 'Fast ideation and production.', 'complete'),
  item('ai-edit', 'Generative fill/replace', 'ai-automation', 'phase-6-ai-automation-plugins', ['photoshop', 'adobe-express'], 'Selection-based replace and expand actions.', 'Contextual editing acceleration.', 'complete'),
  item('ai-copy', 'Copy rewrite assistant', 'ai-automation', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express'], 'Generate/shorten/re-tone text blocks.', 'Campaign-ready copy iterations.', 'complete'),
  item('ai-automations', 'Workflow automations', 'ai-automation', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express'], 'Trigger-based generation and exports.', 'Scalable content operations.', 'complete'),
  item('plug-sdk', 'Plugin runtime SDK', 'ai-automation', 'phase-6-ai-automation-plugins', ['figma', 'photoshop'], 'Install sandboxed plugins with grants.', 'Extensible ecosystem growth.', 'complete'),
  item('file-psd', 'PSD import/export fidelity', 'files-interoperability', 'phase-3-raster-pro', ['photoshop', 'photopea'], 'Round-trip layers and adjustments safely.', 'Migration and compatibility.', 'complete'),
  item('file-svg', 'SVG/PDF/EPS workflows', 'files-interoperability', 'phase-2-vector-layout', ['figma', 'photoshop', 'photopea'], 'Preserve vectors and typography mapping.', 'Cross-tool interchange.', 'complete'),
  item('file-web', 'Web asset optimization', 'files-interoperability', 'phase-4-templates-brand', ['canva', 'pixlr', 'adobe-express'], 'Smart presets for web/social quality-size.', 'Fast publishing with quality control.', 'complete'),
  item('file-cloud', 'Cloud docs and offline drafts', 'files-interoperability', 'phase-1-platform-core', ['figma', 'canva', 'photopea'], 'Open/edit offline then sync conflict-safe.', 'Reliable authoring anywhere.', 'complete'),
  item('gov-permissions', 'Enterprise permissions', 'governance-security', 'phase-1-platform-core', ['figma', 'canva', 'adobe-express'], 'Granular org/workspace/asset permissions.', 'Secure role-aware collaboration.', 'complete'),
  item('gov-audit', 'Audit logs', 'governance-security', 'phase-7-hardening-launch', ['figma', 'adobe-express'], 'Immutable action trail for compliance.', 'Operational governance and trust.', 'complete'),
  item('gov-content', 'Content safety checks', 'governance-security', 'phase-6-ai-automation-plugins', ['canva', 'adobe-express'], 'Detect unsafe content before publish.', 'Responsible AI and policy alignment.', 'complete'),
  item('gov-privacy', 'Privacy and data residency', 'governance-security', 'phase-7-hardening-launch', ['figma', 'adobe-express'], 'Configurable retention and residency controls.', 'Global enterprise readiness.', 'complete'),
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
