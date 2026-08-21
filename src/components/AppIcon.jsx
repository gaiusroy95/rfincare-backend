import React, { useEffect, useState } from 'react';

/** Per-icon chunks — avoids loading the full Lucide catalog up front. */
const iconLoaders = import.meta.glob('/node_modules/lucide-react/dist/esm/icons/*.js');

/**
 * Map legacy / custom / mistyped names to Lucide file stems.
 * Keep PascalCase keys; values are kebab-case lucide filenames.
 */
const ICON_ALIASES = {
  Contact: 'contact-round',
  Conversions: 'trending-up',
  Applications: 'file-text',
  Approvals: 'check-circle',
  Approved: 'check-circle',
  Clients: 'users',
  Earnings: 'indian-rupee',
  HeadphonesIcon: 'headphones',
  Layout: 'layout-dashboard',
  Files: 'files',
  Grid: 'grid-3x3',
  Grid3x3: 'grid-3x3',
  BarChart: 'bar-chart',
  PlayCircle: 'circle-play',
  Building: 'building-2',
  Building2: 'building-2',
  Edit: 'square-pen',
  Pencil: 'pencil',
  FileEdit: 'file-pen',
  Home: 'home',
  Bank: 'landmark',
  Banks: 'landmark',
  BankPartners: 'building-2',
  Partners: 'building-2',
  Rupee: 'indian-rupee',
  Currency: 'indian-rupee',
  Percentage: 'percent',
  Question: 'circle-help',
  Help: 'circle-help',
  HelpCircle: 'circle-help',
  Settings: 'settings',
  Cog: 'settings',
  Package: 'package',
  Boxes: 'boxes',
};

/** Build a lookup of available lucide icon stems once. */
const LOADER_BY_KEY = (() => {
  const map = new Map();
  for (const [path, loader] of Object.entries(iconLoaders)) {
    const file = path.split('/').pop() || '';
    const key = file.replace(/\.js$/i, '');
    if (key) map.set(key, loader);
  }
  return map;
})();

/**
 * Convert PascalCase / camelCase Lucide component names to kebab-case file stems.
 * Handles digit boundaries: Building2 → building-2, CheckCircle2 → check-circle-2.
 * Preserves patterns like Grid3x3 → grid-3x3 (digit + lowercase stays together).
 */
function toKebabCase(name) {
  return String(name || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .toLowerCase();
}

function resolveIconKey(name) {
  if (!name || typeof name !== 'string') return 'circle-help';
  const trimmed = name.trim();
  if (!trimmed) return 'circle-help';
  if (ICON_ALIASES[trimmed]) return ICON_ALIASES[trimmed];
  // Already kebab-case
  if (trimmed.includes('-') && trimmed === trimmed.toLowerCase()) return trimmed;
  return toKebabCase(trimmed);
}

function findLoader(key) {
  if (!key) return null;
  if (LOADER_BY_KEY.has(key)) return LOADER_BY_KEY.get(key);
  // Recover Grid3x3-style stems: grid-3-x-3 → grid-3x3
  if (/\d-[a-z]/.test(key)) {
    const collapsed = key.replace(/(\d)-([a-z])/g, '$1$2');
    if (LOADER_BY_KEY.has(collapsed)) return LOADER_BY_KEY.get(collapsed);
  }
  return null;
}

function Icon({ name, size = 24, color = 'currentColor', className = '', strokeWidth = 2, ...props }) {
  const iconKey = resolveIconKey(name);
  const [IconComponent, setIconComponent] = useState(null);

  useEffect(() => {
    let active = true;
    setIconComponent(null);

    const primary = findLoader(iconKey);
    const fallback = primary ? null : findLoader('circle-help') || findLoader('help-circle');
    const load = primary || fallback;
    if (!load) return undefined;

    load()
      .then((mod) => {
        if (!active) return;
        setIconComponent(() => mod.default);
      })
      .catch(() => {
        if (!active) return;
        const rescue = findLoader('circle') || findLoader('help-circle');
        if (!rescue) return;
        rescue()
          .then((mod) => {
            if (active) setIconComponent(() => mod.default);
          })
          .catch(() => {});
      });

    return () => {
      active = false;
    };
  }, [iconKey]);

  if (!IconComponent) {
    return (
      <span
        className={className}
        style={{ display: 'inline-block', width: size, height: size }}
        aria-hidden
        {...props}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}

export default Icon;
