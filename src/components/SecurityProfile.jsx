import { Shield } from "lucide-react";

export default function SecurityProfile() {
  return (
    <div className="bg-[#EEF1FF] border rounded-2xl p-6">
      <div className="flex gap-2 items-center mb-5">
        <Shield className="text-blue-600" />
        <h3 className="font-semibold text-2xl">
          Security Profile
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4>SSO / SAML 2.0</h4>
          <p className="text-gray-500">
            Okta Integrated
          </p>
        </div>

        <div>
          <h4>MFA Policy</h4>
          <p className="text-gray-500">
            Strict (WebAuthn)
          </p>
        </div>

        <div>
          <h4>Data Residency</h4>
          <p className="text-gray-500">
            Frankfurt, DE
          </p>
        </div>

        <button className="w-full border rounded-xl py-3">
          Security Audit
        </button>
      </div>
    </div>
  );
}