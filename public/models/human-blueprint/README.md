# Human Blueprint 3D Model Drop-in

Place your production anatomy model here as:

- `human-blueprint.glb`

## Environment Toggle

Set these environment variables in `.env.local`:

```env
NEXT_PUBLIC_HUMAN_BLUEPRINT_MODEL_SOURCE=glb
NEXT_PUBLIC_HUMAN_BLUEPRINT_GLB_URL=/models/human-blueprint/human-blueprint.glb
```

If `NEXT_PUBLIC_HUMAN_BLUEPRINT_MODEL_SOURCE` is not `glb`, Aurora falls back to the procedural transparent model.

## Mesh Naming Contract

Region mapping contract is defined in:

- `src/lib/human-blueprint/modelManifest.ts`

Each region includes candidate mesh names based on:
- canonical `meshReference`
- kebab-case id
- snake_case id

Native GLB click picking now resolves directly from mesh names using this manifest.
For best results, set organ/system mesh names to match one of the expected aliases per region.
When GLB mode is active, the Anatomy page shows a `GLB Mesh Debug` panel with the last clicked mesh name, parent name, and resolved region id.

## Notes

- Keep scale/origin centered around torso for best camera behavior.
- Keep mesh names stable to preserve future native per-mesh picking.
- If no GLB is present (or model source is procedural), Aurora automatically uses region-overlay interaction.
