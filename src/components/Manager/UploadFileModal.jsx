import React, { useState, useRef } from 'react';
import { X, UploadCloud, File, Loader2 } from 'lucide-react';

export default function UploadFileModal({ isOpen, onClose, onUpload, currentFolderId }) {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = Array.from(e.dataTransfer.files);
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
      setError('');
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setLoading(true);
    try {
      for (const fileItem of files) {
        const formData = new FormData();
        formData.append('file', fileItem);
        formData.append('name', fileItem.name);
        if (description) formData.append('description', description);
        if (currentFolderId) formData.append('folderId', currentFolderId);

        await onUpload(formData);
      }
      setFiles([]);
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <UploadCloud className="text-blue-600" size={24} />
            Upload Documents
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
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            {files.length > 0 ? (
              <div className="flex flex-col items-stretch w-full gap-2 text-blue-700">
                <div className="flex items-center justify-center gap-2">
                  <File size={32} className="text-blue-600" />
                  <span className="font-semibold text-slate-700">{files.length} files selected</span>
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1.5 text-left text-xs">
                  {files.map((f, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between rounded bg-white p-2 border border-slate-200 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <File size={14} className="text-blue-500 shrink-0" />
                        <span className="truncate text-slate-700 font-medium">{f.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 font-bold px-1 text-sm transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <UploadCloud size={40} className="text-slate-400" />
                <span className="font-semibold text-slate-700">Click to browse or drag files here</span>
                <span className="text-xs">Supports PDF, DOCX, XLSX, etc. (Multiple files allowed)</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
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
              disabled={loading || files.length === 0}
              className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
