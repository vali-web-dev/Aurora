'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { AuroraModal } from '@/components/aurora/Modal';

export type LifeModalState = 'idle' | 'loading' | 'active';

interface LifeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: LifeModalState;
  className?: string;
  children?: ReactNode;
}

export function LifeModal({
  isOpen,
  onClose,
  title = 'Life',
  description = 'Aurora vitality core',
  size = 'md',
  state = 'active',
  className,
  children,
}: LifeModalProps) {
  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
    >
      <div className={clsx('life-modal', className)} data-state={state}>
        <div className="life-ambient" aria-hidden="true" />
        <div className="life-glaze" aria-hidden="true" />
        <div className="life-core">
          <div className="life-core-orb" aria-hidden="true" />
          <div className="life-core-ring" aria-hidden="true" />
          <div className="life-core-text">Life</div>
          {children && <div className="life-content">{children}</div>}
        </div>
      </div>
      <style jsx>{`
        .life-modal {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 24px;
          background: radial-gradient(circle at 20% 20%, rgba(76, 29, 149, 0.2), transparent 55%),
            radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.2), transparent 60%),
            rgba(10, 15, 28, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .life-ambient {
          position: absolute;
          inset: -40%;
          background: conic-gradient(
            from 120deg,
            rgba(139, 92, 246, 0.2),
            rgba(59, 130, 246, 0.22),
            rgba(236, 72, 153, 0.2),
            rgba(139, 92, 246, 0.2)
          );
          filter: blur(60px);
          opacity: 0.7;
          animation: life-hue 10s linear infinite;
          will-change: transform, opacity, filter;
        }

        .life-glaze {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 45%, rgba(255, 255, 255, 0.08));
          opacity: 0.5;
          mix-blend-mode: screen;
          animation: life-glaze 4.2s ease-in-out infinite;
          pointer-events: none;
          will-change: opacity;
        }

        .life-core {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          gap: 16px;
          text-align: center;
          color: rgba(248, 250, 252, 0.9);
          animation: life-breathe 2.4s ease-in-out infinite;
          will-change: transform;
        }

        .life-core-orb {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.7), rgba(59, 130, 246, 0.2) 55%, rgba(15, 23, 42, 0.9) 100%);
          box-shadow: 0 0 40px rgba(236, 72, 153, 0.45), 0 0 80px rgba(59, 130, 246, 0.35);
          animation: life-pulse 2s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .life-core-ring {
          position: absolute;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          border: 1px solid rgba(148, 163, 184, 0.25);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.25);
          animation: life-expand 3.6s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .life-core-text {
          font-size: 22px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(226, 232, 240, 0.85);
        }

        .life-content {
          max-width: 520px;
          font-size: 14px;
          color: rgba(226, 232, 240, 0.7);
          line-height: 1.6;
        }

        .life-modal[data-state='idle'] .life-core {
          animation-duration: 3.2s;
        }

        .life-modal[data-state='idle'] .life-core-orb {
          animation-duration: 3s;
        }

        .life-modal[data-state='loading'] .life-core {
          animation-duration: 1.6s;
        }

        .life-modal[data-state='loading'] .life-core-orb {
          animation-duration: 1.4s;
        }

        .life-modal[data-state='loading'] .life-core-ring {
          animation-duration: 2.2s;
        }

        @keyframes life-breathe {
          0%, 100% {
            transform: scale3d(0.96, 0.96, 1);
          }
          50% {
            transform: scale3d(1.05, 1.05, 1);
          }
        }

        @keyframes life-pulse {
          0%, 100% {
            transform: scale3d(0.94, 0.94, 1);
            box-shadow: 0 0 26px rgba(236, 72, 153, 0.4), 0 0 60px rgba(59, 130, 246, 0.3);
          }
          50% {
            transform: scale3d(1.08, 1.08, 1);
            box-shadow: 0 0 40px rgba(236, 72, 153, 0.7), 0 0 90px rgba(59, 130, 246, 0.55);
          }
        }

        @keyframes life-expand {
          0%, 100% {
            transform: scale3d(0.92, 0.92, 1);
            opacity: 0.5;
          }
          50% {
            transform: scale3d(1.08, 1.08, 1);
            opacity: 0.9;
          }
        }

        @keyframes life-hue {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        @keyframes life-glaze {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </AuroraModal>
  );
}
