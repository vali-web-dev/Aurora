# Documentation Operations

Documentation is part of feature completion.

## Workflow
1. Plan the feature and identify docs impacted
2. Implement code with doc references
3. Update central docs in the same commit
4. Verify documentation accuracy

## Documentation Build and Runtime
- Docs content lives in `/docs`
- Runtime route: `/docs/*` via `src/app/docs/[[...path]]/page.tsx`
- Markdown API: `src/app/api/docs/[...path]/route.ts`
- Internal links use `/docs/path` (no `.md` extension)
- Verify Markdown rendering with `react-markdown`
- Check `/api/docs/aurora-book/developer/index` for raw markdown output

## Release Checklist
- Update end-user and developer indexes
- Verify all links via `/docs/*`
- Update `CHANGELOG.md`
- Update `RELEASE_NOTES_v0.1.md` or current version
- Confirm docs render (tables, code blocks, links)

## Verification Checklist
- Links resolve correctly
- New features appear in the manual and index
- Changes documented in relevant universe chapters
- Privacy and consent impacts are noted

## Central Documents
- AURORA_MANUAL.md
- AURORA_QUICK_REFERENCE.md
- AURORA_DESIGN_CULTURE.md
- AURORA_PRINCIPLES_ETHICS.md

## Feature-Specific Docs
- Add docs for complex features in src/FEATURE_DOCS
- Link from DOCUMENTATION_INDEX.md

Source: FEATURE_DEVELOPMENT_GUIDE.md
