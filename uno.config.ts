import { defineConfig, presetAttributify, presetIcons, presetWind3 } from 'unocss'
import presetChinese from 'unocss-preset-chinese'
import { community, navLinks, services, socials } from './app/site.config'
import { codeBlockIconNames } from './shared/utils/icon'

export default defineConfig({
  // ...UnoCSS options
  shortcuts: {
    'text-primary': 'c-blue-400 dark:c-gray-200',
    hover: 'op-50 hover:op-100',
    // 底色统一走 color.scss 的 token，不再各处写死 #fff / #1f1f1f
    container: 'bg-[var(--c-bg-1)]',
    'color-fade': 'c-gray-900:50 dark:c-gray-300:50',
    // 侧边栏导航项
    'nav-link':
      'w-full flex items-center gap-2 px-3 py-2 rounded-lg c-[var(--c-text-2)] transition duration-200 hover:bg-[var(--c-bg-soft)] hover:c-[var(--c-text-1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-primary)]',
  },
  theme: {
    colors: {
      primary: '#1677ff',
      'primary-border': '#1677ff',
      text: 'rgba(0, 0, 0, 0.88)',
      container: '#efefef',
      border: '#d9d9d9',
    },
  },
  presets: [
    presetWind3({
      dark: 'class',
    }),
    presetChinese(),
    presetAttributify(),
    presetIcons({
      collections: {
        'icon-park-outline': () =>
          import('@iconify-json/icon-park-outline/icons.json').then((i) => i.default),
        catppuccin: () => import('@iconify-json/catppuccin/icons.json').then((i) => i.default),
        tabler: () => import('@iconify-json/tabler/icons.json').then((i) => i.default),
      },
    }),
  ],
  // 代码块的图标名由 getFileIcon/getLangIcon 在运行时拼出，扫描不到，只能显式列出来
  safelist: [
    'i-tabler-check',
    'i-tabler-copy',
    'i-tabler-chevrons-up',
    ...codeBlockIconNames.map((name) => `i-${name.replace(':', '-')}`),
    // 侧边栏/页脚的社交图标类名写在 site.config.ts 里，扫描不到，同样显式列出
    ...socials.map((social) => social.icon),
    // 侧边栏导航（Home/Blog/About）的图标同理
    ...navLinks.map((link) => link.icon),
    // 右侧栏「技术信息」「社区」卡片的图标同理
    ...services.map((service) => service.icon),
    ...community.cards.map((card) => card.icon),
  ],
  preflights: [
    {
      getCSS: () => `
      ::selection {
        background-color: #10B981;
        color:white;
      }
    `,
    },
  ],
})
