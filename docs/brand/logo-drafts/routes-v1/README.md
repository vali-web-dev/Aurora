# Aurora Logo Routes v1 (Starter Skeletons)

This folder contains starter SVG skeletons for the three Aurora logo routes:

- Route A: Arc (`aurora-route-a-arc-*.svg`)
- Route B: Core (`aurora-route-b-core-*.svg`)
- Route C: Monogram (`aurora-route-c-monogram-*.svg`)

Each route includes three variants:

- `master` (gradient)
- `mono` (single dark tone)
- `invert` (single light tone)

All files use:

- `viewBox="0 0 64 64"`
- shared geometry language (rounded joins, calm curves)
- low-opacity glow layers only as optional enhancement

Use these as base structures for visual refinement, not as final production logos.

## Export Commands

- Export all routes: `npm run logos:routes:export`
- Export only Route A: `npm run logos:routes:export:a`
- Export only Route B: `npm run logos:routes:export:b`
- Export only Route C: `npm run logos:routes:export:c`

You can also run the script directly with a route flag:

- `node --import tsx scripts/export-logo-routes-v1.ts --route a`

Optional size filter (allowed: `64,128,256,512`):

- `node --import tsx scripts/export-logo-routes-v1.ts --route b --size 64,128`
- `node --import tsx scripts/export-logo-routes-v1.ts --size=256`
