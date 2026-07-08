import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { API_BASE_URL } from './config/api'
// import LoginPage from './Pages/LoginPage'
// import LandingPage from './components/LandingPage/landingpage';
import SuperAdminlogin from './Pages/SuperAdminlogin';
import LoginPage from './Pages/LoginPage'
import ForgotPassword from './Pages/Auth/ForgotPassword';
import VerifyOTP from './Pages/Auth/VerifyOTP';
import ResetPassword from './Pages/Auth/ResetPassword';
import Dashboard from "./Pages/Dashboard";
import TenantManagement from "./Pages/TenantManagement";
import RegisterTenant from "./Pages/RegisterTenant";
import SystemHealth from "./Pages/SystemHealth";
import EnquiriesList from "./Pages/EnquiriesList";
import TenantDetails from "./Pages/TenantDetails";
import GlobalConfig from "./Pages/GlobalConfig";
import GlobalSettings from "./Pages/GlobalSettings";
import UserManagement from "./Pages/Admin/UserManagement";
import WorkspaceConfiguration from "./Pages/Admin/WorkspaceConfiguration";
import AccessSecurity from "./Pages/Admin/AccessSecurity";
import StorageReporting from "./Pages/Admin/StorageReporting";
import Settings from "./Pages/Admin/Settings";
import HelpCenter from "./Pages/Admin/HelpCenter";
import ManagerActivity from "./Pages/Admin/ManagerActivity";
import AdminDashboard from "./Pages/Admin/Dashboard";
import AdminProfileSettings from "./Pages/Admin/ProfileSettings";
import Dashboards from "./Pages/Manager/Dashboards";
import MyDocuments from "./Pages/Manager/Mydocument";
import FolderExployer from "./Pages/Manager/Folder_Exployer";
import UploadDocument from "./Pages/Manager/UploadDocument";
import Documentversionhistory from "./Pages/Manager/Documentversionhistory";
import Searchandfilter from "./Pages/Manager/searchandfilter";
import Permission from "./Pages/Manager/Permission";
import Activitylogs from "./Pages/Manager/Activitylogs";
import ProfileSettings from "./Pages/Manager/ProfileSettings";
import Trash from "./Pages/Manager/Trash";
import SharedWithMe from "./Pages/Manager/SharedWithMe";
import RecentDocuments from "./Pages/Manager/RecentDocuments";
import ViewerDashboard from "./Pages/Viewer/Dashboard";
import ViewerMyDocument from "./Pages/Viewer/MyDocument";
import ViewerSharedWithMe from "./Pages/Viewer/SharedWithme";
import SearchResults from "./Pages/Viewer/SearchResult";
import ViewerSearch from "./Pages/Viewer/Search";
import ViewerTrash from "./Pages/Viewer/Trash";
import Profilepage from "./Pages/Viewer/Profilepage";
// import SearchResult from "./Pages/Viewer/SearchPage";
// import SharedWithMe from "./Pages/Manager/SharedWithMe";
import SharedWithme from "./Pages/Viewer/SharedWithme";
import LandingPage from "./components/LandingPage/landingpage";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
  
function adjustColorBrightness(hex, percent) {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = R > 0 ? R : 0;
  G = G > 0 ? G : 0;
  B = B > 0 ? B : 0;

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

const applyBrandingTheme = (data) => {
  if (data.primaryColor) {
    const primary = data.primaryColor;
    document.documentElement.style.setProperty('--brand-primary', primary);
    document.documentElement.style.setProperty('--brand-primary-hover', adjustColorBrightness(primary, -15));
    document.documentElement.style.setProperty('--brand-primary-light', primary + '15');
    document.documentElement.style.setProperty('--brand-primary-light-100', primary + '30');
    document.documentElement.style.setProperty('--brand-primary-light-200', primary + '50');
    document.documentElement.style.setProperty('--brand-primary-500', primary);
    document.documentElement.style.setProperty('--brand-primary-dark', adjustColorBrightness(primary, -30));
  }
  
  if (data.fontFamily) {
    const fontName = data.fontFamily;
    let linkId = "dynamic-google-font";
    let linkElement = document.getElementById(linkId);
    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.id = linkId;
      linkElement.rel = "stylesheet";
      document.head.appendChild(linkElement);
    }
    linkElement.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
    document.documentElement.style.fontFamily = `'${fontName}', sans-serif`;
  }
};

const updateBrandingTheme = async (companySlug) => {
  if (!companySlug || ['dashboard', 'tenants', 'register-tenant', 'enquiries', 'system-health', 'tenantsdetails', 'global-config', 'global-settings', 'superadminlogin', 'login'].includes(companySlug)) {
    // Reset to defaults
    document.documentElement.style.removeProperty('--brand-primary');
    document.documentElement.style.removeProperty('--brand-primary-hover');
    document.documentElement.style.removeProperty('--brand-primary-light');
    document.documentElement.style.removeProperty('--brand-primary-light-100');
    document.documentElement.style.removeProperty('--brand-primary-light-200');
    document.documentElement.style.removeProperty('--brand-primary-500');
    document.documentElement.style.removeProperty('--brand-primary-dark');
    return;
  }

  // Instant local storage hydration
  const cached = localStorage.getItem(`branding_${companySlug}`);
  if (cached) {
    try {
      applyBrandingTheme(JSON.parse(cached));
    } catch (e) {
      console.error("Local storage theme hydration failure", e);
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
    const data = await res.json();
    if (data.success) {
      localStorage.setItem(`branding_${companySlug}`, JSON.stringify(data.data));
      applyBrandingTheme(data.data);
    }
  } catch (err) {
    console.error("Failed to load global theme branding", err);
  }
};

function App() {
  const location = useLocation();

  useEffect(() => {
    const segments = location.pathname.split('/');
    const companySlug = segments[1];
    updateBrandingTheme(companySlug);

    const handleUpdate = () => {
      updateBrandingTheme(companySlug);
    };
    window.addEventListener("branding-update", handleUpdate);
    return () => window.removeEventListener("branding-update", handleUpdate);
  }, [location]);

  return (
    <Routes>
      
      <Route path="/" element={<LandingPage />} />
      <Route path="/superadminlogin" element={<SuperAdminlogin />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Slug-based tenant login route (from email link) */}
      <Route path="/:companySlug/login" element={<LoginPage />} />
      <Route path="/:companySlug/forgot-password" element={<ForgotPassword />} />
      <Route path="/:companySlug/verify-otp" element={<VerifyOTP />} />
      <Route path="/:companySlug/reset-password" element={<ResetPassword />} />

      {/* Super Admin Routes */}
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/tenants" element={<AppLayout><TenantManagement /></AppLayout>} />
      <Route path="/register-tenant" element={<AppLayout><RegisterTenant /></AppLayout>} />
      <Route path="/enquiries" element={<AppLayout><EnquiriesList /></AppLayout>} />
      <Route path="/system-health" element={<AppLayout><SystemHealth /></AppLayout>} />
      <Route path="/tenantsdetails" element={<AppLayout><TenantDetails /></AppLayout>} />
      <Route path="/global-config" element={<AppLayout><GlobalConfig /></AppLayout>} />
      <Route path="/global-settings" element={<AppLayout><GlobalSettings /></AppLayout>} />

      {/* Admin Routes (with company slug) */}
      <Route path="/:companySlug/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/:companySlug/admin/profile" element={<AdminProfileSettings />} />
      <Route path="/:companySlug/admin/user-management" element={<UserManagement />} />
      <Route path="/:companySlug/admin/workspace-configuration" element={<WorkspaceConfiguration />} />
      <Route path="/:companySlug/admin/access-security" element={<AccessSecurity />} />
      <Route path="/:companySlug/admin/storage-reporting" element={<StorageReporting />} />
      <Route path="/:companySlug/admin/manager-activity" element={<ManagerActivity />} />
      <Route path="/:companySlug/admin/settings" element={<Settings />} />
      <Route path="/:companySlug/admin/help-center" element={<HelpCenter />} />
      {/* Legacy admin routes (without slug) */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/profile" element={<AdminProfileSettings />} />
      <Route path="/admin/user-management" element={<UserManagement />} />
      <Route path="/admin/workspace-configuration" element={<WorkspaceConfiguration />} />
      <Route path="/admin/access-security" element={<AccessSecurity />} />
      <Route path="/admin/storage-reporting" element={<StorageReporting />} />
      <Route path="/admin/manager-activity" element={<ManagerActivity />} />
      <Route path="/admin/settings" element={<Settings />} />
      <Route path="/admin/help-center" element={<HelpCenter />} />

      {/* Manager Routes (with company slug) */}
      <Route path="/:companySlug/manager/dashboard" element={<Dashboards />} />
      <Route path="/:companySlug/manager/my-documents" element={<MyDocuments />} />
      <Route path="/:companySlug/documents" element={<MyDocuments />} />
      <Route path="/:companySlug/manager/folder-explorer" element={<FolderExployer />} />
      <Route path="/:companySlug/folders" element={<FolderExployer />} />
      <Route path="/:companySlug/manager/upload-document" element={<UploadDocument />} />
      <Route path="/:companySlug/upload-document" element={<UploadDocument />} />
      <Route path="/:companySlug/manager/document-version-history" element={<Documentversionhistory />} />
      <Route path="/:companySlug/document-version-history" element={<Documentversionhistory />} />
      <Route path="/:companySlug/manager/search-filters" element={<Searchandfilter />} />
      <Route path="/:companySlug/search" element={<Searchandfilter />} />
      <Route path="/:companySlug/manager/shared-with-me" element={<SharedWithMe />} />
      <Route path="/:companySlug/shared" element={<SharedWithMe />} />
      <Route path="/:companySlug/manager/recent-documents" element={<RecentDocuments />} />
      <Route path="/:companySlug/recent-documents" element={<RecentDocuments />} />
      <Route path="/:companySlug/manager/permissions" element={<Permission />} />
      <Route path="/:companySlug/permissions" element={<Permission />} />
      <Route path="/:companySlug/manager/activity-logs" element={<Activitylogs />} />
      <Route path="/:companySlug/logs" element={<Activitylogs />} />
      <Route path="/:companySlug/manager/trash" element={<Trash />} />
      <Route path="/:companySlug/trash" element={<Trash />} />
      <Route path="/:companySlug/manager/profile-settings" element={<ProfileSettings />} />
      <Route path="/:companySlug/profile" element={<ProfileSettings />} />
      {/* Legacy manager routes (without slug) */}
      <Route path="/manager/dashboard" element={<Dashboards />} />
      <Route path="/manager/my-documents" element={<MyDocuments />} />
      <Route path="/documents" element={<MyDocuments />} />
      <Route path="/manager/folder-explorer" element={<FolderExployer />} />
      <Route path="/folders" element={<FolderExployer />} />
      <Route path="/manager/upload-document" element={<UploadDocument />} />
      <Route path="/upload-document" element={<UploadDocument />} />
      <Route path="/manager/document-version-history" element={<Documentversionhistory />} />
      <Route path="/document-version-history" element={<Documentversionhistory />} />
      <Route path="/manager/search-filters" element={<Searchandfilter />} />
      <Route path="/search" element={<Searchandfilter />} />
      <Route path="/manager/shared-with-me" element={<SharedWithMe />} />
      <Route path="/shared" element={<SharedWithMe />} />
      <Route path="/manager/recent-documents" element={<RecentDocuments />} />
      <Route path="/recent-documents" element={<RecentDocuments />} />
      <Route path="/manager/permissions" element={<Permission />} />
      <Route path="/permissions" element={<Permission />} />
      <Route path="/manager/activity-logs" element={<Activitylogs />} />
      <Route path="/logs" element={<Activitylogs />} />
      <Route path="/manager/trash" element={<Trash />} />
      <Route path="/trash" element={<Trash />} />
      <Route path="/manager/profile-settings" element={<ProfileSettings />} />
      <Route path="/profile" element={<ProfileSettings />} />

      {/* Viewer Routes (with company slug) */}
      <Route path="/:companySlug/viewer/dashboard" element={<ViewerDashboard />} />
      <Route path="/:companySlug/viewer/my-documents" element={<ViewerMyDocument />} />
      <Route path="/:companySlug/viewer/shared-with-me" element={<ViewerSharedWithMe />} />
      <Route path="/:companySlug/viewer/my-access" element={<SearchResults />} />
      <Route path="/:companySlug/viewer/search" element={<ViewerSearch />} />
      <Route path="/:companySlug/viewer/profile" element={<Profilepage />} />
      <Route path="/:companySlug/viewer/recent" element={<SharedWithme />} />
      <Route path="/:companySlug/viewer/trash" element={<ViewerTrash />} />
      {/* Legacy viewer routes (without slug) */}
      <Route path="/viewer/dashboard" element={<ViewerDashboard />} />
      <Route path="/viewer/my-documents" element={<ViewerMyDocument />} />
      <Route path="/viewer/shared-with-me" element={<ViewerSharedWithMe />} />
      <Route path="/viewer/my-access" element={<SearchResults />} />
      <Route path="/viewer/search" element={<ViewerSearch />} />
      <Route path="/viewer/profile" element={<Profilepage />} />
      <Route path="/viewer/recent" element={<SharedWithme />} />
      <Route path="/viewer/trash" element={<ViewerTrash />} />

    </Routes>
  )
}

export default App
