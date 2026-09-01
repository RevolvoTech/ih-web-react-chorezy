import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Canonical metadata, internal links, and the sitemap all use trailing
  // slashes. Serve those URLs directly instead of making crawlers follow an
  // avoidable normalization redirect for every indexable page.
  trailingSlash: true,
  async redirects() {
    return [
      { source: "/verify-email", destination: "/verify", permanent: false },
      { source: "/auth/verify", destination: "/verify", permanent: false },
      { source: "/reset-password", destination: "/reset", permanent: false },
      { source: "/auth/reset", destination: "/reset", permanent: false },
    ];
  },
};

export default nextConfig;
