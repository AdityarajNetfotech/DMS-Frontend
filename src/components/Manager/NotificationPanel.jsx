export default function NotificationPanel({ notifications = [] }) {
  const displayNotifications = notifications.length > 0 ? notifications : [
    "No new notifications",
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">
        Notifications
      </h3>

      <div className="mt-5 space-y-4">
        {displayNotifications.map((item, i) => (
          <div
            key={i}
            className="rounded-xl bg-slate-50 p-3 text-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}