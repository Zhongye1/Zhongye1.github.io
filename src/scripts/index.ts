/**
 * 运行时脚本入口
 * Layout.astro 通过 <script>import "@/scripts"</script> 引入
 */

import { scheduleContentOverflowEnhancements } from "@/scripts/contentOverflow";
import { initImageLoadFadeIn } from "@/scripts/imageLoadFadeIn";
import { initOutsideClickPanels } from "@/scripts/outsideClick";
import { initResizeHandler, initScroll } from "@/scripts/scroll";
import { setupSwup } from "@/scripts/swup";
import { showBanner } from "@/scripts/swup/hooks/bannerSync";
import { registerContentOverflowGlobalListeners } from "@/scripts/swup/hooks/contentOverflow";
import { updateMainGridCols } from "@/scripts/swup/hooks/mainGridLayout";
import { updateSidebarComponentsVisibility } from "@/scripts/swup/hooks/sidebarVisibility";
import { initIconLoader } from "@/utils/icon-loader";
import { initThemeListener, initWallpaperMode } from "@/utils/setting-utils";

// ── Swup 初始化 ────────────────────────────────────────────
if (window?.swup?.hooks) {
	setupSwup();
} else {
	document.addEventListener("swup:enable", setupSwup);
}

// ── 滚动处理 ───────────────────────────────────────────────
initScroll();
initResizeHandler();

// ── 面板点击外部关闭 ───────────────────────────────────────
initOutsideClickPanels();

// ── LQIP 淡入 ──────────────────────────────────────────────
initImageLoadFadeIn();
document.addEventListener("astro:page-load", initImageLoadFadeIn);
document.addEventListener("swup:contentReplaced", () => {
	requestAnimationFrame(initImageLoadFadeIn);
});

// ── 内容溢出增强 ───────────────────────────────────────────
registerContentOverflowGlobalListeners();

// ── 初始页面加载 ───────────────────────────────────────────
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		showBanner();
		scheduleContentOverflowEnhancements();
		updateMainGridCols();
		updateSidebarComponentsVisibility();
		initWallpaperMode();
		initThemeListener();
		initIconLoader();
	});
} else {
	showBanner();
	scheduleContentOverflowEnhancements();
	updateMainGridCols();
	updateSidebarComponentsVisibility();
	initWallpaperMode();
	initThemeListener();
	initIconLoader();
}
