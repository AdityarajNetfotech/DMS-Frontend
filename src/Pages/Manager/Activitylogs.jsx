import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  Trash2,
  FileText,
  Folder,
  LogIn,
  LogOut,
  Share2,
  UploadCloud,
  Edit3,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Laptop,
  RefreshCw,
  Clock,
  User,
  Info,
  X
} from 'lucide-react';

import MainLayout from '../../layout/MainLayout';
import { API_BASE_URL } from '../../config/api';

const getActionStyle = (action = '') => {
  const act = action.toLowerCase();
  if (act.includes('permanently delete')) {
    return { bg: 'bg-rose-950/20 text-rose-400 border-rose-500/40', icon: Trash2, label: 'Permanent Delete' };
  }
  if (act.includes('delete')) {
    return { bg: 'bg-red-500/15 text-red-400 border-red-500/30', icon: Trash2, label: 'Deleted' };
  }
  if (act.includes('restore')) {
    return { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: RefreshCw, label: 'Restored' };
  }
  if (act.includes('login')) {
    return { bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', icon: LogIn, label: 'Login' };
  }
  if (act.includes('logout')) {
    return { bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: LogOut, label: 'Logout' };
  }
  if (act.includes('upload')) {
    return { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: UploadCloud, label: 'Uploaded' };
  }
  if (act.includes('update') || act.includes('edit')) {
    return { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Edit3, label: 'Updated' };
  }
  if (act.includes('share')) {
    return { bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', icon: Share2, label: 'Shared' };
  }
  if (act.includes('download')) {
    return { bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30', icon: Download, label: 'Downloaded' };
  }
  if (act.includes('preview')) {
    return { bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30', icon: Eye, label: 'Previewed' };
  }
  return { bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: Info, label: action };
};

const getResourceIcon = (resource = '', action = '') => {
  const act = action.toLowerCase();
  if (act.includes('login') || act.includes('logout') || resource === 'Auth') return LogIn;
  if (resource === 'Folder') return Folder;
  if (resource === 'Share') return Share2;
  return FileText;
};

export default function Activitylogs() {
  const { companySlug: paramSlug } = useParams();
  const companySlug = paramSlug || localStorage.getItem('companySlug') || '';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalLogs: 0, totalDeletions: 0, totalLogins: 0, totalUploads: 0 });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [actionCategory, setActionCategory] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
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
      let url = `${API_BASE_URL}/api/${companySlug}/manager/activity-logs?page=${page}&limit=20`;

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
        setError(data.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Audit logs fetch error:', err);
      setError(err.message || 'Network error while loading audit trails.');
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
    <MainLayout>
      <div className="space-y-6">

        {/* Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <ShieldCheck size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Audit Logs & Activity Trails
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              Complete chronological audit trail of all file deletions, uploads, updates, shares, and user logins/logouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Download size={15} />
              <span>Export Audit CSV</span>
            </button>
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh Logs"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Events</p>
              <h3 className="text-xl font-bold text-slate-900">{stats.totalLogs}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deletions (Files & Folders)</p>
              <h3 className="text-xl font-bold text-red-600">{stats.totalDeletions}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <LogIn size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logins & Sessions</p>
              <h3 className="text-xl font-bold text-indigo-600">{stats.totalLogins}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploads</p>
              <h3 className="text-xl font-bold text-emerald-600">{stats.totalUploads}</h3>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit trail by file name, manager/user, IP address, or action..."
                className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick Action Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={actionCategory}
                onChange={(e) => { setActionCategory(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none transition cursor-pointer"
              >
                <option value="ALL">All Actions</option>
                <option value="DELETIONS">🗑️ File & Folder Deletions</option>
                <option value="LOGINS">🔑 Logins & Logouts</option>
                <option value="UPLOADS">📤 File Uploads</option>
                <option value="UPDATES">✏️ Metadata Edits</option>
                <option value="SHARES">🔗 Shares & Permissions</option>
              </select>

              <select
                value={resourceFilter}
                onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none transition cursor-pointer"
              >
                <option value="ALL">All Resources</option>
                <option value="Document">Documents</option>
                <option value="Folder">Folders</option>
                <option value="Auth">Auth / Sessions</option>
                <option value="Share">Shares</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none transition cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="7DAYS">Last 7 Days</option>
                <option value="30DAYS">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {error && (
            <div className="p-4 bg-amber-50 text-amber-800 text-xs font-semibold border-b border-amber-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">User / Manager</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Resource & Name</th>
                  <th className="px-4 py-3.5">IP Address & Device</th>
                  <th className="px-4 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-500 font-medium">
                      <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-500 font-medium">
                      <ShieldCheck size={32} className="text-slate-400 mx-auto mb-2" />
                      No audit log events found matching the filter criteria.
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
                      <tr key={log._id} className="hover:bg-slate-50/80 transition">
                        {/* Timestamp */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{formatDate(log.createdAt)}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">{formatTime(log.createdAt)}</div>
                        </td>

                        {/* User / Manager */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-[150px]" title={user.name || 'User'}>
                                {user.name || 'System / User'}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <span className="truncate max-w-[130px]">{user.email || '—'}</span>
                                {user.role && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                                    {user.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${style.bg}`}>
                            <ActionIcon size={12} />
                            <span>{log.action}</span>
                          </span>
                        </td>

                        {/* Resource & Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 max-w-xs">
                            <ResourceIcon size={16} className="text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate" title={log.resourceName || String(log.resourceId || '—')}>
                              {log.resourceName || String(log.resourceId || '—')}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase font-bold shrink-0">
                              {log.resource}
                            </span>
                          </div>
                        </td>

                        {/* IP & Device */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-mono text-[11px] text-slate-700 flex items-center gap-1">
                            <Globe size={11} className="text-slate-400" />
                            <span>{log.ipAddress || '127.0.0.1'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Laptop size={11} className="text-slate-400" />
                            <span>{log.browser || 'Browser'} • {log.operatingSystem || 'OS'}</span>
                          </div>
                        </td>

                        {/* Details Action */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                            title="Inspect Log Metadata"
                          >
                            <Info size={14} />
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
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Showing page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} total records)
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Log Details Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Audit Log Inspector</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Event ID:</span>
                <span className="font-mono text-slate-900">{selectedLog._id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Action:</span>
                <span className="font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Actor / User:</span>
                <span className="font-bold text-slate-900">{selectedLog.managerId?.name || 'System'} ({selectedLog.managerId?.email || '—'})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Resource:</span>
                <span className="font-semibold text-slate-900">{selectedLog.resource}: {selectedLog.resourceName || selectedLog.resourceId || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Client IP Address:</span>
                <span className="font-mono text-slate-900">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Browser & OS:</span>
                <span>{selectedLog.browser || 'Unknown'} on {selectedLog.operatingSystem || 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Timestamp:</span>
                <span className="font-mono">{selectedLog.createdAt}</span>
              </div>

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-1.5">Extended Metadata:</span>
                  <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
