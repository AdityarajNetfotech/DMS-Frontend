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

            {/* Social Share Buttons */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Share via</label>
              <div className="flex items-center gap-3 flex-wrap">

                {/* WhatsApp */}
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out this document: ' + shareLink)}`, '_blank')}
                  title="Share on WhatsApp"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#25D366] shadow-md transition group-hover:scale-110 group-hover:shadow-lg">
                    <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                      <path d="M16 2C8.28 2 2 8.28 2 16c0 2.47.67 4.79 1.84 6.78L2 30l7.43-1.8A13.93 13.93 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.44 11.44 0 01-5.85-1.6l-.42-.25-4.41 1.07 1.1-4.3-.27-.44A11.5 11.5 0 1116 27.5zm6.3-8.6c-.34-.17-2.02-1-2.33-1.11-.31-.12-.54-.17-.76.17-.22.34-.86 1.11-1.05 1.34-.2.22-.39.25-.73.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.76-1.83-1.04-2.51-.27-.66-.55-.57-.76-.58h-.65c-.22 0-.57.08-.87.42-.3.34-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.17.22 2.3 3.51 5.57 4.92.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 2.02-.83 2.31-1.62.28-.8.28-1.48.2-1.62-.09-.14-.31-.22-.65-.39z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">WhatsApp</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('Check out this document')}`, '_blank')}
                  title="Share on Telegram"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#229ED9] shadow-md transition group-hover:scale-110 group-hover:shadow-lg">
                    <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                      <path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm6.88 9.56l-2.37 11.17c-.18.79-.65 .98-1.31.61l-3.64-2.68-1.75 1.69c-.19.19-.36.35-.74.35l.26-3.72 6.82-6.16c.3-.26-.07-.41-.45-.15L9.4 19.06l-3.58-1.12c-.78-.24-.79-.78.16-1.16l13.98-5.39c.65-.24 1.21.16.92 1.17z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Telegram</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`, '_blank')}
                  title="Share on LinkedIn"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0A66C2] shadow-md transition group-hover:scale-110 group-hover:shadow-lg">
                    <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                      <path d="M27.26 27.27h-4.74v-7.4c0-1.77-.03-4.04-2.46-4.04-2.47 0-2.84 1.93-2.84 3.92v7.52h-4.74V12.24h4.55v2.09h.06c.63-1.2 2.18-2.46 4.49-2.46 4.8 0 5.69 3.16 5.69 7.27v8.13zM7.12 10.15a2.75 2.75 0 110-5.5 2.75 2.75 0 010 5.5zM9.5 27.27H4.74V12.24H9.5v15.03z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">LinkedIn</span>
                </button>

                {/* Naukri */}
                <button
                  onClick={() => window.open(`https://www.naukri.com/`, '_blank')}
                  title="Share on Naukri"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#ff7555] shadow-md transition group-hover:scale-110 group-hover:shadow-lg">
                    <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                      <path d="M16 3C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm-1.5 18.5v-11l8 5.5-8 5.5z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Naukri</span>
                </button>

                {/* Instagram — copy link (Instagram has no web share URL) */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    window.open('https://www.instagram.com/', '_blank');
                  }}
                  title="Copy link & open Instagram"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-md transition group-hover:scale-110 group-hover:shadow-lg"
                    style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
                  >
                    <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white">
                      <path d="M16 3.6c-3.35 0-3.77.01-5.09.07-1.31.06-2.2.27-2.98.57a6.01 6.01 0 00-2.17 1.41A6.01 6.01 0 004.24 7.93c-.3.78-.51 1.67-.57 2.98C3.61 12.23 3.6 12.65 3.6 16s.01 3.77.07 5.09c.06 1.31.27 2.2.57 2.98a6.01 6.01 0 001.41 2.17 6.01 6.01 0 002.17 1.41c.78.3 1.67.51 2.98.57 1.32.06 1.74.07 5.09.07s3.77-.01 5.09-.07c1.31-.06 2.2-.27 2.98-.57a6.01 6.01 0 002.17-1.41 6.01 6.01 0 001.41-2.17c.3-.78.51-1.67.57-2.98.06-1.32.07-1.74.07-5.09s-.01-3.77-.07-5.09c-.06-1.31-.27-2.2-.57-2.98a6.01 6.01 0 00-1.41-2.17 6.01 6.01 0 00-2.17-1.41c-.78-.3-1.67-.51-2.98-.57C19.77 3.61 19.35 3.6 16 3.6zm0 2.23c3.29 0 3.68.01 4.98.07 1.2.05 1.85.25 2.29.41.57.22.98.49 1.41.92.43.43.7.84.92 1.41.16.44.36 1.09.41 2.29.06 1.3.07 1.69.07 4.98s-.01 3.68-.07 4.98c-.05 1.2-.25 1.85-.41 2.29a3.83 3.83 0 01-.92 1.41c-.43.43-.84.7-1.41.92-.44.16-1.09.36-2.29.41-1.3.06-1.69.07-4.98.07s-3.68-.01-4.98-.07c-1.2-.05-1.85-.25-2.29-.41a3.83 3.83 0 01-1.41-.92 3.83 3.83 0 01-.92-1.41c-.16-.44-.36-1.09-.41-2.29C5.84 19.68 5.83 19.29 5.83 16s.01-3.68.07-4.98c.05-1.2.25-1.85.41-2.29.22-.57.49-.98.92-1.41.43-.43.84-.7 1.41-.92.44-.16 1.09-.36 2.29-.41C12.32 5.84 12.71 5.83 16 5.83zm0 3.8a6.37 6.37 0 100 12.74A6.37 6.37 0 0016 9.63zm0 10.5a4.13 4.13 0 110-8.27 4.13 4.13 0 010 8.27zm8.1-10.76a1.49 1.49 0 11-2.97 0 1.49 1.49 0 012.97 0z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Instagram</span>
                </button>

              </div>
              <p className="mt-2 text-[10px] text-slate-400">* Instagram: link is copied to clipboard, then paste it in your post/story.</p>
            </div>

            <div className="mt-4 flex justify-end">
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
