import type { NextConfig } from "next";

/**
 * Fija la raíz del proyecto para que Turbopack no infiera un directorio
 * superior (por ejemplo, por un package-lock.json ajeno) durante el build.
 */
const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() }
};

export default nextConfig;
