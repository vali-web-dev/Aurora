import type { ConsoleInteractionState } from './types';

export type ConsoleEvent =
  | 'INTENT_OPEN'
  | 'FOCUS_SLOT'
  | 'CONFIRM_SELECTION'
  | 'NAVIGATE_COMPLETE'
  | 'RECOVER_COMPLETE'
  | 'CANCEL';

export function transitionConsoleState(
  current: ConsoleInteractionState,
  event: ConsoleEvent
): ConsoleInteractionState {
  if (event === 'CANCEL') {
    return 'idle';
  }

  switch (current) {
    case 'idle':
      return event === 'INTENT_OPEN' ? 'engage' : current;
    case 'engage':
      if (event === 'FOCUS_SLOT') return 'target';
      return current;
    case 'target':
      if (event === 'CONFIRM_SELECTION') return 'confirm';
      if (event === 'INTENT_OPEN') return 'engage';
      return current;
    case 'confirm':
      return event === 'NAVIGATE_COMPLETE' ? 'navigate' : current;
    case 'navigate':
      return event === 'NAVIGATE_COMPLETE' ? 'recover' : current;
    case 'recover':
      return event === 'RECOVER_COMPLETE' ? 'idle' : current;
    default:
      return current;
  }
}
