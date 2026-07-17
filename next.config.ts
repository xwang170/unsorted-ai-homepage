import type { NextConfig } from "next";

// Deployed to GitHub Pages as a project page: https://<user>.github.io/<repo>/
// basePath/assetPrefix are only applied for the production (export) build so
// `next dev` still works at the root during local verification.
const repo = "unsorted-ai-homepage";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
};

export default nextConfig;
