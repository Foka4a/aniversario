// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // CSS vai embutido no HTML: uma requisição a menos no carregamento.
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
