import { ANATOMY_MESH_REGIONS } from '@/lib/human-blueprint/contentLibrary';

export const HUMAN_BLUEPRINT_GLB_DEFAULT_PATH = '/models/human-blueprint/human-blueprint.glb';

export interface HumanBlueprintRegionBinding {
  regionId: string;
  expectedMeshNames: string[];
}

export const HUMAN_BLUEPRINT_REGION_BINDINGS: HumanBlueprintRegionBinding[] = ANATOMY_MESH_REGIONS.map((region) => ({
  regionId: region.id,
  expectedMeshNames: [
    region.meshReference,
    region.id,
    region.id.split('-').join('_'),
  ],
}));

export const HUMAN_BLUEPRINT_MODEL_MANIFEST = {
  source: HUMAN_BLUEPRINT_GLB_DEFAULT_PATH,
  regionBindings: HUMAN_BLUEPRINT_REGION_BINDINGS,
};

export function normalizeMeshName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s|]+/g, '_').replace(/-+/g, '_');
}

const REGION_BY_MESH_NAME = HUMAN_BLUEPRINT_REGION_BINDINGS.reduce<Record<string, string>>((acc, binding) => {
  binding.expectedMeshNames.forEach((entry) => {
    const normalized = normalizeMeshName(entry);
    if (!acc[normalized]) acc[normalized] = binding.regionId;
  });
  return acc;
}, {});

export function resolveRegionIdFromMeshName(rawName: string | null | undefined): string | null {
  if (!rawName) return null;
  return REGION_BY_MESH_NAME[normalizeMeshName(rawName)] ?? null;
}
