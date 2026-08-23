export type SearchEngine = {
  id: string;
  name: string;
  url: string;
};
export type LogoConfig = {
  enabled: boolean;
  src: string | null;
  text: string;
  size: number;
  gap: number;
};
export type Shortcut = {
  id: string;
  name: string;
  url: string;
  icon?: string;
};
export type StartpageConfig = {
  engines: SearchEngine[];
  activeEngine: string;
  logo: LogoConfig;
  shortcuts: (Shortcut | null)[];
  shortcutSize: number;
  shortcutIconSize: number;
  shortcutGap: number;
  shortcutOverflow: 'none' | 'scroll' | 'wrap';
  shortcutOverflowAfter: number;
  searchWidth: number;
  searchHeight: number;
  searchFontSize: number;
  showBackLink: boolean;
  openSections: string[];
};
const defaultShortcutData = [
  { id: 'gh', name: 'GitHub', url: 'https://github.com' },
  { id: 'yt', name: 'YouTube', url: 'https://www.youtube.com' },
  { id: 'x', name: 'X', url: 'https://x.com' },
  { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com' },
  { id: 'mail', name: 'Gmail', url: 'https://mail.google.com' },
  { id: 'spot', name: 'Spotify', url: 'https://open.spotify.com' },
  { id: 'wiki', name: 'Wikipedia', url: 'https://en.wikipedia.org' },
];
export const DEFAULT_CONFIG: StartpageConfig = {
  engines: [
    { id: 'brave', name: 'Brave', url: 'https://search.brave.com/search?q=%s' },
    { id: 'ddg', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
    { id: 'ecosia', name: 'Ecosia', url: 'https://www.ecosia.org/search?q=%s' },
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
    { id: 'searxng', name: 'SearXNG', url: 'https://searx.fmhy.net/search?q=%s' },
    { id: 'startpage', name: 'Startpage', url: 'https://www.startpage.com/sp/search?query=%s' },
  ],
  activeEngine: 'ddg',
  logo: { enabled: true, src: '/favicon-startpage.svg', text: 'Startpage', size: 22, gap: 10 },
  shortcuts: defaultShortcutData.map((s, i) => ({ ...s, id: `sc-${i}` })),
  shortcutSize: 72,
  shortcutIconSize: 28,
  shortcutGap: 20,
  shortcutOverflow: 'scroll',
  shortcutOverflowAfter: 8,
  searchWidth: 560,
  searchHeight: 44,
  searchFontSize: 15,
  showBackLink: true,
  openSections: ['logo', 'engine'],
};