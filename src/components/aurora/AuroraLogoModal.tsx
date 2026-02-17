'use client';

import { useMemo, useState } from 'react';
import { AuroraModal } from '@/components/aurora/Modal';
import { Button, ButtonGroup } from '@/components/ui/Button';
import { AuroraLogo } from '@/components/aurora/AuroraLogo';

type EmotionMode = 'calm' | 'focus' | 'spark';

interface AuroraLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuroraLogoModal({ isOpen, onClose }: AuroraLogoModalProps) {
  const [emotion, setEmotion] = useState<EmotionMode>('focus');
  const [tilt, setTilt] = useState({ x: 0, y: 0, glow: 0.75 });

  const energy = useMemo(() => {
    if (emotion === 'calm') return 0.96;
    if (emotion === 'spark') return 1.08;
    return 1;
  }, [emotion]);

  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aurora Default Logo"
      description="Living diamond identity — emotionally aware, futuristic, and functional."
      size="lg"
      footerContent={
        <div className="logo-modal-footer">
          <span>Emotion state: {emotion}</span>
        </div>
      }
    >
      <div className="logo-modal-shell" data-emotion={emotion}>
        <div className="logo-ambient" aria-hidden="true" />

        <div className="logo-top-row">
          <span className="logo-chip">Aurora Identity Core</span>
          <div className="logo-controls" role="group" aria-label="Logo emotion mode">
            <ButtonGroup>
              <Button
                size="sm"
                variant={emotion === 'calm' ? 'primary' : 'secondary'}
                animation={emotion === 'calm' ? 'breathe' : 'none'}
                onClick={() => setEmotion('calm')}
              >
                Calm
              </Button>
              <Button
                size="sm"
                variant={emotion === 'focus' ? 'primary' : 'secondary'}
                animation={emotion === 'focus' ? 'shimmer' : 'none'}
                onClick={() => setEmotion('focus')}
              >
                Focus
              </Button>
              <Button
                size="sm"
                variant={emotion === 'spark' ? 'primary' : 'secondary'}
                animation={emotion === 'spark' ? 'glow' : 'none'}
                onClick={() => setEmotion('spark')}
              >
                Spark
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div
          className="logo-stage"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
            const glow = Math.min(1, Math.max(0.5, 0.8 + (Math.abs(x) + Math.abs(y)) / 50));
            setTilt({ x, y, glow });
          }}
          onMouseLeave={() => setTilt({ x: 0, y: 0, glow: 0.75 })}
          aria-label="Interactive Aurora logo core"
        >
          <div className="logo-ring logo-ring-outer" aria-hidden="true" />
          <div className="logo-ring logo-ring-inner" aria-hidden="true" />

          <div
            className="logo-crystal"
            style={{
              transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0) rotate(45deg) scale(${energy})`,
              filter: `drop-shadow(0 0 ${20 + tilt.glow * 20}px var(--btn-glow-primary))`,
            }}
          >
            <div className="logo-crystal-gloss" />
            <div className="logo-crystal-content">
              <div className="logo-crystal-core">
                <AuroraLogo size={156} interactive={false} showNav={false} ariaLabel="Aurora logo preview" />
              </div>
              <div className="logo-crystal-script" aria-hidden="true">AURORA • LIVE • AURORA • LIVE</div>
            </div>
          </div>

          <div className="logo-pulse logo-pulse-one" aria-hidden="true" />
          <div className="logo-pulse logo-pulse-two" aria-hidden="true" />
        </div>

        <p className="logo-manifesto">
          Existing Aurora logo preserved exactly. Crystal-water presentation layer follows button-system styling and real-time glass writing behavior.
        </p>

        <div className="logo-actions">
          <Button variant="primary" animation="shimmer" emotional>
            Set As Default
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <style jsx>{`
        .logo-modal-shell {
          position: relative;
          overflow: hidden;
          border-radius: calc(var(--btn-radius-xl) + 6px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-layered-lg), var(--btn-inset-shadow-glossy);
          padding: 22px;
          display: grid;
          gap: 18px;
          transition: all var(--btn-transition-normal) var(--btn-transition-ease);
        }

        .logo-modal-footer {
          color: var(--btn-text-muted);
          letter-spacing: var(--btn-letter-spacing);
        }

        .logo-ambient {
          position: absolute;
          inset: -35%;
          background:
            radial-gradient(circle at 25% 35%, var(--btn-glow-primary), transparent 60%),
            radial-gradient(circle at 75% 45%, var(--btn-glow-notice), transparent 58%);
          opacity: calc(var(--btn-overlay-opacity) + 0.35);
          filter: blur(46px);
          animation: aurora-flow calc(var(--btn-anim-breathe) * 2.8) linear infinite;
          pointer-events: none;
        }

        .logo-top-row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .logo-chip {
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

        .logo-stage {
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          min-height: 320px;
          border-radius: calc(var(--btn-radius-xl) + 4px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: linear-gradient(180deg, transparent, var(--btn-glass-opacity));
          overflow: hidden;
          transition: transform var(--btn-transition-normal) var(--btn-transition-ease);
        }

        .logo-ring {
          position: absolute;
          border-radius: 9999px;
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          box-shadow: var(--btn-shadow-sm), 0 0 0 1px var(--btn-border-primary) inset;
          animation: orbit calc(var(--btn-anim-pulse) * 1.6) linear infinite;
        }

        .logo-ring-outer {
          width: 238px;
          height: 238px;
          opacity: 0.65;
        }

        .logo-ring-inner {
          width: 182px;
          height: 182px;
          opacity: 0.8;
          animation-duration: calc(var(--btn-anim-pulse) * 1.15);
          animation-direction: reverse;
        }

        .logo-crystal {
          width: 236px;
          height: 236px;
          border-radius: var(--btn-radius-lg);
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-primary);
          background: var(--btn-gradient-glass-glossy), var(--btn-gradient-primary);
          box-shadow: var(--btn-shadow-layered-md), var(--btn-shadow-glow), var(--btn-inset-shadow-glossy);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform var(--btn-transition-normal) var(--btn-transition-bounce), filter var(--btn-transition-normal) var(--btn-transition-ease);
          animation: corePulse var(--btn-anim-pulse) ease-in-out infinite;
          will-change: transform, filter;
          overflow: hidden;
        }

        .logo-crystal-gloss {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: var(--btn-gradient-reflection);
          opacity: var(--btn-reflection-opacity);
          pointer-events: none;
        }

        .logo-crystal-content {
          transform: rotate(-45deg);
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          position: relative;
          padding: 24px;
        }

        .logo-crystal-core {
          width: 178px;
          height: 178px;
          border-radius: var(--btn-radius-lg);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          display: grid;
          place-items: center;
          box-shadow: var(--btn-shadow-md), var(--btn-inset-shadow-light);
          overflow: hidden;
        }

        .logo-crystal-script {
          position: absolute;
          left: -30%;
          right: -30%;
          bottom: 16px;
          font-size: var(--btn-font-size-sm);
          font-weight: var(--btn-font-weight);
          letter-spacing: 0.28em;
          white-space: nowrap;
          text-transform: uppercase;
          color: var(--btn-text-primary-enhanced);
          text-shadow: var(--btn-text-shadow-water-focused);
          opacity: 0.58;
          animation: glass-script calc(var(--btn-anim-shimmer) * 1.05) linear infinite;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .logo-a-mark {
          transform: rotate(-45deg);
          font-size: 58px;
          font-weight: var(--btn-font-weight-bold);
          line-height: 1;
          letter-spacing: -0.03em;
          color: var(--btn-text-primary);
          text-shadow: var(--btn-text-shadow-primary);
          user-select: none;
        }

        .logo-pulse {
          position: absolute;
          border-radius: 9999px;
          border: var(--btn-border-width-thick) var(--btn-border-style) var(--btn-border-primary);
          opacity: 0;
          pointer-events: none;
        }

        .logo-pulse-one {
          width: 170px;
          height: 170px;
          animation: pingFlow calc(var(--btn-anim-pulse) * 1.45) ease-out infinite;
        }

        .logo-pulse-two {
          width: 204px;
          height: 204px;
          animation: pingFlow calc(var(--btn-anim-pulse) * 1.7) ease-out infinite;
          animation-delay: 300ms;
        }

        .logo-manifesto {
          position: relative;
          z-index: 2;
          margin: 0;
          font-size: var(--btn-font-size-md);
          line-height: 1.6;
          color: var(--btn-text-secondary-muted);
          text-shadow: var(--btn-text-shadow-subtle);
        }

        .logo-actions {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .logo-modal-shell[data-emotion='calm'] .logo-crystal {
          animation-duration: calc(var(--btn-anim-breathe) * 1.15);
        }

        .logo-modal-shell[data-emotion='calm'] .logo-ring {
          animation-duration: calc(var(--btn-anim-breathe) * 1.25);
        }

        .logo-modal-shell[data-emotion='spark'] .logo-crystal {
          animation-duration: calc(var(--btn-anim-pulse) * 0.72);
          box-shadow: var(--btn-shadow-layered-md), 0 0 26px var(--btn-glow-primary), var(--btn-inset-shadow-glossy);
        }

        .logo-modal-shell[data-emotion='spark'] .logo-pulse {
          animation-duration: calc(var(--btn-anim-pulse) * 0.8);
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes corePulse {
          0%,
          100% {
            transform: rotate(45deg) scale(0.97);
          }
          50% {
            transform: rotate(45deg) scale(1.03);
          }
        }

        @keyframes pingFlow {
          0% {
            transform: scale(0.88);
            opacity: 0.42;
          }
          100% {
            transform: scale(1.22);
            opacity: 0;
          }
        }

        @keyframes aurora-flow {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.06);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes glass-script {
          0% {
            transform: translateX(0%);
            opacity: 0.46;
          }
          50% {
            opacity: 0.76;
          }
          100% {
            transform: translateX(-22%);
            opacity: 0.46;
          }
        }

        @media (max-width: 768px) {
          .logo-stage {
            min-height: 270px;
          }

          .logo-crystal {
            width: 204px;
            height: 204px;
          }

          .logo-crystal-core {
            width: 154px;
            height: 154px;
          }

          .logo-ring-outer {
            width: 208px;
            height: 208px;
          }

          .logo-ring-inner {
            width: 162px;
            height: 162px;
          }
        }
      `}</style>
    </AuroraModal>
  );
}
