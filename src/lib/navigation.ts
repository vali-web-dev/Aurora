// Primary navigation - always visible
export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/entertainment", label: "Entertainment" },
  { href: "/commerce", label: "Commerce" },
  { href: "/social", label: "Social" },
  { href: "/learning", label: "Learning" },
  { href: "/create", label: "Create" }
];

// Secondary navigation - in collapsible menu
export const secondaryNav = [
  { href: "/identity", label: "Identity" },
  { href: "/brand", label: "Brand" },
  { href: "/brand/aurora-logo-studio", label: "Aurora Logo Studio" },
  { href: "/brand/photoshop-pro", label: "Photoshop Pro" },
  { href: "/brand/photoshop-canvas", label: "Photoshop Canvas" },
  { href: "/brand/photoshop-canvas-advanced", label: "Photoshop Canvas Advanced" },
  { href: "/brand/photoshop-enhanced", label: "Photoshop Enhanced" },
  { href: "/communities", label: "Communities" },
  { href: "/gaming", label: "Gaming" },
  { href: "/commerce/review", label: "Shopping Review" },
  { href: "/commerce/orders", label: "Order History" },
  { href: "/economy", label: "Economy" },
  { href: "/developer", label: "Developer" },
  { href: "/ai", label: "AI" },
  { href: "/finance", label: "Finance" },
  { href: "/health", label: "Health" },
  { href: "/health/human-model", label: "Human Model" },
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
  { href: "/navigation/topology", label: "Feature Topology" },
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
  { href: "/commerce/review", label: "Shopping Review" },
  { href: "/commerce/orders", label: "Order History" },
  { href: "/brand", label: "Brand" },
  { href: "/communities", label: "Communities" },
  { href: "/gaming", label: "Gaming" },
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
    { href: "/create", label: "Create" },
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