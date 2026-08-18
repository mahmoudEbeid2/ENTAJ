import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Matches STORAGE_MAX_UPLOAD_MB (lib/storage/upload-service.ts) plus
      // headroom for multipart/form-data overhead. Next's own default here
      // is 1MB, which is smaller than our upload limit and was silently
      // rejecting image uploads (division/product/page photos) with an
      // unhandled 500 before saveUpload's own size check ever ran.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
