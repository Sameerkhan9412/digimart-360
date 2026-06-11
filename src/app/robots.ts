import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/favicon.ico', '/icon.png', '/apple-icon.png'],
    },
    sitemap: 'https://digimart360.com/sitemap.xml',
  };
}
