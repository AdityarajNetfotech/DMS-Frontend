export default function StorageUsage({ items = [], storageUsed = 0, maxStorageLimit = 0, formatBytes }) {
  const displayItems = items.length > 0 ? items : [
    { label: "No data", value: 0 },
  ];

  const fmt = formatBytes || ((b) => `${(b / (1024*1024)).toFixed(1)} MB`);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">
        Storage Usage
      </h3>

      {maxStorageLimit > 0 && (
        <p className="text-sm text-slate-500 mt-1">
          {fmt(storageUsed)} / {fmt(maxStorageLimit)} used
        </p>
      )}

      <div className="mt-6 space-y-5">
        {displayItems.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between text-sm">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{
                  width: `${item.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}