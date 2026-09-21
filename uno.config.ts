import { defineConfig, presetAttributify, presetIcons, presetWind3 } from 'unocss'
import presetChinese from 'unocss-preset-chinese'
import { codeBlockIconNames } from './shared/utils/icon'

export default defineConfig({
  // ...UnoCSS options
  shortcuts: {
    'text-primary': 'c-blue-400 dark:c-gray-200',
    hover: 'op-50 hover:op-100',
    container: 'bg-white dark:bg-#1f1f1f',
    'color-fade': 'c-gray-900:50 dark:c-gray-300:50',
  },
  theme: {
    colors: {
      primary: '#1677ff',
      'primary-border': '#1677ff',
      text: 'rgba(0, 0, 0, 0.88)',
      container: '#ffffff',
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
