import * as fs from "node:fs";
import * as path from "node:path";
import { coverImageConfig } from "../config/coverImageConfig";
import { siteConfig } from "../config/siteConfig";
import type { ImageFormat } from "../types/config";

const { randomCoverImage } = coverImageConfig;

let cachedFallbackUrls: string[] | null = null;

/**
 * 从 public/gallery/mht-2024/urls.txt 读取兜底封面图 URL 列表
 */
function readFallbackCoverUrls(): string[] {
	if (cachedFallbackUrls) return cachedFallbackUrls;
	try {
		const filePath = path.join(
			process.cwd(),
			"public",
			"gallery",
			// "mht-2024",
			"ice_carrier",
			"urls.txt",
		);
		const content = fs.readFileSync(filePath, "utf-8");
		cachedFallbackUrls = content
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"));
		return cachedFallbackUrls;
	} catch {
		return [];
	}
}

/**
 * 根据seed生成确定性hash值
 */
function getSeedHash(seed?: string): number {
	return seed
		? Math.abs(
				seed.split("").reduce((acc, char) => {
					return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
				}, 0),
			)
		: 0;
}

/**
 * 为API URL添加seed参数，确保每篇文章获取不同图片
 */
function appendSeedParam(apiUrl: string, hash: number): string {
	if (hash === 0) return apiUrl;
	const separator = apiUrl.includes("?") ? "&" : "?";
	return `${apiUrl}${separator}v=${hash}`;
}

/**
 * 处理文章封面图
 * 当image字段为"api"时，返回第一个API的URL（客户端会按顺序尝试所有API）
 * 当image为空时，从兜底封面列表按seed确定性选取一张
 * @param image - 文章frontmatter中的image字段值
 * @param seed - 用于生成唯一URL的种子（文章id或slug）
 */
export function processCoverImageSync(
	image: string | undefined,
	seed?: string,
): string {
	if (image && image !== "") {
		if (image !== "api") return image;

		if (
			randomCoverImage.enable &&
			randomCoverImage.apis &&
			randomCoverImage.apis.length > 0
		) {
			const hash = getSeedHash(seed);
			return appendSeedParam(randomCoverImage.apis[0], hash);
		}
		return "";
	}

	// 文章未配封面时，从兜底列表按 seed 确定性选取
	if (seed) {
		const urls = readFallbackCoverUrls();
		if (urls.length > 0) {
			return urls[getSeedHash(seed) % urls.length];
		}
	}

	return "";
}

/**
 * 获取所有随机封面图API URL列表（带seed参数）
 * 用于客户端按顺序尝试，第一个成功即使用，全部失败则显示回退图片
 * 当image为空时，返回兜底封面列表（不含已选中的那张）
 * @param image - 文章frontmatter中的image字段值
 * @param seed - 用于生成唯一URL的种子（文章id或slug）
 */
export function getApiUrlList(
	image: string | undefined,
	seed?: string,
): string[] {
	if (image === "api" && randomCoverImage.enable && randomCoverImage.apis) {
		const hash = getSeedHash(seed);
		return randomCoverImage.apis.map((api) => appendSeedParam(api, hash));
	}

	// 兜底封面也提供fallback列表给客户端重试
	if (!image && seed) {
		const urls = readFallbackCoverUrls();
		if (urls.length > 1) {
			const primaryIdx = getSeedHash(seed) % urls.length;
			return urls.filter((_, i) => i !== primaryIdx);
		}
	}

	return [];
}

/**
 * 获取图片优化格式配置
 */
export function getImageFormats(): ImageFormat[] {
	const formatConfig = siteConfig.imageOptimization?.formats ?? "both";
	switch (formatConfig) {
		case "avif":
			return ["avif"];
		case "webp":
			return ["webp"];
		default:
			return ["avif", "webp"];
	}
}

/**
 * 获取图片优化质量配置
 */
export function getImageQuality(): number {
	return siteConfig.imageOptimization?.quality ?? 80;
}

/**
 * 获取图片回退格式
 */
export function getFallbackFormat(): "avif" | "webp" {
	const formatConfig = siteConfig.imageOptimization?.formats ?? "both";
	return formatConfig === "avif" ? "avif" : "webp";
}

/**
 * 检查是否需要为图片添加 referrerpolicy="no-referrer" 以解决防盗链 403 问题
 */
export function shouldAddNoReferrer(urlStr: string): boolean {
	if (!urlStr.startsWith("http")) return false;
	const domains = siteConfig.imageOptimization?.noReferrerDomains || [];
	if (domains.length === 0) return false;
	try {
		const hostname = new URL(urlStr).hostname;
		return domains.some((pattern) => {
			const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
			return new RegExp(`^${regexPattern}$`).test(hostname);
		});
	} catch {
		return false;
	}
}
