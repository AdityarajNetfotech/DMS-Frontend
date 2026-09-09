import React from 'react';
import {
  Scale,
  ShieldCheck,
  Activity,
  Layers,
  Building2,
  Sparkles,
  Eye,
  FileText,
  Loader2
} from 'lucide-react';

/**
 * Enterprise Dashboard Skeleton Loader.
 * Provides a realistic, full-page shimmer skeleton screen matching
 * the exact layout and role branding of the DMS dashboards.
 */
export default function DashboardSkeletonLoader({
  title = 'Loading Dashboard...',
  subtitle = 'Synchronizing real-time analytics, metrics and audit trail...',
  role = 'default'
}) {
  const normalizedRole = (role || 'default').toLowerCase();

  const getRoleConfig = () => {
    switch (normalizedRole) {
      case 'legal':
        return {
          name: 'Legal Counsel',
          icon: <Scale size={16} className="text-purple-400 animate-pulse" />,
          bannerGradient: 'from-purple-950 via-indigo-950 to-slate-950 border-purple-800/40',
          badgeText: 'LEGAL & COMPLIANCE COUNSEL PORTAL',
          badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          accentColor: 'text-purple-600',
          accentBg: 'bg-purple-50 text-purple-600',
          spinnerColor: 'text-purple-500',
          kpiTitles: ['Awaiting Legal Action', 'Approved Contracts', 'Rejected / Non-Compliant', 'Total Legal Filings'],
          tableTitle: 'Priority Contract Queue & Review Records',
          chartTitle: 'Contract Review Velocity & Timeline'
        };
      case 'compliance':
        return {
          name: 'Compliance Officer',
          icon: <ShieldCheck size={16} className="text-emerald-400 animate-pulse" />,
          bannerGradient: 'from-emerald-950 via-teal-950 to-slate-950 border-emerald-800/40',
          badgeText: 'REGULATORY COMPLIANCE & AUDIT HUB',
          badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          accentColor: 'text-emerald-600',
          accentBg: 'bg-emerald-50 text-emerald-600',
          spinnerColor: 'text-emerald-500',
          kpiTitles: ['Pending Compliance Check', 'Compliant Documents', 'Policy Breaches / Issues', 'Total Monitored'],
          tableTitle: 'Regulatory Filing Audits & Approvals',
          chartTitle: 'Policy Compliance Frequency & Rate'
        };
      case 'reporting':
        return {
          name: 'Reporting Manager',
          icon: <Activity size={16} className="text-blue-400 animate-pulse" />,
          bannerGradient: 'from-blue-950 via-indigo-950 to-slate-950 border-blue-800/40',
          badgeText: 'DEPARTMENT REPORTING & APPROVALS',
          badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          accentColor: 'text-blue-600',
          accentBg: 'bg-blue-50 text-blue-600',
          spinnerColor: 'text-blue-500',
          kpiTitles: ['Pending My Approval', 'Approved Submissions', 'Rejected by Me', 'Total Team Queue'],
          tableTitle: 'Direct Submissions Awaiting Sign-Off',
          chartTitle: 'Submission Throughput & Review Trends'
        };
      case 'manager':
        return {
          name: 'Workspace Manager',
          icon: <Layers size={16} className="text-indigo-400 animate-pulse" />,
          bannerGradient: 'from-slate-950 via-indigo-950 to-slate-900 border-indigo-800/40',
          badgeText: 'ENTERPRISE WORKSPACE MANAGEMENT',
          badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          accentColor: 'text-indigo-600',
          accentBg: 'bg-indigo-50 text-indigo-600',
          spinnerColor: 'text-indigo-500',
          kpiTitles: ['Total Documents', 'Managed Folders', 'Shared Externally', 'Storage Consumed'],
          tableTitle: 'Recent Files & Repository Updates',
          chartTitle: 'Storage Distribution by Document Type'
        };
      case 'admin':
        return {
          name: 'Tenant Administrator',
          icon: <Building2 size={16} className="text-blue-400 animate-pulse" />,
          bannerGradient: 'from-slate-950 via-slate-900 to-blue-950 border-slate-700/60',
          badgeText: 'TENANT ADMINISTRATION & POLICIES',
          badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          accentColor: 'text-blue-600',
          accentBg: 'bg-blue-50 text-blue-600',
          spinnerColor: 'text-blue-500',
          kpiTitles: ['Enterprise Documents', 'Active Departments', 'Storage Allocation', 'Active Licenses'],
          tableTitle: 'Tenant Audit Logs & Recent File Actions',
          chartTitle: 'Departmental Storage Allocation'
        };
      case 'super-admin':
        return {
          name: 'Super Admin Master',
          icon: <Sparkles size={16} className="text-amber-400 animate-pulse" />,
          bannerGradient: 'from-slate-950 via-indigo-950 to-amber-950 border-amber-800/40',
          badgeText: 'GLOBAL MASTER CLOUD CONTROL',
          badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          accentColor: 'text-amber-600',
          accentBg: 'bg-amber-50 text-amber-600',
          spinnerColor: 'text-amber-500',
          kpiTitles: ['Total Companies', 'Active Tenants', 'Global Folders', 'Global Files'],
          tableTitle: 'Global Companies & Tenant Health Overview',
          chartTitle: 'System Growth & Storage Consumption'
        };
      case 'viewer':
        return {
          name: 'Document Viewer',
          icon: <Eye size={16} className="text-teal-400 animate-pulse" />,
          bannerGradient: 'from-slate-950 via-teal-950 to-slate-900 border-teal-800/40',
          badgeText: 'DOCUMENT VIEWER REPOSITORY',
          badgeStyle: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
          accentColor: 'text-teal-600',
          accentBg: 'bg-teal-50 text-teal-600',
          spinnerColor: 'text-teal-500',
          kpiTitles: ['Accessible Documents', 'Visible Directories', 'Shared with Me', 'Recent Accesses'],
          tableTitle: 'Recently Accessed & Shared Documents',
          chartTitle: 'Document Formats Breakdown'
        };
      default:
        return {
          name: 'Workspace Dashboard',
          icon: <FileText size={16} className="text-blue-400 animate-pulse" />,
          bannerGradient: 'from-slate-950 via-blue-950 to-slate-900 border-blue-800/40',
          badgeText: 'SECURE DOCUMENT WORKSPACE',
          badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          accentColor: 'text-blue-600',
          accentBg: 'bg-blue-50 text-blue-600',
          spinnerColor: 'text-blue-500',
          kpiTitles: ['Total Documents', 'Active Folders', 'Pending Approvals', 'Storage Usage'],
          tableTitle: 'Recent Documents & Activity',
          chartTitle: 'Storage & Activity Overview'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 select-none pointer-events-none">
      {/* 1. Sleek Floating Live-Sync Status Bar */}
      <div className="w-full flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 relative" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 size={15} className={`animate-spin ${config.spinnerColor}`} />
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              {title}
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
              — {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            {config.icon}
            <span className="hidden md:inline">{config.name}</span>
          </span>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full skeleton-shimmer-bar" />
          </div>
        </div>
      </div>

      {/* 2. Hero Welcome Banner Skeleton */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${config.bannerGradient} p-6 md:p-8 text-white shadow-xl border`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            {/* Role Badge Skeleton */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur-md bg-white/10 border-white/20">
              {config.icon}
              <div className="h-3 w-36 rounded-md skeleton-shimmer-dark" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-8 w-72 sm:w-96 rounded-xl skeleton-shimmer-dark" />
              <div className="h-4 w-full max-w-lg rounded-lg skeleton-shimmer-dark opacity-80" />
              <div className="h-4 w-3/4 max-w-md rounded-lg skeleton-shimmer-dark opacity-60" />
            </div>
          </div>

          {/* Right Action Button Skeleton */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="h-11 w-44 rounded-xl skeleton-shimmer-dark shadow-md" />
            <div className="h-11 w-32 rounded-xl skeleton-shimmer-dark opacity-75 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* 3. KPI Stat Cards Grid Skeleton (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {config.kpiTitles.map((label, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div className="space-y-2 flex-1 pr-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {label}
              </div>
              <div className="h-8 w-24 rounded-lg skeleton-shimmer" />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-3.5 w-16 rounded-md skeleton-shimmer opacity-70" />
                <div className="h-3.5 w-20 rounded-md skeleton-shimmer opacity-50" />
              </div>
            </div>

            <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              <div className="w-7 h-7 rounded-xl skeleton-shimmer opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Middle Section: Chart / Timeline + Storage Breakdown Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Chart / Activity Waveform (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="h-5 w-56 rounded-lg skeleton-shimmer" />
                <div className="h-3 w-40 rounded-md skeleton-shimmer opacity-60" />
              </div>
              <div className="h-8 w-28 rounded-lg skeleton-shimmer opacity-75" />
            </div>

            {/* Simulated Chart Bars */}
            <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 px-2">
              {[45, 75, 55, 90, 65, 80, 50, 95, 70, 85, 60, 75].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full max-w-[36px] rounded-t-lg skeleton-shimmer"
                    style={{ height: `${height}%` }}
                  />
                  <div className="w-6 h-2 rounded skeleton-shimmer opacity-40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Storage Breakdown / Donut Chart (1 Column) */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="h-5 w-44 rounded-lg skeleton-shimmer" />
              <div className="w-7 h-7 rounded-lg skeleton-shimmer opacity-60" />
            </div>

            {/* Donut Chart Skeleton */}
            <div className="flex items-center justify-center my-4">
              <div className="relative w-36 h-36 rounded-full border-12 border-slate-100 flex items-center justify-center skeleton-shimmer">
                <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                  <div className="h-4 w-10 rounded skeleton-shimmer mb-1" />
                  <div className="h-2.5 w-12 rounded skeleton-shimmer opacity-60" />
                </div>
              </div>
            </div>

            {/* Progress Bars Skeleton */}
            <div className="space-y-3.5 mt-5">
              {[
                { labelWidth: 'w-24', pct: '70%' },
                { labelWidth: 'w-28', pct: '50%' },
                { labelWidth: 'w-20', pct: '30%' }
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className={`h-3 ${item.labelWidth} rounded skeleton-shimmer`} />
                    <div className="h-3 w-8 rounded skeleton-shimmer opacity-60" />
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full skeleton-shimmer"
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Data Table / Recent Files Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-5 w-60 rounded-lg skeleton-shimmer" />
            <div className="h-5 w-12 rounded-full skeleton-shimmer opacity-60" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-48 rounded-xl skeleton-shimmer" />
            <div className="h-9 w-24 rounded-xl skeleton-shimmer opacity-75 hidden sm:block" />
          </div>
        </div>

        {/* 5 Table Rows */}
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="py-3.5 flex items-center justify-between gap-4">
              {/* Document Icon + Name */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-100 skeleton-shimmer shrink-0" />
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div
                    className="h-4 rounded-md skeleton-shimmer"
                    style={{ width: `${Math.min(180 + row * 25, 280)}px` }}
                  />
                  <div className="h-3 w-32 rounded-md skeleton-shimmer opacity-50" />
                </div>
              </div>

              {/* Department Badge */}
              <div className="hidden md:block w-24">
                <div className="h-5 w-20 rounded-full skeleton-shimmer opacity-70" />
              </div>

              {/* Date */}
              <div className="hidden sm:block w-24">
                <div className="h-3.5 w-18 rounded-md skeleton-shimmer opacity-60" />
              </div>

              {/* Status Pill */}
              <div className="w-24 flex justify-end sm:justify-start">
                <div className="h-6 w-20 rounded-full skeleton-shimmer" />
              </div>

              {/* Action Buttons */}
              <div className="hidden sm:flex items-center gap-2 w-16 justify-end">
                <div className="w-7 h-7 rounded-lg skeleton-shimmer opacity-70" />
                <div className="w-7 h-7 rounded-lg skeleton-shimmer opacity-70" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Embedded Shimmer Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmerWave {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #f1f5f9 0%,
            #e2e8f0 45%,
            #cbd5e1 55%,
            #e2e8f0 65%,
            #f1f5f9 100%
          );
          background-size: 250% 100%;
          animation: shimmerWave 1.8s ease-in-out infinite;
        }

        .skeleton-shimmer-dark {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.22) 50%,
            rgba(255, 255, 255, 0.08) 100%
          );
          background-size: 250% 100%;
          animation: shimmerWave 1.8s ease-in-out infinite;
        }

        .skeleton-shimmer-bar {
          background: linear-gradient(
            90deg,
            #3b82f6 0%,
            #60a5fa 50%,
            #3b82f6 100%
          );
          background-size: 200% 100%;
          animation: shimmerWave 1.2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}

// Named alias for convenience and backwards compatibility
export { DashboardSkeletonLoader as DashboardLoader };
