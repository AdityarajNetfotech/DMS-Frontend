// src/components/AccessSecurityContent.jsx

import { useState } from "react";
import {
  Download,
  Share2,
  Network,
  Plus,
  Shield,
  X,
} from "lucide-react";

export default function AccessSecurityContent() {
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [actionFilter, setActionFilter] = useState("All Actions");

  const [ipList, setIpList] = useState([
    "10.0.0.0/8",
    "192.168.1.45",
    "172.16.0.0/12",
    "203.0.113.12",
  ]);

  const [newIp, setNewIp] = useState("");

  const removeIP = (ip) => {
    setIpList(ipList.filter((item) => item !== ip));
  };

  const addIP = () => {
    if (!newIp.trim()) return;

    setIpList([...ipList, newIp]);
    setNewIp("");
  };

  const showAction = (action) => actionFilter === "All Actions" || actionFilter === action;

  const visibleActionCount = [
    "Permission Update",
    "Export Triggered",
    "Security Alert",
    "Config Changed",
  ].filter(showAction).length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Access & Security
          </h1>

          <p className="text-gray-500 mt-2">
            Manage organizational security protocols,
            audit logs, and network restrictions.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 border rounded-xl bg-white hover:bg-gray-50">
            <Download size={18} />
            Export to PDF
          </button>

          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B2C87] text-white hover:bg-[#081f63]">
            <Download size={18} />
            Export to CSV
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* SECURITY CARDS */}
      {/* ================================================= */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* External Sharing */}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#0B2C87] flex items-center justify-center">
              <Share2 className="text-white" />
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                Global External Sharing
              </h3>

              <p className="text-gray-500 mt-1 max-w-sm">
                Control if documents can be shared
                with users outside the organization.
              </p>
            </div>
          </div>

          {/* Toggle */}

          <button
            onClick={() =>
              setSharingEnabled(!sharingEnabled)
            }
            className={`w-14 h-8 rounded-full relative transition
            ${
              sharingEnabled
                ? "bg-[#0B2C87]"
                : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition
                ${
                  sharingEnabled
                    ? "right-1"
                    : "left-1"
                }`}
            />
          </button>
        </div>

        {/* IP Restrictions */}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-cyan-900 flex items-center justify-center">
              <Network className="text-white" />
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                IP Access Restrictions
              </h3>

              <p className="text-gray-500 mt-1">
                8 active ranges currently permitted
                to access the platform.
              </p>
            </div>
          </div>

          <button className="border border-[#0B2C87] text-[#0B2C87] px-5 py-3 rounded-xl font-medium hover:bg-blue-50">
            Manage Ranges
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* IP ALLOWLIST */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 mt-6 overflow-hidden">
        {/* Header */}

        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            IP ALLOWLIST CONFIGURATION
          </h3>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="192.168.1.1/24"
              value={newIp}
              onChange={(e) =>
                setNewIp(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-2 outline-none sm:w-64"
            />

            <button
              onClick={addIP}
              className="bg-[#0B2C87] text-white px-5 py-2 rounded-xl flex items-center gap-2"
            >
              <Plus size={16} />
              Add IP
            </button>
          </div>
        </div>

        {/* Tags */}

        <div className="p-6 flex flex-wrap gap-3">
          {ipList.map((ip) => (
            <div
              key={ip}
              className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full flex items-center gap-3"
            >
              {ip}

              <button
                onClick={() => removeIP(ip)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================= */}
      {/* PART 2 CONTINUES BELOW */}
      {/* ================================================= */}

            {/* ================================================= */}
      {/* AUDIT LOG */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 mt-6 overflow-hidden">
        {/* Header */}

        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold">
              Organization Audit Log
            </h3>

            <p className="text-gray-500 mt-1">
              Comprehensive history of all administrative
              and security actions.
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="border rounded-xl px-4 py-3 bg-white"
            >
              <option value="All Actions">All Actions</option>
              <option value="Permission Update">Permission Update</option>
              <option value="Export Triggered">Export Triggered</option>
              <option value="Security Alert">Security Alert</option>
              <option value="Config Changed">Config Changed</option>
            </select>

            <button className="border rounded-xl px-4 py-3 hover:bg-gray-50">
              ↻
            </button>
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-6 py-4">Who</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">
                Document / Resource
              </th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>

          <tbody>
            {/* Row 1 */}

            <tr className={`border-b ${showAction("Permission Update") ? "" : "hidden"}`}>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B2C87] text-white flex items-center justify-center text-sm font-bold">
                    JD
                  </div>

                  <div>
                    <p className="font-medium">
                      Jane Doe
                    </p>

                    <p className="text-sm text-gray-500">
                      jane.doe@nexus.com
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-5">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                  Permission Update
                </span>
              </td>

              <td className="px-6 py-5 text-gray-600">
                Oct 24, 2023 · 14:32:01
              </td>

              <td className="px-6 py-5 font-medium text-[#0B2C87]">
                User: Mike Ross
              </td>

              <td className="px-6 py-5 text-xl">
                ↗
              </td>
            </tr>

            {/* Row 2 */}

            <tr className={`border-b ${showAction("Export Triggered") ? "" : "hidden"}`}>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-bold">
                    AS
                  </div>

                  <div>
                    <p className="font-medium">
                      Admin System
                    </p>

                    <p className="text-sm text-gray-500">
                      automated@nexus.com
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-5">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  Export Triggered
                </span>
              </td>

              <td className="px-6 py-5 text-gray-600">
                Oct 24, 2023 · 12:15:44
              </td>

              <td className="px-6 py-5 font-medium text-[#0B2C87]">
                Project-Z-Revenue.csv
              </td>

              <td className="px-6 py-5 text-xl">
                ↗
              </td>
            </tr>

            {/* Row 3 */}

            <tr className={`border-b ${showAction("Security Alert") ? "" : "hidden"}`}>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-700 text-white flex items-center justify-center text-sm font-bold">
                    BM
                  </div>

                  <div>
                    <p className="font-medium">
                      Bruce Miller
                    </p>

                    <p className="text-sm text-gray-500">
                      bruce.m@nexus.com
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-5">
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                  Security Alert
                </span>
              </td>

              <td className="px-6 py-5 text-gray-600">
                Oct 24, 2023 · 09:11:12
              </td>

              <td className="px-6 py-5 font-medium text-[#0B2C87]">
                IP: 212.44.11.2
              </td>

              <td className="px-6 py-5 text-xl">
                ↗
              </td>
            </tr>

            {/* Row 4 */}

            <tr className={showAction("Config Changed") ? "" : "hidden"}>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-700 text-white flex items-center justify-center text-sm font-bold">
                    SM
                  </div>

                  <div>
                    <p className="font-medium">
                      Sarah Mitchell
                    </p>

                    <p className="text-sm text-gray-500">
                      smitchell@nexus.com
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-5">
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                  Config Changed
                </span>
              </td>

              <td className="px-6 py-5 text-gray-600">
                Oct 23, 2023 · 18:02:59
              </td>

              <td className="px-6 py-5 font-medium text-[#0B2C87]">
                Settings: Storage Pool
              </td>

              <td className="px-6 py-5 text-xl">
                ↗
              </td>
            </tr>

            {visibleActionCount === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                  No audit log entries found for the selected action.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Footer */}

        <div className="flex justify-between items-center p-6 border-t">
          <p className="text-gray-500">
            Showing {visibleActionCount} of 4 entries
          </p>

          <div className="flex gap-2">
            <button className="px-3 py-2 border rounded">
              Previous
            </button>

            <button className="px-3 py-2 bg-[#0B2C87] text-white rounded">
              1
            </button>

            <button className="px-3 py-2 border rounded">
              2
            </button>

            <button className="px-3 py-2 border rounded">
              3
            </button>

            <button className="px-3 py-2 border rounded">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* SECURITY FOOTER */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 mt-6 p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
          <Shield className="text-[#0B2C87]" size={30} />
        </div>

        <h3 className="text-2xl font-semibold mt-5">
          Your Organization is Secure
        </h3>

        <p className="text-gray-500 mt-4 max-w-2xl mx-auto leading-7">
          The audit log captures 100% of API transactions
          and manual modifications to ensure compliance
          with enterprise standards.
        </p>
      </div>
    </div>
  );
}
