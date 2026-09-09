import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Search,
  Filter,
  Trash2,
  LogIn,
  LogOut,
  UploadCloud,
  Edit3,
  Share2,
  Eye,
  RefreshCw,
  Clock,
  Globe,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  FileText,
  Folder
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const getActionStyle = (action = '') => {
  const act = action.toLowerCase();
  if (act.includes('permanently delete')) {
    return { bg: 'bg-rose-100 text-rose-700 border-rose-200', icon: Trash2 };
  }
  if (act.includes('delete')) {
    return { bg: 'bg-red-50 text-red-700 border-red-200', icon: Trash2 };
  }
  if (act.includes('restore')) {
    return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: RefreshCw };
  }
  if (act.includes('login')) {
    return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: LogIn };
  }
  if (act.includes('logout')) {
    return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: LogOut };
  }
  if (act.includes('upload')) {
    return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: UploadCloud };
  }
  if (act.includes('update') || act.includes('edit')) {
    return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Edit3 };
  }
  if (act.includes('share')) {
    return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: Share2 };
  }
  if (act.includes('download')) {
    return { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: Download };
  }
  return { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Info };
};

const getResourceIcon = (resource = '', action = '') => {
  const act = action.toLowerCase();
  if (act.includes('login') || act.includes('logout') || resource === 'Auth') return LogIn;
  if (resource === 'Folder') return Folder;
  if (resource === 'Share') return Share2;
  return FileText;
};

export default function AuditLogsContent() {
  const { companySlug: paramSlug } = useParams();
  const companySlug = paramSlug || localStorage.getItem('companySlug') || '';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalLogs: 0, totalDeletions: 0, totalLogins: 0, totalUploads: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionCategory, setActionCategory] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    if (!companySlug) {
      setError('Company identifier not found. Please log in again.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication session missing. Please log in.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/api/${companySlug}/manager/activity-logs?page=${page}&limit=25`;

      if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      if (actionCategory !== 'ALL') url += `&action=${actionCategory}`;
      if (resourceFilter !== 'ALL') url += `&resource=${resourceFilter}`;

      if (dateFilter === 'TODAY') {
        const todayStr = new Date().toISOString().split('T')[0];
        url += `&startDate=${todayStr}`;
      } else if (dateFilter === '7DAYS') {
        const past7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        url += `&startDate=${past7}`;
      } else if (dateFilter === '30DAYS') {
        const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        url += `&startDate=${past30}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || `Server error (${res.status}): Failed to retrieve logs`);
        return;
      }

      if (data.success && data.data) {
        setLogs(data.data.logs || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalCount(data.data.pagination?.total || 0);
        if (data.data.stats) setStats(data.data.stats);
      } else {
        setError(data.message || 'Failed to load organization audit logs');
      }
    } catch (err) {
      console.error('Admin audit logs error:', err);
      setError(err.message || 'Network error while retrieving organization audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [companySlug, page, actionCategory, resourceFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExportCSV = () => {
    const slug = companySlug || localStorage.getItem('companySlug') || '';
    const token = localStorage.getItem('accessToken');
    if (!slug) return;
    let url = `${API_BASE_URL}/api/${slug}/manager/activity-logs/export?token=${token}`;
    if (actionCategory !== 'ALL') url += `&action=${actionCategory}`;
    if (resourceFilter !== 'ALL') url += `&resource=${resourceFilter}`;
    if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <ShieldAlert size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Audit Logs
            </h1>
          </div>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Real-time compliance audit trail across all managers, viewers, and administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-sm transition cursor-pointer text-xs sm:text-sm"
          >
            <Download size={16} />
            Export Audit Trail
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Activity Events</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalLogs}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">File & Folder Deletions</p>
            <h3 className="text-2xl font-black text-red-600 mt-0.5">{stats.totalDeletions}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <LogIn size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logins & Sessions</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-0.5">{stats.totalLogins}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UploadCloud size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Document Uploads</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.totalUploads}</h3>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by manager name, email, file name, IP, or event type..."
            className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={actionCategory}
            onChange={(e) => { setActionCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 focus:outline-none transition cursor-pointer"
          >
            <option value="ALL">All Event Types</option>
            <option value="DELETIONS">🗑️ File & Folder Deletions</option>
            <option value="LOGINS">🔑 Logins & Logouts</option>
            <option value="UPLOADS">📤 File Uploads</option>
            <option value="UPDATES">✏️ Metadata Edits</option>
            <option value="SHARES">🔗 Shares & Permissions</option>
          </select>

          <select
            value={resourceFilter}
            onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 focus:outline-none transition cursor-pointer"
          >
            <option value="ALL">All Resources</option>
            <option value="Document">Documents</option>
            <option value="Folder">Folders</option>
            <option value="Auth">Auth & Sessions</option>
            <option value="Share">Shares</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 focus:outline-none transition cursor-pointer"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="7DAYS">Last 7 Days</option>
            <option value="30DAYS">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {error && (
          <div className="p-4 bg-amber-50 text-amber-800 text-xs font-bold border-b border-amber-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-4 py-4">Manager / User</th>
                <th className="px-4 py-4">Action</th>
                <th className="px-4 py-4">Resource & Target</th>
                <th className="px-4 py-4">IP Address & Client</th>
                <th className="px-4 py-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-gray-500 font-semibold">
                    <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                    Loading organization audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-gray-500 font-semibold">
                    <ShieldCheck size={36} className="text-gray-300 mx-auto mb-2" />
                    No audit logs recorded matching this criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const style = getActionStyle(log.action);
                  const ActionIcon = style.icon;
                  const ResourceIcon = getResourceIcon(log.resource, log.action);
                  const user = log.managerId || {};
                  const initials = (user.name || 'User')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={log._id} className="hover:bg-gray-50/80 transition">
                      {/* Date / Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{formatDate(log.createdAt)}</div>
                        <div className="text-[11px] font-mono text-gray-500 mt-0.5">{formatTime(log.createdAt)}</div>
                      </td>

                      {/* User / Manager */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate max-w-[160px]" title={user.name || 'User'}>
                              {user.name || 'System'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <span className="truncate max-w-[130px]">{user.email || '—'}</span>
                              {user.role && (
                                <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                                  {user.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${style.bg}`}>
                          <ActionIcon size={12} />
                          <span>{log.action}</span>
                        </span>
                      </td>

                      {/* Resource */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 max-w-sm">
                          <ResourceIcon size={16} className="text-gray-400 shrink-0" />
                          <span className="font-semibold text-gray-900 truncate" title={log.resourceName || String(log.resourceId || '—')}>
                            {log.resourceName || String(log.resourceId || '—')}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase shrink-0">
                            {log.resource}
                          </span>
                        </div>
                      </td>

                      {/* IP & Device */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-gray-800 flex items-center gap-1">
                          <Globe size={12} className="text-gray-400" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Laptop size={12} className="text-gray-400" />
                          <span>{log.browser || 'Browser'} • {log.operatingSystem || 'OS'}</span>
                        </div>
                      </td>

                      {/* Action Detail */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition cursor-pointer"
                          title="View metadata"
                        >
                          <Info size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 font-medium">
            Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span> ({totalCount} total audit records)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Audit Trail Inspector</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-semibold">Event ID:</span>
                <span className="font-mono text-gray-900">{selectedLog._id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-semibold">Action:</span>
                <span className="font-bold text-gray-900">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-semibold">Actor / Manager:</span>
                <span className="font-bold text-gray-900">{selectedLog.managerId?.name || 'System'} ({selectedLog.managerId?.email || '—'})</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-semibold">Resource:</span>
                <span className="font-semibold text-gray-900">{selectedLog.resource}: {selectedLog.resourceName || selectedLog.resourceId || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-semibold">Client IP:</span>
                <span className="font-mono text-gray-900">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-semibold">Client Agent:</span>
                <span>{selectedLog.browser || 'Unknown'} on {selectedLog.operatingSystem || 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-semibold">Event Timestamp:</span>
                <span className="font-mono">{selectedLog.createdAt}</span>
              </div>

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <span className="text-gray-400 font-semibold block mb-1.5">Extended Metadata:</span>
                  <pre className="p-3 bg-gray-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
