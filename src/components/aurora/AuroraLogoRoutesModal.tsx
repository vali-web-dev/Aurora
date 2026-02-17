'use client';

import { useMemo, useState } from 'react';
import { AuroraModal } from '@/components/aurora/Modal';
import { Button, ButtonGroup } from '@/components/ui/Button';

type EmotionMode = 'calm' | 'focus' | 'spark';
type RouteId = 'a' | 'b' | 'c';

interface AuroraLogoRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeIcons: Record<RouteId, string>;
}

const routeLabel: Record<RouteId, string> = {
  a: 'Route A',
  b: 'Route B',
  c: 'Route C',
};

export function AuroraLogoRoutesModal({ isOpen, onClose, routeIcons }: AuroraLogoRoutesModalProps) {
  const [emotion, setEmotion] = useState<EmotionMode>('focus');
  const [route, setRoute] = useState<RouteId>('b');

  const energy = useMemo(() => {
    if (emotion === 'calm') return 0.98;
    if (emotion === 'spark') return 1.04;
    return 1;
  }, [emotion]);

  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aurora Logo Routes"
      description="Original A/B/C route icons in Aurora crystal-water style presentation."
      size="lg"
      footerContent={<div className="logo-routes-footer">Selected: {routeLabel[route]} • Emotion: {emotion}</div>}
    >
      <div className="logo-routes-shell" data-emotion={emotion}>
        <div className="logo-routes-ambient" aria-hidden="true" />

        <div className="logo-routes-top">
          <span className="logo-routes-chip">Aurora Route Matrix</span>
          <ButtonGroup>
            <Button size="sm" variant={emotion === 'calm' ? 'primary' : 'secondary'} animation={emotion === 'calm' ? 'breathe' : 'none'} onClick={() => setEmotion('calm')}>
              Calm
            </Button>
            <Button size="sm" variant={emotion === 'focus' ? 'primary' : 'secondary'} animation={emotion === 'focus' ? 'shimmer' : 'none'} onClick={() => setEmotion('focus')}>
              Focus
            </Button>
            <Button size="sm" variant={emotion === 'spark' ? 'primary' : 'secondary'} animation={emotion === 'spark' ? 'glow' : 'none'} onClick={() => setEmotion('spark')}>
              Spark
            </Button>
          </ButtonGroup>
        </div>

        <div className="logo-routes-selector" role="group" aria-label="Select Aurora logo route">
          <ButtonGroup>
            <Button size="sm" variant={route === 'a' ? 'primary' : 'secondary'} onClick={() => setRoute('a')}>Route A</Button>
            <Button size="sm" variant={route === 'b' ? 'primary' : 'secondary'} onClick={() => setRoute('b')}>Route B</Button>
            <Button size="sm" variant={route === 'c' ? 'primary' : 'secondary'} onClick={() => setRoute('c')}>Route C</Button>
          </ButtonGroup>
        </div>

        <div className="logo-routes-stage" style={{ transform: `scale(${energy})` }}>
          <div className="logo-routes-ring logo-routes-ring-outer" aria-hidden="true" />
          <div className="logo-routes-ring logo-routes-ring-inner" aria-hidden="true" />

          <div className="logo-routes-panel">
            <img src={routeIcons[route]} alt={`${routeLabel[route]} icon`} className="logo-routes-main" />
            <div className="logo-routes-script" aria-hidden="true">AURORA • ROUTE • SIGNAL • AURORA • ROUTE • SIGNAL</div>
          </div>

          <div className="logo-routes-pulse logo-routes-pulse-one" aria-hidden="true" />
          <div className="logo-routes-pulse logo-routes-pulse-two" aria-hidden="true" />
        </div>

        <div className="logo-routes-grid">
          {(['a', 'b', 'c'] as RouteId[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRoute(item)}
              className={`logo-route-thumb ${route === item ? 'active' : ''}`}
              aria-label={`Preview ${routeLabel[item]}`}
            >
              <img src={routeIcons[item]} alt={`${routeLabel[item]} thumbnail`} />
              <span>{routeLabel[item]}</span>
            </button>
          ))}
        </div>

        <div className="logo-routes-actions">
          <Button variant="primary" animation="shimmer" emotional>
            Set Route {route.toUpperCase()} As Default
          </Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>

      <style jsx>{`
        .logo-routes-shell {
          position: relative;
          overflow: hidden;
          border-radius: calc(var(--btn-radius-xl) + 6px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-layered-lg), var(--btn-inset-shadow-glossy);
          padding: 22px;
          display: grid;
          gap: 16px;
        }

        .logo-routes-footer {
          color: var(--btn-text-muted);
        }

        .logo-routes-ambient {
          position: absolute;
          inset: -32%;
          background:
            radial-gradient(circle at 20% 30%, var(--btn-glow-primary), transparent 58%),
            radial-gradient(circle at 78% 50%, var(--btn-glow-notice), transparent 60%);
          opacity: calc(var(--btn-overlay-opacity) + 0.32);
          filter: blur(44px);
          animation: routes-flow calc(var(--btn-anim-breathe) * 2.6) linear infinite;
          pointer-events: none;
        }

        .logo-routes-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .logo-routes-chip {
          min-height: var(--btn-height-sm);
          padding: 0 var(--btn-padding-x-md);
          border-radius: var(--btn-radius-full);
          display: inline-flex;
          align-items: center;
          font-size: var(--btn-font-size-sm);
          color: var(--btn-text-secondary);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          text-shadow: var(--btn-text-shadow-subtle);
        }

        .logo-routes-selector {
          position: relative;
          z-index: 2;
        }

        .logo-routes-stage {
          position: relative;
          z-index: 2;
          min-height: 280px;
          border-radius: calc(var(--btn-radius-xl) + 4px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: linear-gradient(180deg, transparent, var(--btn-glass-opacity));
          display: grid;
          place-items: center;
          overflow: hidden;
          transition: transform var(--btn-transition-normal) var(--btn-transition-ease);
        }

        .logo-routes-ring {
          position: absolute;
          border-radius: 9999px;
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          box-shadow: var(--btn-shadow-sm), 0 0 0 1px var(--btn-border-primary) inset;
          animation: orbit calc(var(--btn-anim-pulse) * 1.5) linear infinite;
        }

        .logo-routes-ring-outer {
          width: 238px;
          height: 238px;
          opacity: 0.62;
        }

        .logo-routes-ring-inner {
          width: 184px;
          height: 184px;
          opacity: 0.78;
          animation-direction: reverse;
          animation-duration: calc(var(--btn-anim-pulse) * 1.2);
        }

        .logo-routes-panel {
          width: 212px;
          height: 212px;
          border-radius: calc(var(--btn-radius-xl) + 8px);
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-primary);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-layered-md), var(--btn-shadow-glow), var(--btn-inset-shadow-glossy);
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .logo-routes-main {
          width: 154px;
          height: 154px;
          object-fit: contain;
          filter: drop-shadow(0 0 10px var(--btn-glow-primary));
        }

        .logo-routes-script {
          position: absolute;
          left: -36%;
          right: -36%;
          bottom: 14px;
          font-size: var(--btn-font-size-sm);
          letter-spacing: 0.24em;
          white-space: nowrap;
          text-transform: uppercase;
          color: var(--btn-text-primary-enhanced);
          text-shadow: var(--btn-text-shadow-water-focused);
          opacity: 0.58;
          animation: glass-script calc(var(--btn-anim-shimmer) * 1.08) linear infinite;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .logo-routes-pulse {
          position: absolute;
          border-radius: 9999px;
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-primary);
          opacity: 0;
          pointer-events: none;
        }

        .logo-routes-pulse-one {
          width: 176px;
          height: 176px;
          animation: pingFlow calc(var(--btn-anim-pulse) * 1.45) ease-out infinite;
        }

        .logo-routes-pulse-two {
          width: 212px;
          height: 212px;
          animation: pingFlow calc(var(--btn-anim-pulse) * 1.7) ease-out infinite;
          animation-delay: 300ms;
        }

        .logo-routes-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .logo-route-thumb {
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          border-radius: var(--btn-radius-lg);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          padding: 8px;
          display: grid;
          place-items: center;
          gap: 6px;
          color: var(--btn-text-secondary);
          font-size: var(--btn-font-size-sm);
          transition: all var(--btn-transition-fast) var(--btn-transition-ease);
        }

        .logo-route-thumb img {
          width: 74px;
          height: 74px;
          object-fit: contain;
        }

        .logo-route-thumb.active {
          border-color: var(--btn-border-primary);
          box-shadow: var(--btn-shadow-md), 0 0 0 1px var(--btn-border-primary) inset;
          transform: translateY(-1px);
        }

        .logo-routes-actions {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .logo-routes-shell[data-emotion='calm'] .logo-routes-stage {
          transition-duration: var(--btn-transition-slow);
        }

        .logo-routes-shell[data-emotion='spark'] .logo-routes-panel {
          box-shadow: var(--btn-shadow-layered-md), 0 0 28px var(--btn-glow-primary), var(--btn-inset-shadow-glossy);
        }

        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pingFlow {
          0% {
            transform: scale(0.88);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.22);
            opacity: 0;
          }
        }

        @keyframes routes-flow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes glass-script {
          0% {
            transform: translateX(0%);
            opacity: 0.46;
          }
          50% { opacity: 0.76; }
          100% {
            transform: translateX(-22%);
            opacity: 0.46;
          }
        }

        @media (max-width: 768px) {
          .logo-routes-stage {
            min-height: 246px;
          }

          .logo-routes-panel {
            width: 184px;
            height: 184px;
          }

          .logo-routes-main {
            width: 132px;
            height: 132px;
          }

          .logo-routes-ring-outer {
            width: 206px;
            height: 206px;
          }

          .logo-routes-ring-inner {
            width: 162px;
            height: 162px;
          }
        }
      `}</style>
    </AuroraModal>
  );
}
