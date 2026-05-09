/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  transpilePackages: ["@swiftbyte/shared", "@swiftbyte/ui"],
};

module.exports = nextConfig;
