import { Upload } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  buttonText,
  icon: Icon,
  onButtonClick,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-2 max-w-2xl">{subtitle}</p>
      </div>

      {buttonText ? (
        <button
          type="button"
          onClick={onButtonClick}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white shadow-sm transition hover:bg-blue-700"
        >
          {Icon ? <Icon size={18} /> : <Upload size={18} />}
          {buttonText}
        </button>
      ) : null}
    </div>
  );
}
