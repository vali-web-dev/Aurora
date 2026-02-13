export function ProductOverview() {
return (
    <section className="space-y-6">
    <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-aurora-muted">
        Product
        </p>
        <h1 className="text-2xl font-semibold">What Aurora actually is.</h1>
        <p className="text-sm text-aurora-muted max-w-xl">
        Aurora is a unified environment for your creative life. It behaves like an operating system: Realms for context, Forge for building, Guilds for collaboration, Luma for guidance, and Neural UX for comfort.
        </p>
    </div>
    <div className="grid gap-4 md:grid-cols-2 text-xs">
        <div className="rounded-2xl border border-aurora-border/70 bg-aurora-surface/60 p-4">
        <p className="mb-1 text-[11px] font-semibold text-aurora-text">
            Aurora OS
        </p>
        <p className="text-aurora-muted">
            The frame that holds everything together: navigation, panels, surfaces, and the sensory system that makes Aurora feel alive.
        </p>
        </div>
        <div className="rounded-2xl border border-aurora-border/70 bg-aurora-surface/60 p-4">
        <p className="mb-1 text-[11px] font-semibold text-aurora-text">
            Realms
        </p>
        <p className="text-aurora-muted">
            Focus, Creation, Reflection, and more—each Realm is a tuned environment for a different mental state.
        </p>
        </div>
        {/* Add Forge, Guilds, Luma, Neural UX cards similarly */}
    </div>
    </section>
);
}