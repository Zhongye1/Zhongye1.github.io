import { expressiveCodeConfig, siteConfig } from "@/config";

/**
 * page:view 时同步主题状态 - 解决从首页进入文章页面时代码块渲染问题
 */
export function registerThemeSync() {
	window.swup.hooks.on("page:view", () => {
		// 同步主题状态
		const storedTheme =
			localStorage.getItem("theme") ||
			siteConfig.themeColor.defaultMode ||
			"light";
		let isDark = false;

		// 处理 system 模式
		if (storedTheme === "system") {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		} else {
			isDark = storedTheme === "dark";
		}

		const expectedTheme = isDark
			? expressiveCodeConfig.darkTheme
			: expressiveCodeConfig.lightTheme;
		const currentTheme = document.documentElement.getAttribute("data-theme");

		// 如果主题不匹配，静默更新（不触发事件，避免重新加载效果）
		if (currentTheme !== expectedTheme) {
			document.documentElement.setAttribute("data-theme", expectedTheme);
		}
	});
}
