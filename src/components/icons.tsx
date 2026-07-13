type IconName = "home" | "calendar" | "list" | "clock" | "diamond" | "settings" | "external" | "search" | "bell" | "plus" | "menu" | "close" | "chevron" | "user" | "location" | "copy" | "check";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.5 10 4l7 6.5"/><path d="M5.5 9.5V17h9V9.5"/></>,
  calendar: <><rect x="3" y="4.5" width="14" height="12.5" rx="1.5"/><path d="M6.5 2.5v4M13.5 2.5v4M3 8h14"/></>,
  list: <><path d="M7 5h10M7 10h10M7 15h10"/><circle cx="3.5" cy="5" r=".5" fill="currentColor"/><circle cx="3.5" cy="10" r=".5" fill="currentColor"/><circle cx="3.5" cy="15" r=".5" fill="currentColor"/></>,
  clock: <><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 1.5"/></>,
  diamond: <path d="m10 3 6.5 7L10 17 3.5 10 10 3Z"/>,
  settings: <><circle cx="10" cy="10" r="2.5"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"/></>,
  external: <><path d="M8 4h8v8M16 4l-9 9"/><path d="M15 14v2H4V5h2"/></>,
  search: <><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></>,
  bell: <><path d="M5 14h10l-1.2-2V8a3.8 3.8 0 0 0-7.6 0v4L5 14Z"/><path d="M8.5 16.5h3"/></>,
  plus: <path d="M10 4v12M4 10h12"/>,
  menu: <path d="M3 5h14M3 10h14M3 15h14"/>,
  close: <path d="m5 5 10 10M15 5 5 15"/>,
  chevron: <path d="m8 5 5 5-5 5"/>,
  user: <><circle cx="10" cy="7" r="3"/><path d="M4 17c.5-3.2 2.5-5 6-5s5.5 1.8 6 5"/></>,
  location: <><path d="M16 8.5c0 4.5-6 8.5-6 8.5S4 13 4 8.5a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8.5" r="2"/></>,
  copy: <><rect x="7" y="7" width="9" height="9" rx="1.5"/><path d="M13 7V4H4v9h3"/></>,
  check: <path d="m4 10 4 4 8-8"/>,
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><i /><i /></span>;
}
