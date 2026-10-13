import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/adminlogin",
        destination: "/loginadmin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
