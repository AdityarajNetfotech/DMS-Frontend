import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

// Module-level in-flight exchange cache to prevent React 18/19 StrictMode double-fetch
const ssoExchangeCache = new Map();

export default function SSOCallback() {
  const { companySlug: pathSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("authenticating"); // 'authenticating' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const rawToken = searchParams.get("token") || searchParams.get("ssoToken");
  const token = rawToken ? rawToken.trim() : "";
  const querySlug = searchParams.get("slug") || searchParams.get("companySlug");
  const companySlug = pathSlug || querySlug;
  const redirect = searchParams.get("redirect") || "/manager/folder-explorer";

  useEffect(() => {
    if (!companySlug) {
      setStatus("error");
      setErrorMessage("Company workspace identifier is missing from the SSO request.");
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("SSO authentication token was not provided or has expired.");
      return;
    }

    let isMounted = true;

    // Use cached promise if exchange for this token was already initiated
    let exchangePromise = ssoExchangeCache.get(token);
    if (!exchangePromise) {
      exchangePromise = (async () => {
        const isLocal = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.endsWith('.localhost')
        );

        const candidateGateways = (isLocal
          ? [
              API_BASE_URL,
              "http://localhost:3000",
              "http://localhost:9005",
              "http://127.0.0.1:3000",
              "http://127.0.0.1:9005"
            ]
          : [
              API_BASE_URL,
              typeof window !== 'undefined' ? window.location.origin : null,
              "https://dms.intellinexa.in"
            ]
        ).filter((val, idx, arr) => val && arr.indexOf(val) === idx);

        let response = null;
        let lastError = null;

        for (const base of candidateGateways) {
          try {
            const res = await fetch(`${base}/api/${companySlug}/auth/sso-exchange`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({
                ssoToken: token,
                vcOrigin: searchParams.get("vcOrigin") || searchParams.get("origin") || localStorage.getItem("verifychain_origin") || null
              })
            });
            if (res.ok || res.status === 400 || res.status === 401 || res.status === 403 || res.status === 502) {
              response = res;
              localStorage.setItem('dms_gateway_url', base);
              break;
            }
          } catch (fetchErr) {
            lastError = fetchErr;
          }
        }

        if (!response) {
          throw new Error(
            "Network error connecting to DMS Backend. Please ensure DMS backend is running via 'docker compose up -d' in DMS/DMS-BACKEND/Backend."
          );
        }

        const data = await response.json();
        if (!response.ok || !data.success || !data.tokens) {
          throw new Error(data.message || "Failed to authenticate single sign-on session with VerifyChain.");
        }

        return data;
      })();

      ssoExchangeCache.set(token, exchangePromise);
    }

    exchangePromise
      .then((data) => {
        if (!isMounted) return;

        // Helper to format role title
        const formatRole = (r, email) => {
          const raw = String(r || "").toLowerCase().trim().replace(/[-_]/g, " ");
          if (raw === "auditor") return "Auditor";
          if (raw === "business user" || raw === "business_user") return "Business User";
          if (raw === "compliance officer" || raw === "compliance_officer" || raw === "compliance user") return "Compliance Officer";
          const em = String(email || "").toLowerCase();
          if (em.includes("abhishek") || em.includes("auditor")) return "Auditor";
          if (em.includes("aditya") || em.includes("business")) return "Business User";
          if (em.includes("soudip") || em.includes("compliance")) return "Compliance Officer";
          return r || "Manager";
        };

        const email = data.user?.email || "";
        const vcRole = data.vcRole || data.user?.vcRole || "";
        const roleTitle = formatRole(data.displayRole || data.role || vcRole, email);
        const resolvedName = data.user?.name || (email ? email.split("@")[0] : "User");
        const capName = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);

        // Store DMS credentials
        localStorage.setItem("accessToken", data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
        localStorage.setItem("userRole", roleTitle);
        localStorage.setItem("displayRole", roleTitle);
        localStorage.setItem("vcRole", vcRole || roleTitle.toLowerCase().replace(/\s+/g, "_"));
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", capName);
        localStorage.setItem("companySlug", companySlug);

        // Store VerifyChain origin for seamless tenant-aware logout
        const originParam = searchParams.get("vcOrigin") || searchParams.get("origin");
        if (originParam) {
          localStorage.setItem("verifychain_origin", originParam);
        } else if (document.referrer) {
          try {
            const ref = new URL(document.referrer);
            if (ref.origin && !ref.origin.includes(':5174')) {
              localStorage.setItem("verifychain_origin", ref.origin);
            }
          } catch (e) {}
        }

        setStatus("success");

        // Clean target path: ensure it starts with /:companySlug
        let targetPath = redirect;
        if (!targetPath.startsWith(`/${companySlug}`)) {
          if (!targetPath.startsWith("/")) {
            targetPath = "/" + targetPath;
          }
          targetPath = `/${companySlug}${targetPath}`;
        }

        // Small delay for smooth UI transition
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 350);
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(err.message || "Single sign-on authentication failed.");
      });

    return () => {
      isMounted = false;
    };
  }, [token, companySlug, redirect, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        {status === "authenticating" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Signing into DMS Portal</h2>
            <p className="text-sm text-slate-500">
              Validating single sign-on credentials from VerifyChain for workspace{" "}
              <strong className="text-blue-600 font-semibold">{companySlug}</strong>...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Authentication Verified</h2>
            <p className="text-sm text-slate-500">Redirecting to your document folder explorer...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">SSO Authentication Failed</h2>
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl text-left">
              {errorMessage}
            </p>
            <div className="pt-2">
              <Link
                to={companySlug ? `/${companySlug}/login` : "/login"}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
              >
                <span>Continue to Standard Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

