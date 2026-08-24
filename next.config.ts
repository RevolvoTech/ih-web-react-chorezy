import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
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
