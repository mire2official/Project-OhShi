/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["v0.blob.com", "cdn.shopify.com"],
  },
  transpilePackages: ["three"],
  webpack: (config) => {
    // Add support for importing 3D models
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next/static/images",
          outputPath: "static/images/",
        },
      },
    })

    return config
  },
}

module.exports = nextConfig

