/**
 * abbrlink 短链工具
 *
 * 思路参考 Hexo 的 hexo-abbrlink：给每篇文章生成一个稳定的短码，
 * 一旦生成便不随标题 / 日期变化。这里用 crc32 对文章的 id（相对文件路径）
 * 做哈希并输出十六进制，保证同一篇文章每次构建结果一致。
 *
 * 优先级：frontmatter 中手写的 abbrlink > 用 id 计算的哈希兜底。
 */

import { removeFileExtension } from "@utils/url-utils";

/**
 * 标准 crc32（多项式 0xEDB88320），返回无符号 32 位整数
 */
function crc32(str: string): number {
	let crc = 0xffffffff;
	for (let i = 0; i < str.length; i++) {
		crc ^= str.charCodeAt(i);
		for (let j = 0; j < 8; j++) {
			crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}

type AbbrlinkEntryLike = {
	id: string;
	data: { abbrlink?: string };
};

/**
 * 获取一篇文章的 abbrlink 短码
 * - 若 frontmatter 写了 abbrlink，直接用（去掉首尾空白）
 * - 否则用去扩展名的 id 做 crc32 哈希，输出 8 位十六进制
 */
export function getAbbrlink(entry: AbbrlinkEntryLike): string {
	const manual = entry.data.abbrlink?.trim();
	if (manual) return manual;
	// 用去扩展名后的 id 计算，避免 .md/.mdx 差异影响哈希
	return crc32(removeFileExtension(entry.id)).toString(16);
}

/**
 * 短链的站内路径（不含域名），例如 /p/a1b2c3d4/
 * 注意：这里刻意不套 BASE_URL，交由调用方用 new URL(..., Astro.site) 组装成绝对地址，
 * 以便生成用于分享 / canonical 的完整 URL。
 */
export function getAbbrlinkPath(entry: AbbrlinkEntryLike): string {
	return `/p/${getAbbrlink(entry)}/`;
}
