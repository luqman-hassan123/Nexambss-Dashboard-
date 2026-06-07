import { useRef, useEffect } from "react";
import { FaChartPie, FaFileMedical, FaCog } from "react-icons/fa";

/* ─────────────────────────────────────────────
   NewRequestsDrawer  (lives inside Sidebar file)
───────────────────────────────────────────── */
function NewRequestsDrawer({ items, open, onClose, onSelectItem }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "drawer-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`drawer ${open ? "drawer--open" : ""}`} role="dialog" aria-modal="true">

        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <span className="drawer-dot" />
            <h2 className="drawer-title">New Requests</h2>
            <span className="drawer-count">{items.length}</span>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p>No pending requests</p>
            </div>
          ) : (
            <ul className="drawer-list">
              {items.map(item => {
                const id = item._id || item.email;
                const initials =
                  (item.firstName?.[0] || "").toUpperCase() +
                  (item.lastName?.[0]  || "").toUpperCase();
                return (
                  <li key={id}>
                    <button
                      className="drawer-item"
                      onClick={() => { onSelectItem(item); onClose(); }}
                    >
                      <div className="drawer-item-top">
                        <div className="avatar avatar--sm">{initials}</div>
                        <div className="drawer-item-meta">
                          <span className="drawer-item-name">{item.firstName} {item.lastName}</span>
                          <span className="drawer-item-sub">{item.clinicName || item.email}</span>
                        </div>
                        {/* Arrow hint */}
                        <svg className="drawer-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </div>

                      <div className="drawer-item-rows">
                        {[
                          { label: "Email",     value: item.email },
                          { label: "Phone",     value: item.phoneNumber },
                          { label: "Specialty", value: item.specialty },
                          { label: "Service",   value: item.serviceInterest },
                        ].filter(r => r.value).map(({ label, value }) => (
                          <div key={label} className="drawer-item-row">
                            <span className="drawer-item-label">{label}</span>
                            <span className="drawer-item-value">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="drawer-item-cta">
                        <span>Open &amp; Edit</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────── */
export default function Sidebar({
  active       = "dashboard",
  onNav,
  isOpen       = false,
  pendingItems  = [],         // full list for the drawer
  unseenCount   = 0,          // badge number — decreases as items are opened
  drawerOpen    = false,
  onDrawerOpen,
  onDrawerClose,
  onSelectPending,
}) {
  const links = [
    { key: "dashboard",     label: "Dashboard",     Icon: FaChartPie },
    { key: "consultations", label: "Consultations", Icon: FaFileMedical },
    { key: "settings",      label: "Settings",      Icon: FaCog },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h1>Admin Panel</h1>
          <span>Medical Consultations</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`nav-btn ${active === key ? "active" : ""}`}
              onClick={() => onNav?.(key)}
            >
              <Icon className="nav-icon" />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Bell / New Requests button at bottom of nav ── */}
        <div className="sidebar-bell-wrap">
          <button
            className={`sidebar-bell-btn ${drawerOpen ? "sidebar-bell-btn--active" : ""}`}
            onClick={onDrawerOpen}
            aria-label={`${unseenCount} new consultation requests`}
          >
            <span className="sidebar-bell-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className="sidebar-bell-label">New Requests</span>
            </span>
            {unseenCount > 0 && (
              <span className="sidebar-bell-badge">{unseenCount}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Drawer rendered outside sidebar so it overlays the full page */}
      <NewRequestsDrawer
        items={pendingItems}
        open={drawerOpen}
        onClose={onDrawerClose}
        onSelectItem={onSelectPending}
      />
    </>
  );
}