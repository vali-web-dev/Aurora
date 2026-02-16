/**
 * Expandable Navigation Structure
 * Complete hierarchical navigation with all pages, sub-pages, actions, and links
 */

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
  description?: string;
  children?: NavItem[];
  group?: 'Primary' | 'Explore' | 'Support';
}

export const expandableNavigation: NavItem[] = [
  // PRIMARY NAVIGATION
  {
    href: '/home',
    label: 'Home',
    group: 'Primary',
    description: 'Your Aurora home universe',
    children: [
      { href: '/dashboard', label: 'Dashboard', description: 'Overview & stats' },
      { href: '/profile', label: 'Your Profile', description: 'Manage your identity' },
      { href: '/settings', label: 'Settings', description: 'Preferences & config' },
    ],
  },
  {
    href: '/entertainment',
    label: 'Entertainment',
    group: 'Primary',
    description: 'Music, movies, shows, games',
    children: [
      { href: '/entertainment', label: 'Explore Entertainment', description: 'Browse all media' },
      { href: '/entertainment/music', label: 'Music', description: 'Streaming & playlists' },
      { href: '/entertainment/movies', label: 'Movies', description: 'Watch films' },
      { href: '/entertainment/shows', label: 'TV Shows', description: 'Series & episodes' },
      { href: '/entertainment/podcasts', label: 'Podcasts', description: 'Audio shows' },
      { href: '/entertainment/books', label: 'Books', description: 'Read & audiobooks' },
      { href: '/gaming', label: 'Gaming', description: 'Play & compete' },
    ],
  },
  {
    href: '/commerce',
    label: 'Commerce',
    group: 'Primary',
    description: 'Shop, track, review',
    children: [
      { href: '/commerce', label: 'Shop Now', description: 'Browse products' },
      { href: '/commerce/cart', label: 'Shopping Cart', description: 'Review items' },
      { href: '/commerce/checkout', label: 'Checkout', description: 'Complete purchase' },
      { href: '/commerce/orders', label: 'Order History', description: 'Track orders' },
      { href: '/commerce/review', label: 'Shopping Review', description: 'Rate purchases' },
      { href: '/commerce/delivery', label: 'Delivery Tracking', description: 'Track shipments' },
    ],
  },
  {
    href: '/social',
    label: 'Social',
    group: 'Primary',
    description: 'Connect with people',
    children: [
      { href: '/social', label: 'Social Feed', description: 'Latest updates' },
      { href: '/social/friends', label: 'Friends', description: 'Your connections' },
      { href: '/social/messages', label: 'Messages', description: 'Direct chats' },
      { href: '/social/notifications', label: 'Notifications', description: 'Activity alerts' },
      { href: '/communities', label: 'Communities', description: 'Join groups' },
      { href: '/guilds', label: 'Guilds', description: 'Gaming clans' },
    ],
  },
  {
    href: '/learning',
    label: 'Learning',
    group: 'Primary',
    description: 'Courses & knowledge',
    children: [
      { href: '/learning', label: 'Explore Courses', description: 'Browse subjects' },
      { href: '/learning/my-courses', label: 'My Courses', description: 'Active learning' },
      { href: '/learning/achievements', label: 'Achievements', description: 'Certifications' },
      { href: '/learning/library', label: 'Library', description: 'Saved resources' },
      { href: '/learning/instructors', label: 'Instructors', description: 'Expert teachers' },
    ],
  },
  {
    href: '/create',
    label: 'Create',
    group: 'Primary',
    description: 'Build & design',
    children: [
      { href: '/create', label: 'Creation Studio', description: 'Start creating' },
      { href: '/create/projects', label: 'My Projects', description: 'Your creations' },
      { href: '/create/templates', label: 'Templates', description: 'Quick start' },
      { href: '/create/assets', label: 'Asset Library', description: 'Media & resources' },
      { href: '/create/collaborate', label: 'Collaborate', description: 'Team creation' },
    ],
  },
  
  // EXPLORE NAVIGATION
  {
    href: '/brand',
    label: 'Brand',
    group: 'Explore',
    description: 'Your digital brand',
    children: [
      { href: '/brand', label: 'Brand Hub', description: 'Manage presence' },
      { href: '/brand/identity', label: 'Brand Identity', description: 'Visual assets' },
      { href: '/brand/content', label: 'Content', description: 'Published work' },
      { href: '/brand/analytics', label: 'Analytics', description: 'Performance data' },
    ],
  },
  {
    href: '/communities',
    label: 'Communities',
    group: 'Explore',
    description: 'Groups & forums',
    children: [
      { href: '/communities', label: 'Discover', description: 'Find communities' },
      { href: '/communities/my-groups', label: 'My Groups', description: 'Joined spaces' },
      { href: '/communities/create', label: 'Create Community', description: 'Start a group' },
    ],
  },
  {
    href: '/gaming',
    label: 'Gaming',
    group: 'Explore',
    description: 'Play & compete',
    children: [
      { href: '/gaming', label: 'Game Library', description: 'Your games' },
      { href: '/gaming/store', label: 'Game Store', description: 'Buy games' },
      { href: '/gaming/achievements', label: 'Achievements', description: 'Unlocked badges' },
      { href: '/gaming/leaderboards', label: 'Leaderboards', description: 'Top players' },
      { href: '/guilds', label: 'Guilds', description: 'Gaming clans' },
    ],
  },
  {
    href: '/productivity',
    label: 'Productivity',
    group: 'Explore',
    description: 'Tasks & workflow',
    children: [
      { href: '/productivity/calendar', label: 'Calendar', description: 'Schedule events' },
      { href: '/productivity/notes', label: 'Notes', description: 'Quick capture' },
      { href: '/productivity/projects', label: 'Projects', description: 'Team work' },
    ],
  },
  {
    href: '/travel',
    label: 'Travel',
    group: 'Explore',
    description: 'Plan & explore',
    children: [
      { href: '/travel/bookings', label: 'My Trips', description: 'Planned travel' },
      { href: '/travel/guides', label: 'Travel Guides', description: 'Recommendations' },
    ],
  },
  {
    href: '/finance',
    label: 'Finance',
    group: 'Explore',
    description: 'Money management',
    children: [
      { href: '/finance', label: 'Overview', description: 'Financial dashboard' },
      { href: '/finance/accounts', label: 'Accounts', description: 'Bank connections' },
      { href: '/finance/transactions', label: 'Transactions', description: 'Recent activity' },
      { href: '/finance/budget', label: 'Budget', description: 'Spending plan' },
      { href: '/finance/invest', label: 'Investing', description: 'Portfolio' },
      { href: '/economy', label: 'Economy', description: 'Market insights' },
    ],
  },
  {
    href: '/health',
    label: 'Health',
    group: 'Explore',
    description: 'Wellness & fitness',
    children: [
      { href: '/health', label: 'Health Dashboard', description: 'Overview' },
      { href: '/health/activity', label: 'Activity', description: 'Exercise tracking' },
      { href: '/health/nutrition', label: 'Nutrition', description: 'Diet & meals' },
      { href: '/health/sleep', label: 'Sleep', description: 'Rest analysis' },
      { href: '/health/mindfulness', label: 'Mindfulness', description: 'Mental wellness' },
    ],
  },
  {
    href: '/homecontrol',
    label: 'Home Control',
    group: 'Explore',
    description: 'Smart home',
    children: [
      { href: '/homecontrol', label: 'Home Dashboard', description: 'Control center' },
      { href: '/homecontrol/devices', label: 'Devices', description: 'Connected items' },
      { href: '/homecontrol/rooms', label: 'Rooms', description: 'Spaces & zones' },
      { href: '/homecontrol/scenes', label: 'Scenes', description: 'Automation' },
      { href: '/automation', label: 'Automation', description: 'Advanced rules' },
    ],
  },
  {
    href: '/automation',
    label: 'Automation',
    group: 'Explore',
    description: 'Workflows & AI',
    children: [
      { href: '/automation', label: 'Workflows', description: 'Automation hub' },
      { href: '/automation/rules', label: 'Rules', description: 'If-then logic' },
      { href: '/automation/schedules', label: 'Schedules', description: 'Time-based' },
      { href: '/ai', label: 'AI Assistant', description: 'Smart help' },
    ],
  },
  {
    href: '/ai',
    label: 'AI',
    group: 'Explore',
    description: 'Artificial intelligence',
    children: [
      { href: '/ai', label: 'AI Hub', description: 'AI dashboard' },
      { href: '/ai/chat', label: 'Chat', description: 'Conversational AI' },
      { href: '/ai/tools', label: 'AI Tools', description: 'Utilities' },
      { href: '/ai/history', label: 'History', description: 'Past interactions' },
    ],
  },
  {
    href: '/developer',
    label: 'Developer',
    group: 'Explore',
    description: 'APIs & tools',
    children: [
      { href: '/developer', label: 'Developer Portal', description: 'Documentation' },
      { href: '/developer/api', label: 'API Keys', description: 'Access tokens' },
      { href: '/developer/webhooks', label: 'Webhooks', description: 'Event callbacks' },
      { href: '/developer/apps', label: 'Applications', description: 'Your apps' },
    ],
  },
  {
    href: '/identity',
    label: 'Identity',
    group: 'Explore',
    description: 'Digital identity',
    children: [
      { href: '/identity', label: 'Identity Hub', description: 'Manage identity' },
      { href: '/identity/credentials', label: 'Credentials', description: 'Verified data' },
      { href: '/identity/privacy', label: 'Privacy', description: 'Data control' },
    ],
  },
  {
    href: '/economy',
    label: 'Economy',
    group: 'Explore',
    description: 'Digital economy',
    children: [
      { href: '/economy', label: 'Economy Hub', description: 'Market overview' },
      { href: '/economy/marketplace', label: 'Marketplace', description: 'Buy & sell' },
      { href: '/economy/wallet', label: 'Wallet', description: 'Digital assets' },
    ],
  },
  {
    href: '/realms',
    label: 'Realms',
    group: 'Explore',
    description: 'Virtual worlds',
    children: [
      { href: '/realms', label: 'Explore Realms', description: 'Virtual spaces' },
      { href: '/realms/my-realms', label: 'My Realms', description: 'Your worlds' },
      { href: '/realms/create', label: 'Create Realm', description: 'Build world' },
    ],
  },
  {
    href: '/guilds',
    label: 'Guilds',
    group: 'Explore',
    description: 'Gaming clans',
    children: [
      { href: '/guilds', label: 'Find Guilds', description: 'Join clan' },
      { href: '/guilds/my-guilds', label: 'My Guilds', description: 'Your clans' },
      { href: '/guilds/create', label: 'Create Guild', description: 'Start clan' },
    ],
  },
  {
    href: '/luma',
    label: 'Luma',
    group: 'Explore',
    description: 'Lighting & ambiance',
    children: [
      { href: '/luma', label: 'Luma Control', description: 'Light settings' },
      { href: '/luma/scenes', label: 'Light Scenes', description: 'Presets' },
      { href: '/luma/schedule', label: 'Schedule', description: 'Automation' },
    ],
  },
  {
    href: '/navigation',
    label: 'Navigation',
    group: 'Explore',
    description: 'Maps & routes',
    children: [
      { href: '/navigation', label: 'Map View', description: 'Explore maps' },
      { href: '/navigation/saved', label: 'Saved Places', description: 'Favorites' },
      { href: '/navigation/directions', label: 'Directions', description: 'Get routes' },
    ],
  },

  // SUPPORT NAVIGATION
  {
    href: '/about',
    label: 'About',
    group: 'Support',
    description: 'Learn about Aurora',
    children: [
      { href: '/about', label: 'About Aurora', description: 'Our story' },
      { href: '/about/team', label: 'Team', description: 'Who we are' },
      { href: '/about/philosophy', label: 'Philosophy', description: 'Our values' },
    ],
  },
  {
    href: '/roadmap',
    label: 'Roadmap',
    group: 'Support',
    description: 'Future plans',
    children: [
      { href: '/roadmap', label: 'Product Roadmap', description: 'Upcoming features' },
      { href: '/roadmap/changelog', label: 'Changelog', description: 'Recent updates' },
    ],
  },
  {
    href: '/blog',
    label: 'Blog',
    group: 'Support',
    description: 'News & updates',
    children: [
      { href: '/blog', label: 'All Posts', description: 'Latest articles' },
      { href: '/blog/announcements', label: 'Announcements', description: 'Major news' },
    ],
  },
  {
    href: '/contact',
    label: 'Contact',
    group: 'Support',
    description: 'Get in touch',
    children: [
      { href: '/contact', label: 'Contact Form', description: 'Send message' },
      { href: '/contact/support', label: 'Support', description: 'Get help' },
    ],
  },
  {
    href: '/accessibility',
    label: 'Accessibility',
    group: 'Support',
    description: 'Inclusive features',
    children: [
      { href: '/accessibility', label: 'Accessibility Hub', description: 'Settings' },
      { href: '/accessibility/keyboard', label: 'Keyboard Nav', description: 'Shortcuts' },
    ],
  },
  {
    href: '/admin',
    label: 'Admin',
    group: 'Support',
    description: 'System management',
    children: [
      { href: '/admin', label: 'Admin Dashboard', description: 'Control panel' },
      { href: '/admin/users', label: 'Users', description: 'User management' },
      { href: '/admin/settings', label: 'System Settings', description: 'Configuration' },
    ],
  },
  {
    href: '/settings',
    label: 'Settings',
    group: 'Support',
    description: 'Preferences',
    children: [
      { href: '/settings', label: 'All Settings', description: 'Configure Aurora' },
      { href: '/settings/account', label: 'Account', description: 'Profile settings' },
      { href: '/settings/privacy', label: 'Privacy', description: 'Data control' },
      { href: '/settings/notifications', label: 'Notifications', description: 'Alert prefs' },
      { href: '/security', label: 'Security', description: 'Account security' },
    ],
  },
];

// Flatten for search - includes all parent and child items
export const flattenedNavigation: NavItem[] = expandableNavigation.reduce<NavItem[]>((acc, item) => {
  acc.push(item);
  if (item.children) {
    acc.push(...item.children);
  }
  return acc;
}, []);

// Helper to get children for a specific href
export function getNavChildren(href: string): NavItem[] | undefined {
  const item = expandableNavigation.find((nav) => nav.href === href);
  return item?.children;
}

// Check if nav item has children
export function hasChildren(href: string): boolean {
  return expandableNavigation.some((nav) => nav.href === href && nav.children && nav.children.length > 0);
}
