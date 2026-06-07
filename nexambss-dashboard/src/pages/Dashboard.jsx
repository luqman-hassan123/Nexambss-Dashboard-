import { useState, useEffect } from "react";
import useConsultations from "../hooks/useConsultations";
import { consultationApi } from "../api/consultationApi";
import StatCard from "../components/StatCard";

/* ─────────────────────────────────────────────
   StatusSelect  – badge-shaped inline dropdown
───────────────────────────────────────────── */
function StatusSelect({ value, onChange }) {
  const normalised = (value || "pending").toLowerCase();
  return (
    <select
      className={`status-select-badge status-select-badge--${normalised.replace(" ", "-")}`}
      value={normalised}
      onChange={e => onChange(e.target.value)}
    >
      <option value="pending">Pending</option>
      <option value="in progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}

/* ─────────────────────────────────────────────
   Dashboard
   Props:
     pendingItemToEdit   – item object set by parent when
                           user clicks a drawer entry
     onPendingItemConsumed – callback to reset that signal
───────────────────────────────────────────── */
export default function Dashboard({ pendingItemToEdit = null, onPendingItemConsumed }) {
  const { consultations, loading } = useConsultations();
  const [data, setData]               = useState([]);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("all");
  const [editItem, setEditItem]       = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    if (consultations?.length) setData(consultations);
  }, [consultations]);

  // When sidebar drawer selects a pending item → open Edit modal
  useEffect(() => {
    if (pendingItemToEdit) {
      setEditItem({ ...pendingItemToEdit });
      onPendingItemConsumed?.();
    }
  }, [pendingItemToEdit]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading consultations…</p>
      </div>
    );
  }

  const stats = {
    total:      data.length,
    pending:    data.filter(i => (i.status || "pending").toLowerCase() === "pending").length,
    inprogress: data.filter(i => (i.status || "").toLowerCase() === "in progress").length,
    completed:  data.filter(i => (i.status || "").toLowerCase() === "completed").length,
    cancelled:  data.filter(i => (i.status || "").toLowerCase() === "cancelled").length,
  };

  const handleStatusChange = async (id, value) => {
    setData(prev => prev.map(item =>
      (item._id || item.email) === id ? { ...item, status: value } : item
    ));
    try {
      await consultationApi.update(id, { status: value });
    } catch {
      showToast("Failed to update status. Try again.", "error");
      setData(prev => prev.map(item =>
        (item._id || item.email) === id
          ? { ...item, status: consultations.find(c => c._id === id)?.status || "pending" }
          : item
      ));
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await consultationApi.delete(id);
      setData(prev => prev.filter(item => (item._id || item.email) !== id));
      showToast("Consultation deleted successfully.");
    } catch {
      showToast("Failed to delete. Try again.", "error");
    } finally {
      setActionLoading(false);
      setDeleteId(null);
    }
  };

  const handleEditSave = async (updated) => {
    setActionLoading(true);
    try {
      await consultationApi.update(updated._id || updated.email, updated);
      setData(prev => prev.map(item =>
        (item._id || item.email) === (updated._id || updated.email) ? updated : item
      ));
      showToast("Consultation updated successfully.");
      setEditItem(null);
    } catch {
      showToast("Failed to save changes. Try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.clinicName?.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ||
      (item.status || "pending").toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const statCards = [
    { key: "total",      title: "Total",       variant: "total" },
    { key: "pending",    title: "Pending",     variant: "pending" },
    { key: "inprogress", title: "In Progress", variant: "inprogress" },
    { key: "completed",  title: "Completed",   variant: "completed" },
    { key: "cancelled",  title: "Cancelled",   variant: "cancelled" },
  ];

  const filters = ["all", "pending", "in progress", "completed", "cancelled"];

  return (
    <div className="main-content">

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Header – bell now lives in Sidebar */}
      <div className="page-header">
        <p className="eyebrow">Overview</p>
        <h1>Dashboard</h1>
        <p className="subtitle">{data.length} total consultations on record</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map(({ key, title, variant }) => (
          <StatCard key={key} title={title} value={stats[key]} variant={variant} />
        ))}
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search name, email or clinic…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {filters.map(s => (
              <button
                key={s}
                className={`filter-pill ${filter === s ? "active" : ""}`}
                onClick={() => setFilter(s)}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
          <span className="live-badge"><span className="live-dot" />Live</span>
        </div>

        {/* Desktop table */}
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No consultations found</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {["Name","Email","Phone","Clinic","Specialty","Service","Notes","Status","Actions"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const id = item._id || item.email;
                  const initials =
                    (item.firstName?.[0] || "").toUpperCase() +
                    (item.lastName?.[0]  || "").toUpperCase();
                  return (
                    <tr key={id}>
                      <td>
                        <div className="name-cell">
                          <div className="avatar">{initials}</div>
                          <span className="name-text">{item.firstName} {item.lastName}</span>
                        </div>
                      </td>
                      <td>{item.email}</td>
                      <td>{item.phoneNumber}</td>
                      <td>{item.clinicName}</td>
                      <td>{item.specialty}</td>
                      <td>{item.serviceInterest}</td>
                      <td style={{ whiteSpace: "normal", minWidth: "180px", maxWidth: "260px" }}>
                        <span className="notes-cell">{item.notes || "—"}</span>
                      </td>
                      <td>
                        <StatusSelect
                          value={item.status || "pending"}
                          onChange={val => handleStatusChange(id, val)}
                        />
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => setEditItem({ ...item })}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => setDeleteId(id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No consultations found</p>
            </div>
          ) : (
            filtered.map(item => {
              const id = item._id || item.email;
              const initials =
                (item.firstName?.[0] || "").toUpperCase() +
                (item.lastName?.[0]  || "").toUpperCase();
              return (
                <div key={id} className="mobile-card">
                  <div className="mobile-card-top">
                    <div className="mobile-card-name">
                      <div className="avatar">{initials}</div>
                      <span className="name-text">{item.firstName} {item.lastName}</span>
                    </div>
                    <StatusSelect
                      value={item.status || "pending"}
                      onChange={val => handleStatusChange(id, val)}
                    />
                  </div>
                  <div className="mobile-card-rows">
                    {[
                      { label: "Email",     value: item.email },
                      { label: "Phone",     value: item.phoneNumber },
                      { label: "Clinic",    value: item.clinicName },
                      { label: "Specialty", value: item.specialty },
                      { label: "Service",   value: item.serviceInterest },
                      { label: "Notes",     value: item.notes || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="mobile-card-row">
                        <span className="mobile-card-row-label">{label}</span>
                        <span className="mobile-card-row-value">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mobile-card-bottom">
                    <div className="mobile-card-actions">
                      <button className="btn-edit" onClick={() => setEditItem({ ...item })}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => setDeleteId(id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <div className="table-footer">
            <span>Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong> entries</span>
            <span>Medical Consultation System</span>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => !actionLoading && setDeleteId(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </div>
            <h2 className="modal-title">Delete Entry?</h2>
            <p className="modal-subtitle">This action cannot be undone. The record will be permanently removed from the database.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" disabled={actionLoading} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="modal-btn-danger" disabled={actionLoading} onClick={() => handleDelete(deleteId)}>
                {actionLoading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onChange={setEditItem}
          onSave={handleEditSave}
          onClose={() => !actionLoading && setEditItem(null)}
          saving={actionLoading}
        />
      )}
    </div>
  );
}

function EditModal({ item, onChange, onSave, onClose, saving }) {
  const fields = [
    { key: "firstName",       label: "First Name" },
    { key: "lastName",        label: "Last Name" },
    { key: "email",           label: "Email" },
    { key: "phoneNumber",     label: "Phone" },
    { key: "clinicName",      label: "Clinic" },
    { key: "specialty",       label: "Specialty" },
    { key: "serviceInterest", label: "Service" },
    { key: "notes",           label: "Notes", multiline: true },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Consultation</h2>
          <button className="modal-close" onClick={onClose} disabled={saving}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="edit-grid">
          {fields.map(({ key, label, multiline }) => (
            <div key={key} className={`edit-field ${multiline ? "edit-field-full" : ""}`}>
              <label className="edit-label">{label}</label>
              {multiline ? (
                <textarea className="edit-input edit-textarea" rows={3}
                  value={item[key] || ""}
                  onChange={e => onChange({ ...item, [key]: e.target.value })} />
              ) : (
                <input className="edit-input" value={item[key] || ""}
                  onChange={e => onChange({ ...item, [key]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="edit-field">
            <label className="edit-label">Status</label>
            <select className="edit-input status-select" value={item.status || "pending"}
              onChange={e => onChange({ ...item, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: "24px" }}>
          <button className="modal-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="modal-btn-primary" onClick={() => onSave(item)} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}