import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: [path.join(__dirname, "src/styles")],
    // Webpack supports this per-resource callback; keep dev and build aligned.
    // Plain CSS must not receive Sass imports that its parser leaves unresolved.
    additionalData: (content: string, context: { resourcePath: string }) =>
      /\.s[ac]ss$/i.test(context.resourcePath)
        ? `@import "vars.scss";\n${content}`
        : content,
    // Silence Sass deprecation noise (@import, legacy JS API) that floods
    // build logs on Vercel and hides real errors.
    silenceDeprecations: ["import", "legacy-js-api", "global-builtin", "mixed-decls"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
};

export default nextConfig;
