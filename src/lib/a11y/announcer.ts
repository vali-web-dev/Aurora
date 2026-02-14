let liveRegion: HTMLElement | null = null;

function getLiveRegion(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (liveRegion && document.body.contains(liveRegion)) return liveRegion;

  const existing = document.getElementById('aurora-live-region');
  if (existing) {
    liveRegion = existing;
    return existing;
  }

  const region = document.createElement('div');
  region.id = 'aurora-live-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);
  liveRegion = region;
  return region;
}

export function announce(message: string) {
  const region = getLiveRegion();
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
