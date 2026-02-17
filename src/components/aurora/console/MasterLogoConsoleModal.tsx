'use client';

import { useEffect, useMemo, useState } from 'react';
import { AuroraModal } from '@/components/aurora/Modal';
import { Button, ButtonGroup } from '@/components/ui/Button';
import { assignPrimarySlots } from './ranking';
import { transitionConsoleState } from './state-machine';
import { CoreChamber } from './CoreChamber';
import { PrimaryRing } from './PrimaryRing';
import type { ConsoleMode, ConsoleState, Destination } from './types';

interface MasterLogoConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  currentRoute: string;
  onNavigate?: (route: string) => void;
}

export function MasterLogoConsoleModal({
  isOpen,
  onClose,
  destinations,
  currentRoute,
  onNavigate,
}: MasterLogoConsoleModalProps) {
  const [consoleState, setConsoleState] = useState<ConsoleState>({
    mode: 'engage',
    status: 'idle',
    focusedSlot: 0,
    reducedMotion: false,
  });

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setConsoleState((prev) => ({ ...prev, reducedMotion: media.matches }));
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const primarySlots = useMemo(
    () =>
      assignPrimarySlots(destinations, {
        currentRoute,
        now: Date.now(),
        slotLimit: 8,
      }),
    [destinations, currentRoute]
  );

  const slotDestinations = useMemo(
    () =>
      primarySlots
        .map((slot) => destinations.find((destination) => destination.id === slot.destinationId))
        .filter((destination): destination is Destination => Boolean(destination)),
    [primarySlots, destinations]
  );

  const selectedDestination =
    slotDestinations.find((destination) => destination.id === selectedId) ??
    slotDestinations[consoleState.focusedSlot] ??
    slotDestinations[0];

  const setStatus = (event: Parameters<typeof transitionConsoleState>[1]) => {
    setConsoleState((prev) => ({
      ...prev,
      status: transitionConsoleState(prev.status, event),
    }));
  };

  const handleNavigate = (destination: Destination) => {
    setSelectedId(destination.id);
    setStatus('CONFIRM_SELECTION');

    onNavigate?.(destination.route);

    window.setTimeout(() => {
      setStatus('NAVIGATE_COMPLETE');
      window.setTimeout(() => {
        setStatus('RECOVER_COMPLETE');
      }, 260);
    }, 150);
  };

  const moveFocus = (direction: -1 | 1) => {
    setConsoleState((prev) => ({
      ...prev,
      focusedSlot:
        (prev.focusedSlot + direction + Math.max(1, slotDestinations.length)) %
        Math.max(1, slotDestinations.length),
      status: transitionConsoleState(prev.status, 'FOCUS_SLOT'),
    }));
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(-1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const destination = slotDestinations[consoleState.focusedSlot];
      if (destination) {
        handleNavigate(destination);
      }
      return;
    }

    if (event.key === 'Escape') {
      setStatus('CANCEL');
      onClose();
    }
  };

  const setMode = (mode: ConsoleMode) => {
    setConsoleState((prev) => ({ ...prev, mode }));
    setStatus('INTENT_OPEN');
  };

  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aurora Master Logo Console"
      description="Functional-first navigation engine with crystal-water button language."
      size="xl"
      footerContent={
        <span>
          Mode: {consoleState.mode} • State: {consoleState.status} • Slots: {slotDestinations.length}/8
        </span>
      }
    >
      <div className="console-shell" data-mode={consoleState.mode} data-state={consoleState.status} onKeyDown={onKeyDown}>
        <div className="console-topbar">
          <ButtonGroup>
            <Button size="sm" variant={consoleState.mode === 'compact' ? 'primary' : 'secondary'} onClick={() => setMode('compact')}>
              Compact
            </Button>
            <Button size="sm" variant={consoleState.mode === 'engage' ? 'primary' : 'secondary'} onClick={() => setMode('engage')}>
              Engage
            </Button>
            <Button size="sm" variant={consoleState.mode === 'deep' ? 'primary' : 'secondary'} onClick={() => setMode('deep')}>
              Deep
            </Button>
          </ButtonGroup>

          <div className="console-readout">Focused: {selectedDestination?.label ?? '—'}</div>
        </div>

        <div className="console-stage" role="group" aria-label="Master logo console ring">
          <div className="stage-ring stage-ring-outer" aria-hidden="true" />
          <div className="stage-ring stage-ring-inner" aria-hidden="true" />

          <CoreChamber destination={selectedDestination} />

          <PrimaryRing
            destinations={slotDestinations}
            selectedId={selectedId}
            focusedIndex={consoleState.focusedSlot}
            onFocusIndex={(index) => {
              setConsoleState((prev) => ({ ...prev, focusedSlot: index }));
              setStatus('FOCUS_SLOT');
            }}
            onSelectDestination={handleNavigate}
          />
        </div>

        <div className="console-actions">
          <Button variant="primary" animation="shimmer" onClick={() => selectedDestination && handleNavigate(selectedDestination)}>
            Navigate to Focused
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <style jsx>{`
        .console-shell {
          display: grid;
          gap: 14px;
          border-radius: calc(var(--btn-radius-xl) + 8px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-secondary);
          box-shadow: var(--btn-shadow-layered-md), var(--btn-inset-shadow-glossy);
          padding: 18px;
          outline: none;
        }

        .console-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .console-readout {
          min-height: var(--btn-height-sm);
          border-radius: var(--btn-radius-full);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: var(--btn-gradient-glass);
          box-shadow: var(--btn-shadow-sm), var(--btn-inset-shadow-light);
          color: var(--btn-text-secondary);
          display: inline-flex;
          align-items: center;
          padding: 0 var(--btn-padding-x-md);
          font-size: var(--btn-font-size-sm);
          text-shadow: var(--btn-text-shadow-subtle);
        }

        .console-stage {
          min-height: 420px;
          border-radius: calc(var(--btn-radius-xl) + 6px);
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          background: linear-gradient(180deg, transparent, var(--btn-glass-opacity));
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
        }

        .stage-ring {
          position: absolute;
          border-radius: 9999px;
          border: var(--btn-border-width) var(--btn-border-style) var(--btn-border-secondary);
          box-shadow: var(--btn-shadow-sm), 0 0 0 1px var(--btn-border-primary) inset;
        }

        .stage-ring-outer {
          width: 368px;
          height: 368px;
          opacity: 0.54;
          animation: spin 16s linear infinite;
        }

        .stage-ring-inner {
          width: 286px;
          height: 286px;
          opacity: 0.72;
          animation: spinReverse 12s linear infinite;
        }

        .console-shell[data-state='idle'] .stage-ring {
          animation-duration: 22s;
        }

        .console-shell[data-state='target'] .stage-ring {
          animation-duration: 10s;
        }

        .console-shell[data-state='confirm'] .stage-ring {
          animation-duration: 8s;
        }

        .console-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stage-ring-outer,
          .stage-ring-inner {
            animation: none !important;
          }
        }

        @media (max-width: 860px) {
          .console-stage {
            min-height: 380px;
          }

          .stage-ring-outer {
            width: 320px;
            height: 320px;
          }

          .stage-ring-inner {
            width: 254px;
            height: 254px;
          }
        }
      `}</style>
    </AuroraModal>
  );
}
