import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * 预处理 Hexo 迁移文章的前置数据，兼容旧格式字段名
 */
function normalizeHexoFrontmatter(raw: Record<string, unknown>) {
	// 删除 Hexo 的 layout 字段 —— Astro 会把它当组件路径 import，导致 Vite 报错
	delete raw.layout;

	// date → published（Hexo 的日期字段）
	if (raw.date && !raw.published) {
		raw.published = raw.date;
	}

	// 兜底：既无 date 也无 published 时，用最旧日期
	if (!raw.published) {
		raw.published = new Date(0);
	}

	// cover → image（Hexo 的封面字段）
	if (raw.cover && !raw.image) {
		raw.image = raw.cover;
	}

	// categories（复数/数组）→ category（单数/字符串）
	if (!raw.category && raw.categories) {
		if (Array.isArray(raw.categories) && raw.categories.length > 0) {
			raw.category = raw.categories[0];
		} else if (typeof raw.categories === "string") {
			raw.category = raw.categories;
		}
	}

	// tags 清洗：null/空值转空数组，字符串转数组，过滤 null 值，对象转字符串
	if (raw.tags == null || raw.tags === "") {
		raw.tags = [];
	}
	if (typeof raw.tags === "string") {
		raw.tags = [raw.tags];
	}
	if (Array.isArray(raw.tags)) {
		raw.tags = raw.tags
			.filter((t): t is NonNullable<typeof t> => t != null)
			.map((t) => {
				if (typeof t === "string") return t;
				if (typeof t === "object" && t !== null && "name" in t) {
					return String((t as { name: unknown }).name);
				}
				return String(t);
			});
	}

	return raw;
}

const postsCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: z.preprocess(
		normalizeHexoFrontmatter,
		z.object({
			title: z.string(),
			published: z.coerce.date(),
			updated: z.coerce.date().optional(),
			draft: z.boolean().optional().default(false),
			description: z.string().optional().default(""),
			image: z.string().optional().default(""),
			tags: z.array(z.string()).optional().default([]),
			category: z.string().optional().nullable().default(""),
			lang: z.string().optional().default(""),
			pinned: z.boolean().optional().default(false),
			author: z.string().optional().default(""),
			sourceLink: z.string().optional().default(""),
			licenseName: z.string().optional().default(""),
			licenseUrl: z.string().optional().default(""),
			comment: z.boolean().optional().default(true),
			password: z.string().optional().default(""),
			passwordHint: z.string().optional().default(""),

			/* For internal use */
			prevTitle: z.string().default(""),
			prevSlug: z.string().default(""),
			nextTitle: z.string().default(""),
			nextSlug: z.string().default(""),
		}),
	),
});

const specCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/spec" }),
	schema: z.object({}),
});

export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
