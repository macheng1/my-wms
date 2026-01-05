const nextConfig = {
  output: "standalone", // 💡 必须开启：只打包运行时必需文件
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
