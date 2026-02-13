// Primary navigation - always visible
export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/learning", label: "Learn" },
  { href: "/forge", label: "Create" },
  { href: "/product", label: "Shop" }
];

// Secondary navigation - in collapsible menu
export const secondaryNav = [
  { href: "/identity", label: "Identity" },
  { href: "/economy", label: "Economy" },
  { href: "/developer", label: "Developer" },
  { href: "/ai", label: "AI" },
  { href: "/finance", label: "Finance" },
  { href: "/health", label: "Health" },
  { href: "/homecontrol", label: "Home Control" },
  { href: "/automation", label: "Automation" },
  { href: "/entertainment", label: "Entertainment" },
  { href: "/social", label: "Social" },
  { href: "/productivity", label: "Productivity" },
  { href: "/realms", label: "Realms" },
  { href: "/guilds", label: "Guilds" },
  { href: "/luma", label: "Luma" },
  { href: "/travel", label: "Travel" },
  { href: "/navigation", label: "Navigation" },
  { href: "/security", label: "Security" }
];

// Utility navigation - in collapsible menu footer
export const utilityNav = [
  { href: "/accessibility", label: "Accessibility" },
  { href: "/admin", label: "Admin" },
  { href: "/about", label: "About" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

// All navigation combined for legacy support
export const mainNav = [...primaryNav, ...secondaryNav, ...utilityNav];

export const footerNav = {
product: [
    { href: "/identity", label: "Identity" },
    { href: "/product", label: "Overview" },
    { href: "/economy", label: "Economy" },
    { href: "/developer", label: "Developer" },
    { href: "/ai", label: "AI" },
    { href: "/finance", label: "Finance" },
    { href: "/health", label: "Health" },
    { href: "/homecontrol", label: "Home Control" },
    { href: "/automation", label: "Automation" },
    { href: "/entertainment", label: "Entertainment" },
    { href: "/social", label: "Social" },
    { href: "/learning", label: "Learning" },
    { href: "/productivity", label: "Productivity" },
    { href: "/travel", label: "Travel" },
    { href: "/navigation", label: "Navigation" },
    { href: "/realms", label: "Realms" },
    { href: "/forge", label: "Forge" },
    { href: "/guilds", label: "Guilds" },
    { href: "/luma", label: "Luma" }
],
company: [
    { href: "/about", label: "About Aurora" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/blog", label: "Updates" }
],
legal: [
    { href: "/legal", label: "Privacy & Terms" },
    { href: "/security", label: "Security" },
    { href: "/accessibility", label: "Accessibility" },
    { href: "/health", label: "Health" }
],
support: [
  { href: "/admin", label: "Admin" },
  { href: "/contact", label: "Contact" }
]
};