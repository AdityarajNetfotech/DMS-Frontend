import React, { useState, useEffect } from 'react';
import { X, Share2, Loader2, Copy } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function ShareDocumentModal({ isOpen, onClose, onShare, document, companySlug }) {
  const [sharingType, setSharingType] = useState('External');
  const [expiryDays, setExpiryDays] = useState('7');
  const [password, setPassword] = useState('');
  const [canDownload, setCanDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [viewers, setViewers] = useState([]);
  const [selectedViewers, setSelectedViewers] = useState([]);

  useEffect(() => {
    if (isOpen && sharingType === 'Internal' && companySlug) {
      const fetchViewers = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/${companySlug}/users`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          const data = await res.json();
          if (data.success) {
            const list = data.data.filter(u => u.role === 'Viewer');
            setViewers(list);
            // Default to all selected
            setSelectedViewers(list.map(v => v._id));
          }
        } catch (err) {
          console.error("Failed to fetch viewers", err);
        }
      };
      fetchViewers();
    } else {
      setViewers([]);
      setSelectedViewers([]);
    }
  }, [isOpen, sharingType, companySlug]);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const expiryDate = expiryDays ? new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000) : null;
      
      const payload = {
        sharingType,
        permissions: {
          readOnly: true,
          download: canDownload
        },
        sharedWithViewers: sharingType === 'Internal' ? selectedViewers : []
      };

      if (expiryDate) payload.expiryDate = expiryDate.toISOString();
      if (password) {
        payload.password = password;
        payload.isPasswordProtected = true;
      }

      const result = await onShare(document._id, payload);
      if (sharingType === 'Internal') {
        setSuccessMessage('Document has been shared successfully with the selected viewers.');
      } else {
        setShareLink(result.shareLink);
      }
    } catch (err) {
      setError(err.message || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleClose = () => {
    setShareLink('');
    setSuccessMessage('');
    setPassword('');
    setExpiryDays('7');
    setSharingType('External');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Share2 className="text-blue-600" size={24} />
            Share Document
          </h2>
          <button
            onClick={handleClose}
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

        {successMessage ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-1">Shared Successfully!</h3>
              <p className="text-sm text-emerald-600">{successMessage}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : shareLink ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-1">Link Created Successfully!</h3>
              <p className="text-sm text-emerald-600">Anyone with this link can access the document based on your settings.</p>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-100 px-3 text-blue-700 transition hover:bg-blue-200"
                  title="Copy to clipboard"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Sharing Type</label>
              <select
                value={sharingType}
                onChange={(e) => setSharingType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="External">External (Anyone with link)</option>
                <option value="Internal">Internal (Only organization users)</option>
              </select>
            </div>

            {sharingType === 'Internal' && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Select Viewers</span>
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={viewers.length > 0 && selectedViewers.length === viewers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedViewers(viewers.map(v => v._id));
                        } else {
                          setSelectedViewers([]);
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Select All Viewers
                  </label>
                </div>
                
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2.5 space-y-2 bg-slate-50/50">
                  {viewers.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2 text-center">No viewers found in company.</p>
                  ) : (
                    viewers.map(v => (
                      <label key={v._id} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:bg-slate-100/50 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedViewers.includes(v._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedViewers(prev => [...prev, v._id]);
                            } else {
                              setSelectedViewers(prev => prev.filter(id => id !== v._id));
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <span>{v.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{v.email}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Link Expiry</label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Never expire</option>
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password Protection (Optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for no password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="canDownload"
                checked={canDownload}
                onChange={(e) => setCanDownload(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="canDownload" className="text-sm text-slate-700">
                Allow viewer to download the document
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
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
                {loading ? <Loader2 size={18} className="animate-spin" /> : (sharingType === 'Internal' ? 'Share Document' : 'Create Link')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
