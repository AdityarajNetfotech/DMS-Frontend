export default function EmailSMTPCard() {
  return (
    <div className="bg-white border rounded-2xl p-7">
      <h2 className="text-xl font-semibold">
        Email (SMTP) Gateway
      </h2>

      <p className="text-gray-500">
        External mail server configuration for system notifications.
      </p>

      <div className="border-t mt-5 pt-5 space-y-6">
        <div className="grid grid-cols-[170px_1fr] gap-5">
          <label>SMTP Host</label>

          <input
            defaultValue="smtp.provider.com"
            className="h-12 border rounded-xl px-4"
          />
        </div>

        <div className="grid grid-cols-[170px_1fr] gap-5">
          <label>Port</label>

          <input
            defaultValue="587"
            className="w-24 h-12 border rounded-xl px-4"
          />
        </div>

        <div className="grid grid-cols-[170px_1fr] gap-5">
          <label>Sender Address</label>

          <input
            defaultValue="noreply@nexus-dms.cloud"
            className="h-12 border rounded-xl px-4"
          />
        </div>

        <div className="pt-4 border-t">
          <button className="bg-[#E8EEFF] text-blue-700 px-6 py-3 rounded-xl">
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
}