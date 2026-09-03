import type { NextConfig } from "next";

// Derived from STORAGE_MAX_UPLOAD_MB (lib/storage/upload-service.ts) plus
// headroom for multipart/form-data overhead, so the two limits can't drift
// out of sync. Next's own default here is 1MB, which is smaller than our
// upload limit and was silently rejecting image uploads (division/product/
// page photos) with an unhandled 413 before saveUpload's own size check ever
// ran.
const uploadLimitMb = Number(process.env.STORAGE_MAX_UPLOAD_MB || 5);
const bodySizeLimitMb = uploadLimitMb + 2;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: `${bodySizeLimitMb}mb`,
    },
  },
};

export default nextConfig;
