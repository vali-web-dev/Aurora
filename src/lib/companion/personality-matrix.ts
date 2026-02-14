/**
 * Aurora Companion Personality System
 * 
 * Aurora adapts its tone, scope, and behavior based on:
 * - Universe context (Learn, Create, Finance, Health, etc.)
 * - Time patterns (first visit, repeat, late-night, etc.)
 * - User energy/intent signals (exploration, focus, relaxation, crisis)
 * - Social context (solo, collaboration, public)
 * 
 * This fulfills Aurora's declaration:
 * "A calm, emotionally intelligent digital civilization that knows you."
 */

export type UniverseContext =
  | 'home'
  | 'learning'
  | 'create'
  | 'productivity'
  | 'health'
  | 'finance'
  | 'social'
  | 'entertainment'
  | 'travel'
  | 'homecontrol'
  | 'automation'
  | 'commerce'
  | 'security'
  | 'developer'
  | 'ai'
  | 'identity'
  | 'realms'
  | 'guilds'
  | 'luma'
  | 'navigation';

export type ToneType = 'mentor' | 'strategist' | 'explorer' | 'analyst' | 'guardian';

export type ScopeLevel = 'minimal' | 'light' | 'standard' | 'deep' | 'intensive';

export type UserSignal = 'exploration' | 'focus' | 'learning' | 'creation' | 'relaxation' | 'crisis' | 'collaboration' | 'reflection';

export type TimePattern = 'first_visit' | 'return_visitor' | 'power_user' | 'new_day' | 'late_session' | 'off_hours';

/**
 * Personality Configuration Matrix
 * Maps universe + signals to tone + scope + prompts
 */
export const personalityMatrix: Record<UniverseContext, {
  defaultTone: ToneType;
  defaultScope: ScopeLevel;
  signalOverrides?: Partial<Record<UserSignal, { tone: ToneType; scope: ScopeLevel }>>;
  timePatternOverrides?: Partial<Record<TimePattern, { tone: ToneType; scope: ScopeLevel }>>;
  guidanceTheme?: string;
}> = {
  home: {
    defaultTone: 'mentor',
    defaultScope: 'standard',
    signalOverrides: {
      exploration: { tone: 'explorer', scope: 'light' },
      relaxation: { tone: 'mentor', scope: 'minimal' },
      reflection: { tone: 'strategist', scope: 'standard' },
    },
    timePatternOverrides: {
      first_visit: { tone: 'mentor', scope: 'light' },
      late_session: { tone: 'mentor', scope: 'minimal' },
    },
    guidanceTheme: 'Welcome center; warm, orientation-first',
  },

  learning: {
    defaultTone: 'mentor',
    defaultScope: 'deep',
    signalOverrides: {
      focus: { tone: 'strategist', scope: 'standard' },
      crisis: { tone: 'guardian', scope: 'light' },
      collaboration: { tone: 'explorer', scope: 'standard' },
    },
    timePatternOverrides: {
      first_visit: { tone: 'mentor', scope: 'deep' },
      power_user: { tone: 'strategist', scope: 'standard' },
    },
    guidanceTheme: 'Learning companion; progressive, encouraging; scaffold progress',
  },

  create: {
    defaultTone: 'explorer',
    defaultScope: 'deep',
    signalOverrides: {
      creation: { tone: 'explorer', scope: 'deep' },
      focus: { tone: 'strategist', scope: 'standard' },
      crisis: { tone: 'guardian', scope: 'minimal' },
    },
    timePatternOverrides: {
      first_visit: { tone: 'explorer', scope: 'light' },
    },
    guidanceTheme: 'Creative studio; spark ideas, minimize friction, celebrate iteration',
  },

  productivity: {
    defaultTone: 'strategist',
    defaultScope: 'standard',
    signalOverrides: {
      focus: { tone: 'strategist', scope: 'light' },
      crisis: { tone: 'guardian', scope: 'minimal' },
      reflection: { tone: 'analyst', scope: 'standard' },
    },
    timePatternOverrides: {
      new_day: { tone: 'strategist', scope: 'light' },
      late_session: { tone: 'strategist', scope: 'minimal' },
    },
    guidanceTheme: 'Task command center; goals, momentum, clarity; block distraction',
  },

  health: {
    defaultTone: 'guardian',
    defaultScope: 'standard',
    signalOverrides: {
      crisis: { tone: 'guardian', scope: 'deep' },
      relaxation: { tone: 'mentor', scope: 'minimal' },
      reflection: { tone: 'analyst', scope: 'deep' },
    },
    timePatternOverrides: {
      late_session: { tone: 'mentor', scope: 'minimal' },
      new_day: { tone: 'strategist', scope: 'light' },
    },
    guidanceTheme: 'Wellness hub; safety-first, transparent, data-informed; consent before action',
  },

  finance: {
    defaultTone: 'analyst',
    defaultScope: 'standard',
    signalOverrides: {
      focus: { tone: 'strategist', scope: 'light' },
      crisis: { tone: 'guardian', scope: 'deep' },
      reflection: { tone: 'analyst', scope: 'deep' },
    },
    timePatternOverrides: {
      power_user: { tone: 'analyst', scope: 'minimal' },
    },
    guidanceTheme: 'Financial command; neutral, data-rich, risk-aware; empower choice',
  },

  social: {
    defaultTone: 'explorer',
    defaultScope: 'light',
    signalOverrides: {
      collaboration: { tone: 'strategist', scope: 'standard' },
      reflection: { tone: 'analyst', scope: 'deep' },
      crisis: { tone: 'guardian', scope: 'standard' },
    },
    timePatternOverrides: {
      new_day: { tone: 'explorer', scope: 'light' },
    },
    guidanceTheme: 'Digital plaza; connection-first, serendipity, respect boundaries',
  },

  entertainment: {
    defaultTone: 'explorer',
    defaultScope: 'minimal',
    signalOverrides: {
      relaxation: { tone: 'explorer', scope: 'minimal' },
      exploration: { tone: 'explorer', scope: 'light' },
    },
    timePatternOverrides: {
      late_session: { tone: 'explorer', scope: 'minimal' },
    },
    guidanceTheme: 'Escape hatch; discovery-led, low-friction, embrace serendipity',
  },

  travel: {
    defaultTone: 'explorer',
    defaultScope: 'standard',
    signalOverrides: {
      exploration: { tone: 'explorer', scope: 'deep' },
    },
    timePatternOverrides: {
      first_visit: { tone: 'explorer', scope: 'light' },
    },
    guidanceTheme: 'Journey planner; inspire wanderlust, empower autonomy, local wisdom',
  },

  homecontrol: {
    defaultTone: 'guardian',
    defaultScope: 'minimal',
    signalOverrides: {
      focus: { tone: 'strategist', scope: 'light' },
      crisis: { tone: 'guardian', scope: 'deep' },
    },
    timePatternOverrides: {
      late_session: { tone: 'guardian', scope: 'minimal' },
    },
    guidanceTheme: 'Smart home; invisible, reliable, safety always first',
  },

  automation: {
    defaultTone: 'analyst',
    defaultScope: 'standard',
    signalOverrides: {
      focus: { tone: 'strategist', scope: 'light' },
      crisis: { tone: 'guardian', scope: 'deep' },
    },
    timePatternOverrides: {
      power_user: { tone: 'analyst', scope: 'minimal' },
    },
    guidanceTheme: 'Workflow engine; rule clarity, transparency, user in control',
  },

  commerce: {
    defaultTone: 'strategist',
    defaultScope: 'light',
    signalOverrides: {
      exploration: { tone: 'explorer', scope: 'light' },
      focus: { tone: 'strategist', scope: 'minimal' },
      crisis: { tone: 'guardian', scope: 'standard' },
    },
    guidanceTheme: 'Marketplace; choice clarity, value transparency, trust signals',
  },

  security: {
    defaultTone: 'guardian',
    defaultScope: 'deep',
    signalOverrides: {
      crisis: { tone: 'guardian', scope: 'deep' },
      reflection: { tone: 'analyst', scope: 'deep' },
    },
    guidanceTheme: 'Security center; unambiguous, protective, education-led, consent required',
  },

  developer: {
    defaultTone: 'analyst',
    defaultScope: 'standard',
    signalOverrides: {
      focus: { tone: 'strategist', scope: 'light' },
      creation: { tone: 'explorer', scope: 'standard' },
      learning: { tone: 'mentor', scope: 'deep' },
    },
    guidanceTheme: 'Dev hub; clarity, precision, power-user respect; docs first',
  },

  ai: {
    defaultTone: 'analyst',
    defaultScope: 'standard',
    signalOverrides: {
      learning: { tone: 'mentor', scope: 'deep' },
      exploration: { tone: 'explorer', scope: 'standard' },
      crisis: { tone: 'guardian', scope: 'deep' },
    },
    guidanceTheme: 'AI ethics lab; transparency, guardrails, informed consent always',
  },

  identity: {
    defaultTone: 'guardian',
    defaultScope: 'deep',
    signalOverrides: {
      reflection: { tone: 'mentor', scope: 'deep' },
      crisis: { tone: 'guardian', scope: 'deep' },
    },
    guidanceTheme: 'Identity vault; sacred, transparent, user sovereignty always',
  },

  realms: {
    defaultTone: 'explorer',
    defaultScope: 'standard',
    signalOverrides: {
      exploration: { tone: 'explorer', scope: 'deep' },
      collaboration: { tone: 'strategist', scope: 'standard' },
    },
    guidanceTheme: 'Community spaces; serendipity, shared ownership, inclusive',
  },

  guilds: {
    defaultTone: 'strategist',
    defaultScope: 'standard',
    signalOverrides: {
      collaboration: { tone: 'strategist', scope: 'standard' },
      exploration: { tone: 'explorer', scope: 'light' },
    },
    guidanceTheme: 'Guild halls; camaraderie, shared missions, craft mastery',
  },

  luma: {
    defaultTone: 'mentor',
    defaultScope: 'standard',
    signalOverrides: {
      learning: { tone: 'mentor', scope: 'deep' },
      exploration: { tone: 'explorer', scope: 'light' },
    },
    guidanceTheme: 'Learning lab; curiosity-led, hands-on, celebrate discovery',
  },

  navigation: {
    defaultTone: 'mentor',
    defaultScope: 'light',
    signalOverrides: {
      exploration: { tone: 'explorer', scope: 'light' },
      crisis: { tone: 'guardian', scope: 'light' },
    },
    guidanceTheme: 'Navigation guide; orient clearly, encourage exploration, clarify context',
  },
};

/**
 * Tone Behavioral Definitions
 * Dictates language, pacing, guidance depth, and emotional register
 */
export const toneBehaviors: Record<ToneType, {
  greeting: string;
  pacing: 'fast' | 'measured' | 'slow';
  verbosity: 'terse' | 'balanced' | 'rich';
  emotionalRegister: 'cool' | 'warm' | 'spirited';
  guidanceApproach: 'directive' | 'questioning' | 'suggestive';
  suggestionFrequency: 'rare' | 'occasional' | 'frequent';
  examplesIncluded: boolean;
}> = {
  mentor: {
    greeting: 'Welcome back. What are you working on today?',
    pacing: 'measured',
    verbosity: 'balanced',
    emotionalRegister: 'warm',
    guidanceApproach: 'suggestive',
    suggestionFrequency: 'occasional',
    examplesIncluded: true,
  },
  strategist: {
    greeting: 'Let\'s organize your goals.',
    pacing: 'fast',
    verbosity: 'terse',
    emotionalRegister: 'cool',
    guidanceApproach: 'directive',
    suggestionFrequency: 'frequent',
    examplesIncluded: false,
  },
  explorer: {
    greeting: 'What sparks your curiosity today?',
    pacing: 'slow',
    verbosity: 'rich',
    emotionalRegister: 'spirited',
    guidanceApproach: 'questioning',
    suggestionFrequency: 'frequent',
    examplesIncluded: true,
  },
  analyst: {
    greeting: 'Here\'s what\'s happening.',
    pacing: 'fast',
    verbosity: 'terse',
    emotionalRegister: 'cool',
    guidanceApproach: 'suggestive',
    suggestionFrequency: 'rare',
    examplesIncluded: false,
  },
  guardian: {
    greeting: 'Your privacy and safety come first.',
    pacing: 'measured',
    verbosity: 'balanced',
    emotionalRegister: 'warm',
    guidanceApproach: 'directive',
    suggestionFrequency: 'occasional',
    examplesIncluded: true,
  },
};

/**
 * Scope Level Behaviors
 * Dictates what memory, suggestions, and tools are available
 */
export const scopeBehaviors: Record<ScopeLevel, {
  memoryEnabled: boolean;
  suggestionsEnabled: boolean;
  summariesEnabled: boolean;
  toolsAvailable: ('notes' | 'goals' | 'timeline' | 'insights' | 'export')[];
  maxNotes: number;
  maxMemoryEvents: number;
}> = {
  minimal: {
    memoryEnabled: false,
    suggestionsEnabled: false,
    summariesEnabled: false,
    toolsAvailable: [],
    maxNotes: 0,
    maxMemoryEvents: 0,
  },
  light: {
    memoryEnabled: true,
    suggestionsEnabled: false,
    summariesEnabled: false,
    toolsAvailable: ['notes'],
    maxNotes: 5,
    maxMemoryEvents: 10,
  },
  standard: {
    memoryEnabled: true,
    suggestionsEnabled: true,
    summariesEnabled: true,
    toolsAvailable: ['notes', 'goals', 'timeline'],
    maxNotes: 20,
    maxMemoryEvents: 50,
  },
  deep: {
    memoryEnabled: true,
    suggestionsEnabled: true,
    summariesEnabled: true,
    toolsAvailable: ['notes', 'goals', 'timeline', 'insights'],
    maxNotes: 50,
    maxMemoryEvents: 150,
  },
  intensive: {
    memoryEnabled: true,
    suggestionsEnabled: true,
    summariesEnabled: true,
    toolsAvailable: ['notes', 'goals', 'timeline', 'insights', 'export'],
    maxNotes: 200,
    maxMemoryEvents: 500,
  },
};

/**
 * Calculate which tone/scope combination applies
 */
export function resolvePersonality(
  universe: UniverseContext,
  signals: UserSignal[] = [],
  timePattern: TimePattern = 'return_visitor'
) {
  const config = personalityMatrix[universe];
  if (!config) {
    return {
      tone: 'mentor' as ToneType,
      scope: 'standard' as ScopeLevel,
    };
  }

  // Priority: crisis signal or time pattern > general signal > default
  if (config.timePatternOverrides?.[timePattern]) {
    return config.timePatternOverrides[timePattern];
  }

  for (const signal of signals) {
    if (config.signalOverrides?.[signal]) {
      return config.signalOverrides[signal];
    }
  }

  return {
    tone: config.defaultTone,
    scope: config.defaultScope,
  };
}
