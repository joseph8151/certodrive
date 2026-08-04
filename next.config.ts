import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Emit a self-contained server bundle for small Docker images / container hosts.
  output: "standalone",
};

export default nextConfig;
