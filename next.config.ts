import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site in out/: everything runs in the browser against the mock API.
  output: "export",
  // GitHub Pages serves the site from /pulse/; /check-in/ becomes a folder index there.
  basePath: process.env.GITHUB_ACTIONS ? "/pulse" : "",
  trailingSlash: true,
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
