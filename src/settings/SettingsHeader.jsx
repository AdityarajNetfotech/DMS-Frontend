export default function SettingsHeader() {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827]">
          Platform Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Configure global environment variables,
          security protocols, and integration endpoints.
        </p>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-3 border rounded-xl bg-white">
          Discard Changes
        </button>

        <button className="px-8 py-3 rounded-xl bg-[#1450D2] text-white">
          Save Configuration
        </button>
      </div>
    </div>
  );
}