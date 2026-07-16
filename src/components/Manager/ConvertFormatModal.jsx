import React, { useState } from 'react';
import { X, RefreshCw, Loader2 } from 'lucide-react';

export default function ConvertFormatModal({ isOpen, onClose, onConvert, item }) {
  const [format, setFormat] = useState('PDF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onConvert(item, format);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to convert document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <RefreshCw className="text-blue-600 animate-spin-slow" size={22} />
            Convert File Format
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Select the target file format you wish to convert <strong className="text-slate-800">{item.name || item.title}</strong> into:
            </p>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Target Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="PDF">PDF (Portable Document Format)</option>
              <option value="HTML">HTML (HyperText Markup Language)</option>
              <option value="TXT">TXT (Plain Text Document)</option>
              <option value="DOCX">DOCX (Word Document)</option>
              <option value="XLSX">XLSX (Excel Spreadsheet)</option>
              <option value="PPTX">PPTX (PowerPoint Presentation)</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Convert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
