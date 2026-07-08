import { useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  FileSearch,
  Folder,
  Info,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";

const tabs = ["Roles", "Permissions", "User Access", "Department Access"];

const permissionModules = [
  {
    name: "Documents",
    description: "View, upload, edit and manage documents",
    icon: Folder,
    iconClass: "bg-sky-100 text-sky-600",
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      share: true,
      manageAccess: false,
    },
  },
  {
    name: "Folders",
    description: "Create, edit and organize folders",
    icon: Folder,
    iconClass: "bg-emerald-100 text-emerald-600",
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      share: false,
      manageAccess: false,
    },
  },
  {
    name: "Search & Filters",
    description: "Search and apply filters on documents",
    icon: FileSearch,
    iconClass: "bg-violet-100 text-violet-700",
    permissions: {
      view: true,
      create: null,
      edit: null,
      delete: null,
      share: null,
      manageAccess: null,
    },
  },
  {
    name: "Access Control",
    description: "Manage access and permissions",
    icon: ShieldCheck,
    iconClass: "bg-amber-100 text-amber-600",
    permissions: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      share: false,
      manageAccess: true,
    },
  },
  {
    name: "Activity Logs",
    description: "View activity and audit logs",
    icon: Users,
    iconClass: "bg-orange-100 text-orange-600",
    permissions: {
      view: true,
      create: null,
      edit: null,
      delete: null,
      share: null,
      manageAccess: null,
    },
  },
  {
    name: "Settings",
    description: "Manage system and module settings",
    icon: Settings,
    iconClass: "bg-cyan-100 text-cyan-700",
    permissions: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      share: false,
      manageAccess: false,
    },
  },
];

const permissionColumns = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "share", label: "Share" },
  { key: "manageAccess", label: "Manage Access" },
];

function Toggle({ enabled, onToggle }) {
  if (enabled === null) {
    return <span className="text-lg font-semibold text-slate-500">-</span>;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-blue-700" : "bg-slate-300"
      }`}
      aria-pressed={enabled}
      aria-label={enabled ? "Permission enabled" : "Permission disabled"}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function Permission() {
  const [permissionModulesState, setPermissionModulesState] = useState(
    permissionModules,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Department Manager");
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
    permissions: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      share: false,
      manageAccess: false,
    },
  });

  const handleAddPermission = (event) => {
    event.preventDefault();

    if (!newPermission.name.trim()) {
      return;
    }

    const permissionToAdd = {
      name: newPermission.name.trim(),
      description:
        newPermission.description.trim() || "Custom permission added from the form.",
      icon: Folder,
      iconClass: "bg-slate-100 text-slate-700",
      permissions: {
        ...newPermission.permissions,
      },
    };

    setPermissionModulesState((prev) => [permissionToAdd, ...prev]);
    setNewPermission({
      name: "",
      description: "",
      permissions: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        share: false,
        manageAccess: false,
      },
    });
    setIsAddModalOpen(false);
  };

  const handlePermissionToggle = (moduleName, permissionKey) => {
    setPermissionModulesState((prev) =>
      prev.map((module) => {
        if (module.name !== moduleName) {
          return module;
        }

        if (module.permissions[permissionKey] === null) {
          return module;
        }

        return {
          ...module,
          permissions: {
            ...module.permissions,
            [permissionKey]: !module.permissions[permissionKey],
          },
        };
      }),
    );
  };

  const visiblePermissions = permissionModulesState.filter((module) => {
    const searchValue = searchQuery.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return `${module.name} ${module.description}`.toLowerCase().includes(searchValue);
  });

  const roleOptions = ["Department Manager", "Admin", "Viewer"];

  const cycleRole = () => {
    setSelectedRole((currentRole) => {
      const currentIndex = roleOptions.indexOf(currentRole);
      const nextIndex = (currentIndex + 1) % roleOptions.length;

      return roleOptions[nextIndex];
    });
  };

  return (
    <MainLayout>
      <div className="space-y-7">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              Permissions
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Manage access permissions for users, roles and departments.
            </p>

            <nav className="mt-5 flex items-center gap-3 text-sm font-semibold">
              <span className="text-blue-700">Home</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-blue-700">Access Control</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-slate-900">Permissions</span>
            </nav>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Plus size={19} />
            Add Permission
          </button>
        </section>

        <section className="border-b border-slate-200">
          <div className="flex flex-wrap gap-8 px-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`relative pb-4 text-sm font-semibold transition ${
                  tab === "Permissions"
                    ? "text-blue-700"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {tab}
                {tab === "Permissions" ? (
                  <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-700" />
                ) : null}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-500">
                Select Role
              </label>
              <button
                type="button"
                onClick={cycleRole}
                className="mt-2 flex h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50 sm:w-[320px]"
              >
                <span className="flex items-center gap-3">
                  <Users size={19} className="text-slate-600" />
                  {selectedRole}
                </span>
                <ChevronDown size={17} className="text-slate-600" />
              </button>
            </div>

            <label className="relative block lg:w-[360px]">
              <Search
                size={19}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search permissions..."
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[980px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="w-[37%] px-5 py-4">Permission Modules</th>
                  {permissionColumns.map((column) => (
                    <th
                      key={column.key}
                      className="w-[10.5%] px-4 py-4 text-center"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {visiblePermissions.map((module) => {
                  const Icon = module.icon;

                  return (
                    <tr
                      key={module.name}
                      className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${module.iconClass}`}
                          >
                            <Icon size={20} />
                          </span>
                          <div>
                            <p className="font-bold">{module.name}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {permissionColumns.map((column) => (
                        <td key={column.key} className="px-4 py-5 text-center">
                          <Toggle
                            enabled={module.permissions[column.key]}
                            onToggle={() =>
                              handlePermissionToggle(module.name, column.key)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex gap-4 rounded-lg bg-blue-50 px-5 py-5">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-700 text-blue-700">
                <Info size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">
                  Permission Info
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Permissions define what actions users with this role can
                  perform across modules.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-slate-200 lg:flex-row lg:border-l lg:pl-6">
              <button className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Cancel
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-700 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
                Save Changes
              </button>
            </div>
          </div>
        </section>
      </div>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Add New Permission
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Create a permission module and assign the default access level.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddPermission} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Permission Name
                </label>
                <input
                  type="text"
                  value={newPermission.name}
                  onChange={(event) =>
                    setNewPermission((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Reporting"
                  required
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  value={newPermission.description}
                  onChange={(event) =>
                    setNewPermission((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe what this permission controls"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Default access
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The new permission will be added with these default settings.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                >
                  Add Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
}
