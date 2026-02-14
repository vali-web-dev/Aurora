// ============ Notifications ============
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  kind: 'security' | 'reminder' | 'community' | 'system' | 'alert';
  read: boolean;
  createdAt: Date;
}

export interface LearningTimelineItem {
  id: string;
  title: string;
  courseId: string;
  percent: number;
  dateLabel: string;
}

// ============ Users and Identity ============
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Persona {
  id: string;
  userId: string;
  name: string;
  mode: 'light' | 'dark' | 'illuminated' | 'system';
  preferences: Record<string, unknown>;
  createdAt: Date;
}

export interface IdentityProfile {
  id: string;
  userId: string;
  publicBio: string;
  privateBio: string;
  values: string[];
  focusThemes: string[];
  privacyMode: 'public' | 'private' | 'anonymous' | 'guest';
}

export interface LifeGraphNode {
  id: string;
  type: 'interest' | 'habit' | 'skill' | 'brand' | 'creator' | 'genre' | 'rhythm';
  label: string;
  strength: number;
}

export interface DigitalTwinSuggestion {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  confidence: number;
}

// ============ Commerce ============
export interface Product {
  id: string;
  providerId: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  url: string;
  imageUrl: string;
  rating: number;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  config?: Record<string, unknown>;
}

export interface Order {
  id: string;
  userId: string;
  cartItems: CartItem[];
  totalCents: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

// ============ Learning ============
export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number;
  lessonsCount: number;
  sourceUrl?: string;
  createdAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  position: number;
  duration: number;
  description?: string;
  mediaUrl?: string;
}

export interface LearningProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progressPercent: number;
  lastAccessedAt: Date;
}

// ============ Productivity ============
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignee?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: Date;
  tags: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startsAt: Date;
  durationMinutes: number;
  location?: string;
  type: 'meeting' | 'focus' | 'event' | 'personal';
}

// ============ Home Lists ============
export interface WatchlistItem {
  id: string;
  title: string;
  provider: string;
  type: 'movie' | 'series' | 'video';
  progressPercent?: number;
}

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  source: string;
  progressPercent?: number;
}

export interface ShoppingItem {
  id: string;
  title: string;
  providerId: string;
  priceCents: number;
  priority: 'low' | 'medium' | 'high';
}

// ============ Security ============
export interface Device {
  id: string;
  name: string;
  location: string;
  lastActiveAt: Date;
  status: 'trusted' | 'new' | 'revoked';
}

export interface SecuritySession {
  id: string;
  deviceId: string;
  ipAddress: string;
  startedAt: Date;
  status: 'active' | 'expired';
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'device' | 'alert' | 'policy';
  description: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface SecurityPolicy {
  id: string;
  title: string;
  status: 'enabled' | 'disabled';
  lastUpdated: Date;
}

// ============ Accessibility ============
export interface AccessibilitySetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// ============ Travel & Navigation ============
export interface Trip {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  budgetCents: number;
}

export interface PackingItem {
  id: string;
  tripId: string;
  label: string;
  packed: boolean;
}

export interface BudgetCategory {
  id: string;
  tripId: string;
  label: string;
  budgetCents: number;
  spentCents: number;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  title: string;
  time: string;
  location: string;
  type: 'flight' | 'hotel' | 'experience' | 'meal' | 'transfer';
}

export interface SavedPlace {
  id: string;
  name: string;
  category: 'work' | 'home' | 'favorite' | 'trip';
  address: string;
}

export interface RouteSuggestion {
  id: string;
  from: string;
  to: string;
  durationMinutes: number;
  distanceMiles: number;
  mode: 'drive' | 'transit' | 'walk' | 'ride';
}

// ============ Economy ============
export interface MarketplaceListing {
  id: string;
  title: string;
  category: 'templates' | 'components' | 'surfaces' | 'brand-packs' | 'courses' | 'plugins';
  priceCents: number;
  creator: string;
  rating: number;
}

export interface CreatorPayout {
  id: string;
  creator: string;
  amountCents: number;
  status: 'pending' | 'processing' | 'paid';
  scheduledFor: Date;
}

// ============ Developer ============
export interface PluginPackage {
  id: string;
  name: string;
  description: string;
  version: string;
  installs: number;
  status: 'active' | 'deprecated' | 'beta';
}

export interface ApiKey {
  id: string;
  label: string;
  createdAt: Date;
  lastUsedAt?: Date;
  status: 'active' | 'revoked';
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'paused';
}

// ============ AI Universe ============
export interface AiModel {
  id: string;
  name: string;
  provider: 'claude' | 'gpt' | 'palm' | 'aurora-native';
  capability: 'reasoning' | 'generation' | 'analysis' | 'synthesis';
  performanceScore: number;
  costPerRequest: number;
}

export interface AiConversation {
  id: string;
  modelId: string;
  title: string;
  messageCount: number;
  status: 'active' | 'archived';
  createdAt: Date;
  lastMessageAt: Date;
}

export interface AiAgent {
  id: string;
  name: string;
  modelId: string;
  purpose: string;
  taskCount: number;
  accuracy: number;
  status: 'active' | 'training' | 'inactive';
}

// ============ Finance Universe ============
export interface FinanceAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balanceCents: number;
  currency: string;
  provider: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amountCents: number;
  category: 'income' | 'expense' | 'transfer' | 'investment';
  date: Date;
  status: 'pending' | 'posted';
}

export interface FinanceBudget {
  id: string;
  name: string;
  category: string;
  limitCents: number;
  spentCents: number;
  month: string;
}

export interface Investment {
  id: string;
  symbol: string;
  shares: number;
  costBasis: number;
  currentValue: number;
  gainLoss: number;
  lastUpdated: Date;
}

export interface FinanceInsight {
  id: string;
  type: 'saving' | 'spending' | 'investment' | 'opportunity';
  title: string;
  description: string;
  actions: string[];
  priority: 'low' | 'medium' | 'high';
}

// ============ Health & Wellness Universe ============
export interface HealthVital {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'temperature' | 'oxygen';
  value: number;
  unit: string;
  recordedAt: Date;
}

export interface Activity {
  id: string;
  type: 'walk' | 'run' | 'cycle' | 'swim' | 'yoga' | 'gym';
  duration: number;
  caloriesBurned: number;
  distance: number;
  date: Date;
}

export interface HealthGoal {
  id: string;
  category: 'fitness' | 'nutrition' | 'sleep' | 'stress' | 'hydration';
  target: string;
  currentProgress: number;
  deadline: Date;
  status: 'active' | 'completed' | 'abandoned';
}

export interface NutritionEntry {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: string[];
  caloriesEstimated: number;
}

export interface SleepRecord {
  id: string;
  date: Date;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  deepSleepPercent: number;
}

// ============ Home Control Universe ============
export interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'speaker' | 'outlet';
  room: string;
  status: 'online' | 'offline';
  battery?: number;
  lastSeen: Date;
}

export interface HomeScene {
  id: string;
  name: string;
  description: string;
  devices: string[];
  actions: DeviceAction[];
  triggeredCount: number;
}

export interface DeviceAction {
  deviceId: string;
  action: string;
  value?: string | number | boolean;
}

export interface SmartAutomation {
  id: string;
  name: string;
  trigger: 'time' | 'location' | 'temperature' | 'motion' | 'custom';
  triggerCondition: string;
  actions: DeviceAction[];
  enabled: boolean;
}

export interface EnergyUsage {
  id: string;
  timestamp: Date;
  powerUsageWatts: number;
  costEstimate: number;
  deviceBreakdown: Record<string, number>;
}

// ============ Automation & Agents Universe ============
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'archived';
  nextRun?: Date;
  executionCount: number;
  successRate: number;
}

export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  type: 'schedule' | 'event' | 'webhook' | 'manual';
  condition: string;
}

export interface WorkflowAction {
  id: string;
  workflowId: string;
  order: number;
  type: 'notification' | 'api-call' | 'data-process' | 'integration';
  config: Record<string, unknown>;
}

export interface BotInstance {
  id: string;
  name: string;
  workflowId: string;
  capability: 'scheduling' | 'monitoring' | 'processing' | 'integration';
  uptime: number;
  tasksCompleted: number;
  lastExecuted: Date;
}

// ============ Creative (Create) ============
export interface Surface {
  id: string;
  ownerUserId: string;
  title: string;
  type: string;
  blocks: Block[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Block {
  id: string;
  kind:
    | 'hero'
    | 'text'
    | 'media'
    | 'features'
    | 'testimonials'
    | 'cta'
    | 'faq'
    | 'pricing';
  position: number;
  content: Record<string, unknown>;
}

// ============ Brand Universe ============
export interface BrandProfile {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  story: string;
  values: string[];
  tone: string;
  archetype: string;
  vocabulary: string[];
  createdAt: Date;
}

export interface BrandAsset {
  id: string;
  brandId: string;
  label: string;
  kind: 'logo' | 'palette' | 'type' | 'icon' | 'image' | 'template';
  updatedAt: Date;
}

export interface BrandCampaign {
  id: string;
  brandId: string;
  title: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  channel: 'web' | 'social' | 'email' | 'product';
  startsAt: Date;
  endsAt?: Date;
}

// ============ Communities ============
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: 'public' | 'private';
  createdAt: Date;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
}

export interface Post {
  id: string;
  communityId: string;
  authorUserId: string;
  title: string;
  body: string;
  media?: string[];
  createdAt: Date;
  likes: number;
  comments: number;
}

// ============ Social ============
export interface SocialProfile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  verified: boolean;
  followers: number;
  bio: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  body: string;
  platform: 'aurora' | 'instagram' | 'tiktok' | 'x' | 'reddit' | 'linkedin';
  mediaType?: 'image' | 'video' | 'link';
  mediaUrl?: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: Date;
}

export interface SocialChannel {
  id: string;
  name: string;
  description: string;
  members: number;
  isLive: boolean;
}

// ============ Entertainment ============
export interface MediaItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'podcast' | 'live';
  provider: string;
  durationMinutes: number;
  rating: number;
  imageUrl: string;
  tags: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  mood: 'focus' | 'energize' | 'calm' | 'deep' | 'joy';
  items: string[];
  coverUrl: string;
}

// ============ Gaming ============
export interface Game {
  id: string;
  title: string;
  platform: 'pc' | 'console' | 'cloud' | 'mobile';
  hoursPlayed: number;
  status: 'playing' | 'queued' | 'completed';
  lastPlayedAt: Date;
}

export interface GameClip {
  id: string;
  gameId: string;
  title: string;
  durationSeconds: number;
  highlights: string[];
  createdAt: Date;
}

export interface GameTournament {
  id: string;
  title: string;
  gameId: string;
  status: 'upcoming' | 'live' | 'completed';
  startsAt: Date;
  participants: number;
}

export interface LeaderboardEntry {
  id: string;
  gameId: string;
  player: string;
  rank: number;
  score: number;
  change: 'up' | 'down' | 'steady';
}

// ============ Realms ============
export interface Realm {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  features: string[];
  sessionDurations: number[];
}

export interface RealmSession {
  id: string;
  userId: string;
  realmId: string;
  durationMinutes: number;
  startedAt: Date;
  endedAt: Date;
  notes?: string;
}

// ============ Mock Data Generators ============

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'founder@aurora.app',
    displayName: 'Aurora Founder',
    avatarUrl: '/avatars/founder.png',
    createdAt: new Date('2025-11-01'),
  },
];

export const mockPersonas: Persona[] = [
  {
    id: 'persona-creator',
    userId: 'user-1',
    name: 'Creator',
    mode: 'illuminated',
    preferences: { focus: 'creative', theme: 'creative' },
    createdAt: new Date('2025-12-01'),
  },
  {
    id: 'persona-professional',
    userId: 'user-1',
    name: 'Professional',
    mode: 'light',
    preferences: { focus: 'productivity', theme: 'office' },
    createdAt: new Date('2025-12-10'),
  },
  {
    id: 'persona-learner',
    userId: 'user-1',
    name: 'Learner',
    mode: 'dark',
    preferences: { focus: 'learning', theme: 'lifestyle' },
    createdAt: new Date('2025-12-15'),
  },
];

export const mockIdentityProfile: IdentityProfile = {
  id: 'identity-1',
  userId: 'user-1',
  publicBio: 'Founder building a calm, beautifully designed digital world.',
  privateBio: 'Values clarity, deep work, and humane technology.',
  values: ['Clarity', 'Beauty', 'Integrity', 'Humanity', 'Wonder'],
  focusThemes: ['creative', 'office', 'lifestyle'],
  privacyMode: 'public',
};

export const mockLifeGraph: LifeGraphNode[] = [
  { id: 'lg-1', type: 'interest', label: 'Design Systems', strength: 0.9 },
  { id: 'lg-2', type: 'skill', label: 'Product Strategy', strength: 0.85 },
  { id: 'lg-3', type: 'habit', label: 'Morning Focus Ritual', strength: 0.78 },
  { id: 'lg-4', type: 'genre', label: 'Ambient Music', strength: 0.7 },
  { id: 'lg-5', type: 'brand', label: 'Aurora', strength: 1.0 },
  { id: 'lg-6', type: 'creator', label: 'Luma', strength: 0.6 },
  { id: 'lg-7', type: 'rhythm', label: 'Evening Reflection', strength: 0.66 },
];

// ============ Brand Universe Mock Data ============

export const mockBrands: BrandProfile[] = [
  {
    id: 'brand-aurora',
    ownerUserId: 'user-1',
    name: 'Aurora',
    slug: 'aurora',
    story: 'A calm, beautifully designed digital world that helps people create, learn, and live with clarity.',
    values: ['Clarity', 'Beauty', 'Integrity', 'Humanity', 'Wonder'],
    tone: 'Warm, mythic, honest',
    archetype: 'Visionary Guide',
    vocabulary: ['clarity', 'light', 'flow', 'home', 'craft', 'trust'],
    createdAt: new Date('2025-11-01'),
  },
];

export const mockBrandAssets: BrandAsset[] = [
  {
    id: 'asset-1',
    brandId: 'brand-aurora',
    label: 'Primary Logo',
    kind: 'logo',
    updatedAt: new Date('2026-01-10'),
  },
  {
    id: 'asset-2',
    brandId: 'brand-aurora',
    label: 'Core Palette',
    kind: 'palette',
    updatedAt: new Date('2026-01-12'),
  },
  {
    id: 'asset-3',
    brandId: 'brand-aurora',
    label: 'Primary Typeface',
    kind: 'type',
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'asset-4',
    brandId: 'brand-aurora',
    label: 'Icon Set',
    kind: 'icon',
    updatedAt: new Date('2026-02-01'),
  },
];

export const mockBrandCampaigns: BrandCampaign[] = [
  {
    id: 'campaign-1',
    brandId: 'brand-aurora',
    title: 'Aurora Rv.0 Launch',
    status: 'active',
    channel: 'web',
    startsAt: new Date('2026-02-01'),
  },
  {
    id: 'campaign-2',
    brandId: 'brand-aurora',
    title: 'Creator Spotlight Series',
    status: 'draft',
    channel: 'social',
    startsAt: new Date('2026-03-01'),
  },
  {
    id: 'campaign-3',
    brandId: 'brand-aurora',
    title: 'Ethical AI Principles',
    status: 'paused',
    channel: 'email',
    startsAt: new Date('2026-01-20'),
  },
];

export const mockDigitalTwinSuggestions: DigitalTwinSuggestion[] = [
  {
    id: 'dt-1',
    title: 'Plan a Focus Sprint',
    description: 'Schedule a 45-minute Focus Realm session based on your recent rhythm.',
    actionLabel: 'Start Focus Sprint',
    confidence: 0.92,
  },
  {
    id: 'dt-2',
    title: 'Refine Today\'s Surface',
    description: 'Your latest Create surface could benefit from a simplified CTA block.',
    actionLabel: 'Open in Create',
    confidence: 0.81,
  },
  {
    id: 'dt-3',
    title: 'Curate Evening Wind Down',
    description: 'Queue a calm playlist and a reflection prompt for tonight.',
    actionLabel: 'Set Evening Ritual',
    confidence: 0.76,
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design Social Universe feed layout',
    description: 'Finalize card layout and spacing for the feed.',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2026-02-16'),
    assignee: 'Aurora Founder',
  },
  {
    id: 'task-2',
    title: 'Draft onboarding narrative',
    status: 'backlog',
    priority: 'medium',
  },
  {
    id: 'task-3',
    title: 'Review design tokens for accessibility',
    status: 'review',
    priority: 'high',
  },
  {
    id: 'task-4',
    title: 'Publish Aurora weekly update',
    status: 'done',
    priority: 'low',
  },
  {
    id: 'task-5',
    title: 'Integrate entertainment providers list',
    status: 'in-progress',
    priority: 'medium',
  },
];

export const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Aurora Voice & Tone',
    body: 'Warm, minimal, calm. Slightly mythic but always clear and grounded.',
    updatedAt: new Date('2026-02-12'),
    tags: ['tone', 'brand'],
  },
  {
    id: 'note-2',
    title: 'Productivity rituals',
    body: 'Morning: Focus Realm 45m. Evening: Reflection Realm 20m + journal.',
    updatedAt: new Date('2026-02-11'),
    tags: ['rituals', 'focus'],
  },
  {
    id: 'note-3',
    title: 'Feature backlog',
    body: 'Social integrations, media embeddings, wallet UI, brand brain v2.',
    updatedAt: new Date('2026-02-10'),
    tags: ['backlog'],
  },
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Aurora Design Review',
    startsAt: new Date('2026-02-13T15:00:00Z'),
    durationMinutes: 60,
    location: 'Aurora HQ',
    type: 'meeting',
  },
  {
    id: 'event-2',
    title: 'Focus Sprint',
    startsAt: new Date('2026-02-13T18:00:00Z'),
    durationMinutes: 45,
    type: 'focus',
  },
  {
    id: 'event-3',
    title: 'Guilds Livestream',
    startsAt: new Date('2026-02-14T20:00:00Z'),
    durationMinutes: 90,
    type: 'event',
  },
];

export const mockWatchlist: WatchlistItem[] = [
  {
    id: 'watch-1',
    title: 'Aurora Originals: The First Light',
    provider: 'Aurora',
    type: 'movie',
    progressPercent: 20,
  },
  {
    id: 'watch-2',
    title: 'Designing Calm Interfaces',
    provider: 'YouTube',
    type: 'video',
    progressPercent: 65,
  },
  {
    id: 'watch-3',
    title: 'Guild Sanctuaries',
    provider: 'Netflix',
    type: 'series',
  },
];

export const mockReadingList: ReadingItem[] = [
  {
    id: 'read-1',
    title: 'The Ethics of Calm Technology',
    author: 'M. Holloway',
    source: 'Aurora Library',
    progressPercent: 40,
  },
  {
    id: 'read-2',
    title: 'Designing for Flow',
    author: 'R. Chen',
    source: 'Medium',
    progressPercent: 10,
  },
  {
    id: 'read-3',
    title: 'Spatial Interfaces in 2026',
    author: 'A. Rivera',
    source: 'Substack',
  },
];

export const mockShoppingList: ShoppingItem[] = [
  {
    id: 'shop-1',
    title: 'Minimal Desk Setup Kit',
    providerId: 'amazon',
    priceCents: 18900,
    priority: 'high',
  },
  {
    id: 'shop-2',
    title: 'Noise Cancelling Headphones',
    providerId: 'bestbuy',
    priceCents: 24999,
    priority: 'medium',
  },
  {
    id: 'shop-3',
    title: 'Soft Ambient Lamp',
    providerId: 'etsy',
    priceCents: 7200,
    priority: 'low',
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Security check completed',
    body: 'Your last login was verified successfully.',
    kind: 'security',
    read: false,
    createdAt: new Date('2026-02-13T11:20:00Z'),
  },
  {
    id: 'notif-2',
    title: 'Learning path updated',
    body: 'A new lesson was added to TypeScript for Professionals.',
    kind: 'reminder',
    read: true,
    createdAt: new Date('2026-02-12T18:05:00Z'),
  },
  {
    id: 'notif-3',
    title: 'Guilds weekly summit',
    body: 'Aurora Builders live session starts in 2 hours.',
    kind: 'community',
    read: false,
    createdAt: new Date('2026-02-13T15:30:00Z'),
  },
];

export const mockLearningTimeline: LearningTimelineItem[] = [
  {
    id: 'lt-1',
    title: 'Completed Lesson 6: Interfaces',
    courseId: '3',
    percent: 45,
    dateLabel: 'Today',
  },
  {
    id: 'lt-2',
    title: 'Completed Lesson 14: Query patterns',
    courseId: '5',
    percent: 60,
    dateLabel: 'Yesterday',
  },
  {
    id: 'lt-3',
    title: 'Started System Design at Scale',
    courseId: '6',
    percent: 15,
    dateLabel: '2 days ago',
  },
];

export const mockDevices: Device[] = [
  {
    id: 'device-1',
    name: 'Aurora Studio MacBook',
    location: 'Toronto, CA',
    lastActiveAt: new Date('2026-02-13T13:00:00Z'),
    status: 'trusted',
  },
  {
    id: 'device-2',
    name: 'iPhone 16 Pro',
    location: 'Toronto, CA',
    lastActiveAt: new Date('2026-02-13T12:45:00Z'),
    status: 'trusted',
  },
  {
    id: 'device-3',
    name: 'Windows Surface',
    location: 'New York, US',
    lastActiveAt: new Date('2026-02-12T20:20:00Z'),
    status: 'new',
  },
];

export const mockSecuritySessions: SecuritySession[] = [
  {
    id: 'session-1',
    deviceId: 'device-1',
    ipAddress: '192.168.0.4',
    startedAt: new Date('2026-02-13T09:00:00Z'),
    status: 'active',
  },
  {
    id: 'session-2',
    deviceId: 'device-2',
    ipAddress: '192.168.0.6',
    startedAt: new Date('2026-02-13T10:15:00Z'),
    status: 'active',
  },
  {
    id: 'session-3',
    deviceId: 'device-3',
    ipAddress: '10.1.0.9',
    startedAt: new Date('2026-02-12T19:20:00Z'),
    status: 'expired',
  },
];

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'event-1',
    type: 'device',
    description: 'New device login detected in New York, US.',
    severity: 'medium',
    createdAt: new Date('2026-02-12T19:21:00Z'),
  },
  {
    id: 'event-2',
    type: 'login',
    description: 'Successful login from Aurora Studio MacBook.',
    severity: 'low',
    createdAt: new Date('2026-02-13T09:02:00Z'),
  },
  {
    id: 'event-3',
    type: 'alert',
    description: 'Password updated for Aurora Founder account.',
    severity: 'high',
    createdAt: new Date('2026-02-11T14:11:00Z'),
  },
];

export const mockSecurityPolicies: SecurityPolicy[] = [
  {
    id: 'policy-1',
    title: 'Multi-factor authentication',
    status: 'enabled',
    lastUpdated: new Date('2026-01-20T09:00:00Z'),
  },
  {
    id: 'policy-2',
    title: 'Device approval required',
    status: 'enabled',
    lastUpdated: new Date('2026-02-05T12:30:00Z'),
  },
  {
    id: 'policy-3',
    title: 'Session timeout (30m)',
    status: 'disabled',
    lastUpdated: new Date('2026-01-15T08:15:00Z'),
  },
];

export const mockAccessibilitySettings: AccessibilitySetting[] = [
  {
    id: 'access-1',
    label: 'High Contrast Mode',
    description: 'Increase contrast for improved readability.',
    enabled: false,
  },
  {
    id: 'access-2',
    label: 'Large Text',
    description: 'Increase base font size across the interface.',
    enabled: true,
  },
  {
    id: 'access-3',
    label: 'Reduced Motion',
    description: 'Minimize animations and motion effects.',
    enabled: false,
  },
  {
    id: 'access-4',
    label: 'Screen Reader Optimized',
    description: 'Enhance ARIA labels and navigation cues.',
    enabled: true,
  },
  {
    id: 'access-5',
    label: 'Simplified UI',
    description: 'Reduce UI density for easier navigation.',
    enabled: false,
  },
];

export const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    destination: 'Tokyo, Japan',
    startDate: new Date('2026-03-05'),
    endDate: new Date('2026-03-14'),
    status: 'upcoming',
    budgetCents: 320000,
  },
  {
    id: 'trip-2',
    destination: 'New York, USA',
    startDate: new Date('2026-02-20'),
    endDate: new Date('2026-02-24'),
    status: 'upcoming',
    budgetCents: 180000,
  },
];

export const mockPackingList: PackingItem[] = [
  { id: 'pack-1', tripId: 'trip-2', label: 'Passport', packed: true },
  { id: 'pack-2', tripId: 'trip-2', label: 'Noise-canceling headphones', packed: false },
  { id: 'pack-3', tripId: 'trip-2', label: 'Travel charger', packed: false },
  { id: 'pack-4', tripId: 'trip-2', label: 'Notebook + pen', packed: true },
];

export const mockBudgetCategories: BudgetCategory[] = [
  { id: 'budget-1', tripId: 'trip-2', label: 'Flights', budgetCents: 60000, spentCents: 54000 },
  { id: 'budget-2', tripId: 'trip-2', label: 'Hotels', budgetCents: 70000, spentCents: 35000 },
  { id: 'budget-3', tripId: 'trip-2', label: 'Experiences', budgetCents: 30000, spentCents: 8000 },
  { id: 'budget-4', tripId: 'trip-2', label: 'Food', budgetCents: 20000, spentCents: 5000 },
];

export const mockItinerary: ItineraryItem[] = [
  {
    id: 'it-1',
    tripId: 'trip-2',
    title: 'Flight to JFK',
    time: '08:30',
    location: 'YYZ → JFK',
    type: 'flight',
  },
  {
    id: 'it-2',
    tripId: 'trip-2',
    title: 'Hotel Check-in',
    time: '14:00',
    location: 'SoHo Hotel',
    type: 'hotel',
  },
  {
    id: 'it-3',
    tripId: 'trip-2',
    title: 'Museum Visit',
    time: '16:30',
    location: 'MoMA',
    type: 'experience',
  },
];

export const mockSavedPlaces: SavedPlace[] = [
  {
    id: 'place-1',
    name: 'Aurora HQ',
    category: 'work',
    address: '144 Front St W, Toronto, CA',
  },
  {
    id: 'place-2',
    name: 'Home Base',
    category: 'home',
    address: '23 King St E, Toronto, CA',
  },
  {
    id: 'place-3',
    name: 'Focus Cafe',
    category: 'favorite',
    address: '128 Queen St W, Toronto, CA',
  },
];

export const mockRoutes: RouteSuggestion[] = [
  {
    id: 'route-1',
    from: 'Aurora HQ',
    to: 'Home Base',
    durationMinutes: 24,
    distanceMiles: 8.4,
    mode: 'drive',
  },
  {
    id: 'route-2',
    from: 'Home Base',
    to: 'Focus Cafe',
    durationMinutes: 18,
    distanceMiles: 4.2,
    mode: 'transit',
  },
  {
    id: 'route-3',
    from: 'Aurora HQ',
    to: 'Focus Cafe',
    durationMinutes: 12,
    distanceMiles: 2.6,
    mode: 'walk',
  },
];

export const mockMarketplaceListings: MarketplaceListing[] = [
  {
    id: 'market-1',
    title: 'Lumen Landing Template',
    category: 'templates',
    priceCents: 4900,
    creator: 'Aurora Studio',
    rating: 4.9,
  },
  {
    id: 'market-2',
    title: 'Minimal Card Component Kit',
    category: 'components',
    priceCents: 2900,
    creator: 'Alex Rivera',
    rating: 4.7,
  },
  {
    id: 'market-3',
    title: 'Guilds Community Surface',
    category: 'surfaces',
    priceCents: 5900,
    creator: 'Luma',
    rating: 4.8,
  },
  {
    id: 'market-4',
    title: 'Aurora Brand Pack',
    category: 'brand-packs',
    priceCents: 9900,
    creator: 'Aurora Studio',
    rating: 4.9,
  },
  {
    id: 'market-5',
    title: 'Motion Tokens Course',
    category: 'courses',
    priceCents: 12900,
    creator: 'Studio North',
    rating: 4.6,
  },
  {
    id: 'market-6',
    title: 'Automation Agent Toolkit',
    category: 'plugins',
    priceCents: 14900,
    creator: 'Create Labs',
    rating: 4.5,
  },
];

export const mockCreatorPayouts: CreatorPayout[] = [
  {
    id: 'payout-1',
    creator: 'Aurora Studio',
    amountCents: 182400,
    status: 'paid',
    scheduledFor: new Date('2026-02-10'),
  },
  {
    id: 'payout-2',
    creator: 'Alex Rivera',
    amountCents: 25400,
    status: 'processing',
    scheduledFor: new Date('2026-02-14'),
  },
  {
    id: 'payout-3',
    creator: 'Studio North',
    amountCents: 11400,
    status: 'pending',
    scheduledFor: new Date('2026-02-18'),
  },
];

export const mockPlugins: PluginPackage[] = [
  {
    id: 'plugin-1',
    name: 'Aurora Analytics Panel',
    description: 'Embed usage insights and retention charts.',
    version: '1.4.2',
    installs: 12040,
    status: 'active',
  },
  {
    id: 'plugin-2',
    name: 'Guilds Events Sync',
    description: 'Sync external calendars to Aurora events.',
    version: '0.9.8',
    installs: 4820,
    status: 'beta',
  },
  {
    id: 'plugin-3',
    name: 'Commerce Price Tracker',
    description: 'Automated price monitoring across providers.',
    version: '2.1.0',
    installs: 17320,
    status: 'active',
  },
];

export const mockApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    label: 'Aurora Builder',
    createdAt: new Date('2026-01-10'),
    lastUsedAt: new Date('2026-02-13T10:00:00Z'),
    status: 'active',
  },
  {
    id: 'key-2',
    label: 'Marketplace Sync',
    createdAt: new Date('2026-01-22'),
    lastUsedAt: new Date('2026-02-12T19:30:00Z'),
    status: 'active',
  },
  {
    id: 'key-3',
    label: 'Legacy Key',
    createdAt: new Date('2025-11-05'),
    status: 'revoked',
  },
];

export const mockWebhooks: WebhookEndpoint[] = [
  {
    id: 'hook-1',
    url: 'https://studio.aurora.app/webhooks/orders',
    events: ['commerce.order.created', 'commerce.order.updated'],
    status: 'active',
  },
  {
    id: 'hook-2',
    url: 'https://builder.aurora.app/webhooks/surfaces',
    events: ['create.surface.published'],
    status: 'paused',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    providerId: 'amazon',
    title: 'Wireless Headphones Pro',
    description: 'High-quality wireless headphones with noise cancellation',
    priceCents: 29999,
    currency: 'USD',
    url: 'https://amazon.com/headphones',
    imageUrl: '/products/headphones.jpg',
    rating: 4.8,
    createdAt: new Date('2026-02-01'),
  },
  {
    id: '2',
    providerId: 'shopify',
    title: 'Premium Mechanical Keyboard',
    description: 'Custom mechanical keyboard with RGB lighting',
    priceCents: 15999,
    currency: 'USD',
    url: 'https://shopify.com/keyboard',
    imageUrl: '/products/keyboard.jpg',
    rating: 4.6,
    createdAt: new Date('2026-02-01'),
  },
  {
    id: '3',
    providerId: 'amazon',
    title: '4K USB Camera',
    description: 'Ultra HD webcam with studio lighting support',
    priceCents: 14999,
    currency: 'USD',
    url: 'https://amazon.com/camera',
    imageUrl: '/products/camera.jpg',
    rating: 4.5,
    createdAt: new Date('2026-02-03'),
  },
  {
    id: '4',
    providerId: 'etsy',
    title: 'Ergonomic Desk Lamp',
    description: 'Adjustable warm light desk lamp for focus sessions',
    priceCents: 7999,
    currency: 'USD',
    url: 'https://etsy.com/lamp',
    imageUrl: '/products/lamp.jpg',
    rating: 4.7,
    createdAt: new Date('2026-02-05'),
  },
  {
    id: '5',
    providerId: 'amazon',
    title: 'Portable SSD 1TB',
    description: 'High-speed storage for creative projects',
    priceCents: 9999,
    currency: 'USD',
    url: 'https://amazon.com/ssd',
    imageUrl: '/products/ssd.jpg',
    rating: 4.9,
    createdAt: new Date('2026-02-07'),
  },
  {
    id: '6',
    providerId: 'walmart',
    title: 'Desk Organizer Set',
    description: 'Minimal workspace organizer with trays',
    priceCents: 3999,
    currency: 'USD',
    url: 'https://walmart.com/organizer',
    imageUrl: '/products/organizer.jpg',
    rating: 4.4,
    createdAt: new Date('2026-02-10'),
  },
];

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Web Design Fundamentals',
    description: 'Learn responsive web design and accessibility',
    level: 'beginner',
    durationHours: 8,
    lessonsCount: 24,
    sourceUrl: 'https://udemy.com/course-1',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master complex React patterns and optimization',
    level: 'advanced',
    durationHours: 12,
    lessonsCount: 36,
    sourceUrl: 'https://coursera.com/course-2',
    createdAt: new Date('2026-01-20'),
  },
  {
    id: '3',
    title: 'TypeScript for Professionals',
    description: 'Build robust, scalable applications with TypeScript',
    level: 'intermediate',
    durationHours: 10,
    lessonsCount: 30,
    sourceUrl: 'https://skillshare.com/course-3',
    createdAt: new Date('2026-01-22'),
  },
  {
    id: '4',
    title: 'UI/UX Design Workshop',
    description: 'Design interfaces with clarity and accessibility',
    level: 'intermediate',
    durationHours: 6,
    lessonsCount: 18,
    sourceUrl: 'https://udemy.com/course-4',
    createdAt: new Date('2026-01-25'),
  },
  {
    id: '5',
    title: 'Database Design Essentials',
    description: 'Relational and NoSQL design patterns',
    level: 'beginner',
    durationHours: 9,
    lessonsCount: 27,
    sourceUrl: 'https://coursera.com/course-5',
    createdAt: new Date('2026-01-28'),
  },
  {
    id: '6',
    title: 'System Design at Scale',
    description: 'Architect distributed systems for millions of users',
    level: 'advanced',
    durationHours: 14,
    lessonsCount: 42,
    sourceUrl: 'https://pluralsight.com/course-6',
    createdAt: new Date('2026-02-01'),
  },
];

export const mockCourseProgress: Array<{ courseId: string; progress: number }> = [
  { courseId: '3', progress: 45 },
  { courseId: '5', progress: 60 },
  { courseId: '6', progress: 15 },
];

export const mockRealms: Realm[] = [
  {
    id: 'focus',
    name: 'Focus',
    icon: '🎯',
    description: 'Deep work environment with minimal distractions',
    color: 'from-blue-500 to-cyan-500',
    features: ['Distraction-free', 'Timer-based sessions', 'Progress tracking'],
    sessionDurations: [25, 45, 90],
  },
  {
    id: 'creation',
    name: 'Creation',
    icon: '🎨',
    description: 'Creative studio for ideation and expression',
    color: 'from-purple-500 to-pink-500',
    features: ['Inspiration board', 'Mood tracking', 'Project showcase'],
    sessionDurations: [30, 60, 120],
  },
  {
    id: 'reflection',
    name: 'Reflection',
    icon: '🌙',
    description: 'Quiet space for thinking and journaling',
    color: 'from-indigo-500 to-purple-500',
    features: ['Journal prompts', 'Mind mapping', 'Insights dashboard'],
    sessionDurations: [20, 40, 60],
  },
  {
    id: 'exploration',
    name: 'Exploration',
    icon: '🗺️',
    description: 'Curiosity-driven learning and discovery',
    color: 'from-green-500 to-emerald-500',
    features: ['Research tools', 'Knowledge graph', 'Idea connections'],
    sessionDurations: [30, 50, 90],
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    icon: '🤝',
    description: 'Shared spaces for teamwork and synchronous creativity',
    color: 'from-orange-500 to-red-500',
    features: ['Real-time editing', 'Presence awareness', 'Async summaries'],
    sessionDurations: [45, 60, 120],
  },
  {
    id: 'respite',
    name: 'Respite',
    icon: '🧘',
    description: 'Restorative environment for rest and wellness',
    color: 'from-rose-500 to-pink-500',
    features: ['Guided sessions', 'Ambient soundscape', 'Mood check-ins'],
    sessionDurations: [20, 35, 60],
  },
];

export const mockRealmUsage: Record<string, { minutes: number; timeLabel: string }> = {
  focus: { minutes: 263, timeLabel: '4h 23m this week' },
  creation: { minutes: 735, timeLabel: '12h 15m this week' },
  reflection: { minutes: 160, timeLabel: '2h 40m this week' },
  exploration: { minutes: 368, timeLabel: '6h 08m this week' },
  collaboration: { minutes: 512, timeLabel: '8h 32m this week' },
  respite: { minutes: 199, timeLabel: '3h 19m this week' },
};

export const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Aurora Builders',
    slug: 'aurora-builders',
    description: 'Community for people building with Aurora',
    visibility: 'public',
    createdAt: new Date('2025-12-01'),
  },
  {
    id: '2',
    name: 'Design Systems',
    slug: 'design-systems',
    description: 'Discussing design systems and component libraries',
    visibility: 'public',
    createdAt: new Date('2025-11-15'),
  },
];

export const mockCommunityPosts: Post[] = [
  {
    id: 'post-1',
    communityId: 'community-1',
    authorUserId: 'user-1',
    title: 'Designing the Home Universe daily brief',
    body: 'Sharing our latest structure for the daily brief surface and how it adapts to mood and schedule.',
    media: ['daily-brief.png'],
    createdAt: new Date('2026-02-12T10:30:00'),
    likes: 48,
    comments: 12,
  },
  {
    id: 'post-2',
    communityId: 'community-2',
    authorUserId: 'user-1',
    title: 'Learning path for creative founders',
    body: 'A new learning path that blends brand strategy, product thinking, and storytelling.',
    createdAt: new Date('2026-02-11T15:00:00'),
    likes: 32,
    comments: 8,
  },
  {
    id: 'post-3',
    communityId: 'community-3',
    authorUserId: 'user-1',
    title: 'Community challenge: build a calm UI',
    body: 'Weekly challenge is live. Share your calmest UI design and we will feature it.',
    createdAt: new Date('2026-02-10T09:15:00'),
    likes: 64,
    comments: 21,
  },
];

export const mockSocialProfiles: SocialProfile[] = [
  {
    id: '1',
    handle: 'aurora.studio',
    displayName: 'Aurora Studio',
    avatarUrl: '/avatars/aurora.png',
    verified: true,
    followers: 1284000,
    bio: 'Building a calm, beautifully designed digital world.',
  },
  {
    id: '2',
    handle: 'luma.guide',
    displayName: 'Luma',
    avatarUrl: '/avatars/luma.png',
    verified: true,
    followers: 248000,
    bio: 'A calm guide for focus, creativity, and clarity.',
  },
  {
    id: '3',
    handle: 'builder.alex',
    displayName: 'Alex Rivera',
    avatarUrl: '/avatars/alex.png',
    verified: false,
    followers: 9840,
    bio: 'Design systems, product thinking, and creative tools.',
  },
];

export const mockSocialPosts: SocialPost[] = [
  {
    id: '1',
    authorId: '1',
    body: 'Aurora Rv.0 just shipped new realms and the learning universe. More to come soon.',
    platform: 'aurora',
    mediaType: 'image',
    mediaUrl: '/social/aurora-update.png',
    tags: ['update', 'realms', 'learning'],
    likes: 14820,
    comments: 642,
    createdAt: new Date('2026-02-12T18:00:00Z'),
  },
  {
    id: '2',
    authorId: '2',
    body: 'Try the Focus Realm with a 45-minute session for deep flow. Your future self will thank you.',
    platform: 'aurora',
    tags: ['focus', 'flow', 'rituals'],
    likes: 8920,
    comments: 311,
    createdAt: new Date('2026-02-12T08:30:00Z'),
  },
  {
    id: '3',
    authorId: '3',
    body: 'Just built a new onboarding surface in Create. The block library feels incredible.',
    platform: 'linkedin',
    mediaType: 'link',
    mediaUrl: 'https://aurora.app/create',
    tags: ['create', 'design', 'product'],
    likes: 1230,
    comments: 88,
    createdAt: new Date('2026-02-11T16:15:00Z'),
  },
  {
    id: '4',
    authorId: '1',
    body: 'Community spotlight: Aurora Builders just hit 10k members. Thank you for shaping the future.',
    platform: 'aurora',
    tags: ['community', 'builders'],
    likes: 6720,
    comments: 214,
    createdAt: new Date('2026-02-10T20:00:00Z'),
  },
];

export const mockSocialChannels: SocialChannel[] = [
  {
    id: '1',
    name: 'Aurora Builders',
    description: 'Product and system design discussions',
    members: 10214,
    isLive: true,
  },
  {
    id: '2',
    name: 'Focus Rituals',
    description: 'Deep work sessions and weekly rituals',
    members: 4820,
    isLive: false,
  },
  {
    id: '3',
    name: 'Create Studio',
    description: 'Showcase surfaces and components',
    members: 6210,
    isLive: true,
  },
];

export const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    title: 'Aurora Originals: The First Light',
    type: 'video',
    provider: 'Aurora',
    durationMinutes: 42,
    rating: 4.9,
    imageUrl: '/media/first-light.jpg',
    tags: ['originals', 'documentary'],
  },
  {
    id: '2',
    title: 'Deep Focus Soundscape',
    type: 'audio',
    provider: 'Spotify',
    durationMinutes: 120,
    rating: 4.7,
    imageUrl: '/media/focus-soundscape.jpg',
    tags: ['focus', 'ambient'],
  },
  {
    id: '3',
    title: 'Live: Aurora Town Hall',
    type: 'live',
    provider: 'YouTube',
    durationMinutes: 90,
    rating: 4.6,
    imageUrl: '/media/town-hall.jpg',
    tags: ['live', 'community'],
  },
  {
    id: '4',
    title: 'Designing Calm Interfaces',
    type: 'podcast',
    provider: 'Apple Podcasts',
    durationMinutes: 55,
    rating: 4.8,
    imageUrl: '/media/calm-interfaces.jpg',
    tags: ['design', 'podcast'],
  },
  {
    id: '5',
    title: 'Aurora Originals: Guild Sanctuaries',
    type: 'video',
    provider: 'Aurora',
    durationMinutes: 28,
    rating: 4.5,
    imageUrl: '/media/guild-sanctuaries.jpg',
    tags: ['originals', 'story'],
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Focus Ritual',
    description: 'Deep work audio for long sessions',
    mood: 'focus',
    items: ['2', '4'],
    coverUrl: '/media/playlist-focus.jpg',
  },
  {
    id: '2',
    title: 'Evening Calm',
    description: 'Wind down with ambient and reflective content',
    mood: 'calm',
    items: ['4', '2'],
    coverUrl: '/media/playlist-calm.jpg',
  },
  {
    id: '3',
    title: 'Aurora Originals',
    description: 'Highlights from Aurora Studios',
    mood: 'joy',
    items: ['1', '5'],
    coverUrl: '/media/playlist-originals.jpg',
  },
];

// ============ Gaming Universe Mock Data ============

export const mockGames: Game[] = [
  {
    id: 'game-1',
    title: 'Skyforge Odyssey',
    platform: 'pc',
    hoursPlayed: 124,
    status: 'playing',
    lastPlayedAt: new Date('2026-02-12T19:45:00'),
  },
  {
    id: 'game-2',
    title: 'Lumen Drift',
    platform: 'console',
    hoursPlayed: 48,
    status: 'queued',
    lastPlayedAt: new Date('2026-02-01T20:10:00'),
  },
  {
    id: 'game-3',
    title: 'Aurora Arena',
    platform: 'cloud',
    hoursPlayed: 212,
    status: 'playing',
    lastPlayedAt: new Date('2026-02-13T21:05:00'),
  },
  {
    id: 'game-4',
    title: 'Calm Coastline',
    platform: 'mobile',
    hoursPlayed: 18,
    status: 'completed',
    lastPlayedAt: new Date('2026-01-28T08:20:00'),
  },
];

export const mockGameClips: GameClip[] = [
  {
    id: 'clip-1',
    gameId: 'game-1',
    title: 'Cliffside run - no damage',
    durationSeconds: 42,
    highlights: ['Precision', 'Speed', 'No damage'],
    createdAt: new Date('2026-02-12T20:15:00'),
  },
  {
    id: 'clip-2',
    gameId: 'game-3',
    title: 'Arena comeback win',
    durationSeconds: 58,
    highlights: ['Team clutch', 'Final round'],
    createdAt: new Date('2026-02-13T21:30:00'),
  },
  {
    id: 'clip-3',
    gameId: 'game-2',
    title: 'New build preview',
    durationSeconds: 36,
    highlights: ['Base setup', 'Layout'],
    createdAt: new Date('2026-02-02T18:00:00'),
  },
];

export const mockGameTournaments: GameTournament[] = [
  {
    id: 'tourney-1',
    title: 'Aurora Arena Invitational',
    gameId: 'game-3',
    status: 'live',
    startsAt: new Date('2026-02-14T17:00:00'),
    participants: 64,
  },
  {
    id: 'tourney-2',
    title: 'Skyforge Night Run',
    gameId: 'game-1',
    status: 'upcoming',
    startsAt: new Date('2026-02-18T19:00:00'),
    participants: 128,
  },
  {
    id: 'tourney-3',
    title: 'Lumen Drift Trials',
    gameId: 'game-2',
    status: 'completed',
    startsAt: new Date('2026-01-30T20:00:00'),
    participants: 42,
  },
];

export const mockLeaderboards: LeaderboardEntry[] = [
  {
    id: 'leader-1',
    gameId: 'game-3',
    player: 'NovaWraith',
    rank: 1,
    score: 12840,
    change: 'steady',
  },
  {
    id: 'leader-2',
    gameId: 'game-3',
    player: 'LumaPulse',
    rank: 2,
    score: 12420,
    change: 'up',
  },
  {
    id: 'leader-3',
    gameId: 'game-3',
    player: 'AuricTrail',
    rank: 3,
    score: 12110,
    change: 'down',
  },
  {
    id: 'leader-4',
    gameId: 'game-3',
    player: 'EchoRise',
    rank: 4,
    score: 11850,
    change: 'steady',
  },
];

// ============ AI Universe Mock Data ============

export const mockAiModels: AiModel[] = [
  {
    id: 'model-1',
    name: 'Aurora Reasoner',
    provider: 'aurora-native',
    capability: 'reasoning',
    performanceScore: 9.2,
    costPerRequest: 0.005,
  },
  {
    id: 'model-2',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    capability: 'generation',
    performanceScore: 8.9,
    costPerRequest: 0.003,
  },
  {
    id: 'model-3',
    name: 'GPT-4 Turbo',
    provider: 'gpt',
    capability: 'analysis',
    performanceScore: 8.7,
    costPerRequest: 0.01,
  },
  {
    id: 'model-4',
    name: 'Aurora Synthesis',
    provider: 'aurora-native',
    capability: 'synthesis',
    performanceScore: 8.5,
    costPerRequest: 0.002,
  },
];

export const mockAiConversations: AiConversation[] = [
  {
    id: 'conv-1',
    modelId: 'model-1',
    title: 'Product Strategy Discussion',
    messageCount: 34,
    status: 'active',
    createdAt: new Date('2026-02-10'),
    lastMessageAt: new Date('2026-02-13T14:30:00'),
  },
  {
    id: 'conv-2',
    modelId: 'model-2',
    title: 'Content Generation Session',
    messageCount: 12,
    status: 'active',
    createdAt: new Date('2026-02-12'),
    lastMessageAt: new Date('2026-02-13T10:15:00'),
  },
  {
    id: 'conv-3',
    modelId: 'model-3',
    title: 'Data Analysis Report December',
    messageCount: 8,
    status: 'archived',
    createdAt: new Date('2025-12-28'),
    lastMessageAt: new Date('2025-12-30T16:45:00'),
  },
];

export const mockAiAgents: AiAgent[] = [
  {
    id: 'agent-1',
    name: 'Customer Support Bot',
    modelId: 'model-2',
    purpose: 'Respond to customer inquiries with empathy',
    taskCount: 2847,
    accuracy: 0.94,
    status: 'active',
  },
  {
    id: 'agent-2',
    name: 'Content Moderator',
    modelId: 'model-1',
    purpose: 'Review and moderate user-generated content',
    taskCount: 5120,
    accuracy: 0.97,
    status: 'active',
  },
  {
    id: 'agent-3',
    name: 'Insight Generator',
    modelId: 'model-4',
    purpose: 'Surface novel insights from data patterns',
    taskCount: 891,
    accuracy: 0.89,
    status: 'training',
  },
];

// ============ Finance Universe Mock Data ============

export const mockFinanceAccounts: FinanceAccount[] = [
  {
    id: 'acc-1',
    name: 'Primary Checking',
    type: 'checking',
    balanceCents: 245680,
    currency: 'USD',
    provider: 'Aurora Bank',
  },
  {
    id: 'acc-2',
    name: 'Emergency Fund',
    type: 'savings',
    balanceCents: 500000,
    currency: 'USD',
    provider: 'Aurora Bank',
  },
  {
    id: 'acc-3',
    name: 'Growth Portfolio',
    type: 'investment',
    balanceCents: 15240000,
    currency: 'USD',
    provider: 'Wealthfront',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tr-1',
    accountId: 'acc-1',
    description: 'Coffee at Focus Cafe',
    amountCents: 425,
    category: 'expense',
    date: new Date('2026-02-13T10:30:00'),
    status: 'posted',
  },
  {
    id: 'tr-2',
    accountId: 'acc-1',
    description: 'Aurora Salary Deposit',
    amountCents: 750000,
    category: 'income',
    date: new Date('2026-02-13T06:00:00'),
    status: 'posted',
  },
  {
    id: 'tr-3',
    accountId: 'acc-1',
    description: 'Marketplace Plugin Purchase',
    amountCents: 2900,
    category: 'expense',
    date: new Date('2026-02-12T18:15:00'),
    status: 'posted',
  },
  {
    id: 'tr-4',
    accountId: 'acc-2',
    description: 'Transfer from Checking',
    amountCents: 100000,
    category: 'transfer',
    date: new Date('2026-02-11T09:00:00'),
    status: 'posted',
  },
];

export const mockFinanceBudgets: FinanceBudget[] = [
  {
    id: 'bud-1',
    name: 'Software & Tools',
    category: 'Technology',
    limitCents: 50000,
    spentCents: 34200,
    month: '2026-02',
  },
  {
    id: 'bud-2',
    name: 'Dining Out',
    category: 'Food',
    limitCents: 40000,
    spentCents: 28750,
    month: '2026-02',
  },
  {
    id: 'bud-3',
    name: 'Travel',
    category: 'Recreation',
    limitCents: 200000,
    spentCents: 0,
    month: '2026-02',
  },
];

export const mockInvestments: Investment[] = [
  {
    id: 'inv-1',
    symbol: 'AURX',
    shares: 150,
    costBasis: 305000,
    currentValue: 412500,
    gainLoss: 107500,
    lastUpdated: new Date('2026-02-13T16:00:00'),
  },
  {
    id: 'inv-2',
    symbol: 'TECH',
    shares: 42,
    costBasis: 210000,
    currentValue: 241800,
    gainLoss: 31800,
    lastUpdated: new Date('2026-02-13T16:00:00'),
  },
];

export const mockFinanceInsights: FinanceInsight[] = [
  {
    id: 'insight-1',
    type: 'saving',
    title: 'Spending Under Budget',
    description: 'You\'re tracking 28% under budget this month. Keep it up!',
    actions: ['View details', 'Adjust budget'],
    priority: 'low',
  },
  {
    id: 'insight-2',
    type: 'investment',
    title: 'Portfolio Gains Excellent',
    description: 'Your Growth Portfolio is up 26% YTD.',
    actions: ['Rebalance portfolio', 'View performance'],
    priority: 'medium',
  },
];

// ============ Health & Wellness Universe Mock Data ============

export const mockHealthVitals: HealthVital[] = [
  {
    id: 'vital-1',
    type: 'heart_rate',
    value: 68,
    unit: 'bpm',
    recordedAt: new Date('2026-02-13T08:00:00'),
  },
  {
    id: 'vital-2',
    type: 'blood_pressure',
    value: 120,
    unit: 'mmHg',
    recordedAt: new Date('2026-02-13T08:05:00'),
  },
  {
    id: 'vital-3',
    type: 'oxygen',
    value: 98,
    unit: '%',
    recordedAt: new Date('2026-02-13T08:10:00'),
  },
];

export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'run',
    duration: 35,
    caloriesBurned: 420,
    distance: 3.2,
    date: new Date('2026-02-13T06:00:00'),
  },
  {
    id: 'act-2',
    type: 'yoga',
    duration: 45,
    caloriesBurned: 180,
    distance: 0,
    date: new Date('2026-02-12T17:30:00'),
  },
  {
    id: 'act-3',
    type: 'swim',
    duration: 50,
    caloriesBurned: 520,
    distance: 1.5,
    date: new Date('2026-02-11T07:00:00'),
  },
];

export const mockHealthGoals: HealthGoal[] = [
  {
    id: 'goal-1',
    category: 'fitness',
    target: '10k steps daily',
    currentProgress: 8240,
    deadline: new Date('2026-12-31'),
    status: 'active',
  },
  {
    id: 'goal-2',
    category: 'sleep',
    target: '8 hours nightly',
    currentProgress: 92,
    deadline: new Date('2026-12-31'),
    status: 'active',
  },
  {
    id: 'goal-3',
    category: 'hydration',
    target: '3L water daily',
    currentProgress: 2200,
    deadline: new Date('2026-12-31'),
    status: 'active',
  },
];

export const mockNutritionEntries: NutritionEntry[] = [
  {
    id: 'nut-1',
    date: new Date('2026-02-13'),
    mealType: 'breakfast',
    items: ['Oatmeal with berries', 'Greek yogurt', 'Green tea'],
    caloriesEstimated: 380,
  },
  {
    id: 'nut-2',
    date: new Date('2026-02-13'),
    mealType: 'lunch',
    items: ['Grilled salmon', 'Quinoa', 'Roasted vegetables'],
    caloriesEstimated: 620,
  },
  {
    id: 'nut-3',
    date: new Date('2026-02-13'),
    mealType: 'snack',
    items: ['Apple with almond butter'],
    caloriesEstimated: 200,
  },
];

export const mockSleepRecords: SleepRecord[] = [
  {
    id: 'sleep-1',
    date: new Date('2026-02-13'),
    duration: 482,
    quality: 'good',
    deepSleepPercent: 22,
  },
  {
    id: 'sleep-2',
    date: new Date('2026-02-12'),
    duration: 510,
    quality: 'excellent',
    deepSleepPercent: 28,
  },
];

// ============ Home Control Universe Mock Data ============

export const mockSmartDevices: SmartDevice[] = [
  {
    id: 'dev-1',
    name: 'Living Room Light',
    type: 'light',
    room: 'Living Room',
    status: 'online',
    battery: 100,
    lastSeen: new Date('2026-02-13T16:45:00'),
  },
  {
    id: 'dev-2',
    name: 'Main Thermostat',
    type: 'thermostat',
    room: 'Hallway',
    status: 'online',
    lastSeen: new Date('2026-02-13T16:50:00'),
  },
  {
    id: 'dev-3',
    name: 'Front Door Lock',
    type: 'lock',
    room: 'Entryway',
    status: 'online',
    battery: 87,
    lastSeen: new Date('2026-02-13T16:30:00'),
  },
  {
    id: 'dev-4',
    name: 'Kitchen Speaker',
    type: 'speaker',
    room: 'Kitchen',
    status: 'online',
    lastSeen: new Date('2026-02-13T16:55:00'),
  },
];

export const mockHomeScenes: HomeScene[] = [
  {
    id: 'scene-1',
    name: 'Good Morning',
    description: 'Bright lights and comfortable temperature',
    devices: ['dev-1', 'dev-2'],
    actions: [
      { deviceId: 'dev-1', action: 'set-brightness', value: 100 },
      { deviceId: 'dev-2', action: 'set-temperature', value: 72 },
    ],
    triggeredCount: 24,
  },
  {
    id: 'scene-2',
    name: 'Movie Night',
    description: 'Dim lights and ambient mood',
    devices: ['dev-1'],
    actions: [
      { deviceId: 'dev-1', action: 'set-brightness', value: 20 },
      { deviceId: 'dev-1', action: 'set-color', value: '#FF6B35' },
    ],
    triggeredCount: 8,
  },
  {
    id: 'scene-3',
    name: 'Away',
    description: 'Secure home and optimize energy',
    devices: ['dev-1', 'dev-3'],
    actions: [
      { deviceId: 'dev-1', action: 'turn-off' },
      { deviceId: 'dev-3', action: 'lock' },
    ],
    triggeredCount: 12,
  },
];

export const mockSmartAutomations: SmartAutomation[] = [
  {
    id: 'auto-1',
    name: 'Sunset Lights',
    trigger: 'time',
    triggerCondition: '18:00 daily',
    actions: [
      { deviceId: 'dev-1', action: 'set-brightness', value: 75 },
    ],
    enabled: true,
  },
  {
    id: 'auto-2',
    name: 'Away Mode Eco',
    trigger: 'location',
    triggerCondition: 'Left home',
    actions: [
      { deviceId: 'dev-1', action: 'turn-off' },
      { deviceId: 'dev-2', action: 'set-temperature', value: 62 },
    ],
    enabled: true,
  },
  {
    id: 'auto-3',
    name: 'Heavy Rain Close Blinds',
    trigger: 'custom',
    triggerCondition: 'Weather.rainfall > 0.5in',
    actions: [
      { deviceId: 'dev-1', action: 'dim', value: 40 },
    ],
    enabled: false,
  },
];

export const mockEnergyUsage: EnergyUsage[] = [
  {
    id: 'energy-1',
    timestamp: new Date('2026-02-13T16:00:00'),
    powerUsageWatts: 2340,
    costEstimate: 0.28,
    deviceBreakdown: {
      'Thermostat': 800,
      'Lighting': 450,
      'Refrigerator': 600,
      'Other': 490,
    },
  },
  {
    id: 'energy-2',
    timestamp: new Date('2026-02-13T12:00:00'),
    powerUsageWatts: 1850,
    costEstimate: 0.22,
    deviceBreakdown: {
      'Thermostat': 600,
      'Lighting': 300,
      'Refrigerator': 600,
      'Other': 350,
    },
  },
];

// ============ Automation & Agents Universe Mock Data ============

export const mockWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Daily Report Digest',
    description: 'Compile metrics and send morning summary',
    status: 'active',
    nextRun: new Date('2026-02-14T08:00:00'),
    executionCount: 34,
    successRate: 0.97,
  },
  {
    id: 'wf-2',
    name: 'Backup Database',
    description: 'Automated nightly backup to cloud storage',
    status: 'active',
    nextRun: new Date('2026-02-14T02:00:00'),
    executionCount: 126,
    successRate: 1.0,
  },
  {
    id: 'wf-3',
    name: 'Monthly Billing',
    description: 'Generate invoices and send to customers',
    status: 'paused',
    executionCount: 12,
    successRate: 0.92,
  },
];

export const mockWorkflowTriggers: WorkflowTrigger[] = [
  {
    id: 'trig-1',
    workflowId: 'wf-1',
    type: 'schedule',
    condition: 'Every day at 8:00 AM',
  },
  {
    id: 'trig-2',
    workflowId: 'wf-2',
    type: 'schedule',
    condition: 'Every day at 2:00 AM',
  },
  {
    id: 'trig-3',
    workflowId: 'wf-3',
    type: 'manual',
    condition: 'User-triggered',
  },
];

export const mockWorkflowActions: WorkflowAction[] = [
  {
    id: 'action-1',
    workflowId: 'wf-1',
    order: 1,
    type: 'data-process',
    config: { metric: 'daily_active_users', aggregation: 'sum' },
  },
  {
    id: 'action-2',
    workflowId: 'wf-1',
    order: 2,
    type: 'notification',
    config: { recipients: ['admin@aurora.app'], format: 'html' },
  },
  {
    id: 'action-3',
    workflowId: 'wf-2',
    order: 1,
    type: 'api-call',
    config: { endpoint: '/api/backup', method: 'POST' },
  },
];

export const mockBotInstances: BotInstance[] = [
  {
    id: 'bot-1',
    name: 'Analytics Monitor',
    workflowId: 'wf-1',
    capability: 'monitoring',
    uptime: 0.9999,
    tasksCompleted: 856,
    lastExecuted: new Date('2026-02-13T08:00:00'),
  },
  {
    id: 'bot-2',
    name: 'Backup Agent',
    workflowId: 'wf-2',
    capability: 'scheduling',
    uptime: 1.0,
    tasksCompleted: 234,
    lastExecuted: new Date('2026-02-13T02:05:00'),
  },
  {
    id: 'bot-3',
    name: 'Data Processor',
    workflowId: 'wf-1',
    capability: 'processing',
    uptime: 0.9995,
    tasksCompleted: 1240,
    lastExecuted: new Date('2026-02-13T08:02:00'),
  },
];

// ============ Data Service ============

export class AuroraDataService {
  static getProducts(): Product[] {
    return mockProducts;
  }

  static getBrands(): BrandProfile[] {
    return mockBrands;
  }

  static getBrandAssets(): BrandAsset[] {
    return mockBrandAssets;
  }

  static getBrandCampaigns(): BrandCampaign[] {
    return mockBrandCampaigns;
  }

  static getCourses(): Course[] {
    return mockCourses;
  }

  static getRealms(): Realm[] {
    return mockRealms;
  }

  static getCommunities(): Community[] {
    return mockCommunities;
  }

  static getCommunityPosts(): Post[] {
    return mockCommunityPosts;
  }

  static getUsers(): User[] {
    return mockUsers;
  }

  static getPersonas(): Persona[] {
    return mockPersonas;
  }

  static getIdentityProfile(): IdentityProfile {
    return mockIdentityProfile;
  }

  static getLifeGraph(): LifeGraphNode[] {
    return mockLifeGraph;
  }

  static getDigitalTwinSuggestions(): DigitalTwinSuggestion[] {
    return mockDigitalTwinSuggestions;
  }

  static getTasks(): Task[] {
    return mockTasks;
  }

  static getNotes(): Note[] {
    return mockNotes;
  }

  static getCalendarEvents(): CalendarEvent[] {
    return mockCalendarEvents;
  }

  static getWatchlist(): WatchlistItem[] {
    return mockWatchlist;
  }

  static getReadingList(): ReadingItem[] {
    return mockReadingList;
  }

  static getShoppingList(): ShoppingItem[] {
    return mockShoppingList;
  }

  static getNotifications(): NotificationItem[] {
    return mockNotifications;
  }

  static getLearningTimeline(): LearningTimelineItem[] {
    return mockLearningTimeline;
  }

  static getDevices(): Device[] {
    return mockDevices;
  }

  static getSecuritySessions(): SecuritySession[] {
    return mockSecuritySessions;
  }

  static getSecurityEvents(): SecurityEvent[] {
    return mockSecurityEvents;
  }

  static getSecurityPolicies(): SecurityPolicy[] {
    return mockSecurityPolicies;
  }

  static getAccessibilitySettings(): AccessibilitySetting[] {
    return mockAccessibilitySettings;
  }

  static getTrips(): Trip[] {
    return mockTrips;
  }

  static getPackingList(): PackingItem[] {
    return mockPackingList;
  }

  static getBudgetCategories(): BudgetCategory[] {
    return mockBudgetCategories;
  }

  static getItinerary(): ItineraryItem[] {
    return mockItinerary;
  }

  static getSavedPlaces(): SavedPlace[] {
    return mockSavedPlaces;
  }

  static getRoutes(): RouteSuggestion[] {
    return mockRoutes;
  }

  static getMarketplaceListings(): MarketplaceListing[] {
    return mockMarketplaceListings;
  }

  static getCreatorPayouts(): CreatorPayout[] {
    return mockCreatorPayouts;
  }

  static getPlugins(): PluginPackage[] {
    return mockPlugins;
  }

  static getApiKeys(): ApiKey[] {
    return mockApiKeys;
  }

  static getWebhooks(): WebhookEndpoint[] {
    return mockWebhooks;
  }

  static getSocialProfiles(): SocialProfile[] {
    return mockSocialProfiles;
  }

  static getSocialPosts(): SocialPost[] {
    return mockSocialPosts;
  }

  static getSocialChannels(): SocialChannel[] {
    return mockSocialChannels;
  }

  static getMediaItems(): MediaItem[] {
    return mockMediaItems;
  }

  static getGames(): Game[] {
    return mockGames;
  }

  static getGameClips(): GameClip[] {
    return mockGameClips;
  }

  static getGameTournaments(): GameTournament[] {
    return mockGameTournaments;
  }

  static getGameLeaderboards(): LeaderboardEntry[] {
    return mockLeaderboards;
  }

  static getPlaylists(): Playlist[] {
    return mockPlaylists;
  }

  // ============ AI Universe Getters ============

  static getAiModels(): AiModel[] {
    return mockAiModels;
  }

  static getAiConversations(): AiConversation[] {
    return mockAiConversations;
  }

  static getAiAgents(): AiAgent[] {
    return mockAiAgents;
  }

  // ============ Finance Universe Getters ============

  static getFinanceAccounts(): FinanceAccount[] {
    return mockFinanceAccounts;
  }

  static getTransactions(): Transaction[] {
    return mockTransactions;
  }

  static getFinanceBudgets(): FinanceBudget[] {
    return mockFinanceBudgets;
  }

  static getInvestments(): Investment[] {
    return mockInvestments;
  }

  static getFinanceInsights(): FinanceInsight[] {
    return mockFinanceInsights;
  }

  // ============ Health & Wellness Universe Getters ============

  static getHealthVitals(): HealthVital[] {
    return mockHealthVitals;
  }

  static getActivities(): Activity[] {
    return mockActivities;
  }

  static getHealthGoals(): HealthGoal[] {
    return mockHealthGoals;
  }

  static getNutritionEntries(): NutritionEntry[] {
    return mockNutritionEntries;
  }

  static getSleepRecords(): SleepRecord[] {
    return mockSleepRecords;
  }

  // ============ Home Control Universe Getters ============

  static getSmartDevices(): SmartDevice[] {
    return mockSmartDevices;
  }

  static getHomeScenes(): HomeScene[] {
    return mockHomeScenes;
  }

  static getSmartAutomations(): SmartAutomation[] {
    return mockSmartAutomations;
  }

  static getEnergyUsage(): EnergyUsage[] {
    return mockEnergyUsage;
  }

  // ============ Automation & Agents Universe Getters ============

  static getWorkflows(): Workflow[] {
    return mockWorkflows;
  }

  static getWorkflowTriggers(): WorkflowTrigger[] {
    return mockWorkflowTriggers;
  }

  static getWorkflowActions(): WorkflowAction[] {
    return mockWorkflowActions;
  }

  static getBotInstances(): BotInstance[] {
    return mockBotInstances;
  }

  static getProductById(id: string): Product | undefined {
    return mockProducts.find((p) => p.id === id);
  }

  static getCourseById(id: string): Course | undefined {
    return mockCourses.find((c) => c.id === id);
  }

  static getRealmById(id: string): Realm | undefined {
    return mockRealms.find((r) => r.id === id);
  }

  static getSocialProfileById(id: string): SocialProfile | undefined {
    return mockSocialProfiles.find((p) => p.id === id);
  }

  static getMediaItemById(id: string): MediaItem | undefined {
    return mockMediaItems.find((item) => item.id === id);
  }
}
