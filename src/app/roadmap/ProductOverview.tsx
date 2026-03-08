import Link from 'next/link';
import { Badge } from '@/components/aurora/Badge';
import { Card, CardDescription, CardTitle } from '@/components/aurora/Card';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { Button } from '@/components/ui/Button';

type MilestoneState = 'completed' | 'in-progress' | 'next';

interface Milestone {
    label: string;
    state: MilestoneState;
}

interface RoadmapPhase {
    phase: string;
    title: string;
    window: string;
    objective: string;
    milestones: Milestone[];
}

const roadmap: RoadmapPhase[] = [
    {
        phase: 'Phase 1',
        title: 'Core Infrastructure',
        window: 'Weeks 1-3',
        objective: 'Move from mock-only UI into a stable runtime with persistent backend primitives.',
        milestones: [
            { label: 'Postgres + Drizzle baseline and migration flow', state: 'in-progress' },
            { label: 'Environment and secret setup for local + deploy', state: 'completed' },
            { label: 'API validation and route normalization across universes', state: 'completed' },
        ],
    },
    {
        phase: 'Phase 2',
        title: 'Authentication And Personas',
        window: 'Weeks 2-4',
        objective: 'Solid user identity, protected routes, and persona-aware experience switching.',
        milestones: [
            { label: 'NextAuth integration and route protection scaffold', state: 'in-progress' },
            { label: 'Profile + settings mutation wiring to real APIs', state: 'completed' },
            { label: 'Persona and brand context management', state: 'in-progress' },
        ],
    },
    {
        phase: 'Phase 3',
        title: 'Realtime + Universe Depth',
        window: 'Weeks 4-7',
        objective: 'Activate live collaboration surfaces in Social and Communities and tighten universe linkages.',
        milestones: [
            { label: 'Websocket runtime as default dev mode', state: 'completed' },
            { label: 'Social and community typing/presence event hardening', state: 'completed' },
            { label: 'Cross-universe realtime subscriptions and room ownership', state: 'next' },
        ],
    },
    {
        phase: 'Phase 4',
        title: 'Reliability, Security, Operations',
        window: 'Weeks 6-9',
        objective: 'Production controls for confidence: audits, gates, observability, and hardening.',
        milestones: [
            { label: 'Navigation and icon connectivity CI gate', state: 'completed' },
            { label: 'Security headers and API-wide defensive validation', state: 'completed' },
            { label: 'Structured logs and error telemetry integration', state: 'completed' },
        ],
    },
];

const executionTrack: Milestone[] = [
    { label: 'Persist invoice artifacts (HTML/PDF + metadata) to durable storage', state: 'completed' },
    { label: 'Persist payment webhook audit history to durable storage', state: 'completed' },
    { label: 'Add response timing and correlation tracing on core API surfaces', state: 'completed' },
    { label: 'Enable cloud artifact provider (Azure Blob) via env-configured storage adapter', state: 'completed' },
    { label: 'Add startup-time artifact storage config validation and health signaling', state: 'completed' },
    { label: 'Document Azure Blob artifact storage operational setup in README', state: 'completed' },
    { label: 'Add optional startup preflight script for strict env enforcement', state: 'completed' },
    { label: 'Enforce strict environment preflight in CI workflows before build', state: 'completed' },
    { label: 'Add artifact storage smoke gate in CI validation workflows', state: 'completed' },
    { label: 'Publish artifact storage smoke JSON report in CI artifacts', state: 'completed' },
    { label: 'Publish artifact storage smoke status and timings to GitHub summaries', state: 'completed' },
    { label: 'Consolidate smoke summary publishing into reusable CI script', state: 'completed' },
    { label: 'Consolidate navigation/env/smoke checks into unified ci:gates command', state: 'completed' },
    { label: 'Wire realtime notification service to persisted notifications table (create/read-state/clear)', state: 'completed' },
    { label: 'Implement provider-based invoice email delivery with durable outbox audit fallback', state: 'completed' },
    { label: 'Harden Adyen provider by replacing fake retrieval/save defaults with real session-context behavior', state: 'completed' },
    { label: 'Extend strict env preflight to validate invoice email provider credentials', state: 'completed' },
    { label: 'Harden users settings API with strict schema validation and normalized partial-merge persistence', state: 'completed' },
    { label: 'Implement Adyen webhook verification (auth token/HMAC) and raw-body parsing safety', state: 'completed' },
    { label: 'Restrict webhook debug endpoint to authenticated admins and validate provider inputs', state: 'completed' },
    { label: 'Add strict preflight checks to prevent mock carrier credentials for default fulfillment provider', state: 'completed' },
    { label: 'Replace mock invoice PDF bytes with valid minimal PDF rendering fallback', state: 'completed' },
    { label: 'Harden preflight with sender-email format and Adyen HMAC base64 validation', state: 'completed' },
    { label: 'Enforce fulfillment test/live runtime mode to block mock carriers in live operations', state: 'completed' },
    { label: 'Harden fulfillment APIs with strict request/query schema validation and consistent error mapping', state: 'completed' },
    { label: 'Harden payments APIs with strict schema validation and non-leaky error responses across intents/methods/confirm/refunds', state: 'completed' },
    { label: 'Remove residual any-cast payload handling in social reactions/comments APIs with schema-inferred typing', state: 'completed' },
    { label: 'Harden analytics events/metrics APIs with strict schema validation and typed query filters', state: 'completed' },
    { label: 'Complete API type-safety sweep by removing remaining any-cast handlers and legacy catch-any paths in social, invoices, and webhooks', state: 'completed' },
    { label: 'Add executable API validation contract checks for payments, analytics, invoices, and fulfillment schemas', state: 'completed' },
    { label: 'Add endpoint-level runtime contract checks for hardened API status-code behavior and enforce them in CI gates', state: 'completed' },
];

function stateTone(state: MilestoneState) {
    if (state === 'completed') return 'success';
    if (state === 'in-progress') return 'info';
    return 'warning';
}

function stateLabel(state: MilestoneState) {
    if (state === 'completed') return 'Complete';
    if (state === 'in-progress') return 'In Progress';
    return 'Next';
}

export function ProductOverview() {
    const completedCount = roadmap
        .flatMap((phase) => phase.milestones)
        .filter((milestone) => milestone.state === 'completed').length;
    const inProgressCount = roadmap
        .flatMap((phase) => phase.milestones)
        .filter((milestone) => milestone.state === 'in-progress').length;

    return (
        <Surface className="py-10">
            <SurfaceHeader
                title="Aurora Launch Roadmap"
                description="Execution-focused roadmap from foundation to production scale across all universes."
                actions={
                    <div className="flex gap-2">
                        <Link href="/navigation/topology">
                            <Button variant="secondary" size="sm">Open Topology</Button>
                        </Link>
                        <Link href="/">
                            <Button variant="primary" size="sm">Back Home</Button>
                        </Link>
                    </div>
                }
            />

            <SurfaceSection title="Delivery Snapshot" description="Current completion signal for active launch phases.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3" role="list" aria-label="Roadmap snapshot">
                    <Card role="listitem">
                        <CardTitle>Completed Milestones</CardTitle>
                        <CardDescription>{completedCount} items marked complete</CardDescription>
                    </Card>
                    <Card role="listitem">
                        <CardTitle>In Progress</CardTitle>
                        <CardDescription>{inProgressCount} items actively shipping</CardDescription>
                    </Card>
                    <Card role="listitem">
                        <CardTitle>Current Focus</CardTitle>
                        <CardDescription>Backend completion + secured API paths + realtime reliability</CardDescription>
                    </Card>
                </div>
            </SurfaceSection>

            <SurfaceSection title="Phased Plan" description="Prioritized delivery sequence for launch readiness.">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" role="list" aria-label="Roadmap phases">
                    {roadmap.map((phase) => (
                        <Card key={phase.phase} role="listitem" className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CardTitle>{phase.phase}: {phase.title}</CardTitle>
                                <Badge size="sm" variant="default">{phase.window}</Badge>
                            </div>
                            <CardDescription>{phase.objective}</CardDescription>
                            <div className="space-y-2" role="list" aria-label={`${phase.phase} milestones`}>
                                {phase.milestones.map((milestone) => (
                                    <div
                                        key={milestone.label}
                                        role="listitem"
                                        className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                                    >
                                        <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{milestone.label}</p>
                                        <Badge size="sm" variant={stateTone(milestone.state)}>{stateLabel(milestone.state)}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </SurfaceSection>

            <SurfaceSection title="Next Execution Track" description="Immediate steps to continue roadmap implementation now.">
                <div className="space-y-2" role="list" aria-label="Execution track">
                    {executionTrack.map((item) => (
                        <div
                            key={item.label}
                            role="listitem"
                            className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950"
                        >
                            <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{item.label}</p>
                            <Badge size="sm" variant={stateTone(item.state)}>{stateLabel(item.state)}</Badge>
                        </div>
                    ))}
                </div>
            </SurfaceSection>
        </Surface>
    );
}