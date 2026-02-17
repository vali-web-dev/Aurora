import fs from 'fs/promises';
import path from 'path';
import Image from 'next/image';

type RouteId = 'a' | 'b' | 'c';
type VariantId = 'master' | 'mono' | 'invert';

const routeMeta: Record<RouteId, { name: string; slug: string }> = {
  a: { name: 'Route A — Arc', slug: 'arc' },
  b: { name: 'Route B — Core', slug: 'core' },
  c: { name: 'Route C — Monogram', slug: 'monogram' },
};

const variants: VariantId[] = ['master', 'mono', 'invert'];

async function readPngAsDataUrl(filePath: string) {
  const buffer = await fs.readFile(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export default async function LogoPreviewPage() {
  const root = process.cwd();
  const baseDir = path.join(root, 'docs', 'brand', 'logo-drafts', 'routes-v1', 'png', '256');
  const sheetPath = path.join(root, 'docs', 'brand', 'logo-drafts', 'routes-v1', 'png', 'preview', 'aurora-routes-v2-sheet.png');

  const sheetDataUrl = await readPngAsDataUrl(sheetPath);

  const grid = await Promise.all(
    (Object.keys(routeMeta) as RouteId[]).map(async (route) => {
      const routeName = routeMeta[route].slug;
      const images = await Promise.all(
        variants.map(async (variant) => {
          const fileName = `aurora-route-${route}-${routeName}-${variant}.png`;
          const filePath = path.join(baseDir, fileName);
          const src = await readPngAsDataUrl(filePath);
          return { variant, src };
        })
      );

      return {
        route,
        title: routeMeta[route].name,
        images,
      };
    })
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl md:text-4xl font-semibold">Aurora Logo Routes — Live Preview</h1>
          <p className="text-slate-400 mt-2">A/B/C × Master/Mono/Invert from generated v2 PNG assets.</p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
          <h2 className="text-xl font-medium mb-4">Comparison Sheet</h2>
          <div className="rounded-xl overflow-auto bg-slate-100 p-3">
            <Image
              src={sheetDataUrl}
              alt="Aurora route comparison sheet"
              width={920}
              height={980}
              unoptimized
              className="h-auto w-full"
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-medium">Per Route</h2>
          {grid.map((row) => (
            <article key={row.route} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
              <h3 className="text-lg font-medium mb-4">{row.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {row.images.map((item) => (
                  <div key={`${row.route}-${item.variant}`} className="rounded-xl border border-slate-700 p-3 bg-slate-950/60">
                    <p className="text-sm text-slate-400 mb-2 capitalize">{item.variant}</p>
                    <div className={`${item.variant === 'invert' ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg p-2`}>
                      <Image
                        src={item.src}
                        alt={`${row.title} ${item.variant}`}
                        width={256}
                        height={256}
                        unoptimized
                        className="h-auto w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
