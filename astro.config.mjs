import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/postcss";
import { setMaxListeners } from "node:events";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import katex from "katex";
import "katex/dist/contrib/mhchem.mjs"; // 加载 mhchem 扩展
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkMath from "remark-math";
import rehypeCallouts from "rehype-callouts";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig, siteConfig } from "./src/config";
import { pluginLanguageBadge } from "expressive-code-language-badge"; /* Language Badge */
import { pluginCollapsible } from "expressive-code-collapsible"; /* Collapsible */
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { rehypeMermaid } from "./src/plugins/rehype-mermaid.mjs";
import { rehypePlantuml } from "./src/plugins/rehype-plantuml.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";
import { remarkPlantuml } from "./src/plugins/remark-plantuml.js";
import { remarkLangNormalize } from "./src/plugins/remark-lang-normalize.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import mdx from "@astrojs/mdx";
import rehypeEmailProtection from "./src/plugins/rehype-email-protection.mjs";
import rehypeExternalLinks from "./src/plugins/rehype-external-links.mjs";
import rehypeFigure from "./src/plugins/rehype-figure.mjs";
import { remarkImageGrid } from "./src/plugins/remark-image-grid.js";
import { plantumlConfig } from "./src/config";
import { clickToSource } from "astro-click-to-source";

if (process.env.NODE_ENV === "development") {
    setMaxListeners(20);
}

// https://astro.build/config
export default defineConfig({
    site: siteConfig.site_url,

    base: "/",
    trailingSlash: "always",

    // 图像优化配置
    image: {
        // 全局响应式布局
        layout: "constrained",
    },

    experimental: {
        // Rust 编译器以提升构建性能（实验性），部分平台可能会导致构建失败，可以根据需要启用或禁用
        // 已启用：@astrojs/compiler-rs 已在依赖中，可显著加快 .astro 编译；若某平台 CI 构建报错再回退为 false
        rustCompiler: true,
        // 队列渲染以优化性能（实验性）
        queuedRendering: { enabled: true },
    },

    integrations: [
        clickToSource(),
        swup({
            theme: false,
            animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
            // the default value `transition-` cause transition delay
            // when the Tailwind class `transition-all` is used
            containers: [
                "#banner-overlay-container",
                "#banner-dim-container",
                "#swup-container",
                "#left-sidebar-dynamic",
                "#right-sidebar-dynamic",
                "#floating-toc-wrapper",
            ],
            smoothScrolling: false,
            cache: true,
            preload: true,
            accessibility: true,
            updateHead: true,
            updateBodyClass: false,
            globalInstance: true,
            // 滚动相关配置优化
            resolveUrl: (url) => url,
            animateHistoryBrowsing: false,
            skipPopStateHandling: (event) => {
                // 跳过锚点链接的处理，让浏览器原生处理
                return event.state?.url?.includes("#");
            },
        }),
        icon({
            include: {
                "material-symbols": ["*"],
                "fa7-brands": ["*"],
                "fa7-regular": ["*"],
                "fa7-solid": ["*"],
                "simple-icons": ["*"],
                mdi: ["*"],
                mingcute: ["*"],
            },
        }),
        expressiveCode({
            themes: [
                expressiveCodeConfig.darkTheme,
                expressiveCodeConfig.lightTheme,
            ],
            useDarkModeMediaQuery: false,
            themeCssSelector: (theme) => `[data-theme='${theme.name}']`,
            plugins: [
                // pluginLanguageBadge 配置 - 从expressiveCodeConfig读取设置
                ...(expressiveCodeConfig.pluginLanguageBadge?.enable === true
                    ? [pluginLanguageBadge()]
                    : []),
                pluginCollapsibleSections(),
                pluginLineNumbers(),
                // pluginCollapsible 配置 - 从expressiveCodeConfig读取设置，使用中文文本
                ...(expressiveCodeConfig.pluginCollapsible?.enable === true
                    ? [
                          pluginCollapsible({
                              lineThreshold:
                                  expressiveCodeConfig.pluginCollapsible
                                      .lineThreshold || 15,
                              previewLines:
                                  expressiveCodeConfig.pluginCollapsible
                                      .previewLines || 8,
                              defaultCollapsed:
                                  expressiveCodeConfig.pluginCollapsible
                                      .defaultCollapsed ?? true,
                              expandButtonText: "展开",
                              collapseButtonText: "收起",
                              expandedAnnouncement: "代码块已展开",
                              collapsedAnnouncement: "代码块已折叠",
                          }),
                      ]
                    : []),
            ],
            defaultProps: {
                wrap: false,
                overridesByLang: {
                    shellsession: {
                        showLineNumbers: false,
                    },
                },
            },
            styleOverrides: {
                borderRadius: "0.75rem",
                codeFontSize: "0.875rem",
                codeFontFamily:
                    "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                codeLineHeight: "1.5rem",
                frames: {},
                textMarkers: {
                    delHue: 0,
                    insHue: 180,
                    markHue: 250,
                },
                languageBadge: {
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    borderRadius: "0.25rem",
                    opacity: "1",
                    borderWidth: "0px",
                    borderColor: "transparent",
                },
            },
            frames: {
                showCopyToClipboardButton: true,
            },
        }),
        svelte(),
        sitemap({
            filter: (page) => {
                // 根据页面开关配置过滤sitemap
                const url = new URL(page);
                const pathname = url.pathname;

                if (pathname === "/friends/" && !siteConfig.pages.friends) {
                    return false;
                }
                if (pathname === "/sponsor/" && !siteConfig.pages.sponsor) {
                    return false;
                }
                if (pathname === "/guestbook/" && !siteConfig.pages.guestbook) {
                    return false;
                }
                if (pathname === "/bangumi/" && !siteConfig.pages.bangumi) {
                    return false;
                }
                if (pathname === "/gallery/" && !siteConfig.pages.gallery) {
                    return false;
                }

                return true;
            },
        }),
        mdx(),
    ],
    markdown: {
        // 使用 Astro 原生声明式配置替代手动 unified() processor。
        // 这样 Astro 才能对每篇 Markdown 启用 Content Layer 缓存与单文件增量编译，
        // 显著加快 dev 下的 HMR 与 build 的全量构建。
        remarkPlugins: [
            remarkLangNormalize,
            remarkMath,
            remarkReadingTime,
            remarkImageGrid,
            remarkExcerpt,
            remarkDirective,
            remarkSectionize,
            parseDirectiveNode,
            remarkMermaid,
            [remarkPlantuml, plantumlConfig],
        ],
        rehypePlugins: [
            // KaTeX 构建期渲染加速：
            //   output: "html"   仅输出 HTML，不再额外生成 MathML，公式 DOM 体积与生成时间约减半
            //   strict: false    关闭严格模式，跳过大量告警检查
            //   throwOnError: false  公式出错时不中断构建
            // 注：output:"html" 会牺牲部分屏幕阅读器无障碍能力，如需 MathML 可移除该项
            [
                rehypeKatex,
                {
                    katex,
                    output: "html",
                    strict: false,
                    throwOnError: false,
                },
            ],
            [rehypeCallouts, { theme: siteConfig.rehypeCallouts.theme }],
            rehypeSlug,
            rehypeMermaid,
            rehypePlantuml,
            rehypeFigure,
            [rehypeExternalLinks, { siteUrl: siteConfig.site_url }],
            [rehypeEmailProtection, { method: "base64" }], // 邮箱保护插件，支持 'base64' 或 'rot13'
            [
                rehypeComponents,
                {
                    components: {
                        github: GithubCardComponent,
                    },
                },
            ],
            [
                rehypeAutolinkHeadings,
                {
                    behavior: "append",
                    properties: {
                        className: ["anchor"],
                    },
                    content: {
                        type: "element",
                        tagName: "span",
                        properties: {
                            className: ["anchor-icon"],
                            "data-pagefind-ignore": true,
                        },
                        children: [
                            {
                                type: "text",
                                value: "#",
                            },
                        ],
                    },
                },
            ],
        ],
    },
    vite: {
        css: {
            postcss: {
                plugins: [tailwindcss()],
            },
        },
        server: {
            watch: {
                // 扩大忽略范围，减少 chokidar 监听压力，加快 dev 冷启动与 HMR
                ignored: [
                    "**/package/**",
                    "**/Firefly-docs/**",
                    "**/dist/**",
                    "**/.astro/**",
                    "**/node_modules/**",
                ],
            },
        },
        resolve: {
            alias: {
                "@rehype-callouts-theme": `rehype-callouts/theme/${siteConfig.rehypeCallouts.theme}`,
            },
        },
        build: {
            minify: "esbuild",
            esbuildOptions: {
                minify: true,
                // 移除 console.log 和 debugger
                drop: ["console", "debugger"],
            },
            rollupOptions: {
                onwarn(warning, warn) {
                    // temporarily suppress this warning
                    if (
                        warning.message.includes(
                            "is dynamically imported by",
                        ) &&
                        warning.message.includes(
                            "but also statically imported by",
                        )
                    ) {
                        return;
                    }
                    warn(warning);
                },
            },
            // CSS 优化
            cssCodeSplit: true,
            cssMinify: "esbuild",
            assetsInlineLimit: 4096,
        },
    },
});
