export const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export const calculateStats = (
  consultations
) => ({
  total: consultations.length,

  pending: consultations.filter(
    (c) => c.status === "Pending"
  ).length,

  completed: consultations.filter(
    (c) => c.status === "Completed"
  ).length,

  cancelled: consultations.filter(
    (c) => c.status === "Cancelled"
  ).length,

  progress: consultations.filter(
    (c) => c.status === "In Progress"
  ).length,
});