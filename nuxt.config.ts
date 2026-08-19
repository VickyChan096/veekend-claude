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
    // 登入與編輯頁完全靠 client 端狀態運作，不要預先渲染。
    // 對齊 002_View 用 routeRules 關掉 ssr 的做法——autoImport 關著時
    // definePageMeta 這個巨集 TypeScript 認不得，設定集中在這裡比較好維護。
    routeRules: {
      '/login': { ssr: false },
      '/article/edit': { ssr: false },
    },
    prerender: {
      // ipx 在建置時同時處理數百張圖，跟頁面 prerender 搶資源會讓隨機頁面
      // 冒出 [unhandled] 500——三次建置會掛一次。限制並行數換取穩定性。
      concurrency: 4,
    },
  },

  runtimeConfig: {
    public: {
      // GAS web app endpoint（讀取文章資料）
      gasApiUrl: process.env.NUXT_PUBLIC_GAS_API_URL ?? '',
      // 站台的完整網址（含 baseURL），例如 https://user.github.io/repo/
      // 只有 og:image / og:url 這類需要絕對網址的地方會用到——社群平台不吃相對路徑。
      // 正式值由 workflow 依 repo 自動組出，本機留空即可。
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? '',
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

  // 不要把 CSS 內嵌進 HTML。Noto Sans TC 是中文字型，@font-face 宣告切成幾百個
  // unicode-range 子集就有 425KB，內嵌會讓每個用到字型的元件各塞一份
  // ——首頁曾經因此變成 4.2MB（gzip 後仍有 1.67MB），而且換頁不能快取。
  features: {
    inlineStyles: false,
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
    // nuxt generate 時 ipx 會自動切成靜態模式：建置階段就把縮圖與 WebP 產好，
    // 放進 .output/public/_ipx/，執行期不需要任何伺服器。
    // 原始圖檔不動，最佳化版本是額外產生的。
    provider: 'ipx',
    // 斷點刻意只留四個。每多一個斷點、每多一種 sizes 寫法，都會多出一整批變體要產生
    // ——曾經因為斷點太多產出 527 個變體、57MB，比原圖還大，而且建置會隨機失敗。
    screens: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
    // 只影響用 width/height 指定尺寸的情況；用 sizes 時 @nuxt/image 仍會自動補
    // 2 倍的 srcset 給高解析螢幕（例如 1280px 會多產 2560w）。那是正確行為
    // ——瀏覽器只挑一個下載，不影響使用者流量，只是多佔建置磁碟。
    densities: [1],
    format: ['webp'],
    quality: 82,
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
