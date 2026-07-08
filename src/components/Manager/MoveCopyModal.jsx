import React, { useState } from 'react';
import { X, FolderOutput, Loader2, ChevronRight, ChevronDown, Folder } from 'lucide-react';

export default function MoveCopyModal({ isOpen, onClose, onSubmit, title, actionName, folderTree }) {
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // We allow moving/copying to root if selectedFolderId is null, but if we require it:
    // if (!selectedFolderId) { setError('Please select a destination folder'); return; }

    setLoading(true);
    try {
      await onSubmit(selectedFolderId);
      setSelectedFolderId(null);
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${actionName.toLowerCase()} item`);
    } finally {
      setLoading(false);
    }
  };

  const renderTree = (folders, depth = 0) => {
    return folders.map((folder) => (
      <div key={folder._id} className="mb-1">
        <button
          type="button"
          onClick={() => setSelectedFolderId(folder._id)}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          className={`flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-sm transition ${
            selectedFolderId === folder._id
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          {folder.children?.length > 0 ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <span className="w-4" />
          )}
          <Folder size={18} className={selectedFolderId === folder._id ? 'text-blue-600' : 'text-amber-500'} />
          <span className="truncate">{folder.name}</span>
        </button>
        {folder.children?.length > 0 && (
          <div className="mt-1">
            {renderTree(folder.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <FolderOutput className="text-blue-600" size={24} />
            {title}
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
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Select Destination Folder
            </label>
            <div className="h-64 overflow-y-auto rounded-lg border border-slate-200 p-2">
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm transition ${
                  selectedFolderId === null
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Folder size={18} className={selectedFolderId === null ? 'text-blue-600' : 'text-slate-400'} />
                <span>Root (My Documents)</span>
              </button>
              <div className="mt-2">
                {renderTree(folderTree || [])}
              </div>
            </div>
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : actionName}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
