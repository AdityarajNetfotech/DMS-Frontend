import { Trash2, RotateCcw, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function RestoredFromTrash({ count = 0 }) {
  const navigate = useNavigate();
  const { companySlug } = useParams();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Trash Recovery
          </h2>
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <RotateCcw size={20} className="animate-spin-slow" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {count}
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Files & folders restored from trash
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/${companySlug}/manager/trash`)}
        className="mt-6 w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-800 transition-all duration-200 active:scale-[0.98]"
      >
        <span>View Trash Bin</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
