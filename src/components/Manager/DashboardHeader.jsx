import { Upload } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          Manage your documents and storage
        </p>
      </div>

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm">
        <Upload size={18} />
        Upload Document
      </button>
    </div>
  );
}