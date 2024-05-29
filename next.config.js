/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["livedreligion.s3.amazonaws.com"],
  },
  env: {
    NEXT_PUBLIC_MAP_KEY: process.env.NEXT_PUBLIC_MAP_KEY,
    NEXT_PUBLIC_S3_PROXY_PREFIX: process.env.NEXT_PUBLIC_S3_PROXY_PREFIX,
    NEXT_PUBLIC_RERUM_PREFIX: process.env.NEXT_PUBLIC_RERUM_PREFIX,
    NEXT_PUBLIC_PLACES_KEY: process.env.NEXT_PUBLIC_PLACES_KEY,
    NEXT_PUBLIC_ADMIN_PASKEY: process.env.NEXT_PUBLIC_ADMIN_PASKEY,
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  },
};

module.exports = nextConfig;
