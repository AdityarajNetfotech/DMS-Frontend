
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";

import { API_BASE_URL } from "../../config/api";

export default function UserManagementContent() {
  const { companySlug } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Manager",
    departmentId: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/users`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const [activeTab, setActiveTab] = useState("Users");
  const [departments, setDepartments] = useState([]);
  
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/departments`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [deptFormData, setDeptFormData] = useState({ name: "", description: "" });
  const [deptStatusMessage, setDeptStatusMessage] = useState("");

  const handleDeptChange = (event) => {
    const { name, value } = event.target;
    setDeptFormData((current) => ({ ...current, [name]: value }));
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setDeptStatusMessage("");
    try {
      const endpoint = editingDeptId 
        ? `${API_BASE_URL}/api/${companySlug}/departments/${editingDeptId}`
        : `${API_BASE_URL}/api/${companySlug}/departments`;
      const method = editingDeptId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(deptFormData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save department");

      setDeptStatusMessage(editingDeptId ? "Department updated." : "Department created.");
      setDeptFormData({ name: "", description: "" });
      setEditingDeptId(null);
      setShowDeptForm(false);
      fetchDepartments();
    } catch (error) {
      setDeptStatusMessage(error.message);
    }
  };

  const handleEditDept = (dept) => {
    setEditingDeptId(dept._id);
    setDeptFormData({ name: dept.name, description: dept.description });
    setShowDeptForm(true);
    setDeptStatusMessage("");
  };

  const handleDeleteDept = async (deptId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/departments/${deptId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete department");
      fetchDepartments();
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (companySlug) {
      fetchUsers();
      fetchDepartments();
    }
  }, [companySlug]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-yellow-100 text-yellow-700";
      case "Locked":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Manager":
        return "bg-blue-100 text-blue-700";
      case "Viewer":
        return "bg-gray-100 text-gray-700";
      case "Tenant Admin":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.role.toLowerCase().includes(normalizedSearch) ||
      user.status.toLowerCase().includes(normalizedSearch);

    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All Status" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Leave blank on edit unless they want to change it (handled by backend if supported)
      role: user.role,
      departmentId: user.departmentId?._id || user.departmentId || "",
    });
    setShowForm(true);
    setStatusMessage("");
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete user");

      setStatusMessage("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || (!editingUserId && !formData.password)) {
      setStatusMessage("Please fill in the name, email, and password.");
      return;
    }

    try {
      const endpoint = editingUserId 
        ? `${API_BASE_URL}/api/${companySlug}/users/${editingUserId}`
        : `${API_BASE_URL}/api/${companySlug}/users`;
        
      const method = editingUserId ? "PUT" : "POST";

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        departmentId: formData.departmentId || null,
      };

      // Only send password if provided (for new users or changing password)
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save user");
      }

      setStatusMessage(editingUserId ? "User updated successfully." : "User created successfully. Credentials sent via email.");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Manager",
        departmentId: "",
      });
      setEditingUserId(null);
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      setStatusMessage(error.message || "Unable to save user");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create manager and viewer accounts for your tenant from the admin area.
          </p>
        </div>

        {activeTab === "Users" && (
          <button
            onClick={() => setShowForm((current) => !current)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white font-semibold text-sm hover:opacity-90 shadow-sm transition cursor-pointer"
          >
            <Plus size={18} />
            {showForm ? "Hide Form" : "Invite User"}
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab("Users"); setShowForm(false); }}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "Users"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => { setActiveTab("Departments"); setShowForm(false); }}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "Departments"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Departments
        </button>
      </div>


      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-8 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0A1F44]">Create Manager or Viewer</h3>
              <p className="text-gray-500 text-sm mt-1">
                Tenant admins can create either a manager or a viewer account for the selected tenant.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
                placeholder="manager@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editingUserId ? "New password (leave blank to keep)" : "Temporary password"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenant slug</label>
              <input
                type="text"
                value={companySlug}
                disabled
                className="w-full border border-gray-200 bg-gray-55 text-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition bg-white"
                >
                  <option value="Manager">Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department (Optional)</label>
                <select
                  name="departmentId"
                  value={formData.departmentId || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition bg-white"
                >
                  <option value="">No Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 shadow-sm font-semibold text-sm transition cursor-pointer"
              >
                {editingUserId ? "Save Changes" : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUserId(null);
                  setFormData({ name: "", email: "", password: "", role: "Manager" });
                }}
                className="border border-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>

          {statusMessage && (
            <p className="mt-4 text-sm text-blue-650 font-medium">{statusMessage}</p>
          )}
        </div>
      )}

      {activeTab === "Users" && (
        <div className="mt-8 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-gray-250 px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition sm:w-64"
              />

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-xl border border-gray-250 px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="All Roles">All Roles</option>
                <option value="Manager">Manager</option>
                <option value="Viewer">Viewer</option>
                <option value="Tenant Admin">Tenant Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-gray-250 px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Last Login</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr key={`${user.email}-${index}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="flex items-center gap-3 px-6 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </td>

                  <td className="px-6 py-5 text-gray-600">{user.email}</td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    {user.departmentId ? user.departmentId.name : <span className="text-gray-400 italic">None</span>}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-600">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-4 text-gray-500">
                      <button onClick={() => handleEdit(user)} title="Edit User" className="hover:text-blue-600 transition">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(user._id)} title="Delete User" className="hover:text-red-600 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="border-t border-gray-100 px-6 py-10 text-center text-gray-500">
                    No users found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 p-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-10 w-10 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center"
            >
              {'<'}
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`h-10 w-10 rounded-lg font-semibold shadow-sm transition cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-10 w-10 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center"
            >
              {'>'}
            </button>
          </div>
        )}
        </div>
      )}

      {activeTab === "Departments" && (
        <div className="mt-8 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Departments</h2>
              <p className="text-gray-500 text-sm mt-1">Manage tenant departments and group users.</p>
            </div>
            <button 
              onClick={() => { setShowDeptForm(!showDeptForm); setEditingDeptId(null); setDeptFormData({ name: "", description: "" }); }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white font-semibold text-sm hover:opacity-90 shadow-sm transition cursor-pointer"
            >
              <Plus size={18} />
              {showDeptForm ? "Hide Form" : "New Department"}
            </button>
          </div>

          {showDeptForm && (
            <div className="bg-gray-50 rounded-2xl p-6 shadow-inner mb-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingDeptId ? "Edit Department" : "Create Department"}</h3>
              <form onSubmit={handleDeptSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={deptFormData.name}
                    onChange={handleDeptChange}
                    required
                    className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
                    placeholder="e.g. Finance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={deptFormData.description}
                    onChange={handleDeptChange}
                    className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
                    placeholder="Optional description"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 mt-2">
                  <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 shadow-sm font-semibold text-sm transition cursor-pointer">
                    {editingDeptId ? "Save Changes" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDeptForm(false); setEditingDeptId(null); setDeptFormData({ name: "", description: "" }); }}
                    className="border border-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {deptStatusMessage && <p className="mt-4 text-sm text-blue-650 font-medium">{deptStatusMessage}</p>}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4 text-left">Department Name</th>
                  <th className="px-6 py-4 text-left">Created At</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => (
                  <tr key={dept._id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-6 py-5 font-medium">{dept.name}</td>
                    <td className="px-6 py-5 text-gray-600">{new Date(dept.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-4 text-gray-500">
                        <button onClick={() => handleEditDept(dept)} title="Edit" className="hover:text-blue-600 transition"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteDept(dept._id)} title="Delete" className="hover:text-red-600 transition"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan="3" className="border-t border-gray-100 px-6 py-10 text-center text-gray-500">
                      No departments created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
