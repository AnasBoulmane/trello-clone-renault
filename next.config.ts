import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
