import { scheduleContentOverflowEnhancements } from "@/scripts/contentOverflow";

/**
 * content:replace 时重新处理内容溢出（Katex + table 横向滚动包裹）
 * 同时监听 astro:page-load 和 password:decrypted 事件
 */
export function registerContentOverflow() {
	window.swup.hooks.on("content:replace", () => {
		// 只处理katex元素的容器，使用浏览器原生滚动条
		scheduleContentOverflowEnhancements();
	});
}

/**
 * 注册全局事件监听（非 swup 事件）
 */
export function registerContentOverflowGlobalListeners() {
	document.addEventListener(
		"astro:page-load",
		scheduleContentOverflowEnhancements,
	);
	document.addEventListener("password:decrypted", () => {
		setTimeout(scheduleContentOverflowEnhancements, 200);
	});
}
