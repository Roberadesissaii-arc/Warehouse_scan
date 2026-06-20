import type { NextConfig } from "next";

const scanBackend = process.env.SCAN_BACKEND_URL || "http://127.0.0.1:5003";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.4.21", "192.168.4.41", "localhost", "127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${scanBackend}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Permissions-Policy", value: "camera=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
