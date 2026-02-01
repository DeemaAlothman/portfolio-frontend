import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',

  // السماح بتحميل الصور من Backend
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '217.76.53.136',
        port: '4050',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4050',
        pathname: '/uploads/**',
      },
    ],
  },

  // إعدادات رفع الملفات
  experimental: {
    // السماح برفع ملفات كبيرة (حتى 100MB)
    // bodySizeLimit: '100mb', // يمكن زيادتها حسب الحاجة
  },
};

export default nextConfig;
