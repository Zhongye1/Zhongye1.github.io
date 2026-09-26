const siteConfig = {
  author: 'Zhongye',
  title: 'Zhongye',
  subtitle: '个人博客',
  /** 站点主域名。canonical / og:url / RSS / sitemap 一律以它为准，别再出现第二个域名 */
  url: 'https://blog.junce.net',
  description: '个人博客网站，记录技术、折腾与日常',
  lang: 'zh-CN',
  /** 站点上线日期 */
  startDate: '2023-09-12',
  /** 页脚版权起始年份 */
  startYear: 2023,
  /** 出生年份 */
  birthYear: 2004 as number | null,
}
export default siteConfig

/**
 * 明暗主题在 localStorage 里的键。
 * 两处要用同一个值：composables/useTheme.ts 的 useDark，以及 nuxt.config.ts 里那段
 * 「首帧之前先把 .dark 类定下来」的内联脚本 —— 两边对不上就会出现先白一帧再变黑。
 */
export const themeStorageKey = 'blog-theme-mode'

/**
 * 侧边栏导航，icon 为 UnoCSS 的图标类名（用 Tabler，与右侧栏一致）。
 */
export const navLinks = [
  {
    title: '博客',
    path: '/',
    icon: 'i-tabler-notebook',
  },
  {
    title: '归档',
    path: '/archive',
    icon: 'i-tabler-archive',
  },
  {
    title: '友链',
    path: '/friends',
    icon: 'i-tabler-friends',
  },
  {
    title: '关于',
    path: '/about',
    icon: 'i-tabler-user-circle',
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
 * RSS 订阅源。路径只在这里写一份：nuxt.config 用它做预渲染和 head 的发现链接，
 * 侧边栏的 RSS 图标用它做 href。
 */
export const rssFeed = {
  title: 'RSS 订阅',
  path: '/rss.xml',
}

export interface FooterNavItem {
  /** 图标：UnoCSS 类名（如 i-tabler-rss），或图片地址（外链 / 站内静态文件） */
  icon: string
  text: string
  /** 站内页面写 `/xxx`；外链写完整地址；留空则渲染成不可点击的纯文本行（如 QQ 群号） */
  url?: string
}

/**
 * 页脚站点地图
 * 图标类名写在配置里扫不到，uno.config.ts 的 safelist 会补上（图片地址不用）。
 */
export const footerNav: { title: string; items: FooterNavItem[] }[] = [
  {
    title: '探索',
    items: [
      { icon: 'i-tabler-rss', text: 'RSS 订阅', url: rssFeed.path },
      { icon: 'i-tabler-archive', text: '归档', url: '/archive' },
      { icon: 'i-tabler-friends', text: '友链', url: '/friends' },
      { icon: 'i-tabler-train', text: '开往', url: 'https://www.travellings.cn/go.html' },
    ],
  },
  {
    title: '社交',
    items: [
      {
        icon: 'i-tabler-brand-github',
        text: 'GitHub: Zhongye1',
        url: 'https://github.com/Zhongye1',
      },
      {
        icon: 'i-tabler-brand-qq',
        text: 'QQ: 2760913192',
        url: 'https://user.qzone.qq.com/2760913192/',
      },
    ],
  },
  {
    title: '信息',
    items: [
      {
        icon: 'https://img.icons8.com/color/48/ussr.png',
        text: '萌ICP备20260272号',
        url: 'https://icp.gov.moe/?keyword=20260272',
      },
      {
        icon: 'i-tabler-folder-code',
        text: '本站源码',
        url: 'https://github.com/Zhongye1/Zhongye1.github.io',
      },
      {
        icon: 'i-tabler-brand-nuxt',
        text: 'Based on Nuxt Framework',
        url: 'https://content.nuxt.com',
      },
    ],
  },
]

/**
 * 右侧技术信息
 */
export const services = [
  { label: '部署平台', icon: 'i-tabler-brand-github', text: 'GitHub Pages' },
  { label: '站点域名', icon: 'i-tabler-world-www', text: 'blog.junce.net' },
  { label: '访客统计', icon: 'i-tabler-map-pin', text: 'Cloudflare Workers + D1' },
]

/**
 * 访客地图的后端
 */
export const visitorApi = {
  base: 'https://api.junce.net',
  ranges: [
    { value: 7, label: '7天' },
    { value: 30, label: '30天' },
    { value: 0, label: '全部' },
  ] as const,
}

/**
 * 评论系统（Twikoo）。
 * 后端是自己部署的 Cloudflare Worker（见 worker-twikoo/）
 */
export const twikoo = {
  envId: 'https://twikoo.junce.net',
  /**
   * twikoo CDN
   */
  script: 'https://cdn.jsdelivr.net/npm/twikoo@2.0.9/dist/twikoo.min.js',
}

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

/**
 * 没写 `cover` 的文章的兜底封面池。留空 = 保持无图（现状）。
 */
export const coverList: string[] = [
  // '/covers/01.jpg',
  'https://picx.zhimg.com/80/v2-04d20f2aeea936645af4d0362cbfa2d1_720w.webp',
  'https://pic2.zhimg.com/80/v2-246228cab24e5f733bb29232b12ce0c5_720w.webp',
  'https://pic2.zhimg.com/80/v2-587274da88e32dfa987cd155a2357c2b_720w.webp',
  'https://pic2.zhimg.com/80/v2-1715d7cc73a1a7374f835b034701b499_720w.webp',
  'https://pic4.zhimg.com/80/v2-76ec95192e6dbd948df75ca95489cf15_720w.webp',
  'https://pic2.zhimg.com/80/v2-8c2319971a0521c19ac86cb04efd0f8d_720w.webp',
  'https://pic2.zhimg.com/80/v2-3a275eb265ef97c4e3b426ee2fa32269_720w.webp',
  'https://pic2.zhimg.com/80/v2-c1ca7b53c6e4499d81845580c242754d_720w.webp',
  'https://picx.zhimg.com/80/v2-18922d38b97a58aff28cf1b9f80826f7_720w.webp',
  'https://pic3.zhimg.com/80/v2-3a3b9963a42ce58d33399808a96d0a30_720w.webp',
  'https://pic3.zhimg.com/80/v2-84273dc465d3577c8b17e16569fea24e_720w.webp',
  'https://picx.zhimg.com/80/v2-d7de153c23bd02fb7a3f75e13903df37_720w.webp',
  'https://pic3.zhimg.com/80/v2-79cc2941c91b95b05d91137db1b425ba_720w.webp',
  'https://pic3.zhimg.com/80/v2-042b2d94a78f9d7a8381da12f2645c5c_720w.webp',
  'https://pic1.zhimg.com/80/v2-1f0dff4433b99247f4f2f2b459b6c7b6_720w.webp',
  'https://pic2.zhimg.com/80/v2-aa73d861cb6dff878a2922701933a045_720w.webp',
  'https://pica.zhimg.com/80/v2-df106f56f2e9af8d1e62fcbfbfff8812_720w.webp',
  'https://pic2.zhimg.com/80/v2-787a0143f192c923f063a5ea24bc9cb5_720w.webp',
  'https://pic1.zhimg.com/80/v2-466afdbca898f5ada052dc829cb7ebc4_720w.webp',
  'https://pic4.zhimg.com/80/v2-450f700612642ce65cfbc4e54ee949b9_720w.webp',
  'https://pic3.zhimg.com/80/v2-811d21b1032f15c59c17b57d30e273c8_720w.webp',
  'https://pic4.zhimg.com/80/v2-fc9561813e195afe00158a38693ebb63_720w.webp',
  'https://pica.zhimg.com/80/v2-d480d92cad554b415dbee15eaf935476_720w.webp',
  'https://pic4.zhimg.com/80/v2-983df4f09f8d6cbfd081306730fa7061_720w.webp',
  'https://pica.zhimg.com/80/v2-1334fc39308541820c38a423f89421d8_720w.webp',
  'https://pic3.zhimg.com/80/v2-07da50ecb2f93586c1b5925d8e7f5cfc_720w.webp',
  'https://picx.zhimg.com/80/v2-029fc3ce7fddbf94c1f63091b6a89cbd_720w.webp',
  'https://picx.zhimg.com/80/v2-e4f2fb6d8af2c33e00b715cd727cb177_720w.webp',
  'https://pic1.zhimg.com/80/v2-0598de5c9f6e4416e7e9b67365c4961a_720w.webp',
  'https://pic1.zhimg.com/80/v2-35d3df386521289f0c36eeafced04f8c_720w.webp',
  'https://pic2.zhimg.com/80/v2-4508f3979d270d0b848d82a6d9dce48b_720w.webp',
  'https://pic3.zhimg.com/80/v2-d329b74d8841b651d35be796add841d0_720w.webp',
  'https://pic1.zhimg.com/80/v2-ffa8af32e24246066ed0bc62e59e18b2_720w.webp',
  'https://pic2.zhimg.com/80/v2-9c6349cdfaa3e4b85f682d46bc5b041f_720w.webp',
  'https://pic2.zhimg.com/80/v2-c2950f57a354ee56f01ae5dcf89b988d_720w.webp',
  'https://pic2.zhimg.com/80/v2-39720d1de6efa49a55d625b106ca4e3f_720w.webp',
  'https://pic1.zhimg.com/80/v2-32fe53fccf1111ba2e5fd887dab62754_720w.webp',
  'https://pic2.zhimg.com/80/v2-e9c7bbf79d49aa9b585abdc61bda7731_720w.webp',
  'https://pic3.zhimg.com/80/v2-a41008d2f05e55e6952e53c2f3ddcce2_720w.webp',
  'https://pic2.zhimg.com/80/v2-dabe90d359de834fef0d68ad7a8762a9_720w.webp',
  'https://pica.zhimg.com/80/v2-89e6a281e7bd01a8c6ecf0d486a8530c_720w.webp',
  'https://pica.zhimg.com/80/v2-7fcff707d73ecd4d51ebaee94d9d2046_720w.webp',
  'https://pic1.zhimg.com/80/v2-b5d64b36b53924f77e8fa657328c81c0_720w.webp',
  'https://picx.zhimg.com/80/v2-c60a1691b4e0de757db2a8fd9188dd91_720w.webp',
  'https://pic4.zhimg.com/80/v2-14b021f349d81810c4fbda801022cba1_720w.webp',
  'https://pic4.zhimg.com/80/v2-fe9d16a13b41c09be0f9342965e9635d_720w.webp',
  'https://pica.zhimg.com/80/v2-276bef7cb6a8c35fc54ab5c367a49018_720w.webp',
  'https://pica.zhimg.com/80/v2-cba4b5b716204d15908a4ed231b88432_720w.webp',
  'https://picx.zhimg.com/80/v2-b20ac0da10a9682e3c8c3bd6f30352eb_720w.webp',
  'https://pic2.zhimg.com/80/v2-51a7689293e592646e7e1d26c33d198f_720w.webp',
  'https://pic1.zhimg.com/80/v2-78ead9af080fbb19092ff3696a8f677a_720w.webp',
  'https://pic1.zhimg.com/80/v2-6104ccd585e4c1dd80cbbca885120fd0_720w.webp',
  'https://pic3.zhimg.com/80/v2-6dc0173ce6c9569f2212cb6519b08b94_720w.webp',
  'https://pica.zhimg.com/80/v2-1c16aefc897ccef17e9792c3f4981eaa_720w.webp',
  'https://pic1.zhimg.com/80/v2-a06fb423efe2a3510382489c6a17aba4_720w.webp',
  'https://pic4.zhimg.com/80/v2-125a319b2d8fecbb674ba0ee52f95c4f_720w.webp',
  'https://pic2.zhimg.com/80/v2-590ca0e414b7c910649665b8f838ef4b_720w.webp',
]
