// src/components/HelpCenterContent.jsx

import {
  Mail,
  Phone,
  BookOpen,
  MessageCircle,
  Shield,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function HelpCenterContent() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#0B2C87]">
          Help Center
        </h1>

        <p className="text-gray-500 mt-2">
          Find documentation, FAQs, and contact support.
        </p>
      </div>

      {/* Support Cards */}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-3xl border">
          <Mail className="text-[#0B2C87]" size={32} />

          <h3 className="text-xl font-semibold mt-4">
            Email Support
          </h3>

          <p className="text-gray-500 mt-2">
            Contact our support team for assistance.
          </p>

          <a
            href="mailto:info@netfotech.in"
            className="text-[#0B2C87] font-semibold mt-4 inline-block"
          >
            info@netfotech.in
          </a>
        </div>

        <div className="bg-white p-6 rounded-3xl border">
          <Phone className="text-green-600" size={32} />

          <h3 className="text-xl font-semibold mt-4">
            Phone Support
          </h3>

          <p className="text-gray-500 mt-2">
            Available Monday - Friday, 9 AM - 6 PM.
          </p>

          <p className="text-[#0B2C87] font-semibold mt-4">
            +91 XXXXX XXXXX
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border">
          <BookOpen className="text-purple-600" size={32} />

          <h3 className="text-xl font-semibold mt-4">
            Documentation
          </h3>

          <p className="text-gray-500 mt-2">
            Learn how to use the DMS platform.
          </p>

          <button className="text-[#0B2C87] font-semibold mt-4 flex items-center gap-2">
            Open Docs <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* FAQ Section */}

      <div className="bg-white rounded-3xl border p-8 mt-8">
        <h2 className="text-2xl font-semibold mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-5">
          <div className="border-b pb-4">
            <h4 className="font-semibold">
              How do I invite new users?
            </h4>

            <p className="text-gray-500 mt-2">
              Navigate to User Management and click
              "Invite User".
            </p>
          </div>

          <div className="border-b pb-4">
            <h4 className="font-semibold">
              How can I reset a user's password?
            </h4>

            <p className="text-gray-500 mt-2">
              Open User Management → Actions →
              Reset Password.
            </p>
          </div>

          <div className="pb-4">
            <h4 className="font-semibold">
              How do I configure storage integrations?
            </h4>

            <p className="text-gray-500 mt-2">
              Navigate to Storage & Reporting →
              Integrations Management.
            </p>
          </div>
        </div>
      </div>

      {/* Resources */}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-3xl border">
          <Shield className="text-red-500" />

          <h3 className="font-semibold mt-4">
            Security Guide
          </h3>

          <p className="text-gray-500 mt-2">
            Best practices for enterprise security.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border">
          <FileText className="text-blue-500" />

          <h3 className="font-semibold mt-4">
            API Reference
          </h3>

          <p className="text-gray-500 mt-2">
            Explore platform APIs and integration docs.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border">
          <MessageCircle className="text-green-500" />

          <h3 className="font-semibold mt-4">
            Live Chat
          </h3>

          <p className="text-gray-500 mt-2">
            Chat with support representatives.
          </p>
        </div>
      </div>
    </div>
  );
}