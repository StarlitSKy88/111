const nextConfig = {
  output: 'standalone',
  experimental: { serverActions: true },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:3000/api/:path*' },
    ];
  },
};
export default nextConfig;
