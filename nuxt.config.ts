// https://nuxt.com/docs/api/configuration/nuxt-config
import siteConfig from './app/site.config'

export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@nuxt/content'],
  // Nitro generates `.nuxt/tsconfig.server.json` without a `types` array, so TypeScript
  // implicitly includes every installed `@types/*` package. That trips over the deprecated,
  // types-less `@types/parse-path` stub and fails with TS2688, so pin the types explicitly.
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: [],
        },
      },
    },
  },
  app: {
    head: {
      meta: [
        { name: 'description', content: siteConfig.description },
        { name: 'author', content: siteConfig.author },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, shrink-to-fit=no' },
        { name: 'revisit-after', content: '7 days' },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { charset: 'UTF-8' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      ],
      noscript: [{ textContent: 'JavaScript is required' }],
      htmlAttrs: {
        lang: siteConfig.lang,
      },
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  compatibilityDate: '2026-09-22',
})
