const siteConfig = {
  author: 'Zhongye',
  title: 'Zhongye',
  description: 'Personal blog site',
  lang: 'en-GB',
  /** 页脚版权起始年份，和当前年份不同时渲染成区间 */
  startYear: 2024,
}
export default siteConfig

export const navLinks = [
  {
    title: 'Home',
    path: '/',
  },
  {
    title: 'Blog',
    path: '/blog',
  },
  // {
  //   title: 'Tags',
  //   path: '/tags',
  // },
  {
    title: 'About',
    path: '/about',
  },
]

/** 侧边栏与页脚共用的社交入口，icon 为 UnoCSS 的图标类名 */
export const socials = [
  {
    title: 'GitHub',
    url: 'https://github.com/Zhongye1',
    icon: 'i-tabler-brand-github',
  },
]
