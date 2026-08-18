// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify'

// Vuetify 內建元件會用到的 mdi 圖示（取自 vuetify/iconsets/mdi 的 aliases）。
// 清單來源：Object.values(aliases)，把 'mdi-x' 轉成 '@nuxt/icon' 要的 'mdi:x'
const VUETIFY_ICONS = [
  'mdi:alert-circle', 'mdi:arrow-down', 'mdi:arrow-left', 'mdi:arrow-right', 'mdi:arrow-up',
  'mdi:cached', 'mdi:calendar', 'mdi:check', 'mdi:check-circle', 'mdi:checkbox-blank-outline',
  'mdi:checkbox-marked', 'mdi:chevron-down', 'mdi:chevron-left', 'mdi:chevron-right',
  'mdi:chevron-up', 'mdi:circle', 'mdi:close', 'mdi:close-circle', 'mdi:information',
  'mdi:magnify', 'mdi:menu', 'mdi:menu-down', 'mdi:menu-right', 'mdi:minus', 'mdi:minus-box',
  'mdi:page-first', 'mdi:page-last', 'mdi:pencil', 'mdi:plus', 'mdi:radiobox-blank',
  'mdi:radiobox-marked', 'mdi:star', 'mdi:star-half-full', 'mdi:star-outline',
  'mdi:unfold-more-horizontal',
]

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
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
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
      // scan 只掃得到原始碼裡寫死的名稱。Vuetify 的 checkbox／radio／分頁等圖示
      // 是執行期才從 alias 取的，掃不到，要在這裡點名（見 plugins/vuetify.ts）
      icons: VUETIFY_ICONS,
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
