import ReportingManagerSidebar from "../components/ReportingManager/ReportingManagerSidebar";
import Topbar from "./Topbar";

export default function ReportingManagerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <ReportingManagerSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
