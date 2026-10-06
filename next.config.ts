import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on the local network (e.g. http://192.168.0.9:3100) load dev assets.
  allowedDevOrigins: ["192.168.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
