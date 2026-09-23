/**
 * 友链数据。想加谁就往 `friends` 里加一条，卡片会自动排进 `/friends` 的网格。
 *
 * 字段：
 *  - title    站点名，卡片标题
 *  - imgurl   头像 / Logo 直链。务必 `https://`，站点走 HTTPS，http 图会被浏览器当混合内容拦掉
 *  - desc     一句话介绍
 *  - siteurl  站点地址，整张卡片可点
 *  - tags     标签，渲染成卡片右上角的小标签
 *  - weight   权重，数字越大排得越靠前（同权重按 title 排）
 *  - enabled  是否在页面上展示；置 false 只从网格里拿掉，配置留着方便回头再开
 */

export interface FriendLink {
  title: string
  imgurl: string
  desc: string
  siteurl: string
  tags: string[]
  /** 权重，数字越大排序越靠前 */
  weight: number
  /** 是否启用 */
  enabled: boolean
}

/** 本站信息：申请友链时对方需要复制的那几项，改这里就等于改全站 */
export const mySite = {
  name: 'Zhongye',
  desc: '登高峰乃见云平',
  url: 'https://blog.junce.net',
  avatar:
    'https://avatars.githubusercontent.com/u/145737758?s=400&u=a77ba5dbc8f7c9fd54fe608100908cc6fddaee74&v=4',
  email: '2760913192@qq.com',
}

/**
 * 友链列表。`enabled: false` 的条目不进网格，配置留在原地方便回头再开；
 * 留空时页面会显示一句「虚位以待」，不会报错。
 */
export const friends: FriendLink[] = [
  {
    title: '夏夜流萤',
    imgurl:
      'https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640',
    desc: '飞萤之火自无梦的长夜亮起，绽放在终竟的明天。',
    siteurl: 'https://blog.cuteleaf.cn',
    tags: ['Blog'],
    weight: 5, // 权重，数字越大排序越靠前
    enabled: true, // 是否启用
  },
  {
    title: 'Astro',
    imgurl: 'https://avatars.githubusercontent.com/u/44914786?v=4&s=640',
    desc: 'The web framework for content-driven websites. ⭐️ Star to support our work!',
    siteurl: 'https://github.com/withastro/astro',
    tags: ['Framework'],
    weight: 5,
    enabled: true,
  },
  {
    title: 'situ2001',
    imgurl: 'https://situ2001.com/avatar.webp',
    desc: 'situ2001',
    siteurl: 'https://situ2001.com',
    tags: ['Blog'],
    weight: 8,
    enabled: true,
  },
  {
    title: '柊野',
    imgurl:
      'https://avatars.githubusercontent.com/u/145737758?s=400&u=a77ba5dbc8f7c9fd54fe608100908cc6fddaee74&v=4',
    desc: '个人网站',
    siteurl: 'https://zhongye1.github.io',
    tags: ['Blog'],
    weight: 6,
    enabled: true,
  },
  {
    title: 'Fomalhaut',
    imgurl: 'https://source.fomal.cc/siteshot/www.fomal.cn.jpg',
    desc: 'Fomalhaut🥝',
    siteurl: 'https://www.fomal.cc/',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: 'Eureka的小屋',
    imgurl: 'https://avatars.githubusercontent.com/u/146005705?v=4',
    desc: '水波',
    siteurl: 'https://eureka1029.github.io/',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: 'March',
    imgurl: 'https://cdn.jsdelivr.net/gh/March030303/Picgo@main/img/3.jpg',
    desc: '保持临在，感受当下',
    siteurl: 'https://blog.march03.com',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: 'miomoe',
    imgurl: 'https://q1.qlogo.cn/g?b=qq&nk=1778273540&s=100',
    desc: '鼠子',
    siteurl: 'https://blog.miomoe.cn',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: 'Carry',
    imgurl: 'https://pica.zhimg.com/80/v2-18f519ce25edd6a6a98e967654809334_720w.webp',
    desc: 'carry',
    siteurl: 'https://blog.carry.fit/',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: 'doraemon',
    imgurl: 'https://doraemonblogs.github.io/img/favicon.jpg',
    desc: 'doraemonblogs',
    siteurl: 'https://doraemonblogs.github.io/',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: '宇宇',
    imgurl: 'https://free-img.400040.xyz/4/2024/08/31/66d3280d0c83b.jpg',
    desc: 'yuyu',
    siteurl: 'https://pic.yuyu.red/',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: 'GZHU-193',
    imgurl: 'https://pic1.zhimg.com/80/v2-593dd0a3b84d023b3827b97e81e0242a_720w.webp',
    desc: 'GZHU-193工作室',
    siteurl: 'https://guangzhou-university-site-193.github.io/GZHU-SITE/',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: '時雨てる',
    imgurl: 'https://avatars.githubusercontent.com/u/59642397?v=4',
    desc: '時雨てる的博客站',
    siteurl: 'https://keqing.moe/',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: '雷顿',
    imgurl: 'https://file.houman.top/leidun.png',
    desc: '他睡觉时真的不打雷',
    siteurl: 'https://blog.houman.top',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
  {
    title: "Shawn's blog",
    imgurl: 'https://b2.chix.pp.ua/icon.jpg',
    desc: 'Be happy and smile :)',
    siteurl: 'https://link.chichi.qzz.io/blog',
    tags: ['Blog'],
    weight: 5,
    enabled: true,
  },
]

/** 申请流程，按顺序渲染成编号步骤 */
export const applySteps = [
  {
    title: '先加上本站',
    content: '在你自己的友链页添加本站信息，左上角各字段都可以一键复制。',
  },
  {
    title: '再通知我',
    content: `评论区留言，或发邮件到 ${mySite.email}，附上你的站点名称、链接、简介和头像直链。`,
  },
  {
    title: '等待审核',
    content: '确认站点能正常访问、内容合规后，就会出现在上面的网格里。',
  },
]
