import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import useConsultations from "./hooks/useConsultations";
import './index.css'

function App() {
  const { consultations } = useConsultations();

  const [page,              setPage]              = useState("dashboard");
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [drawerOpen,        setDrawerOpen]        = useState(false);
  const [pendingItemToEdit, setPendingItemToEdit] = useState(null);
  const [seenIds,           setSeenIds]           = useState(new Set());

  const pendingItems = (consultations || []).filter(
    i => (i.status || "pending").toLowerCase() === "pending"
  );

  // Badge only counts items the user hasn't opened yet
  const unseenCount = pendingItems.filter(
    i => !seenIds.has(i._id || i.email)
  ).length;

  const markSeen = (item) => {
    const id = item._id || item.email;
    setSeenIds(prev => new Set([...prev, id]));
  };

  const handleNav = (key) => {
    setPage(key);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <span className="mobile-topbar-title">Admin Panel</span>
        <div style={{ width: 36 }} />
      </div>

      {/* Overlay (click to close sidebar on mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — owns the bell + drawer */}
      <Sidebar
        active={page}
        onNav={handleNav}
        isOpen={sidebarOpen}
        pendingItems={pendingItems}
        unseenCount={unseenCount}
        drawerOpen={drawerOpen}
        onDrawerOpen={() => setDrawerOpen(true)}
        onDrawerClose={() => setDrawerOpen(false)}
        onSelectPending={item => {
          markSeen(item);           // badge drops immediately on click
          setDrawerOpen(false);
          setPendingItemToEdit(item);
          setPage("dashboard");
          setSidebarOpen(false);
        }}
      />

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {(page === "dashboard" || page === "consultations") && (
          <Dashboard
            pendingItemToEdit={pendingItemToEdit}
            onPendingItemConsumed={() => setPendingItemToEdit(null)}
          />
        )}
        {page === "settings" && <Settings />}
      </main>

    </div>
  );
}

export default App;