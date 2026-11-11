// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// A fully static site: `astro build` writes it to dist/, which wrangler.jsonc serves from Cloudflare.
export default defineConfig({
  site: 'https://belgium.ryanfoerster.dev',
  // the markup is typeset by hand (inline pieces with no space between them): keep its whitespace as written
  compressHTML: false,
  vite: {
    plugins: [tailwindcss()],
  },
});
