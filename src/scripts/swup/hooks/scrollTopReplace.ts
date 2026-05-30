import { pathsEqual, url } from "@/utils/url-utils";

/**
 * 全屏壁纸模式：替换 swup 默认的回顶行为
 * 首页回顶部，其他页滚动到 #main-grid（与 ScrollDownIndicator 行为一致）
 */
export function registerScrollTopReplace() {
	window.swup.hooks.replace(
		"scroll:top",
		(
			visit: { to: { url: string } },
			args: { options: ScrollIntoViewOptions },
		) => {
			const wallpaperMode = document.documentElement.getAttribute(
				"data-wallpaper-mode",
			);
			if (
				wallpaperMode === "fullscreen" &&
				!pathsEqual(visit.to.url, url("/"))
			) {
				const mainGrid = document.getElementById("main-grid");
				if (mainGrid) {
					mainGrid.scrollIntoView({
						behavior: args.options?.behavior || "auto",
					});
					return true;
				}
			}
			window.scrollTo({ top: 0, left: 0, ...args.options });
			return true;
		},
	);
}
