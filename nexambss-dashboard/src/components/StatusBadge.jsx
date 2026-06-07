export default function StatusBadge({ status }) {
  const cls = status.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}