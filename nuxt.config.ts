// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 一律顯式 import，不靠自動註冊（對齊 002_View）
  imports: {
    autoImport: false,
  },
  components: {
    dirs: [],
    global: false,
  },

  // GitHub Pages 靜態輸出
  ssr: true,
  nitro: {
    preset: 'github_pages',
  },

  runtimeConfig: {
    public: {
      // GAS web app endpoint（讀取文章資料）
      gasApiUrl: process.env.NUXT_PUBLIC_GAS_API_URL ?? '',
    },
  },

  app: {
    // GitHub Pages 子路徑。本機開發不設即為 /，部署時設成 /<repo-name>/
    // ⚠ 不要把這個環境變數命名為 NUXT_APP_BASE_URL——Nuxt 會把同名變數再套用一次，
    //   導致每個頁面只 prerender 出 "Redirecting..."。所以用自訂名稱。
    baseURL: process.env.VEEKEND_BASE_URL ?? '/',
    head: {
      htmlAttrs: {
        lang: 'zh-Hant-TW',
      },
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'description', content: 'Veekend — 每個週末，都值得被記錄' },
        { property: 'og:site_name', content: 'Veekend' },
        { property: 'og:title', content: 'Veekend' },
        { property: 'og:description', content: 'Veekend — 每個週末，都值得被記錄' },
      ],
      noscript: [
        {
          innerHTML:
            '<p class="noscript-message">您的瀏覽器不支援 JavaScript，網頁功能可能無法正常運作，請開啟瀏覽器的 JavaScript。</p>',
        },
      ],
    },
  },

  css: ['@/assets/scss/main.scss'],

  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon', '@nuxt/image'],

  // 純靜態站沒有 runtime server：圖示全部打包進 client bundle，不打 Iconify API
  icon: {
    serverBundle: false,
    clientBundle: {
      scan: true,
    },
    fallbackToApi: false,
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 700],
    },
  },

  image: {
    // 靜態站不做 runtime 影像處理
    provider: 'none',
  },

  vite: {
    optimizeDeps: {
      include: ['maplibre-gl'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/preprocess.scss" as *;',
        },
      },
    },
    plugins: [
      vuetify({
        autoImport: true,
      }),
    ],
  },

  build: {
    transpile: ['vuetify'],
  },
})
