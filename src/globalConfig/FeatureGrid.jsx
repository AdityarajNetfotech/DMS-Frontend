import {
  Sparkles,
  ScanText,
  Share2,
  Code2,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

import FeatureCard from "./FeatureCard";
import PlatformVelocity from "./PlatformVelocity";

export default function FeatureGrid() {
  const features = [
    {
      title: "AI Search",
      badge: "BETA",
      percentage: "82%",
      icon: <Sparkles size={20} />,
      description:
        "Enhanced semantic indexing using vector embeddings to enable natural language queries.",
    },
    {
      title: "OCR Engine",
      badge: "STABLE",
      percentage: "94%",
      icon: <ScanText size={20} />,
      description:
        "Optical Character Recognition for converting images into searchable assets.",
    },
    {
      title: "Workflow Engine",
      badge: "ACTIVE",
      percentage: "45%",
      icon: <Code2 size={20} />,
      description:
        "Automated document routing and approval chains.",
    },
    {
      title: "External Sharing",
      badge: "RESTRICTED",
      percentage: "0%",
      enabled: false,
      icon: <Share2 size={20} />,
      description:
        "Generate secure links for sharing documents externally.",
    },
    {
      title: "API Access",
      badge: "ENTERPRISE",
      percentage: "1.2M",
      icon: <Code2 size={20} />,
      description:
        "RESTful APIs for integrations and automation.",
    },
    {
      title: "Audit Export",
      badge: "CORE",
      percentage: "100%",
      icon: <FileCheck size={20} />,
      description:
        "Export cryptographically signed audit logs.",
    },
    {
      title: "SSO Authentication",
      badge: "RELEASE WINDOW",
      percentage: "24/30",
      icon: <ShieldCheck size={20} />,
      description:
        "SAML 2.0 and OIDC integration for centralized authentication.",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {features.slice(0, 6).map((item, index) => (
        <FeatureCard
          key={index}
          {...item}
        />
      ))}

      <FeatureCard {...features[6]} />

      <PlatformVelocity />
    </div>
  );
}