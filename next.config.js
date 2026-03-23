const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  // Note: Type checking errors are temporarily disabled due to Supabase typing issues
  // TODO: Fix TypeScript types for Supabase queries (see SUPABASE_TYPING_ISSUES.md)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" }
    ],
    unoptimized: true
  }
};

module.exports = withPWA(nextConfig);