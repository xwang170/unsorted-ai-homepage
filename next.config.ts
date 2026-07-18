import type { NextConfig } from "next";

// Deployed to GitHub Pages at the custom domain https://www.unsorted.ai
// (CNAME configured in repo Pages settings + public/CNAME). Served from the
// domain root, so no basePath/assetPrefix.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
