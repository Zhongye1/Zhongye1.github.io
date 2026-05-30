/**
 * content:replace 时重新初始化 TOC 组件
 */
export function registerTocReinit() {
	window.swup.hooks.on("content:replace", () => {
		// 检查当前页面是否为文章页面（有TOC元素）
		const tocWrapper = document.getElementById("toc-wrapper");
		const isArticlePage = tocWrapper !== null;

		// 只在文章页面重新初始化桌面端 TOC 组件
		if (isArticlePage) {
			const tocElement = document.querySelector("table-of-contents");
			if (tocElement && typeof (tocElement as any).init === "function") {
				setTimeout(() => {
					(tocElement as any).init();
				}, 100);
			}
		}
	});
}
