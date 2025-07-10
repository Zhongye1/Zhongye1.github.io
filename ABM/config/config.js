var config = {
    /* 基础信息配置 */
    name: "钟晔",
    sex: "男",
    age: "19",
    phone: "13902988446",
    email: "2760913192@qq.com",
    address: "广州大学",
    qq: "2760913192",
    log: "Zhongye",
    expect_work: "前端开发工程师（React/Vue方向）",

    /* 首页座右铭 */
    motto: [
        "构建用户友好的数字体验",
        "代码是思想的具象化",
        "持续探索前端工程化实践",
        "Where We Go When We Fade...",
        "in GZHU | 数据科学与大数据技术"
    ],

    /* 欢迎语 */
    welcome: "广州大学 · 数据科学与大数据技术<br>" +
             "Python/Flask/SQL<br>" +
             "开源社区贡献者 | 技术博客作者<br>" +
             "很高兴认识你！",

    /* 关于我 */
    about: "<p>广州大学数据科学与大数据技术专业本科在读，专注前端技术栈开发。</p>" +
        "<p>具备全栈项目开发经验，擅长通过技术解决实际问题：</p>" +
        "<ul>" +
        "<li>独立开发<span class='highlight'>以太坊网络监控系统</span>前端架构（Vue3+TS）</li>" +
        "<li>参与<span class='highlight'>校园自服务平台</span>微服务容器化部署（Docker）</li>" +
        "<li>日均120+访问量的技术博客作者，持续输出前端工程化实践</li>" +
        "</ul>" +
        "<p>追求代码质量与用户体验的平衡，期待参与企业级项目开发！</p>",

    /* 技能展示 */
    skills: [
        ["Vue3", 85, "#42b983"],
        ["TypeScript", 80, "#3178c6"],
        ["Python", 75, "#61dafb"]
    ],

    /* 技能描述 */
    skills_description: "<p>前端工程化深度实践者：</p>" +
        "<ul>" +
        "<li>工程化：Webpack/Vite配置优化 | Monorepo实践 | CI/CD流水线</li>" +
        "<li>性能优化：首屏加载速度优化65% | 接口响应＜200ms | 内存泄漏排查</li>" +
        "<li>架构能力：微服务容器化部署 | RESTful API设计 | 高并发系统设计</li>" +
        "</ul>",

    /* 项目作品 */
    portfolio: [
        ["https://pic1.zhimg.com/v2-d556c8e739d2a99c8964fd44439234ec_b.jpg", 
         "https://zhongye1.github.io/", 
         "技术博客", 
         "日均访问120+ | 分享前端工程化实践<br>包含Vue3源码解析/性能优化方案"],
        
        ["https://pic3.zhimg.com/80/v2-d9766956d5c85c2780e4c5008fd946ca_1440w.jpg", 
         "https://github.com/Guangzhou-University-SITE-193", 
         "校园自服务平台", 
         "微服务容器化部署 | 前端组件复用率提升40%<br>团队协作开发中"],
        
        ["https://pic1.zhimg.com/v2-2cb5cfe396619a8a227cef27aba87954_r.jpg", 
         "https://github.com/ht1220/eth-neighbor-monitoring", 
         "以太坊网络监控系统", 
         "Vue3+TS+Neo4j | 实时拓扑分析<br>广州大学课题组"]
    ],

    /* 项目经历 */
    work: [
        ["2023.10 - 至今", "校园自服务平台 · 前端核心开发",
            "<p><strong>技术栈：Vue3 + TypeScript + Docker</strong></p>" +
            "<ul>" +
            "<li>实现微服务<span class='highlight'>100%容器化部署</span>，优化CI/CD流程</li>" +
            "<li>开发通用表单组件库，提升团队<span class='highlight'>开发效率40%</span></li>" +
            "<li>通过动态路由+异步加载方案，<span class='highlight'>首屏速度提升65%</span></li>" +
            "</ul>"
        ],

        ["2023.03 - 2023.08", "以太坊拓扑监控系统 · 全栈开发",
            "<p><strong>技术栈：Python(FastAPI) + Vue3 + Neo4j</strong></p>" +
            "<ul>" +
            "<li>设计实时拓扑分析API，支持<span class='highlight'>800+请求/秒</span>高并发</li>" +
            "<li>开发Neo4j可视化引擎，<span class='highlight'>节点关系分析延迟＜200ms</span></li>" +
            "<li>获校级课题<span class='highlight'>优秀结项</span>，GitHub开源项目</li>" +
            "</ul>"
        ]
    ],

    /* 其他经历 */
    others: [
        ["2024.05", "腾讯犀牛鸟开源计划", "申请腾讯文档开发方向：聚焦CRDT算法/开放平台开发"],
        ["2024.03", "前端性能优化研究", "发表博客《首屏加载的12个优化策略[](@replace=10001)》获社区推荐"],
        ["2023.12", "软考中级证书", "数据库系统工程师 | 掌握数据库设计与优化"]
    ],


    /**
     * 在这里填写您的社交网络平台
     * ["img", "url", "desc"]
     * img是社交平台的图标，在./svg目录下我们已经准备好了 微博、简书、掘金、小红书、知乎、csdn、facebook、github、力扣、CF和qq的图标
     * url是您链接
     * desc是一段描述，将鼠标移入将会显示该描述
     * 建议您放置数量 <= 5
     */
    icon: [
        // ["./svg/LeetCode.svg", "https://leetcode-cn.com/u/happysnaker/", "我的力扣主页"],
        ["./svg/github.svg", "https://github.com/zhongye1", "我的GitHub主页"],
        ["./svg/博客.svg", "https://zhongye1.github.io/", "我的个人博客"],
        //["./svg/掘金.svg", "https://juejin.cn/user/3853167638625000", "我的掘金主页"],
        //["./svg/知乎.svg", "https://www.zhihu.com/people/tian-xia-you-dao-81", "我的知乎主页"]
    ],


    //这是一些图片链接，建议您仅更改第二个头像图片
    url: [
        //背景图、头像、作品展示背景、其他经历背景
        "./images/intro-bg.jpg",
        "https://avatars.githubusercontent.com/u/145737758?v=4",//"./images/2.jpg",
        "./images/work-bk.png",
        "./images/4.jpg"
    ]

}
