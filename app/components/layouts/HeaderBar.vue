<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'
import { useArticles } from '@/composables/pages/useArticles'
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import { useAlert } from '@/composables/common/useAlert'
import type { Article } from '@/types/api/article'

const { assetUrl } = useAssetUrl()
const router = useRouter()
const route = useRoute()
const { openAlert } = useAlert()
const { groupedByCity } = await useArticles()

const navOpen = ref(false)
const openMenu = ref<string | null>(null)
const searchText = ref('')

const menus = computed(() => [
  { key: 'newTaipei', title: '新北市', articles: groupedByCity.value.newTaipei, allQuery: '新北市' },
  { key: 'taipei', title: '台北市', articles: groupedByCity.value.taipei, allQuery: '台北市' },
  { key: 'other', title: '其他', articles: groupedByCity.value.other, allQuery: '其他' },
])

const toggleMenu = (key: string) => {
  openMenu.value = openMenu.value === key ? null : key
}

const search = () => {
  if (!searchText.value.trim()) {
    openAlert({ type: 'error', title: '哇糟糕了', text: '請輸入欲搜尋的關鍵字喔！' })
    return
  }
  router.push({ path: '/result', query: { search: searchText.value.trim() } })
  navOpen.value = false
}

// 換頁時把選單收起來
watch(
  () => route.fullPath,
  () => {
    navOpen.value = false
    openMenu.value = null
  }
)

// 「其他」那組要在區名前面補上縣市（legacy 的 .lastDistrict）
const districtLabel = (article: Article, showCity: boolean) =>
  showCity ? `${article.city} ${article.district}` : article.district
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__bar">
        <NuxtLink to="/" class="header__logo">
          <h1 :style="{ backgroundImage: `url(${assetUrl('images/logo.svg')})` }">Veekend</h1>
          <img :src="assetUrl('images/logo-veekend.svg')" alt="Veekend" >
        </NuxtLink>

        <button
          type="button"
          class="header__hamburger"
          :class="{ 'is-open': navOpen }"
          :aria-expanded="navOpen"
          aria-label="開啟選單"
          aria-controls="site-nav"
          @click="navOpen = !navOpen"
        >
          <span /><span /><span />
        </button>
      </div>

      <nav id="site-nav" class="header__nav" :class="{ 'is-open': navOpen }" aria-label="主選單">
        <div class="header__search">
          <input
            v-model="searchText"
            type="text"
            placeholder="搜尋"
            aria-label="搜尋文章"
            @keyup.enter="search"
          >
          <button type="button" aria-label="送出搜尋" @click="search">
            <Icon name="mdi:magnify" />
          </button>
        </div>

        <ul class="header__menu">
          <li v-for="menu in menus" :key="menu.key" class="menu">
            <button
              type="button"
              class="menu__title"
              :class="{ 'is-active': openMenu === menu.key }"
              :aria-expanded="openMenu === menu.key"
              @click="toggleMenu(menu.key)"
            >
              {{ menu.title }}
              <Icon name="mdi:chevron-down" class="menu__icon" aria-hidden="true" />
            </button>
            <div v-show="openMenu === menu.key" class="menu__district">
              <ul>
                <li v-for="article in menu.articles" :key="article.week">
                  <NuxtLink :to="`/article/${article.week}`">
                    {{ districtLabel(article, menu.key === 'other') }}
                  </NuxtLink>
                </li>
                <li class="menu__all">
                  <NuxtLink :to="{ path: '/result', query: { all: menu.allQuery } }">全地區</NuxtLink>
                </li>
              </ul>
            </div>
          </li>
          <li class="menu">
            <NuxtLink to="/about" class="menu__title">
              關於
              <Icon name="mdi:information-outline" class="menu__icon" aria-hidden="true" />
            </NuxtLink>
          </li>
          <li class="menu">
            <NuxtLink to="/login" class="menu__title">
              登入
              <Icon name="mdi:login" class="menu__icon" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: fixed;
  top: 0;
  z-index: var(--z-header);
  width: 100%;
  background-color: var(--primary);
  box-shadow: 0 3px 6px #00000010;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;

    @include mobile {
      flex-wrap: wrap;
      padding: 0 15px;
    }
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0;

    @include mobile {
      width: 100%;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    color: var(--secondary);

    h1 {
      width: 40px;
      height: 40px;
      overflow: hidden;
      white-space: nowrap;
      text-indent: 101%;
      background-size: cover;
    }

    img {
      width: 120px;
    }
  }

  // legacy 的漢堡鍵：開啟後上下兩條交叉成 X
  &__hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0 4px;
    background-color: var(--secondary);
    border: 0;
    border-radius: var(--border-radius-s);

    @include mobile {
      display: flex;
    }

    span {
      display: block;
      height: 1px;
      background-color: #ffffff;
      transition: var(--transition-slow);
    }

    span + span {
      margin-top: 8px;
    }

    &.is-open span:nth-child(1) {
      opacity: 0;
    }
    &.is-open span:nth-child(2) {
      transform: rotate(-45deg);
    }
    &.is-open span:nth-child(3) {
      margin-top: -1px;
      transform: rotate(45deg);
    }
  }

  &__nav {
    display: flex;
    align-items: center;

    @include mobile {
      position: absolute;
      top: 56px;
      left: 0;
      display: none;
      flex-wrap: wrap;
      width: 100%;
      padding: 8px;
      background-color: var(--divider);
    }
  }

  &__nav.is-open {
    @include mobile {
      display: block;
    }
  }

  &__search {
    display: flex;

    input {
      width: 25vw;
      height: 30px;
      padding: 8px;
      // 小於 16px 會讓 iOS 聚焦時自動放大畫面
      font-size: 1rem;
      border: 0;
      border-radius: var(--border-radius-s) 0 0 var(--border-radius-s);

      @include mobile {
        width: 100%;
        margin-bottom: 8px;
      }
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      color: #ffffff;
      background-color: var(--secondary);
      border: 0;
      border-radius: 0 var(--border-radius-s) var(--border-radius-s) 0;
    }
  }

  &__menu {
    display: flex;

    @include mobile {
      flex-wrap: wrap;
    }
  }
}

.menu {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 10px;

  @include mobile {
    flex-wrap: wrap;
    width: 100%;
    margin: 0 0 8px 20px;
  }

  &__title {
    @include body1-regular;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    color: var(--secondary);
    background: none;
    border: 0;

    // legacy 的白色底線：從中間往兩邊展開
    &::after {
      content: '';
      position: absolute;
      top: 55%;
      left: 50%;
      z-index: -1;
      width: 0;
      border-bottom: 10px solid #ffffff;
      transform: translateX(-50%);
      transition: var(--transition-fast);

      @include mobile {
        display: none;
      }
    }

    &.is-active::after {
      width: calc(110% + 8px);
    }

    @include hover {
      &:hover::after {
        width: calc(110% + 8px);
      }
    }

    &:focus-visible {
      outline: var(--focus-visible);
    }
  }

  &__icon {
    margin-left: 2px;
    font-size: 0.75rem;
    color: var(--primary-darken);
    transition: var(--transition-fast);

    @include mobile {
      display: none;
    }
  }

  &:hover &__icon {
    color: var(--secondary);
  }

  &__district {
    position: absolute;
    top: 28px;
    right: -11px;

    @include mobile {
      position: relative;
      top: 0;
      right: 0;
      width: 100%;
    }
  }

  &__district > ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 320px;
    padding-top: 8px;
    background-color: #ffffff;
    border: 1px solid var(--divider);

    @include mobile {
      width: 100%;
      max-height: 300px;
      padding: 8px;
      overflow-y: auto;
    }
  }

  &__district > ul > li {
    @include body2-regular;
    padding: 0 4px;
    margin-bottom: 8px;
    color: var(--subtitle);
    border-left: 1px solid var(--divider);
    transition: var(--transition-fast);

    @include mobile {
      padding: 4px 8px;
      margin: 4px;
      border: 1px solid var(--divider);
      border-radius: var(--border-radius-s);
    }
  }

  // 每列第一個不畫左分隔線
  &__district > ul > li:nth-child(5n + 1) {
    border-left: 0;

    @include mobile {
      border: 1px solid var(--divider);
    }
  }

  &__district > ul > li:hover {
    @include hover {
      background-color: var(--primary);
    }
  }

  &__all {
    font-weight: 500;
  }
}
</style>
