import 'vuetify/styles/main.css'

import { h, resolveComponent } from 'vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { createVuetify } from 'vuetify'
import { aliases as defaultAliases } from 'vuetify/iconsets/mdi'
import type { IconProps as VuetifyIconProps } from 'vuetify'

// 色票對應 app/assets/scss/preprocess.scss 的 $theme-light / $theme-dark。
// 兩邊要一起改——Vuetify 元件吃這裡，自訂樣式吃 CSS 變數。
const veekend = {
  dark: false,
  colors: {
    primary: '#ffe60f',
    'primary-darken': '#d4bf00',
    'primary-lighten': '#fff9c4',
    secondary: '#000000',
    surface: '#ffffff',
    background: '#ffffff',
    subtitle: '#535353',
    divider: '#eeeeee',
    error: '#e60012',
    success: '#1a8a4a',
    info: '#0168ee',
  },
}

const veekendDark = {
  dark: true,
  colors: {
    primary: '#ffe60f',
    'primary-darken': '#ccb800',
    'primary-lighten': '#4a4200',
    secondary: '#ffffff',
    surface: '#1a1a1a',
    background: '#1a1a1a',
    subtitle: '#b0b0b0',
    divider: '#3a3a3a',
    error: '#ff5a63',
    success: '#54c594',
    info: '#5aa9ff',
  },
}

/**
 * Vuetify 內建 alias 給的是 `mdi-checkbox-marked` 這種連字號寫法，
 * @nuxt/icon 要的是 `mdi:checkbox-marked`。沒轉換的話，因為我們關掉了
 * fallbackToApi，checkbox 與 radio 的勾選圖示會整個載不出來。
 */
const toIconifyName = (icon: VuetifyIconProps['icon']): string => {
  const name = icon ? String(icon) : ''
  return name.startsWith('mdi-') ? name.replace(/^mdi-/, 'mdi:') : name
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    theme: {
      defaultTheme: 'veekend',
      themes: { veekend, veekendDark },
    },
    // 讓 Vuetify 用 @nuxt/icon 的 <Icon> 渲染圖示，不另外載入 mdi 字型
    icons: {
      defaultSet: 'custom',
      aliases: { ...defaultAliases },
      sets: {
        custom: {
          component: (props: VuetifyIconProps) =>
            h(resolveComponent('Icon'), { name: toIconifyName(props.icon) }),
        },
      },
    },
    defaults: {
      VBtn: { elevation: 0 },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
