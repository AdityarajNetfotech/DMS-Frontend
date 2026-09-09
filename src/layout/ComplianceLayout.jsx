import ComplianceSidebar from "../components/Compliance/ComplianceSidebar";
import Topbar from "./Topbar";

export default function ComplianceLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <ComplianceSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

