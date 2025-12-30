import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: [
    "@douyinfe/semi-ui-19",
    "@douyinfe/semi-icons",
    "@douyinfe/semi-illustrations",
  ],
};

export default nextConfig;
