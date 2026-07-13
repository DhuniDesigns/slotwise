"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandMark, Icon } from "@/components/icons";

const links = [
  ["Overview", "/dashboard", "home"],
  ["Calendar", "/dashboard/calendar", "calendar"],
  ["Appointments", "/dashboard/appointments", "list"],
  ["Availability", "/dashboard/availability", "clock"],
  ["Appointment types", "/dashboard/appointment-types", "diamond"],
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const commandInput = useRef<HTMLInputElement>(null);
  const commandItems = useMemo(() => [
    ...links.map(([name, href, icon]) => ({ name, href, icon })),
    { name: "New booking", href: "/book/maya", icon: "plus" as const },
  ], []);
  const commandResults = commandItems.filter((item) => item.name.toLowerCase().includes(commandQuery.toLowerCase()));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
        setCommandQuery("");
        setCommandIndex(0);
        requestAnimationFrame(() => commandInput.current?.focus());
      }
      if (event.key === "Escape") setCommandOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openCommand() {
    setCommandOpen(true);
    setCommandQuery("");
    setCommandIndex(0);
    requestAnimationFrame(() => commandInput.current?.focus());
  }

  function selectCommand(href: string) {
    setCommandOpen(false);
    router.push(href);
  }
  return <div className="app-shell">
    <aside className={`app-sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-brand"><BrandMark /><strong>Slotwise</strong><button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" /></button></div>
      <div className="workspace-label">Workspace</div>
      <nav className="app-nav" aria-label="Dashboard">{links.map(([name, href, icon]) => <Link className={pathname === href ? "active" : ""} href={href} onClick={() => setMenuOpen(false)} key={href}><Icon name={icon} />{name}</Link>)}</nav>
      <div className="sidebar-bottom">
        <Link className="settings-link" href="/dashboard/settings"><Icon name="settings" />Settings</Link>
        <Link className="public-page-link" href="/book/maya"><Icon name="external" /><div><strong>View booking page</strong><small>slotwise.app/maya</small></div></Link>
        <div className="profile-chip"><span className="mini-avatar">MO</span><div><strong>Maya Okafor</strong><small>maya@studio.co</small></div><span>•••</span></div>
      </div>
    </aside>
    <div className="app-main">
      <header className="app-topbar"><button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button><button className="topbar-search" onClick={openCommand}><Icon name="search" size={16} /><span>Search and navigate</span><kbd>⌘ K</kbd></button><div className="topbar-actions"><button className="icon-button" onClick={() => setNotificationsOpen((open) => !open)} aria-label="Notifications" aria-expanded={notificationsOpen}><Icon name="bell" size={17} /><span className="notification-dot" /></button><Link className="button compact-button" href="/book/maya"><Icon name="plus" size={15} />New booking</Link>{notificationsOpen && <div className="notification-popover" role="status"><strong>You’re all caught up</strong><p>New bookings and changes will appear here.</p></div>}</div></header>
      <main className="dashboard-content">{children}</main>
    </div>
    {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    {commandOpen && <div className="command-backdrop" onMouseDown={() => setCommandOpen(false)}><section className="command-menu" role="dialog" aria-modal="true" aria-label="Command menu" onMouseDown={(event) => event.stopPropagation()}>
      <label className="command-input"><Icon name="search" size={17} /><input ref={commandInput} value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setCommandIndex(0); }} onKeyDown={(event) => {
        if (event.key === "ArrowDown") { event.preventDefault(); setCommandIndex((index) => commandResults.length ? (index + 1) % commandResults.length : 0); }
        if (event.key === "ArrowUp") { event.preventDefault(); setCommandIndex((index) => commandResults.length ? (index - 1 + commandResults.length) % commandResults.length : 0); }
        if (event.key === "Enter" && commandResults[commandIndex]) selectCommand(commandResults[commandIndex].href);
      }} placeholder="Search pages and actions…" autoComplete="off" /><kbd>Esc</kbd></label>
      <div className="command-results">{commandResults.length ? commandResults.map((item, index) => <button className={index === commandIndex ? "selected" : ""} onMouseEnter={() => setCommandIndex(index)} onClick={() => selectCommand(item.href)} key={item.href}><Icon name={item.icon} size={16} /><span>{item.name}</span>{pathname === item.href && <small>Current</small>}</button>) : <div className="command-empty"><strong>No results</strong><span>Try another page or action.</span></div>}</div>
      <footer><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span></footer>
    </section></div>}
  </div>;
}
