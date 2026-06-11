/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the site can be hosted on GitHub Pages (no server).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Set to "/<repo>" when deploying to a GitHub Pages project site.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
}

module.exports = nextConfig
