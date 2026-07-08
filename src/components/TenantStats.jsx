export default function TenantStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white border rounded-2xl p-5">
        <p className="text-xs text-gray-400 uppercase">
          Tenant Admin
        </p>

        <h3 className="text-3xl font-semibold mt-2">
          Sarah Jenkins
        </h3>

        <p className="text-gray-500 mt-1">
          sarah.j@acmeglobal.com
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <p className="text-xs text-gray-400 uppercase">
          Storage Utilization
        </p>

        <h3 className="text-3xl font-bold mt-2">
          80.4 GB
        </h3>

        <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
          <div className="w-[80%] h-2 bg-blue-600 rounded-full"></div>
        </div>

        <p className="text-gray-500 text-sm mt-2">
          of 100 GB
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <p className="text-xs text-gray-400 uppercase">
          Creation Date
        </p>

        <h3 className="text-3xl font-bold mt-2">
          March 14, 2023
        </h3>

        <p className="text-gray-500 mt-2">
          342 days ago
        </p>
      </div>

      <div className="bg-[#EEF1FF] border rounded-2xl p-5">
        Security Summary
      </div>
    </div>
  );
}