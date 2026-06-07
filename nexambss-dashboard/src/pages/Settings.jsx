import { useState } from "react";

export default function Settings() {
  const [form, setForm] = useState({
    clinicName: "City Medical Center",
    adminEmail: "admin@clinic.com",
    timezone: "Asia/Karachi",
    notifications: true,
    autoComplete: false,
    language: "English",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <p className="eyebrow">Configuration</p>
        <h1>Settings</h1>
        <p className="subtitle">Manage your admin panel preferences</p>
      </div>

      <div className="settings-grid">

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
              </svg>
            </div>
            <div>
              <h3 className="settings-card-title">General</h3>
              <p className="settings-card-sub">Basic clinic information</p>
            </div>
          </div>
          <div className="settings-fields">
            <div className="settings-field">
              <label className="edit-label">Clinic Name</label>
              <input className="edit-input" value={form.clinicName}
                onChange={e => setForm({ ...form, clinicName: e.target.value })} />
            </div>
            <div className="settings-field">
              <label className="edit-label">Admin Email</label>
              <input className="edit-input" type="email" value={form.adminEmail}
                onChange={e => setForm({ ...form, adminEmail: e.target.value })} />
            </div>
            <div className="settings-field">
              <label className="edit-label">Timezone</label>
              <select className="edit-input status-select" value={form.timezone}
                onChange={e => setForm({ ...form, timezone: e.target.value })}>
                <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div className="settings-field">
              <label className="edit-label">Language</label>
              <select className="edit-input status-select" value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}>
                <option>English</option>
                <option>Urdu</option>
                <option>Arabic</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <div>
              <h3 className="settings-card-title">Preferences</h3>
              <p className="settings-card-sub">Notifications & automation</p>
            </div>
          </div>
          <div className="settings-fields">
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Email Notifications</p>
                <p className="toggle-sub">Get notified on new consultation requests</p>
              </div>
              <button
                className={`toggle-btn ${form.notifications ? "toggle-on" : ""}`}
                onClick={() => setForm({ ...form, notifications: !form.notifications })}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Auto-complete Old Entries</p>
                <p className="toggle-sub">Mark entries older than 30 days as completed</p>
              </div>
              <button
                className={`toggle-btn ${form.autoComplete ? "toggle-on" : ""}`}
                onClick={() => setForm({ ...form, autoComplete: !form.autoComplete })}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="settings-footer">
        <button className={`btn-save ${saved ? "btn-save-success" : ""}`} onClick={handleSave}>
          {saved ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved!
            </>
          ) : "Save Changes"}
        </button>
      </div>
    </div>
  );
}