import { loadRenderers } from "astro:container";
import { render } from "astro:content";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { formatDateI18nWithTime } from "@utils/date-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";
import pkg from "../../package.json";

function stripInvalidXmlChars(str: string): string {
    return str.replace(
        // biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
        /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
        "",
    );
}

export async function GET(context: APIContext) {
    const blog = await getSortedPosts();
    const renderers = await loadRenderers([getMDXRenderer()]);
    const container = await AstroContainer.create({ renderers });
    const feedItems: RSSFeedItem[] = [];
    for (const post of blog) {
        if (post.data.password) {
            feedItems.push({
                title: post.data.title,
                pubDate: post.data.published,
                description: post.data.description || "",
                link: url(`/posts/${post.id}/`),
                content: "本文已加密保护，请访问网站查看。",
            });
            continue;
        }
        const { Content } = await render(post);
        const rawContent = await container.renderToString(Content);
        const cleanedContent = stripInvalidXmlChars(rawContent);
        feedItems.push({
            title: post.data.title,
            pubDate: post.data.published,
            description: post.data.description || "",
            link: url(`/posts/${post.id}/`),
            content: sanitizeHtml(cleanedContent, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
            }),
        });
    }
    return rss({
        title: siteConfig.title,
        description: siteConfig.subtitle || "No description",
        site: context.site ?? "https://zhongye1.github.io",
        customData: `<templateTheme>Firefly</templateTheme>
		<templateThemeVersion>${pkg.version}</templateThemeVersion>
		<templateThemeUrl>https://github.com/Zhongye1</templateThemeUrl>
		<lastBuildDate>${formatDateI18nWithTime(new Date())}</lastBuildDate>`,
        items: feedItems,
    });
}
