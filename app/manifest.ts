import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IRMS — Internship Reference Letters',
    short_name: 'IRMS',
    description:
      'Request, approve, and verify official internship reference letters for COMSATS Sahiwal CS.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f4f7f6',
    theme_color: '#0c5c56',
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
