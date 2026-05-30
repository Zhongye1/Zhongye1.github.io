/**
 * Swup hooks 注册入口
 * 将所有独立的 hook 模块按顺序注册
 */

import { registerBannerSync } from "./hooks/bannerSync";
import { registerCommentTrigger } from "./hooks/commentTrigger";
import { registerContentOverflow } from "./hooks/contentOverflow";
import { registerLinkClickGuard } from "./hooks/linkClickGuard";
import { registerMainGridLayout } from "./hooks/mainGridLayout";
import { registerProgressBar } from "./hooks/progressBar";
import { registerScrollTopReplace } from "./hooks/scrollTopReplace";
import { registerSidebarVisibility } from "./hooks/sidebarVisibility";
import { registerThemeSync } from "./hooks/themeSync";
import { registerTocReinit } from "./hooks/tocReinit";

export function setupSwup() {
	// scroll:top 替换（必须在其他 hooks 之前，因为是 replace 不是 on）
	registerScrollTopReplace();

	// link:click
	registerLinkClickGuard();

	// visit:start — 进度条启动
	// registerProgressBar 在 visit:start 中启动进度条

	// visit:start — banner/壁纸 同步（body 类、导航栏、移动端可见性、回顶等）
	registerBannerSync();

	// content:replace — 额外处理
	window.swup.hooks.on("content:replace", () => {
		// icon-loader 重新初始化
		import("@/utils/icon-loader").then(({ initIconLoader }) => {
			initIconLoader();
		});
	});

	// 进度条完成 + visit:end 清理
	registerProgressBar();

	// page:view — 网格布局
	registerMainGridLayout();

	// 侧边栏可见性（content:replace + page:view）
	registerSidebarVisibility();

	// page:view — 主题同步
	registerThemeSync();

	// content:replace — TOC 重新初始化
	registerTocReinit();

	// page:view — 评论触发
	registerCommentTrigger();

	// content:replace — 内容溢出处理
	registerContentOverflow();
}
