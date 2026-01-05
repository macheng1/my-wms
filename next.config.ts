const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 构建时忽略所有 TypeScript 错误
  },
  transpilePackages: [
    "@douyinfe/semi-ui-19",
    "@douyinfe/semi-icons",
    "@douyinfe/semi-illustrations",
  ],
};
module.exports = nextConfig;
