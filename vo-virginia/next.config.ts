import withSerwistInit from "@serwist/next"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
}

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
})

export default withSerwist(nextConfig)
