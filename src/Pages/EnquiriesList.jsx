import { useState, useEffect } from "react";
import { Search, Loader2, Mail } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const API_BASE = `${API_BASE_URL}/api/super-admin/enquiries`;

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function EnquiriesList() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyModal, setReplyModal] = useState({ isOpen: false, enquiry: null, message: '', loading: false });

  const handleReplySubmit = async () => {
    if (!replyModal.message.trim()) return;
    setReplyModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/super-admin/enquiries/reply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: replyModal.enquiry.email,
          subject: `RE: ${replyModal.enquiry.subject}`,
          message: replyModal.message,
          replyFrom: "Aditya <aditya@netfotech.in>"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Reply sent successfully!");
        setReplyModal({ isOpen: false, enquiry: null, message: '', loading: false });
      } else {
        alert("Failed to send reply: " + data.message);
        setReplyModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error("Reply error:", err);
      alert("Network error occurred.");
      setReplyModal(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail || "");
    };
    window.addEventListener("global-search", handleGlobalSearch);
    return () => window.removeEventListener("global-search", handleGlobalSearch);
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnquiries = enquiries.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Website Enquiries</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dashboard &rsaquo; Enquiries
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {/* Enquiries Table Section */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Contact Form Submissions</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                List of messages received from the public landing page.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <span className="ml-3 text-slate-500">Loading enquiries...</span>
              </div>
            ) : (
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3.5 w-12">#</th>
                    <th className="px-5 py-3.5">Name & Email</th>
                    <th className="px-5 py-3.5">Subject</th>
                    <th className="px-5 py-3.5 max-w-md">Message</th>
                    <th className="px-5 py-3.5">Received On</th>
                    <th className="px-5 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEnquiries.map((enquiry, index) => (
                    <tr
                      key={enquiry._id}
                      className="text-slate-700 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-5 py-4 text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{enquiry.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {enquiry.email}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {enquiry.subject}
                      </td>
                      <td className="px-5 py-4 max-w-md text-slate-600 line-clamp-3">
                        {enquiry.message}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {formatDate(enquiry.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setReplyModal({ isOpen: true, enquiry, message: '', loading: false })}
                          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer"
                        >
                          Reply
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredEnquiries.length === 0 && !loading && (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                        {searchTerm ? "No enquiries found matching your search." : "No enquiries have been submitted yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Reply Modal */}
      {replyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">Reply to Enquiry</h2>
              <button
                onClick={() => setReplyModal({ isOpen: false, enquiry: null, message: '', loading: false })}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 text-sm text-slate-600">
                <strong>To:</strong> {replyModal.enquiry.name} &lt;{replyModal.enquiry.email}&gt;
              </div>
              <div className="mb-4 text-sm text-slate-600">
                <strong>Subject:</strong> RE: {replyModal.enquiry.subject}
              </div>
              
              <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
              <textarea
                value={replyModal.message}
                onChange={(e) => setReplyModal(prev => ({ ...prev, message: e.target.value }))}
                className="w-full h-32 rounded-lg border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                placeholder="Type your reply here..."
              ></textarea>
              <p className="mt-2 text-xs text-slate-400">
                This email will be sent by <strong>aditya@netfotech.in</strong>.
              </p>
            </div>
            
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setReplyModal({ isOpen: false, enquiry: null, message: '', loading: false })}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={replyModal.loading || !replyModal.message.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
              >
                {replyModal.loading && <Loader2 size={16} className="animate-spin" />}
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
