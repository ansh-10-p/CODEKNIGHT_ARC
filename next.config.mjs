import dotenv from "dotenv";
import path from "path";

const rootEnv = path.resolve(process.cwd(), "../.env");
dotenv.config({ path: rootEnv, override: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
