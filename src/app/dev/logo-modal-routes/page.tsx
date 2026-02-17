import fs from 'fs/promises';
import path from 'path';
import { LogoModalRoutesClient } from './LogoModalRoutesClient';

type RouteId = 'a' | 'b' | 'c';

async function toDataUrl(filePath: string) {
  const buffer = await fs.readFile(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function getRouteIcons() {
  const root = process.cwd();
  const dir = path.join(root, 'docs', 'brand', 'logo-drafts', 'routes-v1', 'png', '256');

  const files: Record<RouteId, string> = {
    a: path.join(dir, 'aurora-route-a-arc-master.png'),
    b: path.join(dir, 'aurora-route-b-core-master.png'),
    c: path.join(dir, 'aurora-route-c-monogram-master.png'),
  };

  return {
    a: await toDataUrl(files.a),
    b: await toDataUrl(files.b),
    c: await toDataUrl(files.c),
  };
}

export default async function LogoModalRoutesPage() {
  const routeIcons = await getRouteIcons();
  return <LogoModalRoutesClient routeIcons={routeIcons} />;
}
