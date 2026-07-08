import type { FriendLink, FriendsPageConfig } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
    // 页面标题，如果留空则使用默认翻译
    title: "",

    // 页面描述文本，如果留空则使用默认翻译
    description: "",

    // 是否显示底部自定义内容（friends.mdx 中的内容）
    showCustomContent: true,

    // 是否显示评论区，需要先在commentConfig.ts启用评论系统
    showComment: true,

    // 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
    randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
    {
        title: "夏夜流萤",
        imgurl: "https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
        desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
        siteurl: "https://blog.cuteleaf.cn",
        tags: ["Blog"],
        weight: 5, // 权重，数字越大排序越靠前
        enabled: true, // 是否启用
    },
    {
        title: "Astro",
        imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
        desc: "The web framework for content-driven websites. ⭐️ Star to support our work!",
        siteurl: "https://github.com/withastro/astro",
        tags: ["Framework"],
        weight: 5,
        enabled: true,
    },
    {
        title: "situ2001",
        imgurl: "https://situ2001.com/avatar.webp",
        desc: "situ2001",
        siteurl: "https://situ2001.com",
        tags: ["Blog"],
        weight: 8,
        enabled: true,
    },
    {
        title: "柊野",
        imgurl: "https://avatars.githubusercontent.com/u/145737758?s=400&u=a77ba5dbc8f7c9fd54fe608100908cc6fddaee74&v=4",
        desc: "个人网站",
        siteurl: "https://zhongye1.github.io",
        tags: ["Blog"],
        weight: 6,
        enabled: true,
    },
    {
        title: "Fomalhaut",
        imgurl: "https://source.fomal.cc/siteshot/www.fomal.cn.jpg",
        desc: "Fomalhaut🥝",
        siteurl: "https://www.fomal.cc/",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "Eureka的小屋",
        imgurl: "https://avatars.githubusercontent.com/u/146005705?v=4",
        desc: "水波",
        siteurl: "https://eureka1029.github.io/",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "miomoe",
        imgurl: "https://q1.qlogo.cn/g?b=qq&nk=1778273540&s=100",
        desc: "鼠子",
        siteurl: "https://blog.miomoe.cn",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "Carry",
        imgurl: "https://pica.zhimg.com/80/v2-18f519ce25edd6a6a98e967654809334_720w.webp",
        desc: "carry",
        siteurl: "https://blog.carry.fit/",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "doraemon",
        imgurl: "https://doraemonblogs.github.io/img/favicon.jpg",
        desc: "doraemonblogs",
        siteurl: "https://doraemonblogs.github.io/",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "宇宇",
        imgurl: "https://free-img.400040.xyz/4/2024/08/31/66d3280d0c83b.jpg",
        desc: "yuyu",
        siteurl: "https://pic.yuyu.red/",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "GZHU-193",
        imgurl: "https://pic1.zhimg.com/80/v2-593dd0a3b84d023b3827b97e81e0242a_720w.webp",
        desc: "GZHU-193工作室",
        siteurl: "https://guangzhou-university-site-193.github.io/GZHU-SITE/",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "時雨てる",
        imgurl: "https://avatars.githubusercontent.com/u/59642397?v=4",
        desc: "時雨てる的博客站",
        siteurl: "https://keqing.moe/",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "雷顿",
        imgurl: "https://file.houman.top/leidun.png",
        desc: "他睡觉时真的不打雷",
        siteurl: "https://blog.houman.top",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
    {
        title: "Shawn's blog",
        imgurl: "https://b2.chix.pp.ua/icon.jpg",
        desc: "Be happy and smile :)",
        siteurl: "https://link.chichi.qzz.io/blog",
        tags: ["Blog"],
        weight: 5,
        enabled: true,
    },
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
    const friends = friendsConfig.filter((friend) => friend.enabled);

    if (friendsPageConfig.randomizeSort) {
        return friends.sort(() => Math.random() - 0.5);
    }

    return friends.sort((a, b) => b.weight - a.weight);
};
