import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  build: {
    format: 'file'
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false
    })
  ]
});
