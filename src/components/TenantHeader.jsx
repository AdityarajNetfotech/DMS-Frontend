import { ArrowRightLeft, Pencil } from "lucide-react";

export default function TenantHeader() {
  return (
    <div className="bg-white border rounded-3xl p-8">
      <div className="flex justify-between items-start">
        <div className="flex gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#E8EEF8] p-2">
            <img
              src="https://placehold.co/80x80"
              alt=""
              className="rounded-xl"
            />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-bold">Acme Global</h1>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                Active
              </span>
            </div>

            <p className="text-gray-500 mt-2">
              Global Enterprise Tenant • Joined Mar 2023
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="border border-blue-600 text-blue-600 px-5 py-3 rounded-xl flex items-center gap-2">
            <ArrowRightLeft size={18} />
            Impersonate
          </button>

          <button className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2">
            <Pencil size={18} />
            Edit Tenant
          </button>
        </div>
      </div>

      <div className="flex gap-10 mt-8 border-b">
        <button className="border-b-2 border-blue-600 pb-3 text-blue-600 font-medium">
          Overview
        </button>

        <button className="pb-3 text-gray-500">
          Activity
        </button>

        <button className="pb-3 text-gray-500">
          Configuration
        </button>

        <button className="pb-3 text-gray-500">
          Audit Logs
        </button>
      </div>
    </div>
  );
}