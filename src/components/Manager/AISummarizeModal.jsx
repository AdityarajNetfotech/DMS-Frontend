import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Copy, Check, Settings, Key } from 'lucide-react';
import { API_BASE_URL } from "../../config/api";

export default function AISummarizeModal({ isOpen, onClose, item, companySlug }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Custom API key configuration states
  const [showConfig, setShowConfig] = useState(false);
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('dms_gemini_key') || '');
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('dms_openai_key') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchSummary();
    } else {
      setSummary('');
      setError('');
      setCopied(false);
      setShowConfig(false);
      setSaveSuccess(false);
    }
  }, [isOpen, item]);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const token = localStorage.getItem('accessToken');
      const isFolder = item.kind === 'folder';
      const endpoint = isFolder
        ? `/api/${companySlug}/manager/folders/${item._id}/summarize`
        : `/api/${companySlug}/manager/documents/${item._id}/summarize`;

      const savedGemini = localStorage.getItem('dms_gemini_key') || '';
      const savedOpenai = localStorage.getItem('dms_openai_key') || '';

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (savedGemini) headers['x-gemini-key'] = savedGemini;
      if (savedOpenai) headers['x-openai-key'] = savedOpenai;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.data.summary);
      } else {
        throw new Error(data.message || 'Failed to generate summary');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the summary.');
      // Automatically prompt key configuration on failure
      if (err.message?.includes('API keys') || err.message?.includes('credentials') || err.message?.includes('key')) {
        setShowConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary)
        .then(() => {
          setCopied(true);
          alert("Summary copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Clipboard API failed, using fallback:', err);
          fallbackCopy(summary);
        });
    } else {
      fallbackCopy(summary);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      alert("Summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert("Failed to copy summary. Please copy manually.");
    }
    document.body.removeChild(textArea);
  };

  const handleSaveKeys = (e) => {
    e.preventDefault();
    localStorage.setItem('dms_gemini_key', geminiKey.trim());
    localStorage.setItem('dms_openai_key', openaiKey.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowConfig(false);
      fetchSummary();
    }, 1200);
  };

  const handleClearKeys = () => {
    localStorage.removeItem('dms_gemini_key');
    localStorage.removeItem('dms_openai_key');
    setGeminiKey('');
    setOpenaiKey('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowConfig(false);
      fetchSummary();
    }, 1200);
  };

  if (!isOpen || !item) return null;

  const renderSummaryContent = () => {
    if (!summary) return null;
    const lines = summary.split('\n');
    return (
      <ul className="space-y-3.5 text-slate-700">
        {lines.map((line, idx) => {
          const cleanLine = line.trim().replace(/^[-*•]\s+/, '');
          if (!cleanLine) return null;
          return (
            <li key={idx} className="flex items-start gap-3 leading-relaxed text-sm">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-600 shadow-sm shadow-violet-400" />
              <span>{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-700 p-5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md">
              <Sparkles size={18} className="text-violet-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">AI Summarizer</h2>
              <p className="text-[10px] text-violet-200 uppercase font-semibold tracking-wider">
                {item.kind === 'folder' ? 'Folder Summary' : 'File Summary'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`rounded-full p-1.5 transition ${showConfig ? 'bg-white/20 text-white' : 'text-violet-100 hover:bg-white/10 hover:text-white'}`}
              title="Configure API Keys"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-violet-100 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[240px] max-h-[420px] overflow-y-auto bg-slate-50/30">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Item</span>
              <span className="text-base font-bold text-slate-800 break-all">{item.name || item.title}</span>
            </div>
          </div>

          {showConfig ? (
            /* API Key Config Form */
            <form onSubmit={handleSaveKeys} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-violet-700 font-semibold text-sm mb-2">
                <Key size={16} />
                <span>Configure Custom API Keys</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Your keys are saved locally in your browser and used only to request summaries.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gemini API Key (Free tier)</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">OpenAI API Key (Fallback)</label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 gap-2">
                <button
                  type="button"
                  onClick={handleClearKeys}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear Keys
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 flex items-center gap-1"
                  >
                    {saveSuccess ? <Check size={14} /> : 'Save & Retry'}
                  </button>
                </div>
              </div>
            </form>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
              <div className="space-y-1.5 text-center">
                <p className="text-sm font-semibold text-slate-700">Analyzing content...</p>
                <p className="text-xs text-slate-400">This might take a few moments depending on size.</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 flex flex-col gap-2">
              <p className="font-semibold">Generation Failed</p>
              <p>{error}</p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={fetchSummary}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => setShowConfig(true)}
                  className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  Set API Key
                </button>
              </div>
            </div>
          ) : summary ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              {renderSummaryContent()}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              No summary available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-white flex justify-end gap-3">
          {summary && !loading && !showConfig && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy Summary
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
