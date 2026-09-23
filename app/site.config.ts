const siteConfig = {
  author: 'Zhongye',
  title: 'Zhongye',
  description: 'Personal blog site',
  lang: 'en-GB',
  /** 站点上线日期 */
  startDate: '2023-09-12',
  /** 页脚版权起始年份 */
  startYear: 2023,
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

/**
 * 右侧技术信息
 */
export const services = [
  { label: '部署平台', icon: 'i-tabler-brand-github', text: 'GitHub Pages' },
  { label: '站点域名', icon: 'i-tabler-world-www', text: 'blog.junce.net' },
]

/**
 * 右侧栏「社区」分组
 */
export interface CommunityCard {
  /** 卡片里那行渐变大字 */
  headline: string
  /** 图标类名（UnoCSS） */
  icon: string
  /** 底图。这张卡的视觉一半靠它：没有底图，「平时压暗、进侧栏才亮起」就没有对象可压 */
  bgImg?: string
  /** 卡片正文 */
  label: string
  /** 外链地址 */
  url?: string
}

export const community = {
  /** 整组共用的标题，只在分组头部渲染一处 */
  title: '传送门',
  cards: [
    {
      headline: 'Github',
      icon: 'i-tabler-brand-github',
      bgImg: 'https://avatars.githubusercontent.com/u/145737758?v=4',
      label: 'Zhongye1',
      url: 'https://github.com/Zhongye1',
    },
    {
      headline: '软件/嵌入式交流群',
      icon: 'i-tabler-brand-qq',
      bgImg: 'https://pica.zhimg.com/v2-74bec7dc73688056bed3106f253ddf0e_1440w.jpg',
      label: '716265391',
    },
  ] as CommunityCard[],
}
