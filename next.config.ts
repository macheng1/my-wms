const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 构建时忽略所有 TypeScript 错误
  },
  transpilePackages: [
    "@douyinfe/semi-ui-19",
    "@douyinfe/semi-icons",
    "@douyinfe/semi-illustrations",
  ],
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    return [
      // 代理所有 API 请求到后端
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
