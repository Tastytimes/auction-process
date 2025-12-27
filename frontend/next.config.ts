import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent Next from inferring an incorrect workspace root when multiple lockfiles exist.
  // This should point to the repo root (one level above `frontend/`).
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
