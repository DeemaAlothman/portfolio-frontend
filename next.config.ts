import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',

  // إعدادات رفع الملفات
  experimental: {
    // السماح برفع ملفات كبيرة (حتى 100MB)
    // bodySizeLimit: '100mb', // يمكن زيادتها حسب الحاجة
  },
};

export default nextConfig;
