import { updateSidebarStickySpacing } from "@/scripts/scroll";

/**
 * 更新侧边栏组件的可见性（根据页面类型显示/隐藏组件）
 */
function isCurrentPagePost(): boolean {
	return (
		window.location.pathname.includes("/posts/") ||
		window.location.pathname.includes("/post/")
	);
}

export function updateSidebarComponentsVisibility() {
	const isPostPage = isCurrentPagePost();

	// 处理 showOnPostPage === false 的组件
	document.querySelectorAll(".widget-hide-on-post").forEach((widget) => {
		isPostPage
			? widget.classList.add("hidden")
			: widget.classList.remove("hidden");
	});

	// 处理 showOnNonPostPage === false 的组件
	document.querySelectorAll(".widget-hide-on-non-post").forEach((widget) => {
		!isPostPage
			? widget.classList.add("hidden")
			: widget.classList.remove("hidden");
	});

	// 组件可见性变化后，立即重算 sticky 间距，避免 swup 切页后残留旧间距
	updateSidebarStickySpacing();
}

export function registerSidebarVisibility() {
	window.swup.hooks.on("content:replace", () => {
		updateSidebarComponentsVisibility();
	});

	window.swup.hooks.on("page:view", () => {
		updateSidebarComponentsVisibility();
	});
}
